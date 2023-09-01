const Game = require('../models/game');
const Room = require('../models/room');
const io = require('../socket');

exports.getRoomMessages = async (req, res, next) => {
    try {
        const { gameId } = req.params;
        const game = await Game.findById(gameId).populate('room');

        if (!game) {
            const error = new Error('Could not find game.');
            error.statusCode = 404;
            throw error;
        }

        // Check if the user has purchased the game or if it is free
        if (game.price !== 0 && !game.players.includes(req.userId)) {
            const error = new Error('You need to purchase the game to view messages');
            error.statusCode = 403;
            throw error;
        }

        const messages = game.room.messages;

        return res.status(200).json(messages);
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.postRoomMessage = async (req, res, next) => {
    try {
        const { gameId } = req.params;
        const { text } = req.body;

        const game = await Game.findById(gameId).populate('room');
        if (!game) {
            const error = new Error('Could not find game.');
            error.statusCode = 404;
            throw error;
        }

        // Check if the user has purchased the game or if it is free
        if (!game.price !== 0 && !game.players.includes(req.userId)) {
            const error = new Error('You need to purchase the game to send messages');
            error.statusCode = 403;
            throw error;
        }

        const message = { sender: req.userId, text };
        game.room.messages.push(message);
        await game.room.save();
        io.getIo().emit('roomMessages', {
            action: 'sendMessage',
            messages: game.room.messages
        })
        return res.status(201).json(message);
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};