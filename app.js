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

const itemSchema = new mongoose.Schema({
    item:String
});

const Item = mongoose.model("itemdata", itemSchema, "itemdata");

const userSchema = new mongoose.Schema({
    username:{type:String, required:true, unique:true},
    password:{type:String, required:true},
    email:{type:String, required:true}
});

const User = mongoose.model("User", userSchema, "users");

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

 app.get("/logedIndex",isAuthenticated,(req,res)=>{
    res.sendFile(path.join(__dirname,"public","logedIndex.html"));
});

app.get("/update/:id", isAuthenticated, async function(request, responce){
    try{
        const itemId = request.params.id;

        const filePath = path.join(__dirname, 'public', 'update.html');
        console.log(filePath);
        responce.sendFile(filePath,{
            headers:{
                'Cache-Control':'no-store'
            }
        });
    } catch(err){
        responce.status(500).json({error:"server error"});
    }
});

app.post("/updateItem/:id", async (req, res)=>{
    const itemId = req.params.id;
    const updatedItem = req.body.item; 

    try{
        const newItem = await Item.findByIdAndUpdate(itemId,{item:updatedItem},{new: true});
        if (!newItem) {
            return res.status(404).send("Item not found"); 
        }
        res.redirect('/logedIndex.html');
    }catch(err){
        console.error("Error updating item:", error);
        res.status(500).send("Server error while updating item");
    }
    
});

 app.get("/addEntry",isAuthenticated,function(request, responce){
    // responce.send("Hello Everyone!");
    responce.sendFile(path.join(__dirname,"public","addEntry.html"));
});

app.post("/addEntry", async(req,res)=>{
    try{
        const newItem = new Item(req.body);
        const saveItem = await newItem.save();

        res.redirect("/logedIndex");
        console.log(saveItem);
    }catch(err){
        res.status(501).json({error:"Failed to add new person."});
    }
});

app.get("/login",function(request, responce){
    // responce.send("Hello Everyone!");
    responce.sendFile(path.join(__dirname,"public","login.html"));
});

app.post("/login", async (req,res)=>{
    const {username, password} = req.body;
    console.log(req.body);

    const user = await User.findOne({username});
    
    if(user && bcrypt.compareSync(password, user.password)){
       
        req.session.user = username;
        return res.redirect("/logedIndex");
    }
    req.session.error = "Invalid User";
    return res.redirect("/login")
});

app.get("/logout", (req,res)=>{
    req.session.destroy(()=>{
        res.redirect("/login");
    })
});

app.delete("/deleteitem/:id",isAuthenticated, async (req,res)=>{
    try{
        const item = await Item.findById(req.params.id);
        
        console.log(item);
        if(item.length==0){
            return res.status(404).json({error:"Failed to find the person."});
        }
        const deletedItem = await Item.findByIdAndDelete(item);
        
        res.sendFile(path.join(__dirname,"public","index.html"));
    }catch(err){
        res.status(404).json({error:"item not found"});
    }
});

 app.get("/testjson", async (req, res)=>{
    try{
        const items = await Item.find();
        res.json(items);
        console.log(items);
    }catch(err){
        res.status(500).json({error:"Failed to get items"});
    }
    //  res.sendFile(path.join(__dirname,"public","json/games.json"));
 });

 app.get("/testjson/:id", async (req, res)=>{
    try{
        const items = await Item.findById(req.params.id);
        res.json(items);
    }catch(err){
        res.status(500).json({error:"Failed to get items"});
    }
    //  res.sendFile(path.join(__dirname,"public","json/games.json"));
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