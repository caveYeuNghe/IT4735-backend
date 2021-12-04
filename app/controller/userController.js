const User = require('../model/user');

module.exports = {
    onGetUserInfo: async (req, res) => {
        try {
            let user = await User.findById(req.body.userId);
            if (!user) {
                res.send({
                    success: false,
                    error: "User doesn't exist!"
                })
            } else {
                res.send({
                    success: true,
                    user: user
                })
            }
        } catch (error) {
            res.status(500).send({
                success: false,
                error: "Internal Server Error!"
            })
        }
    }
}