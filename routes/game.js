const express = require('express');
// const { body } = require('express-validator');

const gameController = require('../controllers/game');
const reviewController = require('../controllers/review');

const Game = require('../models/game');

const { isAuth, authorizePermissions } = require('../middleware/auth');

const router = express.Router();

router.get('/', gameController.getGames);

router.get('/game/:titleSlug', gameController.getGame);

router.get('/admin/games', gameController.getAllGames);

router.get('/browse', gameController.getGamesByFilter);

router.get('/collection/free-games', gameController.getFreeGames);

router.get('/collection/top-sellers', gameController.getTopSellers);

router.get('/collection/top-wishlisted', gameController.getTopWishlisted);

router.get('/collection/top-player-reviewed', gameController.getTopPlayerReviewed);

router.get('/collection/most-popular', gameController.getMostPopular);

router.post('/admin/add-game', isAuth, authorizePermissions('administrator', 'publisher'), gameController.addNewGame);

router.put('/admin/game/:gameId', isAuth, authorizePermissions('administrator', 'publisher'), gameController.updateGame);

router.delete('/admin/game/:gameId', isAuth, authorizePermissions('administrator', 'publisher'), gameController.deleteGame);

router.get('/:id/reviews', reviewController.getSingleGameReviews);


module.exports = router;