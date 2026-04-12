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

const sendConfirmationEmail = async (email, confirmToken, unsubscribeToken) => {
  const confirmLink = `${process.env.BASE_URL}/api/confirm/${confirmToken}`;
  const unsubscribeLink = `${process.env.BASE_URL}/api/unsubscribe/${unsubscribeToken}`;

  return transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Confirm your subscription",
    html: `
      <h2>Confirm subscription</h2>
      <p>Click the link below to confirm your subscription:</p>
      <a href="${confirmLink}">${confirmLink}</a>

      <p style="margin-top: 24px;">If you want to unsubscribe:</p>
      <a href="${unsubscribeLink}">${unsubscribeLink}</a>
    `,
  });
};

const sendReleaseNotificationEmail = async (
  email,
  unsubscribeToken,
  repositoryFullName,
  release
) => {
  const unsubscribeLink = `${process.env.BASE_URL}/api/unsubscribe/${unsubscribeToken}`;

  return transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: `New release in ${repositoryFullName}: ${release.tagName}`,
    html: `
      <h2>New release detected</h2>
      <p>Repository: <strong>${repositoryFullName}</strong></p>
      <p>Release tag: <strong>${release.tagName}</strong></p>
      <p>Release name: <strong>${release.name || release.tagName}</strong></p>
      <p>Published at: <strong>${release.publishedAt || "Unknown"}</strong></p>

      <p>
        View release:
        <a href="${release.htmlUrl}">${release.htmlUrl}</a>
      </p>

      <p style="margin-top: 24px;">Unsubscribe:</p>
      <a href="${unsubscribeLink}">${unsubscribeLink}</a>
    `,
  });
};

module.exports = {
  sendConfirmationEmail,
  sendReleaseNotificationEmail,
};