const Banner = require("../models/bannerModel");
const cloudinary = require('cloudinary').v2;
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
  });

                                    //....loadBanner....\\
const loadBanner = async(req,res)=>{
    try{
        const bannerData = await Banner.find()
        res.render('banner',{bannerData});
    }
    catch (error){
        console.log(error)
    }
}
                                   //...AddBanner..\\
const addBanner = async(req,res)=>{
    try{
    res.render('addBanner');
    }
    catch (error){
        console.log(error)
    }
}
                                        //...newBanner...\\\
const newBanner = async(req,res)=>{
    try{ 
        const imageupload = req.file.path;
        const uploadResponse = await cloudinary.uploader.upload(imageupload);
        const imageURL = uploadResponse.secure_url; 
        const bannerData = new Banner({
            bannerImage: imageURL,
            mainHeading: req.body.mainheading,
            subHeading:req.body.subheading,
            description:req.body.description
        });

        bannerData.save();
        res.redirect('/admin/banner');
    }
    catch (error){
        console.log(error)
    }
}
                                    //....deleteBanner....\\\
const deleteBanner = async(req,res)=>{
    try{
        const id = req.query.bannerId;
        const bannerData = await Banner.findByIdAndDelete({_id:id});
        res.redirect('/admin/banner');
    }
    catch (error){
        console.log(error)
    }
}

                                    //....editBanner....\\
const editBanner = async(req,res)=>{
    try{
        const id = req.query.bannerId
        const bannerData = await Banner.findById({_id:id});
        res.render('editBanner',{bannerData});
    }
    catch (error){
        console.log(error);
    }
}

                                    //...editBanner Update..\\\
const updateBanner = async(req,res)=>{
    try{
        const id = req.body.id;
        console.log(id)
        console.log(req.file.filename);
        const imageupload = req.file.path;
        const uploadResponse = await cloudinary.uploader.upload(imageupload);
        const imageURL = uploadResponse.secure_url;
        const addBanner = await Banner.findByIdAndUpdate({_id:req.body.id},
            {$set:{
            bannerImage: imageURL,
            mainHeading: req.body.mainheading,
            subHeading: req.body.subheading,
            description: req.body.description
        }
        });
        res.redirect('/admin/banner');
    }
    catch (error){
        console.log(error)
    }
}

                                    //.....ListBanner....\\
const listBanner = async(req,res)=>{
    try{
       const id = req.query.bannerId;
       const bannerData = await Banner.findById({_id:id})
       if(bannerData.status === 0){
        await Banner.findByIdAndUpdate({_id:id},{$set: {status:1}});
       }else{
        await Banner.findByIdAndUpdate({_id:id},
            {$set: {status:0}});
       }
       res.redirect('/admin/banner');
    }
    catch (error){
        console.log(error)
    }
}

module.exports = {
    loadBanner,
    addBanner,
    newBanner,
    deleteBanner,
    editBanner,
    updateBanner,
    listBanner
}