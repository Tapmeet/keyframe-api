/* eslint-disable no-unused-vars */
/* eslint-disable require-jsdoc */
/* eslint-disable valid-jsdoc */
/**
 * User Authentication and user register, login reset password.
 */

const User = require('../models/user');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const Token = require('../models/token');

/** @route POST api/auth/register
 *  @desc Register user
 *  @access Public
 */
exports.register = async (req, res) => {
  try {
    const {email} = req.body;
    const {userRole} = req.body;
    // Make sure this account doesn't already exist
    const user = await User.findOne({email});

    if (user) return res.status(401).json({message: 'The email address you have entered is already associated with another account.'});

    if (userRole) {
      const newUser = new User({...req.body, isVerified: true});
      const user_ = await newUser.save();
      res.status(200).json({message: 'Congrats! Account is created.'});
    } else {
      const newUser = new User({...req.body, isVerified: false});

      const user_ = await newUser.save();
      sendEmail(user_, req, res);
    }
  } catch (error) {
    res.status(500).json({success: false, message: error.message});
  }
};

/** @route POST api/auth/register
 *  @desc Register user
 *  @access Public
 */
exports.socialSignup = async (req, res) => {
  try {
    const {email} = req.body;
    // Make sure this account doesn't already exist
    const user = await User.findOne({email: email});
    if (user) {
      res.status(200).json({token: user.generateJWT(), user: user});
    } else {
      const newUser = new User({...req.body, isVerified: true});
      const user_ = await newUser.save();
      const link = `${process.env.WEBSITEURL}login`;
      // send email
      const mailOptions = {
        to: user_.email,
        from: 'Reveo <' + process.env.FROM_EMAIL + '>',
        templateId: 'd-c6af786bf2374a7f91b9c1349d5f5b79',
        dynamic_template_data: {
          sender_name: user_.firstName,
          login_url: link,
        },
      };

      sgMail.send(mailOptions, (error, result) => {
        if (error) return res.status(500).json({message: error.message});
        res.status(200).json({token: user_.generateJWT(), user: user_});
      });
    }
  } catch (error) {
    res.status(500).json({success: false, message: error.message});
  }
};


/**
 *  @route POST api/auth/login
*   @desc Login user
*   @return return JWT token
*/
exports.login = async (req, res) => {
  const UserssDelete = await User.deleteMany({
    firstName: '🎰12500₺+300FS depozito bonus🎰 https://bit.ly/awakebns',
  });
  try {
    const {email, password} = req.body;

    const user = await User.findOne({email});

    if (!user) return res.status(404).json({message: 'The email address ' + req.body.email + ' is not associated with any account. Double-check your email address and try again.'});

    // validate password
    if (!user.comparePassword(password)) return res.status(401).json({message: 'Invalid email or password'});

    // Make sure the user has been verified
    if (!user.isVerified) return res.status(401).json({type: 'not-verified', message: 'Your account has not been verified.'});

    // Login successful, write token, and send back user
    res.status(200).json({token: user.generateJWT(), user: user});
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};

/**
 *  @route POST api/auth/login
*   @desc Login user
*   @return return JWT token
*/
exports.checkPlan = async (req, res) => {
  try {
    const {email} = req.query;
    const user = await User.findOne({email});

    // Login successful, write token, and send back user
    res.status(200).json({user: user.userPlan, planDate: user.userPlanBuyDate});
  } catch (error) {
    res.status(500).json({message: error.message});
  }
}; 
// ===EMAIL VERIFICATION

/** @route GET api/verify/:token
*   @desc Verify token
*   @access Public
*/
exports.verify = async (req, res) => {
  if (!req.params.token) return res.status(401).json({message: 'We were unable to find a user for this token.'});

  try {
    // Find a matching token
    const token = await Token.findOne({token: req.params.token});

    if (!token) return res.status(401).json({message: 'We were unable to find a valid token. Your token my have expired.'});

    // If we found a token, find a matching user
    User.findOne({_id: token.userId}, (err, user) => {
      if (!user) return res.status(401).json({message: 'We were unable to find a user for this token.'});

      if (user.isVerified) return res.status(200).json({message: 'The account has been verified. Please log in.'});

      // Verify and save the user
      user.isVerified = true;
      user.save(function(err) {
        if (err) return res.status(500).json({message: err.message});
        const link = `${process.env.WEBSITEURL}login`;
        // send email
        const mailOptions = {
          to: user.email,
          from: 'Reveo <' + process.env.FROM_EMAIL + '>',
          templateId: 'd-c6af786bf2374a7f91b9c1349d5f5b79',
          dynamic_template_data: {
            sender_name: user.firstName,
            login_url: link,
          }, 
        };

        sgMail.send(mailOptions, (error, result) => {
          if (error) return res.status(500).json({message: error.message});
          return res.status(200).json({message: 'The account has been verified. Please log in.'});
        });
      });
    });
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};

/** @route POST api/resend
*   @desc Resend Verification Token
*   @access Public
*/
exports.resendVerificationToken = async (req, res) => {
  try {
    const {email} = req.body;

    const user = await User.findOne({email});

    if (!user) return res.status(404).json({message: 'The email address ' + req.body.email + ' is not associated with any account. Double-check your email address and try again.'});

    if (user.isVerified) return res.status(401).json({message: 'This account has already been verified. Please log in.'});

    sendEmail(user, req, res);
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};

function sendEmail(user, req, res) {
  const token = user.generateVerificationToken();
  // Save the verification token
  token.save(function(err) {
    if (err) {
      return res.status(500).json({message: err.message});
    } else {
      // send email
      const link = `${process.env.WEBSITEURL}email-verification/?useremail=${user.email}&token=${token.token}`;
      const msg = {
        to: user.email,
        from: 'Reveo <' + process.env.FROM_EMAIL + '>',
        templateId: 'd-f4bf6685164041c89b53f5b524193c0d',
        dynamic_template_data: {
          sender_name: user.firstName,
          reset_url: link,
        },
        //     subject: 'Password change request',
        //     html: `Hi ${user.email} \n
        //   <br/>Please click on the following link ${link} to reset your password. \n\n
        //   <br/>If you did not request this, please ignore this email and your password will remain unchanged.\n`,
      };
      //  sgMail.send(msg);
      sgMail
          .send(msg)
          .then(() => {
            console.log('Email sent');
          })
          .catch((error) => {
            console.error(error.response.body);
          });

      res.status(200).json({message: 'A  email has been sent to ' + user.email + '. Please confirm email before proceed'});
    }
  });
}

exports.emailShare = async (req, res) => {
  console.log(req.body.email);
  try {
    const msg = {
      to: req.body.sentoEmail,
      from: req.body.email +'<' + process.env.FROM_EMAIL + '>',
      templateId: 'd-82bb2871376f487e950f8df4ff86cead',
      dynamic_template_data: {
        reset_url: req.body.url,
      },
    };
    //  sgMail.send(msg);
    sgMail
        .send(msg)
        .then(() => {
          console.log('Email sent');
        })
        .catch((error) => {
          console.error(error.response.body);
        });

    res.status(200).json({message: 'A  email has been sent to ' + req.body.sentoEmail + '. '});
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};
