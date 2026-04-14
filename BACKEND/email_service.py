import aiosmtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from config import settings
from logger import get_logger

logger = get_logger("email")


async def send_block_alert(to_email: str, username: str, problem: str, risk_score: float):
    if not settings.email_enabled:
        logger.info("Email notifications disabled - skipping BLOCK alert")
        return

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = "BLOCK Decision Alert - AI Governance System"
        msg["From"]    = settings.email_from
        msg["To"]      = to_email

        html = f"""
        <html><body style="font-family:Arial,sans-serif;background:#f3f4f6;padding:20px;">
          <div style="max-width:600px;margin:0 auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.1);">
            <div style="background:linear-gradient(135deg,#dc2626,#b91c1c);padding:24px;text-align:center;">
              <h1 style="color:white;margin:0;font-size:24px;">BLOCK Decision Alert</h1>
            </div>
            <div style="padding:24px;">
              <p style="color:#374151;">Hello <strong>{username}</strong>,</p>
              <p style="color:#374151;">The AI Governance System has issued a <strong style="color:#dc2626;">BLOCK</strong> decision for your recent analysis.</p>
              <div style="background:#fee2e2;border:1px solid #fca5a5;border-radius:8px;padding:16px;margin:16px 0;">
                <p style="margin:0;color:#991b1b;font-weight:600;">Problem Submitted:</p>
                <p style="margin:8px 0 0;color:#7f1d1d;">{problem[:200]}{"..." if len(problem) > 200 else ""}</p>
              </div>
              <div style="background:#f9fafb;border-radius:8px;padding:16px;margin:16px 0;">
                <p style="margin:0;color:#374151;"><strong>Risk Score:</strong> {risk_score}</p>
                <p style="margin:8px 0 0;color:#374151;"><strong>Decision:</strong> <span style="color:#dc2626;font-weight:700;">BLOCK</span></p>
              </div>
              <p style="color:#6b7280;font-size:14px;">Immediate action is required. Please review and address this issue.</p>
            </div>
            <div style="background:#f9fafb;padding:16px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="color:#9ca3af;font-size:12px;margin:0;">AI Governance System - Automated Alert</p>
            </div>
          </div>
        </body></html>
        """

        msg.attach(MIMEText(html, "html"))

        await aiosmtplib.send(
            msg,
            hostname=settings.smtp_host,
            port=settings.smtp_port,
            username=settings.smtp_user,
            password=settings.smtp_password,
            start_tls=True
        )
        logger.info(f"BLOCK alert email sent to {to_email}")

    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {str(e)}")

async def send_password_reset_email(to_email: str, username: str, reset_link: str):
    if not settings.email_enabled:
        logger.info(f"Email notifications disabled - simulating email to {to_email} with link: {reset_link}")
        return

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = "Password Reset Request - AI Governance System"
        msg["From"]    = settings.email_from
        msg["To"]      = to_email

        html = f"""
        <html><body style="font-family:Arial,sans-serif;background:#f3f4f6;padding:20px;">
          <div style="max-width:600px;margin:0 auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.1);">
            <div style="background:linear-gradient(135deg,#3b82f6,#1d4ed8);padding:24px;text-align:center;">
              <h1 style="color:white;margin:0;font-size:24px;">Reset Your Password</h1>
            </div>
            <div style="padding:24px;">
              <p style="color:#374151;">Hello <strong>{username}</strong>,</p>
              <p style="color:#374151;">We received a request to reset your password for the AI Governance System.</p>
              <div style="background:#f9fafb;border-radius:8px;padding:24px;margin:24px 0;text-align:center;">
                <a href="{reset_link}" style="display:inline-block;background:#3b82f6;color:white;text-decoration:none;font-weight:bold;padding:12px 24px;border-radius:6px;">Reset Password</a>
                <p style="margin-top:16px;color:#6b7280;font-size:12px;">This link will expire in 15 minutes.</p>
              </div>
              <p style="color:#6b7280;font-size:14px;">If you didn't request a password reset, you can safely ignore this email.</p>
            </div>
            <div style="background:#f9fafb;padding:16px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="color:#9ca3af;font-size:12px;margin:0;">AI Governance System - Security</p>
            </div>
          </div>
        </body></html>
        """

        msg.attach(MIMEText(html, "html"))

        await aiosmtplib.send(
            msg,
            hostname=settings.smtp_host,
            port=settings.smtp_port,
            username=settings.smtp_user,
            password=settings.smtp_password,
            start_tls=True
        )
        logger.info(f"Password reset email sent to {to_email}")

    except Exception as e:
        logger.error(f"Failed to send password reset email to {to_email}: {str(e)}")
