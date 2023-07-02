const config = require('./config/config');
const express = require('express');
const db = require('./config/db.config')
const mysql = require('mysql');
const router = express.Router();
const userRoute = require('./routes/user.route');
const Sequelize = require('sequelize');
const bodyParser = require('body-parser');
const Cors = require("cors");

// Create an Express app
const app = express();
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use('/image', express.static('./public/uploads'));
app.use(express.static('public'));

app.use(express.json());
app.use(Cors());
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: true
}));
db.sequelize.sync({ force: false }).then(() => {
  console.log('Drop and Resync with { force: false}');
});


const sequelize = new Sequelize(db.database, db.user, db.password, {
  host: db.host,
  dialect: 'mysql',
});

// Define routes
app.use('/', userRoute);


// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
