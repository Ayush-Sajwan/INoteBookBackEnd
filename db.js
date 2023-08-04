const mongoose=require('mongoose');

mongoose.connect("mongodb://127.0.0.1:27017/inotebook")
.then(()=>{
    console.log("Successfully connected to the database");
})
.catch((err)=>{
    console.log("Error occured while connecting to the database");
})

