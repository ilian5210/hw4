var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

module.exports = app;

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('db/sqlite.db', (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Connected to the SQlite database.');
});

app.get('/api/quotes', (req, res) => {
    db.all('SELECT * FROM OilPrice', (err, rows) => {
        if (err) {
            console.error(err.message);
        }
        res.json(rows);
    });
});

app.post('/api/search', (req, res) => {
    const { s_date, e_date, price_98, price_95, price_92, price_diesel } = req.body;

    let sql = 'SELECT * FROM OilPrice';
    const conditions = [];
    const params = [];

    if (s_date && e_date) {
        conditions.push('date BETWEEN ? AND ?');
        params.push(s_date, e_date);
    }
    if (price_98) {
        conditions.push('price_98 = ?');
        params.push(price_98);
    }
    if (price_95) {
        conditions.push('price_95 = ?');
        params.push(price_95);
    }
    if (price_92) {
        conditions.push('price_92 = ?');
        params.push(price_92);
    }
    if (price_diesel) {
        conditions.push('price_diesel = ?');
        params.push(price_diesel);
    }

    if (conditions.length > 0) {
        sql += ' WHERE ' + conditions.join(' AND ');
    }

    db.all(sql, params, (err, rows) => {
        if (err) {
            console.error(err.message);
            res.status(500).send('Internal Server Error');
            return;
        }
        res.json(rows);
    });
});