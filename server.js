const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');

var bodyParser = require('body-parser');
var ejs = require('ejs');
var engine = require('ejs-mate');
var session = require('express-session');
var cookieParser  = require('cookie-parser');
var flash = require('express-flash');
var MongoStore = require('connect-mongo')(session);
var passport = require('passport');
var Category=require('./models/category');

var cartLength = require('./middlewares/middleware');

var product=require('./models/product');

var secret = require('./config/secret');

var User = require('./models/user');

const app = express();

mongoose.connect(secret.database,{useNewUrlParser:true},function(err){
  if(err)
  {
    console.log(err);
  }else {
    console.log("Connected to database server");
  }
});
//Middleware

// app.use( express.static( "public" ) );
app.use(express.static(__dirname + '/public'));
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieParser());
app.use(session({
  resave:true,
  saveUninitialized:true,
  secret: secret.secretKey,
  store : new MongoStore({url:secret.database , autoReconnect:true})
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(function(req,res,next){
  res.locals.user = req.user;
  next();
});
app.use(cartLength);

app.use(function(req,res,next)
{
Category.find({},function(err,categories)
  {
    if(err) return next(err);
    res.locals.categories=categories;
    next();

});
});
app.engine('ejs',engine);
app.set('view engine','ejs');

var mainRoutes = require('./routes/main');
var userRouter = require('./routes/user');
var scriptsRouter = require('./routes/user');
var vendorRoutes=require('./routes/vendor');

var apiRoutes=require('./api/api');  //api/api come in videp

app.use(mainRoutes);
app.use(userRouter);
app.use(scriptsRouter);
app.use(vendorRoutes);
app.use('/api',apiRoutes);

app.listen(secret.port,function(err){
  if (err) throw err;
  console.log("server is running at port "+ secret.port);
});
