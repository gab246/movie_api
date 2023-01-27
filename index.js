const express = require('express');
const app = express();

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





