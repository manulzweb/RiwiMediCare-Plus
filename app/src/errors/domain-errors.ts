/**
 * Base class for all domain errors.
 * Ensures that the error handler can safely check `error instanceof DomainError`
 * and reliably extract the appropriate HTTP status code.
 */
export abstract class DomainError extends Error {
  public abstract readonly statusCode: number;

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Thrown when the email provided during registration
 * is already associated with an existing account.
 */
export class EmailAlreadyExistsError extends DomainError {
  public readonly statusCode = 409;
  constructor(message = 'Email is already registered') {
    super(message);
    this.name = 'EmailAlreadyExistsError';
  }
}

/**
 * Thrown when the credentials provided during login
 * are not valid.
 */
export class InvalidCredentialsError extends DomainError {
  public readonly statusCode = 401;
  constructor(message = 'Invalid credentials') {
    super(message);
    this.name = 'InvalidCredentialsError';
  }
}

/**
 * Thrown when the account has not yet been activated via
 * email verification.
 */
export class AccountNotActivatedError extends DomainError {
  public readonly statusCode = 403;
  constructor(message = 'Account is not activated') {
    super(message);
    this.name = 'AccountNotActivatedError';
  }
}

/**
 * Generic validation errors (e.g. business logic constraints).
 */
export class ValidationError extends DomainError {
  public readonly statusCode = 400;
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Generic not found errors for resources (Clinics, Medicines, etc.).
 */
export class NotFoundError extends DomainError {
  public readonly statusCode = 404;
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

/**
 * Generic conflict errors (e.g. duplicated NITs, insufficient inventory).
 */
export class ConflictError extends DomainError {
  public readonly statusCode = 409;
  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
  }
}
