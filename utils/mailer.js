const nodemailer = require('nodemailer');
const logger = require('./logger');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendMail({ to, subject, text, html }) {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to, subject, text, html
    });
    logger.info('Email sent: ' + info.response);
    return info;
  } catch (err) {
    logger.error('Email error', err);
    throw err;
  }
}

module.exports = { sendMail };
