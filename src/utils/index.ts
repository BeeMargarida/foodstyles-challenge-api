import { compare, genSaltSync, hash } from "bcrypt";
import * as jwt from "jsonwebtoken";

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || "secret123";

export const hashPassword = (password: string) => {
  const salt = genSaltSync(SALT_ROUNDS);
  return new Promise<string>((resolve) =>
    hash(password, salt, (_err: any, encrypted: string) => resolve(encrypted))
  );
};

export const checkPassword = (password: string, hashedPassword: string) => {
  return new Promise<boolean>((resolve) =>
    compare(password, hashedPassword, (_err: any, same: boolean) =>
      resolve(same)
    )
  );
};

export const generateAccessToken = (data: Record<string, unknown>) => {
  return new Promise<string | undefined>((resolve, reject) =>
    jwt.sign(data, JWT_SECRET, (err, token) => {
      if (err) reject(err);
      resolve(token);
    })
  );
};

export const validateAccessToken = (token: string) => {
  return new Promise((resolve, reject) =>
    jwt.verify(token, JWT_SECRET, {}, (err, decoded) => {
      if (err) reject("Invalid token");
      resolve(decoded);
    })
  );
};
