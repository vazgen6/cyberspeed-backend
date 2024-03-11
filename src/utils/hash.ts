import { compare, hash } from 'bcrypt';

export function hashIt(str: string) {
  return hash(str, +process.env.SALT_ROUNDS);
}

export function compareHash(str1: string, str2: string) {
  return compare(str1, str2);
}
