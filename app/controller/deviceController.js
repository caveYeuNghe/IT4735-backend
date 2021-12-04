const Device = require('../model/device');
const User = require('../model/user')
module.exports = {
    onGetDeviceInfo: async (req, res) => {
        try {
            let device = await Device.findById(req.body.deviceId);
            if (!device) {
                res.send({
                    success: false,
                    error: "Device doesn't exist!"
                })
            } else {
                res.send({
                    success: true,
                    device: device
                })
            }
        } catch (error) {
            res.status(500).send({
                success: false,
                error: "Internal Server Error!"
            })
        }
    },
    onCreateDevice: async (req, res) => {
        try {
            let user = await User.findById(req.body.userId);
            if (!user) {
                res.send({
                    success: false,
                    error: "Unknown user!"
                })
            } else {
                if (user.devices != null && user.devices[user.devices.length - 1]?.connectState == 'pending') {
                    res.send({
                        success: false,
                        error: "Device is pending",
                        deviceId: user.devices[user.devices.length - 1].deviceId
                    })
                } else {
                    let newDevice = await Device.createDevice(req.body);
                    console.log(newDevice);
                    user.devices.push({
                        deviceId: newDevice._id,
                        location: req.body.location,
                        deviceName: newDevice.deviceName,
                        connectState: newDevice.connectState
                    })
                    await user.save();
                    res.send({
                        success: true,
                        devices: user.devices
                    })
                }
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