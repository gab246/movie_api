const express = require('express');
const app = express();
const morgan = require('morgan');
const fs = require ('fs');
const path = require('path');
const mongoose = require('mongoose');
const Models = require('./models.js');
const bodyParser = require('body-parser');
const uuid = require('uuid');

const Movies = Models.Movie;
const Users = Models.User;
const accessLog = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'});

mongoose.connect('mongodb://localhost:27017/mfDB', { useNewUrlParser: true, useUnifiedTopology: true });

app.use(morgan('common'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(morgan('combined', {stream: accessLog}));


app.get('/', (req, res) => {
    res.send('Enjoy the selection');
});

//get all movies
app.get('/movies', (req, res) => {
    Movies.find()
    .then((movies) => {
        res.status(200).json(movies);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
            });

//get a movie by title
app.get('/movies/:Title', (req, res) => {
    Movies.findOne({Title: req.params.Title})
    .then((movie) => {
        res.json(movie);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
            });

//get a movie by genre
app.get('/movies/genre/:genreName', (req, res) => {
    Movies.findOne({'Genre.Name': req.params.genreName}).then((movie) => {
        res.json(movie.Genre);
    })
    .catch((err) =>{
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});
          
//get director
app.get('/movies/directors/:directorName', (req, res) => {
    Movies.findOne({'Director.Name': req.params.directorName}).then((movie) => {
        res.json(movie.Director);
    })
    .catch((err)=> {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
            });

app.post('/users', (req, res) => {
    Users.findOne({ Username: req.body.Username})
        .then((user) => {
          if (user) {
            return res.status(400).send(req.body.Username + 'already exists');
          } else {
            Users
              .create({
                Username: req.body.Username,
                Password: req.body.Password,
                Email: req.body.Email,
                Birthday: req.body.Birthday
              })
              .then((user) =>{res.status(201).json(user) })
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
    
      //update user info
app.put('/users/:Username', (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, { $set:
    {
      Username: req.body.Username,
      Password: req.body.Password,
      Email: req.body.Email,
      Birthday: req.body.Birthday
    }
  },
  { new: true }, // This line makes sure that the updated document is returned
  (err, updatedUser) => {
    if(err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});
      
//add movie to favorites
app.post('/movies/:id/:movieTitle', (req, res) => {
    Users.findOneAndUpdate({id: req.params.id}, {
        $push: { FavoriteMovies: req.params.movieTitle}
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
       
//delete movie from favorites
app.delete('/movies/:id/:movieTitle', (req, res) => {
    Movies.findOneAndRemove({movieTitle: req.params.movieTitle}).then((movie)=>{
        if (!movie) {
            res.status(400).send(req.params.movieTitle + ' was not found');
        } else {
            res.status(200).send(req.params.movieTitle + ' was deleted.');
        }
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
        });
      
//delete user
app.delete('/users/:Username', (req, res) => {
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

app.listen(8080, () => {
    console.log('listening');
});



