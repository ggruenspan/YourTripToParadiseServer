// app\user\userAPI.js

const express = require('express');
const passport = require('passport');

const userController = require('./userController.js');
// const { isAuthenticated } = require('../utility/authMiddleware.js');

const router = express.Router();

/* 
    @route  /api/register
    @desc   Register users
    @access public
*/
router.post('/register', function(req,res) {
    // console.log('register');
    userController.register(req, res);
});

/* 
    @route  /api/signIn
    @desc   Signs in users
    @access public
*/
router.post('/signIn', function(req,res) {
    // console.log('signIn');
    userController.signIn(req, res);
});

/* 
    @route  /api/signOut
    @desc   Signs out users
    @access public
*/
router.post('/signOut', function(req,res) {
    // console.log('signOut');
    res.clearCookie('token');
    res.status(200).json('Logged out successfully');
});

/* 
    @route  /api/forgot-password
    @desc   Allows users to reset their password
    @access public
*/
router.post('/forgot-password', function(req,res) {
    // console.log('forgot-password');
    userController.forgotPassword(req, res);
});

/* 
    @route  /api/reset-password/:token
    @desc   Resets the users password
    @access public
*/
router.post('/reset-password/:token', function(req,res) {
    // console.log('reset-password');
    userController.resetPassword(req, res);
});

module.exports = router;
