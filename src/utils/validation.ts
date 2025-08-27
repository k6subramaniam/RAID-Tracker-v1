import { ItemType, Priority, Impact, Likelihood, ItemStatus } from '../types';

export interface ValidationError {
  field: string;
  message: string;
}

export interface RAIDItemValidation {
  type: string;
  title: string;
  description: string;
  impact: string;
  likelihood: string;
  priority: string;
  status: string;
  workstream: string;
  owner: string;
  dueDate?: string;
}

export const validateRequired = (value: string | undefined | null, fieldName: string): ValidationError | null => {
  if (!value || value.trim() === '') {
    return {
      field: fieldName,
      message: `${fieldName} is required`
    };
  }
  return null;
};

export const validateEmail = (email: string): ValidationError | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      field: 'email',
      message: 'Please enter a valid email address'
    };
  }
  return null;
};

export const validateLength = (value: string, minLength: number, maxLength: number, fieldName: string): ValidationError | null => {
  if (value.length < minLength) {
    return {
      field: fieldName,
      message: `${fieldName} must be at least ${minLength} characters`
    };
  }
  if (value.length > maxLength) {
    return {
      field: fieldName,
      message: `${fieldName} must be no more than ${maxLength} characters`
    };
  }
  return null;
};

export const validateDate = (dateString: string, fieldName: string): ValidationError | null => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return {
      field: fieldName,
      message: `Please enter a valid ${fieldName.toLowerCase()}`
    };
  }
  return null;
};

export const validateFutureDate = (dateString: string, fieldName: string): ValidationError | null => {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (date < today) {
    return {
      field: fieldName,
      message: `${fieldName} cannot be in the past`
    };
  }
  return null;
};

export const validateRAIDItem = (data: RAIDItemValidation): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Required field validations
  const requiredFieldError = validateRequired(data.type, 'Type');
  if (requiredFieldError) errors.push(requiredFieldError);

  const titleError = validateRequired(data.title, 'Title');
  if (titleError) errors.push(titleError);
  else {
    const titleLengthError = validateLength(data.title, 3, 200, 'Title');
    if (titleLengthError) errors.push(titleLengthError);
  }

  const descriptionError = validateRequired(data.description, 'Description');
  if (descriptionError) errors.push(descriptionError);
  else {
    const descLengthError = validateLength(data.description, 10, 2000, 'Description');
    if (descLengthError) errors.push(descLengthError);
  }

  const workstreamError = validateRequired(data.workstream, 'Workstream');
  if (workstreamError) errors.push(workstreamError);

  const ownerError = validateRequired(data.owner, 'Owner');
  if (ownerError) errors.push(ownerError);

  // Enum validations
  const validTypes: ItemType[] = ['Risk', 'Issue', 'Assumption', 'Dependency'];
  if (!validTypes.includes(data.type as ItemType)) {
    errors.push({
      field: 'type',
      message: 'Please select a valid type'
    });
  }

  const validImpacts: Impact[] = ['Low', 'Medium', 'High', 'Critical'];
  if (!validImpacts.includes(data.impact as Impact)) {
    errors.push({
      field: 'impact',
      message: 'Please select a valid impact level'
    });
  }

  const validLikelihoods: Likelihood[] = ['Low', 'Medium', 'High'];
  if (!validLikelihoods.includes(data.likelihood as Likelihood)) {
    errors.push({
      field: 'likelihood',
      message: 'Please select a valid likelihood'
    });
  }

  const validPriorities: Priority[] = ['P0', 'P1', 'P2', 'P3'];
  if (!validPriorities.includes(data.priority as Priority)) {
    errors.push({
      field: 'priority',
      message: 'Please select a valid priority'
    });
  }

  const validStatuses: ItemStatus[] = ['Proposed', 'Open', 'In Progress', 'Mitigating', 'Resolved', 'Closed', 'Accepted'];
  if (!validStatuses.includes(data.status as ItemStatus)) {
    errors.push({
      field: 'status',
      message: 'Please select a valid status'
    });
  }

  // Date validations
  if (data.dueDate) {
    const dueDateError = validateDate(data.dueDate, 'Due Date');
    if (dueDateError) errors.push(dueDateError);
  }

  return errors;
};

export const validateAPIKey = (apiKey: string, provider: string): ValidationError | null => {
  if (!apiKey || apiKey.trim() === '') {
    return {
      field: 'apiKey',
      message: 'API key is required'
    };
  }

  // Basic format validation based on provider
  switch (provider) {
    case 'openai':
      if (!apiKey.startsWith('sk-')) {
        return {
          field: 'apiKey',
          message: 'OpenAI API keys should start with "sk-"'
        };
      }
      break;
    case 'anthropic':
      if (!apiKey.startsWith('sk-ant-')) {
        return {
          field: 'apiKey',
          message: 'Anthropic API keys should start with "sk-ant-"'
        };
      }
      break;
    case 'gemini':
      // Google API keys don't have a consistent prefix, just check length
      if (apiKey.length < 30) {
        return {
          field: 'apiKey',
          message: 'Google API key appears to be too short'
        };
      }
      break;
  }

  return null;
};

export const validateFileUpload = (file: File): ValidationError[] => {
  const errors: ValidationError[] = [];
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = [
    'text/plain',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/csv',
    'application/json'
  ];

  if (file.size > maxSize) {
    errors.push({
      field: 'file',
      message: 'File size must be less than 10MB'
    });
  }

  if (!allowedTypes.includes(file.type)) {
    errors.push({
      field: 'file',
      message: 'File type not supported. Please upload PDF, DOC, TXT, or CSV files.'
    });
  }

  return errors;
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

export const formatErrorMessage = (errors: ValidationError[]): string => {
  if (errors.length === 0) return '';
  if (errors.length === 1) return errors[0].message;
  
  return `${errors.length} validation errors:\n${errors.map(e => `• ${e.message}`).join('\n')}`;
};