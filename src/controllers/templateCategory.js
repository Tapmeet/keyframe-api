/* eslint-disable object-curly-spacing */
/* eslint-disable new-cap */
/* eslint-disable max-len */
/* eslint-disable valid-jsdoc */
/* eslint-disable no-unused-vars */
/* eslint-disable no-trailing-spaces */
const Template = require('../models/templateCategory');

/**
 * @function  addBlock used to create new Event
 * @route POST /api/template/add-block
 * @desc Add Event 
 * @access Admin
*/
exports.addTemplate = async (req, res, next) => {
  try {
    const newTemplate = new Template({...req.body});
    const tempateData = await newTemplate.save();
    res.status(200).json({message: 'Template Category successfully created', data: tempateData});
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};


/** @route GET admin/user
*   @desc Returns all users
*   @access Public
*/
exports.index = async function(req, res) {
  // const templates = await Template.find({});
  // res.status(200).json({templates});
  try {
    const datas = Template.aggregate(
        [
          {
            $project: {
              _id: {
                $toString: '$_id',
              },
              title: '$title',
              categoryImage: '$categoryImage',
            },
          },
          {
            $lookup: {
              from: `templates`,
              let: {
                templateCategory: '$_id',
              },
              pipeline: [
                {
                  // $match: {$expr: {$eq: ['$adminTemplate', 'true']}},
                  $match: {'$expr': {$eq: ['$templateCategory', '$$templateCategory']},
                    'adminTemplate': true,
                  },
                },

              ],
              as: 'template',
            },
          },
        ],
        function(err, data) {
          if (err) throw err;
          res.status(200).json({message: 'Template Data', templates: data});
        },
    );
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};

/** @route PUT api/division/{id}
*   @desc Update division details
*   @access Public
*/
exports.update = async function(req, res) {
  try {
    const {id} = req.body;
    // Make sure to update existing division 
    const template= await Template.findOne({_id: id});
    if (!template) {
      return res.status(200).json({message: 'Template Category not found'});
    }

    // Update existing division  
    const TemplateUpdate = await Template.findOneAndUpdate({_id: id}, {$set: req.body}, {new: true, useFindAndModify: false});
    res.status(200).json({TemplateUpdate, message: 'Template Category has been updated'});
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};

/** @route GET api/user/{id}
* @desc Returns a specific user
* @access Public
*/
exports.getTemplateCategory = async function(req, res) {
  // try {
  //   const id = req.query.id;
  //   const template= await Template.findOne({_id: id});
  //   if (!template) return res.status(404).json({message: 'Template Category does not exist'});
  //   res.status(200).json({template});
  // } catch (error) {
  //   res.status(500).json({message: error.message});
  // }
  const mongoose = require('mongoose');
  const {category} = req.query;

  const id = mongoose.Types.ObjectId(category);
  try {
    const datas = Template.aggregate(
        [
          {
            $match: { _id: id },
          },
          {
            $project: {
              _id: {
                $toString: '$_id',
              },
              title: '$title',
              categoryImage: '$categoryImage',
            },
          },
          {
            $lookup: {
              from: `templates`,
              let: {
                templateCategory: '$_id',
              },
              pipeline: [
                {
                  // $match: {$expr: {$eq: ['$adminTemplate', 'true']}},
                  $match: {'$expr': {$eq: ['$templateCategory', '$$templateCategory']},
                    'adminTemplate': true,
                  },
                },

              ],
              as: 'template',
            },
          },
        ],
        function(err, data) {
          if (err) throw err;
          res.status(200).json({message: 'Template Data', templates: data});
        },
    );
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};
