from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from app.mail_config import conf

async def send_verification_email(email: str, code: str):
    message = MessageSchema(
        subject="Your Login Verification Code",
        recipients=[email],
        body=f"""
        <html>
            <body>
                <h2>Time Tracker Login Verification</h2>
                <p>Your verification code is: <strong>{code}</strong></p>
                <p>This code will expire in 5 minutes.</p>
                <p>If you didn't request this code, please ignore this email.</p>
            </body>
        </html>
        """,
        subtype="html"
    )
    
    fm = FastMail(conf)
    await fm.send_message(message)

async def send_invitation_email(email: str, name: str, activation_link: str):
    message = MessageSchema(
        subject="Welcome to Time Tracker",
        recipients=[email],
        body=f"""
        <html>
            <body>
                <h2>Welcome to Time Tracker, {name}!</h2>
                <p>You've been invited to join Time Tracker. To get started, please activate your account by clicking the link below:</p>
                <p><a href="{activation_link}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Activate Account</a></p>
                <p>Or copy and paste this link in your browser:</p>
                <p>{activation_link}</p>
                <p>This link will expire in 24 hours.</p>
                <p>If you didn't request this invitation, please ignore this email.</p>
            </body>
        </html>
        """,
        subtype="html"
    )
    
    fm = FastMail(conf)
    await fm.send_message(message) 