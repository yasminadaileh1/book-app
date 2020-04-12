'use strict';
require('dotenv').config();
const express = require('express');
const superagent = require('superagent');
const PORT = process.env.PORT || 4000;
const app = express();
app.use(express.static('./public'));

app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.get('/', (req, res) => {
    res.render('pages/index')
});


app.get('/new', newSearch);
function newSearch(request, response) {
    response.render('pages/searches/new');
}

app.get('/searches/show', formPage);
app.post('/searches/show', search);
function formPage(req, res) {
    res.render('pages/searches/new');
}
function search(req, res) {
    let url = `https://www.googleapis.com/books/v1/volumes?q=quilting`
    if (req.body.search === 'title') {
        url = `https://www.googleapis.com/books/v1/volumes?q=${req.body.search}:${req.body.keyword}`
    } else if (req.body.search === 'author') {
        url = `https://www.googleapis.com/books/v1/volumes?q=${req.body.search}:${req.body.keyword}`
    }
    return superagent.get(url)
        .then(data => {
            let books = data.body.items.map((value) => {
                return new Book(value)
            })
            res.render('pages/searches/show', { books: books })
        })
        .catch((err) => handleError(err, res));
        
}
function Book(data) {
    this.authors = data.volumeInfo.authors;
    this.title = data.volumeInfo.title;
    this.description = data.volumeInfo.description;
    this.image_url = data.volumeInfo.imageLinks.thumbnail;
}
const handleError = (error, response) => {
    response.render('pages/error', {error: error})
  }
  app.get('/*', (req, res) => {
    res.render('pages/error')
});
app.listen(PORT, () => console.log(`${PORT}`))

