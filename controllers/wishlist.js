const Wishlist = require('../models/wishlist');
const Game = require('../models/game');

exports.getWishlist = async (req, res, next) => {
    const userId = req.userId;

    try {
        const wishlist = await Wishlist.findOne({ user: userId }).populate('games');

        if (!wishlist) {
            return res.status(404).json({ message: 'Wishlist not found' });
        }

        return res.status(200).json({ message: 'Wishlist retrieved successfully', wishlist: wishlist.games });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
};

exports.addToWishlist = async (req, res, next) => {
    const gameId = req.body.gameId;
    const userId = req.userId;

    try {
        const wishlist = await Wishlist.findOne({ user: userId });
        const game = await Game.findById(gameId);

        if (!game) {
            const error = new Error('Game not found');
            error.statusCode = 404;
            throw error;
        }

        if (!wishlist) {
            const newWishlist = new Wishlist({
                user: userId,
                games: [gameId]
            });

            await newWishlist.save();

            game.numOfWishers += 1; // Increment the numOfWishers field
            await game.save();
            return res.status(201).json({ message: 'Game added to wishlist', wishlist: newWishlist });
        }

        if (wishlist.games.includes(gameId)) {
            return res.status(400).json({ message: 'Game is already in wishlist', wishlist: wishlist });
        }

        wishlist.games.push(gameId);
        await wishlist.save();

        game.numOfWishers += 1; // Increment the numOfWishers field
        await game.save();
        return res.status(200).json({ message: 'Game added to wishlist', wishlist: wishlist });
    } catch (error) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.removeFromWishlist = async (req, res, next) => {
    const gameId = req.body.gameId;
    const userId = req.userId;

    try {
        const wishlist = await Wishlist.findOne({ user: userId });
        const game = await Game.findById(gameId);

        if (!game) {
            const error = new Error('Game not found');
            error.statusCode = 404;
            throw error;
        }

        if (!wishlist) {
            const error = new Error('Wishlist not found');
            error.statusCode = 404;
            throw error;
        }

        if (!wishlist.games.includes(gameId)) {
            return res.status(400).json({ message: 'Game is not in wishlist', wishlist: wishlist });
        }

        wishlist.games = wishlist.games.filter((game) => game.toString() !== gameId.toString());
        await wishlist.save();

        game.numOfWishers -= 1; // Decrement the numOfWishers field
        await game.save();
        return res.status(200).json({ message: 'Game removed from wishlist', wishlist: wishlist });
    } catch (error) {
        next(error);
    }
};