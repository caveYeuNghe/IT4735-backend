const express = require('express');
const userRouter = express.Router();
const userController = require('../controller/userController');

userRouter.post('/login', userController.login);
userRouter.post('/logout', userController.logout);
userRouter.get('/', userController.getAllUser);
userRouter.post('/', userController.Signup);
userRouter.get('/:userId', userController.getUser)
// userRouter.get('/:userId/devices', userController.getAllDevicesByUserId)
userRouter.post('/:userId/devices', userController.createDevice);

module.exports = userRouter;