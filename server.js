const express = require("express");
const jwt=require("jsonwebtoken");
const mongoose=require("mongoose");
const cors=require("cors");
const {z}= require("zod");
const bcrypt=require("bcrypt");
const {ConnectToDB}=require("./config/db");
const {UserModel}=require("./models/UserSchema");
// const TodoSchema = require("./models/TodoSchema");
const {TodoModel}=require("./models/TodoSchema");

// Config to .env
require("dotenv").config();

// 

//DB-Setup 
ConnectToDB();

// Setups
const app=express();


// middleware
app.use(express.json());
app.use(cors());
// app.use(cors({origin:true}));
// const corsOptions = {
//     origin: "*",
//     methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
//     allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
//     optionsSuccessStatus: 204
//   };

// app.use(cors(corsOptions));
  
// // Handle OPTIONS requests globally
// app.options("*", cors(corsOptions));
  
app.use(express.static("public"));



// SignUp -(BE Done -Tested) -(FE Done -Tested) -(bcrypted) -(DB done)
app.post("/signup",async (req,res)=>{
    const {username,password,name}=req.body;
    const hashedpassword=await bcrypt.hash(password,5);

    try{
        await UserModel.create({
            username:username,
            password:hashedpassword,
            name:name
        });

        return res.status(200).json({
            message:"You are successfully SignedUp"
        });
    }
    catch(err){
       return res.status(401).json({
            message:"User Already exist!",
            error:err
        })
    }



});

app.get("/", (req, res) => {
    res.json({
        msg: "Running"
    })
})

// SignIn -(BE Done -Tested) -(FE Done -Tested) -(bcrypted) -(DB done) -(JWT)
app.post("/signin",async (req,res)=>{
    const {username,password}=req.body;
    try{
        const response= await UserModel.findOne({
            username:username
        })
        if(!response){
            return res.json({
                message:"No such user found"
            })
        }
        const matchpassword=await bcrypt.compare(password,response.password);

        if(matchpassword){
            const token=jwt.sign({
                userId:response._id
            },process.env.JWT_SECRET);

            return res.json({
                message:"You signed in successfully",
                token:token
            })
        }
        else{
            return res.status(401).json({
                message: "Incorrect password"
            });
        }
    }
    catch(err){
        return res.json({
            message:"Facing error Signing you in."
        })
    }

})


const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });


// Middleware -(BE Done -Tested) -(FE Done -Tested) -(bcrypted) -(DB done) -(JWT)
app.use((req,res,next)=>{
    const {token}=req.headers;

    try{
        if(!token){
            return res.json({
                message:"Token not found! Wrong Credentials"
            });
        }else{
            const decodedtoken=jwt.verify(token,process.env.JWT_SECRET);
            if(decodedtoken){
                req.userId=decodedtoken.userId;
                next();
            }
            else{
                return res.json({
                    message:"There was a problem decoding the token"
            })
            }
        }
    }

    catch(err){
        console.error("The Error is : ",err);
        return res.json({
            mesage:"Token is Invalid"
        })
    }

})


// Add Todo endpoint -(BE Done -Tested) -(FE Done -Tested) -(bcrypted) -(DB done) -(JWT)
app.post("/addtodo",async(req,res)=>{
    const {description}=req.body;

    if(!description){
       return res.json({
            message:"You will have to provide a description"
        })
    }

    try{
        const newtodo=await TodoModel.create({
            description:description,
            completed:false,
            userId:req.userId
        });
        return res.json({
            message:"Todo Successfully Uploaded to the Database",
            todo:newtodo
        });
    }
    catch(err){
        return res.json({
            message:"Unable to Upload your Todo",
            error:err.message
        })
    }
})

// Update Todo  -(BE Done -Tested) -(FE Done -Tested) -(bcrypted) -(DB done)
app.put("/updatetodo/:id",async (req,res)=>{
    const {id}=req.params;
    // const {username}=req.body;
    const {description}=req.body;

    try{
        const response=await TodoModel.findOneAndUpdate(
            {_id:id },
            {description:description},
            {new:true}
        );
       return  res.json({
            message:"Todo Successfully Updated",
            UpdatedTodo:response,
            userId:response.userId,
            todoId:response._id
        })
    }
    catch(err){
        return res.json({
            message:"There was a problem updating the Todo",
            error:err
        })
    }

})

// To delete the todo  -(BE Done -Tested) -(FE Done -Tested) -(bcrypted) -(DB done)
app.delete("/deletetodo/:id",async (req,res)=>{
    const {id}=req.params;

    try{
         await TodoModel.deleteOne({_id:id});
        return res.json({
            message:"Todo deleted successfully",
            _id:id,
            

        })
    }
    catch(err){
        return res.json({
            message:"There was a problem deleting Todo",
            error:err
        })
    }



})

// To mark completed -(BE Done -Tested) -(FE Done -Tested) -(bcrypted) -(DB done)
app.put("/completed/:id", async (req, res) => {
    const { id } = req.params;
    const completed = true;

    try {
        const response = await TodoModel.findOneAndUpdate(
            { _id: id },
            { completed: completed },
            { new: true }
        );
        return res.json({
            message: "You completed the task successfully",
            todo: response
        });
    } catch (err) {
        return res.status(500).json({
            message: "There was a problem marking the todo as completed",
            error: err.message
        });
    }
});




app.get("/fetchcontent",async (req,res)=>{
    // const {userId}=req.params;
    const {token}=req.headers;
    


    try{
        const user=jwt.verify(token,process.env.JWT_SECRET);
        const response =await TodoModel.find({userId:user.userId});
        res.json({
            message:"Found all todo",
            response:response
        })
    }
    catch(error){
        console.error("Error fetching todos:", error);
        res.json({
            message:"Unable to get your data.",
        })
    }
    
})

