import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { envVars } from "../config/env";
import { Role, UserStatus } from "../../generated/prisma/enums";
// import nodemailer from "nodemailer";

// const transporter = nodemailer.createTransport({
//   host: "smtp.gmail.com",
//   port: 587,
//   secure: false, // Use true for port 465, false for port 587
//   auth: {
//     user: envVars.APP_USER,
//     pass: envVars.APP_PASS,
//   },
// });

export const auth = betterAuth({
  baseURL: envVars.BETTER_AUTH_URL!,
  secret: envVars.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  // trustedOrigins: [envVars.FRONTEND_URL!],

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
        defaultValue: Role.CUSTOMER
      },
      status: {
        type: "string",
        defaultValue: UserStatus.ACTIVE
      },

      phone: {
        type: "string",
        required: false,
      }
    }
  },

  trustedOrigins: [envVars.BETTER_AUTH_URL || "http://localhost:5000", envVars.FRONTEND_URL],

  advanced: {
    // disableCSRFCheck: true,
    useSecureCookies: false,
    cookies: {
      state: {
        attributes: {
          sameSite: "none",
          secure: true,
          httpOnly: true,
          path: "/",
        }
      },
      sessionToken: {
        attributes: {
          sameSite: "none",
          secure: true,
          httpOnly: true,
          path: "/",
        }
      }
    }
  },

  session: {
    expiresIn: 60 * 60 * 60 * 24, // 1 day in seconds
    updateAge: 60 * 60 * 60 * 24, // 1 day in seconds
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 60 * 24, // 1 day in seconds
    }
  },


  //   emailVerification: {
  //     sendOnSignUp: true,
  //     autoSignInAfterVerification: false,

  // //     sendVerificationEmail: async ({ user, url, token }) => {
  // //       try {
  // //         const verificationURL = `${envVars.FRONTEND_URL}/verify-email?token=${token}`;
  // //         const info = await transporter.sendMail({
  // //           from: "MealMate",
  // //           to: user.email,
  // //           subject: "Welcome to the table! Verify your email",
  // //           html: `<!DOCTYPE html>
  // // <html lang="en">
  // // <head>
  // //   <meta charset="UTF-8" />
  // //   <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  // //   <title>Verify Your Email - MealMate</title>
  // //   <style>
  // //     body { margin: 0; padding: 0; background-color: #FAF9F7; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; }
  // //     .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 32px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.03); border: 1px solid #F3F4F6; }
  // //     .header { background-color: #ffffff; padding: 40px 20px; text-align: center; border-bottom: 1px solid #FAF9F7; }
  // //     .logo-text { margin: 0; font-size: 32px; font-weight: bold; color: #1F2933; letter-spacing: -1px; text-transform: uppercase; }
  // //     .logo-accent { color: #D97757; }
  // //     .content { padding: 40px; color: #1F2933; line-height: 1.7; text-align: center; }
  // //     .content h2 { margin-top: 0; font-size: 28px; color: #1F2933; font-weight: 700; }
  // //     .content p { font-size: 16px; color: #4B5563; margin-bottom: 24px; }
  // //     .button-wrapper { text-align: center; margin: 35px 0; }
  // //     .verify-button { background-color: #D97757; color: #ffffff !important; padding: 18px 36px; text-decoration: none; font-weight: bold; border-radius: 16px; display: inline-block; box-shadow: 0 10px 20px rgba(217, 119, 87, 0.2); font-size: 16px; }
  // //     .footer { background-color: #FAF9F7; padding: 30px; text-align: center; font-size: 13px; color: #9CA3AF; }
  // //     .link-text { word-break: break-all; font-size: 12px; color: #D97757; background: #FAF9F7; padding: 15px; border-radius: 12px; margin-top: 25px; border: 1px dashed #D97757/20; }
  // //     .signature { margin-top: 40px; font-size: 14px; color: #1F2933; }
  // //   </style>
  // // </head>
  // // <body>
  // //   <div class="container">
  // //     <div class="header">
  // //       <h1 class="logo-text">Meal<span class="logo-accent">Mate</span></h1>
  // //     </div>

  // //     <div class="content">
  // //       <h2>Welcome to the table, ${user.name || 'Gourmet'}!</h2>
  // //       <p>
  // //         We're thrilled to have you join our community. Your journey toward chef-crafted, premium meals starts here. To get access to your personalized kitchen, please verify your email address below.
  // //       </p>

  // //       <div class="button-wrapper">
  // //         <a href="${verificationURL}" class="verify-button">
  // //           Verify My Account
  // //         </a>
  // //       </div>

  // //       <p style="font-size: 14px; color: #9CA3AF; margin-top: 40px;">
  // //         If the button doesn't work, copy and paste this link:
  // //       </p>

  // //       <div class="link-text">
  // //         ${verificationURL}
  // //       </div>

  // //       <p class="signature">
  // //         Stay hungry,<br />
  // //         <strong>The MealMate Team</strong>
  // //       </p>
  // //     </div>

  // //     <div class="footer">
  // //       © ${new Date().getFullYear()} MealMate. Crafted for gourmet lovers.<br/>
  // //       Dhaka, Bangladesh
  // //     </div>
  // //   </div>
  // // </body>
  // // </html>
  // // `
  // //         });
  // //       } catch (error) {
  // //         console.error("Email verification error:", error);
  // //       }
  // //     },
  //   },

});
