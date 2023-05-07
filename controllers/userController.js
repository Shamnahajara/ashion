const User = require("../models/userModel");
const Banner = require("../models/bannerModel");
const Product = require("../models/productModel");
const Cart = require("../models/cartModel");
const Brand = require("../models/brandModel");
const Catogory = require("../models/catogoryModel");
const Coupon = require("../models/couponModel");
const Orders = require("../models/orderModel");
require('dotenv').config() 
const bcrypt = require("bcrypt");
const TWILIO_SERVICE_SID = process.env.TWILIO_SERVICE_SID;
const accountsid = process.env.TWILIO_ACCOUNT_SID ;
const authtoken = process.env.TWILIO_AUTH_TOKEN ;
const client = require("twilio")(accountsid, authtoken);
const nodemailer = require("nodemailer");
const Razorpay = require("razorpay");
const instance = new Razorpay({
  key_id:process.env.KEY_ID,
  key_secret:process.env.KEY_SECRET,
});
const cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

let msg;
let message;
let index;
let orderStatus = 0;
let paymentType;

//....Bcrypt...\\
const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
};

////////////////////////////////SighnUp\\\\\\\\\\\\\\\\\\\\\\\\\\

const loadRegister = async (req, res) => {
  try {
    res.render("Registration");
    message;
    msg;
  } catch (error) {
    console.log(error.message);
  }
};

                      //....update user-info.....\\\
const insertUser = async (req, res) => {
  try {
    if (!req.body.password) {
      throw new Error("Password is required.");
    }
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.render("Registration", {
        message: "Email already registered",
      });
    }
    if (!req.body.name || req.body.name.trim().length === 0) {
      return res.render("Registration", {
        messege: "Please Enter valid name",
      });
    }

    const spassword = await securePassword(req.body.password);
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      mobile: req.body.mno,
      password: spassword,
      is_admin: 0,
    });
    const userData = await user.save();
    req.session.phone = req.body.mno;
    if (userData) {
      client.verify.v2
        .services( process.env.TWILIO_SERVICE_SID)
        .verifications.create({ to: `+91${req.body.mno}`, channel: "sms" })
        .then((verification) => {
          console.log(req.body.mno);
        })
        .catch((err) => {
          console.log(err);
        });
      res.render("otp1");
    }
  } catch (error) {
    console.log(error);
  }
};

const resendOTP = async (req, res) => {
  const { phone } = req.session;
  try {
    const verification = await client.verify
      .services(TWILIO_SERVICE_SID)
      .verifications.create({ to: `+91${phone}`, channel: "sms" });
    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
};

const verifyotp = async (req, res) => {
  let phone = req.session.mno;
  let otp = req.body.otp;
  try {
    client.verify.v2
      .services( process.env.TWILIO_SERVICE_SID)
      .verificationChecks.create({ to: `+91${phone}`, code: otp })
      .then((verification_check) => {
        if (verification_check.status == "approved") {
          req.session.otpcorrect = true;
          res.render("Login");
        } else {
          res.send({ msg: "Enter correct otp" });
        }
      })
      .catch((error) => {
        console.error(error);
      });
  } catch (error) {
    console.log(error.message);
  }
};

                             //...forget Password...\\

const loadforget = async (req, res) => {
  try {
    res.render("forget");
  } catch (error) {
    console.log(error.message);
  }
};

const sendReset = async (req, res) => {
  try {
    const exsistingNumber = await User.findOne({ mobile: req.body.mno });
    if (exsistingNumber) {
      req.session.phone = req.body.mno;
      res.render("changepassword");
      client.verify.v2
        .services( process.env.TWILIO_SERVICE_SID)
        .verifications.create({ to: `+91${req.body.mno}`, channel: "sms" })
        .then((verification) => {
          console.log(req.body.mno);
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      res.render("forget", { msg: "This number is not registered" });
    }
  } catch (error) {
    console.log(error);
  }
};

const verifyReset = async (req, res) => {
  const { otp, password } = req.body;
  const phone = req.session.phone;
  try {
    const verification_check = await client.verify.v2
      .services(TWILIO_SERVICE_SID)
      .verificationChecks.create({ to: `+91${phone}`, code: otp });

    if (verification_check.status === "approved") {
      req.session.otpcorrect = true;
      const sPassword = await securePassword(req.body.password);
      await User.updateOne(
        { mobile: phone },
        { $set: { password: sPassword } }
      );
      res.redirect("/login");
      msg = "Verified successfully,Login with account";
    } else {
      res.render("changePassword", { msg: "incorrect otp" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("An error occured while verifiying OTP");
  }
};

const loginLoad = async (req, res) => {
  try {
    res.render("Login");
  } catch (error) {
    console.log(error.message);
  }
};

const verifyLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const userData = await User.findOne({ email: email });
    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);
      if (passwordMatch) {
        if (userData.status == 0) {
          req.session.user_id = userData._id;
          res.redirect("/home");
        } else {
          res.render("Login", { message: "your acount is blocked" });
        }
      } else {
        res.render("Login", { message: "Incorrect Password"});
      }
    } else {
      res.render("Login");
    }
  } catch (error) {
    console.log(error);
  }
};

const loadHome = async (req, res) => {
  try {
    const session = req.session.user_id;
    const id = req.session.user_id;
    const user = await User.findOne({ _id: id });
    const bannerData = await Banner.find({ status: 0 });
    const productData = await Product.find({ status: { $ne: 1 } }).sort({_id:1}).limit(8);
    res.render("index", {
      productData,
      user,
      session,
      bannerData,
      msg,
      message,
    });
    message = null;
    msg = null;
  } catch (error) {
    console.log(error.message);
  }
};

const userLogout = async (req, res) => {
  try {
    req.session.user_id = null;
    res.redirect("/");
  } catch (error) {
    console.log(error.message);
  }
};

const productdetail = async (req, res) => {
  try {
    id = req.query.id;
    const session = req.session.user_id;
    const productData = await Product.findById({ _id: id })
      .populate("brand")
      .populate("category")
      .populate("review.userId");
    const reviewData = productData.review;
    const reviewList = [];
    // Loop through each review
    for (let i = 0; i < reviewData.length; i++) {
      const review = reviewData[i];
      if (review.userId._id) {
        const isEditable = review.userId._id.toString() === session.toString();
        const reviewItem = {
          review: review.review,
          rating: review.rating,
          isEditable: isEditable,
        };
        reviewList.push(reviewItem);
      }
    }
    const user = await User.findOne({ _id: session });
    const orders = await Orders.findOne({
      userId: session,
      "item.product": id,
    }).populate("userId");
    const hasPurchasedProduct = !!orders;
    res.render("product-details", {
      productData,
      session,
      hasPurchasedProduct,
      reviewData,
      reviewList,
    });
  } catch (error) {
    console.log(error);
  }
};

const wishlist = async (req, res) => {
  try {
    const session = req.session.user_id;
    const wishlist = await User.findOne({ _id: session }).populate("wishlist");
    res.render("wishlist", { session, wishlist, message, msg });
    message = null;
  } catch (error) {
    console.log(error);
  }
};

const addtowishlist = async (req, res) => {
  const productid = req.params.id;
  const userId = req.session.user_id;
  try {
    const user = await User.findById({ _id: userId });
      user.wishlist.push(productid);
      await user.save();
      res.json({ success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "server error" });
  }
};

const removewishlist = async (req, res) => {
  try {
    const productid = req.query.id;
    const session = req.session.user_id;
    const user = await User.findById({ _id: session });
    user.wishlist.pull(productid);
    await user.save();
    res.redirect("/wishlist");
  } catch (error) {
    console.log(error);
  }
};

const shop = async (req, res) => {
  try {
    const session = req.session.user_id;
    let page = req.query.page || 1;
    const user = await User.findOne({ _id: session });
    const brandData = await Brand.find({});
    const categoryData = await Catogory.find({});
    const ProductData = await Product.find({ status: { $ne: 1 } })
      .sort({ _id: -1 })
      .limit(6)
      .skip((page - 1) * 6)
      .exec();
    const count = await Product.find({ status: { $ne: 1 } })
      .sort({ _id: -1 })
      .countDocuments();
    res.render("shop", {
      ProductData,
      user,
      brandData,
      categoryData,
      session,
      totalPages: Math.ceil(count / 6),
    });
  } catch (error) {
    console.log(error.message);
  }
};

/////////////////////////////////////product filtering\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

const productFilter = async (req, res) => {
  try {
    let product;
    let products = [];
    let Categorys = [];
    let Data = [];
    let Datas = [];
    let brand = [];
    const { categorys, search, brands, filterprice, sort } = req.body;
    brand = brands;

    if (!search) {
      if (filterprice != 0) {
        if (filterprice.length == 2) {
          product = await Product.find({
            status: 0,
            $and: [
              { price: { $lte: Number(filterprice[1]) } },
              { price: { $gte: Number(filterprice[0]) } },
            ],
          })
            .populate("category")
            .populate("brand");
        } else {
          product = await Product.find({
            status: 0,
            $and: [{ price: { $gte: Number(filterprice[0]) } }],
          })
            .populate("category")
            .populate("brand");
        }
      } else if (sort) {
        product = await Product.find({ status: 0 })
          .populate("category")
          .populate("brand")
          .sort({ price: sort });
      } else {
        product = await Product.find({ status: 0 })
          .populate("category")
          .populate("brand");
      }
    } else {
      if (filterprice != 0) {
        if (filterprice.length == 2) {
          product = await Product.find({
            status: 0,
            $and: [
              { price: { $lte: Number(filterprice[1]) } },
              { price: { $gte: Number(filterprice[0]) } },
              {
                $or: [
                  {
                    productname: {
                      $regex: ".*" + search + ".*",
                      $options: "i",
                    },
                  },
                ],
              },
            ],
          })
            .populate("category")
            .populate("brand");
        } else {
          product = await Product.find({
            status: 0,
            $and: [
              { price: { $gte: Number(filterprice[0]) } },
              {
                $or: [
                  {
                    productname: {
                      $regex: ".*" + search + ".*",
                      $options: "i",
                    },
                  },
                ],
              },
            ],
          })
            .populate("category")
            .populate("brand");
        }
      } else if (sort) {
        product = await Product.find({
          status: 0,
          $or: [
            { productname: { $regex: ".*" + search + ".*", $options: "i" } },
          ],
        })
          .populate("category")
          .populate("brand");
      } else {
        product = await Product.find({
          status: 0,
          $or: [
            { productname: { $regex: ".*" + search + ".*", $options: "i" } },
          ],
        })
          .populate("category")
          .populate("brand");
      }
    }
    if (categorys) {
      Categorys = categorys.filter((value) => {
        return value !== null;
      });
    }

    if (Categorys[0]) {
      Categorys.forEach((element, i) => {
        products[i] = product.filter((value) => {
          return value.category.catogoryname == element;
        });
      });

      products.forEach((value, i) => {
        Data[i] = value.filter((v) => {
          return v;
        });
      });

      if (brands) {
        brands.forEach((value, i) => {
          Data.forEach((element) => {
            Datas[i] = element.filter((product) => {
              return product.brand.brandname == value;
            });
          });
        });
      }
      Datas.forEach((value, i) => {
        Data[i] = value;
      });
    } else {
      if (brands[0]) {
        brands.forEach((value, i) => {
          Data[i] = product.filter((element) => {
            return element.brand.brandname == value;
          });
        });
      } else {
        Data[0] = product;
      }
    }
    res.json({ Data });
  } catch (error) {
    console.log(error);
  }
};

// /////////////////////////////////////////address management\\\\\\\\\\\\\\\\\\\\

const addressPage = async (req, res) => {
  try {
    const session = req.session.user_id;
    const id = req.session.user_id;
    res.render("addAddress", { id, msg, message, session });
    msg = null;
    message = null;
  } catch (error) {
    console.log(error);
  }
};

const addAddress = async (req, res) => {
  try {
    const id = req.session.user_id;
    const userData = await User.findById({ _id: id });
    const data = req.body;
    if (
      (data.name,
      data.email,
      data.city,
      data.state,
      data.district,
      data.country,
      data.zip,
      data.address)
    ) {
      const userData = await User.findOne({ _id: id });
      userData.address.push(data);
      await userData.save();
      res.redirect("/addAddress");
      msg = "address added successfully";
    } else {
      res.redirect("/addAddress");
      message = "please fill form completly";
    }
  } catch (error) {
    console.log(error);
  }
};

const loadEditAddress = async (req, res) => {
  try {
    const session = req.session.user_id;
    const index = req.query.index;
    const user = await User.findById({ _id: session });
    const address = user.address[index];
    res.render("editAddress", { msg, message, address, index });
  } catch (error) {
    console.log(error);
  }
};

const editAddress = async (req, res) => {
  try {
    const id = req.session.user_id;
    const user = await User.find({ _id: id });
    const index = req.query.index;
    const data = req.body;
    if (id === undefined) {
      res.redirect("/checkout");
      message = "Login with your account";
    }
    const key = `address.${index}`;
    if (
      (data.address,
      data.city,
      data.district,
      data.state,
      data.zip,
      data.name,
      data.mobile,
      data.email)
    ) {
      const editAddress = {
        name: data.name,
        email: data.email,
        mobile: data.mobile,
        city: data.city,
        address: data.address,
        district: data.district,
        state: data.state,
        zip: data.zip,
      };
      const updateAddress = await User.updateOne(
        { _id: id },
        { $set: { [key]: editAddress } }
      );
      if (updateAddress) {
        res.redirect("/editAddress?index=" + index);
        msg = "Address Updated successfully";
      } else {
        res.redirect("/checkout");
        message = "Error";
      }
    } else {
      res.redirect("/editAddress?index=" + index);
      message = "Please fill all the forms";
    }
  } catch (error) {
    console.log(error);
  }
};

const deleteAddress = async (req, res) => {
  try {
    const session = req.session.user_id;
    const index = req.body.indexcn;
    const deletedAddress = await User.updateOne(
      { _id: session },
      { $unset: { [`address.${index}`]: "" } }
    );
    await User.updateOne({ _id: session }, { $pull: { address: null } });
    res.json({ success: true });
  } catch (error) {
    console.log(error);
  }
};

/////////////////////////////Profile management\\\\\\\\\\\\\\\\\\\\\\\

const profileLoad = async (req, res) => {
  try {
    const session = req.session.user_id;
    const userData = await User.findOne({ _id: session });
    const wallet = userData.wallet;
    const orders = await Orders.find({ _id: session });
    res.render("userProfile", { session, userData, wallet, orders });
  } catch (error) {
    console.log(error);
  }
};
const editProfile = async (req, res) => {
  try {
    const session = req.session.user_id;
    const userData = await User.findOne({ _id: session });
    const userAddress = await User.find({ _id: session }, {});
    res.render("editProfile", { userData, session });
  } catch (error) {
    console.log(error);
  }
};

const updateProfile = async (req, res) => {
  try {
    const session = req.session.user_id;
    await User.updateOne(
      { _id: session },
      {
        $set: {
          name: req.body.name,
          email: req.body.email,
          mobile: req.body.mno,
        },
      }
    );
    res.redirect("/userProfile");
  } catch (error) {
    console.log(error);
  }
};
////////////////Apply Coupon /////////////////////////////

const applyCoupon = async (req, res) => {
  try {
    let code = req.body.coupon;
    const session = req.session.user_id;
    const cart = await Cart.findOne({ userId: session });
    req.session.coupon = code;
    if (req.session.user_id) {
      let session = req.session.user_id;
      const userId = await User.findOne({ _id: session });
      let coupons = await Coupon.findOne({
        couponCode: code,
        status: 0,
      }).lean();
      if (coupons != null) {
        if (cart.totalPrice >= coupons.minAmount) {
          let today = new Date();
          if (coupons.endDate > today) {
            let userfind = await Coupon.findOne(
              { couponCode: code, user: userId._id },
              {}
            ).lean();
            const cart = await Cart.findOne(
              { userId: req.session.user_id },
              { totalPrice: 1 }
            );
            let userID = userId._id;
            if (userfind == null) {
              let discount = 10;
              const discountPrice = Math.min(
                coupons.maxDiscount,
                (cart.totalPrice * discount) / 100
              );
              amount = cart.totalPrice - discountPrice;
              await userId.save();
              await Coupon.findOneAndUpdate(
                { couponCode: code },
                { $push: { user: userId._id } }
              );
              res.json({ status: true, discountPrice, amount });
            } else {
              res.json({ used: true });
            }
          } else {
            res.json({ expired: true });
          }
        } else {
          res.json({ lowPrice: true });
        }
      } else {
        res.json({ noMatch: true });
      }
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.log(error);
  }
};

/////////////////////////////////////load checkout\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

const loadCheckout = async (req, res) => {
  if (req.session.user_id) {
    const cart = await Cart.findOne({ userId: req.session.user_id });
    if (!cart) {
      res.redirect("/cart");
    }
    try {
      let totalPrice = 0;
      let session = req.session.user_id;
      const userDetails = await User.findById({ _id: session });

      const userAddress = userDetails.address;
      const cart = await Cart.findOne({ userId: session }).populate(
        "item.product"
      );
      const wallet = userDetails.wallet;
      const items = cart.item;
      if (cart && cart.item != null) {
        cart.item.forEach((value) => {
          totalPrice += value.price * value.quantity;
        });
      }
      const coupons = await Coupon.find();
      res.render("checkout", {
        session,
        userAddress,
        msg,
        items,
        totalPrice,
        items,
        wallet,
        coupons,
      });
      msg = null;
    } catch (error) {
      console.log(error);
    }
  } else {
    res.redirect("/login");
    message = "Login With your account to access this page";
  }
};

// //////////////////////////////////payment page\\\\\\\\\\\\\\\\\\\\\

const loadPaymentPage = async (req, res) => {
  try {
    index = req.body.address;
    if (!index) {
      res.redirect("/checkout");
    }
    let session = req.session.user_id;
    const Total = req.body.totalPrice;
    req.session.total = Total;
    const user = await User.findOne({ _id: session });
    wallet = user.wallet;

    if (req.body.flexRadioDefault === "wallet") {
      if (wallet >= Total) {
        const ok = await User.updateOne(
          { _id: session },
          { $in: { wallet: -Total } }
        );
        paymentType = req.body.flexRadioDefault;
        if (wallet >= Total) {
          orderStatus = 1;
          res.redirect("/orderConfirmation");
        }
      }
    }
    if (req.body.flexRadioDefault === "wallet") {
      req.session.ok = Total - wallet;
      req.session.wallet = wallet;
      return res.render("paymentPage", { Total, session, msg, wallet });
    } else {
      let wallet = 0;
      req.session.wallet = null;
      req.session.ok = Total;
      res.render("paymentPage", { Total, session, msg, wallet });
    }
  } catch (error) {
    console.log(error);
  }
};

const orderConfirm = async (req, res) => {
  try {
    const payment = req.body;
    req.session.paymentType = payment.flexRadioDefault;
    if (payment.flexRadioDefault == "COD") {
      orderStatus = 1;
      res.redirect("/orderConfirmation");
    } else if (payment.flexRadioDefault == "online") {
      const currencyMap = {
        840: "USD",
        978: "EUR",
        826: "GBP",
      };
      const currencyCode = currencyMap["840"];
      const amount = {
        currency: currencyCode,
        total: req.session.ok,
      };

      const create_payment_json = {
        intent: "sale",
        payer: {
          payment_method: "paypal",
        },
        redirect_urls: {
          return_url: process.env.SITE_URL + "/success",
          cancel_url: process.env.SITE_URL + "/checkout",
        },
        transactions: [
          {
            amount,
            description: "New Fashion",
          },
        ],
      };

      paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
          throw error;
        } else {
          for (let i = 0; i < payment.links.length; i++) {
            if (payment.links[i].rel === "approval_url") {
              res.redirect(payment.links[i].href);
            }
          }
        }
      });
    }
  } catch (error) {
    console.log(error);
  }
};

const razorpayConfirm = async (req, res) => {
  try {
    var options = {
      amount: req.session.ok * 100,
      currency: "INR",
      receipt: "order_rcptid_11qsasdasdasd",
    };
    const order = await instance.orders.create(options);
    orderStatus = 1;
    res.json({ order });
  } catch (error) {}
};

const orderDetails = async (req, res) => {
  try {
    const session = req.session.user_id;
    let message = null;
    if (!session) {
      res.redirect("/login");
      message = "Login to Access this page";
      return;
    }

    const userData = await User.findOne({ _id: session });
    let decreasingAmount = req.session.wallet;
    await User.updateOne(
      { _id: session },
      { $inc: { wallet: -decreasingAmount } }
    );
    if (orderStatus === 1) {
      const cart = await Cart.findOne({ userId: session }).populate(
        "item.product"
      );
      const user = await User.findOne({ _id: session });
      const paymentType = req.session.paymentType;
      let address = user.address[0];
      if (index !== undefined) {
        address = user.address[index];
      }
      const orderItems = cart.item.map((item) => ({
        product: item.product._id,
        price: item.price,
        quantity: item.quantity,
      }));
      const latestOrder = await Orders.findOne().sort("-orderCount").exec();
      const order = new Orders({
        userId: session,
        item: orderItems,
        address,
        totalPrice: req.session.total,
        orderCount: latestOrder ? latestOrder.orderCount + 1 : 1,
        order_date: new Date().toLocaleDateString("en-GB"),
        paymentType: paymentType,
      });
      await order.save();
      const orderData = await Orders.findOne({ userId: session })
        .sort({ _id: -1 })
        .populate("item.product");

      orderData.item.forEach(async (item) => {
        const productid = item.product._id;
        const decreaseQuantity = item.quantity;
        await Product.updateOne(
          { _id: productid },
          { $inc: { quantity: -decreaseQuantity } }
        );
      });

      await Cart.deleteMany({ userId: session });
      orderStatus = 0;
    }
    const orders = await Orders.findOne({ userId: session })
      .sort({ _id: -1 })
      .limit(1)
      .populate("item.product");
    res.render("confirmation", { orders, session, msg });
  } catch (error) {
    console.log(error);
  }
};


                              ///...order-list and order-action...\\\
const orderData = async (req, res) => {
  try {
    const session = req.session.user_id;
    let page = req.query.page || 1;
    const orders = await Orders.find({ userId: session })
      .populate("item.product")
      .sort({ _id: -1 })
      .limit(4)
      .skip((page - 1) * 4)
      .exec();
    const count = await Orders.find({ userId: session })
      .populate("item.product")
      .sort({
        _id: -1,
      })
      .countDocuments();
    res.render("orderPage", {
      orders,
      session,
      totalPages: Math.ceil(count / 4),
    });
  } catch (error) {
    console.log(error);
  }
};


                                ///...user-order-detail...\\\
const fullOrder = async (req, res) => {
  try {
    const id = req.query.orderId;
    const session = req.session.user_id;
    const orderData = await Orders.findOne({ _id: id }).populate(
      "item.product"
    );
    if (id) {
      res.render("orderDetails", { orders: orderData, session });
    } else {
      res.redirect("/orders");
    }
  } catch (error) {
    console.log(error);
  }
};


                                ///...cancel-order...\\\
const cancelOrder = async (req, res) => {
  try {
    const id = req.query.orderId;
    session = req.session.user_id;
    const orderDetails = await Orders.updateOne(
      { _id: id },
      { $set: { user_cancelled: true } }
    );
    const orderData = await Orders.findOne({ userId: session })
      .sort({ _id: -1 })
      .populate("item.product");
    orderData.item.forEach(async (item) => {
      const productid = item.product._id;
      const increaseQuantity = item.quantity;
      await Product.updateOne(
        { _id: productid },
        { $inc: { quantity: increaseQuantity } }
      );
    });

    if (
      orderData.paymentType === "online" ||
      orderData.paymentType === "wallet"
    ) {
      increaseAmount = orderData.totalPrice;
      await User.updateOne(
        { _id: session },
        { $inc: { wallet: increaseAmount } }
      );
    }
    res.redirect("/orderDetails");
  } catch (error) {
    console.log(error);
  }
};


                                  ///...return-order...\\\
const returnOrder = async (req, res) => {
  try {
    const id = req.query.orderId;
    const session = req.session.user_id;
    const orderDetails = await Orders.findById({ _id: id });
    increaseAmount = orderDetails.totalPrice;
    await Orders.findByIdAndUpdate({ _id: id }, { $set: { is_returned: 1 } });
    const ans = await User.updateOne(
      { _id: session },
      { $inc: { wallet: increaseAmount } }
    );
    res.redirect("/orders");
  } catch (error) {
    console.log(error);
  }
};



    /////////////////////////////////////Review Management\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\


                              ///....add-review...\\\                             
const addReview = async (req, res) => {
  try {
    const session = req.session.user_id;
    const name = req.body.name;
    const review = req.body.review;
    const rating = req.body.rating;
    const productId = req.query.id;
    const user = await User.findById({ _id: session });
    const order = await Orders.findOne({
      userId: session,
      "item.product": productId,
    });

    if (!order) {
      return res.status(200).json({
        message:
          "you cant review this product ,puchase product before add review",
      });
    } else {
      const product = await Product.findById({ _id: productId });
    }
    Product.findOneAndUpdate(
      { _id: productId },
      {
        $push: { review: { userId: session, rating: rating, review: review } },
      },
      { new: true }
    )
      .then((updatedProduct) => {
        console.log("Product updated:", updatedProduct);
      })
      .catch((err) => {
        console.error("Error updating product:", err);
      });
    res.redirect("/productdetail?id=" + productId);
  } catch (error) {
    console.log(error);
  }
};


                                      ///....edit-review....\\\
const editReview = async (req, res) => {
  try {
    const productId = req.query.id;
    const index = req.query.index;
    const product = await Product.findById({ _id: productId });
    const review = product.review[index];
    res.render("editReview", { product, review, session: req.session.user_id });
  } catch (error) {
    console.log(error);
  }
};


                                    ///...update-edited-review...\\\
const updatedReview = async (req, res) => {
  try {
    const productId = req.body.id;
    const reviewIndex = req.body.index;
    const reviewData = {
      rating: req.body.rating,
      review: req.body.review,
    };
    const updatedProduct = await Product.findOneAndUpdate(
      {
        _id: productId,
        "review._id": reviewIndex,
      },
      {
        $set: {
          "review.$.review": reviewData.review,
          "review.$.rating": reviewData.rating,
        },
      },
      {
        new: true,
      }
    );

    if (updatedProduct) {
      res.redirect("/productdetail?id=" + productId);
    } else {
      res.status(404).send("Product not found");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};



                                  ///...delete-review...\\\
const deleteReview = async (req, res) => {
  try {
    const productId = req.query.id;
    const index = req.query.index;
    const deleteReview = await Product.updateOne(
      { _id: productId },
      { $unset: { [`review.${index}`]: "" } }
    );
    await Product.updateOne({ _id: productId }, { $pull: { review: null } });
    res.redirect("/productdetail?id=" + productId);
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  loadRegister,
  insertUser,
  loginLoad,
  verifyLogin,
  loadHome,
  userLogout,
  resendOTP,
  verifyotp,
  productdetail,
  shop,
  loadforget,
  sendReset,
  verifyReset,
  productFilter,
  loadCheckout,
  addressPage,
  addAddress,
  loadEditAddress,
  editAddress,
  deleteAddress,
  applyCoupon,
  loadPaymentPage,
  orderConfirm,
  orderDetails,
  razorpayConfirm,
  profileLoad,
  editProfile,
  updateProfile,
  orderData,
  fullOrder,
  cancelOrder,
  returnOrder,
  addReview,
  editReview,
  updatedReview,
  deleteReview,
  wishlist,
  addtowishlist,
  removewishlist,
};
