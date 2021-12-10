const express = require('express');
const userRouter = express.Router();
const deviceController = require('../controller/deviceController');
const userController = require('../controller/userController');

userRouter.get('/login', userController.login);
userRouter.get('/', userController.getAllUser);
userRouter.post('/', userController.Signup);
userRouter.get('/:userId', userController.getUser)
userRouter.get('/:userId/devices', userController.getAllDevicesByUserId)
userRouter.post('/:userId/devices', deviceController.createDeviceByUserId)

module.exports = userRouter;