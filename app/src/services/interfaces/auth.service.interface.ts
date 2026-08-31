import { LoginUserRequestDto } from '../../dto/request/login-user.dto.js';
import { RegisterUserRequestDto } from '../../dto/request/register-user.dto.js';

export interface LoginUserResult {
  userId: number;
  accessToken: string;
}

export interface RegisterUserResult {
  userId: number;
  isActive: boolean;
}

export interface IAuthService {
  register(dto: RegisterUserRequestDto): Promise<RegisterUserResult>;
  login(dto: LoginUserRequestDto): Promise<LoginUserResult>;
}
