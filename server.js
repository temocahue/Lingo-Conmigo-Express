const dotenv = require('dotenv').config()
const express = require('express')
const app = express();
const methodOverride = require('method-override');
const session = require('express-session');
const bodyParser = require('body-parser');
const cors = require('cors')


//Databadse
require(`./db/db.js`)

app.use(cors())
app.use(express.static('public'))
	//body parser
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
// method override
app.use(methodOverride('_method'));
	//session
app.use(session({
  secret: process.env.SESSION_SECRET, 
  resave: false, 
  saveUninitialized: false 
}));
const PORT = process.env.PORT

// Controllers
const userController = require('./controllers/userController.js');
app.use('/users', userController)

app.listen(PORT, () => {
	console.log('listening');
})