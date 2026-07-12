const logger = require('../utils/logger');

/**
 * System Permissions dictionary.
 * Maps human-readable roles requirements to granular strings.
 */
const PERMISSIONS = {
  // Super Admin Permissions
  CREATE_DOCTOR: 'create:doctor',
  CREATE_RECEPTIONIST: 'create:receptionist',
  MANAGE_SCHEDULES: 'manage:schedules',
  VIEW_ALL_APPOINTMENTS: 'view:all_appointments',
  ACCESS_ALL_DASHBOARDS: 'access:all_dashboards',

  // Receptionist Permissions
  SEARCH_PATIENTS: 'search:patients',
  BOOK_APPOINTMENTS: 'book:appointments',
  UPDATE_APPOINTMENTS: 'update:appointments',
  MARK_PATIENT_ARRIVED: 'mark:patient_arrived',

  // Doctor Permissions
  VIEW_OWN_APPOINTMENTS: 'view:own_appointments',
  VIEW_PATIENT_INFO: 'view:patient_info',
  UPDATE_CONSULTATION_NOTES: 'update:consultation_notes',
};

/**
 * Role to Permissions Mapping
 */
const ROLES_PERMISSIONS = {
  'Super Admin': [
    PERMISSIONS.CREATE_DOCTOR,
    PERMISSIONS.CREATE_RECEPTIONIST,
    PERMISSIONS.MANAGE_SCHEDULES,
    PERMISSIONS.VIEW_ALL_APPOINTMENTS,
    PERMISSIONS.ACCESS_ALL_DASHBOARDS,
  ],
  'Receptionist': [
    PERMISSIONS.SEARCH_PATIENTS,
    PERMISSIONS.BOOK_APPOINTMENTS,
    PERMISSIONS.UPDATE_APPOINTMENTS,
    PERMISSIONS.MARK_PATIENT_ARRIVED,
  ],
  'Doctor': [
    PERMISSIONS.VIEW_OWN_APPOINTMENTS,
    PERMISSIONS.VIEW_PATIENT_INFO,
    PERMISSIONS.UPDATE_CONSULTATION_NOTES,
  ],
};

/**
 * Middleware to check if the authenticated user has a specific permission.
 * Assumes the `protect` middleware has already run and attached `req.user`.
 * 
 * @param {string} permission - The required permission string from PERMISSIONS
 */
const checkPermission = (permission) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required. User context is missing.',
        });
      }

      const { role } = req.user;
      const userPermissions = ROLES_PERMISSIONS[role] || [];

      // Super Admin bypass: Super Admin gets access to all routes by default
      if (role === 'Super Admin') {
        return next();
      }

      // Check if user's role contains the required permission
      if (userPermissions.includes(permission)) {
        return next();
      }

      logger.warn(`Access Denied: User ${req.user.email} (Role: ${role}) attempted to access resource requiring permission: ${permission}`);
      
      return res.status(403).json({
        success: false,
        message: 'Access Denied: You do not have permission to perform this action.',
      });
    } catch (err) {
      next(err);
    }
  };
};

/**
 * Middleware to check if the user has AT LEAST ONE of the specified permissions.
 * Useful for routes accessible to multiple roles with different permissions.
 * 
 * @param {Array<string>} permissionsList - List of acceptable permissions
 */
const checkAnyPermission = (permissionsList) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required. User context is missing.',
        });
      }

      const { role } = req.user;
      const userPermissions = ROLES_PERMISSIONS[role] || [];

      if (role === 'Super Admin') {
        return next();
      }

      const hasAny = permissionsList.some(permission => userPermissions.includes(permission));
      if (hasAny) {
        return next();
      }

      return res.status(403).json({
        success: false,
        message: 'Access Denied: You do not have the required permissions to perform this action.',
      });
    } catch (err) {
      next(err);
    }
  };
};

module.exports = {
  PERMISSIONS,
  ROLES_PERMISSIONS,
  checkPermission,
  checkAnyPermission,
};
