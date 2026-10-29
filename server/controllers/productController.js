const Product = require('../models/Product');
const InventoryLog = require('../models/InventoryLog');
const Notification = require('../models/Notification');

// @desc    Get all products with search, filter, and sorting
// @route   GET /api/products
exports.getProducts = async (req, res, next) => {
  try {
    const {
      search,
      category,
      status,
      minPrice,
      maxPrice,
      sortBy = 'newest',
      page = 1,
      limit = 50,
      includeInactive = 'false',
    } = req.query;

    const query = {};

    if (includeInactive !== 'true') {
      query.isActive = true;
    }

    if (search) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: regex },
        { itemCode: regex },
        { brand: regex },
        { description: regex },
      ];
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined && minPrice !== '') {
        query.price.$gte = Number(minPrice);
      }
      if (maxPrice !== undefined && maxPrice !== '') {
        query.price.$lte = Number(maxPrice);
      }
    }

    let sortOption = { createdAt: -1 };
    if (sortBy === 'price_asc') sortOption = { price: 1 };
    else if (sortBy === 'price_desc') sortOption = { price: -1 };
    else if (sortBy === 'name_asc') sortOption = { name: 1 };
    else if (sortBy === 'stock_desc') sortOption = { stockQuantity: -1 };
    else if (sortBy === 'stock_asc') sortOption = { stockQuantity: 1 };

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      count: products.length,
      total,
      products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Stationery product not found.',
      });
    }

    res.json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new product (Admin / Staff)
// @route   POST /api/products
exports.createProduct = async (req, res, next) => {
  try {
    const {
      name,
      itemCode,
      category,
      brand,
      unit,
      price,
      stockQuantity,
      minStockThreshold,
      description,
      image,
      specifications,
    } = req.body;

    const existingCode = await Product.findOne({ itemCode: itemCode.toUpperCase().trim() });
    if (existingCode) {
      return res.status(400).json({
        success: false,
        message: `Product with item code ${itemCode.toUpperCase()} already exists.`,
      });
    }

    const stock = Number(stockQuantity) || 0;
    const threshold = Number(minStockThreshold) || 10;
    const computedStatus = Product.computeStatus(stock, threshold);

    const product = await Product.create({
      name,
      itemCode: itemCode.toUpperCase().trim(),
      category,
      brand: brand || 'Campus Essentials',
      unit: unit || 'Piece',
      price: Number(price),
      stockQuantity: stock,
      minStockThreshold: threshold,
      status: computedStatus,
      description: description || '',
      image: image || '',
      specifications: specifications || [],
    });

    // Record in inventory log
    await InventoryLog.create({
      product: product._id,
      action: 'INITIAL_SEED',
      previousStock: 0,
      newStock: stock,
      quantityChanged: stock,
      performedBy: req.user._id,
      note: 'Initial product creation in inventory',
    });

    // Trigger low stock notification if initial stock <= threshold
    if (stock <= threshold) {
      await Notification.create({
        targetRole: 'staff',
        title: stock === 0 ? 'Out of Stock Notice' : 'Low Stock Alert',
        message: `New item "${product.name}" (${product.itemCode}) initialized with ${stock} units (Threshold: ${threshold}).`,
        type: stock === 0 ? 'OUT_OF_STOCK' : 'LOW_STOCK',
        relatedProduct: product._id,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Stationery product created successfully!',
      product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product (Admin / Staff)
// @route   PUT /api/products/:id
exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    const previousStock = product.stockQuantity;
    const {
      name,
      itemCode,
      category,
      brand,
      unit,
      price,
      stockQuantity,
      minStockThreshold,
      description,
      image,
      isActive,
      specifications,
    } = req.body;

    if (itemCode && itemCode.toUpperCase().trim() !== product.itemCode) {
      const existing = await Product.findOne({ itemCode: itemCode.toUpperCase().trim() });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: `Item code ${itemCode} already in use.`,
        });
      }
      product.itemCode = itemCode.toUpperCase().trim();
    }

    if (name) product.name = name;
    if (category) product.category = category;
    if (brand !== undefined) product.brand = brand;
    if (unit !== undefined) product.unit = unit;
    if (price !== undefined) product.price = Number(price);
    if (description !== undefined) product.description = description;
    if (image !== undefined) product.image = image;
    if (isActive !== undefined) product.isActive = isActive;
    if (specifications !== undefined) product.specifications = specifications;

    let stockChanged = false;
    let newStock = product.stockQuantity;
    let newThreshold = product.minStockThreshold;

    if (minStockThreshold !== undefined) {
      newThreshold = Number(minStockThreshold);
      product.minStockThreshold = newThreshold;
    }

    if (stockQuantity !== undefined && Number(stockQuantity) !== previousStock) {
      newStock = Number(stockQuantity);
      product.stockQuantity = newStock;
      stockChanged = true;
    }

    product.status = Product.computeStatus(newStock, newThreshold);
    await product.save();

    if (stockChanged) {
      const diff = newStock - previousStock;
      await InventoryLog.create({
        product: product._id,
        action: diff > 0 ? 'RESTOCK' : 'MANUAL_ADJUST',
        previousStock,
        newStock,
        quantityChanged: diff,
        performedBy: req.user._id,
        note: `Manual stock adjustment by ${req.user.role} (${req.user.name})`,
      });

      if (newStock <= newThreshold) {
        await Notification.create({
          targetRole: 'staff',
          title: newStock === 0 ? 'Out of Stock Alert' : 'Low Stock Warning',
          message: `Product "${product.name}" (${product.itemCode}) stock level updated to ${newStock} units (Threshold: ${newThreshold}).`,
          type: newStock === 0 ? 'OUT_OF_STOCK' : 'LOW_STOCK',
          relatedProduct: product._id,
        });
      }
    }

    res.json({
      success: true,
      message: 'Product updated successfully!',
      product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product (Admin)
// @route   DELETE /api/products/:id
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: `Product "${product.name}" removed from catalogue.`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all distinct categories
// @route   GET /api/products/meta/categories
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Product.distinct('category', { isActive: true });
    res.json({
      success: true,
      categories,
    });
  } catch (error) {
    next(error);
  }
};
