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
  console.log(buyer_email);
  try {
    console.log('hre');
    const isValidated = await paykickstartIPNValidator(req.body, process.env.SECRETIPN);
    if (!isValidated) {
      console.error('Error validating IPN message.');
      return;
    }
    console.log('thre');
    const user = await User.find({email: buyer_email});
    console.log('thress');
    console.log(user[0]._id);
    const userid = user[0]._id;
    const newTeam = new Ipn({...req.body, userId: userid});
    const member = await newTeam.save();
    console.log(member);
    res.status(200).send('OK');
    res.end();
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};
