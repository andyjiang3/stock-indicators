const express = require('express');
const cors = require('cors');
const config = require('./config');
const routes = require('./routes');

const app = express();
app.use(cors({
  origin: '*',
}));

app.get('/stocks', routes.stocks);
app.get('/stocks/:symbol', routes.stocksID);
app.get('/news', routes.news);
app.get('/market', routes.market);

app.listen(config.server_port, () => {
    console.log(`Server running at http://${config.server_host}:${config.server_port}/`)
});