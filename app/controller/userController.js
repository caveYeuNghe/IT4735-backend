const User = require('../model/user');
const Device = require('../model/device');
const bcrypt = require('bcryptjs')
const mongoose = require('mongoose');
const passport = require("passport");
const passportLocal = require("passport-local").Strategy;
const { rawListeners } = require('../model/device');

module.exports = {
    login: async (req, res,next) => {
        // console.log(req.body)
        await passport.authenticate("local", (err, user, info) => {
            if (err) {
                console.log(err)
                throw err
            }
            if (!user) res.send("User does not exist!");
            else {
              req.logIn(user, (err) => {
                if (err) throw err;
                // console.log(req.user)
                res.send("Successfully logged in!");
              });
            }
        })(req, res, next);
    },
    getAllUser: async (req, res) => {
        console.log(req.user)
        let users = await User.find();
        if (users)
            res.status(200).send({users})
        if (users.length === 0)
            res.status(404).send({
                error: "Not found"
            })
    },
    Signup: async (req, res) => {
        try {
            // console.log(req.body)
            if (!req.body.username || !req.body.password){
                res.status(401).send({
                    error: "Invalid username or password"
                })
            }
            let existedUser = await User.findOne({username: req.body.username});
            if (existedUser) {
                res.status(401).send({
                    error: "Account exist"
                })
            } else {
                const hashedPassword = await bcrypt.hash(req.body.password, 10);
                let user = new User({
                    _id: new mongoose.Types.ObjectId,
                    username: req.body.username,
                    password: hashedPassword,
                    devices: []
                })
                await user.save();
                // console.log(user)
                res.send(user);
            }
        } catch (error) {
            console.log(error);
            res.status(500).send({
                success: false,
                error: "Internal Server Error!"
            })
        }
    },
    logout: async (req, res) => {
        try {
            await req.logout();
            res.send("log out successfully!");
        } catch (error) {
            res.status(500).send(error)
        }
    },
    getUserAndDevices: async (req, res) => {
        try {
            let user = await User.findById(req.params.userId);
            if (!user) {
                res.send({
                    error: "User doesn't exist!"
                })
            } else {
                devices = await Device.find({userId: req.params.userId})
                res.send({
                    user: user,
                    devices: devices
                })
            }
        } catch (error) {
            res.status(500).send({
                success: false,
                error: "Internal Server Error!"
            })
        }
    }
}
