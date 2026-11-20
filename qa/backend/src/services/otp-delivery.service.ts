import nodemailer from 'nodemailer'
import { AppError } from '../errors/app-error'

export type OtpDelivery =
  | { channel: 'email' }
  | { channel: 'local'; code: string }

export async function deliverSignupOtp(email: string, code: string, expiresInSeconds: number): Promise<OtpDelivery> {
  const mode = process.env.OTP_DELIVERY ?? 'smtp'
  if (mode === 'local') return { channel: 'local', code }
  if (mode !== 'smtp') {
    throw new AppError(500, 'OTP_DELIVERY_CONFIG', 'OTP_DELIVERY must be either "smtp" or "local".')
  }

  const port = Number(process.env.SMTP_PORT ?? '1025')
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new AppError(500, 'SMTP_CONFIG', 'SMTP_PORT must be an integer between 1 and 65535.')
  }

  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? '127.0.0.1',
    port,
    secure: false,
    connectionTimeout: 3000,
    greetingTimeout: 3000,
    socketTimeout: 5000,
  })

  try {
    await transport.sendMail({
      from: process.env.SMTP_FROM ?? 'Dohoro Task Desk <no-reply@example.test>',
      to: email,
      subject: 'Your Dohoro Task Desk verification code',
      text: `Your one-time verification code is ${code}. It expires in ${Math.ceil(expiresInSeconds / 60)} minutes. If you did not request it, you can ignore this email.`,
      html: `<p>Your one-time verification code is:</p><p style="font-size:24px;font-weight:bold;letter-spacing:0.2em">${code}</p><p>It expires in ${Math.ceil(expiresInSeconds / 60)} minutes. If you did not request it, you can ignore this email.</p>`,
    })
    return { channel: 'email' }
  } catch {
    throw new AppError(503, 'OTP_DELIVERY_FAILED', 'Could not send the verification email. Check the local Mailpit SMTP service and retry.')
  } finally {
    transport.close()
  }
}
