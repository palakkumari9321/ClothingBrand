import Product from "../models/Product.js";
import Category from "../models/Category.js";
/* ═══════════════════════════════════════
   POST /product  — create
═══════════════════════════════════════ */
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      images,
      sizes,
      stockQuantity,
      type,
      subCategory,
    } = req.body;

    if (
      !name ||
      !description ||
      !price ||
      !category ||
      !images ||
      !sizes ||
      !type ||
      !subCategory
    ) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const product = await Product.create({
      name,
      description,
      price,
      category,
      images,
      sizes,
      stockQuantity,
      type,
      subCategory,
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully ✅",
      data: product,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ═══════════════════════════════════════
   GET /product  — all products
═══════════════════════════════════════ */
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("category")
      .sort({ createdAt: -1 });
    res
      .status(200)
      .json({ success: true, count: products.length, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ═══════════════════════════════════════
   GET /product/:id  — single product
═══════════════════════════════════════ */
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("category");
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ═══════════════════════════════════════
   PUT /product/:id  — update
═══════════════════════════════════════ */
export const updateProduct = async (req, res) => {
  try {
    let updateData = { ...req.body };

    // ← YE ADD KARO — category name se ObjectId dhundho
    if (
      req.body.category &&
      typeof req.body.category === "string" &&
      !req.body.category.match(/^[0-9a-fA-F]{24}$/)
    ) {
      const categoryDoc = await Category.findOne({ name: req.body.category });
      if (!categoryDoc)
        return res
          .status(400)
          .json({ message: `Category "${req.body.category}" not found in DB` });
      updateData.category = categoryDoc._id;
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate("category");

    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    res
      .status(200)
      .json({ success: true, message: "Product updated ✅", data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ═══════════════════════════════════════
   DELETE /product/:id  — delete
═══════════════════════════════════════ */
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    res.status(200).json({ success: true, message: "Product deleted ✅" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ═══════════════════════════════════════
   GET /product/search  — search
═══════════════════════════════════════ */
export const searchProducts = async (req, res) => {
  try {
    const query = req.query.query;
    if (!query)
      return res
        .status(400)
        .json({ success: false, message: "Search query required" });

    const products = await Product.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { type: { $regex: query, $options: "i" } },
      ],
    }).populate("category");

    res
      .status(200)
      .json({ success: true, count: products.length, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ═══════════════════════════════════════
   POST /product/bulk  — bulk create
═══════════════════════════════════════ */
export const bulkCreateProducts = async (req, res) => {
  try {
    const products = req.body;
    if (!Array.isArray(products) || products.length === 0)
      return res
        .status(400)
        .json({ success: false, message: "Array of products required" });

    const created = await Product.insertMany(products);
    res.status(201).json({
      success: true,
      message: `${created.length} products added ✅`,
      data: created,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      images,
      sizes,
      stockQuantity,
      type,
      subCategory,
    } = req.body;

    if (!name || !price || !category)
      return res
        .status(400)
        .json({ message: "Name, price, category required" });

    // ← YE ADD KARO
    const categoryDoc = await Category.findOne({ name: category });
    if (!categoryDoc)
      return res
        .status(400)
        .json({ message: `Category "${category}" not found in DB` });

    const product = await Product.create({
      name,
      description,
      price,
      category: categoryDoc._id, // ← String nahi, ObjectId bhejo
      images,
      sizes,
      stockQuantity,
      type,
      subCategory,
    });

    return res.status(201).json({ message: "Product added ✅", product });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
