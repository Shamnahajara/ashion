const express = require("express");

const admin_route = express();

admin_route.set("views", "./Views/Admin");

const auth = require("../middileware/adminAuth");

const adminController = require("../controllers/adminController");

const couponController = require("../controllers/couponController");

const orderController = require("../controllers/orderController");

const bannerController = require("../controllers/bannerController");

const multerConfig = require("../config/multer");

const uploadBanner = multerConfig.bannerMulter();

const upload = multerConfig.createMulter();

admin_route.get("/", auth.isLogout, adminController.loadLogin);

admin_route.post("/", adminController.verifyLogin);

admin_route.get("/home", auth.isLogin, adminController.loadDashboard);

admin_route.get("/users", auth.isLogin, adminController.loadUsers);

admin_route.get("/block", auth.isLogin, adminController.statusUpdate);

admin_route.get("/catogory", auth.isLogin, adminController.loadCatogories);

admin_route.get("/addCatogory", auth.isLogin, adminController.loadAddCatogory);

admin_route.post("/addCatogory", auth.isLogin, adminController.addCatogory);

admin_route.get("/editCatogory", auth.isLogin, adminController.editCatogory);

admin_route.post("/editCatogory", auth.isLogin, adminController.updateCatogory);

admin_route.get("/brand", auth.isLogin, adminController.loadBrands);

admin_route.get("/addBrand", auth.isLogin, adminController.loadAddBrand);

admin_route.post("/addBrand", auth.isLogin, adminController.addBrand);

admin_route.get("/editBrand", auth.isLogin, adminController.editBrand);

admin_route.post("/editBrand", auth.isLogin, adminController.updateBrand);

admin_route.get("/product", auth.isLogin, adminController.loadProductlist);

admin_route.get("/addProduct", auth.isLogin, adminController.loadAddProduct);

admin_route.post("/addProduct", auth.isLogin, upload.array("productimage", 5), adminController.addproduct);

admin_route.get("/viewProduct", auth.isLogin, adminController.viewProduct);

admin_route.get("/editProduct", auth.isLogin, adminController.editproduct);

admin_route.post("/editProduct",auth.isLogin, upload.array("productimage", 5), adminController.updateProduct);

admin_route.get("/unlist", auth.isLogin, adminController.productUnlist);

admin_route.get("/deleteimage", auth.isLogin, adminController.deleteImage);

admin_route.get("/coupon", auth.isLogin, couponController.coupon);

admin_route.get("/addCoupon", auth.isLogin, couponController.addCoupon);

admin_route.post("/addCoupon", auth.isLogin, couponController.updateCoupon);

admin_route.get("/deleteCoupon", auth.isLogin, couponController.deleteCoupon);

admin_route.get("/couponUnlist", auth.isLogin, couponController.couponUnlist);

admin_route.get("/editCoupon", auth.isLogin, couponController.couponEdit);

admin_route.post("/editCoupon", auth.isLogin, couponController.updatedCoupon);

admin_route.get("/order", auth.isLogin, orderController.order);

admin_route.get("/cancelOrder", auth.isLogin, orderController.cancelOrder);

admin_route.get("/orderStatus", auth.isLogin, orderController.orderDelivered);

admin_route.get("/viewOrder", auth.isLogin, orderController.orderDetail);

admin_route.get("/banner", auth.isLogin, bannerController.loadBanner);

admin_route.get('/addBanner', auth.isLogin, bannerController.addBanner);

admin_route.post('/addBanner', auth.isLogin, uploadBanner.single("bannerImage"), bannerController.newBanner);

admin_route.get('/deleteBanner', auth.isLogin, bannerController.deleteBanner);

admin_route.get('/editBanner', auth.isLogin, bannerController.editBanner);

admin_route.post('/editBanner', auth.isLogin, uploadBanner.single("bannerImage"), bannerController.updateBanner);

admin_route.get('/listBanner', auth.isLogin, bannerController.listBanner);




admin_route.get("/logout", auth.isLogin, adminController.logout);


admin_route.get("*", function (req, res) {
  res.redirect("/admin");
});

module.exports = admin_route;
