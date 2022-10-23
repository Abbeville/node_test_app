const nodemailer = require("nodemailer");

interface MailParams {
  email: string;
  subject: string;
  text: string;
}

export const sendEmail = async ({ email, subject, text }: MailParams) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      service: "smtp",
      port: process.env.EMAIL_PORT,
      secureConnection: false,

      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        ciphers: "SSLv3",
      },
    });

    const response = await transporter.sendMail({
      from: "No reply at jackocoins.test.com",
      to: email,
      subject: subject,
      text: text,
    });
    return response;
  } catch (error) {
    return error;
  }
};
