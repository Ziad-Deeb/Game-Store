const Cart = require('../models/cart');
const Game = require('../models/game');
const User = require('../models/user');

exports.addToCart = async (req, res, next) => {
    try {
        const userId = req.userId;
        let cart = await Cart.findOne({ user: userId });

        if (!cart) {
            cart = new Cart({
                user: userId,
                items: [],
                total: 0,
            });
        }

        const gameId = req.body.gameId;
        const game = await Game.findById(gameId);

        if (!game) {
            const error = new Error('Could not find game.');
            error.statusCode = 404;
            throw error;
        }

        const itemExists = cart.items.some((item) => item.game.equals(game._id));

        if (itemExists) {
            const error = new Error('Game already in cart');
            error.statusCode = 400;
            throw error;
        }

        const item = {
            game: game._id,
            price: game.price,
        };

        cart.items.push(item);
        cart.total += game.price;

        await cart.save();

        return res.status(201).json({ message: 'Game added to cart', cart });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.getCart = async (req, res, next) => {
    try {
        const userId = req.userId;
        const cart = await Cart.findOne({ user: userId }).populate('items.game');

        if (!cart) {
            const error = new Error('Cart not found');
            error.statusCode = 404;
            throw error;
        }

        return res.status(200).json({
            message: 'Cart retrieved successfully',
            cart: cart
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.deleteFromCart = async (req, res, next) => {
    try {
        const userId = req.userId;
        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            const error = new Error('Cart not found');
            error.statusCode = 404;
            throw error;
        }

        const gameId = req.body.gameId;
        const itemIndex = cart.items.findIndex((item) => item.game.toString() === gameId);

        if (itemIndex === -1) {
            const error = new Error('Game not found in cart');
            error.statusCode = 404;
            throw error;
        }

        const item = cart.items[itemIndex];
        cart.items.splice(itemIndex, 1);
        cart.total -= item.price;

        await cart.save();

        return res.status(200).json({ message: 'Game removed from cart', cart });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.emptyCart = async (req, res, next) => {
    try {
        const userId = req.userId;
        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            const error = new Error('Cart not found');
            error.statusCode = 404;
            throw error;
        }

        cart.items = [];
        cart.total = 0;

        await cart.save();

        return res.status(200).json({ message: 'Cart emptied', cart });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};