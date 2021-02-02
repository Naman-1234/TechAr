const express = require('express');
const port = process.env.PORT || 5000;
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path')
const lectureNote = require('./models/LectureDetails');
const app = express();
const instructorModel = require('./models/InstructorDetails');
const bcrypt = require('bcrypt');
var isInstructorAuthenticated = false;
var InstructorMail = '';
var mailer = require('nodemailer');
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// using middlwares 
app.use(bodyParser.json({ limit: '10mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
app.use(express.json());
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname + '/../public')));
app.use(express.static('public'));

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// connecting out map with mongodb atlas 
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
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// this function help us to make a random string of n length
function makeid(length) {
  var result = '';
  var characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

app.get("/",(req,res)=>{
    res.render("frontpage",{})
})

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// setted get request for testing if pages are rendering properly or not 
app.get('/sign-in', (req, res) => {
    res.render('sign-in', {auth:true});
});

// setted post route checking for correct instructor login 
app.post('/sign-in', async (req, resp, next) => {
  var usrEmail = req.body.usremail;
  var temp;
  temp = await instructorModel
    .find({ email: usrEmail })
    .then(async (doc) => {
      if(doc.length !=0){
      var ob1;
      ob1 = await bcrypt.compare(
        req.body.usrpsw,
        doc[0].password,
        (err, res) => {
          if (err) {
            resp.render('sign-in', {auth: false});
            console.error(err);
            return;
          }
          
          InstructorMail = req.body.usremail;
          isInstructorAuthenticated = res;
          if(res){
          resp.redirect("/dashboard")
          }
          else{
          resp.render('sign-in', {auth: false});
          }
        }
      );
      }else{
        resp.render('sign-in', {auth: false});
      }
    })
    .catch((err) => {
      console.log('error finding user', err);
    });
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.get("/dashboard/generate",(req,res)=>{
    res.render('Generator',{action:"notdone"});
})

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// this will lecture forming request
app.post('/dashboard/generate',async (req, res, next) => {

  console.log("printing request body",req.body);
  var id = await makeid(6);
  let Mail = req.body.Insemail;
  let lectureid = id;
  let lecture_title = req.body.ltitle;
  let lecture_para = req.body.value;
  let lecture_additional_note = req.body.note;
  let lecture_video_link = req.body.video_url;
  let lecture_reso = req.body.extras;
  let lecture_subject = req.body.subject_name;
  let model_name = req.body.model;
  let quillDelta = req.body.quillDelta;
  // let customModelName = req.body.filename;

  let lectureData = new lectureNote({
    InsEmail: Mail,
    lecture_id: lectureid,
    title: lecture_title,
    para: lecture_para,
    additional_note: lecture_additional_note,
    video_link: lecture_video_link,
    resources: lecture_reso,
    subject_name: lecture_subject,
    model: model_name,
    quillDelta: quillDelta
    // customModelName: customModelName
  });
  var ob1 = await lectureData
    .save()
    .then((doc) => {
      console.log(doc);
      var emailData = `Dear Instructor <br> you can take a preview of your lecture content at https://tech-ar.herokuapp.com/${id} <br><br><br> Thanks and Regards<br> techAr services`;
      console.log('data saved successfully', doc.lecture_id);
      // defining transporter to send mail to the instructor with lecture link once lecture is created
      var transporter = mailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        service: 'gmail',
        auth: {
          user: 'techar.service@gmail.com',
          pass: 'TechAr@9907',
        },
      });

      var mailOptions = {
        from: 'techar.service@gmail.com',
        to: req.body.Insemail,
        subject: 'Your lecture is live',
        html: emailData,
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
      // res.render('Success', {});
      console.log("occur")
      // res.redirect("/success")
      res.render('Generator',{action:"done"})
    })
    .catch((err) => {
      console.log('error occur', err);
    });
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.get('/admin-panel', (req, res, next) => {
    res.render('admin-login', {});
});

//* Adding get request path for Team Page
app.get("/team",(req,res)=>{
  res.render('Team',{})
});
app.get("/about",(req,res)=>{
  res.render('why_us',{})
})

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// this post route will take data provided by admin and save it as a instructor credentials 
app.post('/admin-panel', async (req, res, next) => {
  const InstructorPassword = req.body.psw;
  const rounds = 10;
  var hashedPassword = '';
  var ob1;
  // the password created is being hashed using bcrypt to maintain data privacy
  ob1 = await bcrypt.hash(InstructorPassword, rounds, (err, hash) => {
    if (err) {
      console.log(err);
      return;
    }
    hashedPassword = hash;
    let InsDetails = new instructorModel({
      first_name: req.body.fname,
      last_name: req.body.lname,
      email: req.body.usremail,
      password: hashedPassword,
    });
    InsDetails.save()
      .then((doc) => {
       // A transporter has been defined which is using nodemailer to mail the particular person who is appointed as instructor 
        var InformMail = `Dear Sir/Ma'am, <br> Thanks for using our service and helping us to provide materials in the most efficient way as possible to deliver your precious lecture content to student we TechAr service appointed you as a instuctor at service TechAr your credentials are as follows.<br>
           id: ${req.body.usremail}<br>password: ${req.body.psw} <br><br><br> Thanks and Regards <br>TechAr`;
        var transporter = mailer.createTransport({
          host: 'smtp.gmail.com',
          port: 587,
          secure: false,
          service: 'gmail',
          auth: {
            user: 'techar.service@gmail.com',
            pass: 'TechAr@9907',
          },
        });

        var mailOptions = {
          from: 'techar.service@gmail.com',
          to: req.body.usremail,
          subject: 'Appointed as instructor at tecahAr',
          html: InformMail,
        };

        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log('Email sent: ' + info.response);
          }
        });
      })
      .catch((err) => {
        console.log('error : ', err);
      });
  });
  res.render('FrontPage', {});
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// test route for testing correct rendering of dashboard page 
app.get('/dashboard', (req, res) => {
    res.render('dashboard',{
        //TODO Remember We need to give it this data through a database, Currently managing these properties through intiial design thought of.
        length:0,
        mail:'namankalrabhiwani54@gmail.com',
        queries:[],
        queries_length:0,

    })
  });

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// basically this route will help us to validate if admin is login in or not 
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

//* Adding get request path for Team Page
app.get("/team",(req,res)=>{
  res.render('Team',{})
});
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//temporary route to display success page
app.get("/success",(req,res)=>{
  res.render('Success',{})
})

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// serving application 
app.listen(port, () => {
    console.log('Server Started at ' + port);
});
  