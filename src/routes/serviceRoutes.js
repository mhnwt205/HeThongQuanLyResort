const express = require('express');
const ServiceController = require('../controllers/serviceController');

const router = express.Router();

// Routes cho khách hàng
router.get('/', ServiceController.showServices);
router.get('/detail/:id', ServiceController.showServiceDetail);
router.post('/book', ServiceController.bookService);
router.get('/api/list', ServiceController.getServices);

module.exports = router;

