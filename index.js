const express = require('express');
const app = express();
const morgan = require('morgan');
const fs = require ('fs');
const path = require('path');
const mongoose = require('mongoose');
const Models = require('./models.js');
const bodyParser = require('body-parser');
const uuid = require('uuid');
const { check, validationResult } = require('express-validator');
const dotenv = require('dotenv');
dotenv.config();


/**
 * CORS node.js package 
 * providing middleware to enable CORS across multiple projects
 */
const cors = require('cors');
let allowedOrigins = [
    'http://localhost:8080', 
    'https://desolate-sierra-27780.herokuapp.com', 
    'http://localhost:1234', 
    'https://mooviesbymyflix.netlify.app', 
    'http://localhost:4200', 
    'https://gab246.github.io/myFlix-Angular-client',
    'https://gab246.github.io',
    ];

app.use(cors({
    origin: (origin, callback) => {
        if(!origin) return callback(null, true);
        if(allowedOrigins.indexOf(origin) === -1){ // If a specific origin isn’t found on the list of allowed origins
          let message = 'The CORS policy for this application doesn’t allow access from origin ' + origin;
          return callback(new Error(message ), false);
        }
        return callback(null, true);
      }
    }));
  
const Movies = Models.Movie;
const Users = Models.User;
const accessLog = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'});



// mongoose.connect('mongodb://localhost:27017/mfDB', { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set('strictQuery', false);
mongoose.connect(process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(morgan('common'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');
app.use(express.static('public'));
app.use(morgan('combined', {stream: accessLog}));

  
app.get('/', (req, res) => {
    res.send('Enjoy the selection');
});

/**
 * Returns a list of all movies
 * @method GET
 * @param {string} endpoint - /movies
 * @param {function} callback - function(req, res)
 * @returns {object} - JSON object containing all movies
 */
app.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.find()
    .then((movies) => {
        res.status(200).json(movies);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
            });


/**
 * Returns a movie by title
 * @method GET
 * @param {string} endpoint - /movies/:Title
 * @param {function} callback - function(req, res)
 * @returns {object} - JSON object containing a movie
 */
app.get('/movies/:Title', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({Title: req.params.Title})
    .then((movie) => {
        res.json(movie);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
            });



/**
 * Returns a movie and its genre
 * @method GET
 * @param {string} endpoint - /movies/genre/:genreName
 * @param {function} callback - function(req, res)
 * @returns {object} - JSON object containing a movie and its genre
 */
app.get('/movies/genre/:genreName', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({'Genre.Name': req.params.genreName}).then((movie) => {
        res.json(movie.Genre);
    })
    .catch((err) =>{
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});
          


/**
 * Returns a movie and its director
 * @method GET
 * @param {string} endpoint - /movies/directors/:directorName
 * @param {function} callback - function(req, res)
 * @returns {object} - JSON object containing a movie and its director
 */
app.get('/movies/directors/:directorName', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({'Director.Name': req.params.directorName}).then((movie) => {
        res.json(movie.Director);
    })
    .catch((err)=> {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
            });


/**
 * User sign up 
 * @method POST
 * @param {string} endpoint - /users
 * @param {function} callback - function(req, res)
 * @returns {object} - returns confirmed user sign up information
 */
app.post('/users',
    [
    check('Username', 'Username is required and the minimum length is 6 characters').isLength({min: 6}),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
    ], (req, res) => {
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }
    
    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOne({ Username: req.body.Username})
        .then((user) => {
          if (user) {
            return res.status(400).send(req.body.Username + ' already exists');
          } else {
            Users
              .create({
                Username: req.body.Username,
                Password: hashedPassword,
                Email: req.body.Email,
                Birthday: req.body.Birthday
              })
              .then((user) => {
                res.status(201).json(user)
              })
                .catch((error) => {
                console.error(error);
                res.status(500).send('Error: ' + error);
            })
          }
        })
        .catch((error) => {
          console.error(error);
          res.status(500).send('Error: ' + error);
        });
});



/**
 * Returns updated user information
 * @method PUT
 * @param {string} endpoint - /users/:Username
 * @param {function} callback - function(req, res)
 * @returns {object} - confirmation of updated user information
 */
app.put('/users/:Username', 
[
    check('Username', 'Username is required and the minimum length is 6 characters').isLength({min: 6}),
    check('Username', 'Username contains non alphanumeric chracters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
  ],(req, res) => {
   
    let errors = validationResult(req);
    if (!errors.isEmpty()){
        return res.status(422).json({ errors: errors.array () });
    }
let hashedPassword = Users.hashPassword(req.body.Password);  
    Users.findOneAndUpdate({ Username: req.params.Username }, { $set:
    {
      Username: req.body.Username,
      Password: hashedPassword,
      Email: req.body.Email,
      Birthday: req.body.Birthday
    }
  },
  { new: true }, // makes sure that the updated document is returned
  (err, updatedUser) => {
    if(err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});


/**
 * Add moive to favorite list
 * @method POST
 * @param {string} endpoint - /users/:Username/movies/:MovieID
 * @param {function} callback - function(req, res)
 * @returns {object} - confirmation of add movie to favorite list
 */
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOneAndUpdate({Username: req.params.Username}, {
        $push: { FavoriteMovies: req.params.MovieID}
    },
        {new:true},
        (err, updateUser) => {
        if (err){
            console.error(err);
            res.status(500).send('Error: ' + err);
        } else {
            res.json(updateUser);
        }
    });
        });


/**
 * Returns a deleted movie from favorites list
 * @method DELETE
 * @param {string} endpoint - /users/:Username/movies/:MovieID
 * @param {function} callback - function(req, res)
 * @returns {object} - confirmation of deleted movie from list
 */ 
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOneAndUpdate({Username: req.params.Username}, {
        $pull: {FavoriteMovies: req.params.MovieID}
    },
        {new:true},
        (err, updateUser) => {
        if (err){
            console.error(err);
            res.status(500).send('Error: ' + err);
        } else {
            res.json(updateUser);
        }
    });
        });


/**
 * Returns a deleted user
 * @method DELETE
 * @param {string} endpoint - /users/:Username
 * @param {function} callback - function(req, res)
 * @returns {object} - confirmation of deleted user
 */
app.delete('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOneAndRemove({ Username: req.params.Username }).then((user) => {
        if(!user) {
            res.status(400).send(req.params.Username + ' was not found');
        } else {
            res.status(200).send(req.params.Username + ' was deleted.');
        }
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});
        


app.use((err, req, res, next) =>{
    console.error(err.stack);
    res.status(500).send('There was an error');
});


const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
    console.log('Listening on port ' + port);
});
