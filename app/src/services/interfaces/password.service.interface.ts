/**
 * Result generated during the password protection process.
 *
 * `hash` contains the result of applying bcrypt to the password and
 * `salt` contains the salt used during generation.
 *
 * The original password is never part of the result and must not
 * be stored in any form in the database.
 */
export interface PasswordHashResult {
  hash: string;
  salt: string;
}

export interface IPasswordService {
  hash(password: string): Promise<PasswordHashResult>;
  verify(password: string, hash: string): Promise<boolean>;
}
