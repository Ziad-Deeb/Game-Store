const checkPermissions = require('../utils/checkPermissions');
const Review = require('../models/review');
const Game = require('../models/game');

exports.createReview = async (req, res, next) => {
    try {
        const gameId = req.body.game;

        const isValidGame = await Game.findOne({ _id: gameId });

        if (!isValidGame) {
            const error = new Error('Could not find game.');
            error.statusCode = 404;
            throw error;
        }

        const alreadySubmitted = await Review.findOne({
            game: gameId,
            user: req.userId,
        });

        if (alreadySubmitted) {
            const error = new Error('Already submitted review for this game');
            error.statusCode = 400;
            throw error;
        }

        req.body.user = req.userId;
        const review = await Review.create(req.body);
        res.status(201).json({ review });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.getAllReviews = async (req, res, next) => {
    try {
        const reviews = await Review.find({}).populate({
            path: 'game',
            select: 'title price',
        });
        res.status(200).json({ reviews, count: reviews.length });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.getSingleReview = async (req, res, next) => {
    try {
        const reviewId = req.params.id;

        const review = await Review.findOne({ _id: reviewId });

        if (!review) {
            const error = new Error('`No review with id ${reviewId}`');
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json({ review });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.updateReview = async (req, res, next) => {
    try {
        const { id: reviewId } = req.params;
        const { rating, title, comment } = req.body;

        const review = await Review.findOne({ _id: reviewId });

        if (!review) {
            const error = new Error('`No review with id ${reviewId}`');
            error.statusCode = 404;
            throw error;
        }

        checkPermissions(req.user, review.user);

        review.rating = rating;
        review.title = title;
        review.comment = comment;

        await review.save();
        res.status(200).json({ review });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.deleteReview = async (req, res, next) => {
    try {
        const { id: reviewId } = req.params;

        const review = await Review.findOne({ _id: reviewId });

        if (!review) {
            const error = new Error('`No review with id ${reviewId}`');
            error.statusCode = 404;
            throw error;
        }

        checkPermissions(req.user, review.user);

        const result = await Review.deleteOne({ _id: reviewId });
        if (result.deletedCount === 1) {
            res.status(200).json({ message: 'Success! Review removed' });
        } else {
            const error = new Error(`Failed to remove review with id ${reviewId}`);
            error.statusCode = 500;
            throw error;
        }
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.getSingleGameReviews = async (req, res, next) => {
    const { id: gameId } = req.params;
    const reviews = await Review.find({ game: gameId });
    res.status(200).json({ reviews, count: reviews.length });
};