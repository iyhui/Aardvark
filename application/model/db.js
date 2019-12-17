const mysql = require('mysql');

// create connection to remote database hosted in ec2 instance
const db = mysql.createConnection({
    host: '3.136.156.1',
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
