const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: Number(process.env.EMAIL_PORT) === 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendConfirmationEmail = async (email, token) => {
  const confirmLink = `${process.env.BASE_URL}/api/confirm/${token}`;

  const result = await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Confirm your subscription",
    html: `
      <h2>Confirm subscription</h2>
      <p>Click the link below to confirm your subscription:</p>
      <a href="${confirmLink}">${confirmLink}</a>
    `,
  });

  return result;
};

module.exports = {
  sendConfirmationEmail,
};