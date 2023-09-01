const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    // Blog post details
    title: { type: String, required: true, trim: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    tags: [{ type: String, trim: true }],

    // Blog post metadata
    views: { type: Number, default: 0 },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [{
        content: { type: String, required: true },
        author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now }
    }],

    // Timestamps
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Virtual property to get the number of comments on the blog post
blogSchema.virtual('commentCount').get(function () {
    return this.comments.length;
});

// Export Blog model
module.exports = mongoose.model('Blog', blogSchema);