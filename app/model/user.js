const e = require('express')
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/IoT', { useNewUrlParser: true, useUnifiedTopology: true });

const UserSchema = mongoose.Schema({
    _id: mongoose.Types.ObjectId,
    userName: String,
    password: String,
})

UserSchema.statics = {
    checkExist: async function (data) {
        try {
            let user = await this.findOne({ username: data.username });
            if (user) {
                return true;
            } else return false;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = mongoose.model('User', UserSchema);