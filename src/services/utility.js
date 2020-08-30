const sgMail = require('@sendgrid/mail');
sgMail.setApiKey('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');

module.exports =  verificationTokenEmail = (email, resetPasswordToken) => {
  let link = `${process.env.WEBSITEURL}verification/?useremail=${email}&token=${resetPasswordToken}`;
  const msg = {
    to: `${email}`,
    from: process.env.FROM_EMAIL,
    subject: 'Password change request',
    html: `Hi ${email} \n 
                  <br/>Please click on the following link ${link} to reset your password. \n\n 
                  <br/>If you did not request this, please ignore this email and your password will remain unchanged.\n`,
  };
  sgMail.send(msg).
  then((response) => {
    console.log(response)
  }).catch(console.error)
  
}