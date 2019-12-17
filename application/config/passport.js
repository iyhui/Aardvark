const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const db = require('../model/db.js');
const passport = require('passport');

// configurations for passport (used in post request to /login)
const passportConfig = (passport) => {

    // Strategy used for processing login
    passport.use(new LocalStrategy( ({usernameField: 'email'})
        ,(email, password, done) => {

            // find user in db
            db.query('SELECT * FROM user WHERE email = ?', email, (err, result) => {

                if (err) {
                    console.log(err);
                    return done(err);
                } else {
                    console.log("Login, db query result: ")
                    console.log(result);
                    
                    // user does not exist
                    if (!result || result == null || result.length !== 1) {
                        return done(null, false, { message: 'User does not exist.' });
                    }

                    // user exist, compare password
                    if (bcrypt.compareSync(password, result[0].password)){
                        return done(null, result[0]); // result[0] returns 1 user, result returns an array of 1 user
                    } else {
                        return done(null, false, { message: 'Wrong password.' });
                    }

                }

            });
        })
      );

    // login
    passport.serializeUser(function(user, done) {
        done(null, user);
    });

    // logout
    passport.deserializeUser(function(id, done) {
        done(null, id);
    });
};

module.exports = passportConfig;
