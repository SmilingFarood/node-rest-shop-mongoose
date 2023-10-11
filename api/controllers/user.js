const mongoose = require('mongoose');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


exports.user_signup = (req, res, next) => {
    const { email, password } = req.body;
    if (email) {
        User.findOne({ email: email }).then(user => {
            if (user) {
                res.status(422).json({
                    message: 'Email already exists',
                });
            } else {
                bcrypt.hash(password, 10, (err, data) => {
                    if (err) {
                        console.log(err);
                        res.status(500).json({ error: err });
                    } else {
                        const user = new User({
                            _id: new mongoose.Types.ObjectId(),
                            email: email,
                            password: data
                        });
                        user.save()
                            .then(user => {
                                console.log(user);
                                res.status(200).json({
                                    message: 'User saved successfully',
                                    user: user
                                });
                            })
                            .catch(err => {
                                res.status(500).json({ error: err.message });
                            });
                    }
                })
            }
        })
    }
}

exports.user_login = (req, res, next) => {
    const { email, password } = req.body;
    User.findOne({ email: email })
        .select('_id email password')
        .exec()
        .then(user => {
            if (!user) {
                return res.status(401).json({
                    message: 'invalid login credentials',
                });
            } else {
                bcrypt.compare(password, user.password, (err, result) => {
                    if (err) {
                        return res.status(401).json({
                            message: 'invalid login credentials',
                        });
                    } else if (result) {

                        jwt.sign({ user: user }, process.env.JWT_KEY, { expiresIn: "48h" }, (err, token) => {
                            if (err) {
                                return res.status(401).json({
                                    message: err.message,
                                });
                            } else if (token) {
                                const response = {
                                    id: user._id,
                                    email: user.email,

                                };
                                return res.status(200).json({
                                    token: token,
                                    user: response,
                                });
                            } else {
                                return res.status(401).json({
                                    message: err.message,
                                });
                            }

                        })
                    } else {
                        return res.status(401).json({
                            message: 'invalid login credentials',
                        });
                    }
                })
            }
        })
        .catch(err => {
            try {
                return res.status(500).json({
                    message: err.message,
                });
            } catch (err) {
                // 
            }
        });
}

exports.user_get_all_users = (req, res, next) => {
    User.find()
        .select('_id email')
        .exec()
        .then(users => {
            res.status(200).json({
                users: users
            });
        })
        .catch(err => {
            res.status(500).json({ error: err });
        });
}

exports.user_delete_user = (req, res, next) => {
    User.findByIdAndDelete(req.params.userId)
        .exec()
        .then(doc => {
            res.status(200).json({
                message: `Delete user with id ${doc.email} successfully`,
                document: doc,
            });
        })
        .catch(err => {
            res.status(500).json({ error: err.message });
        })
}