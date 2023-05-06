const User = require("../models/userModel");
const Catogory = require("../models/catogoryModel");
const Brand = require("../models/brandModel");
const Product = require("../models/productModel");
const bcrypt = require("bcrypt");
const mime = require("mime-types");
const cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});
const Orders = require("../models/orderModel");
let message;
let msg;

/////////////////////////////////////////Login-page\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

const loadLogin = async (req, res) => {
  try {
    res.render("login");
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
        if (userData.is_admin === 0) {
          res.render("login", { snd: "You are  not an admin " });
        } else {
          req.session.aduser_id = userData._id;
          res.redirect("/admin/home");
        }
      } else {
        res.render("login", { snd: " password is incorrect" });
      }
    } else {
      res.render("login", { snd: "Email or password is incorrect" });
    }
  } catch (error) {
    console.log(error.message);
  }
};


/////////////////////////////////////////Admin-DashBoard\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

const loadDashboard = async (req, res) => {
  try {

    let DailyEnd = new Date();
    let DailyStart = new Date(DailyEnd.getTime() - 86400000);

    let monthlyStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1 );
    let monthlyEnd = (DailyEnd = new Date( new Date().getFullYear(),new Date().getMonth() +1,0));

    let yearlyStart = new Date(new Date().getFullYear(),0,1);
    let yearlyEnd = new Date(new Date() .getFullYear(),11,31);

    let dailySalesData = await Orders.find({
      is_delivered: true,
      is_returned: 0,
      delivered_date: {
        $gte: DailyStart,
        $lte: DailyEnd
      }
    }).populate("userId").populate("item.product");

    const dailySales = dailySalesData.reduce((total, order)=> {
      const itemTotal = order.item.reduce(
        (sum,item) => sum + item.price * item.quantity,0
      );
      return total + itemTotal;

    }, 0);

    const dailySalesDocument = await Orders.find({
      is_delivered: true,
      is_returned: 0,
      delivery_date: {
        $gte: DailyStart,
        $lte: DailyEnd,
      }
    }).populate("userId").populate("item.product").countDocuments();


    const dailySalesProduct = dailySalesData.reduce((total, order) => {
       const orderProductsCount = order.item.reduce(
         (sum,item) => sum + item.quantity,0
       );
       return total + orderProductsCount;
    }, 0);

    let monthlySalesData = await Orders.find({
      is_delivered : true,
      is_returned: 0,
      delivered_date:{
        $gte: monthlyStart,
        $lte: monthlyEnd,
      }
    }).populate("userId").populate("item.product");


  const monthlySales =  monthlySalesData.reduce((total,order)=>{
    const itemTotal = order.item.reduce(
      (sum,item)=> sum + item.price * item.quantity,0
    );
    return total + itemTotal;
  },0);

  const monthlySalesDocument = await Orders.find({
    is_delivered: true,
    is_returned: 0,
    delivered_date: {
      $gte: monthlyStart,
      $lte: monthlyEnd
    },
  }).populate("userId").populate("item.product").countDocuments();


  const monthlySalesProduct = monthlySalesData.reduce((total,order)=>{
    const orderProductsCount = order.item.reduce(
      (sum,item) => sum+item.quantity,0
    );
    return total + orderProductsCount
  },0);


  let yearlySalesData = await Orders.find({

    is_delivered: true,
    is_returned: 0,
    delivered_date: {
      $gte: yearlyStart,
      $lte: yearlyEnd
    }
  }).populate("userId").populate("item.product");

  const yearlySalesProduct = yearlySalesData.reduce((total,order)=>{
    const orderProductsCount = order.item.reduce(
      (sum, item) => sum+item.quantity,0
    );
    return total + orderProductsCount;
  }, 0);


  const yearlySaleDocument = await Orders.find({
    is_delivered: true,
    is_returned: 0,
    delivered_date:{
      $gte: yearlyStart,
      $lte: yearlyEnd
    }
  }).populate("userId").populate("item.product").countDocuments();

const yearlySales = yearlySalesData.reduce((total,order) =>{
  const itemTotal = order.item.reduce(
  (sum,item) => sum + item.price * item.quantity,0
  );
  return total + itemTotal;
},0);

const startDate = req.query.start_date ? new Date(req.query.end_date):null;
const endDate = req.query.end_date ? new Date(req.query.end_date):null;

if(endDate){
  endDate.setDate(endDate.getDate()+1);
}

let query = {is_delivered: true,is_returned: 0};
if(startDate && endDate){
  query.delivered_date = {$gte: startDate , $lte: endDate};
}else if (startDate) {
  query.delivered_date = { $gte: startDate };
} else if (endDate) {
  query.delivered_date = { $lte: endDate };
}
const salesData = await Orders.find(query).populate("userId").populate('item.product');
let totalAmount = 0;
for (i = 0; i < salesData.length; i++) {
  totalAmount += parseInt(salesData[i].totalPrice);
}

const monthlySalesDetails = [];
for (let i = 0; i < 12; i++) {
  const salesOfMonth = yearlySalesData.filter((order) => {
    return order.delivered_date.getMonth() === i;
  });

  const totalSalesOfMonth = salesOfMonth.reduce((total, order) => {
    return (
      total +
      order.item.reduce((sum, item) => {
        return sum + item.price * item.quantity;
      }, 0)
    );
  }, 0);

  monthlySalesDetails.push(totalSalesOfMonth);
}


const allMonthsUser = [...Array(12).keys()].map((m) => m + 1);

let monthlyOrderCounts = allMonthsUser.reduce((acc, cur) => {
  acc[cur - 1] = 0;
  return acc;
}, []);

yearlySalesData.forEach((order) => {
  let deliveredDate = new Date(order.delivered_date);
  let month = deliveredDate.getMonth() + 1;
  monthlyOrderCounts[month - 1]++;
});

const allMonthsProduct = [...Array(12).keys()].map((m) => m + 1);

let monthlyProductCounts = allMonthsProduct.reduce((acc, cur) => {
  acc[cur - 1] = 0;
  return acc;
}, []);

yearlySalesData.forEach((order) => {
  let deliveredDate = new Date(order.delivered_date);
  let month = deliveredDate.getMonth() + 1;
  order.item.forEach((item) => {
    monthlyProductCounts[month - 1] += item.quantity;
  });
});


const userData = User.findById({ _id: req.session.aduser_id });
    res.render("adminHome",{
      dailySales,
      monthlySales,
      monthlySalesDocument,
      dailySalesProduct,
      monthlySalesProduct,
      dailySalesDocument,
      yearlySales,
      yearlySaleDocument,
      yearlySalesProduct,
      data: salesData,
      totalAmount,
      monthlySalesDetails: JSON.stringify(monthlySalesDetails),
      monthlyOrderCounts: JSON.stringify(monthlyOrderCounts),
      monthlyProductCounts: JSON.stringify(monthlyProductCounts),
    });
  } catch (error) {
    console.log(error);
  }
};




///////////////////////////////////////////Users_list && Usermanagement\\\\\\\\\\\\\\\\\\\\\\\\\

const loadUsers = async (req, res) => {
  try {
    const userData = await User.find({ is_admin: 0 });
    res.render("users", { users: userData });
  } catch (error) {
    console.log(error.message);
  }
};

const statusUpdate = async (req, res) => {
  try {
    const id = req.query.id;
    const user = await User.findOne({ _id: id });
    if (user.status === 0) {
      const block = await User.updateOne({ _id: id }, { $set: { status: 1 } });
      console.log("updated");
    } else {
      const unblock = await User.updateOne(
        { _id: id },
        { $set: { status: 0 } }
      );
      console.log("unapdated");
    }
    res.redirect("/admin/users");
  } catch (error) {
    console.log(error.message);
  }
};

/////////////////////////////////////////////category management\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

const loadAddCatogory = async (req, res) => {
  try {
    res.render("addCatogory");
  } catch (error) {
    console.log(error.message);
  }
};

const addCatogory = async (req, res) => {
  try {
    const existdata = await Catogory.findOne({ catogoryname: req.body.ctname });
    if (existdata) {
      return res.render("addCatogory", {
        msg: "category already added",
      });
    }

    const catogory = new Catogory({
      catogoryname: req.body.ctname,
    });
    const catogorydata = await catogory.save();

    if (catogorydata) {
      res.render("addCatogory", { message: "new catogory added" });
    } else {
      res.render("addCatogory", { message: "failed to add new catogory" });
    }
  } catch (error) {
    console.log(error.message);
  }
};



const loadCatogories = async (req, res) => {
  try {
    const catogoryData = await Catogory.find();
    res.render("catogory", {catogoryData});
  } catch (error) {
    console.log(error.message);
  }
};

const editCatogory = async (req, res) => {
  try {
    const id = req.query.id;
    const catogoryData = await Catogory.findOne({ _id: id });
    res.render("editCatogory", { catogoryData, message });
    message = null;
  } catch (error) {
    console.log(error);
  }
};

const updateCatogory = async (req, res) => {
  try {
    const existone = await Catogory.findOne({ catogoryname: req.body.name });
    console.log(existone);

    if (existone) {
      const id = req.query.id;
      const catogoryData = await Catogory.findOne({ _id: id });

      return res.render("editCatogory", {
        catogoryData,
        message: "Category is already added",
      });
    } else {
      const catogoryData = await Catogory.findByIdAndUpdate(
        { _id: req.body.id },
        { $set: { catogoryname: req.body.name } }
      );
      res.redirect("/admin/catogory");
    }
  } catch (error) {
    console.log(error);
  }
};

////////////////////////////////////////////brand management\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

const loadBrand = async (req, res) => {
  try {
    res.render("brand");
  } catch (error) {
    console.log(error.message);
  }
};

const loadAddBrand = async (req, res) => {
  try {
    res.render("addBrand");
  } catch (error) {
    console.log(error.message);
  }
};

const addBrand = async (req, res) => {
  try {
    const existBrand = await Brand.findOne({ brandname: req.body.name });
    if (existBrand) {
      return res.render("addBrand", { msg: "Brand already added" });
    }

    const brand = new Brand({
      brandname: req.body.name,
    });

    const branddata = await brand.save();

    if (branddata) {
      res.render("addBrand", { message: "new brand added" });
    } else {
      res.render("addBrand", { message: "failed to add new brand" });
    }
    console.log("okok");
  } catch (error) {
    console.log(error.message);
  }
};

const loadBrands = async (req, res) => {
  try {
    const brandData = await Brand.find();
    res.render("brand", { brandData });
  } catch (error) {
    console.log(error.message);
  }
};

const editBrand = async (req, res) => {
  try {
    const id = req.query.id;
    const brandData = await Brand.findById({ _id: id });

    if (brandData) {
      res.render("editBrand", { brands: brandData });
    } else {
      res.redirect("/admin/brand");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const updateBrand = async (req, res) => {
  try {

    const existBrand = await Brand.findOne({ brandname: req.body.name });

    if (existBrand) {
      const id = req.query.id;
      const brandData = await Brand.findById({ _id: id });
      return res.render("editBrand", {
        brands: brandData,
        message: "Brand already added",
      });
    } else {
      const brandData = await Brand.findByIdAndUpdate(
        { _id: req.body.id },
        { $set: { brandname: req.body.name } }
      );
      res.redirect("/admin/brand");
    }
  } catch (error) {
    console.log(error.message);
  }
};



//////////////////////////////////////Product management\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

const loadProduct = async (req, res) => {
  try {
    res.render("product");
  } catch (error) {
    console.log(error.message);
  }
};

const loadAddProduct = async (req, res) => {
  try {
    const catogoryData = await Catogory.find({});
    const brandData = await Brand.find({});
    res.render("addProduct", {category: catogoryData, brandData });
  } catch (error) {
    console.log(error.message);
  }
};

const addproduct = async (req, res) => {
  try {
    const arrimages = [];
    if (req.files) {
      for await (const file of req.files) {
        const mimeType = mime.lookup(file.orginalname);
        if (mimeType && mimeType.includes("/public/img/product")) {
          const result = await cloudinary.uploader.upload(file.path);
          arrimages.push(result.secure_url);
        } else {
          res.render("addProduct");
        }
      }
    }
 
    const addproduct = new Product({
      productname: req.body.productname,
      price: req.body.price,
      productimage: arrimages,
      description: req.body.description,
      quantity: req.body.quantity,
      category: req.body.category,
      brand: req.body.brand,
      status: 0,
    });

    const productData = await addproduct.save();

    if (productData) {
      res.redirect("/admin/product");
    } else {
      res.render("addProduct", { message: "Cant add new product" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const loadProductlist = async (req, res) => {
  try {
    const products = await Product.find({});
    res.render("product", { products });
  } catch (error) {
    console.log(error.message);
  }
};

const viewProduct = async (req, res) => {
  try {
    const id = req.query.id;
    const productData = await Product.findById({ _id: id })
      .populate("brand")
      .populate("category");

    res.render("viewProduct", { productData });
  } catch (error) {
    console.log(error.message);
  }
};

const editproduct = async (req, res) => {
  try {
    const id = req.query.id;
    const productData = await Product.findById({ _id: id })
      .populate("brand")
      .populate("category");
    const categoryData = await Catogory.find();
    const brandData = await Brand.find();

    res.render("editProduct", { productData, categoryData, brandData });
  } catch (error) {
    console.log(error.message);
  }
};

const updateProduct = async (req, res) => {
  try {
    for (let i = 0; i < req.files.length; i++) {
      const imageupload = req.files[i].path;
      const uploadResponse = await cloudinary.uploader.upload(imageupload);
      const imageURL = uploadResponse.secure_url;
      const productUpdate = await Product.updateOne(
        { _id: req.query.id },
        { $push: { productimage: imageURL } }
      );
      console.log(productUpdate);
    }

    const productUpdate = await Product.findByIdAndUpdate(
      { _id: req.query.id },
      {
        $set: {
          productname: req.body.productname,
          description: req.body.description,
          price: req.body.price,
          quantity: req.body.quantity,
          category: req.body.category,
          brand: req.body.brand,
          status: 0,
        },
      }
    );

    res.redirect("/admin/product");
  } catch (error) {
    console.log(error);
  }
};



const productUnlist = async (req, res) => {
  try {
    const id = req.query.id;
    const product = await Product.findOne({ _id: id });
    if (product.status === 0) {
      const unlist = await Product.updateOne(
        { _id: id },
        { $set: { status: 1 } }
      );
    } else {
      const unlist = await Product.updateOne(
        { _id: id },
        { $set: { status: 0 } }
      );
    }

    res.redirect("/admin/product");
  } catch (error) {
    console.log(error.message);
  }
};


//                                 //...delete image...\\
// const deleteimage = async (req, res) => {
//   try {
//     const id = req.query.id;
//     const imageupdate = await Product.updateOne(
//       { productimage: id },
//       { $pull: { productimage: { $in: [id] } } }
//     );

//     if (imageupdate) {
//       res.redirect("/admin/editProduct");
//     }
//   } catch (error) {
//     console.log(error.message);
//   }
// };


                                // ...delete product image updation...\\
const deleteImage = async (req, res) => {
  try {
    const productId = req.query.productId;
    const index = req.query.index;
    const deletedImage = await Product.updateOne(
      { _id: productId },
      { $unset: { [`productimage.${index}`]: "" } }
    );
    const deletedImages = await Product.updateOne(
      { _id: productId },
      { $pull: { productimage: null } }
    );

    res.redirect("/admin/editProduct?id=" + productId);
  } catch (error) {
    console.log(error);
  }
};

///////////////////Bcrypt\\\\\\\\\\\\\\\\\

const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
};

//////////////////Logout\\\\\\\\\\\\\\\
const logout = async (req, res) => {
  try {
    req.session.aduser_id = null;
    res.redirect("/admin");
  } catch (error) {
    console.log(error.message);
  }
};


module.exports = {
  loadLogin,
  verifyLogin,
  loadDashboard,
  loadUsers,
  securePassword,
  statusUpdate,
  loadAddCatogory,
  addCatogory,
  loadCatogories,
  editCatogory,
  updateCatogory,
  loadBrand,
  loadAddBrand,
  addBrand,
  loadBrands,
  editBrand,
  updateBrand,
  loadProduct,
  loadAddProduct,
  addproduct,
  loadProductlist,
  viewProduct,
  editproduct,
  updateProduct,
  productUnlist,
  deleteImage,

  logout,
};
