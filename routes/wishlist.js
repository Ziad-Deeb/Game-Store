const express = require('express');

const router = express.Router();

const wishlistController = require('../controllers/wishlist');

const { isAuth, authorizePermissions } = require('../middleware/auth');

router.get('/', isAuth, wishlistController.getWishlist);

router.post('/', isAuth, wishlistController.addToWishlist);

router.delete('/', isAuth, wishlistController.removeFromWishlist);

module.exports = router;