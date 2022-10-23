import express from "express";

import { deserializeUser, requireUser, validate } from "../middleware";
import {
  myProfileHandler,
  loginUserHandler,
  refreshAccessTokenHandler,
  registerUserHandler,
  verifyEmailHandler,
  forgetPasswordHandler,
  resetPasswordHandler,
} from "../controllers";
import {
  registrationRequest,
  loginRequest,
  emailVerificationRequest,
  forgetPasswordRequest,
  resetPasswordRequest,
} from "../validations/rules";

const router = express.Router();

router.post("/register", validate(registrationRequest), registerUserHandler);

router.post("/login", validate(loginRequest), loginUserHandler);

router.get("/refresh", refreshAccessTokenHandler);

router.post("/verifyEmail", validate(emailVerificationRequest), verifyEmailHandler);

router.get("/profile", deserializeUser, requireUser, myProfileHandler);

router.post("/forgot-password", validate(forgetPasswordRequest), forgetPasswordHandler);

router.post("/reset-password", validate(resetPasswordRequest), resetPasswordHandler)
export default router;
