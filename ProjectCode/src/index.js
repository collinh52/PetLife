// importing the dependencies
const express = require('express');
const bodyParser = require('body-parser');
const path = require("path");
const multer  = require('multer');
const fs = require('fs');
const cloudinary = require("cloudinary").v2;

// defining the Express app
const app = express();

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


// using bodyParser to parse JSON in the request body into JS objects
app.use(bodyParser.json());

app.set('view engine', 'ejs');

const pgp = require('pg-promise')();
require('dotenv').config();

const dbConfig = {
    host: 'db',
    port: 5432,
    database: process.env.POSTGRES_DB,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
};

const db = pgp(dbConfig);

app.get('/', (req, res) => {
  res.render('pages/home');
});

//connecting to cloudinary db
cloudinary.config({ 
  cloud_name: 'diaoicqwt', 
  api_key: '977326122325792', 
  api_secret: 'WnmdmGp6TPC4lNye657MmlmzorI' 
});

//upload api
//image is uploaded, added to uploads folder, added to cloudinary, and deleted from uploads folder
  app.post('/upload', upload.single('image'), async (req, res) => {

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


app.listen(3000, () => {
  console.log('listening on port 3000');
});
