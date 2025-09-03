const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

//Generate JWT Token
const generateToken = (userId)=>{
    return jwt.sign({id:userId},process.env.JWT_SECRET,{expiresIn:"7d"});

};

// @desc   Register a new User
// @route  POST/api/auth/register
// @access PUBLIC

const registerUser = async(req,res)=>{};

// @desc   Login User
// @route  POST/api/auth/login
// @access PUBLIC

const loginUser  = async(req,res)=>{};

//@desc Get user profile
//@route GET /api/auth/profile
//@accesx Private{Requires JWT}

const getUserProfile = async(req,res)=>{};

//@desc     Update user Profile
//@route    PUT /api/auth.profile
//@access   Private{Requries JWT}

const updateUserProfile = async(req,res)=>{};

module.exports = {registerUser,loginUser,getUserProfile,updateUserProfile}