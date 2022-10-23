import jwt, { SignOptions } from "jsonwebtoken";
require("dotenv").config();

export const signJwt = (
  payload: Object,
  keyName: "accessTokenPrivateKey" | "refreshTokenPrivateKey",
  options?: SignOptions
) => {
  const value =
    keyName === "accessTokenPrivateKey"
      ? process.env.JWT_ACCESS_TOKEN_PRIVATE_KEY
      : process.env.JWT_REFRESH_TOKEN_PRIVATE_KEY;
  const privateKey = Buffer.from(value, "base64").toString("ascii");
  return jwt.sign(payload, privateKey, {
    ...(options && options),
    algorithm: "RS256",
  });
};

export const verifyJwt = <T>(
  token: string,
  keyName: "accessTokenPublicKey" | "refreshTokenPublicKey"
): T | null => {
  const value =
    keyName === "accessTokenPublicKey"
      ? process.env.JWT_ACCESS_TOKEN_PUBLIC_KEY
      : process.env.JWT_REFRESH_TOKEN_PUBLIC_KEY;
  try {
    const publicKey = Buffer.from(value, "base64").toString("ascii");
    const decoded = jwt.verify(token, publicKey) as T;

    return decoded;
  } catch (error) {
    return null;
  }
};
