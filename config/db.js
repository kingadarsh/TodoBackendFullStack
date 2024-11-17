const mongoose=require("mongoose");
const ConnectToDB=async ()=>{
    try{
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Connected to the Database");
    }
    catch(err){
        console.log("There was a problem connecting to the Database");
    }
}
// 6MOThhUyvAsujIIp
module.exports={
    ConnectToDB:ConnectToDB
}