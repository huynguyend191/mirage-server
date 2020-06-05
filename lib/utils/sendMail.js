const nodemailer = require('nodemailer');
const emailInfo = require('../constants/emailInfo');
const UnverifiedAccount = require('../../models/UnverifiedAccount');
const uuid = require('uuid').v4;

const sendMail = async (reciever, subject, content) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: 587,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    const mail = await transporter.sendMail({
      from: process.env.EMAIL_SENDER,
      to: reciever,
      subject: subject,
      text: content
    });
    let info = await transporter.sendMail(mail);
    console.log(emailInfo.LOG_MAIL_SEND, info);
  } catch (error) {
    console.log(error);
  }
};

exports.verifyMail = async reciever => {
  try {
    let id;
    const existUnverify = await UnverifiedAccount.findOne({
      where: { email: reciever }
    });
    if (existUnverify) {
      id = existUnverify.id;
      await UnverifiedAccount.update(
        {
          createdAt: new Date(Date.now())
        },
        {
          where: { id: id }
        }
      );
    } else {
      id = uuid();
      await UnverifiedAccount.create({
        id: id,
        email: reciever
      });
    }

    const verifyURL = `${process.env.SERVER_URL}/accounts/verify/${id}`;
    const subject = emailInfo.VERIFY_SUBJECT;
    const content = emailInfo.VERIFY_CONTENT + verifyURL;
    await sendMail(reciever, subject, content);
  } catch (error) {
    console.log(error);
  }
};

exports.resetPasswordMail = async (reciever, username, password) => {
  try {
    const subject = emailInfo.RESET_PASS_SUBJECT + username;
    const content = emailInfo.RESET_PASS_CONTENT + password;
    await sendMail(reciever, subject, content);
  } catch (error) {
    console.log(error);
  }
};

exports.banAccountMail = async reciever => {
  try {
    const subject = emailInfo.BAN_ACC_SUBJECT;
    const content = emailInfo.BAN_ACC_CONTENT;
    await sendMail(reciever, subject, content);
  } catch (error) {
    console.log(error);
  }
};

exports.unbanAccountMail = async reciever => {
  try {
    const subject = emailInfo.UNBAN_ACC_SUBJECT;
    const content = emailInfo.UNBAN_ACC_CONTENT;
    await sendMail(reciever, subject, content);
  } catch (error) {
    console.log(error);
  }
};

exports.subscriptionComplete = async reciever => {
  try {
    const subject = emailInfo.SUBSCRITION_SUBJECT;
    const content = emailInfo.SUBSCRITION_CONTENT;
    await sendMail(reciever, subject, content);
  } catch (error) {
    console.log(error);
  }
};

exports.paymentComplete = async reciever => {
  try {
    const subject = emailInfo.PAYMENT_SUBJECT;
    const content = emailInfo.PAYMENT_CONTENT;
    await sendMail(reciever, subject, content);
  } catch (error) {
    console.log(error);
  }
};
