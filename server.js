const express = require('express');
const morgan = require('morgan');
const path = require('path');
const dotenv = require('dotenv');
const app = express();
const connectDB = require('./server/database/connection');
const cors = require('cors');

app.use(cors());

dotenv.config({path:path.join(__dirname,'config.env')});

connectDB();

const port = process.env.PORT;

app.use(morgan('tiny'));

app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

app.use('/',require('./server/routes/User'));
app.use('/',require('./server/routes/Notes'));

app.listen(port,()=>{
  console.log("The server is running at poort 8000");
});