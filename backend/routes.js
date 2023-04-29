const mysql = require('mysql')
const config = require('./config.json')

var cache = new Map();


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
    connection.query(`
      SELECT * 
      FROM Stock
    `, (err, data) => {
    if(err || data.length === 0){
      console.log(err);
      res.json({});
    } else {
      res.json(data);
    }
  });
}

// Get all news from News table
const news = async function(req, res) {
  connection.query(`
    SELECT * 
    FROM News
  `, (err, data) => {
  if(err || data.length === 0){
    console.log(err);
    res.json({});
  } else {
    var results = JSON.parse(JSON.stringify(data));
    cache.set(req.url, results);
    if (results == null)
    {
      res.JSON({})
    }
    res.send(results);  
  }
});
}

// Get all news from News table
const specificNews = async function(req, res) {
  const id = req.params["symbol"];
  const dateStart = req.query.start ?? '2020-10-01'; //note: defaults to earliest date (10/01/2020)
  const dateEnd = req.query.end ?? '2022-07-29'; //note: defaults to latest date (07/29/2022)
  connection.query(
    `
    SELECT * 
    FROM News N
    where N.symbol = '${id}' AND N.date >= '${dateStart}' AND N.date <= '${dateEnd}';
  `,
    (err, data) => {
      if (err || data.length === 0) {
        console.log(err);
        res.json({});
      } else {
        res.json(data);
      }
    }
  );
}

//Get all data from Market table
const market = async function(req, res) {
  connection.query(`
    SELECT * 
    FROM Market
  `, (err, data) => {
  if(err || data.length === 0){
    console.log(err);
    res.json({});
  } else {
    var results = JSON.parse(JSON.stringify(data));
    cache.set(req.url, results);
    res.send(results);  
  }
});
}

//Get a random stock (for the home page)
const random = async function(req, res) {
  connection.query(`
      SELECT * 
      FROM Stock ORDER BY RAND() LIMIT 1;
    `, (err, data) => {
    if(err || data.length === 0){
      console.log(err);
      res.json({});
    } else {
      var results = JSON.parse(JSON.stringify(data))[0];
      res.send(results);  
    }
  });
}

// Route 1: Find all information of the relevant stock (by stock symbol)
const stocksID = async function(req, res) {
  const id = req.params['symbol'];
  connection.query(`
    SELECT * 
    FROM Stock 
    WHERE symbol = '${id}';
  `, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      var results = JSON.parse(JSON.stringify(data))[0];
      cache.set(req.url, results);
      res.send(results);  
    }
  });
}

// Route 2: Get all the news data for a specific stock on a specific date
const stockDayAvg = async function(req, res) {
  const id = req.params['symbol'];
  const date = req.query.date ?? '2020-10-01'; //note: defaults to 10/01/2020

  connection.query(`
  SELECT *, ((M.high + M.low)/2) AS day_avg_from
  FROM Stock S 
       JOIN Market M 
         ON S.symbol = M.symbol
  WHERE M.date = '${date}' AND M.symbol = '${id}';
  `, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      var results = JSON.parse(JSON.stringify(data));
      cache.set(req.url, results);
      res.send(results);  
    }
  });
}

// Route 3: Get all the market data within a specific date range
const marketDateRange = async function(req, res) {
  const dateStart = req.query.start ?? '2020-10-01'; //note: defaults to earliest date (10/01/2020)
  const dateEnd = req.query.end ?? '2022-07-29'; //note: defaults to latest date (07/29/2022)

  connection.query(`
  SELECT * 
  FROM Stock S 
       JOIN Market M 
         ON S.symbol = M.symbol
  WHERE M.date >= '${dateStart}' AND M.date <= '${dateEnd}';
  `, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      var results = JSON.parse(JSON.stringify(data));
      cache.set(req.url, results);
      res.send(results);  
    }
  });
}

// Route 4: Get the average price of a specific stock for a given range of time
const stockAvgRange = async function(req, res) {
  const id = req.params['symbol'];
  const dateStart = req.query.start ?? '2020-10-01'; //note: defaults to earliest date (10/01/2020)
  const dateEnd = req.query.end ?? '2022-07-29'; //note: defaults to latest date (07/29/2022)

  connection.query(`
  SELECT *, ((M.high + M.low)/2) as day_avg 
  FROM Stock S 
       JOIN Market M 
         ON S.symbol = M.symbol
  WHERE M.date >= '${dateStart}' AND M.date <= '${dateEnd}' AND M.symbol = '${id}';
  `, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      var results = JSON.parse(JSON.stringify(data));
      cache.set(req.url, results);
      if (results == null) {
        res.JSON([]);
      }
      res.send(results);  
    }
  });
}

// Route 5: Get the Market, Stock, and News data of a specific stock from before a specific date
const stockInfoPeriod = async function(req, res) {
  const id = req.params['symbol'];
  const date = req.query.date ?? '2022-07-29'; //note: defaults to latest date (07/29/2022)
  const period = req.query.period ?? 1; //note: defaults to 1

  connection.query(`
  SELECT * 
  FROM Stock S 
       JOIN Market M 
         ON S.symbol = M.symbol 
       JOIN News N 
         ON N.symbol = M.symbol
  WHERE S.symbol = '${id}' AND M.date <= '${date}' ORDER BY M.date DESC LIMIT ${period};
  `, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      var results = JSON.parse(JSON.stringify(data));
      cache.set(req.url, results);
      res.send(results);  
    }
  });
}

// Route 6: Get the volatility of all stocks within a given time range
const volatility = async function(req, res){
  const dateStart = req.query.start ?? '2020-10-01'; //note: defaults to earliest date (10/01/2020)
  const dateEnd = req.query.end ?? '2022-07-29'; //note: defaults to latest date (07/29/2022)

  connection.query(
    `
  WITH DayPrices AS (
    SELECT *, ((M.high + M.low)/2) AS day_price
    FROM Market M 
    WHERE M.date >= '${dateStart}' AND M.date <= '${dateEnd}'
  ), Mean AS (
      SELECT *, AVG(D.day_price) AS mean 
      FROM DayPrices D 
      GROUP BY D.symbol
  ), Differences AS (
      SELECT D.*, (D.day_price- M.mean) AS difference
      FROM DayPrices D JOIN Mean M ON D.symbol = M.symbol
      WHERE D.date >= '${dateStart}' AND D.date <= '${dateEnd}'
  )
  SELECT S.security, D2.symbol, SUM(sqrt(D2.difference * D2.difference))/count(*) AS volatility 
  FROM Differences D2 join Stock S on S.symbol = D2.symbol
  GROUP BY D2.symbol
  order by volatility DESC;
  `,
    (err, data) => {
      if (err || data.length === 0) {
        console.log(err);
        res.json({});
      } else {
        var results = JSON.parse(JSON.stringify(data));
        cache.set(req.url, results);
        res.send(results);
      }
    }
  );
}

// Route #7: Get the upper/lower bollinger on a given period from a given time range of a given stock.
const bollinger = (req, res) => {
  const id = req.params['symbol'];
  const dateStart = req.query.start ?? '2020-10-01'; //note: defaults to earliest date (10/01/2020)
  const dateEnd = req.query.end ?? '2022-07-29'; //note: defaults to latest date (07/29/2022)
  const period = req.query.period ?? 20;
  const bollingerSide = req.query.side ?? 0;
  const multiplier = req.query.multiplier ?? 1;

  connection.query(`
  WITH All_Dates AS (
    SELECT DISTINCT M.symbol, M.date, M.close
    FROM Market M
    WHERE M.date >= '${dateStart}' AND M.date <= '${dateEnd}'
    AND M.symbol = '${id}'
  ),
  All_Info AS (
      SELECT DISTINCT M.*
      FROM Market M
      WHERE M.date >= DATE_SUB('${dateStart}', INTERVAL ${period - 1} DAY) AND M.date <= '${dateEnd}'
      AND M.symbol = '${id}'
  ),
  Rolling_Data AS (
      SELECT DISTINCT AI.*, AD.date AS starting_date, AD.close as actual
      FROM All_Dates AD
          JOIN All_Info AI
            ON AI.symbol = AD.symbol
      WHERE AI.date >= DATE_SUB(AD.date, INTERVAL ${period - 1} DAY) AND AI.date <= AD.date
  ),
  Rolling_Mean AS (
      SELECT starting_date as date, COUNT(date) AS num_data_points, AVG(close) AS rolling_mean, actual
      FROM Rolling_Data
      GROUP BY starting_date
  ),
  Rolling_STD AS (
      SELECT starting_date as date, COUNT(date) AS num_data_points, STD(close) AS rolling_std
      FROM Rolling_Data
      GROUP BY starting_date
  )
  SELECT Rolling_Mean.date as date, (Rolling_Mean.rolling_mean ${bollingerSide == 0 ? '+' : '-'} 2 * Rolling_STD.rolling_std) as bollinger, Rolling_Mean.actual as actual
  FROM Rolling_Mean
      JOIN Rolling_STD
        ON Rolling_Mean.date = Rolling_STD.date
  `, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      var results = JSON.parse(JSON.stringify(data));
      results = results.map((item) => {
        var threshold = multiplier * item.bollinger
        var buy = bollingerSide == 0 && item.actual > threshold;
        var sell = bollingerSide != 0 && item.actual < threshold;

        return { ...item, buy, sell, close: item.actual };
      });
      cache.set(req.url, results);
      res.send(results);
    }
  });
}

// Route 8: Get all data related to a stock for a given date d range and period p (p days before each d in range)
const stockAllInfo = (req,res) => {
  const id = req.params['symbol'];
  const dateStart = req.query.start ?? '2020-10-01'; //note: defaults to earliest date (10/01/2020)
  const dateEnd = req.query.end ?? '2022-07-29'; //note: defaults to latest date (07/29/2022)
  const period = req.query.period ?? 1; //note: defaults to a period of 1

  connection.query(`
  WITH All_Dates AS (
    SELECT M.symbol, M.date 
    FROM Market M JOIN Stock S ON S.symbol = M.symbol JOIN News N ON N.symbol = S.symbol
    WHERE M.date >= '${dateStart}' AND M.date <= '${dateEnd}'
  ), All_Info AS (
      SELECT * 
      FROM Stock S 
           JOIN Market M 
             ON M.symbol = S.symbol 
           JOIN News N 
             ON N.symbol = M.symbol
  )
  SELECT AI.*, AD.date AS starting_date 
  FROM All_Dates AD 
       JOIN All_Info AI 
         ON AI.symbol = AD.symbol
  WHERE AD.date >= DATE_SUB(AD.date, INTERVAL '${period - 1}' DAY) AND AI.symbol = '${id}';
  `, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      var results = JSON.parse(JSON.stringify(data));
      cache.set(req.url, results);
      res.send(results);  
    }
  });
}


// Route 9: Finds the 10 'hot' stocks for a specified date range
const hotStocks = (req, res) => {
  const dateStart = req.query.start ?? '2020-10-01'; //note: defaults to earliest date (10/01/2020)
  const dateEnd = req.query.end ?? '2022-07-29'; //note: defaults to latest date (07/29/2022)

  connection.query(`
  WITH positive_indicators AS (
    SELECT symbol, date, ( (N.news_volume /1000 + N.stock_rumors / 2 + N.analysts_comments / 200 ) * (N.news_positive / 200 - N.news_negative / 40 + N.news_stocks / 100 + N.dividends / 20 + N.corporate_earnings / 100 + N.m_and_a / 150 + N.product_recalls / 80)) AS positive_score
    FROM News N 
    WHERE N.date >= '${dateStart}' and N.date <= '${dateEnd}'
  ), negative_indicators AS (
    SELECT symbol, date, ( (N.news_volume / 100 + N.stock_rumors / 2 + N.analysts_comments / 200) *(N.adverse_events / 200 + N.personnel_changes / 300)) AS negative_scores
    FROM News N 
    WHERE N.date >= '${dateStart}' AND N.date <= '${dateEnd}'
  ), news_score AS (
    SELECT P.symbol, P.date, ((P.positive_score) - (N.negative_scores)) AS news_score
    FROM positive_indicators P
         JOIN negative_indicators N 
           ON P.symbol = N.symbol AND P.date = N.date
    ORDER BY news_score DESC
  ), market_score AS (
    SELECT date, symbol, ((M.high + M.low) / 2) AS market_score
    FROM Market M
  WHERE M.date >= '${dateStart}' AND M.date <= '${dateEnd}'
  ), total_score AS (
    SELECT M.date, M.symbol, (N.news_score + M.market_score) AS total_score
    FROM market_score M 
          JOIN news_score N 
            ON M.symbol = N.symbol AND M.date = N.date
  ), upticks AS (
    SELECT T1.symbol
    FROM total_score T1 
         JOIN total_score T2 
           ON T1.symbol = T2.symbol
    WHERE T1.date = DATE_ADD(T2.date, INTERVAL 1 DAY) AND T1.total_score > T2.total_score
  ), upticks_sum AS (
    SELECT symbol, count(*) AS upticks 
    FROM upticks U 
    GROUP BY U.symbol
    ORDER BY upticks DESC
  )
  SELECT S.* , U.upticks as upticks
  FROM Stock S 
       LEFT JOIN upticks_sum U 
              ON S.symbol = U.Symbol 
  ORDER BY U.upticks DESC 
  LIMIT 10;
  `,
    (err, data) => {
      if (err || data.length == 0) {
        console.log(err);
        res.json({});
      } else {
        var results = JSON.parse(JSON.stringify(data));
        cache.set(req.url, results)
        res.send(results)  
      }
    }
  );
}


// Route 9: Finds the 10 'hot' stocks for a specified date range
const newsAnalysis = (req, res) => {
  const dateStart = req.query.start ?? '2020-10-01'; //note: defaults to earliest date (10/01/2020)
  const dateEnd = req.query.end ?? '2022-07-29'; //note: defaults to latest date (07/29/2022)
  const id = req.params["symbol"];
  const multiplier = req.query.multiplier ?? 0.5

  connection.query(
    `
  WITH positive_indicators AS (
    SELECT symbol, date, ( (N.news_volume /1000 + N.stock_rumors / 2 + N.analysts_comments / 200 ) * (N.news_positive / 200 - N.news_negative / 40 + N.news_stocks / 100 + N.dividends / 20 + N.corporate_earnings / 100 + N.m_and_a / 150 + N.product_recalls / 80)) AS positive_score
    FROM News N 
    WHERE N.date >= '${dateStart}' and N.date <= '${dateEnd}'
    AND N.symbol = '${id}'
  ), negative_indicators AS (
    SELECT symbol, date, ( (N.news_volume / 100 + N.stock_rumors / 2 + N.analysts_comments / 200) *(N.adverse_events / 200 + N.personnel_changes / 300)) AS negative_scores
    FROM News N 
    WHERE N.date >= '${dateStart}' AND N.date <= '${dateEnd}'
    AND N.symbol = '${id}'
  ), news_score AS (
    SELECT P.symbol, P.date, ((P.positive_score) - (N.negative_scores)) AS news_score
    FROM positive_indicators P
         JOIN negative_indicators N 
           ON P.symbol = N.symbol AND P.date = N.date
    ORDER BY news_score DESC
  ), std_dev AS (
  SELECT STDDEV(N.news_score) as std_dev, avg(N.news_score) as avg
  FROM news_score N)
  select N.*, S.*, M.close
  from news_score N join Market M on M.symbol = N.symbol and M.date = N.date, std_dev S
  `,
    (err, data) => {
      if (err || data.length == 0) {
        console.log(err);
        res.json({});
      } else {
        var results = JSON.parse(JSON.stringify(data));
        results = results.map((item) => {
          var adjust = multiplier * item.std_dev;
          var buy = item.news_score > item.avg + adjust;
          var sell = item.news_score + adjust < item.avg; ;

          return { ...item, buy, sell };
        });
        cache.set(req.url, results);
        res.send(results);
      }
    }
  );
}

//SELECT S.*, C.price_change FROM Stock S LEFT JOIN price_changes C ON S.symbol = C.symbol ORDER BY price_change;
// Route 10: Return a ranking of stocks whose value has changed the most since the last day (for given date range)
const ranking = (req, res) => {
  const dateStart = req.query.start ?? '2020-10-01'; //note: defaults to earliest date (10/01/2020)
  const dateEnd = req.query.end ?? '2022-07-29'; //note: defaults to latest date (07/29/2022)

  connection.query(
    `
  WITH price_changes AS (
    SELECT M1.symbol, (M1.close - M2.close) AS price_change 
    FROM Market M1 
         JOIN Market M2 
           ON M1.symbol = M2.symbol
    WHERE M1.date = '${dateEnd}' AND M2.date = '${dateStart}'
    ORDER BY price_change DESC
    LIMIT 100
  )
  SELECT * 
  FROM price_changes C 
       JOIN Stock S 
         ON S.symbol = C.symbol 
  `,
    (err, data) => {
      if (err || data.length == 0) {
        console.log(err);
        res.json({});
      } else {
        var results = JSON.parse(JSON.stringify(data));
        cache.set(req.url, results);
        res.send(results);
      }
    }
  );
}

// Route 11: Finds the rolling mean for the given stock in the given range of date with given period (window)
const rollingMean = (req, res) => {
  const id = req.params['symbol'];
  const dateStart = req.query.start ?? '2020-10-01'; //note: defaults to earliest date (10/01/2020)
  const dateEnd = req.query.end ?? '2022-07-29'; //note: defaults to latest date (07/29/2022)
  const period = req.query.period ?? 20;

  connection.query(`
  WITH Valid_Dates AS (
    SELECT DISTINCT M.symbol, M.date, M.close
    FROM Market M
    WHERE M.date >= '${dateStart}' AND M.date <= '${dateEnd}'
    AND M.symbol = '${id}'
  ),
  Valid_Range_Dates AS (
      SELECT DISTINCT M.*
      FROM Market M
      WHERE M.date >= DATE_SUB('${dateStart}', INTERVAL ${period - 1} DAY) AND M.date <= '${dateEnd}'
      AND M.symbol = '${id}'
  ),
  Rolling_Data AS (
      SELECT DISTINCT AI.*, AD.date AS starting_date, AD.close as actual
      FROM Valid_Dates AD
          JOIN Valid_Range_Dates AI
            ON AI.symbol = AD.symbol
      WHERE AI.date >= DATE_SUB(AD.date, INTERVAL ${period - 1} DAY) AND AI.date <= AD.date
  )
  SELECT actual as close, starting_date as date, COUNT(date) AS num_data_points, AVG(close) AS rolling_mean
  FROM Rolling_Data
  GROUP BY starting_date
  `,
    (err, data) => {
      if (err || data.length == 0) {
        console.log(err);
        res.json({});
      } else {
        var switched = true;
        var prevPosition = true;
        var results = JSON.parse(JSON.stringify(data));
        results = results.map((item) => {
          var rolling_mean = item.rolling_mean;
          var buy = switched && item.close < rolling_mean;
          var sell = switched && item.close > rolling_mean;
          position = item.close < rolling_mean;
          switched = position != prevPosition;
          prevPosition = position;

          return { ...item, buy, sell };
        });
        cache.set(req.url, results);
        res.send(results);
      }
    }
  );
}


// Route 12: Finds the rolling mean for the given stock in the given range of date with given period (window)
const wieghtedRollingMean = (req, res) => {
  const id = req.params['symbol'];
  const dateStart = req.query.start ?? '2020-10-01'; //note: defaults to earliest date (10/01/2020)
  const dateEnd = req.query.end ?? '2022-07-29'; //note: defaults to latest date (07/29/2022)
  const period = req.query.period ?? 20;

  connection.query(
    `
  WITH Valid_Dates AS (
    SELECT DISTINCT M.symbol, M.date, M.close
    FROM Market M
    WHERE M.date >= '${dateStart}' AND M.date <= '${dateEnd}'
    AND M.symbol = '${id}'
  ),
  Valid_Range_Dates AS (
      SELECT DISTINCT M.*
      FROM Market M
      WHERE M.date >= DATE_SUB('${dateStart}', INTERVAL ${
      period - 1
    } DAY) AND M.date <= '${dateEnd}'
      AND M.symbol = '${id}'
  ),
  Rolling_Data AS (
      SELECT DISTINCT AI.*, AD.date AS starting_date, AD.close as actual, (${period} - DATEDIFF(AD.date, AI.date)) AS weight, AI.close*(${period} - DATEDIFF(AD.date, AI.date)) as value 
      FROM Valid_Dates AD
          JOIN Valid_Range_Dates AI
            ON AI.symbol = AD.symbol
      WHERE AI.date >= DATE_SUB(AD.date, INTERVAL ${
        period - 1
      } DAY) AND AI.date <= AD.date
  )
  SELECT actual as close, starting_date as date, COUNT(date) AS num_data_points, Sum(value)/Sum(weight) AS rolling_mean
  FROM Rolling_Data
  GROUP BY starting_date
  `,
    (err, data) => {
      if (err || data.length == 0) {
        console.log(err);
        res.json({});
      } else {
        var switched = true;
        var prevPosition = true;
        var results = JSON.parse(JSON.stringify(data));
        results = results.map((item) => {
          var rolling_mean = item.rolling_mean;
          var buy = switched && item.close < rolling_mean;
          var sell = switched && item.close > rolling_mean;
          position = item.close < rolling_mean;
          switched = position != prevPosition;
          prevPosition = position;

          return { ...item, buy, sell };
        });
        cache.set(req.url, results)
        res.send(results);
      }
    }
  );
}




const expRollingMean = (req, res) => {
  const id = req.params["symbol"];
  const dateStart = req.query.start ?? "2020-10-01"; //note: defaults to earliest date (10/01/2020)
  const dateEnd = req.query.end ?? "2022-07-29"; //note: defaults to latest date (07/29/2022)
  const period = req.query.period ?? 20;
  const smoothing = req.query.smoothing ?? 2;

  connection.query(
    `
  WITH Valid_Dates AS (
    SELECT DISTINCT M.symbol, M.date
    FROM Market M
    WHERE M.date >= '${dateStart}' AND M.date <= '${dateEnd}'
    AND M.symbol = '${id}'
  ),
  Valid_Range_Dates_sma AS (
      SELECT DISTINCT M.*
      FROM Market M
      WHERE M.date >= DATE_SUB('${dateStart}', INTERVAL ${
      period - 1
    } DAY) AND M.date <= '${dateEnd}'
      AND M.symbol = '${id}'
  ),
  Valid_Range_Dates AS (
      SELECT DISTINCT M.*
      FROM Market M
      WHERE M.date >= DATE_SUB('${dateStart}', INTERVAL ${
      2 * period - 1
    } DAY) AND M.date <= '${dateEnd}'
      AND M.symbol = '${id}'
  ),
  Rolling_Data AS (
      SELECT DISTINCT AI.*, AD.date AS starting_date
      FROM Valid_Dates AD
          JOIN Valid_Range_Dates_sma AI
            ON AI.symbol = AD.symbol
      WHERE AI.date >= DATE_SUB(AD.date, INTERVAL ${
        period - 1
      } DAY) AND AI.date <= AD.date
  ), 
  SMA as (SELECT starting_date as date, COUNT(date) AS num_data_points, AVG(close) AS rolling_mean
          FROM Rolling_Data
          GROUP BY starting_date)
  SELECT D.date as date, S.rolling_mean as rolling_mean, group_concat(A.close) as vals, D.close as actual
  from Valid_Range_Dates D join SMA S on D.date = DATE_ADD(S.date, INTERVAL ${
    2 * period - 1
  } DAY)
        join Valid_Range_Dates_sma A on A.date > DATE_SUB(D.date, INTERVAL ${
          period - 1
        } DAY)
        group by D.date
  `,
    (err, data) => {
      if (err || data.length == 0) {
        console.log(err);
        res.json({});
      } else {
        var switched = true;
        var prevPosition = true;
        var results = JSON.parse(JSON.stringify(data));
        results = results.map((item) => {
          const reversed = item.vals.split(",").reverse();
          const n = reversed.length;
          var prev = item.rolling_mean;
          var ema = 0;
          for (var i = 0; i < n; i++) {
            var k = smoothing / (n + 1);
            var close = reversed[i];
            ema = k * (close - prev) + prev;
          }
          var buy = switched && item.actual < ema;
          var sell = switched && item.actual > ema;
          position = item.actual < ema;
          switched = position != prevPosition
          prevPosition = position


          return { date: item.date, rolling_mean: ema, buy, sell, close:item.actual };
        });
        cache.set(req.url, results);
        res.send(results);
      }
    }
  );
};

const middleware = (url) =>
{
  return cache.get(url)
}



module.exports = {
  random,
  stocks,
  stocksID,
  news,
  market,
  stockDayAvg,
  marketDateRange,
  stockAvgRange,
  stockInfoPeriod,
  volatility,
  bollinger,
  stockAllInfo,
  hotStocks,
  ranking,
  rollingMean,
  wieghtedRollingMean,
  expRollingMean,
  specificNews,
  newsAnalysis,
  middleware
};