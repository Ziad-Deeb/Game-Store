const fs = require('fs');
const path = require('path');
const slugify = require('slugify');

const { validationResult } = require('express-validator');

const Game = require('../models/game');
const User = require('../models/user');

exports.getAllGames = async (req, res, next) => {
    const currentPage = parseInt(req.query.page) || 1;
    const perPage = 10;

    try {
        const totalGames = await Game.countDocuments();
        const games = await Game.find()
            .skip((currentPage - 1) * perPage)
            .limit(perPage);

        res.status(200).json({
            message: 'Fetched games successfully.',
            currentPage,
            totalPages: Math.ceil(totalGames / perPage),
            games,
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.getGames = async (req, res, next) => {
    try {
        const freeGames = await Game.find({ price: 0 }).limit(7);
        const topSellers = await Game.find().sort({ sales: -1 }).limit(7);
        const topWishlisted = await Game.find().sort({ numOfWishers: -1 }).limit(7);
        const TopPlayerReviewed = await Game.find().sort({ averageRating: -1 }).limit(7);
        const mostPopular = await Game.find().sort({ popularity: -1 }).limit(7);
        res.status(200).json({
            message: 'Fetched games successfully.',
            freeGames: freeGames,
            topSellers: topSellers,
            topWishlisted: topWishlisted,
            TopPlayerReviewed: TopPlayerReviewed,
            mostPopular: mostPopular
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.getGame = async (req, res, next) => {
    const titleSlug = req.params.titleSlug;
    try {
        const game = await Game.findOne({ titleSlug: titleSlug }).populate('gameReviews');;
        const reviews = game.gameReviews;
        if (!game) {
            const error = new Error('Could not find game.');
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({ message: 'Game Fetch.', game: game, reviews: reviews });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.getFreeGames = async (req, res, next) => {
    try {
        const freeGames = await Game.find({ price: 0 });
        res.status(200).json({ message: 'Fetched free games successfully.', freeGames: freeGames });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.getTopSellers = async (req, res, next) => {
    try {
        const topSellers = await Game.find().sort({ sales: -1 }).limit(30);
        res.status(200).json({ message: 'Fetched top selling games successfully.', topSellers: topSellers });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.getTopWishlisted = async (req, res, next) => {
    try {
        const topWishlisted = await Game.find().sort({ numOfWishers: -1 }).limit(30);
        res.status(200).json({ message: 'Fetched top wishlisted games successfully.', topWishlisted: topWishlisted });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.getTopPlayerReviewed = async (req, res, next) => {
    try {
        const TopPlayerReviewed = await Game.find().sort({ averageRating: -1 }).limit(30);
        res.status(200).json({ message: 'Fetched highest-rated reviews games successfully.', TopPlayerReviewed: TopPlayerReviewed });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.getMostPopular = async (req, res, next) => {
    try {
        const mostPopular = await Game.find().sort({ popularity: -1 }).limit(30);
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.getGamesByFilter = async (req, res, next) => {
    let useAllOperator;
    const search = req.query.search || "";
    const sortBy = req.query.sortBy || "releaseDate";
    const sortDir = req.query.sortDir || "DESC";

    const sort = {};
    sort[sortBy] = (sortDir === 'ASC') ? 1 : -1;

    const minPrice = req.query.minPrice || 0;
    const maxPrice = req.query.maxPrice || Number.MAX_VALUE;
    const priceFilter = { $gte: minPrice, $lte: maxPrice };

    let genre = req.query.genre || "All";
    const genreOptions = ['Action', 'Action-Adventure', 'Adventure', 'Card Game', 'Casual', 'City Builder', 'Comedy', 'Dungeon Crawler', 'Exploration', 'Fantasy', 'Fighting', 'First Person', 'Horror', 'Indie', 'MOBA', 'Music', 'Narration', 'Open World', 'Party', 'Platformer', 'Puzzle', 'Racing', 'Retro', 'Rogue-Lite', 'Shooter', 'Simulation', 'Space', 'Sports', 'Stealth', 'Strategy', 'Survival', 'Tower Defense', 'Trivia', 'Turn-Based', 'Turn-Based Strategy', 'RPG', 'RTS'];
    useAllOperator = (genre === 'All' ? false : true);
    genre === "All" ? (genre = [...genreOptions]) : (genre = req.query.genre.split(','));
    const genresFilter = useAllOperator
        ? { $all: [...genre] }
        : { $in: [...genre] };

    let features = req.query.features || "All";
    const featuresOptions = ['Achievements', 'Alexa Game Control', 'Cloud Saves', 'Co-op', 'Competitive', 'Controller Support', 'Cross Platform', 'MMO', 'Multiplayer', 'Single Player', 'VR', 'Local Multiplayer', 'Online Multiplayer'];
    useAllOperator = (features === 'All' ? false : true);
    features === "All" ? (features = [...featuresOptions]) : (features = req.query.features.split(','));
    const featuresFilter = useAllOperator
        ? { $all: [...features] }
        : { $in: [...features] };

    const games = await Game.find({ title: { $regex: search, $options: 'i' }, genres: genresFilter, features: featuresFilter, price: priceFilter }).sort(sort);
    res.status(200).json({ message: 'Fetched games by filter successfully.', games: games });
};

exports.addNewGame = async (req, res, next) => {
    try {
        if (!req.files || !req.files['keyImage']) {
            const error = new Error('No Key image provided!');
            error.statusCode = 422;
            throw error;
        }
        keyImage = req.files['keyImage'][0].path.replace("\\", "/");
        const screenshots = Array.isArray(req.files['screenshots'])
            ? req.files['screenshots'].map((screenshot) => screenshot.path.replace("\\", "/"))
            : [];
        let gameFile = '';
        if (req.files['gameFile']) {
            gameFile = req.files['gameFile'][0].path.replace("\\", "/");
        }

        const {
            title,
            description,
            developer,
            publisher,
            releaseDate,
            initialRelease,
            platforms,
            systemRequirements,
            changelog,
            price,
            salePrice,
            genres,
            features,
        } = req.body;

        const titleSlug = slugify(title, { lower: true });

        const newGame = new Game({
            title,
            titleSlug,
            description,
            developer,
            publisher,
            releaseDate,
            initialRelease,
            platforms,
            systemRequirements,
            keyImage,
            screenshots,
            changelog,
            price,
            salePrice,
            genres,
            features,
            gameFile
        });

        await newGame.save();
        res.status(201).json({
            message: 'Game Created Successfully!',
            newGame: newGame
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.updateGame = async (req, res, next) => {
    try {
        const gameId = req.params.gameId;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error = new Error('Validation failed, entered data is incorrect.');
            error.statusCode = 422;
            throw error;
        }
        const {
            title,
            description,
            developer,
            publisher,
            releaseDate,
            initialRelease,
            platforms,
            systemRequirements,
            changelog,
            price,
            salePrice,
            genres,
            features,
        } = req.body;
        let keyImage = req.body.keyImage;
        if (req.files['keyImage'] && req.files['keyImage'].length > 0) {
            keyImage = req.files['keyImage'][0].path.replace("\\", "/");
        }
        if (!keyImage) {
            const error = new Error('No file picked.');
            error.statusCode = 422;
            throw error;
        }
        const updatedScreenshots = Array.isArray(req.files['screenshots'])
            ? req.files['screenshots'].map((screenshot) => screenshot.path.replace("\\", "/"))
            : [];

        const game = await Game.findById(gameId);
        if (!game) {
            const error = new Error('Could not find game.');
            error.statusCode = 404;
            throw error;
        }
        if (keyImage !== game.keyImage) {
            clearImage(game.keyImage);
        }
        game.screenshots.forEach((screenshot) => {
            clearImage(screenshot);
        });
        game.title = title;
        game.titleSlug = slugify(title, { lower: true });
        game.description = description;
        game.developer = developer;
        game.publisher = publisher;
        game.releaseDate = releaseDate;
        game.initialRelease = initialRelease;
        game.platforms = platforms;
        game.systemRequirements = systemRequirements;
        game.changelog = changelog;
        game.price = price;
        game.salePrice = salePrice
        game.keyImage = keyImage;
        game.screenshots = updatedScreenshots;
        game.genres = genres;
        game.features = features;
        const result = await game.save();
        res.status(200).json({ message: 'Game Updated!', game: result })
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.deleteGame = async (req, res, next) => {
    const gameId = req.params.gameId;
    try {
        const game = await Game.findById(gameId);
        if (!game) {
            const error = new Error('Could not find game.');
            error.statusCode = 404;
            throw error;
        }
        if (game.keyImage) {
            clearImage(game.keyImage);
        }
        game.screenshots.forEach((screenshot) => {
            clearImage(screenshot);
        });
        await Game.findByIdAndRemove(gameId);
        res.status(200).json({ message: 'Deleted game.' });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

const clearImage = filePath => {
    try {
        filePath = path.join(__dirname, '..', filePath);
        fs.unlinkSync(filePath);
        console.log('Image file deleted successfully.');
    } catch (err) {
        throw new Error('Failed to delete image file.');
    }
};


