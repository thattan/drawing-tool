const express = require('express');

const multer = require('multer');

const user_controller = require('../controllers/user_controller');
const drawing_controller = require('../controllers/drawing_controller');
const upload_controller = require('../controllers/upload_controller');

// Configure multer middleware
const upload = multer();

const router = express.Router();

router
  .post('/', user_controller.createData)
  .get('/', user_controller.readData)
  .put('/:id', user_controller.updateData)
  .delete('/:id', user_controller.deleteData)
  .post('/', drawing_controller.createData)
  .get('/', drawing_controller.readData)
  .put('/:id', drawing_controller.updateData)
  .delete('/:id', drawing_controller.deleteData)
  .post('/upload', upload.any(), upload_controller.createData);

module.exports = router;
