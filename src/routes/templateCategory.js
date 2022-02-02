/* eslint-disable new-cap */
const express = require('express');
const Template = require('../controllers/templateCategory');
const router = express.Router();

// UPLOAD
router.get('/all', Template.index);
router.post('/add-category', Template.addTemplate);
router.get('/get-category', Template.getTemplateCategory);
router.get('/category', Template.getCategory);
// router.delete('/delete-Template/', template.deleteBlock);
router.put('/:id', Template.update);
module.exports = router;


