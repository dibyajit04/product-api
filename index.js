const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 5000;

// MongoDB connection
const mongoose = require('mongoose');
const { Product, Brand } = require('./models');
require('dotenv').config();
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Step 1: Proxy and filter data from external API
app.get('/step1', async (req, res) => {
  try {
    const response = await axios.get('http://interview.surya-digital.in/get-electronics');
    const products = Array.isArray(response.data) ? response.data : [];
    //console.log('Raw API response:', products);
    // Filter and format products using camelCase keys from API response
    const filtered = products.filter(item => {
      return item.productId && item.productName && item.brandName && item.category && item.description && item.price && item.currency && item.processor && item.memory && item.releaseDate && item.averageRating && item.ratingCount;
    }).map(item => ({
      product_id: item.productId || null,
      product_name: item.productName || null,
      brand_name: item.brandName || null,
      category_name: item.category || null,
      description_text: item.description || null,
      price: item.price || null,
      currency: item.currency || null,
      processor: item.processor || null,
      memory: item.memory || null,
      release_date: item.releaseDate || null,
      average_rating: item.averageRating || null,
      rating_count: item.ratingCount || null
    }));
    res.json(filtered);
  } catch (error) {
    console.error('Error fetching products:', error.message, error.response?.data);
    res.status(500).json({ error: 'Failed to fetch products.', details: error.message });
  }
});

// Step 2: Add release date filters
app.get('/step2', async (req, res) => {
  try {
    const { release_date_start, release_date_end } = req.query;
    // Validate date format if provided
    const isValidDate = (date) => /^\d{4}-\d{2}-\d{2}$/.test(date);
    if (release_date_start && !isValidDate(release_date_start)) {
      return res.status(400).json({ error: 'Invalid release_date_start format. Use YYYY-MM-DD.' });
    }
    if (release_date_end && !isValidDate(release_date_end)) {
      return res.status(400).json({ error: 'Invalid release_date_end format. Use YYYY-MM-DD.' });
    }
    const response = await axios.get('http://interview.surya-digital.in/get-electronics');
    const products = Array.isArray(response.data) ? response.data : [];
    const filtered = products.filter(item => {
      // Only include items with all required fields
      if (!(item.productId && item.productName && item.brandName && item.category && item.description && item.price && item.currency && item.processor && item.memory && item.releaseDate && item.averageRating && item.ratingCount)) {
        return false;
      }
      // Filter by release date if provided
      if (release_date_start && item.releaseDate < release_date_start) return false;
      if (release_date_end && item.releaseDate > release_date_end) return false;
      return true;
    }).map(item => ({
      product_id: item.productId || null,
      product_name: item.productName || null,
      brand_name: item.brandName || null,
      category_name: item.category || null,
      description_text: item.description || null,
      price: item.price || null,
      currency: item.currency || null,
      processor: item.processor || null,
      memory: item.memory || null,
      release_date: item.releaseDate || null,
      average_rating: item.averageRating || null,
      rating_count: item.ratingCount || null
    }));
    res.json(filtered);
  } catch (error) {
    console.error('Error in /step2:', error.message, error.response?.data);
    res.status(500).json({ error: 'Failed to fetch products.', details: error.message });
  }
});

// Step 3: Add brand filters (with release date filters)
app.get('/step3', async (req, res) => {
  try {
    const { brands, release_date_start, release_date_end } = req.query;
    // Validate date format if provided
    const isValidDate = (date) => /^\d{4}-\d{2}-\d{2}$/.test(date);
    if (release_date_start && !isValidDate(release_date_start)) {
      return res.status(400).json({ error: 'Invalid release_date_start format. Use YYYY-MM-DD.' });
    }
    if (release_date_end && !isValidDate(release_date_end)) {
      return res.status(400).json({ error: 'Invalid release_date_end format. Use YYYY-MM-DD.' });
    }
    // Parse brands into array
    let brandList = [];
    if (brands) {
      brandList = brands.split(',').map(b => b.trim()).filter(b => b.length > 0);
    }
    const response = await axios.get('http://interview.surya-digital.in/get-electronics');
    const products = Array.isArray(response.data) ? response.data : [];
    const filtered = products.filter(item => {
      // Only include items with all required fields
      if (!(item.productId && item.productName && item.brandName && item.category && item.description && item.price && item.currency && item.processor && item.memory && item.releaseDate && item.averageRating && item.ratingCount)) {
        return false;
      }
      // Filter by release date if provided
      if (release_date_start && item.releaseDate < release_date_start) return false;
      if (release_date_end && item.releaseDate > release_date_end) return false;
      // Filter by brand(s) if provided
      if (brandList.length > 0 && !brandList.includes(item.brandName)) return false;
      return true;
    }).map(item => ({
      product_id: item.productId || null,
      product_name: item.productName || null,
      brand_name: item.brandName || null,
      category_name: item.category || null,
      description_text: item.description || null,
      price: item.price || null,
      currency: item.currency || null,
      processor: item.processor || null,
      memory: item.memory || null,
      release_date: item.releaseDate || null,
      average_rating: item.averageRating || null,
      rating_count: item.ratingCount || null
    }));
    res.json(filtered);
  } catch (error) {
    console.error('Error in /step3:', error.message, error.response?.data);
    res.status(500).json({ error: 'Failed to fetch products.', details: error.message });
  }
});

// Step 4: Add pagination (with brand and release date filters)
app.get('/step4', async (req, res) => {
  try {
    const { page_size, page_number, brands, release_date_start, release_date_end } = req.query;
    // Validate date format if provided
    const isValidDate = (date) => /^\d{4}-\d{2}-\d{2}$/.test(date);
    if (release_date_start && !isValidDate(release_date_start)) {
      return res.status(400).json({ error: 'Invalid release_date_start format. Use YYYY-MM-DD.' });
    }
    if (release_date_end && !isValidDate(release_date_end)) {
      return res.status(400).json({ error: 'Invalid release_date_end format. Use YYYY-MM-DD.' });
    }
    // Validate pagination params
    const size = parseInt(page_size, 10);
    const number = parseInt(page_number, 10);
    if (isNaN(size) || size <= 0) {
      return res.status(400).json({ error: 'page_size is required and must be a positive integer.' });
    }
    if (isNaN(number) || number <= 0) {
      return res.status(400).json({ error: 'page_number is required and must be a positive integer.' });
    }
    // Parse brands into array
    let brandList = [];
    if (brands) {
      brandList = brands.split(',').map(b => b.trim()).filter(b => b.length > 0);
    }
    const response = await axios.get('http://interview.surya-digital.in/get-electronics');
    const products = Array.isArray(response.data) ? response.data : [];
    // Filter products
    const filtered = products.filter(item => {
      if (!(item.productId && item.productName && item.brandName && item.category && item.description && item.price && item.currency && item.processor && item.memory && item.releaseDate && item.averageRating && item.ratingCount)) {
        return false;
      }
      if (release_date_start && item.releaseDate < release_date_start) return false;
      if (release_date_end && item.releaseDate > release_date_end) return false;
      if (brandList.length > 0 && !brandList.includes(item.brandName)) return false;
      return true;
    });
    // Pagination
    const startIdx = (number - 1) * size;
    const paginated = filtered.slice(startIdx, startIdx + size).map(item => ({
      product_id: item.productId || null,
      product_name: item.productName || null,
      brand_name: item.brandName || null,
      category_name: item.category || null,
      description_text: item.description || null,
      price: item.price || null,
      currency: item.currency || null,
      processor: item.processor || null,
      memory: item.memory || null,
      release_date: item.releaseDate || null,
      average_rating: item.averageRating || null,
      rating_count: item.ratingCount || null
    }));
    res.json(paginated);
  } catch (error) {
    console.error('Error in /step4:', error.message, error.response?.data);
    res.status(500).json({ error: 'Failed to fetch products.', details: error.message });
  }
});

// Step 6: Use MongoDB for data storage and retrieval
app.get('/step6', async (req, res) => {
  try {
    const { page_size, page_number, brands, release_date_start, release_date_end } = req.query;
    // Validate date format if provided
    const isValidDate = (date) => /^\d{4}-\d{2}-\d{2}$/.test(date);
    if (release_date_start && !isValidDate(release_date_start)) {
      return res.status(400).json({ error: 'Invalid release_date_start format. Use YYYY-MM-DD.' });
    }
    if (release_date_end && !isValidDate(release_date_end)) {
      return res.status(400).json({ error: 'Invalid release_date_end format. Use YYYY-MM-DD.' });
    }
    // Validate pagination params
    const size = parseInt(page_size, 10);
    const number = parseInt(page_number, 10);
    if (isNaN(size) || size <= 0) {
      return res.status(400).json({ error: 'page_size is required and must be a positive integer.' });
    }
    if (isNaN(number) || number <= 0) {
      return res.status(400).json({ error: 'page_number is required and must be a positive integer.' });
    }
    // Parse brands into array
    let brandList = [];
    if (brands) {
      brandList = brands.split(',').map(b => b.trim()).filter(b => b.length > 0);
    }
    // Build query
    let query = {};
    if (brandList.length > 0) {
      query.brandName = { $in: brandList };
    }
    if (release_date_start || release_date_end) {
      query.releaseDate = {};
      if (release_date_start) query.releaseDate.$gte = release_date_start;
      if (release_date_end) query.releaseDate.$lte = release_date_end;
    }
    // Find products
    const products = await Product.find(query).exec();
    // Pagination
    const startIdx = (number - 1) * size;
    const paginated = products.slice(startIdx, startIdx + size);
    // Get all brands for lookup
    const allBrands = await Brand.find({}).exec();
    const brandLookup = {};
    allBrands.forEach(b => {
      if (b.name) brandLookup[b.name] = b;
    });
    // Format response
    const nowYear = new Date().getFullYear();
    const result = paginated.map(item => {
      const brandObj = brandLookup[item.brandName] || {};
      let companyAge = null;
      if (brandObj.year_founded) {
        companyAge = nowYear - parseInt(brandObj.year_founded, 10);
      }
      let address = null;
      if (brandObj.address) {
        const { street, city, state, postal_code, country } = brandObj.address;
        address = [street, city, state, postal_code, country].filter(Boolean).join(', ');
      }
      return {
        product_id: item.productId || null,
        product_name: item.productName || null,
        brand: {
          name: brandObj.name || item.brandName || null,
          year_founded: brandObj.year_founded || null,
          company_age: companyAge,
          address: address
        },
        category_name: item.category || null,
        description_text: item.description || null,
        price: item.price || null,
        currency: item.currency || null,
        processor: item.processor || null,
        memory: item.memory || null,
        release_date: item.releaseDate || null,
        average_rating: item.averageRating || null,
        rating_count: item.ratingCount || null
      };
    });
    res.json(result);
  } catch (error) {
    console.error('Error in /step6:', error.message, error.response?.data);
    res.status(500).json({ error: 'Failed to fetch products from DB.', details: error.message });
  }
});

// Step 5: Merge electronics and brands API data, with all previous filters and pagination
app.get('/step5', async (req, res) => {
  try {
    const { page_size, page_number, brands, release_date_start, release_date_end } = req.query;
    // Validate date format if provided
    const isValidDate = (date) => /^\d{4}-\d{2}-\d{2}$/.test(date);
    if (release_date_start && !isValidDate(release_date_start)) {
      return res.status(400).json({ error: 'Invalid release_date_start format. Use YYYY-MM-DD.' });
    }
    if (release_date_end && !isValidDate(release_date_end)) {
      return res.status(400).json({ error: 'Invalid release_date_end format. Use YYYY-MM-DD.' });
    }
    // Validate pagination params
    const size = parseInt(page_size, 10);
    const number = parseInt(page_number, 10);
    if (isNaN(size) || size <= 0) {
      return res.status(400).json({ error: 'page_size is required and must be a positive integer.' });
    }
    if (isNaN(number) || number <= 0) {
      return res.status(400).json({ error: 'page_number is required and must be a positive integer.' });
    }
    // Parse brands into array
    let brandList = [];
    if (brands) {
      brandList = brands.split(',').map(b => b.trim()).filter(b => b.length > 0);
    }
    // Fetch both APIs
    const [electronicsRes, brandsRes] = await Promise.all([
      axios.get('http://interview.surya-digital.in/get-electronics'),
      axios.get('http://interview.surya-digital.in/get-electronics-brands')
    ]);
    const products = Array.isArray(electronicsRes.data) ? electronicsRes.data : [];
    const brandsData = Array.isArray(brandsRes.data) ? brandsRes.data : [];
    // Build brand lookup by name
    const brandLookup = {};
    brandsData.forEach(b => {
      if (b.name) brandLookup[b.name] = b;
    });
    // Filter products
    const filtered = products.filter(item => {
      if (!(item.productId && item.productName && item.brandName && item.category && item.description && item.price && item.currency && item.processor && item.memory && item.releaseDate && item.averageRating && item.ratingCount)) {
        return false;
      }
      if (release_date_start && item.releaseDate < release_date_start) return false;
      if (release_date_end && item.releaseDate > release_date_end) return false;
      if (brandList.length > 0 && !brandList.includes(item.brandName)) return false;
      return true;
    });
    // Pagination
    const startIdx = (number - 1) * size;
    const paginated = filtered.slice(startIdx, startIdx + size).map(item => {
      const brandObj = brandLookup[item.brandName] || {};
      // Calculate company age
      let companyAge = null;
      if (brandObj.year_founded) {
        const nowYear = new Date().getFullYear();
        companyAge = nowYear - parseInt(brandObj.year_founded, 10);
      }
      // Combine address fields
      let address = null;
      if (brandObj.address) {
        const { street, city, state, postal_code, country } = brandObj.address;
        address = [street, city, state, postal_code, country].filter(Boolean).join(', ');
      }
      return {
        product_id: item.productId || null,
        product_name: item.productName || null,
        brand: {
          name: brandObj.name || item.brandName || null,
          year_founded: brandObj.year_founded || null,
          company_age: companyAge,
          address: address
        },
        category_name: item.category || null,
        description_text: item.description || null,
        price: item.price || null,
        currency: item.currency || null,
        processor: item.processor || null,
        memory: item.memory || null,
        release_date: item.releaseDate || null,
        average_rating: item.averageRating || null,
        rating_count: item.ratingCount || null
      };
    });
    res.json(paginated);
  } catch (error) {
    console.error('Error in /step5:', error.message, error.response?.data);
    res.status(500).json({ error: 'Failed to fetch products.', details: error.message });
  }
});

app.use(express.json());

// Step 7: CRUD endpoints for products
// Create product
app.post('/step7/create', async (req, res) => {
  try {
    const data = req.body;
    // Validate required fields
    if (!data.product_name || !data.brand || !data.category_name || !data.description_text || !data.price || !data.currency || !data.processor || !data.memory || !data.release_date || !data.average_rating || !data.rating_count) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }
    // Find or create brand
    let brandDoc = await Brand.findOne({ name: data.brand.name });
    if (!brandDoc) {
      brandDoc = await Brand.create({
        name: data.brand.name,
        year_founded: data.brand.year_founded,
        address: data.brand.address ? parseAddress(data.brand.address) : undefined
      });
    }
    // Create product
    const product = await Product.create({
      productId: new mongoose.Types.ObjectId().toString(),
      productName: data.product_name,
      brandName: brandDoc.name,
      category: data.category_name,
      description: data.description_text,
      price: data.price,
      currency: data.currency,
      processor: data.processor,
      memory: data.memory,
      releaseDate: data.release_date,
      averageRating: data.average_rating,
      ratingCount: data.rating_count
    });
    res.status(201).json({ message: 'Product created', product_id: product.productId });
  } catch (error) {
    console.error('Error in create:', error.message);
    res.status(500).json({ error: 'Failed to create product.', details: error.message });
  }
});

// Update product
app.put('/step7/update/:product_id', async (req, res) => {
  try {
    const { product_id } = req.params;
    const data = req.body;
    const product = await Product.findOne({ productId: product_id });
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }
    // Update fields
    product.productName = data.product_name || product.productName;
    product.category = data.category_name || product.category;
    product.description = data.description_text || product.description;
    product.price = data.price || product.price;
    product.currency = data.currency || product.currency;
    product.processor = data.processor || product.processor;
    product.memory = data.memory || product.memory;
    product.releaseDate = data.release_date || product.releaseDate;
    product.averageRating = data.average_rating || product.averageRating;
    product.ratingCount = data.rating_count || product.ratingCount;
    // Update brand if provided
    if (data.brand && data.brand.name) {
      let brandDoc = await Brand.findOne({ name: data.brand.name });
      if (!brandDoc) {
        brandDoc = await Brand.create({
          name: data.brand.name,
          year_founded: data.brand.year_founded,
          address: data.brand.address ? parseAddress(data.brand.address) : undefined
        });
      }
      product.brandName = brandDoc.name;
    }
    await product.save();
    res.status(200).json({ message: 'Product updated' });
  } catch (error) {
    console.error('Error in update:', error.message);
    res.status(500).json({ error: 'Failed to update product.', details: error.message });
  }
});

// Delete product
app.delete('/step7/delete/:product_id', async (req, res) => {
  try {
    const { product_id } = req.params;
    const result = await Product.deleteOne({ productId: product_id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Product not found.' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Error in delete:', error.message);
    res.status(500).json({ error: 'Failed to delete product.', details: error.message });
  }
});

// Helper to parse address string into object
function parseAddress(addressStr) {
  // Expected format: 'street, city, state, postal_code, country'
  const [street, city, state, postal_code, country] = addressStr.split(',').map(s => s.trim());
  return { street, city, state, postal_code, country };
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
