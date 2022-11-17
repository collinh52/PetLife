// importing the dependencies
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const app = express();
const pgp = require('pg-promise')();

const user = {
  username: undefined,
  password: undefined,
};

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
  res.send(message)
});

app.get('/home', (req, res) => {
  res.render('pages/home.ejs')
});

app.get('/new_post', (req, res) => {
  res.render('pages/post_page.ejs')
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
  const query = `SELECT password FROM users WHERE username = $1;`;
  username = req.body.username;
  db.any(query, [username])
  .then(async data => {
    const match = await bcrypt.compare(req.body.password, data[0].password);
    if(match)
    {
      //For when we make profile page in future
      user.username = username;
      req.session.user = user;
      req.session.save();
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
  if (!req.session.user) {
    // Default to register page.
    return res.redirect('/register');
  }
  next();
};

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
      //res.send("Registration successful.");
      res.redirect('/login');
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


app.post('/new_post', function (req, res){
  var post_query = "INSERT INTO posts (username, caption, location) VALUES ($1, $2, $3)";
  const username = req.session.user.username;
  const caption = req.body.caption;
  const location = req.body.location;

  const post_values = [username, caption, location];


  db.any(post_query,post_values)
    .then(function (data)  {
    })
    .catch(function (err)  {
    });

  db.tx(async t => {
    const {post_id} = await t.one(
      `SELECT
        MAX(post_id)
      FROM
        posts
      WHERE
        username = $1`,
      [username]
    );
    
    const picture_url = req.body.picture_url;
    if (picure_url){
      var picture_query = "INSERT INTO pictures (picture_url, post_id) VALUES ($1, $2)";
      
      const picture_values = [picture_url,post_id];

      db.any(picture_query,picture_values)
        .then(function (data)  {
        })
        .catch(function (err)  {
        });
      
      const {picture_id} = await t.one(
        `SELECT
          MAX(picture_id)
        FROM
          pictures
        WHERE
          post_id = $1`,
        [post_id]
      );
      

    };
  }).then(async user => {
    const match = await bcrypt.compare(req.body.password, user[0].password);
    res.redirect('/home');

  })
  .catch(async err=> {
    console.log(err)
    res.redirect('/register');
  });
});


// Authentication Required
app.use(auth);


app.listen(3000, () => {
  console.log('listening on port 3000');
});

// For future ref, to get number of likes (display on post):
// SELECT COUNT(like_id) AS num_likes FROM likes;

// Liking
app.post('/like', function (request, response) {
  const query =
    'INSERT INTO likes (post_id, username) VALUES ($1, $2) RETURNING * ;';
  db.any(query, [
    request.body.post_id,
    request.body.username,
  ])
    .then(function (data) {
      response.status(201).json({
        status: 'success',
        data: data,
        message: 'Liked!',
      });
    })
    .catch(function (err) {
      return console.log(err);
    });
});