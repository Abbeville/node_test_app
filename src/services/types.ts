export interface RegisterParams {
  email: string;
  fullName: string;
  city: string;
  phoneNumber: string;
  password: string;
  verificationCode?: string;
  isVerified?: boolean;
}
