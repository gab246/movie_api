const express = require('express'),
    morgan = require('morgan'),
    fs = require ('fs'),
    path = require('path');

const app = express();
app.use(morgan('common'));

const accessLog = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})
app.use(morgan('combined', {stream: accessLog}));

let topMovies = [
        {
            title: 'Matilda'
        },
        {
            title: 'The Blind Side'
        },
        {
            title: 'The Princess Diaries'
        },
        {
            title: 'Witness'
        },
        {
            title: 'She\'s the Man'
        },
        {
            title: 'Fast and Furious'
        },
        {
            title: 'Spy'
        },
        {
            title: 'Divergent'
        },
        {
            title: 'Avengers'
        },
        {
            title: 'Her'
        }
                
    ];

app.get('/movies', (req, res) => {
    res.json(topMovies);
});

app.get('/', (req, res) => {
    res.send('Enjoy the movie!');
})

app.use(express.static('public'));

app.use((err, req, res, next) =>{
    console.error(err.stack);
    res.status(500).send('something broke');
});

app.listen(8080, () => {
    console.log('listening');
});



