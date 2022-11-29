// importing the dependencies
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const { query } = require('express');
const { Column } = require('pg-promise');
const app = express();
const pgp = require('pg-promise')();
const session = require('express-session');
const path = require("path");
const multer  = require('multer');
const fs = require('fs');
const cloudinary = require("cloudinary").v2;


const user = {
  username: undefined,
  password: undefined,
};


//setting up multer for file uploading
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname));
    },
})
const upload = multer({ storage: storage })

//connecting to cloudinary db
cloudinary.config({
  cloud_name: 'diaoicqwt',
  api_key: '977326122325792',
  api_secret: 'WnmdmGp6TPC4lNye657MmlmzorI'
});

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
  res.render('pages/register.ejs')
});

app.get('/home', (req, res) => {
  //åres.render('pages/home.ejs');
  
  var query = 'SELECT * FROM posts';
  db.any(query)
    .then(function (rows) {
      console.log(rows)
      
      if (rows.length === 0)
      {
        res.render('pages/home', {data : null, message: "error"})
      }
      res.render('pages/home', {data : rows})
    //res.render('pages/home.ejs');
    })
    .catch(function (err) {
      return console.log(err);
    });
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
  var query = `SELECT profile_name, bio, joined_timestamp, birthday, pet_type, profile_image_url, username FROM users WHERE username = $1`;
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

//Profile page
// app.get('/profile', function (req, res) {
//  //Need to add profile picture to this
//   var query = `SELECT profile_name, bio, joined_timestamp FROM users`;
//   db.query(query, function(error, data)
//   {
//     if(error)
//     {
//       throw error;
//     }
//     else
//     {
//       res.render('pages/profile', {title:'User Information',action: 'list', userInfo:data} )
//     }
//   _})
// });


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


app.post('/new_post', upload.single('picture_file'), async (req, res) =>{
  var post_query = "INSERT INTO posts (username, caption, location) VALUES ($1, $2, $3) RETURNING post_id;";
  const username = req.session.user.username;
  const caption = req.body.caption;
  const location = req.body.location;

  const post_values = [username, caption, location];

  const temp = await cloudinary.uploader.upload(req.file.path)
  const picture_url = temp.url;

  await fs.unlink(req.file.path, (err) => {
    if (err) {
      console.error(err)
      return
    };
  });

  await db.any(post_query,post_values)
    .then(function (data)  {
    })
    .catch(function (err)  {
      return console.log(err);
    });

  await db.tx(async t => {
    var post_id = await t.one(
      `SELECT
        MAX(post_id)
      FROM
        posts
      WHERE
        username = $1`,
      [username]
    );
    post_id = post_id["max"];
    
    if (picture_url != null) {
      var picture_query = "INSERT INTO pictures (picture_url, post_id) VALUES ($1, $2) RETURNING picture_id;";
      
      const picture_values = [picture_url,post_id];

      await db.any(picture_query,picture_values)
        .then(async data =>  {
          var picture_id = await t.one(
            `SELECT
              MAX(picture_id)
            FROM
              pictures
            WHERE
              post_id = $1`,
            [post_id]
          );
          picture_id = picture_id["max"];
          
          var insert_pic_query = "UPDATE posts SET picture_id = $1 WHERE post_id = $2";
          var insert_pic_values = [picture_id, post_id];

          await db.any(insert_pic_query,insert_pic_values)
          .then(async data =>  {
          })
          .catch(function (err)  {
            return console.log(err);
          });
          

        })
        .catch(function (err)  {
          return console.log(err);
        });
      
    };

  }).then(async user => {
    res.redirect('/home');

  })
  .catch(async err=> {
    console.log(err)
    return console.log(err);
  });
});



app.post('/edit_profile', upload.single('profile_picture'), async (req, res) =>{
  
  const username = req.session.user.username;
  const bio = req.body.bio;
  const pet_type = req.body.pet_type;
  const profile_name = req.body.profile_name;
  const birthday = req.body.birthday;


  try {
    if (fs.existsSync(req.file.path)) {
      const temp = await cloudinary.uploader.upload(req.file.path)
      const profile_image_url = temp.url;
    
      await fs.unlink(req.file.path, (err) => {
        if (err) {
          console.error(err)
          return
        };
      });
    
      const values = [profile_name, bio, profile_image_url, pet_type, birthday, username];
      var query = "UPDATE users SET profile_name = $1, bio = $2, profile_image_url = $3, pet_type = $4, birthday = $5  WHERE username = $6;";
    
      await db.any(query,values)
        .then(function (data)  {
          res.redirect('/profile');
        })
        .catch(function (err)  {
          return console.log(err);
        });

    } else {
      const values = [profile_name, bio, pet_type, birthday, username];
      var query = "UPDATE users SET profile_name = $1, bio = $2, pet_type = $3, birthday = $4  WHERE username = $5;";
    
      await db.any(query,values)
        .then(function (data)  {
          res.redirect('/profile');
        })
        .catch(function (err)  {
          return console.log(err);
        });
    }
  } catch(err) {
    console.error(err);
  };


});


app.get('/logout', (req, res) =>{
  req.session.destroy();
  res.render('pages/login');
  message.log('Logged out Successfully');
});


//upload api
//image is uploaded, added to uploads folder, added to cloudinary, and deleted from uploads folder
  app.post('/upload', upload.single('image_file'), async (req, res) => {

        await cloudinary.uploader.upload(req.file.path)
                  .then((result) => {
                    res.status(200).send({
                      message: "Image Successfully Uploaded",
                      result,
                    });
                  }).catch((error) => {
                    res.status(500).send({
                      message: "Image Upload Failed",
                      error,
                    });
                  });

        await fs.unlink(req.file.path, (err) => {
          if (err) {
            console.error(err)
            return
          };
        });
  });



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
  let query = `select community_name from communities join community_member on communities.community_id = community_member.community_id where community_member.username = '${req.session.user.username}';`
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
    query = `insert into community_member (username, community_id) values ('${req.session.user.username}', (select community_id from communities where community_name = $1));`;
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
// Getting number of likes to display on post
app.get('/num_likes', (req, res) => {
  var query = 'SELECT COUNT(like_id) AS num_likes FROM likes WHERE post_id = (SELECT post_id FROM posts WHERE post_id = $1);';
  const post_id = req.body.post_id;
  db.any(query, [post_id])
  .then(data => {
    res.render('home')
  })
  .catch(function (err) {
    return console.log(err);
  });
});

// Authentication Required
   app.use(auth);

   app.listen(3000, () => {
     console.log('listening on port 3000');
   });
