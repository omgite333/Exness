import { Resend } from "resend";
import "dotenv/config";

export const sendEmail = async (email: string, jwtToken: string) => {
  const resend = new Resend(process.env.RESEND_API!);
  const signInUrl = `${process.env.API_BASE_URL}/auth/signin/post?token=${jwtToken}`;

  return await resend.emails.send({
    from: "Exness <onboarding@resend.dev>",
    to: [`${email}`],
    subject: "Your sign-in link for Exness",
    html: `
      <!DOCTYPE html>
      <html>
        <body style="margin:0; padding:0; background-color:#0b0b0d; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0b0b0d; padding:40px 0;">
            <tr>
              <td align="center">
                <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color:#151517; border-radius:12px; overflow:hidden;">
                  <tr>
                    <td style="padding:32px 32px 0 32px;">
                      <span style="color:#f5c518; font-size:20px; font-weight:700;">ex Exness</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:24px 32px 0 32px;">
                      <h1 style="margin:0; color:#ffffff; font-size:22px; font-weight:600;">Sign in to your account</h1>
                      <p style="margin:12px 0 0 0; color:#a1a1aa; font-size:14px; line-height:1.5;">
                        Click the button below to securely sign in. This link expires shortly and can only be used once.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:28px 32px 0 32px;">
                      <a href="${signInUrl}"
                         style="display:inline-block; background-color:#f5c518; color:#0b0b0d; text-decoration:none; font-weight:600; font-size:15px; padding:12px 28px; border-radius:8px;">
                        Sign In to Exness
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:24px 32px 0 32px;">
                      <p style="margin:0; color:#71717a; font-size:12px; line-height:1.5; word-break:break-all;">
                        Or copy and paste this link into your browser:<br />
                        <a href="${signInUrl}" style="color:#71717a;">${signInUrl}</a>
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:28px 32px 32px 32px;">
                      <hr style="border:none; border-top:1px solid #27272a; margin:0 0 20px 0;" />
                      <p style="margin:0; color:#71717a; font-size:12px; line-height:1.5;">
                        If you didn't request this email, you can safely ignore it — no account changes were made.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  });
};