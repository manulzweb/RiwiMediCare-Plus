// app/src/errors/domain-errors.ts

/**
 * Domain errors of the system.
 *
 * Allow the service layer to communicate business situations
 * without coupling to HTTP codes or literal messages, and let the
 * controller layer translate them into appropriate HTTP responses.
 */

/**
 * Thrown when the email provided during registration
 * is already associated with an existing account.
 *
 * The controller should translate it to HTTP 409 (Conflict).
 */
export class EmailAlreadyExistsError extends Error {
  constructor(message = 'Email is already registered') {
    super(message);
    this.name = 'EmailAlreadyExistsError';
  }
}

/**
 * Thrown when the credentials provided during login
 * are not valid.
 *
 * The controller should translate it to HTTP 401 (Unauthorized).
 */
export class InvalidCredentialsError extends Error {
  constructor(message = 'Invalid credentials') {
    super(message);
    this.name = 'InvalidCredentialsError';
  }
}

/**
 * Thrown when the account is temporarily locked
 * due to repeated failed attempts.
 *
 * The controller should translate it to HTTP 403 (Forbidden).
 */
export class AccountLockedError extends Error {
  constructor(message = 'Account is temporarily locked. Try again later.') {
    super(message);
    this.name = 'AccountLockedError';
  }
}

/**
 * Thrown when the account has not yet been activated via
 * email verification.
 *
 * The controller should translate it to HTTP 403 (Forbidden).
 */
export class AccountNotActivatedError extends Error {
  constructor(message = 'Account is not activated') {
    super(message);
    this.name = 'AccountNotActivatedError';
  }
}

/**
 * Thrown when the account was already activated previously.
 *
 * The controller should translate it to HTTP 409 (Conflict).
 */
export class AccountAlreadyActivatedError extends Error {
  constructor(message = 'Account is already activated') {
    super(message);
    this.name = 'AccountAlreadyActivatedError';
  }
}

/**
 * Base class for invalid or expired token errors
 * (email verification, refresh and password reset).
 *
 * The controller should translate it to HTTP 400/401 depending on the flow.
 */
export class InvalidTokenError extends Error {
  constructor(message = 'Invalid or expired token') {
    super(message);
    this.name = 'InvalidTokenError';
  }
}

/**
 * Thrown when the provided token has already expired.
 *
 * Extends `InvalidTokenError`, so any handling of
 * `InvalidTokenError` also catches it.
 */
export class ExpiredTokenError extends InvalidTokenError {
  constructor(message = 'Token has expired, request a new one') {
    super(message);
    this.name = 'ExpiredTokenError';
  }
}

/**
 * Thrown when the referenced user does not exist.
 *
 * The controller should translate it to HTTP 404 (Not Found) or
 * to a generic response that does not reveal whether the email exists.
 */
export class UserNotFoundError extends Error {
  constructor(message = 'User not found') {
    super(message);
    this.name = 'UserNotFoundError';
  }
}

/**
 * Thrown when the provided passwords do not match.
 *
 * The controller should translate it to HTTP 400 (Bad Request).
 */
export class PasswordMismatchError extends Error {
  constructor(message = 'Passwords do not match or are empty') {
    super(message);
    this.name = 'PasswordMismatchError';
  }
}

/**
 * Thrown when the password does not meet security rules.
 *
 * The controller should translate it to HTTP 400 (Bad Request).
 */
export class WeakPasswordError extends Error {
  constructor(message = 'Password does not meet security requirements') {
    super(message);
    this.name = 'WeakPasswordError';
  }
}

export class ValidationError extends Error {
  public readonly statusCode = 400;
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  public readonly statusCode = 404;
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends Error {
  public readonly statusCode = 409;
  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
  }
}
