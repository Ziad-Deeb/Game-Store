const express = require('express');
const router = express.Router();
const { isAuth } = require('../middleware/auth');

const reviewController = require('../controllers/review');

router.post('/', isAuth, reviewController.createReview);

router.get('/', isAuth, reviewController.getAllReviews);

router.get('/:id', reviewController.getSingleReview);

router.patch('/:id', isAuth, reviewController.updateReview);

router.delete('/:id', isAuth, reviewController.deleteReview);

module.exports = router;
