import Category from "../models/Category.js";

// 🔹 CREATE CATEGORY
export const createCategory = async (req, res) => {
  try {
    let { name, slug } = req.body;

    // validation
    if (!name || !slug) {
      return res.status(400).json({
        message: "Name and slug are required",
      });
    }

    // slug normalize (best practice)
    slug = slug.toLowerCase().trim();

    const exists = await Category.findOne({ slug });
    if (exists) {
      return res.status(400).json({
        message: "Category with this slug already exists",
      });
    }

    const category = await Category.create({ name, slug });

    res.status(201).json({
      success: true,
      message: "Category created successfully ✅",
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// 🔹 GET ALL CATEGORIES
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// 🔹 GET SINGLE CATEGORY
export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// 🔹 UPDATE CATEGORY
export const updateCategory = async (req, res) => {
  try {
    let { name, slug } = req.body;

    if (slug) {
      slug = slug.toLowerCase().trim();
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, slug },
      { new: true, runValidators: true },
    );

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Category updated successfully ✅",
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// 🔹 DELETE CATEGORY
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Category deleted successfully ✅",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
