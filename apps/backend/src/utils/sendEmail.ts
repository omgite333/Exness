import { Resend } from "resend";
import "dotenv/config";

export const sendEmail = async (email: string, jwtToken: string) => {
  const resend = new Resend(process.env.RESEND_API!);
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