/* eslint-disable no-unused-vars */
/* eslint-disable valid-jsdoc */
const path = require('path');
const Signals = require('../models/signals');
/** @route GET admin/user
 *   @desc Returns all users
 *   @access Public
 */
exports.signals = async function(req, res) {
  const newSignal = new Signals({
    codeString: req.body.codeString,
    codeNumeric: req.body.codeNumeric,
  });

  newSignal.save(function(err, result) {
    if (err) {
      res.status(500).json({message: err});
    } else {
      res.status(200).json({message: 'saved'});
    }
  });
};

/** @route GET admin/user
*   @desc Returns all users
*   @access Public
*/
exports.index = async function(req, res) {
  const signals = await Signals.find({});
  res.status(200).json({signals});
};
