const mongoose = require('mongoose');

const BrandSchema = new mongoose.Schema({
  name: String,
  year_founded: String,
  address: {
    street: String,
    city: String,
    state: String,
    postal_code: String,
    country: String
  }
});

const ProductSchema = new mongoose.Schema({
  productId: String,
  productName: String,
  brandName: String,
  category: String,
  description: String,
  price: Number,
  currency: String,
  processor: String,
  memory: String,
  releaseDate: String,
  averageRating: Number,
  ratingCount: Number
});

module.exports = {
  Brand: mongoose.model('Brand', BrandSchema),
  Product: mongoose.model('Product', ProductSchema)
};
