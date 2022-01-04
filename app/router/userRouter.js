const express = require('express');
const userRouter = express.Router();
const deviceController = require('../controller/deviceController');
const userController = require('../controller/userController');
const auth = require("../middleware/auth")

userRouter.post('/login', userController.login);
userRouter.post('/logout', auth, userController.logout);
userRouter.get('/', userController.getAllUser);
userRouter.get('/currentuser', auth, userController.getCurrentUser);
userRouter.post('/', userController.Signup);
userRouter.get('/:userId', auth, userController.getUserAndDevices)
userRouter.post('/:userId/devices', auth, deviceController.createDeviceByUserId)

module.exports = userRouter;
