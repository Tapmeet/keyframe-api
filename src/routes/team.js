/* eslint-disable new-cap */
const express = require('express');
const team = require('../controllers/team');
const router = express.Router();

// UPLOAD
router.get('/get-members', team.getMembers);
router.post('/add-member', team.addMember);
router.delete('/delete-member/', team.deleteBlock);

module.exports = router;

