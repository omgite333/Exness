"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const resend_1 = require("resend");
require("dotenv/config");

const sendEmail = async (email, jwtToken) => {
    const resend = new resend_1.Resend(process.env.RESEND_API);
    return await resend.emails.send({
        from: "Login <onboarding@resend.dev>",
        to: [`${email}`],
        subject: "Here's your login link",
        html: `
      <p>Click the link below to sign in:</p>
      <a href="${process.env.API_BASE_URL}/auth/signin/post?token=${jwtToken}">
        Sign In to Opex
      </a>
      <p>If you did not request this, ignore this email.</p>
    `,
    });
};
exports.sendEmail = sendEmail;
