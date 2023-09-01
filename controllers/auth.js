const { validationResult, Result } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

exports.signup = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error = new Error('Validation failed.');
            error.statusCode = 422;
            error.data = errors.array();
            throw error;
        }
        const email = req.body.email;
        const username = req.body.username;
        const password = req.body.password;

        // first registered user is an administrator
        const isFirstAccount = (await User.countDocuments({})) === 0;
        const role = isFirstAccount ? 'administrator' : 'user';

        const hashedPw = await bcrypt.hash(password, 12);
        const user = new User({
            email: email,
            password: hashedPw,
            username: username,
            role: role
        });
        const result = await user.save();
        res.status(201).json({ message: 'User Created!', userId: result._id })
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.login = async (req, res, next) => {
    const { username, password } = req.body;

    let loadedUser;
    try {
        const user = await User.findOne({ username: username });
        if (!user) {
            const error = new Error('Username cannot be found.');
            error.statusCode = 401;
            throw error;
        }
        loadedUser = user;
        const isEqual = await bcrypt.compare(password, user.password);
        if (!isEqual) {
            const error = new Error('Wrong password!');
            error.statusCode = 401;
            throw error;
        }
        const token = jwt.sign(
            { username: loadedUser.username, userId: loadedUser._id.toString(), role: loadedUser.role },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '24h' }
        )
        res.status(200).json({ token: token, userId: loadedUser._id.toString() });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};