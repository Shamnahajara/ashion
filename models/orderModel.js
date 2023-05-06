const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
      item: [
        {
          product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "product",
          },
          price: {
            type: Number,
            required: true,
          },
          quantity: {
            type: Number,
            default: 1,
            required: true,
          },
        },
      ],
      start_date: {
        type: Date,
        default:Date.now()
      },
      delivered_date: {
        type: Date,
      },
      totalPrice: {
        type: String,
      },
      is_delivered: {
        type: Boolean,
        default: false,
      },
      user_cancelled: {
        type: Boolean,
        default: false,
      },
      admin_cancelled: {
        type: Boolean,
        default: false,
      },
      orderCount: {
        type: Number,
        default: 0,
      },
      is_returned: {
        type: Number,
        default: 0,
      },
      return_date: {
        type: Date
      },
      address: {
        type: Array,
      },
      paymentType: {
        type: String,
      }
});

module.exports = mongoose.model("orders",orderSchema);