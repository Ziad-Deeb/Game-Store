const Cart = require('../models/cart');
const Purchase = require('../models/purchase');
const User = require('../models/user');

const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY);


exports.createCheckoutSession = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId)
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const cart = await Cart.findOne({ user: user._id }).populate('items.game');
        if (!cart) {
            return res.status(404).json({ error: 'Cart not found.' });
        }

        const items = cart.items;

        const lineItems = items.map((item) => {
            return {
                price_data: {
                    currency: 'usd',
                    unit_amount: Math.round(item.game.price * 100),
                    product_data: {
                        name: item.game.title,
                        description: item.game.description,
                    },
                },
                quantity: 1,
            };
        });

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: lineItems,
            customer_email: req.user.email,
            success_url: `${process.env.CLIENT_URL}/success.html`,
            cancel_url: `${process.env.CLIENT_URL}/cancel.html`,
        });
        res.status(200).json({ url: session.url });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'An error occurred during checkout.' });
    }
};

exports.checkoutSuccess = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const cart = await Cart.findOne({ user: user._id }).populate('items.game');

        if (!cart) {
            return res.status(404).json({ error: 'Cart not found.' });
        }

        const purchase = new Purchase({
            user: req.userId,
            items: cart.items.map((item) => ({
                game: item.game._id,
                price: item.price,
            })),
            total: cart.total,
            date: cart.expiresAt,
        });

        await purchase.save();

        // Clear user's cart
        cart.items = [];
        cart.total = 0;
        await cart.save();

        res.status(200).json({ message: 'Checkout success', purchaseId: purchase._id });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'An error occurred during checkout.' });
    }
};

exports.getPurchaseHistory = async (req, res, next) => {
    try {
        const userId = req.userId;
        const purchaseHistory = await Purchase.find({ user: userId }).populate('items.game', 'title keyImage');

        res.status(200).json({ message: 'Purchase history fetched successfully.', purchases: purchaseHistory });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.getAllPurchases = async (req, res, next) => {
    try {
        const purchases = await Purchase.find().populate('user', 'username email');
        res.status(200).json({ message: 'All purchases fetched successfully.', purchases: purchases });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};
