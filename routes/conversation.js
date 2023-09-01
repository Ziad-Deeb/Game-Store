const express = require('express');
const { body } = require('express-validator');

const conversationController = require('../controllers/conversation');
const { isAuth, authorizePermissions } = require('../middleware/auth');

const router = express.Router();


router.post('/conversation', conversationController.createConversation);

router.get('/conversations', isAuth, conversationController.getConversations);

router.get('/conversation/:secondUserId', isAuth, conversationController.getConversation);

module.exports = router;