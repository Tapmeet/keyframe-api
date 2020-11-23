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
        const { email } = req.body;
        // Make sure this account doesn't already exist
        const user = await User.findOne({ email });

        if (user) return res.status(401).json({ message: 'The email address you have entered is already associated with another account.' });

        const newUser = new User({ ...req.body });

        const user_ = await newUser.save();
        sendEmail(user_, req, res);

    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
};


/**
 *  @route POST api/auth/login
*   @desc Login user  
*   @return return JWT token
*/
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) return res.status(404).json({ message: 'The email address ' + req.body.email + ' is not associated with any account. Double-check your email address and try again.' });

        //validate password
        if (!user.comparePassword(password)) return res.status(401).json({ message: 'Invalid email or password' });

        // Make sure the user has been verified
        if (!user.isVerified) return res.status(401).json({ type: 'not-verified', message: 'Your account has not been verified.' });

        // Login successful, write token, and send back user
        res.status(200).json({ token: user.generateJWT(), user: user });
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
};


// ===EMAIL VERIFICATION

/** @route GET api/verify/:token
*   @desc Verify token
*   @access Public
*/
exports.verify = async (req, res) => {
    if (!req.params.token) return res.status(401).json({ message: "We were unable to find a user for this token." });

    try {
        // Find a matching token
        const token = await Token.findOne({ token: req.params.token });

        if (!token) return res.status(401).json({ message: 'We were unable to find a valid token. Your token my have expired.' });

        // If we found a token, find a matching user
        User.findOne({ _id: token.userId }, (err, user) => {
            if (!user) return res.status(401).json({ message: 'We were unable to find a user for this token.' });

            if (user.isVerified) return res.status(401).json({ message: 'This user has already been verified.' });

            // Verify and save the user
            user.isVerified = true;
            user.save(function (err) {
                if (err) return res.status(500).json({ message: err.message });

                res.status(200).send("The account has been verified. Please log in.");
            });
        });
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
};

/** @route POST api/resend
*   @desc Resend Verification Token
*   @access Public
*/
exports.resendVerificationToken = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });

        if (!user) return res.status(404).json({ message: 'The email address ' + req.body.email + ' is not associated with any account. Double-check your email address and try again.' });

        if (user.isVerified) return res.status(401).json({ message: 'This account has already been verified. Please log in.' });

        sendEmail(user, req, res);
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
};

function sendEmail(user, req, res) {
    const token = user.generateVerificationToken();
    // Save the verification token
    token.save(function (err) {
        if (err) { return res.status(500).json({ message: err.message }); }
        else {
            let link = `${process.env.WEBSITEURL}login`;
            // send email
            const mailOptions = {
                to: user.email,
                from: 'Keyframe <' + process.env.FROM_EMAIL + '>',
                templateId: 'd-26e7ac009e3149a3924d3499deedb0c4',
                dynamic_template_data: {
                    sender_name: user.firstName,
                    login_url: link,
                }
            };

            sgMail.send(mailOptions, (error, result) => {
                if (error) return res.status(500).json({ message: error.message });
                res.status(200).json({ message: 'Congrats! Your account is created. Please Login' });
            });
        }
    });
}