const express=require('express');
const connection=require('./db')
const cors=require('cors');

const app=express();

app.use(express.json());
app.use(cors());


app.get("/",(req,res)=>{

    res.send("Hello from express");
})

app.use("/api/auth",require('./routes/auth'));
app.use("/api/notes",require('./routes/notes'));


app.listen(5000,()=>{
    console.log("Successfully running backend on http://127.0.0.1:5000");
})