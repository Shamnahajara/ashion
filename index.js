const mongoose = require("mongoose");
const config = require("./config/config");
require('dotenv').config();
mongoose.set("strictQuery",false);
const session = require("express-session");
mongoose.connect(process.env.MONGO);
const path = require("path");
const nocache = require('nocache');
const express = require("express");
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(nocache());
app.set('view engine','ejs');
app.use(session({
    secret:config.sessionScret,
    saveUninitialized:true,
    resave:false,
    cookie:{
        maxAge: 1000 * 60 * 24 * 10
    }

}));

const PORT = process.env.PORT

// for user routes
const userRoute = require('./routes/userRoute');
app.use('/',userRoute);

// for admin routes
const adminRoute = require('./routes/adminRoute');
app.use('/admin',adminRoute);


app.use(express.static(path.join(__dirname, "public")))

const error = require('./controllers/errorController');
app.use(error.get404);

app.listen(PORT,function(){
    console.log("server is running...");
});


