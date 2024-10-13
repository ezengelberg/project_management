const express = require('express');
const cors = require("cors");

const routes = require('./routes/routes');

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

app.use('/', routes);


const server = app.listen(port, () => {
    console.log("listening on port %s...", server.address().port);
  });