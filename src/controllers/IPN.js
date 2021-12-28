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
  console.log(req.body);
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
    console.log('member2');

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
    // console.log('member');
    // console.log(member);
    const today = new Date();
    const templateUpdate = await User.findOneAndUpdate(
        {_id: userid},
        {$set: {userPlan: selectedplan, userPlanBuyDate: today}},
        {new: true, useFindAndModify: false},
    );
    // console.log('templateUpdate');
    // console.log(templateUpdate);
    res.status(200).send('OK');
    res.end();
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};
