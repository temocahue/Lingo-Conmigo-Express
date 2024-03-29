//user controller
const express = require('express')
const router = express.Router()
const User = require('../models/user')
const bcrypt = require('bcryptjs')
const dotenv = require('dotenv').config()
const superagent = require('superagent');

// login
router.post('/login', async (req, res, next) => {
  if(!req.body.username){
    return res.send({
      success: false,
      message:'Error: username cannot be blank'
    })
  }
  if(!req.body.password){
    return res.send({
      success: false,
      message: 'Error: password cannot be blank'
    })
  }
 try {
    const foundUser = await User.findOne({username: req.body.username});
    if (foundUser) {
      if (bcrypt.compareSync(req.body.password, foundUser.password)) {
        req.session.message = '';
        req.session.userId = foundUser.id;
        req.session.logged = true;
        console.log(foundUser);
        console.log('password correct');
        foundUser.password = undefined
        res.send({
          success: true,
          message: 'Valid sign in',
          user: foundUser

        })
      }
      else {
        console.log(`Username or password is incorrect`);
        req.session.message = `Username or password is incorrect`;
        res.send({
          success: false,
          message: 'Error: server error'

        })
      }
    }
    else {
      console.log(`Username or password is incorrect`);
      req.session.message = `Username or password is incorrect`
      res.send({
        success: false,
        message: 'Error: server error'

      })
    }
  }
  catch(err) {
    next(err)
  }
})

router.post('/register', (req, res, next) => {
  console.log(req.body)
    if (!req.body.username) {
        return res.send({
            success: false,
            message: 'Error: username cannot be blank.'
        });
    }
    if (!req.body.password) {
        return res.send({
            success: false,
            message: 'Error: Password cannot be blank.'
        });
    }

    const username = req.body.username
    User.find({
        username: username
    }, (err, previousUsers) => {
        if (err) {
            return res.send({
                success: false,
                message: 'Error: Server error'
            });
        } else if (previousUsers.length > 0) {
            return res.send({
                success: false,
                message: 'Error: Account already exist.'
            });
        }
        // Save the new user
        const encryptedPassword = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10))
        const userToCreate = {
            username: username,
            password: encryptedPassword,
            bio: req.body.bio,
            nativeLanguage: req.body.nativeLanguage,
            languageOfInterest: req.body.languageOfInterest
        }
        const newUser = User.create(userToCreate)
        console.log(newUser);
        console.log('\nhitting route');
        userToCreate.password = undefined
        return res.send({
            success: true,
            message: 'Signed up',
            user: userToCreate
        });
    });
}); 
// end of sign up endpoint
// stores regitered user into db

// // profile route
router.get('/profile', async (req, res, next) => {
  try{
  const findUser = await User.findById(req.session.userId);
  const removePwFromUser = findUser.password = undefined
  res.json(findUser)
  } catch(err){
    console.log(findUser);
  }
})


router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if(err){
      return
      res.send(err);
    } else {
        return res.send({
          success: true,
          message: 'Good'
      });
    }
  })

})
// // get users for amigo list
router.get('/findAmigos', async (req, res) => {
  const findUser = await User.findById(req.session.userId);

  console.log("this is findUser in /findAmigos")
  console.log(findUser)
  
  const language = findUser.languageOfInterest
  console.log(language)
  const matchingUsers = await User.find().where({nativeLanguage: language})

  for(let i = 0; i < matchingUsers.length; i++) {
    const removePwFromUser = matchingUsers[i].password = undefined
  }  
  console.log("this is matchingUsers in findAmigos")
  console.log(matchingUsers)
  res.json(matchingUsers)
})
//get search
router.delete('/:id', async (req, res) => {
   try{
    const deleteAmigo = await User.findByIdAndRemove(req.params.id)
    res.send({
      message: deleteAmigo,
      status:'amigo deleted',
      success: true
    })
  }
  catch(err){
    res.send({
      message:'failed to update',
      success: false
    })

  }
})


// // route spanish page
router.get('/search', async (req, res) => {
  try {
    const url = 'https://dictionaryapi.com/api/v3/references/spanish/json/' + req.body.search + '?key='+ process.env.API_KEY
    const response = await superagent.get(url);
    const data = JSON.parse(response.text)
    console.log(data);
    const translation =
    {
      hw:data[0].hwi.hw,
      shortdef: data[0].shortdef
    }
    res.send(translation) 
  } catch (err) {
    console.error(err);
  }
});
router.put('/:id', async (req, res, next) => {
  try{
    const updateBio = await User.findByIdAndUpdate(req.params.id, req.body, {new:true});
    await updateBio.save()
    res.send({
      message: updateBio,
      status:'message updated',
      success: true
    })
  }
  catch(err){
    res.send({
      message:'failed to update',
      success: false
    })
  }
})

module.exports = router;



