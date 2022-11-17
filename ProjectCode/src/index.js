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
  db.any(query, [req.body.username])
  .then(async user => {
    const match = await bcrypt.compare(req.body.password, user[0].password);

    if(match)
    {
    //For when we make profile page in future
    res.redirect('/home');
    // req.session.save()
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
  if (req?.session?.user == undefined) {
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

// Authentication Required
// app.use(auth);

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

// communities page
app.get('/communities', (req, res) => {
  let query = "select community_name from communities join community_member on communities.community_id = community_member.community_id where community_member.username = 'collin';"
  db.any(query)
      .then(community => {
        res.render('pages/communities', {community})
      })
      .catch(err => {
        console.log(err);
      });
})

app.post('/communities', async (req, res) => {
  let query;
  console.log(req.body)
  if(req.body.joined === 'true') {
    query = `delete from community_member where community_id = (select community_id from communities where community_name = $1);`;
  }
  else {
    query = `insert into community_member (username, community_id) values ('collin', (select community_id from communities where community_name = $1));`;
  }
  db.any(query, [req.body.community])
  .then(async community => {
    res.redirect('/communities')
  })
  .catch(async err=> {
    console.log(err)
    res.redirect('/login');
  });
});