/**
 * Validators for Authentication Endpoints
 */

/**
 * Validate user registration request body
 */
const validateRegister = (req, res, next) => {
  const { name, email, password, role } = req.body;
  const errors = {};

  // Name Validation
  if (!name || name.trim() === '') {
    errors.name = 'Name is required';
  }

  // Email Validation
  if (!email || email.trim() === '') {
    errors.email = 'Email is required';
  } else {
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      errors.email = 'Please provide a valid email address';
    }
  }

  // Password Validation
  if (!password) {
    errors.password = 'Password is required';
  } else if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters long';
  }

  // Role Validation
  const validRoles = ['Super Admin', 'Receptionist', 'Doctor'];
  if (!role) {
    errors.role = 'Role is required';
  } else if (!validRoles.includes(role)) {
    errors.role = `Invalid role. Permitted roles are: ${validRoles.join(', ')}`;
  }

  // If there are errors, halt and return 400 Bad Request
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  next();
};

/**
 * Validate user login request body
 */
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = {};

  if (!email || email.trim() === '') {
    errors.email = 'Email is required';
  }

  if (!password || password.trim() === '') {
    errors.password = 'Password is required';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
};
