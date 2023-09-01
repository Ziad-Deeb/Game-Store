const express = require('express');
const { body } = require('express-validator');

const User = require('../models/user');
const userController = require('../controllers/user');
const { isAuth, authorizePermissions } = require('../middleware/auth');

const router = express.Router();

router.get('/admin/users', isAuth, authorizePermissions('administrator'), userController.getAllUsers);

router.delete('/admin/users/:id', userController.deleteUser);

router.get('/friends/:userId', isAuth, userController.getUserFriends);

router.put('/follow/:id', isAuth, userController.followUser);

router.put('/unfollow/:id', isAuth, userController.unfollowUser);

router.put('/user/edit-profile', isAuth, userController.editProfile);

router.put('/user/edit-avatar', isAuth, userController.editAvatar);

router.put('/user/edit-password', isAuth, userController.editPassword);

router.get('/user/profile', isAuth, userController.getUserProfile);

router.get('/user', isAuth, authorizePermissions('administrator'), userController.getSingleUser);

module.exports = router;