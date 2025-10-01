const express = require('express');
const RoomController = require('../controllers/roomController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Routes cho khách hàng
router.get('/', RoomController.showRooms);
router.get('/search', RoomController.showRoomSearch);
router.get('/detail/:id', RoomController.showRoomDetail);
router.get('/api/available', RoomController.searchAvailableRooms);
router.get('/api/types', RoomController.getRoomTypes);

module.exports = router;

