const Conversation = require("../models/conversation");

exports.createConversation = async (req, res, next) => {
    try {
        const users = req.body.users;
        const conversation = await checkConversationExists(users[0], users[1]);
        if (conversation) {
            res.status(409).json({ message: 'Conversation already exists', conversation });
        }
        else {
            conversation = new Conversation({ users });
            await conversation.save();
            res.status(201).json(conversation);
        }
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.getConversations = async (req, res, next) => {
    try {
        const conversations = await Conversation.find({
            users: { $in: [req.userId] }
        });
        res.status(200).json(conversations);
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.getConversation = async (req, res, next) => {
    try {
        const userId = req.userId;
        const secondUserId = req.params.secondUserId;
        const conversation = await Conversation.findOne({
            users: { $all: [userId, secondUserId], $size: 2 }
        });
        res.status(200).json(conversation)
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

const checkConversationExists = async (userId1, userId2) => {
    const conversation = await Conversation.findOne({
        users: { $all: [userId1, userId2], $size: 2 },
    }).populate('users');
    return conversation;
};