const express = require('express');
const router = express.Router();
const Event = require('../controllers/event');

/**
 * Upload Events Image
 */
const multer = require('multer');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'src/Assets/Events')
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.split(" ").join("");;
    cb(null, file.fieldname + '-' + Date.now() +'-'+ fileName)
  }
})
const upload = multer({ storage: storage });

/**
 * Add Event route
 */
router.post('/add-event', upload.single('eventImage'), Event.addEvent)

/**
 * All Events route
 */
router.get('/', Event.index);

/**
 * All single event route
 */
router.get('/:id',  Event.show);

/**
 * Update  event route
 */
// router.put('/:id',  Event.update);

/**
 * Delete  event route
 */
router.delete('/:id', Event.destroy);

module.exports = router;


