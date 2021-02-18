/* eslint-disable new-cap */
const express = require('express');
const scene = require('../controllers/scene');
const router = express.Router();

// UPLOAD
router.get('/all-scenes', scene.index);
router.post('/add-scene', scene.addScene);
router.get('/get-scene', scene.getScene);
router.get('/category-scenes', scene.getCategoryScenes);
// router.delete('/delete-scene/', template.deleteBlock);
router.put('/:id', scene.update);
module.exports = router;


