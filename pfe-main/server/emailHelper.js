import nodemailer from "nodemailer";

export const sendResetPasswordEmail = async ({ to, resetToken }) => {
  const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "dabcf73ff5e793",
      pass: "16395d28932cef",
    },
  });

  const resetLink = `http://localhost:5173/reset-password?token=${resetToken}`;

  await transporter.sendMail({
    from: '"Your App" <no-reply@test.com>',
    to,
    subject: "Reset your password",
    html: `
      <h3>Reset Password</h3>
      <a href="${resetLink}">${resetLink}</a>
    `,
  });

  console.log("Email sent");
};