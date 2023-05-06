
const User = require('../models/userModel');

const blocked = async(req,res,next)=>{
try{

        if(req.session.user_id){
        const userData = await User.findOne({_id:req.session.user_id})
        if(userData.status == 1){
            req.session.user_id = null;
            console.log("ok");
        } 
        next()  
        
    }
    else{
        next()
    } 

}
catch (error){
    console.log(error.message);
}

}

module.exports = {
    blocked
}