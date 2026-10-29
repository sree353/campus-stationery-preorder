const User = require('../models/User');

// @desc    Get all users (Admin only)
// @route   GET /api/users
exports.getAllUsers = async (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 50 } = req.query;

    const filter = {};
    if (role && role !== 'ALL') {
      filter.role = role;
    }
    if (search) {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [{ name: regex }, { email: regex }, { rollNumber: regex }];
    }

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      count: users.length,
      total,
      users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new user (Admin only)
// @route   POST /api/users
exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, rollNumber, department, year, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.',
      });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists.',
      });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: role || 'student',
      rollNumber: rollNumber || '',
      department: department || 'General Engineering',
      year: year || '1st Year',
      phone: phone || '',
    });

    res.status(201).json({
      success: true,
      message: `${user.role.toUpperCase()} account created successfully for ${user.name}.`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        rollNumber: user.rollNumber,
        phone: user.phone,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user status / details (Admin only)
// @route   PUT /api/users/:id
exports.updateUser = async (req, res, next) => {
  try {
    const { name, role, department, year, rollNumber, phone, isActive, password } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    if (name) user.name = name;
    if (role) user.role = role;
    if (department) user.department = department;
    if (year) user.year = year;
    if (rollNumber !== undefined) user.rollNumber = rollNumber;
    if (phone !== undefined) user.phone = phone;
    if (isActive !== undefined) user.isActive = isActive;
    if (password && password.length >= 6) {
      user.password = password; // Will be hashed by pre-save
    }

    await user.save();

    res.json({
      success: true,
      message: `User ${user.name} updated successfully!`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        rollNumber: user.rollNumber,
        phone: user.phone,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
exports.deleteUser = async (req, res, next) => {
  try {
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own admin account.',
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: `User account for ${user.name} has been deleted.`,
    });
  } catch (error) {
    next(error);
  }
};
