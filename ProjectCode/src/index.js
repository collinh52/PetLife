// importing the dependencies
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const pgp = require('pg-promise')();

//const session = require('express-session');

// using bodyParser to parse JSON in the request body into JS objects
app.use(bodyParser.json());

const message = 'Hey there!';

// defining a default endpoint
app.get('/', (req, res) => {
  res.send(message);
});

require('dotenv').config();
//const path = require('path');
//console.log(require('dotenv').config({path: path.resolve(__dirname, '../.env')}));

// TODO: uncomment next parts for when database is finished

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

// Register submission
app.post('/register', async (req, res) => {
  //the logic goes here
  //const hash = await bcrypt.hash(req.body.password, 10);
  //res.send(req.body.username);
  db.tx(async t => {
    await t.none(
      'INSERT INTO users(username, password) VALUES ($1, $2);',
      [req.body.username, req.body.password]
    )
    .then(data => {
      //res.send("Success");
      res.send(data);
    })
    .catch(err => {
      res.send("didn't work");
      console.log(err);
    });
  });
  
});



app.get('/register_test', function (req, res) {
  var query ="SELECT * FROM users";
  //res.send("Register test reached");
  //res.send(dbConfig.database);
  db.any(query)
    .then(function (rows) {
      res.send(rows);
    })
    .catch(function (err) {
      // handle an error
      return console.log(err);
    });
});
