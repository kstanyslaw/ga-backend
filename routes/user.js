const express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var router = express.Router();

var sendEmail = require('./email/email-send');
var isEmailValid = require('./email/email-valid');

const User = require('../models/user');

// Login User
router.post('/login', function(req, res, next) {
    User.findOne({ email: req.body.email }, function(err, user) {
        if (err) {
            return res.status(500).json({
                title: "An error occured",
                error: err
            })
        }
        if (!user) {
            return res.status(401).json({
                title: "No user found",
                error: { message: "User could not be found" }
            })
        }
        if (!bcrypt.compareSync(req.body.password, user.password)) {
            return res.status(401).json({
                title: "login failed",
                error: { message: "Invalid password" }
            })
        }
        var token = jwt.sign({ user: user }, 'GQ9UPbT3m3VNfgYd');
        res.status(200).json({
            message: "Succesfully logged in",
            token: token,
            userId: user._id,
            userRole: user.role
        })
    })
})

// Singup User
router.post('/', function(req, res, next) {
    var newUser = new User({
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 10),
        role: 'tempUser'
    });
    User.findOne({ email: req.body.email }, function(err, user) {
        if (err) {
            return res.status(500).json({
                title: "An error occured",
                error: err
            })
        }
        if (user) {
            return res.status(401).json({
                title: "Email has token",
                error: { message: "User with this email has allready exist" }
            })
        }
        if (!isEmailValid(req.body.email)) {
            return res.status(401).json({
                title: "Invalid email",
                error: { message: "Given user's email is invalid" }
            })
        }
        newUser.save(function(err, result) {
            if (err) {
                return res.status(500).json({
                    title: "An error occured",
                    error: err
                })
            }
            // if (user) {
            //     return res.status(401).json({
            //         title: "Email has token",
            //         error: { message: "User with this email has allready exist" }
            //     })
            // }
            if (!isEmailValid(req.body.email)) {
                return res.status(401).json({
                    title: "Invalid email",
                    error: { message: "Given user's email is invalid" }
                })
            }
            res.render('confirm-email', { link: ('https://grants-agregator.herokuapp.com/confirm-email/' + result._id) }, (err, html) => {
                if (err) {
                    return res.status(500).json({
                        title: "Email did not send",
                        error: err
                    })
                }
                sendEmail(req.body.email, "Подтверждение адреса электронной почты", html)
            })
            res.status(201).json({
                message: 'User singup'
            })
        })
    })
})

// Send Reset Password Email
router.post('/reset-password', function(req, res, next) {
    User.findOne({ email: req.body.email }, function(err, user) {
        if (err) {
            return res.status(500).json({
                title: "An Error Occured",
                error: err
            })
        }
        if (!user) {
            return res.status(401).json({
                title: "No user found",
                error: { message: "User with this email could not be found" }
            })
        }
        var token = jwt.sign({ user: user }, 'GQ9UPbT3m3VNfgYd');
        res.render('reset-password', { link: ('https://grants-agregator.herokuapp.com/reset-password/' + token) }, (err, html) => {
            if (err) {
                return res.status(500).json({
                    title: "Email did not send",
                    error: err
                })
            }
            sendEmail(req.body.email, "Сброс пароля", html)
        })
        res.status(201).json({
            message: 'Reset password email send'
        })
    })
})

// Change Password
router.patch('/change-password', function(req, res, next) {
    var decoded = jwt.decode(req.body.token);
    User.findById(decoded.user._id, function(err, user) {
        if (err) {
            return res.status(500).json({
                title: "An Error Occured",
                error: err
            })
        }
        if (!user) {
            return res.status(401).json({
                title: "No user found",
                error: { message: "User with this email could not be found" }
            })
        }
        if(req.body.newPassword !== req.body.repeatPassword) {
            return res.status(401).json({
                title: "Passwords doesn't match",
                error: { message: "New password and repeated password does not match" }
            })
        }
        user.password = bcrypt.hashSync(req.body.newPassword, 10);
        user.save(function(err, result) {
            if (err) {
                return res.status(500).json({
                    title: "User's password hasn't update",
                    error: err
                })
            }
            res.status(200).json({
                title: 'Success',
                message: 'Password has allready changed'
            })
        })
    })
})

// Confirm Email
router.patch('/confirm-email', function(req, res, next) {
    User.findById(req.body.userId, function(err, user) {
        if (err) {
            return res.status(500).json({
                title: "An Error Occured",
                error: err
            })
        }
        if (!user) {
            return res.status(401).json({
                title: "No user found",
                error: { message: "User could not be found" }
            })
        }
        if (user.role != 'tempUser') {
            return res.status(401).json({
                title: "User has already verified mail",
                error: { message: "User has already verified mail" },
            })
        }
        user.role = 'user'
        user.save(function(err, result) {
            if (err) {
                return res.status(500).json({
                    title: "User's role hasn't update",
                    error: err
                })
            }
            res.status(200).json({
                title: 'Success',
                message: 'Email confirmed, role update'
            })
        })
    })
})

// Check Email for singup and login
router.post('/check-email', function(req, res, next) {
    User.findOne({ email: req.body.email }, function(err, email) {
        if (err) {
            return res.status(500).json({
                title: "An Error Occured",
                error: err
            })
        }
        if (email) {
            return res.status(200).json({
                title: "Email has been occupied",
                message: { message: "Somebody has token this email" },
                result: true
            })
        }
        res.status(200).json({
            title: "Email is free",
            message: "You can SingUp with this email",
            result: false
        })
    })
})

module.exports = router;