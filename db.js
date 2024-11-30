const mysql = require('mysql');

const db = mysql.createConnection({
    host: 'eshopovic-host.render.com',
    user: 'root',
    password: 'andrija2005',
    database: 'Eshop',
    port: 3306
});

module.exports = db;