const db = require('../model/db.js');
const express = require('express');
const postRouter = express.Router();
const bodyparser = require('body-parser');
const passport = require('passport');
const { loggedIn } = require('../model/validator.js'); // to check if user is logged in
 
const fs = require('fs');
const { promisify } = require('util');
const unlinkAsync = promisify(fs.unlink);
 
const multer = require('multer'); //using multer for uploading files
const Jimp = require('jimp');
 
const storage = multer.diskStorage({ //allocate storage for our files
    destination(req, file, cb) {
        cb(null, 'uploads'); //upload the file in the uploads folder
    },
    filename(req, file, cb) {
        cb(null, `${file.fieldname}-${Date.now()}`);
    },
});
 
const imgUpload = multer({ storage });
 
let parser = bodyparser.urlencoded({ extended: true });
//postRouter.use(parser);
 
let app = express();
app.use(parser);
 
// get post page
postRouter.get('/', loggedIn, (req, res) => {
    res.render('post_new',
        {
            page: 'post',
            loggedin: req.user
        });
});
 
//delete item route
postRouter.get('/edit/delete/:id(\\d+)', parser, loggedIn, (req, res) => {
    userId = req.user.id;
    let query = `SELECT * FROM item WHERE id="${req.params.id}"`;
    db.query(query, (err, result) => {
        if (err) {
            console.log(err);
        }
        req.itemInfo = result
        //check only one item recieved from db
        if (result.length != 1) {
            res.redirect('/dashboard')
        }
        item = result[0]
        //check if correct user is logged in
        if (item.userId === userId) {
            //delete item
            let query = `delete from item where id="${req.params.id}"`;
            db.query(query, (err, result) => {
                if (err) {
                    console.log(err);
                }
                res.redirect('/dashboard');
            });
        }
    });
});
 
//edit item route
postRouter.get('/edit/:id(\\d+)', parser, loggedIn, (req, res) => {
 
    let query = `SELECT * FROM item WHERE id="${req.params.id}"`;
 
    //request item info from db
    db.query(query, (err, result) => {
        if (err) {
            console.log(err);
        }
 
        req.itemInfo = result
        //check only one item recieved from db
        if (result.length != 1) {
            res.redirect('/dashboard')
        }
        item = result[0]
        //only allow edit to post owner
        if (req.user.id === item.userId) {
            let imgBlob = new Buffer.from(item.itemImage, 'binary').toString('base64');
 
            res.render('post_edit',
                {
                    itemInfo: req.itemInfo,
                    page: 'post',
                    itemId: item.id,
                    itemName: item.name,
                    itemPrice: item.price,
                    itemCategory: item.type,
                    itemDescription: item.description,
                    itemImage: imgBlob,
                    loggedin: req.user
                });
        }
    });
});
// postRouter.use(parser);
postRouter.post('/edit/:id(\\d+)', loggedIn, parser, (req, res) => {
 
    item = req.body.nameofitem;
    price = req.body.price;
    type = req.body.type;
    description = req.body.description
    console.log(req.body);
 
    //query to db
    let query = `update item set name="${item}",
                price="${price}",
                type="${type}",
                description="${description}"
                 WHERE id="${req.params.id}"`;
 
    // set item info in db
    db.query(query, (err, result) => {
        if (err) {
            console.log(err);
        }
    });
    res.redirect('/dashboard')
});
 
async function makeImage(path) {
    try {
        const imgBuffer = await Jimp.read(path) //use jimp for image processing
            .then(lenna => lenna
                .resize(1000, Jimp.AUTO) //resize image
                .quality(80) //set quality
                .getBufferAsync(Jimp.MIME_JPEG)); //get buffer
        return imgBuffer;
    }
    catch (err) {
        return 'err';
    }
}
 
//when new post submitted, use imgUpload.single() to accept a single file and upload using multer
postRouter.post ("/", loggedIn, parser, imgUpload.single('itemImage'), (req, res)=>{ 
    (async () => {
        let item = req.body.nameofitem;
        let price = req.body.price;
        let itemType = req.body.type;
        let itemD = req.body.item_description;
        console.log(item + " " + price + " " + itemType + " " + itemD);
 
        let itemImage;
        if (req.file) {
            itemImage = await makeImage(req.file.path); //itemImage is created using the makeImage function
        }
 
        //insert post into database based on type
        if (req.body.type == 'texts') {
            let data = {
                userId: req.user.id,
                name: req.body.nameofitem,
                description: req.body.item_description,
                price: req.body.price,
                type: req.body.type,
                status: '1',
                itemImage: itemImage
            };
            console.log(itemImage);
            db.query("INSERT INTO item SET ?", data);
        }
        else if (req.body.type == 'school supplies') {
            let data = {
                userId: req.user.id,
                name: req.body.nameofitem,
                description: req.body.item_description,
                price: req.body.price,
                type: req.body.type,
                status: '1',
                itemImage: itemImage
            };
            console.log(itemImage);
            db.query("INSERT INTO item SET ?", data);
        }
 
        else if (req.body.type == 'home goods') {
            let data = {
                userId: req.user.id,
                name: req.body.nameofitem,
                description: req.body.item_description,
                price: req.body.price,
                type: req.body.type,
                status: '1',
                itemImage: itemImage
            };
            console.log(itemImage);
            db.query("INSERT INTO item SET ?", data);
        }
        res.redirect('/');
        await unlinkAsync(req.file.path); //delete images from the uploads folder
    })();
});
 
module.exports = postRouter;
