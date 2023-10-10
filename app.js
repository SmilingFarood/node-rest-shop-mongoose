const express = require('express');
const app = express();
const morgan = require('morgan');

const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const productRoute = require('./api/routes/products');
const ordersRoute = require('./api/routes/orders');
const userRoutes = require('./api/routes/user');


mongoose.connect('mongodb+srv://node-shop:' + process.env.MONGO_ATLAS_PW + '@node-rest-shop.rpfhufk.mongodb.net/?retryWrites=true&w=majority&appName=AtlasApp', {
    // useMongoClient: true,

});

mongoose.Promise = global.Promise;

app.use(morgan('dev'));
app.use('/uploads', express.static('uploads'));
app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

// Using headers
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Authorization");
    if (req.method === "OPTIONS") {
        res.header("Access-Control-Allow-Methods", "PUT, POST, DELETE, PATH, GET");
        return res.status(200).json({});
    }
    next();
})

// Routes
app.use('/products', productRoute);
app.use('/orders', ordersRoute);
app.use('/users', userRoutes);


// Creating error handlers
app.use((req, res, next) => {
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
});


// Using error handlers
app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});

module.exports = app;