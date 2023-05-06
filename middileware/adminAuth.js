const isLogin = async(req,res,next)=>{
    try{
        if(req.session.aduser_id){
          next()
        }else{
            res.redirect('/admin')
        }
    } catch (error){
        console.log(error);
    }
}

const isLogout = async(req,res,next)=>{
    try{

        if(req.session.aduser_id){
            res.redirect('/admin/home');
        }else{
        next();
        }
    } catch (error){
        console.log(error.message);
    }
}

module.exports = {
    isLogin,
    isLogout
}