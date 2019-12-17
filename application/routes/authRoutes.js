const express = require('express');
const authRouter = express.Router();
const db = require('../model/db.js');
const bodyparser = require('body-parser');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const { validationResult } = require('express-validator')
const { validateReg, loggedIn, isLoggedIn } = require('../model/validator.js');

// parser to parse request body form-data
let parser = bodyparser.urlencoded({ extended: false });
authRouter.use(parser);

// get login page
authRouter.get('/login', (req, res) => {
	res.render("login",
		{
			page: 'login',
			loggedin: req.user,
			message: req.flash('error'),
		});
});

// post to login page, use passport middleware for authentication
authRouter.post('/login', (req, res, next) => {
	// local auth - uses Strategy defined in passport.js to validate
	passport.authenticate('local', {
		// redirection after login
		successRedirect: '/dashboard/',
		failureRedirect: '/auth/login',
		failureFlash: true,
	})(req, res, next);
});

// logout, redirect to homepage
authRouter.get('/logout', (req, res) => {
	req.logout();
	res.redirect('/');
});

// get register page
authRouter.get('/register', (req, res) => {
	res.render("register", { 
		page: 'register',
		loggedin: req.user 
	});
});

// post to register page, validateReg() uses express-validator to check input
authRouter.post('/register', validateReg(), parser, (req, res) => {

	// validationResult() is part of express-validator, which is used in validateReg
	const err = validationResult(req).array({ onlyFirstError: true });

	// render register page again but with errors
	if (err.length !== 0) {
		res.render("register", {
			page: "register",
			err: err,
			body: req.body,
			loggedin: req.user
		});
		return;
	}

	const { name, email, password, password2, phone, terms } = req.body;
	// console.log(name + ' ' + email + ' ' + password + ' ' + password2 + ' ' + phone + ' ' + terms);

	const hash = bcrypt.hashSync(password, 10); // hash password

	let data = {
		name: name,
		password: hash,
		email: email,
		phone: phone,
		role: 'user',
	};

	// insert user into db, redirects to reg page if fail, login page if success
	db.query("INSERT INTO user SET ?", data, (err, result) => {
		if (err) {
			console.log(err);
			res.redirect('auth/register');
		} else {
			console.log("user id: " + result.insertId);
			res.redirect('/auth/login');
		}
	})

});

module.exports = authRouter;