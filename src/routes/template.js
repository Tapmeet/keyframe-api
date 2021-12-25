/* eslint-disable new-cap */
const express = require('express');
const template = require('../controllers/template');
const video = require('../controllers/createVideo');
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
router.post('/add-media/upload', upload.single('file'), template.uploadMedia);
router.post('/add-template', template.addTemplate);
router.post('/add-block', template.addBlock);
router.post('/create-videos', video.createVideo);
router.post('/merge-videos', video.mergeVideo);
router.get('/get-template', template.getTemplate);
router.get('/get-uploads', template.getUploads);
router.get('/get-music', template.getMusicUploads);
router.delete('/delete-block/', template.deleteBlock);
router.put('/update-scene/:id', template.update);
router.put('/update-template/:id', template.updateTemplate);
// Admin Url
router.get('/all-templates', template.getAdminTemplates);
router.post('/create-template', template.addAdminTemplates);
router.get('/get-admin-template', template.getAdminTemplate);
router.delete('/delete-template/', template.deleteTemplate);
router.delete('/delete-media/', template.deleteMedia);

// User Template Videos

router.get('/get-user-videos', template.getVideos);
router.get('/get-user-video', template.getVideo);
router.delete('/delete-user-videos/', template.deleteVideo);

router.post('/edit-video', template.editVideo);


module.exports = router;

