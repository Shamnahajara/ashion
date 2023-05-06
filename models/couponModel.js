const mongoose = require("mongoose")

const couponSchema = new mongoose.Schema({

couponName:{
    type:String,
    required:true
},
couponCode:{
    type:String,
    required:true
},
status:{
    type:Number,
    default:0
},
startDate:{
    type:Date,
    required:true
},
endDate:{
    type:Date,
    required:true
},
maxDiscount:{
    type:Number,
    required:true
},
quantity:{
    type:Number
},
minAmount:{
    type:Number,
    required:true
},
user:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:'user'
}]
});

module.exports = mongoose.model("coupons",couponSchema);