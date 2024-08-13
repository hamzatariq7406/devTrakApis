import nodemailer from "nodemailer";
export const sendMail = async (emailTo, subject, body) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SIGNUP_EMAIL,
      pass: process.env.SIGNUP_EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.SIGNUP_EMAIL,
    to: emailTo,
    subject: subject,
    html: `
          <h2>${subject}</h2>
          ${body}
      `,
  };

  return await transporter.sendMail(mailOptions);
};
