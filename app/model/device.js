
const mongoose = require('mongoose');

const DeviceSchema = mongoose.Schema({
    _id: mongoose.Types.ObjectId,
    deviceName: String,
    connectState: {
        type: String,
        enum: ["ON", "OFF"]
    },
    location: String,
    userId: String,
    stateHistory: [{
        at: {
            type: Date,
            default: Date.now()
        },
        temperature: Number,
        humidity: Number,
        co2: Number,
        dust: Number
    }]


})

DeviceSchema.statics = {
    createDevice: async function (data) {
        try {
            let device = new this({
                _id: data._id,
                deviceName: data.deviceName,
                connectState: "OFF",
                location: data.location,
                userId: data.userId,
                stateHistory: data.stateHistory,
            })
            await device.save();
            return device;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = mongoose.model('Device', DeviceSchema);