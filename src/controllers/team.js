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
exports.addMember = async (req, res, next) => {
  try {
    const newTeam = new Team({...req.body});
    const member = await newTeam.save();
    res.status(200).json({message: 'User successfully added', data: member});
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};

exports.getMembers = async function(req, res) {
  const {adminId} = req.query;
  try {
    const team= await Team.find({adminId: adminId});
    if (!scene) {
      return res.status(200).json({message: 'Members not found'});
    } else {
      return res.status(200).json({message: 'Members data found', members: team});
    }
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};

/** @route GET admin/user
*   @desc Returns all users
*   @access Public
*/
exports.index = async function(req, res) {
  const scenes = await Scene.find({});
  res.status(200).json({scenes});
};


exports.deleteBlock = async function(req, res) {
  try {
    const id = req.query.id;
    const scene= await Scene.findOne({sceneId: id});
    if (!scene) return res.status(404).json({message: 'Scene does not exist'});
    res.status(200).json({scene});
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};
