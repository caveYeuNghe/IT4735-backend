const mongoose = require('mongoose');
const User = require('../model/user')

module.exports = {
    onLogin: async (req, res) => {
        try {
            console.log(req.body);
            let user = await User.findOne({username: req.body.username});
            if (!user) {
                res.send({
                    success: false,
                    error: "Account doesn't exist!"
                })
            } else if (user.password !== req.body.password) {
                res.send({
                    success: false,
                    error: "Wrong password!"
                })
            } else {
                res.send({
                    success: true,
                    userId: user._id,
                    username: user.username
                })
            }
        } catch (err) {
            res.send({
                success: false,
                error: "Internal Server Error!"
            })
        }
    },
    onSignUp: async (req, res) => {
        try {
            console.log(req.body)
            if (!req.body.username || !req.body.password) res.send({
                success: false,
                error: "Invalid!"
            })
            let existedUser = await User.findOne({username: req.body.username});
            if (existedUser) {
                res.send({
                    success: false,
                    error: "Account exist!"
                })
            } else {
                let user = new User({
                    _id: new mongoose.Types.ObjectId,
                    username: req.body.username,
                    password: req.body.password,
                    device: []
                })
                await user.save();
                res.send(user);
            }
        } catch (error) {
            console.log(error);
            res.status(500).send({
                success: false,
                error: "Internal Server Error!"
            })
        }
    }
}