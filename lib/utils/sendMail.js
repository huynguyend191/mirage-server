const nodemailer = require('nodemailer');
const emailInfo = require('../constants/emailInfo');

module.exports = async (reciever, content, subject) => {
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
  transporter.sendMail(mail, function(error, response){
    if(error){
      console.log(error);
      transporter.close();
      return false;
    }else{
      console.log(emailInfo.LOG_MAIL_SEND, mail);
      transporter.close();
      return true;
    }
  })
}