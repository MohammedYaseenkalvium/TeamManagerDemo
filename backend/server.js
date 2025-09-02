require("dotenv").config();
const express = require("express");
const cors  = require("cors");
const path = require("path");
const connectDB = require("./config/db");


const app = express();

//Middleware for handling CORS
app.use(
    cors({
        origin:process.env.CLIENT_URL ||"*",
        methods: ["GET","POST","PUT","DELETE"],
        allowedHeaders:["Content-Type","Authorization"],
    })
);

// Connect Database
connectDB();

//Middleware
app.use(express.json());



//Routes
// app.use("/api/auth", authRoutes);
// app.use("/api/users",userRoutes);
// app.use("/api/tasks",taskRoutes);
// app.use("/api/reports",reportRoutes);

//Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT,()=>console.log(`server is running on port ${PORT}`));
