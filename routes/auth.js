const express = require('express');
const { body } = require('express-validator');
const { isAuth } = require('../middleware/auth');

const User = require('../models/user');
const authController = require('../controllers/auth');

const router = express.Router();

router.post('/signup', [
    body('email')
        .isEmail()
        .withMessage('Please enter a valid email.')
        .custom((value, { req }) => {
            return User.findOne({ email: value })
                .then((userDoc) => {
                    if (userDoc) {
                        return Promise.reject('E-mail address already exists!');
                    }
                });
        })
        .normalizeEmail(),
    body('password').trim().isLength({ min: 5 }),
    body('username')
        .trim()
        .not()
        .isEmpty()
        .custom((value, { req }) => {
            return User.findOne({ username: value })
                .then((userDoc) => {
                    if (userDoc) {
                        return Promise.reject('Username already exists!');
                    }
                });
        }),
    body('confirmPassword').trim().custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Password have to match!');
        }
        return true;
    })
], authController.signup);

router.post('/login', authController.login);


module.exports = router;