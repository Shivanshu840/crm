import nodemailer from "nodemailer"
import SMTPTransport from "nodemailer/lib/smtp-transport"

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.example.com",
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER || "user@example.com",
    pass: process.env.EMAIL_PASSWORD || "password",
  },
} as SMTPTransport.Options)

export const sendEmail = async ({ to, subject, text, html, messageId }:any) => {
  try {

    console.log("this is the receipnt mail: ",to);
    const mailOptions = {
      from: process.env.EMAIL_FROM || "Mini CRM <crm@example.com>",
      to,
      subject,
      text,
      html: html || text,
      headers: {
        "X-Campaign-ID": messageId,
      },
    }

    if (process.env.NODE_ENV === "development" && process.env.EMAIL_SEND !== "true") {
      console.log("Email would be sent:", mailOptions)
      return { success: true, messageId }
    }

    const info = await transporter.sendMail(mailOptions)
    console.log("Email sent:", info.messageId)


    const shouldFail = Math.random() < 0.1
    if (shouldFail) {
      throw new Error("Simulated email delivery failure")
    }

    return { success: true, messageId: info.messageId }
  } catch (error:any) {
    console.error("Error sending email:", error)
    return { success: false, error: error.message }
  }
}

export const verifyEmailConnection = async () => {
  try {
    await transporter.verify()
    console.log("Email server connection verified")
    return true
  } catch (error) {
    console.error("Email server connection failed:", error)
    return false
  }
}
