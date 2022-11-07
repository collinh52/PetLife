// importing the dependencies
const express = require('express');
const bodyParser = require('body-parser');

// defining the Express app
const app = express();

// using bodyParser to parse JSON in the request body into JS objects
app.use(bodyParser.json());

const message = 'Hey there!';

// defining a default endpoint
app.get('/', (req, res) => {
  res.send(message);
});

const pgp = require('pg-promise')();
require('dotenv').config();

// TODO: uncomment next parts for when database is finished

const dbConfig = {
    host: 'db',
    port: 5432,
    database: process.env.POSTGRES_DB,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
};

const db = pgp(dbConfig);

app.listen(3000, () => {
  console.log('listening on port 3000');
});

// Register submission
app.post('/register', async (req, res) => {
  //the logic goes here

  /*
  //const hash = await bcrypt.hash(req.body.password, 10);
  db.tx(async t => {
    await t.none(
      'INSERT INTO users(username, password) VALUES ($1, $2);',
      [req.body.username, req.body.password]
    )
    .then(data => {
      res.send("Success");
      //res.send(data);
    })
    .catch(err => {
      console.log(err);
    });
  });
  */
});



app.get('/register_test', function (req, res) {
  var query =`SELECT username FROM users`;
  db.any(query)
    .then(function (rows) {
      res.send("l;asdfj");
    })
    .catch(function (err) {
      // handle an error
      return console.log(err);
    });
});
