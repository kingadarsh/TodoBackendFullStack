const mongoose=require("mongoose");
const ObjectId=mongoose.ObjectId;
const schema=mongoose.Schema;

// Schema Defined
const Todo=mongoose.Schema({
    description:{type:String,required:true }, 
    completed:Boolean,
    userId:ObjectId
})

// Data Model
const TodoModel=mongoose.model("todos",Todo);

// Export
module.exports={
    TodoModel:TodoModel
}
    
