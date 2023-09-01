const jwt = require('jsonwebtoken');
const User = require("../models/user");

module.exports.isAuth = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        if (!authHeader) {
            const error = new Error('Not authenticated');
            error.statusCode = 401;
            throw error;
        }
        const token = req.get('Authorization').split(' ')[1];
        let decodedToken;

        decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        if (!decodedToken) {
            const error = new Error('Not authenticated.');
            error.statusCode = 401;
            throw error;
        }
        req.userId = decodedToken.userId;
        req.role = decodedToken.role;
        req.user = await User.findById(decodedToken.userId);
        next();
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

module.exports.authorizePermissions = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            const error = new Error('Unauthorized to access this route');
            error.statusCode = 401;
            throw error;
        };
        next();
    }
}