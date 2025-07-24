const mongoose = require('mongoose');
const bccrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true
    },createdAt: {
        type: Date,
        default: Date.now
    },
    favorites: [{
        itemType: {
            type: String,
            enum: ['planet', 'image', 'article', 'wonder'],
            required: true
        },
            itemId: {
            type: String,
            required: true
        },
        name: {
            type: String
        },
        imageUrl: {
            type: String
        },
        addedAt: {
            type: Date,
            default: Date.now
        }
    }]
});

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    try {
        const salt = await bccrypt.genSalt(10);
        this.password = await bccrypt.hash(this.password, salt);
        next();
    } catch (error) {
        return next(error);
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
