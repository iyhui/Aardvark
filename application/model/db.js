const mysql = require('mysql');

// create connection to remote database hosted in ec2 instance
const db = mysql.createConnection({
    host: '3.19.30.6',
    user: 'team01',
    password: 'password',
    database: 'aardvark_db'
})

// connect to the database
db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('Connected to database!');
})

module.exports = db;