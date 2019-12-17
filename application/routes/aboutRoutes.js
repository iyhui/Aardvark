let express = require('express');
let aboutRouter = express.Router();

// routes to main about page and team member's about pages
aboutRouter.get("/ida", function (req, res) {
    res.render("aboutIda", 
    {page: 'about',
    loggedin: req.user});
});

aboutRouter.get("/alan", function (req, res) {
    res.render("aboutAlan", 
    {page: 'about',
    loggedin: req.user});
});

aboutRouter.get("/russell", function (req, res) {
    res.render("aboutRussell", 
    {page: 'about',
    loggedin: req.user});
});

aboutRouter.get("/ryan", function (req, res) {
    res.render("aboutRyan", 
    {page: 'about',
    loggedin: req.user});
});

aboutRouter.get("/jonathan", function (req, res) {
    res.render("aboutJonathan", 
    {page: 'about',
    loggedin: req.user});
});

aboutRouter.get("/daisy", function (req, res) {
    res.render("aboutDaisy", 
    {page: 'about',
    loggedin: req.user});
});

aboutRouter.get("/sunminder", function (req, res) {
    res.render("aboutSunminder", 
    {page: 'about',
    loggedin: req.user});
});

aboutRouter.route('/').get((req,res) => {
    res.render('about', 
    {page: 'about',
    loggedin: req.user});
});

module.exports = aboutRouter;