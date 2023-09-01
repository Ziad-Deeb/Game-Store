const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new mongoose.Schema({
    // Basic user information
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },

    // Additional profile information
    first_name: { type: String, trim: true },
    last_name: { type: String, trim: true },
    country: {
        type: String,
        max: 50,
    },
    gender: { type: String },
    avatar: { type: String },
    bio: { type: String, trim: true },
    birthdate: { type: Date },

    // Friends list and social connections
    followers: {
        type: Array,
        default: [],
    },
    followings: {
        type: Array,
        default: [],
    },

    // User role
    role: { type: String, enum: ['administrator', 'publisher', 'user'], default: 'user' }

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);