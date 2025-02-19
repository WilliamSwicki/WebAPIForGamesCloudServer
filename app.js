require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const { MongoClient, ServerApiVersion } = require("mongodb");
const { register } = require("module");

const app = express();
const port = process.env.port || 3000;

 //middleware to serve static data
 app.use(express.static(path.join(__dirname, "public")));

 let message = "Wouldn't you like to be a Pepper to?";

 app.use(bodyParser.json());

 app.use(express.urlencoded({extended:true}));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave:false,
    saveUninitialized:false,
    cookie:{secure:false}// Set to true is using https
}));

function isAuthenticated(req,res, next){
    if(req.session.user)return next();
    return res.redirect("/login");
}

//MongoDB connection setup
const mongoURI = "mongodb+srv://wmswicki03:Ninja0805*@cluster0.g93nl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"/*process.env.MONGODB_URI.toString() "mongodb://localhost:27017/Item"*/;
console.log(mongoURI)
mongoose.connect(mongoURI);

const db = mongoose.connection;

db.on("error", console.error.bind(console, "MongoDB connection error"));
db.once("open", ()=>{
    console.log("Connected to MongoDB Database");
});

app.get("/register", (req,res)=>{
    res.sendFile(path.join(__dirname, "public", "register.html"));
})

app.post("/register", async (req,res)=>{
    try{
        const {username, password, email} = req.body;

        const existingUser = await User.findOne({username});

        if(existingUser){
            return res.send("<p>Username already taken. Try a different one</p><br><a href='/register.html'>Back</a></li>")
        }

        const hashedPassword = bcrypt.hashSync(password, 10);
        const newUser = new User({username, password:hashedPassword, email});
        await newUser.save();

        res.redirect("/login");

    }catch(err){
        res.status(500).send("Error registering new user.");
    }
});

 //route ex
 app.get("/index",function(request, responce){
     // responce.send("Hello Everyone!");
     responce.sendFile(path.join(__dirname,"public","index.html"));
 });

 app.get("/addEntry",function(request, responce){
    // responce.send("Hello Everyone!");
    responce.sendFile(path.join(__dirname,"public","addEntry.html"));
});

app.get("/login",function(request, responce){
    // responce.send("Hello Everyone!");
    responce.sendFile(path.join(__dirname,"public","login.html"));
});

 app.get("/testjson",(req, res)=>{
     res.sendFile(path.join(__dirname,"public","json/games.json"));
 });

setTimeout(()=>{
    console.log("Hello 2 seconds later")
},2000);

setTimeout(()=>{
    console.log("Hello now")
},0);


 app.listen(port, function(){
     console.log(`Server is running on port: ${port}`);
 });

 module.exports = app;