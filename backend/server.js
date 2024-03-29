const express = require('express');
const cors = require('cors');

const config = require('./config');
const routes = require('./routes');

 const port = process.env.PORT || 8080;

const app = express();
app.use(cors({
  origin: '*',
}));

app.use((req, res, next) => {
  const {url} = req
  const cache = routes.middleware(url)
  if (cache != null)
  {
    console.log("used cache")
    res.send(cache)
  }
  else
  {
    console.log("not used")
    next();
  }
  
});

// General SELECT * FROM Table Endpoints
app.get('/stocks', routes.stocks);
app.get('/news', routes.news);
app.get("/news/:symbol", routes.specificNews);
app.get('/market', routes.market);
app.get('/random', routes.random);

//Defined Query Endpoints (in order)
app.get('/stocks/:symbol', routes.stocksID);
app.get('/stockDayAvg/:symbol', routes.stockDayAvg);
app.get('/marketByRange', routes.marketDateRange);
app.get('/stockAvgRange/:symbol', routes.stockAvgRange);
app.get('/stockPeriod/:symbol', routes.stockInfoPeriod);
app.get('/volatility', routes.volatility);
app.get('/bollinger/:symbol', routes.bollinger);
app.get('/stockAllInfo/:symbol', routes.stockAllInfo);
app.get('/hotStocks', routes.hotStocks);
app.get('/ranking', routes.ranking);
app.get('/rollingMean/:symbol', routes.rollingMean);
app.get("/weightedRollingMean/:symbol", routes.wieghtedRollingMean);
app.get("/expRollingMean/:symbol", routes.expRollingMean);
app.get("/newsAnalysis/:symbol", routes.newsAnalysis);

app.listen(port, () => {
  console.log(
    `Server running at ${port}`
  );
});