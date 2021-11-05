/* eslint-disable max-len */
/* eslint-disable valid-jsdoc */
/* eslint-disable no-unused-vars */
/* eslint-disable no-trailing-spaces */
const Team = require('../models/team');
const User = require('../models/user');
/**
 * @function  addBlock used to create new Event
 * @route POST /api/template/add-block
 * @desc Add Event
 * @access Admin
 */
exports.addMember = async (req, res, next) => {
  try {
    const {memberId} = req.body;
    const team = await Team.find({adminId: memberId});
    const teamMember = await Team.find({memberId: memberId});
    console.log(team);
    // console.log(teamMember)
    if (team.length>0) {
      res.status(200).json({message: 'Already have team under this user', error: true});
    } else if (teamMember.length>0) {
      res.status(200).json({message: 'Member already added', error: true});
    } else {
      const newTeam = new Team({...req.body});
      const member = await newTeam.save();
      res.status(200).json({message: 'User successfully added', data: member});
    }
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};

exports.getMembers = async function(req, res) {
  const {adminId} = req.query;
  try {
    const team = await Team.find({adminId: adminId});
    if (!team) {
      return res.status(200).json({message: 'Members not found'});
    } else {
      return res
          .status(200)
          .json({message: 'Members data found', members: team});
    }
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};

/** @route GET admin/user
 *   @desc Returns all users
 *   @access Public
 */
exports.searchMembers = async function(req, res) {
  const {userEmail} = req.query;
  try {
    const team = await User.find({email: userEmail});
    console.log(team);
    if (team.length > 0) {
      return res
          .status(200)
          .json({message: 'Members data found', members: team});
    } else {
      return res.status(200).json({message: 'Members not found'});
    }
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};

exports.deleteBlock = async function(req, res) {
  try {
    const id = req.query.id;
    await Team.findOneAndDelete({
      _id: id,
    });
    res.status(200).json({message: 'Member has been deleted'});
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};
