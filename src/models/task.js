const mongoose = require('mongoose')
const validator = require('validator')
const User = require('../models/user')

const taskSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: Boolean,
        default: false
    }
    ,
    duedate: {
        type: String,
        required: true,
        validate(value) {
            if (!validator.isDate(value)) {
                throw new Error('Date is not valid!')
            }
        }
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
},{
    timestamps: true
})

const Task = mongoose.model('Task', taskSchema)

module.exports = Task