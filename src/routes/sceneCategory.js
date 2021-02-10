/* eslint-disable new-cap */
const express = require('express');
const scene = require('../controllers/sceneCategory');
const router = express.Router();

// UPLOAD
router.get('/all', scene.index);
router.post('/add-category', scene.addScene);
router.get('/get-category', scene.getScene);
// router.delete('/delete-scene/', template.deleteBlock);
router.put('/:id', scene.update);
module.exports = router;


