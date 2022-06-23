const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    age: {
        type: Number,
        default: 0,
        validate(value){
            if(value<0){
                throw new Error('Age can not be negative')
            }
        }

    },
    married: {
        type: Boolean,
        default: false
    },
    email: {
        type: String,
        unique: true,
        trim: true,
        lowercase: true,
        required: true,
        validate(email){
            if(!validator.isEmail(email)){
                throw new Error('Invalid Email address.')
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 7,
        validate(password){
            if(password.toLowerCase().includes('password')){
                throw new Error('Password can not be \'password\'')
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
},{
    timestamps: true
})

userSchema.virtual('tasks',{
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

userSchema.methods.toJSON = function(){
    const user = this
    const userObject = user.toObject()

    delete userObject.tokens
    delete userObject.password
    delete userObject.avatar

    return userObject
}

userSchema.methods.generateAuthToken = async function (){
    const user = this
    const token = jwt.sign({_id: user.id.toString()},process.env.JWT_SECRET)
    
    user.tokens = user.tokens.concat({token})
    await user.save()
    return token
}

userSchema.statics.findByCredentials = async(email,password)=>{
    const user = await User.findOne({email})
    if(!user){
        throw new Error('Unable to login')
    }
    const isMatch = await bcrypt.compare(password,user.password)

    if( !isMatch){
        throw new Error('Unable to login')
    }
    return user
}

userSchema.pre('save', async function(next){
    const user = this

    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password,8)
    }
    next()
})

userSchema.pre('remove', async function(next){
    const user = this
    await Task.deleteMany({owner: user._id})
    next() 
})

const User = mongoose.model('user',userSchema)

module.exports = User


// htvghgvev