/**
 * Validators for User Management Endpoints
 */

/**
 * Validate password reset requests
 */
const validateChangePassword = (req, res, next) => {
  const { password } = req.body;
  const errors = {};

  if (!password) {
    errors.password = 'New password is required';
  } else if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters long';
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

/**
 * Validate user status toggles
 */
const validateToggleStatus = (req, res, next) => {
  const { isActive } = req.body;
  const errors = {};

  if (isActive === undefined || typeof isActive !== 'boolean') {
    errors.isActive = 'isActive parameter is required and must be a boolean';
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

/**
 * Validate doctor schedule config updates
 */
const validateSchedule = (req, res, next) => {
  const { workingDays, slotDuration, sessions, breaks } = req.body;
  const errors = {};

  if (workingDays && !Array.isArray(workingDays)) {
    errors.workingDays = 'workingDays must be an array of strings';
  }

  if (slotDuration && (typeof slotDuration !== 'number' || slotDuration <= 0)) {
    errors.slotDuration = 'slotDuration must be a positive number';
  }

  if (sessions && !Array.isArray(sessions)) {
    errors.sessions = 'sessions must be an array';
  }

  if (breaks && !Array.isArray(breaks)) {
    errors.breaks = 'breaks must be an array';
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
  validateChangePassword,
  validateToggleStatus,
  validateSchedule,
};
