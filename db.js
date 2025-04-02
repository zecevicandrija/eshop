const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'bjsvouylmihkqnuonfbp-mysql.services.clever-cloud.com',
  user: 'uhazjml1s8jp1cen',
  password: 'amlFKdYqOrxYZS4vrXP1',
  database: 'bjsvouylmihkqnuonfbp'
});

module.exports = pool.promise();
