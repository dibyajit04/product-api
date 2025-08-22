require('dotenv').config();
const mongoose = require('mongoose');
const { Product, Brand } = require('./models');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  // Sample brands
  const brands = [
    {
      name: 'Zenith',
      year_founded: '1995',
      address: {
        street: '123 Innovation Drive',
        city: 'Sanjose',
        state: 'California',
        postal_code: '95113',
        country: 'USA'
      }
    },
    {
      name: 'Aura',
      year_founded: '2005',
      address: {
        street: '456 Tech Park',
        city: 'Bangalore',
        state: 'Karnataka',
        postal_code: '560001',
        country: 'India'
      }
    }
  ];

  // Sample products
  const products = [
    {
      productId: 'SKU-LPTP-019',
      productName: 'Zenith Gram SuperSlim',
      brandName: 'Zenith',
      category: 'Laptops',
      description: 'The thinnest Gram ever. An unbelievably slim and light laptop with a vibrant OLED display.',
      price: 1699.99,
      currency: 'USD',
      processor: 'Intel Core i7',
      memory: '16GB LPDDR5',
      releaseDate: '2024-12-22',
      averageRating: 4.7,
      ratingCount: 250
    },
    {
      productId: 'SKU-MOBL-019',
      productName: 'Aura ROG Phone 8',
      brandName: 'Aura',
      category: 'Mobiles',
      description: 'The ultimate gaming phone, redesigned. A sleeker, more powerful device for gamers and beyond.',
      price: 1099.99,
      currency: 'USD',
      processor: 'Aura Snapdragon 8 Gen 3',
      memory: '16GB RAM',
      releaseDate: '2024-11-12',
      averageRating: 4.8,
      ratingCount: 600
    }
  ];

  await Brand.deleteMany({});
  await Product.deleteMany({});
  await Brand.insertMany(brands);
  await Product.insertMany(products);

  console.log('Database seeded!');
  mongoose.disconnect();
}

seed();
