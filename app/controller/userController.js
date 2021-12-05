const User = require('../model/user');
const Device = require('../model/device')
const mongoose = require('mongoose');

module.exports = {
    login: async (req, res) => {
        try {
            let user = await User.findOne({userName: req.body.userName})
            if (!user) {
                res.send({
                    error: "User doesn't exist!"
                })

            } else if (user.password !== req.body.password) {
                res.status(404).send({
                    error: "Wrong password!"
                })
            } else {
                res.send({user})
            }
        } catch (e) {
            res.status(500).send({
                error: "Internal Server Error"
            })
        }
    },
    getAllUser: async (req, res) => {
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
            console.log(req.body)
            if (!req.body.userName || !req.body.password)
                res.status(401).send({
                    error: "Invalid username or password"
                })
            let existedUser = await User.findOne({userName: req.body.userName});
            if (existedUser) {
                res.status(401).send({
                    error: "Account exist"
                })
            } else {
                let user = new User({
                    _id: new mongoose.Types.ObjectId,
                    userName: req.body.userName,
                    password: req.body.password,
                    devices: []
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
    },
    getUser: async (req, res) => {
        try {
            let user = await User.findById(req.params.userId);
            if (!user) {
                res.send({
                    error: "User doesn't exist!"
                })
            } else {
                res.send({
                    user: user
                })
            }
        } catch (error) {
            res.status(500).send({
                success: false,
                error: "Internal Server Error!"
            })
        }
    },
    getAllDevicesByUserId: async (req, res) => {
        try {
            mongoose.Types.ObjectId(req.params.userId);
        }catch (e) {
            res.status(404).send({
                error: "Not Found userId",
            })
        }
        const userId = mongoose.Types.ObjectId(req.params.userId);
        const query = {userId: req.params.userId}
        let user = await User.findById(userId);
        if (!user)
            res.status(404).send({
                error: "User not found"
            })
        let devices = await Device.find(query);
        if (devices)
            res.send({devices})
    }



}