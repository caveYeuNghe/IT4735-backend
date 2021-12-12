const express = require('express');
const userRouter = express.Router();
const deviceController = require('../controller/deviceController');
const userController = require('../controller/userController');

userRouter.post('/login', userController.login);
userRouter.post('/logout', userController.logout);
userRouter.get('/', userController.getAllUser);
userRouter.post('/', userController.Signup);
userRouter.get('/:userId', userController.getUserAndDevices)
userRouter.post('/:userId/devices', deviceController.createDeviceByUserId)

module.exports = userRouter;
