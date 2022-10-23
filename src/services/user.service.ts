import { MoreThan, LessThan, LessThanOrEqual, Between } from "typeorm";
import database from "../config/database";
import { User } from "../entities";
import { signJwt } from "../utils";
import { RegisterParams } from "./types";

require("dotenv").config();

const userRepository = database.getRepository(User);

export const createUser = async (input: RegisterParams) => {
  return userRepository.save(userRepository.create(input));
};

export const updateUser = async (body: Partial<RegisterParams>) => {
  return await userRepository.save(body);
};

export const findUserByEmail = async (email: string) => {
  return await userRepository.findOne({
    select: {
      password: true,
      isVerified: true,
      email: true,
      phoneNumber: true,
      id: true,
      fullName: true,
      verificationCode: true,
    },
    where: { email },
  });
};

export const findUserById = async (userId: string) => {
  return await userRepository.findOneBy({ id: userId });
};

export const findUser = async (query: Object) => {
  return await userRepository.findOneBy(query);
};

export const queryUser = async () => {
  return await userRepository.find({
    where: { created_at: MoreThan(new Date()) },
  });
};

export const signTokens = async (user: User) => {
  const access_token = signJwt({ sub: user.id }, "accessTokenPrivateKey");

  const refresh_token = signJwt({ sub: user.id }, "refreshTokenPrivateKey");

  return { access_token, refresh_token };
};
