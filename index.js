const express = require('express'),
    morgan = require('morgan'),
    fs = require ('fs'),
    path = require('path');

const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;

const app = express();
app.use(morgan('common'));

const accessLog = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})
app.use(morgan('combined', {stream: accessLog}));


app.get('/', (req, res) => {
    res.send('Enjoy the movie!');
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
    res.send('Created new user');
        });
        
app.put('/users/:username', (req, res) => {
    res.send('Updated user information')
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



