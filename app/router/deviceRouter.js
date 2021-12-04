const express = require('express');
const deviceRouter = express.Router();

const deviceController = require('../controller/deviceController');
const Device = require('../model/device');
const User = require('../model/user');

deviceRouter.post('/getDeviceInfo', deviceController.onGetDeviceInfo);
deviceRouter.post('/createDevice', deviceController.onCreateDevice);


//edit sate automatic - ON OFF
deviceRouter.put("/editDevice/:id", async (req, res) => {
    try {
        const device = await Device.findById(req.params.id);
        if (device) {
            if (device.connectState == 'pending') {
                device.connectState = 'active';
                await User.findOneAndUpdate({ _id: device.creatorId, "devices.connectState": "pending" }, {
                    $set: {
                        "devices.$.connectState": "active"
                    }
                })
            }

            if (device.stateHistory.length >= 50) {
                device.stateHistory.shift();
            }

            // User time limit outdate
            if (device.actionHistory[device.actionHistory.length - 1].keepTo < Date.now()) {
                device.stateHistory.push({
                    temperature: req.query.temperature,
                    humidity: req.query.humidity,
                    actorState: req.query.actorStateRequest
                })
                if (device.actionHistory.length > 50) device.actionHistory.shift();
                device.actionHistory.push({
                    from: "device",
                    action: device.stateHistory[device.stateHistory.length - 1].actorState,
                    keepTo: Date.now()
                })
            } else {
                device.stateHistory.push({
                    temperature: req.query.temperature,
                    humidity: req.query.humidity,
                    actorState: device.actionHistory[device.actionHistory.length - 1].action
                })
            }

            await Device.findByIdAndUpdate(req.params.id, {
                $set: device
            })
            res.status(200).json("," + device.stateHistory[device.stateHistory.length - 1].actorState + "," + device.actionHistory[device.actionHistory.length - 1].from + ",");
        }
    } catch (error) {
        console.log(error)
        res.status(500).json("error");
    }
});

//state is edited by user - manual
deviceRouter.put("/editByUser/:id", async (req, res) => {
    try {
        const device = await Device.findById(req.params.id);
        if (device.creatorId === req.body.userId) {
            try {
                if (device.actionHistory.length > 50) device.actionHistory.shift();
                device.actionHistory.push({
                    from: "user",
                    action: req.body.action,
                    keepTo: req.body.keepTo
                })
                await Device.findByIdAndUpdate(req.params.id, {
                    $set: device
                });
                res.status(200).json(device);
            } catch (error) {
                res.status(500).json(error);
            }
        } else {
            res.status(404).json("you cant modify here !!!");
        }

    } catch (error) {
        res.status(500).json(error);
    }
})

module.exports = deviceRouter;