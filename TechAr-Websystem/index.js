const express = require('express');
const port = process.env.PORT || 5000;
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

mongoose
  .connect('mongodb+srv://creator:nnNN@@22@cluster0.bkrcv.mongodb.net/Images', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('connected');
  })
  .catch((err) => {
    console.log('not connected');
  });

app.get("/",(req,res)=>{
    res.render("frontpage",{})
})

app.get('/sign-in', (req, res) => {
    res.render('sign-in', {});
});
app.get("/dashboard/generate",(req,res)=>{
    res.render('Generator',{});
})
app.get('/admin-panel', (req, res, next) => {
    res.render('admin-login', {});
});

app.get('/dashboard', (req, res) => {
    res.render('dashboard',{
        //TODO Remember We need to give it this data through a database, Currently managing these properties through intiial design thought of.
        length:0,
        mail:'namankalrabhiwani54@gmail.com',
        queries:[],
        queries_length:0,

    })
  });
  
  ///////////////
  
app.post('/admin-login', (req, res, next) => {
    var adminEmail = req.body.email;
    var adminPassword = req.body.psw;
    if (adminEmail === 'nlok5923@gmail.com' && adminPassword === '123') {
      res.render('admin-panel', {});
    } else {
    //   var userVerified = false;
      res.render('admin-login', {});
    }
});

app.listen(port, () => {
    console.log('Server Started at ' + port);
});
  