const Message = require("../models/message");

exports.sendMessage = async (req, res, next) => {
    try {
        const message = new Message(req.body);
        await message.save();
        res.status(200).json(message);
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.getConversation = async (req, res, next) => {
    try {
        const messages = await Message.find({ conversation: req.params.conversationId });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};