const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
       
        productname:{
            type:String,
            required:true
        },
        productimage:[{
            type:String,
            required:true
        }],
        description:{
            type:String,
            required:true
        },
        price:{
            type:Number,
            required:true
        },
        quantity:{
            type:Number,
            required:true
        },
        category:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"catogories",
            required:true
        },
        brand:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"brand",
            required:true
        },
        status:{
            type:Number,
            default:0
        },
        review: [
            {
              userId:{
                type:mongoose.Schema.Types.ObjectId,
                ref:"user",
                reqired:true
              },
              review: { type: String },
              rating:{type: Number}
            },
          ],
});


module.exports = mongoose.model('product',productSchema);