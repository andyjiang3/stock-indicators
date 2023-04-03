const mysql = require('mysql')
const config = require('./config.json')

// Creates MySQL connection using database credential provided in config.json
// Do not edit. If the connection fails, make sure to check that config.json is filled out correctly
const connection = mysql.createConnection({
  host: config.rds_host,
  user: config.rds_user,
  password: config.rds_password,
  port: config.rds_port,
  database: config.rds_db
});
connection.connect((err) => err && console.log(err));

const stocks = async function(req, res) {
    connection.query(`SELECT * FROM Stocks`, (err, data) => {
    if(err || data.length === 0){
      console.log(err);
      res.json({});
    } else {
      res.json(data);
    }
  });
}

const stocksID = async function(req, res) {
  const id = req.params['symbol'];
  connection.query(`
    SELECT * FROM Stocks WHERE symbol = '${id}';
  `, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      res.json(data[0]);
    }
  });
}

const news = async function(req, res) {
  connection.query(`SELECT * FROM News`, (err, data) => {
  if(err || data.length === 0){
    console.log(err);
    res.json({});
  } else {
    res.json(data);
  }
});
}

const market = async function(req, res) {
  connection.query(`SELECT * FROM Market`, (err, data) => {
  if(err || data.length === 0){
    console.log(err);
    res.json({});
  } else {
    res.json(data);
  }
});
}


module.exports = {
    stocks, stocksID, news, market
}