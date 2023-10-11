
const Order = require('../models/order');
const Product = require('../models/product');
const mongoose = require('mongoose');


exports.orders_get_all = (req, res, next) => {
    console.log(`This is the auth user ${JSON.stringify(req.userData)}`)
    Order.find()
        .select('_id user quantity product')
        .populate('product', '_id name price')
        .populate('user', '_id email')
        .exec()
        .then(orders => {
            console.log(orders);
            res.status(200).json({
                count: orders.length,
                order: orders
            });
        })
        .catch(err => {
            console.log(err);
            try {
                res.status(500).json({
                    message: 'An error occurred while',
                    error: err.message,
                });

            } catch (err) {
                // 
            }
        });
}

exports.orders_create_orders = (req, res, next) => {
    Product.findById(req.body.productId)
        .exec()
        .then(product => {
            console.log(`This is product ${product}`);
            if (!product) {
                res.status(404).json({
                    message: 'Product not found'
                });
            }
            const order = new Order({
                _id: new mongoose.Types.ObjectId(),
                user: req.userData.user._id,
                product: req.body.productId,
                quantity: req.body.quantity,
            });
            console.log(`This is order ${order}`);
            return order.save();
        }).then(result => {
            console.log(result);
            res.status(200).json({
                message: "Order saved successfully",
                createdOrder: {
                    _id: result._id,
                    product: result.product,
                    quantity: result.quantity,
                },
                request: {
                    type: 'GET',
                    url: `http://localhost:3000/orders/${result._id}`
                }
            });
        })
        .catch(err => {
            try {
                console.log(err);
                res.status(500).json({ error: err.message });
            } catch (err) {
                // Ignore any errors that occur inside the catch block
            }
        });
}

exports.orders_get_order = (req, res, next) => {
    Order.findById(req.params.orderId)
        .select('id product quantity')
        .populate('product', 'name price')
        .exec()
        .then(order => {
            res.status(200).json({
                order: order,
                request: {
                    type: 'GET',
                    url: `http://localhost:3000/orders/${req.params.orderId}`
                }
            });
        })
        .catch(err => {
            res.status(500).json({
                error: err.message
            });
        });
}

exports.orders_delete_order = (req, res, next) => {
    Order.findByIdAndDelete({ _id: req.params.orderId })
        .exec()
        .then(msg => {
            console.log(msg);
            if (!msg) {
                res.status(404).json({
                    message: `Order ${req.params.orderId} not found`
                });
            }
            res.status(200).json({
                message: msg
            });
        })
        .catch(err => {
            console.log(err.message);
            try {
                res.status(500).json({
                    message: err.message,
                });
            } catch (err) {
                // 
            }
        });
}