import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { envVars } from "../config/env";
import { Role, UserStatus } from "../../generated/prisma/enums";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Use true for port 465, false for port 587
  auth: {
    user: envVars.APP_USER,
    pass: envVars.APP_PASS,
  },
});

export const auth = betterAuth({
  baseURL: envVars.BETTER_AUTH_URL!,
  secret: envVars.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  trustedOrigins: [envVars.FRONTEND_URL!],

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
    autoSignIn: false,
    requireEmailVerification: true,
  },

  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: Role.CUSTOMER
      },

      status: {
        type: "string",
        required: true,
        defaultValue: UserStatus.ACTIVE
      },

      phone: {
        type: "string",
        required: false,
      }
    }
  },

  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: false,

    sendVerificationEmail: async ({ user, url, token }) => {
      try {
        const verificationURL = `${envVars.FRONTEND_URL}/verify-email?token=${token}`
        const info = await transporter.sendMail({
          from: "FOODIE",
          to: user.email,
          subject: "Verify your email",
          html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Email Verification</title>
  <style>
    body { margin: 0; padding: 0; background-color: #F8FAF3; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; }
    .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(6, 78, 59, 0.05); border: 1px solid #E2E8F0; }
    .header { background-color: #064E3B; padding: 40px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; color: #ffffff; letter-spacing: -1px; }
    .header span { color: #10B981; font-style: italic; }
    .content { padding: 40px; color: #064E3B; line-height: 1.6; }
    .content h2 { margin-top: 0; font-size: 24px; color: #064E3B; }
    .button-wrapper { text-align: center; margin: 35px 0; }
    .verify-button { background-color: #059669; color: #ffffff !important; padding: 16px 32px; text-decoration: none; font-weight: bold; border-radius: 12px; display: inline-block; box-shadow: 0 4px 14px rgba(5, 150, 105, 0.3); }
    .footer { background-color: #F1F5F9; padding: 25px; text-align: center; font-size: 12px; color: #64748B; }
    .link-text { word-break: break-all; font-size: 12px; color: #059669; background: #F0FDF4; padding: 10px; border-radius: 8px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>FOODIE</h1>
    </div>

    <div class="content">
      <h2>Welcome to the table, ${user.name || 'Foodie'}!</h2>
      <p>
        We're thrilled to have you join our community of premium culinary enthusiasts. 
        To start exploring our organic meals and artisan chefs, please verify your email address.
      </p>

      <div class="button-wrapper">
        <a href="${verificationURL}" class="verify-button">
          Verify My Account
        </a>
      </div>

      <p style="font-size: 14px; color: #475569;">
        If the button above doesn't work, copy and paste this link into your browser:
      </p>

      <div class="link-text">
        ${verificationURL}
      </div>

      <p style="margin-top: 30px; font-size: 14px;">
        Stay fresh,<br />
        <strong>The FOODIE Team</strong>
      </p>
    </div>

    <div class="footer">
      © ${new Date().getFullYear()} FOODIE Crafted for gourmet lovers.<br/>
      123 Gourmet Ave, Culinary District, NY
    </div>
  </div>
</body>
</html>
`
        });
      } catch (error) {

      }
    },
  },

});
