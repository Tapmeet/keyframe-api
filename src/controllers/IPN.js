/* eslint-disable camelcase */
/* eslint-disable max-len */
/* eslint-disable valid-jsdoc */
/* eslint-disable no-unused-vars */
/* eslint-disable no-trailing-spaces */
const IpnTb = require('../models/IPN');
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
    const isValidated = await paykickstartIPNValidator(ipn, secret);
    if (!isValidated) {
      console.error('Error validating IPN message.');
      return;
    }
    const user = await User.find({email: buyer_email});
    const userid = user._id;
    const newTeam = new IpnTb({...req.body, userId: userid});
    console.log(newTeam);
    res.status(200).send('OK');
    res.end();
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};
