require('dotenv').config();
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');

const gameRoutes = require('./routes/game');
const reviewRoutes = require('./routes/review');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const roomRoutes = require('./routes/room');
const conversationRoutes = require('./routes/conversation');
const wishlistRoutes = require('./routes/wishlist');
const purchaseRoutes = require('./routes/purchase');
const cartRoutes = require('./routes/cart');

const app = express();

const { v4: uuidv4 } = require('uuid');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (file.fieldname === 'keyImage') {
            cb(null, 'images');
        } else if (file.fieldname === 'screenshots') {
            cb(null, 'images');
        } else if (file.fieldname === 'avatar') {
            cb(null, 'images');
        } else if (file.fieldname === 'gameFile') {
            cb(null, 'games');
        } else {
            cb(new Error('Invalid field name'));
        }
    },
    filename: function (req, file, cb) {
        const uniqueFilename = `${uuidv4()}-${file.originalname}`;
        cb(null, uniqueFilename);
    }
});


const fileFilter = (req, file, cb) => {
    if (file.fieldname === 'gameFile') {
        if (file.mimetype === 'application/zip' ||
            file.mimetype === 'application/x-zip-compressed' ||
            file.mimetype === 'application/octet-stream') {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'));
        }
    } else {
        if (
            file.mimetype === 'image/png' ||
            file.mimetype === 'image/jpg' ||
            file.mimetype === 'image/jpeg'
        ) {
            cb(null, true);
        } else {
            cb(null, false);
        }
    }
};

app.use(bodyParser.json());


const multerOptions = {
    storage: storage,
    fileFilter: fileFilter
    // limits: {
    //     fileSize: 10 * 1024 * 1024 // 10 MB limit
    // }
};
app.use(multer(multerOptions).fields([
    { name: 'gameFile', maxCount: 1 },
    { name: 'keyImage', maxCount: 1 },
    { name: 'screenshots', maxCount: 10 },
    { name: 'avatar', maxCount: 1 }
]));

app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    next();
});

app.use('/auth', authRoutes);
app.use(gameRoutes);
app.use('/reviews', reviewRoutes);
app.use(userRoutes);
app.use(roomRoutes);
app.use(conversationRoutes);
app.use('/cart', cartRoutes);
app.use('/wishlist', wishlistRoutes);
app.use(purchaseRoutes);

app.use((req, res, next) => {
    res.status(404).send('Page not found');
});

app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({ message: message, data: data });
});

const PORT = process.env.PORT || 8080;

mongoose.connect(process.env.MONGODB_URI)
    .then((result) => {
        console.log("Database Connected!");
        const server = app.listen(PORT);
        const io = require('./socket').init(server, {
            cors: {
                origin: "http://localhost:3000",
                methods: ["GET", "POST", "PUT", "DELETE"]
            }
        });
    }).catch((err) => {
        console.log(err);
    });