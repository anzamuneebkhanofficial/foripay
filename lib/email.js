import nodemailer from "nodemailer";

/**
 * Nodemailer Transporter Configuration for LedgerPulse
 */
function getTransporter() {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.SMTP_PORT || "465", 10);
  const user = process.env.SMTP_USER || "anzamuneebkhan13@gmail.com";
  const pass = process.env.SMTP_PASS || "zgde nxod cpbq rnwy";

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for 587
    auth: {
      user,
      pass,
    },
    // Prevent hang on slow connections
    connectionTimeout: 10000,
    greetingTimeout: 10000,
  });
}

/**
 * Send Payment Created Email Notification
 */
export async function sendPaymentCreatedEmail({ to, order }) {
  const recipient = to || process.env.SMTP_USER || "anzamuneebkhan13@gmail.com";
  const from = process.env.SMTP_FROM || `"LedgerPulse Settlement" <${process.env.SMTP_USER || "anzamuneebkhan13@gmail.com"}>`;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; background-color: #0A0A0F; color: #F8FAFC; padding: 32px; border-radius: 8px;">
      <div style="border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding-bottom: 16px; margin-bottom: 24px;">
        <h2 style="color: #22D3EE; margin: 0;">⚡ LedgerPulse — Payment Session Created</h2>
        <p style="color: #94A3B8; font-size: 13px; margin: 4px 0 0;">Asynchronous Multi-Block Finality Settlement</p>
      </div>

      <div style="background-color: #12121A; border: 1px solid rgba(255, 255, 255, 0.08); padding: 20px; border-radius: 8px; margin-bottom: 24px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="color: #94A3B8; padding: 6px 0;">Order Reference:</td>
            <td style="font-weight: bold; color: #F8FAFC; text-align: right; font-family: monospace;">#${order.id}</td>
          </tr>
          <tr>
            <td style="color: #94A3B8; padding: 6px 0;">Crypto Amount:</td>
            <td style="font-weight: bold; color: #22D3EE; text-align: right; font-family: monospace;">${order.amountCrypto}</td>
          </tr>
          <tr>
            <td style="color: #94A3B8; padding: 6px 0;">Fiat Valuation:</td>
            <td style="color: #F8FAFC; text-align: right;">${order.amountFiat} USD</td>
          </tr>
          <tr>
            <td style="color: #94A3B8; padding: 6px 0;">Target Protocol:</td>
            <td style="color: #F8FAFC; text-align: right;">${order.network || order.asset}</td>
          </tr>
          <tr>
            <td style="color: #94A3B8; padding: 6px 0;">Deposit Address:</td>
            <td style="font-family: monospace; color: #38BDF8; font-size: 12px; text-align: right; word-break: break-all;">
              ${order.depositAddress}
            </td>
          </tr>
        </table>
      </div>

      <div style="text-align: center; margin-bottom: 24px;">
        <a href="${appUrl}/tracker/${order.id}" style="background-color: #6366F1; color: #FFFFFF; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
          Launch Live Payment Tracker →
        </a>
      </div>

      <p style="font-size: 11px; color: #64748B; text-align: center; margin: 0;">
        © 2026 LedgerPulse Cryptographic Settlement Infrastructure. All ledger states verifiable on-chain.
      </p>
    </div>
  `;

  try {
    const transporter = getTransporter();
    const info = await transporter.sendMail({
      from,
      to: recipient,
      subject: `[LedgerPulse] Invoice #${order.id} Generated (${order.amountCrypto})`,
      html: htmlContent,
    });
    console.log("Email sent successfully: ", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Nodemailer send error:", error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Send Payment Finalized / Settled Email Notification
 */
export async function sendPaymentFinalizedEmail({ to, order }) {
  const recipient = to || process.env.SMTP_USER || "anzamuneebkhan13@gmail.com";
  const from = process.env.SMTP_FROM || `"LedgerPulse Settlement" <${process.env.SMTP_USER || "anzamuneebkhan13@gmail.com"}>`;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; background-color: #0A0A0F; color: #F8FAFC; padding: 32px; border-radius: 8px;">
      <div style="border-bottom: 1px solid rgba(16, 185, 129, 0.3); padding-bottom: 16px; margin-bottom: 24px;">
        <h2 style="color: #10B981; margin: 0;">✓ Payment Confirmed & Settled (3/3 Finality)</h2>
        <p style="color: #94A3B8; font-size: 13px; margin: 4px 0 0;">Transaction immutably verified on-chain.</p>
      </div>

      <div style="background-color: #12121A; border: 1px solid rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 8px; margin-bottom: 24px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="color: #94A3B8; padding: 6px 0;">Order Reference:</td>
            <td style="font-weight: bold; color: #F8FAFC; text-align: right; font-family: monospace;">#${order.id}</td>
          </tr>
          <tr>
            <td style="color: #94A3B8; padding: 6px 0;">Amount Settled:</td>
            <td style="font-weight: bold; color: #10B981; text-align: right; font-family: monospace;">${order.amountCrypto} (${order.amountFiat})</td>
          </tr>
          <tr>
            <td style="color: #94A3B8; padding: 6px 0;">Block Height:</td>
            <td style="color: #22D3EE; text-align: right; font-family: monospace;">#${order.finalBlockHeight || order.blockHeight}</td>
          </tr>
          <tr>
            <td style="color: #94A3B8; padding: 6px 0;">Transaction Hash:</td>
            <td style="font-family: monospace; color: #38BDF8; font-size: 11px; text-align: right; word-break: break-all;">
              ${order.txHash}
            </td>
          </tr>
          <tr>
            <td style="color: #94A3B8; padding: 6px 0;">Consensus Status:</td>
            <td style="color: #10B981; font-weight: bold; text-align: right;">3 of 3 Blocks Finalized</td>
          </tr>
        </table>
      </div>

      <div style="text-align: center; margin-bottom: 24px;">
        <a href="${appUrl}/receipt?orderId=${order.id}" style="background-color: #10B981; color: #FFFFFF; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
          View Official Digital Receipt →
        </a>
      </div>

      <p style="font-size: 11px; color: #64748B; text-align: center; margin: 0;">
        Dispatched via Hookdeck / NOWPayments IPN. Cryptographically signed by LedgerPulse Node #04.
      </p>
    </div>
  `;

  try {
    const transporter = getTransporter();
    const info = await transporter.sendMail({
      from,
      to: recipient,
      subject: `[LedgerPulse] ✓ Payment #${order.id} Confirmed & Settled (${order.amountCrypto})`,
      html: htmlContent,
    });
    console.log("Settlement email sent successfully: ", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Nodemailer send error:", error.message);
    return { success: false, error: error.message };
  }
}

// Export alias for consistency with status workflows
export const sendPaymentConfirmedEmail = sendPaymentFinalizedEmail;

/**
 * Send Welcome Email upon Merchant Registration
 */
export async function sendWelcomeEmail({ to, name, businessName, verificationToken }) {
  const recipient = to || process.env.SMTP_USER || "anzamuneebkhan13@gmail.com";
  const from = process.env.SMTP_FROM || `"LedgerPulse Onboarding" <${process.env.SMTP_USER || "anzamuneebkhan13@gmail.com"}>`;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  
  const verificationLink = verificationToken ? `${appUrl}/verify-email?token=${verificationToken}` : `${appUrl}/dashboard`;

  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0A0A0F; color: #F8FAFC; padding: 36px; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.1); max-width: 600px; margin: 0 auto;">
      <div style="border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding-bottom: 20px; margin-bottom: 24px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background-color: #22D3EE; box-shadow: 0 0 10px #22D3EE;"></span>
          <span style="font-size: 20px; font-weight: 700; color: #F8FAFC; letter-spacing: -0.02em;">LedgerPulse</span>
        </div>
        <p style="color: #94A3B8; font-size: 13px; margin: 8px 0 0;">Non-Custodial Real-Time Crypto Payment Infrastructure</p>
      </div>

      <h1 style="color: #FFFFFF; font-size: 24px; font-weight: 700; margin-bottom: 16px;">
        Welcome to LedgerPulse, ${name || "Merchant"}! ⚡
      </h1>

      <p style="color: #CBD5E1; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
        Your merchant workspace for <strong style="color: #22D3EE;">${businessName || "Your Store"}</strong> is almost ready. Before you can log in and accept payments, please verify your email address.
      </p>

      <div style="background-color: #12121A; border: 1px solid rgba(255, 255, 255, 0.08); padding: 20px; border-radius: 8px; margin-bottom: 28px;">
        <h3 style="margin-top: 0; margin-bottom: 12px; font-size: 14px; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.05em;">Your Merchant Defaults</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="color: #94A3B8; padding: 6px 0;">Registered Email:</td>
            <td style="font-weight: 600; color: #F8FAFC; text-align: right;">${recipient}</td>
          </tr>
          <tr>
            <td style="color: #94A3B8; padding: 6px 0;">Account Tier:</td>
            <td style="color: #10B981; font-weight: 600; text-align: right;">Production Merchant (0% Custody)</td>
          </tr>
          <tr>
            <td style="color: #94A3B8; padding: 6px 0;">Fast Mempool Feed:</td>
            <td style="color: #22D3EE; font-weight: 600; text-align: right;">Active (SSE 100ms)</td>
          </tr>
        </table>
      </div>

      <div style="text-align: center; margin-bottom: 32px;">
        <a href="${verificationLink}" style="background-color: #6366F1; color: #FFFFFF; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; display: inline-block;">
          ${verificationToken ? "Verify Email Address →" : "Go to Merchant Dashboard →"}
        </a>
      </div>

      <div style="border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 20px; font-size: 12px; color: #64748B; text-align: center;">
        <p style="margin: 0 0 6px;">Questions? You can reply directly to this email or visit our merchant documentation.</p>
        <p style="margin: 0;">© 2026 LedgerPulse Gateway. High-assurance cryptographic settlement.</p>
      </div>
    </div>
  `;

  try {
    const transporter = getTransporter();
    const info = await transporter.sendMail({
      from,
      to: recipient,
      subject: `Welcome to LedgerPulse — Your Merchant Gateway is Ready ⚡`,
      html: htmlContent,
    });
    console.log("Welcome email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Welcome email error:", error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Send Password Reset Link Email
 */
export async function sendPasswordResetEmail({ to, name, resetToken }) {
  const recipient = to || process.env.SMTP_USER || "anzamuneebkhan13@gmail.com";
  const from = process.env.SMTP_FROM || `"LedgerPulse Security" <${process.env.SMTP_USER || "anzamuneebkhan13@gmail.com"}>`;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const resetLink = `${appUrl}/reset-password?token=${resetToken}`;

  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0A0A0F; color: #F8FAFC; padding: 36px; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.1); max-width: 600px; margin: 0 auto;">
      <div style="border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding-bottom: 20px; margin-bottom: 24px;">
        <h2 style="color: #F59E0B; margin: 0; font-size: 20px;">🔒 LedgerPulse — Password Reset Request</h2>
        <p style="color: #94A3B8; font-size: 13px; margin: 6px 0 0;">Cryptographic Account Recovery</p>
      </div>

      <p style="color: #CBD5E1; font-size: 15px; line-height: 1.6; margin-bottom: 20px;">
        Hello ${name || "Merchant"},
      </p>

      <p style="color: #CBD5E1; font-size: 15px; line-height: 1.6; margin-bottom: 28px;">
        We received a request to reset your password for your LedgerPulse merchant account. Click the button below to set a new password. This recovery link expires in 1 hour.
      </p>

      <div style="text-align: center; margin-bottom: 32px;">
        <a href="${resetLink}" style="background-color: #F59E0B; color: #0A0A0F; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 15px; display: inline-block;">
          Reset My Password →
        </a>
      </div>

      <p style="color: #94A3B8; font-size: 13px; line-height: 1.5; margin-bottom: 24px;">
        If button doesn't work, copy and paste this URL into your browser:<br/>
        <a href="${resetLink}" style="color: #22D3EE; word-break: break-all; font-family: monospace; font-size: 12px;">${resetLink}</a>
      </p>

      <div style="border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 20px; font-size: 12px; color: #64748B; text-align: center;">
        <p style="margin: 0 0 6px;">If you did not request this password reset, you can safely ignore this email.</p>
        <p style="margin: 0;">© 2026 LedgerPulse Gateway.</p>
      </div>
    </div>
  `;

  try {
    const transporter = getTransporter();
    const info = await transporter.sendMail({
      from,
      to: recipient,
      subject: `[LedgerPulse] Password Reset Request`,
      html: htmlContent,
    });
    console.log("Password reset email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Password reset email error:", error.message);
    return { success: false, error: error.message };
  }
}

