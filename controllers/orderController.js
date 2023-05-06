const User = require("../models/userModel");
const Product = require("../models/productModel");
const Cart = require('../models/cartModel');
const Brand = require('../models/brandModel')
const Catogory = require('../models/catogoryModel')
const Coupon = require('../models/couponModel')
const Orders = require('../models/orderModel')


                            //..order-Dash..\\
const order = async(req,res)=>{
    try{
        const orderData = await Orders.find().populate('userId')
        res.render('order',{orders:orderData});
    }
    catch (error){
        console.log(error)
    }
}


                                //...cancel Order...\\
const cancelOrder = async(req,res)=>{
    try{
        id = req.query.orderId;
        const orderData = await Orders.updateOne({_id:id},{$set:{admin_cancelled:true}});
        const orderDetails = await Orders.findOne({_id:id});
        if(orderDetails.paymentType === "wallet"){
            increaseAmount = orderDetails.totalPrice;
            const ans = await User.updateOne({_id:orderDetails.userId},{$inc:{wallet:increaseAmount}});       
        }
        res.redirect('/admin/order')
        }
        catch (error){
            console.log(error);
        }
    }


                                ///....order-delivery Status....\\\
const orderDelivered = async(req,res)=>{
        try{
            const   id = req.query.orderId;
            const orderData = await Orders.updateOne({_id:id},{$set:{is_delivered:true,delivered_date: Date.now()} } );
            res.redirect('/admin/order');
        }
        catch(error){
            console.log(error)
        }
    }


                                //...order-detail-page...\\
const orderDetail = async(req,res)=>{
        try{
            const id = req.query.orderId;
            const orderData = await Orders.findOne({_id:id}).populate("item.product");
            if(id){
                res.render('orderDetail',{orders:orderData});
            }else{
                res.redirect('/admin/order');
            }
        }
        catch(error){
            console.log(error);
        }
    }

module.exports = {
    order,
    cancelOrder,
    orderDelivered,
    orderDetail
}