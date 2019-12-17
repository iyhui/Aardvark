const express = require("express");
const about_routes = require('./routes/aboutRoutes');
const item_routes = require('./routes/itemRoutes');
const auth_routes = require('./routes/authRoutes');
const dash_routes = require('./routes/dashboardRoutes');
const post_routes = require('./routes/postRoutes');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const passport = require('passport');
const db = require('./model/db.js');
require('./config/passport')(passport); // passport config
const { loggedIn } = require('./model/validator.js'); // to check if user is logged in 

//main server variables
const app = express();
const port = 80;

// express session
app.use(
  session({
    secret: 'secret',
    saveUninitialized: false,
    resave: false,
    cookie: { maxAge: 600000 } // 10 minute-session
  }),
);

// Passport middleware for auth
app.use(passport.initialize());
app.use(passport.session());

// Flash messages for login failure
app.use(flash())

// setup views folder and view engine
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

// allows to call static items in pulic folder such as images
app.use(express.static(__dirname + '/public'));

// routes
app.use('/about', about_routes);
app.use('/searchResults', item_routes);
app.use('/auth', auth_routes);
app.use('/dashboard', dash_routes);
app.use('/post', post_routes);

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

app.use("/contact", (req, res) => {
  res.render("contact",
    {
      page: 'contact',
      loggedin: req.user
    });
});

// helper functions to generate random items from database for homepage
random_item = (items) => {
  return items[Math.floor(Math.random()*items.length)];
}

random_items = (items) => {
  var selected_items = [];
  selected_items[0]= random_item(items);
  
  while (selected_items.length < 7){
    found = false;
    random = random_item(items);

    for(var i=0; i < selected_items.length; i++){
      if(random.id === selected_items[i].id){
        found = true;
        break;
      }
    }
    if(found === false){
      selected_items.push(random);
    }
  }
  // console.log(selected_items.length)
  return selected_items;
}

// homepage
app.use("/", (req, res) => {
  
  // to get a list of items for a carousel display
  let query = "SELECT * FROM item WHERE status =1;";
  db.query(query, (err, result) => {
		if (err) {
			console.log(err);
    }
    var imgblobs = [];

    var randoms = [];
    randoms = random_items(result)

    // console.log(randoms)
		for (var i = 0; i < randoms.length; i++) {
			imgblobs[i] = new Buffer.from(randoms[i].itemImage,
				'binary').toString('base64');
    }
    
    res.render("index",
    {
      page: 'home',
      loggedin: req.user,
      items: randoms,
      itemImages: imgblobs
    });

  });
});

app.use("*", (req, res) => {
  res.render("404.html");
});

app.listen(port, () => {
  console.log("Live at Port " + port);
});