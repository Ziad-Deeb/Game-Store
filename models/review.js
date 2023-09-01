const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: true,
        },
        game: {
            type: mongoose.Schema.ObjectId,
            ref: 'Game',
            required: true,
        },
        title: {
            type: String,
            trim: true,
            required: [true, 'Please provide review title'],
            maxlength: 100,
        },
        comment: {
            type: String,
            required: [true, 'Please provide review text'],
        },
        rating: {
            type: Number,
            min: 1,
            max: 5,
            required: [true, 'Please provide rating'],
        },
    },
    { timestamps: true }
);
reviewSchema.index({ game: 1, user: 1 }, { unique: true });

function calculatePopularity(sales, averageRating, wishers) {
    const popularity = ((sales + 1) * (averageRating + 1) * (wishers + 1)) / 100;
    return popularity;
}

reviewSchema.statics.calculateAverageRating = async function (gameId) {
    const result = await this.aggregate([
        { $match: { game: gameId } },
        {
            $group: {
                _id: null,
                averageRating: { $avg: '$rating' },
                numOfReviews: { $sum: 1 },
            },
        },
    ]);

    try {
        await this.model('Game').findOneAndUpdate(
            { _id: gameId },
            {
                averageRating: Math.ceil(result[0]?.averageRating || 0),
                numOfReviews: result[0]?.numOfReviews || 0,
            }
        );

        // Update the popularity after averageRating change
        const game = await this.model('Game').findById(gameId);
        if (game) {
            game.popularity = calculatePopularity(game.sales, game.averageRating, game.numOfWishers);
            await game.save();
        }
    } catch (error) {
        console.log(error);
    }
};

reviewSchema.post('save', async function () {
    await this.constructor.calculateAverageRating(this.game);
});

reviewSchema.post('remove', async function () {
    await this.constructor.calculateAverageRating(this.game);
});

module.exports = mongoose.model('Review', reviewSchema);
