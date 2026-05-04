import smtplib
from email.mime.text import MIMEText

# REPLACE THESE WITH YOUR ACTUAL VALUES
SMTP_HOST = "smtp.gmail.com"
SMTP_PORT = 465
SMTP_USER = "nandhanarajan03@gmail.com"
SMTP_PASSWORD = "hjaiphztihwrgszx"  # Your App Password

try:
    print("Connecting to SMTP server...")
    server = smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT)
    print("Logging in...")
    server.login(SMTP_USER, SMTP_PASSWORD)
    
    msg = MIMEText("This is a test email to verify credentials.")
    msg['Subject'] = 'Test Email'
    msg['From'] = SMTP_USER
    msg['To'] = SMTP_USER
    
    print("Sending email...")
    server.send_message(msg)
    server.quit()
    print("Email sent successfully!")
except Exception as e:
    print(f"Error: {e}")
