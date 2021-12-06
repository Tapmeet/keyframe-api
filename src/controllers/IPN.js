/* eslint-disable max-len */
/* eslint-disable valid-jsdoc */
/* eslint-disable no-unused-vars */
/* eslint-disable no-trailing-spaces */
const Team = require('../models/team');

/**
 * @function  addBlock used to create new Event
 * @route POST /api/template/add-block
 * @desc Add Event
 * @access Admin
 */
exports.index = async (req, res, next) => {
  console.log(req.body);
  res.status(200).send('OK');
  res.end();
  try {
   
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};

