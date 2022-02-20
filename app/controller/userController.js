const User = require('../model/user');
const Device = require('../model/device');
const bcrypt = require('bcryptjs')
const mongoose = require('mongoose');
const { rawListeners } = require('../model/device');

module.exports = {
    login: async (req, res) => {
        console.log(req.body)
        try {
            const user = await User.findByCredentials(req.body.username, req.body.password)
            const token = await user.generateAuthToken()
            res.status(200).send({user, token})
        } catch(e) {
            res.status(400).send(e)
        }
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
                console.log(req.body)
                const user = new User({
                    ...req.body,
                    role: "user",
                    _id: new mongoose.Types.ObjectId,
                })

                try {
                    try {
                        await user.save()
                    } catch (e) {
                        console.log(e)
                    }

                    console.log("1")
                    const token = await user.generateAuthToken()
                    res.status(201).send({user, token})
                } catch (e) {
                    res.status(400).send(e)
                }
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
            req.user.tokens = req.user.tokens.filter((token) => {
                return token.token !== req.token
            })
            await req.user.save()
    
            res.status(200).send("log out successfully")
    
        } catch (e) {
            res.status(500).send()
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
    },
    getCurrentUser: async (req, res) => {
        try {
            let user = req.user
            res.send(user)
        } catch (error) {
            res.status(500).send({
                success: false,
                error: "Internal Server Error!"
            })
        }
    }
}
