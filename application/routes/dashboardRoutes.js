const express = require('express');
const dashboardRouter = express.Router();
const db = require('../model/db.js');
const bodyparser = require('body-parser');
const passport = require('passport');
const { loggedIn } = require('../model/validator.js'); // to check if user is logged in
 
// parser to parse request body form-data
let parser = bodyparser.urlencoded({ extended: false });
 
let app = express();
app.use(parser);
 
// get dashboard page
dashboardRouter.get('/', loggedIn, (req, res) => {
 
    var imgblobs = [];
    let itemsquery = `SELECT * FROM item WHERE userId="${req.user.id}"`;
    var userItems = [];
    db.query(itemsquery, (err, result) => {
        if (err) {
            console.log(err);
        }
 
        req.userItems = result;
        userItems = result;
 
 
        for (var i = 0; i < result.length; i++) {
            imgblobs[i] = new Buffer.from(result[i].itemImage,
                'binary').toString('base64');
        }
    });
 
    let data = `select item.name as itemName, item.userId, message.mess_id, item_id, message.meeting_location, message.content, user.name, user.id from message join item on item.id = item_id join user on message.user_id = user.id where item_id IN (select id from item where user_Id = "${req.user.id}" or userId = "${req.user.id}")`;
 
    db.query(data, req.user.id, function (err, messages) {
        //  console.log(messages);
        res.render('dashboard', {
 
            page: 'dashboard',
            userItems: userItems,
            imgblobs: imgblobs,
            loggedin: req.user,
            loggedin: req.user,
            authorized: req.user.id,
            messages: messages
        })
    });
 
});
 
//when the user clicks on contact seller and types a message use this route to insert message and meeting location from user to the database
dashboardRouter.post("/item/:id/message", loggedIn, parser, (req, res) => {
    // console.log("USER ID IS: " + req.user.id+ " ITEM ID " + req.params.id + " meeting location is " + req.body.meetingLoc + " in the MESSAGE "  + req.body.contentBody);
 
    if (req.body.meetingLoc != " ") {
        let data = {
            user_id: req.user.id,
            item_id: req.params.id,
            meeting_location: req.body.meetingLoc,
            content: req.body.contentBody
        };
        db.query("INSERT INTO message SET ?", data); 
    }
 
    res.redirect('/');
});
 
//render the message page to chat once the user clicks on a message under Messages in the dashboard
dashboardRouter.get('/:id/:name/:message', loggedIn, parser, (req, res) => {
 
    //run the query to get messages that were sent between the seller and the user
    let data = `select user.name, message.content, message.item_id, message.user_id, resp.response_body, resp.user__id, resp.message_id  from resp join message on mess_id  = "${req.params.id}" and message_id = "${req.params.id}" join user on user.id = user__id where item_id IN (select id from item where user_Id = "${req.user.id}" or userId = "${req.user.id}")`;
 
    db.query(data, req.user.id, function (err, response) {
        res.render("message", {
            page: 'message',
            response: response,
            loggedin: req.user,
            initialUsername: req.params.name,
            initialMessage: req.params.message,
            paramId: req.params.id
        })
    });
 
});
 
//insert message to the db that the user types in the message(chat) page
dashboardRouter.post('/item/:id', loggedIn, parser, (req, res) => {
 
    let data = {
        response_body: req.body.message,
        message_id: req.params.id,
        user__id: req.user.id
    };
    db.query("INSERT INTO resp SET ?", data);
 
    res.redirect('/');
});
 
dashboardRouter.get('/delete/:id', loggedIn, (req, res) => {
    
    let q1 = `delete from resp where message_id = ${req.params.id}`;
    let q2 = `delete from message where mess_id = ${req.params.id}`;
    // console.log("IN DELETE MESSAGE " + req.params.id);
    
    db.query(q1, function(err, result) {
 
        db.query(q2, function(err, results) {
            res.redirect('/dashboard');
        })
    });
 
});
 
module.exports = dashboardRouter;
