const express = require('express'),
    morgan = require('morgan'),
    fs = require ('fs'),
    path = require('path');

const app = express();
app.use(morgan('common'));

const accessLog = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})
app.use(morgan('combined', {stream: accessLog}));


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



