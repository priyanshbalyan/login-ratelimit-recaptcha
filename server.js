"use strict";
const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Config = require('./config');
const cors = require('cors');
const path = require('path');
const session = require('express-session');

const app = express();
const router = require('./routes/api');

const url = Config.MONGO_URI;

mongoose.connect(url, { useNewUrlParser: true, useCreateIndex: true });

let db = mongoose.connection;

db.once("open", () => console.log("connected to the database"));
db.on("error", err => console.log("MongoDB connection error:", err));

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(logger("dev"));

app.use(session({
    secret: Config.TOKEN_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use('/', router);

app.listen(Config.API_PORT, () => console.log(`LISTENING ON PORT ${Config.API_PORT}`));