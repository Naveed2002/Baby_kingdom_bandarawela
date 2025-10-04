/*const express = require('express');
const Product = require('../models/Product');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { uploadMultiple, handleUploadError } = require('../middleware/upload');

const router = express.Router();

// GET all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while fetching products' });
  }
});

// GET single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while fetching product' });
  }
});

// CREATE product
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, category, ageGroup, price, originalPrice, stock, description, tags, images, mainImage, isFeatured } = req.body;

    if (!images || images.length === 0) {
      return res.status(400).json({ message: 'At least one product image is required' });
    }

    const product = new Product({
      name,
      category,
      ageGroup,
      price,
      originalPrice,
      stock,
      description,
      tags,
      images,
      mainImage,
      isFeatured
    });

    await product.save();
    res.status(201).json({ message: 'Product created successfully', product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while creating product' });
  }
});

// UPDATE product
router.put('/:id', authenticateToken, requireAdmin, uploadMultiple, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const { name, category, ageGroup, price, originalPrice, stock, description, tags, images, mainImage, isFeatured } = req.body;

    const updates = {
      name: name || product.name,
      category: category || product.category,
      ageGroup: ageGroup || product.ageGroup,
      price: price ?? product.price,
      originalPrice: originalPrice ?? product.originalPrice,
      stock: stock ?? product.stock,
      description: description || product.description,
      tags: tags || product.tags,
      images: images || product.images,
      mainImage: mainImage || product.mainImage,
      isFeatured: isFeatured ?? product.isFeatured
    };

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    res.json({ message: 'Product updated', product: updatedProduct });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while updating product' });
  }
});

// DELETE product (soft delete)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while deleting product' });
  }
});

router.use(handleUploadError);

module.exports = router;
*/
const express = require('express');
const Product = require('../models/Product');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { uploadMultiple, handleUploadError } = require('../middleware/upload');
const router = express.Router();

// GET all products (for shop page)
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while fetching products' });
  }
});

// GET featured products (for homepage)
router.get('/featured', async (req, res) => {
  try {
    const products = await Product.find({ isActive: true, isFeatured: true }).limit(8);
    res.json({ products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while fetching featured products' });
  }
});

// GET related products (based on category)
router.get('/:id/related', async (req, res) => {
  try {
    const { id } = req.params;
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.json({ products: [] });
    }
    const base = await Product.findById(id);
    if (!base || base.isActive === false) {
      return res.json({ products: [] });
    }
    const related = [];
    const seen = new Set([String(id)]);

    // 1) Same category (case-insensitive)
    if (base.category) {
      const sameCategory = await Product.find({
        _id: { $ne: id },
        isActive: true,
        category: { $regex: `^${base.category}$`, $options: 'i' }
      }).limit(8);
      for (const p of sameCategory) {
        if (!seen.has(String(p._id))) {
          related.push(p);
          seen.add(String(p._id));
        }
      }
    }

    // 2) Same ageGroup to fill
    if (related.length < 8 && base.ageGroup) {
      const sameAge = await Product.find({
        _id: { $nin: Array.from(seen) },
        isActive: true,
        ageGroup: base.ageGroup
      }).limit(8 - related.length);
      for (const p of sameAge) {
        if (!seen.has(String(p._id))) {
          related.push(p);
          seen.add(String(p._id));
        }
      }
    }

    // 3) Fill with latest actives
    if (related.length < 8) {
      const latest = await Product.find({
        _id: { $nin: Array.from(seen) },
        isActive: true
      }).sort({ createdAt: -1 }).limit(8 - related.length);
      for (const p of latest) {
        if (!seen.has(String(p._id))) {
          related.push(p);
          seen.add(String(p._id));
        }
      }
    }

    res.json({ products: related });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while fetching related products' });
  }
});

// GET single product by ID (for product detail page)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Product not found' });
    }
    const product = await Product.findById(id);
    if (!product || product.isActive === false) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while fetching product' });
  }
});

// CREATE product (admin)
router.post('/', authenticateToken, requireAdmin, uploadMultiple, async (req, res) => {
  try {
    const { name, category, ageGroup, price, originalPrice, stock, description, tags, images, mainImage, isFeatured } = req.body;
    if (!images || images.length === 0) return res.status(400).json({ message: 'At least one product image is required' });

    const product = new Product({ name, category, ageGroup, price, originalPrice, stock, description, tags, images, mainImage, isFeatured });
    await product.save();
    res.status(201).json({ message: 'Product created successfully', product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while creating product' });
  }
});

// UPDATE product (admin)
router.put('/:id', authenticateToken, requireAdmin, uploadMultiple, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const { name, category, ageGroup, price, originalPrice, stock, description, tags, images, mainImage, isFeatured } = req.body;
    const updates = {
      name: name || product.name,
      category: category || product.category,
      ageGroup: ageGroup || product.ageGroup,
      price: price ?? product.price,
      originalPrice: originalPrice ?? product.originalPrice,
      stock: stock ?? product.stock,
      description: description || product.description,
      tags: tags || product.tags,
      images: images || product.images,
      mainImage: mainImage || product.mainImage,
      isFeatured: isFeatured ?? product.isFeatured
    };
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    res.json({ message: 'Product updated', product: updatedProduct });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while updating product' });
  }
});

// DELETE product (soft delete)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    product.isActive = false;
    await product.save();
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while deleting product' });
  }
});

router.use(handleUploadError);

module.exports = router;
