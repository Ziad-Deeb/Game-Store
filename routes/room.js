const express = require('express');

const router = express.Router();

const { isAuth } = require('../middleware/auth');
const roomController = require('../controllers/room');

router.get('/games/:gameId/messages', isAuth, roomController.getRoomMessages);

router.post('/games/:gameId/messages', isAuth, roomController.postRoomMessage);

module.exports = router;