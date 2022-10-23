import { NextFunction, Request, Response } from "express";
import crypto from "crypto";
import { StatusCodes } from "http-status-codes";

import { RegisterParams } from "../services/types";
import {
  createUser,
  findUser,
  findUserByEmail,
  findUserById,
  signTokens,
  updateUser,
} from "../services";

import { User } from "../entities";
import AppError from "../utils/appError";
import { verifyJwt, signJwt, sendEmail, hashedPassword } from "../utils";

require("dotenv").config();

export const registerUserHandler = async (
  req: Request<{}, {}, RegisterParams>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { hashedVerificationCode, verificationCode } =
      await createVerificationCode();

    const user = await createUser({
      ...req.body,
      verificationCode: hashedVerificationCode,
    });

    if (user)
      try {
        await sendEmail({
          email: user.email,
          subject: "Verify Your Email",
          text: `Your verification code is ${verificationCode}`,
        });

        res.status(StatusCodes.CREATED).json({
          status: "success",
          message:
            "An email with a verification code has been sent to your email",
        });
      } catch (error) {
        user.verificationCode = null;
        await updateUser(user);

        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          status: "error",
          message: "There was an error sending email, please try again",
        });
      }
  } catch (err: any) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        status: "fail",
        message: "User with that email or phone number already exist",
      });
    }
    next(err);
  }
};

export const loginUserHandler = async (
  req: Request<{}, {}, { email: string; password: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    const user = await findUserByEmail(email);

    if (!user || !(await User.comparePasswords(password, user.password))) {
      return next(new AppError(400, "Invalid email or password"));
    }

    if (!user.isVerified) {
      return next(new AppError(400, "You are not verified"));
    }
    
    const { access_token, refresh_token } = await signTokens(user);

    res.status(200).json({
      status: "success",
      data: {
        access_token,
        refresh_token,
      },
    });
  } catch (err: any) {
    next(err);
  }
};

export const refreshAccessTokenHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const refresh_token = req.cookies.refresh_token;

    const message = "Could not refresh access token";

    if (!refresh_token) {
      return next(new AppError(403, message));
    }

    // Validate refresh token
    const decoded = verifyJwt<{ sub: any }>(
      refresh_token,
      "refreshTokenPublicKey"
    );

    if (!decoded) {
      return next(new AppError(403, message));
    }

    // Check if user still exist
    const user = await findUserById(JSON.parse(decoded.sub).id);

    if (!user) {
      return next(new AppError(403, message));
    }

    // Sign new access token
    const access_token = signJwt({ sub: user.id }, "accessTokenPrivateKey");

    // 5. Send response
    res.status(200).json({
      status: "success",
      access_token,
    });
  } catch (err: any) {
    next(err);
  }
};

export const myProfileHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = res.locals.user;

    res.status(200).status(200).json({
      status: "success",
      data: user,
    });
  } catch (err: any) {
    next(err);
  }
};

export const createVerificationCode = async () => {
  let verificationCode = Math.floor(1000 + Math.random() * 9000);

  const exists = await findUser({ verificationCode });

  if (exists) {
    verificationCode = Math.floor(1000 + Math.random() * 9000);
  }

  const hashedVerificationCode = crypto
    .createHash("sha256")
    .update(String(verificationCode))
    .digest("hex");

  return { verificationCode, hashedVerificationCode };
};

export const verifyEmailHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const verificationCode = crypto
      .createHash("sha256")
      .update(req.body.verificationCode)
      .digest("hex");

    const user = await findUser({ verificationCode });

    if (!user) {
      return next(new AppError(401, "Could not verify email"));
    }

    user.isVerified = true;
    user.verificationCode = null;
    await updateUser(user);

    res.status(200).json({
      status: "success",
      message: "Email verified successfully",
    });
  } catch (err: any) {
    next(err);
  }
};

export const forgetPasswordHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;
    const { verificationCode, hashedVerificationCode } = await createVerificationCode()
    const user = await findUserByEmail(email);


    if (!user) {
      return next(new AppError(400, "Invalid email"));
    }

    if (user) {
      try {
        user.verificationCode = hashedVerificationCode;
        await updateUser(user);

        await sendEmail({
          email: user.email,
          subject: "Reset your password",
          text: `Your reset password code is ${verificationCode}`
        });

        res.status(StatusCodes.OK).json({
          status: "success",
          message: "A password reset code has been sent to your email"
        });

      } catch (err) {
        user.verificationCode = null;
        await updateUser(user);


        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          status: "error",
          message: "There was an error sending email, please try again"
        });
      }
    }

  } catch (err: any) {
    next(err)

  }

}
