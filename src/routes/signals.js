const express = require('express');
const Signals = require('../controllers/signals');
const router = express.Router();

// Post
router.post('/add-signals', Signals.signals);

router.get('/all-signals', Signals.index);

module.exports = router;


