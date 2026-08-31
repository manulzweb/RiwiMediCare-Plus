// app/src/utils/auth.utils.ts

import { AUTH_LIMITS } from '../constants/auth.constant.js';
/**
 * Validates credentials received in an authentication request
 * without exposing or logging sensitive information related to the password.
 *
 * Performs basic structure and length validations before forwarding
 * credentials to the authentication service.
 *
 * @param {string} email Value received as email.
 * @param {string} password Value received as password.
 *
 * @returns {string | null}
 * Descriptive message when validation fails or `null` when
 * credentials pass basic validations.
 *
 * @security
 * The password is never included in the error message nor logged.
 * `string` is used to explicitly validate the type of values
 * received from an HTTP request.
 */

export const validateCredentials = (email: string, password: string): string | null => {
  if (typeof email !== 'string' || !email.trim()) {
    return 'email is required';
  }

  if (typeof password !== 'string' || !password) {
    return 'password is required';
  }

  if (email.length > AUTH_LIMITS.MAX_EMAIL_LENGTH) {
    return 'email is too long';
  }

  if (password.length < AUTH_LIMITS.MIN_PASSWORD_LENGTH) {
    return `password must contain at least ${AUTH_LIMITS.MIN_PASSWORD_LENGTH} characters`;
  }

  if (password.length > AUTH_LIMITS.MAX_PASSWORD_LENGTH) {
    return 'password is too long';
  }

  return null;
};
