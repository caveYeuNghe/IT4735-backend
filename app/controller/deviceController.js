const Device = require('../model/device');
const User = require('../model/user')
const mongoose = require("mongoose");
module.exports = {
    getAllDevice: async (req, res) => {
        try {
            let devices = await Device.find();
            res.send({devices});
        } catch (error) {
            res.status(500).send({
                success: false,
                error: "Internal Server Error!"
            })
        }
    },

    getDevice: async (req, res) => {
        try {
            try {
                mongoose.Types.ObjectId(req.params.deviceId);
            } catch (e) {
                res.status(404).send({
                    error: "Not found deviceId"
                })
            }
            const deviceId = req.params.deviceId;
            let device = await Device.find(deviceId);
            if (!device) {
                res.status(404).send({error: "Device not found"})
            } else {
                res.status(200).send({device})
            }
        } catch (error) {
            res.status(500).send({
                success: false,
                error: "Internal Server Error!"
            })
        }
    },

    createDevice: async (req, res) => {
        try {
            let user = await User.findById(req.body.userId);
            if (!user) {
                res.send({
                    error: "User doesn't exist!"
                })
            } else {
                let device = await Device.createDevice(req.body);
                await device.save();
                res.send({device})

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