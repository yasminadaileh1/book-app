'use strict';
require('dotenv').config();
const express = require('express');
const superagent = require('superagent');
const pg = require('pg');
const PORT = process.env.PORT || 4000;
const app = express();
const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', (err) => console.log(err));
app.use(express.static('./public'));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// app.get('/hello', (req, res) => {
//     res.render('pages/index')
// });

app.get('/', getbook); 
function getbook (req, res) {
    let SQL = 'SELECT * FROM bookstable;'
    client
        .query(SQL)
        .then((data) => {
            console.log(data);
            res.render('pages/index', { booksnew: data.rows});
        })
        .catch((err) => {
            errorHandler(err, req, res);
        });
};
app.post('/books', addTask);
function addTask(req, res) {
    const { title,authors,isbn,image_url,description,bookshelf} = req.body;
    const SQL ='INSERT INTO bookstable (title,authors,isbn,image_url,description,bookshelf) VALUES ($1,$2,$3,$4,$5,$6);';
    const values = [title,authors,isbn,image_url,description,bookshelf];
    
    return client.query(SQL, values)
      .then(() => {
        res.redirect('/');
      })
      .catch((err) => {
        errorHandler(err, req, res);
      });
  }
app.get('/books/:books_id', setid);
function setid (req, res){
    const SQL = 'SELECT * FROM bookstable WHERE id=$1;';
    const values = [req.params.books_id];
    client
      .query(SQL, values)
      .then((results) => {
        res.render('pages/books/detail', { booknew2: results.rows });
      })
      .catch((err) => {
        errorHandler(err, req, res);
      });
}
app.get('/books/add', details);
function details (req, res){
res.redirect('/');
}

app.get('/searches/new', newSearch);
function newSearch(request, response) {
    response.render('pages/searches/new');
}
app.get('/searches/show', renderForm);
app.post('/searches/show', findBook);
app.use('*', notFoundHandler);
function renderForm(req, res) {
    res.render('pages/searches/new');
}
function findBook(req, res) {
    let url = `https://www.googleapis.com/books/v1/volumes?q=quilting`
    if (req.body.search === 'title') {
        url = `https://www.googleapis.com/books/v1/volumes?q=${req.body.search}:${req.body.keyword}`
    } else if (req.body.search === 'author') {
        url = `https://www.googleapis.com/books/v1/volumes?q=${req.body.search}:${req.body.keyword}`
    }
    return superagent.get(url)
        .then(data => {
            let books = data.body.items.map((element) => {
                return new Book(element)
            })
            res.render('pages/searches/show', { books: books })
        }).catch((err) => {
            errorHandler(err, req, res);
        });
}
function Book(data) {
    this.authors = (data.volumeInfo.authors && data.volumeInfo.authors[0]) || ' ';
    this.title = data.volumeInfo.title ||' ';
    this.isbn = (data.volumeInfo.industryIdentifiers && data.volumeInfo.industryIdentifiers[0].identifier) || ' ';
    this.image_url = (data.volumeInfo.imageLinks && data.volumeInfo.imageLinks.thumbnail) || ' ';
    this.description = data.volumeInfo.description;
}
/////////////////////////////////////////////////////////
function notFoundHandler(req, res) {
    res.status(404).send('PAGE NOT FOUND');
}
function errorHandler(err, req, res) {
    res.status(500).render('pages/error', { error: err });
}
client.connect().then(() => {
    app.listen(PORT, () => console.log('up and running in port', PORT));
});