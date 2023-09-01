const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        items: [
            {
                game: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Game',
                    required: true
                },
                price: {
                    type: Number,
                    required: true,
                    min: 0
                },
            }
        ],
        total: {
            type: Number,
            required: true,
            min: 0
        },
        date: {
            type: Date,
            default: Date.now,
            required: true
        }
    },
    {
        timestamps: true
    }
);

function calculatePopularity(sales, averageRating, wishers) {
    const popularity = ((sales + 1) * (averageRating + 1) * (wishers + 1)) / 100;
    return popularity;
}

purchaseSchema.pre('save', async function (next) {
    try {
        // Access the Game model
        const Game = mongoose.model('Game');

        // Update the sales variable for each item in the purchase
        for (const item of this.items) {
            const game = await Game.findById(item.game);

            // Increment the sales variable by 1
            game.sales += 1;

            game.players.push(this.user);

            game.popularity = calculatePopularity(game.sales, game.averageRating, game.numOfWishers);

            await game.save();
        }

        next();
    } catch (err) {
        next(err);
    }
});

module.exports = mongoose.model('Purchase', purchaseSchema);