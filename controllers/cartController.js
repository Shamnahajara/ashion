const User = require("../models/userModel");
const Catogory = require("../models/catogoryModel");
const Brand = require("../models/brandModel");
const Product = require("../models/productModel");
const Cart = require("../models/cartModel");

let msg;
let message;


                                          //...loadCart...\\
const loadCart = async (req, res) => {
    try {
      let totalPrice = 0;
      session = req.session.user_id;
      const cart = await Cart.findOne({ userId: session }).populate(
        "item.product"
      );
      if (!cart || !session) {
        res.render("shop-cart", { items: [], totalPrice, session });
      }
  
      if (cart && cart.item != null) {
        cart.item.forEach((value) => {
          totalPrice += value.price * value.quantity;
        });
      }
      await Cart.updateOne(
        { userId: session },
        { $set: { totalPrice: totalPrice } }
      );
      const items = cart.item;
      res.render("shop-cart", { items, session, totalPrice });
    } catch (err) {
      console.error(err);
    }
  };
    

                                          //..add to Cart..\\           
  const addToCart = async (req, res) => {
    try {
        const productId = req.params.id;
        const userId = req.session.user_id;
        const product = await Product.findOne({ _id: productId });
        const userCart = await Cart.findOne({ userId: userId });
        if (userCart) {
          const itemIndex = userCart.item.findIndex(
            (item) => item.product._id.toString() === productId
          );
  
          if (itemIndex >= 0) {
            const inc = await Cart.updateOne(
              { userId: userId, "item.product": productId },
              { $inc: { "item.$.quantity": 1 } }
            );
            res.json({success:true})
          } else {
            const create = await Cart.updateOne(
              { userId: userId },
              {
                $push: {
                  item: {
                    product: productId,
                    price: product.price,
                    quantity: 1,
                  },
                },
              }
            );

            res.json({success:true})
          }
        } else {
          const createNew = await Cart.create({
            userId: userId,
            item: [
              {
                product: productId,
                price: product.price,
                quantity: 1,
              },
            ],
          });

        }
        res.json({success:true})
      
    } catch (error) {
      console.log(error);
    }
  };


  
                                            //...incriment Cart...\\\
  const   incrementCart = async (req, res, next) => {
    try {
        const user_id = req.session.user_id
        const ProductID = req.query.id
        const productData = await Product.findOne({ _id: ProductID })
        let cartData = await Cart.findOne({ userId: user_id,'item.product': ProductID })

        let cartProductDatial = cartData.item.filter(value => {
            return value.product == ProductID
        })
        if (productData.stock <= cartProductDatial[0].quantity) {
            message = "Maximum Stock Done"
            res.json({ outOfStock: true })
        } else {
            await Cart.updateOne({ userId: user_id,'item.product': ProductID }, { $inc: { 'item.$.quantity': 1 } })
            cartData = await Cart.findOne({ userId: user_id, 'item.product': ProductID })
            cartProductDatial = cartData.item.filter(value => {
                return value.product == ProductID
            })
          
            const price = Number( productData.price)
            const quantity = Number(cartProductDatial[0].quantity)
            const totalprice = Number(price * quantity)
            await Cart.findOneAndUpdate({ userId: user_id, 'item.product': ProductID }, {
                $set: {
                    'item.$.price': price,
                }
            })
            cartData = await Cart.findOne({ userId: user_id, 'item.product': ProductID })
            let subtotal=0;
            if (cartData && cartData.item != null) {
              cartData.item.forEach((value) => {
                subtotal += value.price * value.quantity;
              });
            }
           
            let ttlPrice = await Cart.findOneAndUpdate({ userId: user_id }, { $set: { totalPrice:Number(subtotal) } })
            console.log(ttlPrice)
            res.json({ quantity, totalprice, ProductID, subtotal })
        }
    } catch (err) {
        console.log(err);
        res.status(500).send('server error')
    }
}

                                              //...Decriment Cart...\\
const  decrementCart = async (req, res, next) => {
  try {
      const user_id = req.session.user_id
      const ProductID = req.query.id
      let cartData = await Cart.findOne({ userId: user_id, 'item.product': ProductID })
      const productData = await Product.findOne({ _id: ProductID })
      let cartProductDatial = cartData.item.filter(value => {
          return value.product == ProductID
      })
      if (cartProductDatial[0].quantity <= 1) {
          res.json({ x : "" })
      } else {

          const Cartdecrement = await Cart.updateOne({ userId: user_id,'item.product': ProductID }, { $inc: { 'item.$.quantity': -1 } })

          cartData = await Cart.findOne({ userId: user_id, 'item.product': ProductID })
          cartProductDatial = cartData.item.filter(value => {
              return value.product == ProductID
          })
      
          const price = productData.price
          const quantity = cartProductDatial[0].quantity
          const totalprice = price * quantity
          const updateCart = await Cart.findOneAndUpdate({ userId: user_id, 'item.product': ProductID }, {
              $set: {
                  'item.$.price': price,   
              }
          })
          cartData = await Cart.findOne({ userId: user_id, 'item.product': ProductID })
          const subtotal = cartData.item.map((value) => {
              return value.price
          }).reduce((total, value) => {
              return total = total + value
          }, 0)
         
          await Cart.updateOne({ userId: user_id }, { $set: { totalPrice: subtotal} })
          res.json({ quantity, totalprice, ProductID, subtotal })
      }
  } catch (err) {
      console.log(err);
      res.status(500).send('server error')
  }
}


                                        //...remove-Cart...\\\
const removeCart = async (req, res) => {
  const id = req.body.id;
  const userId = req.session.user_id;
  const del = await Cart.updateOne(
    { userId: new Object(userId) },
    { $pull: { item: { _id: id } } }
  );

  res.json({ success: true });
};



  module.exports = {
 
    loadCart,
    addToCart,
    incrementCart,
    decrementCart,
    removeCart
   
  }