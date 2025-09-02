const { text } = require("express");
const mongoose  = require("mongoose");

const todoSchema = new mongoose.Schema(
    {
        text:{type:String,reuqired:true},
        complete:{type:Boolean, default:false},
    }
);

const taskSchema = new mongoose.Schema(
    {
        title:{type:String,required:true},
        description:{type:String},
        priorty:{type:String,enum:["Low","Medium","High"], default:"Medium"},
        status:{type:String,enum:["Pending","In Progres","Completed"], default:"Pending"},
        dueDate:{type:Date, required:true},
        asssignedTo:[{type:mongoose.Schema.Types.ObjectId, ref:"User"}],
        createdBy:{type:mongoose.Schema.Types.ObjectId, ref:"User"},
        attachments:[{type:String}],
        todoChecklist:{todoSchema},
        progress:{type:Number,default:0}
        
    },
    {timestamps:true}
);

module.exports = mongoose.model("Task",taskSchema);