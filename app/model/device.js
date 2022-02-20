
const mongoose = require('mongoose');

const DeviceSchema = mongoose.Schema({
    _id: mongoose.Types.ObjectId,
    embedId: String,
    deviceName: String,
    isPublic: {type: Boolean, default: false},
    connectState: {
        type: String,
        enum: ["ON", "OFF"]
    },
    location: [],
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
                _id: new mongoose.Types.ObjectId,
                embedId:data.embedId,
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