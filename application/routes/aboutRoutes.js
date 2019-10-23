let express = require('express');
let about_routes = express.Router();

about_routes.get("/ida", function (req, res) {
    res.render("aboutIda.html", {page: 'about'});
});

about_routes.get("/alan", function (req, res) {
    res.render("aboutAlan", {page: 'about'});
});

about_routes.get("/russell", function (req, res) {
    res.render("aboutRussell.html", {page: 'about'});
});

about_routes.get("/ryan", function (req, res) {
    res.render("aboutRyan.html", {page: 'about'});
});

about_routes.get("/jonathan", function (req, res) {
    res.render("aboutJonathan.html", {page: 'about'});
});

about_routes.get("/daisy", function (req, res) {
    res.render("aboutDaisy", {page: 'about'});
});

about_routes.get("/sunminder", function (req, res) {
    res.render("aboutSunminder.html", {page: 'about'});
});

about_routes.route('/').get((req,res) => {
    res.render('about', {page: 'about'});
    //res.sendFile(path + "index.html");
});

/*
about_routes.get('/style', function(req, res) {
    res.sendFile(path + 'style.css');
    });

    about_routes.get("/contact",function(req,res){
    res.sendFile(path + "contact.html");
}); */

module.exports = about_routes;