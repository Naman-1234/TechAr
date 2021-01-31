const express = require('express');
const port = process.env.PORT || 3000;
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path')
const app = express();

app.use(bodyParser.json({ limit: '10mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
app.use(express.json());
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname + '/../public')));
app.use(express.static('public'));

app.get("/",(req,res)=>{
    res.render("frontpage",{})
})

app.get('/sign-in', (req, res) => {
    res.render('sign-in', {});
});

app.get('/admin-panel', (req, res, next) => {
    res.render('admin-login', {});
});
  
app.listen(port, () => {
    console.log('Server Started at ' + port);
});
  