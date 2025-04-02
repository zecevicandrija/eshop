const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'andrija2005',
  database: 'eshop'
});

module.exports = pool.promise();
