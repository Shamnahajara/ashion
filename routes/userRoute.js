const express = require("express");
const user_route = express();
const auth = require("../middileware/auth");
const block = require("../middileware/blocked");
user_route.set("views", "./Views/Users");
const userController = require("../controllers/userController");
const cartController = require("../controllers/cartController");

user_route.get( "/register" , auth.isLogout, userController.loadRegister);

user_route.post( "/register" , userController.insertUser);

user_route.post( "/enterotp" , userController.verifyotp);

user_route.post( "/resendOtp" , auth.isLogout, userController.resendOTP);

user_route.get( "/", userController.loadHome);

user_route.get( "/home", auth.isLogin, block.blocked, userController.loadHome);

user_route.get( "/login", auth.isLogout, userController.loginLoad);

user_route.post("/login", userController.verifyLogin);

user_route.get( "/forgetPassword", block.blocked, userController.loadforget);

user_route.post( "/forgetPassword", block.blocked, userController.sendReset);

user_route.post( "/verifyReset", block.blocked, userController.verifyReset);

user_route.get( "/productdetail", userController.productdetail);

user_route.post( "/productdetail",  auth.isLogin,  block.blocked,  userController.addReview);

user_route.get('/editReview', auth.isLogin, block.blocked, userController.editReview);

user_route.post('/editReview', auth.isLogin, block.blocked, userController.updatedReview);

user_route.get('/deleteReview', auth.isLogin, block.blocked, userController.deleteReview)

user_route.get("/shop",  userController.shop);

user_route.get("/wishlist", auth.isLogin,  block.blocked, userController.wishlist);

user_route.get( "/addtowishlist/:id", auth.isLogin, block.blocked, userController.addtowishlist);

user_route.get( "/removewishlist", auth.isLogin, block.blocked, userController.removewishlist);

user_route.get( "/cart", auth.isLogin, block.blocked, cartController.loadCart);

user_route.get( "/addToCart/:id",  auth.isLogin,  block.blocked,  cartController.addToCart);

user_route.post("/incrementCart",  auth.isLogin,  block.blocked,  cartController.incrementCart);

user_route.post(  "/decrementCart",  auth.isLogin,  block.blocked,  cartController.decrementCart);

user_route.post(  "/removeCart", auth.isLogin,  block.blocked,  cartController.removeCart);

user_route.post(  "/shopFilter",    userController.productFilter);

user_route.get(  "/userProfile",  auth.isLogin,  block.blocked,  userController.profileLoad);

user_route.get(  "/editProfile",  auth.isLogin,  block.blocked,  userController.editProfile);

user_route.post(  "/editProfile",  auth.isLogin,  block.blocked,  userController.updateProfile);

user_route.get(  "/addAddress",  auth.isLogin,  block.blocked,  userController.addressPage);

user_route.post(  "/addAddress",  auth.isLogin,  block.blocked,  userController.addAddress);

user_route.get(  "/editAddress",  auth.isLogin,  block.blocked,  userController.loadEditAddress);

user_route.post(  "/editAddress",  auth.isLogin,  block.blocked,  userController.editAddress);

user_route.post(  "/delete_Address",  auth.isLogin,  block.blocked,  userController.deleteAddress);

user_route.post(  "/checkCoupon",  auth.isLogin,  block.blocked,  userController.applyCoupon);

user_route.get(  "/checkout",  auth.isLogin,  block.blocked,  userController.loadCheckout);

user_route.post(  "/checkout",  auth.isLogin,  block.blocked,  userController.loadPaymentPage);

user_route.get(  "/orderConfirmation",  block.blocked,  userController.orderDetails);

user_route.post("/orderConfirm", block.blocked, userController.orderConfirm);

user_route.get(  "/orders",  auth.isLogin,  block.blocked,  userController.orderData);

user_route.get(  "/orderDetails",  auth.isLogin,  block.blocked,  userController.fullOrder);

user_route.get(  "/cancelOrder",  auth.isLogin,  block.blocked,  userController.cancelOrder);

user_route.get(  "/returnOrder",  auth.isLogin,  block.blocked,  userController.returnOrder);

user_route.get( "/razorpayPayment", userController.razorpayConfirm);

user_route.get( "/logout", auth.isLogin, userController.userLogout);

module.exports = user_route;

