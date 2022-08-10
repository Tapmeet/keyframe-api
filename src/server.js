/* eslint-disable no-var */
/* eslint-disable max-len */
require('dotenv').config();
const middleware = require('./middlewares/jwt');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
const CREDENTIALS = require('./../credentials.json');
const Youtube = require('youtube-api');
const open = require('open');
const fs = require('fs');
// const path = require("path");
const bodyParser = require('body-parser');
const route = require('./routes/index');
// Setting up port
const connUri = process.env.MONGO_LOCAL_CONN_URL;
const PORT = process.env.PORT || 2000;

// === 1 - CREATE APP
// Creating express app and configuring middleware needed for authentication
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());

// === 2 - SET UP DATABASE
// Configure mongoose's promise to global promise
mongoose.promise = global.Promise;
if (connUri) {
  mongoose.connect(connUri, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  });
} else {
  console.log('connUri is not defined');
}
const connection = mongoose.connection;
connection.once('open', () =>
  console.log('MongoDB --  database connection established successfully!')
);
connection.on('error', (err) => {
  console.log(
    'MongoDB connection error. Please make sure MongoDB is running. ' + err
  );
  process.exit();
});

// === 3 - INITIALIZE PASSPORT MIDDLEWARE
app.use(passport.initialize());
middleware(passport);

// Youtube Upoload
const oauth = Youtube.authenticate({
  type: 'oauth',
  client_id: CREDENTIALS.web.client_id,
  client_secret: CREDENTIALS.web.client_secret,
  redirect_url: CREDENTIALS.web.redirect_uris[0],
});

// === 4 - CONFIGURE ROUTES
// Configure Route
route(app);

app.use(express.static('src/Assets'));

app.post('/youtube-upload', async (req, res) => {
  const { filePath, title, description } = req.body;
  console.log('sherers');

  await open(
    oauth.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/youtube.upload'],
      state: JSON.stringify({
        filePath,
        title,
        description,
      }),
    })
  );
});
app.get('/oath2callback', function (req, res) {
  console.log('herers');
  const code = req.query.code;
  const { filePath, title, description } = JSON.parse(req.query.state);
  console.log('code');
  console.log(filePath);
  if (code) {
    // Get an access token based on our OAuth code
    oauth.getToken(code, function (err, tokens) {
      if (err) {
        console.log('Error authenticating');
        console.log(err);
      } else {
        console.log('Successfully authenticated');
        console.log(tokens);
        oauth.setCredentials(tokens);
        const assetsPath = './src/Assets/';
        console.log('Successfully authenticated');
        // console.log(filePath);
        Youtube.videos.insert(
          {
            resource: {
              // Video title and description
              snippet: {
                title: title,
                description: description,
              },
              // I don't want to spam my subscribers
              status: {
                privacyStatus: 'private',
              },
            },
            // This is for the callback function
            part: 'snippet,status',

            // Create the readable stream to upload the video
            media: {
              body: fs.createReadStream(assetsPath + filePath),
            },
          },
          (err, data) => {
            if (err) throw err;
            console.log(data);
            console.log('Done.');
          }
        );
        res.redirect('https://app.reveo.io/success');
      }
    });
  }
});
// === 5 - START SERVER
var server = app.listen(PORT, function () {
  console.log('Express server listening on port ' + server.address().port);
});
server.timeout = 1000000000;
// app.listen(PORT, () => console.log('Server running on http://localhost:' + PORT + '/'));
// app.timeout = 100000;
server.keepAliveTimeout = 60 * 100;
server.headersTimeout = 65 * 100;
