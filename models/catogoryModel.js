const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({

    catogoryname:{
        type:String,
        required:true
    }

});

module.exports = mongoose.model('catogories',categorySchema);