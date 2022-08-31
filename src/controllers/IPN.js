/* eslint-disable require-jsdoc */
/* eslint-disable camelcase */
/* eslint-disable max-len */
/* eslint-disable valid-jsdoc */
/* eslint-disable no-unused-vars */
/* eslint-disable no-trailing-spaces */
const Ipn = require('../models/ipn');
const User = require('../models/user');
const paykickstartIPNValidator = require('paykickstart-ipn-validator');
/**
 * @function  addBlock used to create new Event
 * @route POST /api/template/add-block
 * @desc Add Event
 * @access Admin
 */
exports.index = async (req, res, next) => {
  const {buyer_email} = req.body;

  const plansArray = [
    {
      planId: '30167',
      planName: 'reveo Professional - Monthly - Reveo',
      planCode: '2',
    },
    {
      planId: '59653',
      planName: 'reveo Team - Monthly - Reveo',
      planCode: '4',
    },
    {planId: '59654', planName: 'reveo Team - Annual - Reveo', planCode: '5'},
    {planId: '59655', planName: 'reveo Professional - Annual', planCode: '3'},
    {planId: '59990', planName: 'reveo Free Plan', planCode: '1'},
  ];

  try {
    const isValidated = await paykickstartIPNValidator(
        req.body,
        process.env.SECRETIPN,
    );
    if (!isValidated) {
      console.error('Error validating IPN message.');
      return;
    }
    // console.log('member3');
    let selectedplan;
    plansArray.map(function(plan) {
      if (plan.planId == req.body.product_id) {
        selectedplan = plan.planCode;
      }
    });
    const user = await User.find({email: buyer_email});
    const userid = user[0]._id;
    const newTeam = new Ipn({...req.body, userId: userid});
    const member = await newTeam.save();
    //  console.log('member');
    //  console.log(member);
    const today = new Date();
    const templateUpdate = await User.findOneAndUpdate(
        {_id: userid},
        {$set: {userPlan: selectedplan, userPlanBuyDate: today}},
        {new: true, useFindAndModify: false},
    );
    // console.log('templateUpdate');
    // console.log(templateUpdate);
    sendEmail(member, req, res);
    // res.status(200).send('OK');
    // res.end();
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};

exports.getIpns = async (req, res, next) => {
  const {userId} = req.query;
  try {
    const uploads = await Ipn.find({userId: userId}).sort({
      createdAt: -1,
    });
    if (typeof uploads !== 'undefined' && uploads.length > 0) {
      res.status(200).json({message: 'Uploads List', data: uploads});
    } else {
      res.status(200).json({message: 'No Data Found'});
    }
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
      const today = new Date();
      const yyyy = today.getFullYear();
      let mm = today.getMonth() + 1; // Months start at 0!
      let dd = today.getDate();

      if (dd < 10) dd = '0' + dd;
      if (mm < 10) mm = '0' + mm;

      const formattedToday = dd + '/' + mm + '/' + yyyy;
      const link = `${process.env.WEBSITEURL}email-verification/?useremail=${user.buyer_email}&token=${token.token}`;
      const msg = {
        to: user.buyer_email,
        from: 'Reveo <' + process.env.FROM_EMAIL + '>',
        templateId: 'd-1136581b9a8c46acafccb2ce436bca69',
        dynamic_template_data: {
          sender_name: user.buyer_first_name + ' ' + user.buyer_last_name,
          planeName: user.product_name,
          price: user.amount,
          date: formattedToday,
          email: user.buyer_email
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

      res
          .status(200)
          .json({
            message:
            'A  email has been sent to ' +
            user.email +
            '. Please confirm email before proceed',
          });
    }
  });
}
