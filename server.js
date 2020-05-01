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


// app.use('*', notFoundHandler);
app.get('/searches/new', newSearch);
app.post('/searches/show', findBook);
app.post('/add', addBook);
app.get('/', getbook);
app.get('/detail/:id', detail);
app.post('/delete/:id' , deleteBook)
app.post('/update/:id' , updateBook)

function newSearch(request, response) {
    response.render('pages/searches/new');
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

function addBook(req, res) {
    const { title, authors, isbn, image_url, description, bookshelf } = req.body;
    const SQL = 'INSERT INTO bookstable (title,authors,isbn,image_url,description,bookshelf) VALUES ($1,$2,$3,$4,$5,$6);';
    const values = [title, authors, isbn, image_url, description, bookshelf];

    return client.query(SQL, values)
        .then(() => {
            res.redirect('/');
        })
        .catch((err) => {
            errorHandler(err, req, res);
        });
}

function getbook(req, res) {
    let SQL = 'SELECT * FROM bookstable;'
    client
        .query(SQL)
        .then((data) => {
            console.log(data);
            res.render('pages/index', { booksnew: data.rows });
        })
        .catch((err) => {
            errorHandler(err, req, res);
        });
}

function detail(req, res) {
    const SQL = 'SELECT * FROM bookstable WHERE id=$1;';
    const values = [req.params.id];
    client
        .query(SQL, values)
        .then((results) => {
            res.render('pages/books/detail', { booknew2: results.rows[0] });
        })
        .catch((err) => {
            errorHandler(err, req, res);
        });
}
function deleteBook (req , res){
    let SQL = `DELETE FROM bookstable WHERE id=$1;`;
    let value = [req.params.id];
    client.query(SQL , value)
    .then( ()=>{
        res.redirect('/')
    })
}
function updateBook(req , res){
    let {title, authors, isbn, image_url, description, bookshelf } = req.body;
    let SQL = `UPDATE bookstable SET title=$1, authors=$2, isbn=$3, image_url=$4, description=$5, bookshelf=$6 WHERE id=$7`
    let id = req.params.id;
    let values = [title, authors, isbn, image_url, description, bookshelf ,id];
    client.query(SQL, values)
    .then( ()=>{
        res.redirect(`/detail/${id}`);
    })
}
app.get('/books/add', details);
function details(req, res) {
    res.redirect('/');
}






function Book(data) {
    this.authors = (data.volumeInfo.authors && data.volumeInfo.authors[0]) || ' ';
    this.title = data.volumeInfo.title || ' ';
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