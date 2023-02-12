const express = require('express'),
const morgan = require('morgan'),
const fs = require ('fs'),
const path = require('path');
const mongoose = require('mongoose');
const Models = require('./models.js');
const Movies = Models.Movie;
const Users = Models.User;
const bodyParser = require('body-parser');

const app = express();
app.use(morgan('common'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const accessLog = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})
app.use(morgan('combined', {stream: accessLog}));


app.get('/', (req, res) => {
    res.send('Enjoy the selection');
})


app.get('/movies', (req, res) => {
    res.send('Successful request returning data on all movies');
            });


app.get('/movies/:name', (req, res) => {
    res.send('Successful request returning data on a particular movie');
            });

             
app.get('/movies/:name/:genre', (req, res) => {
    res.send('Successful request returning data about a genre of a movie');
             });
          
        
app.get('/director/:directorName', (req, res) => {
    res.send('Successful request on data about a particular director');
            });

app.post('/users', (req, res) => {
    Users.findOne({ Username: req.body.Username })
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
    
        
app.put('/users/:username', (req, res) => {
    Users.findOneAndUpdate({ Username: req.params.Username}, {$set:
        {
        Username: req.body.Username,
        Password: req.body.Password,
        Email: req.body.Email,
        Birthday: req.body.Birthday
        }
    },
                           {new: true},
                           (err, updateduser) => {
        if(err){
            console.error(err);
            res.status(500).send('Error: ' + err);
        } else {
            res.json(updatedUser);
        }
    });
});
        
app.post('/movies/:id/:movieTitle', (req, res) => {
    res.send('Movie has been added to the favourites list');
        });
        
app.delete('/movies/:id/:movieTitle', (req, res) => {
    res.send('Movie has been deleted from the favourite list');
        });
                
app.delete('/users/:username', (req, res) => {
    res.send('User has been deleted');
        });

    
    
app.use(express.static('public'));

app.use((err, req, res, next) =>{
    console.error(err.stack);
    res.status(500).send('something broke');
});

app.listen(8080, () => {
    console.log('listening');
});



