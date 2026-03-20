import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM ?? "Spiritual Connect <no-reply@spiritualconnect.com>";
const APP_URL = (process.env.APP_URL ?? "http://localhost:3000").replace(/\/+$/, "");

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

const requireResend = () => {
  if (!resend) {
    throw new Error("Missing RESEND_API_KEY — email provider is not configured");
  }
  return resend;
};

const formatFrom = () => {
  if (EMAIL_FROM.includes("<") && EMAIL_FROM.includes(">")) {
    return EMAIL_FROM;
  }
  return `Spiritual Connect <${EMAIL_FROM}>`;
};

const buildLink = (path: string) => {
  if (!path.startsWith("/")) {
    path = `/${path}`;
  }
  return `${APP_URL}${path}`;
};

const sendEmail = async (options: { to: string; subject: string; html: string; text: string }) => {
  const client = requireResend();
  await client.emails.send({
    from: formatFrom(),
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
  });
};

const renderBody = (message: string, link: string, cta: string, expiresMinutes: number) => `
  <div style="font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; color: #0f172a;">
    <p style="font-size: 16px; margin-bottom: 16px;">Hi there,</p>
    <p style="font-size: 16px; margin-bottom: 24px;">${message}</p>
    <div style="margin-bottom: 24px;">
      <a
        href="${link}"
        style="display: inline-flex; justify-content: center; align-items: center; padding: 12px 24px; border-radius: 999px; background: #7b3fe4; color: #fff; text-decoration: none; font-weight: 600; font-size: 16px;">
        ${cta}
      </a>
    </div>
    <p style="font-size: 14px; color: #475467; margin-bottom: 4px;">This link expires in ${expiresMinutes} minutes.</p>
    <p style="font-size: 14px; color: #475467;">If you did not request this, no action is needed and you can safely ignore this email.</p>
  </div>
`;

export const sendVerificationEmail = async (email: string, token: string, expiresMinutes: number) => {
  const verificationUrl = buildLink(`/verify-email?token=${encodeURIComponent(token)}`);
  await sendEmail({
    to: email,
    subject: "Verify your SpiritualConnect email",
    html: renderBody(
      "Welcome to Spiritual Connect! Confirm your email address so you can access the community.",
      verificationUrl,
      "Verify Email",
      expiresMinutes
    ),
    text: `Verify your email by visiting ${verificationUrl}. The link expires in ${expiresMinutes} minutes.`,
  });
};

export const sendPasswordResetEmail = async (email: string, token: string, expiresMinutes: number) => {
  const resetUrl = buildLink(`/reset-password?token=${encodeURIComponent(token)}`);
  await sendEmail({
    to: email,
    subject: "Reset your SpiritualConnect password",
    html: renderBody(
      "We heard you requested a password reset. Click below to update your password.",
      resetUrl,
      "Reset Password",
      expiresMinutes
    ),
    text: `Reset your password by visiting ${resetUrl}. The link expires in ${expiresMinutes} minutes.`,
  });
};
