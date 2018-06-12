var nodemailer = require('nodemailer');

function sendEmail(toEmail, messageSubject, messageHtml) {
    var transporter = nodemailer.createTransport({
        service: 'Yandex',
        auth: {
            user: 'grants-agregator@yandex.ru',
            pass: 'TaiHygchongIvi7'
        }
    });
    
    var mailOptions = {
        from: 'grants-agregator@yandex.ru',
        to: toEmail,
        subject: messageSubject,
        html: messageHtml
    };
    
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
          return error;
        } else {
          console.log('Email sent: ' + info.response);
          return info.response;
        }
      });
}

module.exports = sendEmail;