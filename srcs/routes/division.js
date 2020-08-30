const express = require('express');
const router = express.Router();
const {check} = require('express-validator');
const validate = require('../middlewares/validate');
const Divisons = require('../controllers/division')

router.post('/add-division', [
  check('userId').not().isEmpty().withMessage('User Id is required'),
  check('number').not().isEmpty().withMessage('Number is required'),
  check('title').not().isEmpty().withMessage('Title is required'),
], validate, Divisons.addDivision);

//INDEX
router.get('/', Divisons.index);

//SHOW
router.get('/:id',  Divisons.show);

//UPDATE
router.put('/:id',  Divisons.update);

//DELETE
router.delete('/:id', Divisons.destroy);

module.exports = router;


