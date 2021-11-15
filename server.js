const express = require('express');
const morgan = require('morgan');
const path = require('path');
const dotenv = require('dotenv');
const app = express();
const connectDB = require('./server/database/database_connection');
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

app.use('/',require('./server/routes/tournament'));
app.use('/',require('./server/routes/userdata'));

app.listen(port,()=>{
  console.log("The server is running at port 8000");
});