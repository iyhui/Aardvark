var express = require("express");
var app = express();
var router = express.Router();
var path = __dirname + '/html/';

router.use(function (req,res,next) {
  console.log("/" + req.method);
  next();
});

router.get("/",function(req,res){
  res.sendFile(path + "index.html");
});

router.get("/about",function(req,res){
  res.sendFile(path + "about.html");
});
router.get("/aboutAlan",function(req,res){
  res.sendFile(path + "aboutAlan.html");
  
});
router.get("/alanjpg", function (req, res) {
  res.sendFile(path + "images/alan.jpg");
});
router.get("/aboutDaisy",function(req,res){
  res.sendFile(path + "aboutDaisy.html");
});
router.get("/aboutJonathan",function(req,res){
  res.sendFile(path + "aboutJonathan.html");
});
router.get("/contact",function(req,res){
  res.sendFile(path + "contact.html");
});

app.use("/",router);

app.use("*",function(req,res){
  res.sendFile(path + "404.html");
});

app.listen(3000,function(){
  console.log("Live at Port 3000");
});

