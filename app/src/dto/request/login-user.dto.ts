// app/src/dto/request/login-user.dto.ts

/**
 * Input DTO for user login.
 *
 * Defines the minimum fields the client must send to authenticate with the
 * API. This type represents the input for the user session endpoint.
 *
 * @property {string} email - User email address.
 * @property {string} password - User password.
 *
 * @example
 * const dto: LoginUserRequestDto = {
 *   email: "david@example.com",
 *   password: "Password123!"
 * };
 */
export interface LoginUserRequestDto {
  /** User email address. */
  email: string;

  /** User password. */
  password: string;
}
