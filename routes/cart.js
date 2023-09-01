const express = require('express');

const router = express.Router();

const cartController = require('../controllers/cart');

const { isAuth, authorizePermissions } = require('../middleware/auth');

router.post('/', isAuth, cartController.addToCart);

router.get('/', isAuth, cartController.getCart);

router.delete('/empty', isAuth, cartController.emptyCart);

router.delete('/', isAuth, cartController.deleteFromCart);

module.exports = router;