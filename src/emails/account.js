const nodemailer = require('nodemailer')
const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
	  user: 'vipulsharma.rm@gmail.com',
	  pass: '*****'  // password is changed
	}
});
  
  
  
  const sendWelcomeEmail = (email, name) => {
	const mailOptions = {
	  from: 'vipulsharma.rm@gmail.com',
	  to: email,
	  subject: `Hello ${name}! Thanks for joining in.`,
	  text: 'Let me know how you get along with the app'
	};
	transporter.sendMail(mailOptions);
  }
  
  const sendLeavingEmail = (email, name) => {
	const mailOptions = {
	  from: 'vipulsharma.rm@gmail.com',
	  to: email,
	  subject: `GoodBye ${name}`,
	  text: 'Can you please tell why you do not want to continue with us.'
	};
	transporter.sendMail(mailOptions);
  }
  module.exports = {
	sendWelcomeEmail, 
	sendLeavingEmail
  }