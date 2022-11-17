// importing the dependencies
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const { query } = require('express');
const { Column } = require('pg-promise');
const app = express();
const pgp = require('pg-promise')();
const session = require('express-session');

const user = {
  username: undefined,
  password: undefined,
};

app.set('view engine', 'ejs');

// set session
app.use(
  session({
    secret: 'XASDASDA',
    saveUninitialized: true,
    resave: true,
  })
);

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
  res.send(message)
});

app.get('/home', (req, res) => {
  res.render('pages/home.ejs')
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


app.get('/', (req, res) =>{
  res.redirect('/login'); //this will call the /login route in the API
});

app.post('/login', async (req, res) => {
  const query = `SELECT password, username FROM users WHERE username = $1;`;
  db.any(query, [req.body.username])
  .then(async user => {
    const match = await bcrypt.compare(req.body.password, user[0].password);

    if(match)
    {
    req.session.user = {
      username: user[0].username,
    };
    req.session.save();
    //For when we make profile page in future
    res.redirect('/home');
    }
    else
    {
      res.redirect('/register');
    }
  })
  .catch(async err=> {
    console.log(err)
    res.redirect('/login');
  });
});

app.get('/login', (req, res) => {
  res.render('pages/login');
 });

// Authentication Middleware.
const auth = (req, res, next) => {
  console.log(req.session)
  if (!req.session.user) {
    // Default to register page.
    return res.redirect('/register');
  }
  next();
};

app.get('/register', (req, res) => {
  res.render('pages/register');
});

app.get('/profile', (req, res) => {
  const {username} = req.session.user || {};
  var query = `SELECT profile_name, bio, joined_timestamp FROM users WHERE username = $1`;
  db.any(query, [username])
  .then(function (rows) {
    if( rows.length === 0)
    {
      // res.send(err)
      res.render('pages/profile', {data : null, message: "error"} )
    }
    res.render('pages/profile', {data : rows[0]} )
  })
  .catch(function (err) {
    return console.log(err);
  });
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
      // res.send("Registration successful.");
      res.redirect("/login");
    })
    .catch(err => {
      //res.send("Username taken, registration failed.");
      res.redirect('/register');
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

app.get('/logout', (req, res) =>{
  req.session.destroy();
  res.render('pages/login');
  message.log('Logged out Successfully');
});

// Authentication Required
app.use(auth);

app.listen(3000, () => {
  console.log('listening on port 3000');
});
