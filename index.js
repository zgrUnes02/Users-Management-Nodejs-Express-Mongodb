
const express = require('express') ;
const app = express() ;
const mongoose = require('mongoose') ;
const jwt = require('jsonwebtoken') ;
const port = 3000 ;
const User = require('./models/User.js') ;
const secretKey = 'qwerty2023' ;

//! JSON
app.use(express.json()) ;

//! PORT
app.listen(port , () => {
    console.log(`The server is running on localhost:${port}`) ;
})

//! CONNECTION
mongoose.connect('mongodb://localhost:27017/user').then(() => {
    console.log('The has been accepted with success') ;
}).catch((error) => {
    console.log(error) ;
})

//! ALL USERS
app.get('/users' , async (req , res) => {
    const users = await User.find({}) ;
    res.status(200).json({
        'status' : 200 ,
        'users' : users ,
    }) ;
})

//! NEW USER 
app.post('/users' , async (req , res) => {
    try {
        const user = await User.create(req.body) ;
        res.status(200).json({
            'status' : 200 ,
            'message' : 'The user has been created with success' ,
            'user' : user
        }) ;
    }
    catch (error) {
        res.status(404).json({
            'status' : 404 ,
            'message' : error.message
        }) ;
    }
})

//! DELETE USER
app.delete('/users/delete/:id' , async (req , res) => {
    try {
        await User.findByIdAndDelete(req.params.id)
        res.status(200).json({
            'status' : 200 ,
            'message' : 'The user has been deleted with success' 
        }) ;
    }
    catch (error) {
        res.status(404).json({
            'status' : 404 ,
            'message' : error
        }) ;
    }
})

//! UPDATE USER
app.put('/users/update/:id' , async (req , res) => {
    try {
        await User.findByIdAndUpdate(req.params.id , req.body) ;
        res.status(200).json({
            'status' : 200 ,
            'message' : 'The user has been updated with success' 
        }) ;
    }
    catch (error) {
        res.status(404).json({
            'status' : 404 ,
            'message' : error
        }) ;
    }
})

//! LOGIN
app.post('/users/login' , async (req , res) => {
    try {
        const {email , password} = req.body ;
        const userExists = await User.find({email:email , password:password}) ;

        if (userExists.length == 0) {
            res.status(404).json({
                'message' : 'There is no user with this credentials' ,
            }) ;
        }
        else {
            const token = jwt.sign({email:email} , secretKey) ;
            res.status(404).json({
                'message' : 'welcome back :)' ,
                'token' : token
            }) ;          
        }
    } 
    catch (error) {
        res.status(200).json(error)
    }
}) ;   

//! REGISTER 
app.post('/users/register' , async (req , res) => {
    try {
        const {name , email , password} = req.body ;
        const userExists = await User.find({email:email}) ;

        if (userExists.length == 0) {
            const newUser  = await User.create(req.body) ;
            if (newUser) {
                const token = jwt.sign({email:email} , secretKey) ;
                res.status(404).json({
                    'message' : 'The user has been registred with success' ,
                    'token' : token
                }) ;
            }
        }
        else {
            res.status(501).json({
                'status' : 501 ,
                'message' : 'The user is already exists' ,
            }) ;          
        }
    } 
    catch (error) {
        res.status(200).json(error)
    }
}) ;

//! MIDDLEWARE
const middleware = (req , res , next) => {
    const authHeader = req.headers['authorization'] ;
    const token = authHeader.split('')[1] ;
    
    if (!token) {
        res.status(404).json({
            'status' : 404 ,
            'message' : 'Something went wrong' ,
        }) ; 
    }

    jwt.verify(token , secretKey , (user , error) => {
        if (error) {
            res.status(401).json({
                'status' : 401 ,
                'message' : 'Something went wrong' ,
            }) ; 
        }
        req.user = user ;
        next() ;
    }) ;
}