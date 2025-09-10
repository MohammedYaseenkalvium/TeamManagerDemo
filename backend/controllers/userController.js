const Task = require("../models/Task");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

//@desc Get all users(admin Only)
//@route Get /api/users
//@access Private(Admin)

const getUsers = async(req,res)=>{
    try{
        const users = await User.find({role:'member'}).select("-password");

        // Add task to each user
        const usersWithTaskCounts = await Promise.all(user.map(async(user)=>{
            const pendingTasks = await Task.countDocuments({asssignedTo:user._id,status:"Pending"});
            const inProgressTasks = await Task.countDocuments({asssignedTo:user._id,status:"In Progress"});
            const completedTasks = await Task.countDocuments({asssignedTo:user._id,status:"Completed"});
            
            return{
                ...user._doc,
                pendingTasks,
                inProgressTasks,
                completedTasks,
            } ;
        }));
        res.json(usersWithTaskCounts);
    }catch(error){
        res.status(500).json({message:"Servor error",error:error.message});

    }
};

//@desc get user by Id
//@route GET/api/users/:id
//@access Private

const getUserById = async(req,res)=>{
    try{
        const user = await User.findById(req.params.id).select("-password");
        if (!user) return res.status(404).json({message:"User not found"});
        res.json(user);
    }catch(error){
        res.status(500).json({message:"Server error",error:error.message});

    }
}



module.exports = {getUsers,getUserById};

