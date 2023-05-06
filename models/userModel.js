const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
   
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    mobile:{
        type:Number,
        required:true
    },
    
    password:{
        type:String,
        required:true
    },
    is_admin:{
        type:Number,
        required:true
    },
    is_verified:{
        type:Number,
        default:0
    },
    status:{
     type:Number,
     default:0
    },
    wishlist:[{
       type:mongoose.Schema.Types.ObjectId,
       ref:"product"
    }],
    address:{
        type:Array
    },
    wallet:{
        type:Number,
        default:0
    }
   
});

module.exports = mongoose.model('user',userSchema);