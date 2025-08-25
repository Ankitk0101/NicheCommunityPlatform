export const validateRequired = (value) => {
  return value !== null && value !== undefined && value.toString().trim() !== '';
};

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return re.test(password);
};

export const validateUsername = (username) => {
  // 3-20 characters, alphanumeric, underscores, and hyphens
  const re = /^[a-zA-Z0-9_-]{3,20}$/;
  return re.test(username);
};

export const validateUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch (_) {
    return false;
  }
};

export const validateFileType = (file, allowedTypes) => {
  return allowedTypes.includes(file.type);
};

export const validateFileSize = (file, maxSizeMB) => {
  return file.size <= maxSizeMB * 1024 * 1024;
};

export const validateImageDimensions = (file, minWidth, minHeight) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve(img.width >= minWidth && img.height >= minHeight);
    };
    img.onerror = () => resolve(false);
    img.src = URL.createObjectURL(file);
  });
};

export const validateForm = (formData, rules) => {
  const errors = {};
  
  Object.keys(rules).forEach(field => {
    const value = formData[field];
    const fieldRules = rules[field];
    
    if (fieldRules.required && !validateRequired(value)) {
      errors[field] = fieldRules.requiredMessage || 'This field is required';
      return;
    }
    
    if (value && fieldRules.email && !validateEmail(value)) {
      errors[field] = fieldRules.emailMessage || 'Please enter a valid email address';
      return;
    }
    
    if (value && fieldRules.password && !validatePassword(value)) {
      errors[field] = fieldRules.passwordMessage || 'Password must be at least 8 characters with uppercase, lowercase, and number';
      return;
    }
    
    if (value && fieldRules.username && !validateUsername(value)) {
      errors[field] = fieldRules.usernameMessage || 'Username must be 3-20 characters (letters, numbers, underscores, hyphens)';
      return;
    }
    
    if (value && fieldRules.url && !validateUrl(value)) {
      errors[field] = fieldRules.urlMessage || 'Please enter a valid URL';
      return;
    }
    
    if (value && fieldRules.minLength && value.length < fieldRules.minLength) {
      errors[field] = fieldRules.minLengthMessage || `Must be at least ${fieldRules.minLength} characters`;
      return;
    }
    
    if (value && fieldRules.maxLength && value.length > fieldRules.maxLength) {
      errors[field] = fieldRules.maxLengthMessage || `Must be at most ${fieldRules.maxLength} characters`;
      return;
    }
    
    if (value && fieldRules.pattern && !fieldRules.pattern.test(value)) {
      errors[field] = fieldRules.patternMessage || 'Invalid format';
      return;
    }
  });
  
  return errors;
};