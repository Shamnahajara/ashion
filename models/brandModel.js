const mongoose = require('mongoose');

const brandschema = new mongoose.Schema({

    brandname:{
        type:String,
        required:true
    }

});


module.exports = mongoose.model('brand',brandschema)