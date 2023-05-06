const mongoose = require ('mongoose');

const cartschema = new mongoose.Schema({


    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:true
    },
    item:[{
    product:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"product"
    },
    quantity:{
      type:Number
    },
    price:{
        type:Number
    }
    }],
     totalPrice:{
        type:Number
     }
});

module.exports = mongoose.model('cart',cartschema);