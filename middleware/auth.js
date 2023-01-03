const jwt = require('jsonwebtoken');
const dotenv = require('dotenv')
dotenv.config();
const User = require("../models/user.model")

exports.isAuthenticated = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        if (!token) {
            return res.status(401).json({
                message: 'Unauthorized',
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
            return res.status(401).json({
                message: 'Unauthorized',
            });
        }
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            message: 'Unauthorized',
        });
    }
};
exports.validateAdmin = async (req, res, next) => {
    try {
        const user = await User.findById({_id:req.user.id})
        console.log(user.role)
       if(user.role !== "admin"){
        return res.status(401).json({error:"You are unauthorized to perform this action "})
       }
       next()
    } catch (error) {
     return res.status(500).json({ error:error});
    }
};

// module.exports = isAuthenticated;