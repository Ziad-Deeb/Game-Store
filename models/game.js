const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const systemRequirementsSchema = new Schema({
    osVersion: {
        type: String
    },
    cpu: {
        type: String
    },
    memory: {
        type: String
    },
    gpu: {
        type: String
    },
    storage: {
        type: String
    }
});


const gameSchema = new Schema({
    title: {
        type: String,
        required: false
    },
    titleSlug: {
        type: String,
    },
    description: {
        type: String,
        required: false
    },
    developer: {
        type: String,
        required: false
    },
    publisher: {
        type: String,
        required: false
    },
    releaseDate: {
        type: Date,
        required: false
    },
    initialRelease: {
        type: Date,
        required: false
    },
    platforms: {
        type: [String],
        enum: ['Windows', 'Mac OS'],
        required: false
    },
    systemRequirements: {
        windows: {
            min: {
                type: systemRequirementsSchema
            },
            recommended: {
                type: systemRequirementsSchema
            }
        },
        macOs: {
            min: {
                type: systemRequirementsSchema
            },
            recommended: {
                type: systemRequirementsSchema
            }
        }
    },
    keyImage: {
        type: String,
        required: false
    },
    screenshots: {
        type: [String],
        required: false
    },
    video: {
        type: String
    },
    changelog: {
        type: String,
        required: false
    },
    price: {
        type: Number,
        required: false
    },
    salePrice: {
        type: Number
    },
    players: {
        type: [Schema.Types.ObjectId],
        ref: 'User',
        default: []
    },
    genres: {
        type: [String],
        enum: ['Action', 'Action-Adventure', 'Adventure', 'Card Game', 'Casual', 'City Builder', 'Comedy', 'Dungeon Crawler', 'Exploration', 'Fantasy', 'Fighting', 'First Person', 'Horror', 'Indie', 'MOBA', 'Music', 'Narration', 'Open World', 'Party', 'Platformer', 'Puzzle', 'Racing', 'Retro', 'Rogue-Lite', 'Shooter', 'Simulation', 'Space', 'Sports', 'Stealth', 'Strategy', 'Survival', 'Tower Defense', 'Trivia', 'Turn-Based', 'Turn-Based Strategy'],
        default: []
    },
    features: {
        type: [String],
        enum: ['Achievements', 'Alexa Game Control', 'Cloud Saves', 'Co-op', 'Competitive', 'Controller Support', 'Cross Platform', 'MMO', 'Multiplayer', 'Single Player', 'VR'],
        default: []
    },
    gameFile: {
        type: String
    },
    sales: {
        type: Number,
        default: 0
    },
    popularity: {
        type: Number,
        default: 0
    },
    numOfWishers: {
        type: Number,
        default: 0
    },
    room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
    },
    averageRating: {
        type: Number,
        default: 0,
    },
    numOfReviews: {
        type: Number,
        default: 0,
    },
}, { timestamps: true });

gameSchema.virtual('gameReviews', {
    ref: 'Review',
    localField: '_id',
    foreignField: 'game',
    justOne: false,
});

gameSchema.pre('remove', async function (next) {
    await this.model('Review').deleteMany({ game: this._id });

    await this.model('Wishlist').updateMany({}, { $pull: { games: this._id } });
});

const Game = mongoose.model('Game', gameSchema);

module.exports = Game;