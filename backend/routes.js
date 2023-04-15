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

// Query #7: Get the upper/lower bollinger on a given period from a given time range of a given stock.
const bollinger = (req, res) => {
  const id = req.params['symbol'];
  const dateStart = req.query.start ?? '2020-10-01'; //note: defaults to earliest date (10/01/2020)
  const dateEnd = req.query.end ?? '2022-07-29'; //note: defaults to latest date (07/29/2022)
  const period = req.query.period ?? 1;

  connection.query(`
  WITH Partitioned_Dates AS (
    SELECT *, NTILE(${period}) OVER ( ORDER BY M.date ) AS bucket_no
    FROM Market M WHERE M.symbol = '${id}' AND M.date >= '${dateStart}' AND M.date <= '${dateEnd}'
), Running_Mean AS (
    SELECT bucket_no, AVG(PD.close) AS mean FROM Partitioned_Dates PD GROUP BY bucket_no
), Running_STD AS (
    SELECT bucket_no, STD(PD.close) AS std FROM Partitioned_Dates PD GROUP BY bucket_no
)
SELECT *, RM.bucket_no, (RM.mean + 2 * RS.std) AS upper_bollinger, (RM.mean - 2 * RS.std) AS lower_bollinger
FROM Partitioned_Dates PD JOIN Running_Mean RM ON PD.bucket_no = RM.bucket_no JOIN Running_STD RS ON RM.bucket_no = RS.bucket_no;
  `, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      res.json(data);
    }
  });
}

// Query 8: Get all data related to a stock for a given date d range and period p (p days before each d in range)
const stockAllInfo = (req,res) => {
  const id = req.params['symbol'];
  const dateStart = req.query.start ?? '2020-10-01'; //note: defaults to earliest date (10/01/2020)
  const dateEnd = req.query.end ?? '2022-07-29'; //note: defaults to latest date (07/29/2022)
  const period = req.query.period ?? 1; //note: defaults to a period of 1

  connection.query(`
  WITH All_Dates AS (
    SELECT M.symbol, M.date FROM Market M JOIN Stock S ON S.symbol = M.symbol JOIN News N ON N.symbol = S.symbol
    WHERE M.date >= '${dateStart}' AND M.date <= '${dateEnd}'
), All_Info AS (
    SELECT * FROM Stock S JOIN Market M ON M.symbol = S.symbol JOIN News N ON N.symbol = M.symbol
)
SELECT AI.*, AD.date AS starting_date FROM All_Dates AD JOIN All_Info AI ON AI.symbol = AD.symbol
WHERE AD.date >= DATE_SUB(AD.date, INTERVAL '${period}' DAY) AND AI.symbol = '${id}';
  `, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      res.json(data);
    }
  });
}


// Query 9: Finds the 10 'hot' stocks for a specified date range
const hotStocks = (req, res) => {
  const dateStart = req.query.start ?? '2020-10-01'; //note: defaults to earliest date (10/01/2020)
  const dateEnd = req.query.end ?? '2022-07-29'; //note: defaults to latest date (07/29/2022)

  connection.query(
    `
  WITH positive_indicators AS (
    SELECT symbol, date, ( (N.news_volume /1000 + N.stock_rumors / 2 + N.analysts_comments / 200 ) * (N.news_positive / 200 - N.news_negative / 40 + N.news_stocks / 100 + N.dividends / 20 + N.corporate_earnings / 100 + N.m_and_a / 150 + N.product_recalls / 80)) AS positive_score
    FROM News N WHERE N.date >= '${dateStart}' and N.date <= '${dateEnd}'
), negative_indicators AS (
    SELECT symbol, date, ( (N.news_volume / 100 + N.stock_rumors / 2 + N.analysts_comments / 200) *(N.adverse_events / 200 + N.personnel_changes / 300)) AS negative_scores
    FROM News N WHERE N.date >= '${dateStart}' AND N.date <= '${dateEnd}'
), news_score AS (SELECT P.symbol, P.date, ((P.positive_score) - (N.negative_scores)) AS news_score
                  FROM positive_indicators P
                           JOIN negative_indicators N ON P.symbol = N.symbol AND P.date = N.date
                  order by news_score DESC
), market_score AS (SELECT date, symbol, ((M.high + M.low) / 2) AS market_score
                    FROM Market M
                    WHERE M.date >= '${dateStart}'
                      AND M.date <= '${dateEnd}'
), total_score AS (
    SELECT M.date, M.symbol, (N.news_score + M.market_score) AS total_score
    FROM market_score M JOIN news_score N ON M.symbol = N.symbol AND M.date = N.date
 ), upticks AS (
                SELECT T1.symbol
                FROM total_score T1 join total_score T2 ON T1.symbol = T2.symbol
                where T1.date =  DATE_ADD(T2.date, INTERVAL 1 DAY) and T1.total_score > T2.total_score


), upticks_sum AS (
     SELECT symbol, count(*) AS upticks FROM upticks U GROUP BY U.symbol
     order by upticks DESC
)
SELECT S.* FROM Stock S LEFT JOIN upticks_sum U ON S.symbol = U.Symbol ORDER BY U.upticks DESC LIMIT 10;
  `,
    (err, data) => {
      if (err || data.length == 0) {
        console.log(err);
        res.json({});
      } else {
        res.json(data);
      }
    }
  );
}

//SELECT S.*, C.price_change FROM Stock S LEFT JOIN price_changes C ON S.symbol = C.symbol ORDER BY price_change;
// Query 10: Return a ranking of stocks whose value has changed the most since the last day (for given date range)
const ranking = (req, res) => {
  const dateStart = req.query.start ?? '2020-10-01'; //note: defaults to earliest date (10/01/2020)
  const dateEnd = req.query.end ?? '2022-07-29'; //note: defaults to latest date (07/29/2022)

  connection.query(
    `
  WITH price_changes AS (
    SELECT M1.symbol, (M1.close - M2.close) AS price_change FROM Market M1 JOIN Market M2 ON M1.symbol = M2.symbol
    WHERE M1.date = DATE_SUB(M2.date, INTERVAL 1 DAY) AND M2.date >= '${dateStart}' AND M1.date <= '${dateEnd}'
    ORDER BY price_change DESC
    LIMIT 100
  )
  select * from price_changes C join Stock S on S.symbol = C.symbol 
  `,
    (err, data) => {
      if (err || data.length == 0) {
        console.log(err);
        res.json({});
      } else {
        res.json(data);
      }
    }
  );
}



module.exports = {
    stocks, stocksID, news, market, stockDayAvg, marketDateRange, stockAvgRange, stockInfoPeriod, volatility, bollinger, stockAllInfo, hotStocks, ranking
}