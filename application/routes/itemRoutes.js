const express = require('express');
const sqlRouter = express.Router();
const db = require('../model/db.js');
const bodyparser = require('body-parser');
const { loggedIn, isLoggedIn } = require('../model/validator.js');
const init = require('../model/init.js');

// parser to parse request body form-data
let parser = bodyparser.urlencoded({ extended: false });

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

// search results
sqlRouter.post("/", parser, (req, res) => {

	// get request body form-data from index.ejs 
	let searchTerm = req.body.search;
	let type = req.body.type;

	// search query, status=1 for approved items
	let query = "SELECT * FROM item WHERE status =1;";
	if (searchTerm != '' && type != '') {
		query = `SELECT * FROM item WHERE status=1 AND type="${type}" AND ( name LIKE "%${searchTerm}%" OR description LIKE "%${searchTerm}%");`
	}
	else if (searchTerm != '' && type == '') {
		query = `SELECT * FROM item WHERE status=1 AND name LIKE "%${searchTerm}%" OR description LIKE "%${searchTerm}%";`
	}
	else if (searchTerm == '' && type != '') {
		query = `SELECT * FROM item WHERE status=1 AND type="${type}";`
	}

	// print db query for debugging purposes
	// console.log(query);

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

		// console.log(`searchTerm: ${searchTerm}, type: ${type}`);

		// convert images
		var imgblobs = [];
		for (var i = 0; i < result.length; i++) {
			imgblobs[i] = new Buffer.from(result[i].itemImage,
				'binary').toString('base64');
		}

		// pass data & results back to frontend
		res.render("results", {
			page: "home",
			searchTerm: req.searchTerm,
			searchResults: req.searchResult,
			imgblobs: imgblobs,
			type: req.type,
			loggedin: req.user
		})
	})
})

// for single item/product page
sqlRouter.get('/:id(\\d+)', parser, (req, res) => {

	query = `SELECT * FROM item WHERE id=${req.params.id};`;

	// console.log(`query for single item: ${query}`);

	db.query(query, (err, result) => {

		if (err) {
			console.log(`error: ${err}`);
			req.result = "";
		}

		req.result = result;
		// console.log(req.result);

		let imgBlob = new Buffer.from(result[0].itemImage, 'binary').toString('base64');

		// approved items
		if (req.result[0].status == 1){
			res.render("product", {
				page: "home",
				item: req.result,
				img: imgBlob,
				loggedin: req.user
			})
		} // unapproved items, only for users to see their items in dashboard
		else if (req.user){
			if(req.result[0].status == 0 && req.user.id == req.result[0].userId){
				res.render("product", {
					page: "home",
					item: req.result,
					img: imgBlob,
					loggedin: req.user
				})
			}
		}
	})
})

// for testing
sqlRouter.route('/tables').get((req, res) => {
	(async () => {
		await init.CreateTables();
		res.send('Created Tables.');
	})();
});

// for testing
sqlRouter.route('/insert').get((req, res) => {
	(async () => {
		await init.InsertDummy();
		res.send('Inserted Data');
	})();
});

module.exports = sqlRouter;