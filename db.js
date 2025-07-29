const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'undovrbas.com',
  user: 'undovrba_andrija',
  password: 'andrija2005',
  database: 'undovrba_eshop3'
});

module.exports = pool.promise();
