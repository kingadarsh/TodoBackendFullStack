const mongoose=require("mongoose");
const Schema=mongoose.Schema;

// Define Schema
const User=new Schema({
    username:{type:String, required:true,unique:true},
    password:String,
    name:"String"
});

// Data Model
const UserModel=mongoose.model("users",User);

// Export 
module.exports={
    UserModel:UserModel
}
