const express = require ('express');
const sqlRouter = express.Router();
const db = require('../model/db.js');
const bodyparser = require('body-parser');
const init = require('../model/init.js');

// parser to parse request body form-data
let parser = bodyparser.urlencoded({extended: false});

let app = express();
app.use(parser);

// if go straight to searchResults page via URL, no data is passed onto views
sqlRouter.get("/", (req, res) => {
    res.render("results", {
        searchTerm: "",
        searchResults: "",
        type: ""
    })
});

// search bar action type is POST
sqlRouter.post("/", parser, (req,res) => {

    // get request body form-data from index.ejs 
    let searchTerm = req.body.search;
    let type = req.body.type;

    // search logic
    // status=1 for approved items
    let query = "SELECT * FROM item;";
    if (searchTerm != '' && type != ''){
        query = `SELECT * FROM item WHERE status=1 AND type="${type}" AND ( name LIKE "%${searchTerm}%" OR description LIKE "%${searchTerm}%");`
    }
    else if (searchTerm != '' && type == ''){
        query = `SELECT * FROM item WHERE status=1 AND name LIKE "%${searchTerm}%" OR description LIKE "%${searchTerm}%";`
    }
    else if (searchTerm == '' && type != ''){
        query = `SELECT * FROM item WHERE status=1 AND type="${type}";`
    }

    // print db query for debugging purposes
    console.log(query);

    // db query to get results
    db.query(query, (err, result) => {
        if (err) {
            console.log(err);
            // data is null in case of error
            req.searchResult = "";
            req.searchTerm = "";
            req.type = "";
        }

        req.searchResult = result;
        req.searchTerm = searchTerm;
        req.type = type;

        // print results for debugging purposes
        console.log(`searchTerm: ${searchTerm}, type: ${type}`);
        // console.log(result);

        // these are what passed into results.ejs
        // searchTerm for what was typed into the search bar
        // type for the type selected, null if All Types
        // searchResults is the array of items. 
        var imgblobs = [];
        for(var i = 0; i<result.length; i++) {
            imgblobs [i] = new Buffer( result[i].itemImage, 
                'binary').toString('base64');
          }
        // console.log(req.searchResult);
        res.render("results", {
            page: "home",
            searchTerm: req.searchTerm,
            searchResults: req.searchResult,
            imgblobs: imgblobs,
            type: req.type
        })
    })
})

// for testing
sqlRouter.route('/tables').get((req, res) => {
    (async () => {
      await init.CreateTables();
      res.send('Created Tables.');
    })();
  });

// for testing
 sqlRouter.route('/insert').get((req, res) => {
    (async () => {
      await init.InsertDummy();
      res.send('Inserted Data');
    })();
  });

module.exports = sqlRouter;
