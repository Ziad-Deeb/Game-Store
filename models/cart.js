const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
    {
        items: [
            {
                game: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Game',
                },
                price: Number,
            },
        ],
        total: {
            type: Number,
            required: true,
            min: 0,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        expiresAt: {
            type: Date,
            default: Date.now,
            index: { expires: '1d' } // expires in 1 day
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Cart", cartSchema);
