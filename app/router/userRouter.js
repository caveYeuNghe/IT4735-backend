const express = require('express');
const userRouter = express.Router();

const userController = require('../controller/userController');

userRouter.get('/login', userController.login);
userRouter.get('/', userController.getAllUser);
userRouter.post('/', userController.Signup);
userRouter.get('/:userId', userController.getUser)
userRouter.get('/:userId/devices', userController.getAllDevicesByUserId)

module.exports = userRouter;