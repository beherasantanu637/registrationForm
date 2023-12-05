const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const dotenv = require('dotenv');
const app = express ()
dotenv.config();
const port= process.env.PORT || 3000 ;

const username=process.env.MONGODB_USERNAME;
const password=process.env.MONGODB_PASSWORD;
mongoose.connect(`mongodb+srv://${username}:${password}@cluster.4a3qqlb.mongodb.net/registrationFormDB`)

//registration schema
const registrationSchema=new mongoose.Schema({
    firstname:String,
    lastname:String,
    email:String,
    password:String,
})

//model of registration schema
const Registration=mongoose.model('Registration',registrationSchema)
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
 

app.get('/',(req,res)=>{
    res.sendFile(__dirname + "/public/index.html")
})
app.post('/register', async (req, res) => {
  try {
      const { firstname, lastname, email, password } = req.body;

      // Check if the user already exists
      const existingUser = await Registration.findOne({ email: email });

      if (!existingUser) {
          // If the user does not exist, create a new registration
          const registrationData = new Registration({
              firstname,
              lastname,
              email,
              password
          });

          await registrationData.save();
          res.redirect('/success');
      } else {
          // If the user already exists, redirect to the error page
          console.log('User already exists');
          res.redirect('/existingUser');
      }
  } catch (error) {
      console.error('Error during registration:', error);
      res.redirect('/error');
  }
});

app.get('/success',(req,res)=>{
    res.sendFile(__dirname+'/public/success.html');
})
app.get('/error',(req,res)=>{
    res.sendFile(__dirname+'/public/error.html');
})
app.get('/existingUser',(req,res)=>{
    res.sendFile(__dirname+'/public/existingUser.html');
})
  


app.listen(port,()=>{
    console.log(`server running at ${port}`)
})