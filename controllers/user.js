const User = require('../models/user');
const Cart = require('../models/cart');
const Game = require('../models/game');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

exports.getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find({}).select('username name email role');
        res.status(200).json({ message: 'Fetched users successfully.', users: users });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }

};

exports.deleteUser = async (req, res, next) => {
    const userId = req.params.id;

    try {
        const user = await User.findById(userId);

        if (!user) {
            const error = new Error('User not found.');
            error.statusCode = 404;
            throw error;
        }

        if (user.role === 'administrator') {
            const error = new Error('Deleting administrator users is not allowed.');
            error.statusCode = 403;
            throw error;
        }

        const deletedUser = await User.findByIdAndRemove(userId);

        res.status(200).json({ message: 'User deleted successfully.', user: deletedUser });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.getSingleUser = async (req, res, next) => {
    try {
        const userId = req.body.userId;
        const user = await User.findById(userId).select('-password');
        if (!user) {
            const error = new Error(`No user with id : ${req.params.id}`);
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({ message: 'Fetched user successfully.', user: user });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.getUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({ message: 'User profile fetched successfully.', user: user });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.editProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }
        const { first_name, last_name, country, gender, bio, birthdate } = req.body;
        user.first_name = first_name;
        user.last_name = last_name;
        user.country = country;
        user.gender = gender;
        user.bio = bio;
        user.birthdate = birthdate;

        const result = await user.save();
        const responseUser = { first_name: result.first_name, last_name: result.last_name, country: result.country, gender: result.gender, bio: result.bio, birthdate: result.birthdate };
        res.status(200).json({ message: 'Profile updated successfully.', user: responseUser });

    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.editAvatar = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }
        let avatar = '';
        if (req.files['avatar']) {
            avatar = req.files['avatar'][0].path.replace("\\", "/");
        }
        user.avatar = avatar;
        await user.save();
        res.status(200).json({ message: 'Avatar updated successfully.', avatar: avatar });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.editPassword = async (req, res, next) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }

        const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordCorrect) {
            const error = new Error('Invalid password');
            error.statusCode = 400;
            throw error;
        }

        if (newPassword !== confirmPassword) {
            const error = new Error('New password and confirm password do not match');
            error.statusCode = 400;
            throw error;
        }
        const hashedPw = await bcrypt.hash(newPassword, 12);
        user.password = hashedPw;
        await user.save();
        res.status(200).json({ message: 'Password changed successfully.' });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.getUserFriends = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }
        const friendIds = user.followings;

        if (!friendIds || friendIds.length === 0) {
            return res.status(200).json({ message: "No friends found" });
        }

        const friends = await User.find({ _id: { $in: friendIds } });

        if (!friends || friends.length === 0) {
            return res.status(200).json({ message: "No friends found" });
        }
        const friendList = friends.map((friend) => {
            const { _id, username, avatar } = friend;
            return { _id, username, avatar };
        });
        res.status(200).json({ message: "Friends retrieved successfully", friends: friendList });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.followUser = async (req, res, next) => {
    try {
        const friendId = req.params.id;
        const userId = req.userId;

        // Check if the friend exists
        const friend = await User.findById(friendId);

        if (!friend) {
            const error = new Error('Friend not found');
            error.statusCode = 404;
            throw error;
        }

        if (userId === friendId) {
            const error = new Error('you can not follow yourself');
            error.statusCode = 403;
            throw error;
        }

        // Check if the user is already following the friend
        if (friend.followers.includes(userId)) {
            return res.status(400).json({ message: "User is already following the friend" });
        }

        // Add the friend to the user's followings array
        const user = await User.findById(userId);
        user.followings.push(friendId);
        await user.save();

        // Add the user to the friend's followers array
        friend.followers.push(userId);
        await friend.save();

        res.status(200).json({ message: "User is now following the friend" });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.unfollowUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        const currentUser = await User.findById(req.userId);
        if (req.params.id === req.userId) {
            const error = new Error("you cant unfollow yourself");
            error.statusCode = 403;
            throw error;
        }
        if (user.followers.includes(req.userId)) {
            await user.updateOne({ $pull: { followers: req.userId } });
            await currentUser.updateOne({ $pull: { followings: req.params.id } });
            res.status(200).json("user has been unfollowed");
        } else {
            res.status(403).json("you dont follow this user");
        }
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};