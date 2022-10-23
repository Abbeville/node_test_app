import { NextFunction, Request, Response } from "express";
import { findUserById } from "../services";

import AppError from "../utils/appError";
import { verifyJwt } from "../utils/jwt";

export const deserializeUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let access_token: string;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      access_token = req.headers.authorization.split(" ")[1];
    }

    if (!access_token) {
      return next(new AppError(401, "You are not logged in"));
    }

    const decoded = verifyJwt<{ sub: string }>(
      access_token,
      "accessTokenPublicKey"
    );

    if (!decoded) {
      return next(new AppError(401, `Invalid token or user doesn't exist`));
    }

    const user = await findUserById(decoded.sub);

    if (!user) {
      return next(new AppError(401, `Invalid token or session has expired`));
    }

    res.locals.user = user;

    next();
  } catch (err: any) {
    next(err);
  }
};
