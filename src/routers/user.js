const express = require('express')
const { default: mongoose } = require('mongoose')
const User = require('../models/user')
const router = new express.Router()
const jwt = require('jsonwebtoken')
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp');
const {sendWelcomeEmail, sendLeavingEmail} = require('../emails/account');


//new user
router.post('/users', async (req, res) => {
    const user = new User(req.body)

    try {
        await user.save();
        //sendWelcomeEmail(user.email,user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token });
    }
    catch (error) {
        res.status(400).send(error);
    }
})

//login
router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user, token })
    }
    catch (e) {
        res.status(400).send(e)
    }
})

//read profile
router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})


const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req,file,cb) {
        if(!file.originalname.match(/\.(jpg|png|jpeg)$/)){
            return cb(new Error('Please provide an image for the avatar.'));
        }
        cb(undefined, true)
    }
})

router.post('/users/me/avatar', auth, upload.single('upload'),async (req,res)=>{
    const buffer = await sharp(req.file.buffer).resize({width: 400, height: 400}).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (error,req,res,next)=>{
    res.status(400).send({error:error.message})
})

router.delete('/users/me/avatar', auth, async (req,res)=>{
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

router.get('/users/:id/avatar',async (req,res)=>{
    try{
        const user = await User.findById(req.params.id)
        if(!user || !user.avatar){
            throw new Error()
        }
        res.set('Content-Type','image/jpg')
        res.send(user.avatar)
    }
    catch(e){
        res.status(404).send()
    }
})

//update profile
router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowUpdates = ['name', 'email', 'password', 'age', 'married']
    const isValid = updates.every((update) => allowUpdates.includes(update))

    if (!isValid) {
        return res.status(400).send({ error: 'Invalid Updates!' })
    }


    try {
        updates.forEach((update) => req.user[update] = req.body[update])

        await req.user.save()

        res.send(req.user)

    }
    catch (e) {
        res.status(400).send(e)
    }
})



//logout
router.post('/users/logout', auth, async (req, res, next) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()
        res.send()
    }
    catch (e) {
        res.status(500).send()
    }
})

//logout all
router.post('/users/logoutAll', auth, async (req, res, next) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    }
    catch (e) {
        res.status(500).send()
    }
})

//delete user
router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove()
        res.send(user)
    }
    catch (e) {
        res.status(500).send()
    }
})

module.exports = router