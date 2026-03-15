"""
Transactional email sender using Gmail SMTP.

Usage:
    python send_email.py --to "customer@example.com" --subject "Order Confirmed" --body "Your order #123 has been shipped."

Environment variables required (set in .env file):
    GMAIL_ADDRESS   - Your Gmail/Google Workspace address
    GMAIL_APP_PASSWORD - App Password generated from Google Account settings
"""

import argparse
import os
import smtplib
import sys
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

SMTP_HOST = "smtp.gmail.com"
SMTP_PORT = 587


def load_env():
    """Load variables from .env file if it exists."""
    env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
    if os.path.exists(env_path):
        with open(env_path) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, value = line.split("=", 1)
                    os.environ.setdefault(key.strip(), value.strip())


def send_email(to, subject, body, html=False):
    """Send a transactional email via Gmail SMTP."""
    sender = os.environ.get("GMAIL_ADDRESS")
    password = os.environ.get("GMAIL_APP_PASSWORD")

    if not sender or not password:
        print("Error: GMAIL_ADDRESS and GMAIL_APP_PASSWORD must be set.")
        print("See .env.example for details.")
        sys.exit(1)

    msg = MIMEMultipart("alternative")
    msg["From"] = sender
    msg["To"] = to
    msg["Subject"] = subject

    content_type = "html" if html else "plain"
    msg.attach(MIMEText(body, content_type))

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
        server.starttls()
        server.login(sender, password)
        server.sendmail(sender, to, msg.as_string())

    print(f"Email sent to {to}")


def main():
    parser = argparse.ArgumentParser(description="Send transactional emails via Gmail SMTP")
    parser.add_argument("--to", required=True, help="Recipient email address")
    parser.add_argument("--subject", required=True, help="Email subject")
    parser.add_argument("--body", required=True, help="Email body (text or HTML)")
    parser.add_argument("--html", action="store_true", help="Treat body as HTML")
    args = parser.parse_args()

    load_env()
    send_email(args.to, args.subject, args.body, args.html)


if __name__ == "__main__":
    main()
