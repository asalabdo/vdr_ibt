/**
 * Centralized Form Validation Utilities
 * Eliminates duplicate validation logic across modals
 */

/**
 * Common validation rules
 */
export const VALIDATION_RULES = {
  USERNAME: {
    MIN_LENGTH: 3,
    PATTERN: /^[a-zA-Z0-9_-]+$/,
    REQUIRED: true
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    REQUIRED: true
  },
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    REQUIRED: false
  },
  MOUNTPOINT: {
    MIN_LENGTH: 3,
    PATTERN: /^[a-zA-Z0-9_-]+$/,
    REQUIRED: true
  }
};

/**
 * Validate username
 * @param {string} username - Username to validate
 * @param {Object} options - Validation options
 * @returns {string|null} Error message or null if valid
 */
export const validateUsername = (username, options = {}) => {
  const { required = VALIDATION_RULES.USERNAME.REQUIRED } = options;
  
  if (!username?.trim()) {
    return required ? 'Username is required' : null;
  }
  
  if (username.length < VALIDATION_RULES.USERNAME.MIN_LENGTH) {
    return `Username must be at least ${VALIDATION_RULES.USERNAME.MIN_LENGTH} characters`;
  }
  
  if (!VALIDATION_RULES.USERNAME.PATTERN.test(username)) {
    return 'Username can only contain letters, numbers, hyphens, and underscores';
  }
  
  return null;
};

/**
 * Validate password
 * @param {string} password - Password to validate
 * @param {Object} options - Validation options
 * @returns {string|null} Error message or null if valid
 */
export const validatePassword = (password, options = {}) => {
  const { required = VALIDATION_RULES.PASSWORD.REQUIRED } = options;
  
  if (!password?.trim()) {
    return required ? 'Password is required' : null;
  }
  
  if (password.length < VALIDATION_RULES.PASSWORD.MIN_LENGTH) {
    return `Password must be at least ${VALIDATION_RULES.PASSWORD.MIN_LENGTH} characters`;
  }
  
  return null;
};

/**
 * Validate email
 * @param {string} email - Email to validate
 * @param {Object} options - Validation options
 * @returns {string|null} Error message or null if valid
 */
export const validateEmail = (email, options = {}) => {
  const { required = VALIDATION_RULES.EMAIL.REQUIRED } = options;
  
  if (!email?.trim()) {
    return required ? 'Email is required' : null;
  }
  
  if (email && !VALIDATION_RULES.EMAIL.PATTERN.test(email)) {
    return 'Please enter a valid email address';
  }
  
  return null;
};

/**
 * Validate mountpoint/room name
 * @param {string} mountpoint - Mountpoint to validate
 * @param {Object} options - Validation options
 * @returns {string|null} Error message or null if valid
 */
export const validateMountpoint = (mountpoint, options = {}) => {
  const { required = VALIDATION_RULES.MOUNTPOINT.REQUIRED } = options;
  
  if (!mountpoint?.trim()) {
    return required ? 'Mount point name is required' : null;
  }
  
  if (mountpoint.length < VALIDATION_RULES.MOUNTPOINT.MIN_LENGTH) {
    return `Mount point name must be at least ${VALIDATION_RULES.MOUNTPOINT.MIN_LENGTH} characters`;
  }
  
  if (!VALIDATION_RULES.MOUNTPOINT.PATTERN.test(mountpoint)) {
    return 'Mount point name can only contain letters, numbers, hyphens, and underscores';
  }
  
  return null;
};

/**
 * Validate password confirmation
 * @param {string} password - Original password
 * @param {string} confirmPassword - Confirmation password
 * @returns {string|null} Error message or null if valid
 */
export const validatePasswordConfirmation = (password, confirmPassword) => {
  if (password && confirmPassword && password !== confirmPassword) {
    return 'Passwords do not match';
  }
  
  return null;
};

/**
 * Validate role-specific requirements
 * @param {string} role - Selected role
 * @param {Array} subadminGroups - Selected subadmin groups
 * @returns {string|null} Error message or null if valid
 */
export const validateRoleRequirements = (role, subadminGroups = []) => {
  if (role === 'subadmin' && subadminGroups.length === 0) {
    return 'At least one company must be selected for Company Administrator role';
  }
  
  return null;
};

/**
 * Comprehensive form validator
 * @param {Object} formData - Form data to validate
 * @param {Object} validationConfig - Validation configuration
 * @returns {Object} Validation errors object
 */
export const validateForm = (formData, validationConfig) => {
  const errors = {};
  
  // Validate each field based on configuration
  Object.entries(validationConfig).forEach(([field, config]) => {
    const value = formData[field];
    let error = null;
    
    switch (config.type) {
      case 'username':
        error = validateUsername(value, config.options);
        break;
      case 'password':
        error = validatePassword(value, config.options);
        break;
      case 'email':
        error = validateEmail(value, config.options);
        break;
      case 'mountpoint':
        error = validateMountpoint(value, config.options);
        break;
      case 'passwordConfirmation':
        error = validatePasswordConfirmation(formData.password, value);
        break;
      case 'roleRequirements':
        error = validateRoleRequirements(formData.role, formData.subadminGroups);
        break;
      default:
        // Custom validator function
        if (typeof config.validator === 'function') {
          error = config.validator(value, formData);
        }
    }
    
    if (error) {
      errors[field] = error;
    }
  });
  
  return errors;
};

/**
 * Common validation configurations for different forms
 */
export const FORM_VALIDATION_CONFIGS = {
  CREATE_USER: {
    userid: { type: 'username' },
    password: { type: 'password' },
    email: { type: 'email' },
    confirmPassword: { type: 'passwordConfirmation' },
    role: { type: 'roleRequirements' }
  },
  
  CREATE_DATA_ROOM: {
    mountpoint: { type: 'mountpoint' }
  },
  
  EDIT_USER: {
    displayName: { 
      type: 'custom',
      validator: (value) => {
        // Display name is optional, but if provided should not be empty
        if (value !== undefined && value !== null && !value.trim()) {
          return 'Display name cannot be empty';
        }
        return null;
      }
    },
    email: { type: 'email' },
    password: { type: 'password', options: { required: false } },
    confirmPassword: { type: 'passwordConfirmation' }
  }
};
