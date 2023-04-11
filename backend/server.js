const express = require('express');
const cors = require('cors');

const config = require('./config');
const routes = require('./routes');

const app = express();
app.use(cors({
  origin: '*',
}));

// General SELECT * FROM Table
app.get('/stocks', routes.stocks);
app.get('/news', routes.news);
app.get('/market', routes.market);

//Defined Queries (in order)
app.get('/stocks/:symbol', routes.stocksID);
app.get('/stockDayAvg/:symbol', routes.stockDayAvg);
app.get('/marketByRange', routes.marketDateRange);
app.get('/stockAvgRange/:symbol', routes.stockAvgRange);
app.get('/stockPeriod/:symbol', routes.stockInfoPeriod);
app.get('/volatility', routes.volatility);

app.listen(config.server_port, () => {
    console.log(`Server running at http://${config.server_host}:${config.server_port}/`)
});