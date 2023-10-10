const mongoose = require('mongoose');
const Product = require('../models/product');


exports.product_create_product = (req, res, next) => {
    const product = new Product(
        {
            _id: new mongoose.Types.ObjectId(),
            name: req.body.name,
            price: req.body.price,
            productImage: req.file.path
        }
    );
    product.save().then(result => {
        const response = {
            message: 'Product saved successfully',
            product: {
                id: result._id,
                name: result.name,
                price: result.price,
            }
        }
        res.status(200).json(response);
    }).catch(err => {
        console.log(err.message);
        res.status(500).json({ error: err.message });
    });
}

exports.product_get_product = (req, res, next) => {
    const id = req.params.productId;
    if (id === 'undefined') {
        return res.status(404).json({
            message: 'Product not found',
        });
    }
    Product.findById(id).select('_id name price productImage').exec().then(product => {
        console.log(product);

        if (product) {
            res.status(200).json({
                message: 'Product found',
                product: product
            });
        } else {
            res.status(404).json({ message: `No valid entry found for ID: ${id}` });
        }

    }).catch(err => {
        res.status(404).json({
            message: `Error from database ${err.message}`,

        });
    });
}

exports.product_get_products = (req, res, next) => {
    Product.find()
        .select('name price _id productImage')
        .exec()
        .then(products => {
            console.log(products);
            const response = {
                message: 'All products found',
                count: products.length,
                products: products.map(product => {
                    return {
                        id: product._id,
                        name: product.name,
                        price: product.price,
                        productImage: `http://localhost:3000/${product.productImage}`,
                        request: {
                            type: 'POST',
                            url: `http://localhost:3000/products/${product._id}`
                        }
                    }
                }),
            }
            res.status(200).json(response);
        }).catch(err => {
            console.log(err);
        });
}

exports.product_update_product = (req, res, next) => {
    const id = req.params.productId;
    console.log(JSON.stringify(req.body));
    Product.findByIdAndUpdate(id, { $set: req.body }, { new: true })
        .exec()
        .then(result => {
            res.status(200).json(result);
        }).catch(err => {
            console.log(err);
            res.status(500).json({ error: err.message });
        });
}

exports.product_delete_product = (req, res, next) => {
    const id = req.params.productId;
    if (id === undefined) {
        return res.status(404).json({
            message: 'Invalid product ID'
        });
    } else {
        // remove is no longer supported by Mongoose. deleteOne or deleteMany is the new default behavior
        Product.findByIdAndDelete({ _id: id }).exec().then((msg) => {
            console.log(`This is message: ${msg}`);
            if (!msg) {
                res.status(404).json({
                    message: 'Product not found'
                });
            }
            res.status(200).json({
                message: msg
            });
        }).catch(err => {
            console.log(`This is error: ${err}`);
            try {
                res.status(500).json({
                    error: `Error deleting product ${err}`
                });
            } catch (err) {

            }
        });

    }
}
