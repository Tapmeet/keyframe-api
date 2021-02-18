/* eslint-disable new-cap */
const express = require('express');
const template = require('../controllers/template');
const router = express.Router();
/**
 * Upload Profile Image
 */
const multer = require('multer');

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'src/Assets/template');
  },
  filename: function(req, file, cb) {
    const fileName = file.originalname.split(' ').join(''); ;
    cb(null, file.fieldname + '-' + Date.now() +'-'+ fileName);
  },
});
const upload = multer({storage: storage});

// UPLOAD
router.post('/add-image/upload', upload.single('file'), template.upload);
router.post('/add-template', template.addTemplate);
router.post('/add-block', template.addBlock);
router.post('/create-videos', template.createVideo);
router.get('/get-template', template.getTemplate);
router.get('/get-uploads', template.getUploads);
router.delete('/delete-block/', template.deleteBlock);
router.put('/update-scene/:id', template.update);
router.put('/update-template/', template.updateTemplate);
// Admin Url
router.get('/all-templates', template.getAdminTemplates);
router.post('/create-template', template.addAdminTemplates);
router.get('/get-admin-template', template.getAdminTemplate);
module.exports = router;


