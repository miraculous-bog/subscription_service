const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendConfirmationEmail = async (email, token) => {
  const confirmLink = `${process.env.BASE_URL}/api/confirm/${token}`;

  await transporter.sendMail({
    from: `"GitHub Releases" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Confirm your subscription",
    html: `
      <h2>Confirm subscription</h2>
      <p>Click the link below:</p>
      <a href="${confirmLink}">${confirmLink}</a>
    `,
  });
};

module.exports = {
  sendConfirmationEmail,
};