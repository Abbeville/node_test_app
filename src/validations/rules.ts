
import { object, string, TypeOf, z } from "zod";

export const registrationRequest = object({
  body: object({
    fullName: string({
      required_error: "Fullname is required",
    }),
    phoneNumber: string({
      required_error: "Phone number is required",
    }),
    email: string({
      required_error: "Email address is required",
    }).email("Invalid email address"),
    address: string({
      required_error: "Address field is required",
    }),
    password: string({
      required_error: "Password is required",
    })
      .min(8, "Password must be more than 8 characters")
      .max(32, "Password must be less than 32 characters"),
  }),
});

export const loginRequest = object({
  body: object({
    email: string({
      required_error: "Email address is required",
    }).email("Invalid email address"),
    password: string({
      required_error: "Password is required",
    }).min(8, "Invalid email or password"),
  }),
});

export const emailVerificationRequest = object({
  body: object({
    verificationCode: string(),
  }),
});

export const forgetPasswordRequest = object({
  body: object({
    email: string({
      required_error: "Email address is required"
    })
  }),
});

export type CreateUserInput = Omit<
  TypeOf<typeof registrationRequest>["body"],
  "passwordConfirm"
>;

export type LoginUserInput = TypeOf<typeof loginRequest>["body"];
export type VerifyEmailInput = TypeOf<typeof emailVerificationRequest>["body"];
