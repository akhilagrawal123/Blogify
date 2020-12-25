const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const blogRoutes = require('./api/routes/blogs');

mongoose.connect('mongodb+srv://hackerakhil:' + process.env.MONGO_ATLAS_PW +'@cluster0.3ybkn.mongodb.net/<dbname>?retryWrites=true&w=majority',
   {
          useMongoClient: true
   }
);
//mongodb+srv://hackerakhil:<password>@cluster0.3ybkn.mongodb.net/<dbname>?retryWrites=true&w=majority

mongoose.Promise = global.Promise;

app.use(morgan('dev'));
app.use('/uploads', express.static('uploads'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use((res,req,next) => {
    res.header("Access_Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", 
    "Origin, X-Requested-With, Content-Type, Accept, Authorization");

    if(req.method === "OPTIONS")
    {
       res.header('Access-Control-Allow-Methods', 'PUT, PATCH, POST, DELETE, GET');
       return res.status(200).json({});
    }

    next();
})

//Routes which will handle my request
app.use('/blogs', blogRoutes);

app.use((req,res,next) => {
    const error = new Error('Not Found');
    error.status = 404;
    next(error);

})

app.use((error, req, res, next) => {

    res.status(error.status || 500);
    res.json({
        error : {
            message: error.message
        }
    });
});


module.exports = app;