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


// Get all stocks from Stocks table
const stocks = async function(req, res) {
    connection.query(`SELECT * FROM Stock`, (err, data) => {
    if(err || data.length === 0){
      console.log(err);
      res.json({});
    } else {
      res.json(data);
    }
  });
}

//Get all news from News table
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

//Get all data from Market table
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

// Query 1: Find all information of the relevant stock (by stock symbol)
const stocksID = async function(req, res) {
  const id = req.params['symbol'];
  connection.query(`
    SELECT * FROM Stock WHERE symbol = '${id}';
  `, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      res.json(data);
    }
  });
}

// Query 2: Get all the news data for a specific stock on a specific date
const stockDayAvg = async function(req, res) {
  const id = req.params['symbol'];
  const date = req.query.date ?? '2020-10-01'; //note: defaults to 10/01/2020

  connection.query(`
  SELECT *, ((M.high + M.low)/2) as day_avg_from
  FROM Stock S JOIN Market M ON S.symbol = M.symbol
  WHERE M.date = '${date}' AND M.symbol = '${id}';
  `, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      res.json(data);
    }
  });
}

// Query 3: Get all the market data within a specific date range
const marketDateRange = async function(req, res) {
  const dateStart = req.query.start ?? '2020-10-01'; //note: defaults to earliest date (10/01/2020)
  const dateEnd = req.query.end ?? '2022-07-29'; //note: defaults to latest date (07/29/2022)

  connection.query(`
  SELECT * FROM Stock S JOIN Market M ON S.symbol = M.symbol
  WHERE M.date >= '${dateStart}' AND M.date <= '${dateEnd}';
  `, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      res.json(data);
    }
  });
}

// Query 4: Get the average price of a specific stock for a given range of time
const stockAvgRange = async function(req, res) {
  const id = req.params['symbol'];
  const dateStart = req.query.start ?? '2020-10-01'; //note: defaults to earliest date (10/01/2020)
  const dateEnd = req.query.end ?? '2022-07-29'; //note: defaults to latest date (07/29/2022)

  connection.query(`
  SELECT *, ((M.high + M.low)/2) as day_avg FROM
  Stock S JOIN Market M ON S.symbol = M.symbol
  WHERE M.date >= '${dateStart}' AND M.date <= '${dateEnd}' AND M.symbol = '${id}';
  `, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      res.json(data);
    }
  });
}

// Query 5: Get the Market, Stock, and News data of a specific stock from before a specific date
const stockInfoPeriod = async function(req, res) {
  const id = req.params['symbol'];
  const date = req.query.date ?? '2022-07-29'; //note: defaults to latest date (07/29/2022)
  const period = req.query.period ?? 1; //note: defaults to 1

  connection.query(`
  SELECT * FROM Stock S JOIN Market M ON S.symbol = M.symbol JOIN News N ON N.symbol = M.symbol
  WHERE S.symbol = '${id}' AND M.date <= '${date}' ORDER BY M.date DESC LIMIT ${period};
  `, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      res.json(data);
    }
  });
}

// Query 6: Get the volatility of all stocks within a given time range
const volatility = async function(req, res){
  const dateStart = req.query.start ?? '2020-10-01'; //note: defaults to earliest date (10/01/2020)
  const dateEnd = req.query.end ?? '2022-07-29'; //note: defaults to latest date (07/29/2022)

  connection.query(`
  WITH DayPrices AS (
    SELECT *, ((M.high + M.low)/2) AS day_price
    FROM Market M WHERE M.date >= '${dateStart}' AND M.end <= '${dateEnd}'
), Mean AS (
    SELECT *, AVG(D.day_price) AS mean FROM DayPrices D GROUP BY D.symbol
), Differences AS (
    SELECT *, (D.day_price- M.mean) AS difference
    FROM DayPrices D JOIN Mean M ON D.symbol = M.symbol
    WHERE D.date >= '${dateStart}' AND D.end <= '${dateEnd}'
)
SELECT D2.symbol, SUM(sqrt(D2.difference * D2.difference)) AS volatility FROM Differences D2 GROUP BY D2.symbol;
  `, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      res.json(data);
    }
  });
}



module.exports = {
    stocks, stocksID, news, market, stockDayAvg, marketDateRange, stockAvgRange, stockInfoPeriod, volatility
}