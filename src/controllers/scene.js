/* eslint-disable max-len */
/* eslint-disable valid-jsdoc */
/* eslint-disable no-unused-vars */
/* eslint-disable no-trailing-spaces */
const Scene = require('../models/scene');

/**
 * @function  addBlock used to create new Event
 * @route POST /api/template/add-block
 * @desc Add Event 
 * @access Admin
*/
exports.addScene = async (req, res, next) => {
  try {
    const newScene = new Scene({...req.body});
    const tempateData = await newScene.save();
    res.status(200).json({message: 'Scene successfully created', data: tempateData});
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};

exports.getCategoryScenes = async function(req, res) {
  const {categoryId} = req.query;
  try {
    const scene= await Scene.find({sceneCategory: categoryId});
    if (!scene) {
      return res.status(200).json({message: 'Scene Category not found'});
    } else {
      return res.status(200).json({message: 'Scene Category data found', scenes: scene});
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
  const scenes = await Scene.find({}).sort({_id: 1 });
  res.status(200).json({scenes});
};

/** @route PUT api/division/{id}
*   @desc Update division details
*   @access Public
*/
exports.update = async function(req, res) {
  try {
    const {id} = req.body;
    // Make sure to update existing division 
    const scene= await Scene.findOne({sceneId: id});
    if (!scene) {
      return res.status(200).json({message: 'Scene not found'});
    }

    // Update existing division  
    const sceneUpdate = await Scene.findOneAndUpdate({sceneId: id}, {$set: req.body}, {new: true, useFindAndModify: false});
    res.status(200).json({sceneUpdate, message: 'Scene has been updated'});
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};

/** @route GET api/user/{id}
* @desc Returns a specific user
* @access Public
*/
exports.getScene = async function(req, res) {
  try {
    const id = req.query.id;
    const scene= await Scene.findOne({sceneId: id});
    if (!scene) return res.status(404).json({message: 'Scene does not exist'});
    res.status(200).json({scene});
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};
