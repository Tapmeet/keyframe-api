const express = require('express');
const User = require('../controllers/user');
const router = express.Router();

//INDEX
router.get('/', User.index);

//SHOW
router.get('/:id',  User.show);

//UPDATE
router.put('/:id',  User.update);

//DELETE
router.delete('/:id', User.destroy);

//UPLOAD
router.post('/upload', User.upload);

module.exports = router;


