const { response } = require("express");
const Task  = require("../models/Task");

//@desc get all tasks(Admins:all, User:only assigned tasks)
//@route GET/api/tasks
//@access Private

const getTasks  = async (req,res) => {
    try{
        const {status} = req.query;
        let filter = {};

        if(status){
            filter.status = status;
        }
        let tasks;
        if (req.query.role ==="admin"){
            tasks = await Task.find(filter).populate(
                "assignedTo",
                "name email profileImageUrl"
            )
        }else{
           tasks = await Task.find({...filter,asssignedTo:req.user._id}).populate(
            "assignedTo",
            "name email profileImageUrl"
            );
        }
        //Add completed todoChecklist count to each task
        tasks = await Promise.all(
            tasks.map(async (task)=>{
                const completeCount = task.todoChecklist.filter(
                    (item)=>item.completed
                ).length;
                return{...task._doc,completedTodoCount:completeCount};
            })
        );
        //Status summary counts
        const allTasks = await Task.countDocuments(
            req.user.role==="admin"?{} :{asssignedTo:req.user._id}
        );

        const pendingTasks = await Task.countDocuments({
            ...filter,
            status:"Pending",
            ...(req.user.role !== "admin" && {assignedTo:req.user._id}),
        });

        const inProgressTasks = await Task.countDocuments({
            ...filter,
            status:"In Progress",
            ...(req.user.role !== "admin" && {assignedTo:req.user._id}),
        });

        const completedTasks = await Task.countDocuments({
            ...filter,
            status:"Completed",
            ...(req.user.role !== "admin" && {assignedTo:req.user._id}),
        })

        res.json({
            tasks,
            statusSummary:{
                all: allTasks,
                pendingTasks,
                inProgressTasks,
                completedTasks,
            },
        });
    }catch(error){
        res.status(500).json({message:"Server error",error:error.message});
    }
};

//@desc GET task by 10
//@route GET/api/tasks/:id
//@access Private

const getTaskById = async (req,res)=>{
    try{
     const task = await Task.findById(req.params.id).populate(
        "assignedTo",
        "name email profileImageUrl"
     );

     if(!task) return res.status(404).json({message:"Task not found"});
     res.json(task);
    }catch(error){
        res.status(500).json({message:"Server error",error:error.message});
    }
};

//@desc Create a new task(Admin only)
//@route POST/api/tasks
//@access Private{Admin}
const createTask = async(req,res)=>{
    try{
       const{
        title,
        description,
        priorty,
        dueDate,
        assignedTo,
        attachments,
        todoChecklist,
       }=req.body;

       if(!Array.isArray(assignedTo)){
        return res
            .status(400)
            .json({message:"assignedTo must be an array of user IDs"});
       }
       const task = await Task.create({
        title,
        description,
        priorty,
        dueDate,
        assignedTo,
        createdBy:req.user._id,
        todoChecklist,
        attachments
       });

       res.status(201).json({message:"Task created successfully", task});
    }catch(error){
        res.status(500).json({message:"Server error",error:error.message});
    }
};

//@desc Update task details
//@route PUT/api/tasks/:id
//@access Private
const updateTask = async(req,res)=>{
    try{
        const task = await Task.findById(req.params.id);

        if(!task) return res.status(404).json({message:"Task not found"});

        task.title = req.body.title || task.title;
        task.description = req.body.description || task.description;
        task.priorty = req.body.priorty || task.priorty;
        task.dueDate = req.body.dueDate || task.dueDate;
        task.todoChecklist = req.body.todoChecklist || task.todoChecklist;
        task.attachments = req.body.attachments || task.attachments;

        if(req.body.assignedTo){
            if(!Array.isArray(req.body.assignedTo)){
               return res
                .status(400)
                .json({message:"assignedTo must be an array of user IDs"});
            }
            task.asssignedTo = req.body.assignedTo;
        }

        const updatedTask = await task.save();
        res.json({message:"Task Updated Successfully",updatedTask});

    }catch(error){
        res.status(500).json({message:"Server error",error:error.message});
    }
};

//@desc Delete a task(Admin only)
//@route DELETE/api/tasks/:id
//@access Private(admin only)

const deleteTask = async(req,res)=>{
    try{
        const task = await Task.findById(req.params.id);

        if(!task) return res.status(404).json({message:"Task not found"});

        await task.deleteOne();
        res.json({message:"Task deleted successfully"});
    }catch(error){
        res.status(500).json({message:"Server error",error:error.message});
    }
};

//@desc Update task status
//@route Put/api/tasks/:id/status
//@access Private

const updateTaskStatus = async(req,res)=>{
    try{
      const task = await Task.findById(req.params.id);
       if(!task) return res.status(404).json({message:"Task not found"});

       const isAssigned = task.asssignedTo.some(
        (userId)=>userId.toString()===req.user._id.toString()
       );

       if(!isAssigned && req.user.role !=="admin"){
        return res.status(403).json({message:"Not authorized"});
       }

       task.status = req.body.status || task.status;

       if (task.status ==="Completed"){
        task.todoChecklist.forEach((item)=>(item.complete=true));
        task.progress=100;
       }

       await task.save();
       res.json({message:"Task status updated",task});

    }catch(error){
        res.status(500).json({message:"Server error",error:error.message});
    }
};

//@desc Update task checklist
//@route PUT/api/tasks/:id/todo
//@access Private

const updateTaskChecklist = async(req,res)=>{
    try{
        const {todoChecklist} = req.body;
        const task = await Task.findById(req.params.id);

        if(!task) return res.status(404).json({message:"Task not found"});

        if(!task.asssignedTo.includes(req.user._id) && req.user.role !== "admin"){
            return res
                .status(403)
                .json({message:"Not authorized to update checklist"});
        } 

        task.todoChecklist = todoChecklist;// Replace with updated checklist

        //Auto-update progress based on checklist completion
        const completedCount = task.todoChecklist.filter(
            (item)=>item.completed
        ).length;
        const totalItems = task.todoChecklist.length;
        task.progress = 
            totalItems >0 ? Math.round((completedCount/totalItems)*100):0;
        
        // Auto-mark task as completed if all items are checked
        if(task.progress===100){
            task.status = "Completed";
        }else if(task.progress>0){
            task.status = "In Progres";
        }else{
            task.status = "Pending"
        }

        await task.save();
        const updatedTask = await Task.findById(req.params.id).populate(
            "assignedTo",
            "name email profileImageUrl"
        );

        res.json({message:"Task checklist updated",task:updatedTask});

    }catch(error){
        res.status(500).json({message:"Server error",error:error.message});
    }
};

//@desc Dashboard Data(Admin Only)
//@route GET/api/tasks/user-dashboard-data
//@access Private
const getDashboardData = async(req,res)=>{
    try{
        //Fetch statistics
        const totalTasks = await Task.countDocuments();
        const pendingTasks = await Task.countDocuments({status:"Pending"});
        const completedTasks = await Task.countDocuments({status:"Completed"});
        const overdueTasks = await Task.countDocuments({
            status: {$ne:"Completed"},
            dueDate: {$lt: new Date()},
        });

        //Ensure all possible statuses are included
        const taskStatuses = ["Pending","In Progress","Completed"];
        const taskDistributionRaw = await Task.aggregate([
            {
                $group:{
                    _id:"$status",
                    count:{$sum:1},
                },
            },
        ]);
        const taskDistribution = taskStatuses.reduce((acc,status)=>{
            const formattedKey = status.replace(/\s+/g,"");//Remove spaces for response keys
            acc[formattedKey] = 
                taskDistributionRaw.find((item)=>item._id ===status)?.count || 0;
            return acc;
        },{});
        taskDistribution["All"] = totalTasks;// Add total count to taskDistribution

        // Ensure all priorty levels are included
        const taskPriorties = ["Low","Medium","High"];
        const taskPriortyLevelsRaw = await Task.aggregate([
            {
              $group:{
                _id:"$priorty",
                count:{$sum:1},
              },  
            },
        ]);
        const taskPriortyLevels = taskPriorties.reduce((acc,priorty)=>{
            acc[priorty] = 
                taskPriortyLevelsRaw.find((items)=>items._id===priorty)?.count ||0;
            return acc;
        },{});

        //Fetch recent 10 tasks
        const recentTasks = await Task.find()
            .sort({createdAt:-1})
            .limit(10)
            .select("title status priorty dueDate createdAt");
        
        res.status(200).json({
            statisitics:{
                totalTasks,
                pendingTasks,
                completedTasks,
                overdueTasks,
            },
            charts:{
                taskDistribution,
                taskPriortyLevels,   
            },
            recentTasks,
        });
    }catch(error){
        res.status(500).json({message:"Server error",error:error.message});
    }
};
//@desc Dashboard Data(User-specific)
//@route GET/api/tasks/user-dashboard-data
//@access Private

const getUserDashboardData = async(req,res)=>{
    try{
        const userId = req.user._Id; //Onlyu fetch data for the logged-in user

        //Fetch statistics for user-specific Tasks
        const totalTasks = await Task.countDocuments({asssignedTo:userId});
        const pendingTasks = await Task.countDocuments({asssignedTo:userId,status:"Pending"});
        const completedTasks = await Task.countDocuments({
            asssignedTo: userId,
            status:{$ne:"Completed"},
            dueDate:{$lt:new Date()},
        });


        //Task distribution ny status
        const taskStatuses = ["Pending","In Progress","Completed"];
        const taskDistributionRaw = await Task.aggregate([
            {$match:{assignedTo:userId}},
            {$group:{_id:"$status",count:{$sum:1}}},      
        ]);

        const taskDistribution = taskStatuses.reduce((acc,status)=>{
            const formattedKey = status.replace(/\s+/g,"");
            acc[formattedKey] = 
                taskDistributionRaw.find((item)=>item._id===status)?.count||0;
            return acc;
        },{});
        taskDistribution("All") = totalTasks;

        //Task distribution by a priorty
        const taskPriorties = ["Low","Medium","High"];
        const taskPriortyLevelsRaw = await Task.aggregate([
            {$match:{assignedTo:userId}},
            {$group:{_id:"$priority",count:{$sum:1}}},
        ]);

        const taskPriorityLevels = taskPriorties.reduce((acc,priority)=>{
            acc[priority] = 
                taskPriortyLevelsRaw.find((item)=>item._id===priority)?.count||0;
            return acc;
        },{});

        //Fetch recent 10 tasks for logged-in user 
        const recentTasks = await Task.find({asssignedTo: userId})
            .sort({createdAt: -1})
            .limit(10)
            .select("title status priorty dueDate createdAt");
        res.status(200).json({
            statisitics:{
                totalTasks,
                pendingTasks,
                completedTasks,
                overdueTasks,
            },
            charts:{
                taskDistribution,
                taskPriorityLevels,
            },
            recentTasks,
        })
    }catch(error){
        res.status(500).json({message:"Server error",error:error.message});
    }
};

module.exports = {
    getTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    updateTaskChecklist,
    getUserDashboardData,
    getDashboardData,
}
