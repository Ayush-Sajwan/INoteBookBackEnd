const mongoose=require('mongoose');

const noteSchema=mongoose.Schema({

    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    tag:{
        type:String,
        default:"General"
    },
    date:{
        type:Date,
        default:Date.now
    },
    user_id:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    }
})

module.exports=mongoose.model("notes",noteSchema);