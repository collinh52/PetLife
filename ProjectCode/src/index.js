// importing the dependencies
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const app = express();
const pgp = require('pg-promise')();

app.set('view engine', 'ejs');

// using bodyParser to parse JSON in the request body into JS objects
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

const message = 'Hey there!';

// defining a default endpoint
app.get('/', (req, res) => {
  res.send(message);
});

require('dotenv').config();

const dbConfig = {
    host: 'db',
    port: 5432,
    
    database: process.env.POSTGRES_DB,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
};

const db = pgp(dbConfig);


// db test

db.connect()
  .then(obj => {
    // Can check the server version here (pg-promise v10.1.0+):
    console.log('Database connection successful');
    obj.done(); // success, release the connection;
  })
  .catch(error => {
    console.log('ERROR:', error.message || error);
  });


app.listen(3000, () => {
  console.log('listening on port 3000');
});

app.get('/register', (req, res) => {
  res.render('pages/register');
});

// Register submission
app.post('/register', async (req, res) => {
 const hash = await bcrypt.hash(req.body.password, 10);
 //res.send(req.body.username);
  db.tx(async t => {
    await t.none(
      'INSERT INTO users(username, password) VALUES ($1, $2);',
      [req.body.username, hash]
    )
    .then(data => {
      res.send("Registration successful.");
    })
    .catch(err => {
      res.send("Username taken, registration failed.");
      //res.redirect('/register');
      console.log(err);
    });
  });
});

// Function to list users
app.get('/register_test', function (req, res) {
  var query ="SELECT * FROM users";
  db.any(query)
    .then(function (rows) {
      res.send(rows);
    })
    .catch(function (err) {
      return console.log(err);
    });
});
