const express = require('express');
const { body } = require('express-validator');

const messageController = require('../controllers/message');
const { isAuth, authorizePermissions } = require('../middleware/auth');

const router = express.Router();


router.post('/message', messageController.sendMessage);

router.get('/:conversationId', messageController.getConversation);

module.exports = router;