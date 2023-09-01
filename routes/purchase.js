const express = require('express');
const { body } = require('express-validator');

const { isAuth, authorizePermissions } = require('../middleware/auth');

const router = express.Router();
const purchaseController = require('../controllers/purchase');

router.post('/checkout/session', isAuth, purchaseController.createCheckoutSession);

router.get('/checkout/success', isAuth, purchaseController.checkoutSuccess);

router.get('/user/purchase-history', isAuth, purchaseController.getPurchaseHistory);

router.get('/admin/purchases', isAuth, authorizePermissions('administrator'), purchaseController.getAllPurchases);

module.exports = router;