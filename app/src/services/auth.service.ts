// app/src/services/auth.service.ts
import sequelize from '../config/database.js';
import { Transaction, UniqueConstraintError } from 'sequelize';

import { RegisterUserRequestDto } from '../dto/request/register-user.dto.js';
import { LoginUserRequestDto } from '../dto/request/login-user.dto.js';
import {
  IAuthService,
  LoginUserResult,
  RegisterUserResult,
} from './interfaces/auth.service.interface.js';

import { isValidPassword } from '../utils/password.util.js';
import { isValidUserRole, ALLOWED_ROLES } from '../types/user.types.js';
import type { UserRole } from '../constants/roles.enum.js';
import { UserRole as RoleEnum } from '../constants/roles.enum.js';

import userRepository from '../repositories/user.repository.js';

import passwordService from './password.service.js';
import tokenService from './auth-token.service.js';

import {
  EmailAlreadyExistsError,
  InvalidCredentialsError,
  AccountNotActivatedError,
} from '../errors/domain-errors.js';

type RegistrationInput = { name: string; email: string; role: UserRole };

const DEFAULT_ROLE: UserRole = RoleEnum.REQUEST_MANAGER;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

class AuthService implements IAuthService {
  constructor(
    private readonly users = userRepository,
    private readonly hasher = passwordService,
    private readonly tokens = tokenService,
  ) {}

  private validateName(raw?: string): string {
    const name = raw ? String(raw).trim() : '';
    if (!name) throw new Error('Name is required');
    if (name.length < 2) throw new Error('Name must be at least 2 characters');
    return name;
  }

  private validateEmail(email: string, confirmEmail?: string): string {
    const formatedEmail = email ? String(email).trim().toLowerCase() : '';

    if (!formatedEmail) throw new Error('Email is required');
    if (!EMAIL_REGEX.test(formatedEmail)) throw new Error('Invalid email format');
    if (formatedEmail.length > 254) throw new Error('Email is too long');

    const confirm = confirmEmail ? String(confirmEmail).trim().toLowerCase() : '';

    if (confirm && formatedEmail !== confirm) throw new Error('Emails do not match');
    return formatedEmail;
  }

  private validatePasswordPair(password: string, confirm?: string): void {
    if (!password) throw new Error('Password is required');
    if (confirm && password !== confirm) throw new Error('Passwords do not match');
    if (!isValidPassword(password)) {
      throw new Error(
        'Password must be at least 10 characters and include uppercase, lowercase, number and special character.',
      );
    }
  }

  private validateRole(raw?: unknown): UserRole {
    if (raw === undefined) return DEFAULT_ROLE;
    if (!isValidUserRole(raw))
      throw new Error(`Invalid role. Allowed: ${ALLOWED_ROLES.join(', ')}`);
    return raw as UserRole;
  }

  private validateRegistrationInput(dto: RegisterUserRequestDto): RegistrationInput {
    const name = this.validateName(dto.name);
    const email = this.validateEmail(dto.email, dto.confirmEmail);
    this.validatePasswordPair(dto.password, dto.confirmPassword);
    const role = this.validateRole(dto.role as unknown);
    return { name, email, role };
  }

  private async ensureEmailNotTaken(email: string): Promise<void> {
    const existing = await this.users.findByEmail(email);
    if (existing) throw new EmailAlreadyExistsError();
  }

  private async createUserInTransaction(params: {
    name: string;
    email: string;
    role: UserRole;
    dto: RegisterUserRequestDto;
    passwordHash: string;
  }): Promise<{ id: number; isActive: boolean }> {
    const { name, email, role, passwordHash } = params;
    const persist = async (tx: Transaction) =>
      this.users.create(
        {
          name,
          email,
          password: passwordHash,
          role,
          isDeleted: false,
        },
        tx,
      );
    try {
      const user = await sequelize.transaction(persist);
      return { id: user.id, isActive: !user.isDeleted };
    } catch (error) {
      if (error instanceof UniqueConstraintError) throw new EmailAlreadyExistsError();
      throw error;
    }
  }

  async register(dto: RegisterUserRequestDto): Promise<RegisterUserResult> {
    const { name, email, role } = this.validateRegistrationInput(dto);
    await this.ensureEmailNotTaken(email);
    const { hash: passwordHash } = await this.hasher.hash(dto.password);
    const result = await this.createUserInTransaction({ name, email, role, dto, passwordHash });
    return { userId: result.id, isActive: result.isActive };
  }

  async login(dto: LoginUserRequestDto): Promise<LoginUserResult> {
    const email = dto.email ? String(dto.email).trim().toLowerCase() : '';
    const user = await this.users.findByEmail(email);
    if (!user) throw new InvalidCredentialsError();
    if (user.isDeleted) throw new AccountNotActivatedError();
    if (user.deletedAt) throw new InvalidCredentialsError();
    const valid = await this.hasher.verify(dto.password, user.password);
    if (!valid) throw new InvalidCredentialsError();
    const accessToken = this.tokens.generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });
    return { userId: user.id, accessToken };
  }
}

export default new AuthService();
