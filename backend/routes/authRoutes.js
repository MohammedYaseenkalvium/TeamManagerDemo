const express = require("express");

const router = express.Router();

//Auth Routes   
router.post("/register",registerUser);  //Register User
router.post("/login",loginUser);        // Login User
router.get("/profile",protect,getUser); // Get User profile
router.put("/profile",protect,updateUserProfile); //Update Profile

module.exports = router;
