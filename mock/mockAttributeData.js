// This file contains mock data for the dynamic attribute system, including attribute definitions,
// attribute sets, and examples of variant matrices.

// Attribute types enum (reference)
export const ATTRIBUTE_TYPES = {
  TEXT: 'text',
  TEXTAREA: 'textarea',
  NUMBER: 'number',
  BOOLEAN: 'boolean',
  DATE: 'date',
  DATETIME: 'datetime',
  SELECT: 'select',
  MULTISELECT: 'multiselect',
  COLOR: 'color',
  IMAGE: 'image',
  FILE: 'file',
  MEASUREMENT: 'measurement'
};

// Input validations
export const VALIDATION_TYPES = {
  NONE: 'none',
  EMAIL: 'email',
  URL: 'url',
  PHONE: 'phone',
  ALPHANUMERIC: 'alphanumeric',
  NUMERIC: 'numeric',
  PATTERN: 'pattern',
  LENGTH: 'length',
  RANGE: 'range'
};

// Mock attributes
export const attributesData = [
  {
    id: 'attr-1',
    code: 'color',
    name: 'Color',
    type: ATTRIBUTE_TYPES.COLOR,
    description: 'Product color',
    isRequired: false,
    isFilterable: true,
    isSearchable: false,
    isComparable: true,
    isVariant: true,
    isActive: true,
    displayOrder: 10,
    defaultValue: null,
    groupCode: 'appearance',
    groupName: 'Appearance',
    validations: {
      validationType: VALIDATION_TYPES.NONE
    },
    options: [
      { id: 'color-1', value: 'red', label: 'Red', hexCode: '#FF0000', sortOrder: 1 },
      { id: 'color-2', value: 'blue', label: 'Blue', hexCode: '#0000FF', sortOrder: 2 },
      { id: 'color-3', value: 'green', label: 'Green', hexCode: '#00FF00', sortOrder: 3 },
      { id: 'color-4', value: 'black', label: 'Black', hexCode: '#000000', sortOrder: 4 },
      { id: 'color-5', value: 'white', label: 'White', hexCode: '#FFFFFF', sortOrder: 5 },
      { id: 'color-6', value: 'yellow', label: 'Yellow', hexCode: '#FFFF00', sortOrder: 6 },
      { id: 'color-7', value: 'purple', label: 'Purple', hexCode: '#800080', sortOrder: 7 },
      { id: 'color-8', value: 'orange', label: 'Orange', hexCode: '#FFA500', sortOrder: 8 },
      { id: 'color-9', value: 'gray', label: 'Gray', hexCode: '#808080', sortOrder: 9 },
      { id: 'color-10', value: 'brown', label: 'Brown', hexCode: '#A52A2A', sortOrder: 10 },
      { id: 'color-11', value: 'pink', label: 'Pink', hexCode: '#FFC0CB', sortOrder: 11 },
      { id: 'color-12', value: 'navy', label: 'Navy', hexCode: '#000080', sortOrder: 12 }
    ],
    metadata: {
      displayType: 'swatch',
      swatchType: 'color',
      renderFrontend: true
    }
  },
  {
    id: 'attr-2',
    code: 'size',
    name: 'Size',
    type: ATTRIBUTE_TYPES.SELECT,
    description: 'Product size',
    isRequired: false,
    isFilterable: true,
    isSearchable: false,
    isComparable: true,
    isVariant: true,
    isActive: true,
    displayOrder: 20,
    defaultValue: null,
    groupCode: 'appearance',
    groupName: 'Appearance',
    validations: {
      validationType: VALIDATION_TYPES.NONE
    },
    options: [
      { id: 'size-1', value: 'xs', label: 'XS', sortOrder: 1 },
      { id: 'size-2', value: 's', label: 'S', sortOrder: 2 },
      { id: 'size-3', value: 'm', label: 'M', sortOrder: 3 },
      { id: 'size-4', value: 'l', label: 'L', sortOrder: 4 },
      { id: 'size-5', value: 'xl', label: 'XL', sortOrder: 5 },
      { id: 'size-6', value: 'xxl', label: 'XXL', sortOrder: 6 },
      { id: 'size-7', value: 'xxxl', label: '3XL', sortOrder: 7 }
    ],
    metadata: {
      displayType: 'button',
      renderFrontend: true
    }
  },
  {
    id: 'attr-3',
    code: 'material',
    name: 'Material',
    type: ATTRIBUTE_TYPES.SELECT,
    description: 'Primary material',
    isRequired: false,
    isFilterable: true,
    isSearchable: true,
    isComparable: true,
    isVariant: true,
    isActive: true,
    displayOrder: 30,
    defaultValue: null,
    groupCode: 'specifications',
    groupName: 'Specifications',
    validations: {
      validationType: VALIDATION_TYPES.NONE
    },
    options: [
      { id: 'material-1', value: 'cotton', label: 'Cotton', sortOrder: 1 },
      { id: 'material-2', value: 'polyester', label: 'Polyester', sortOrder: 2 },
      { id: 'material-3', value: 'leather', label: 'Leather', sortOrder: 3 },
      { id: 'material-4', value: 'wool', label: 'Wool', sortOrder: 4 },
      { id: 'material-5', value: 'silk', label: 'Silk', sortOrder: 5 },
      { id: 'material-6', value: 'nylon', label: 'Nylon', sortOrder: 6 },
      { id: 'material-7', value: 'linen', label: 'Linen', sortOrder: 7 },
      { id: 'material-8', value: 'denim', label: 'Denim', sortOrder: 8 },
      { id: 'material-9', value: 'canvas', label: 'Canvas', sortOrder: 9 },
      { id: 'material-10', value: 'plastic', label: 'Plastic', sortOrder: 10 },
      { id: 'material-11', value: 'metal', label: 'Metal', sortOrder: 11 },
      { id: 'material-12', value: 'glass', label: 'Glass', sortOrder: 12 },
      { id: 'material-13', value: 'wood', label: 'Wood', sortOrder: 13 },
      { id: 'material-14', value: 'ceramic', label: 'Ceramic', sortOrder: 14 }
    ],
    metadata: {
      displayType: 'dropdown',
      renderFrontend: true
    }
  },
  {
    id: 'attr-4',
    code: 'weight',
    name: 'Weight',
    type: ATTRIBUTE_TYPES.MEASUREMENT,
    description: 'Product weight',
    isRequired: false,
    isFilterable: true,
    isSearchable: false,
    isComparable: true,
    isVariant: false,
    isActive: true,
    displayOrder: 40,
    defaultValue: null,
    groupCode: 'specifications',
    groupName: 'Specifications',
    validations: {
      validationType: VALIDATION_TYPES.RANGE,
      min: 0,
      max: 1000
    },
    options: null,
    metadata: {
      units: [
        { value: 'g', label: 'Grams (g)' },
        { value: 'kg', label: 'Kilograms (kg)' },
        { value: 'oz', label: 'Ounces (oz)' },
        { value: 'lb', label: 'Pounds (lb)' }
      ],
      defaultUnit: 'g',
      displayPrecision: 2,
      renderFrontend: true
    }
  },
  {
    id: 'attr-5',
    code: 'dimensions',
    name: 'Dimensions',
    type: ATTRIBUTE_TYPES.TEXT,
    description: 'Product dimensions (Length x Width x Height)',
    isRequired: false,
    isFilterable: false,
    isSearchable: false,
    isComparable: true,
    isVariant: false,
    isActive: true,
    displayOrder: 50,
    defaultValue: null,
    groupCode: 'specifications',
    groupName: 'Specifications',
    validations: {
      validationType: VALIDATION_TYPES.PATTERN,
      pattern: '^\\d+(\\.\\d+)?\\s*x\\s*\\d+(\\.\\d+)?\\s*x\\s*\\d+(\\.\\d+)?$',
      message: 'Please enter dimensions in format: L x W x H'
    },
    options: null,
    metadata: {
      placeholder: '10 x 20 x 30',
      renderFrontend: true
    }
  },
  {
    id: 'attr-6',
    code: 'brand',
    name: 'Brand',
    type: ATTRIBUTE_TYPES.SELECT,
    description: 'Product brand',
    isRequired: true,
    isFilterable: true,
    isSearchable: true,
    isComparable: true,
    isVariant: false,
    isActive: true,
    displayOrder: 10,
    defaultValue: null,
    groupCode: 'basic',
    groupName: 'Basic Information',
    validations: {
      validationType: VALIDATION_TYPES.NONE
    },
    options: [
      { id: 'brand-1', value: 'apple', label: 'Apple', sortOrder: 1 },
      { id: 'brand-2', value: 'samsung', label: 'Samsung', sortOrder: 2 },
      { id: 'brand-3', value: 'sony', label: 'Sony', sortOrder: 3 },
      { id: 'brand-4', value: 'nike', label: 'Nike', sortOrder: 4 },
      { id: 'brand-5', value: 'adidas', label: 'Adidas', sortOrder: 5 },
      { id: 'brand-6', value: 'hp', label: 'HP', sortOrder: 6 },
      { id: 'brand-7', value: 'dell', label: 'Dell', sortOrder: 7 },
      { id: 'brand-8', value: 'lenovo', label: 'Lenovo', sortOrder: 8 }
    ],
    metadata: {
      displayType: 'dropdown',
      renderFrontend: true
    }
  },
  {
    id: 'attr-7',
    code: 'warranty',
    name: 'Warranty',
    type: ATTRIBUTE_TYPES.SELECT,
    description: 'Product warranty period',
    isRequired: false,
    isFilterable: true,
    isSearchable: false,
    isComparable: true,
    isVariant: false,
    isActive: true,
    displayOrder: 60,
    defaultValue: null,
    groupCode: 'specifications',
    groupName: 'Specifications',
    validations: {
      validationType: VALIDATION_TYPES.NONE
    },
    options: [
      { id: 'warranty-1', value: 'none', label: 'No Warranty', sortOrder: 1 },
      { id: 'warranty-2', value: '6months', label: '6 Months', sortOrder: 2 },
      { id: 'warranty-3', value: '1year', label: '1 Year', sortOrder: 3 },
      { id: 'warranty-4', value: '2years', label: '2 Years', sortOrder: 4 },
      { id: 'warranty-5', value: '3years', label: '3 Years', sortOrder: 5 },
      { id: 'warranty-6', value: '5years', label: '5 Years', sortOrder: 6 },
      { id: 'warranty-7', value: 'lifetime', label: 'Lifetime', sortOrder: 7 }
    ],
    metadata: {
      displayType: 'dropdown',
      renderFrontend: true
    }
  },
  {
    id: 'attr-8',
    code: 'is_waterproof',
    name: 'Waterproof',
    type: ATTRIBUTE_TYPES.BOOLEAN,
    description: 'Whether the product is waterproof',
    isRequired: false,
    isFilterable: true,
    isSearchable: false,
    isComparable: true,
    isVariant: false,
    isActive: true,
    displayOrder: 70,
    defaultValue: false,
    groupCode: 'specifications',
    groupName: 'Specifications',
    validations: {
      validationType: VALIDATION_TYPES.NONE
    },
    options: [
      { id: 'waterproof-1', value: 'true', label: 'Yes', sortOrder: 1 },
      { id: 'waterproof-2', value: 'false', label: 'No', sortOrder: 2 }
    ],
    metadata: {
      displayType: 'switch',
      renderFrontend: true
    }
  },
  {
    id: 'attr-9',
    code: 'manufacture_date',
    name: 'Manufacture Date',
    type: ATTRIBUTE_TYPES.DATE,
    description: 'Date of manufacture',
    isRequired: false,
    isFilterable: false,
    isSearchable: false,
    isComparable: false,
    isVariant: false,
    isActive: true,
    displayOrder: 80,
    defaultValue: null,
    groupCode: 'inventory',
    groupName: 'Inventory Information',
    validations: {
      validationType: VALIDATION_TYPES.NONE
    },
    options: null,
    metadata: {
      dateFormat: 'MM/DD/YYYY',
      renderFrontend: false
    }
  },
  {
    id: 'attr-10',
    code: 'expiry_date',
    name: 'Expiry Date',
    type: ATTRIBUTE_TYPES.DATE,
    description: 'Product expiry date',
    isRequired: false,
    isFilterable: false,
    isSearchable: false,
    isComparable: false,
    isVariant: false,
    isActive: true,
    displayOrder: 90,
    defaultValue: null,
    groupCode: 'inventory',
    groupName: 'Inventory Information',
    validations: {
      validationType: VALIDATION_TYPES.NONE
    },
    options: null,
    metadata: {
      dateFormat: 'MM/DD/YYYY',
      renderFrontend: false
    }
  },
  {
    id: 'attr-11',
    code: 'pattern',
    name: 'Pattern',
    type: ATTRIBUTE_TYPES.SELECT,
    description: 'Design pattern',
    isRequired: false,
    isFilterable: true,
    isSearchable: false,
    isComparable: true,
    isVariant: true,
    isActive: true,
    displayOrder: 25,
    defaultValue: null,
    groupCode: 'appearance',
    groupName: 'Appearance',
    validations: {
      validationType: VALIDATION_TYPES.NONE
    },
    options: [
      { id: 'pattern-1', value: 'solid', label: 'Solid', sortOrder: 1 },
      { id: 'pattern-2', value: 'striped', label: 'Striped', sortOrder: 2 },
      { id: 'pattern-3', value: 'checked', label: 'Checked', sortOrder: 3 },
      { id: 'pattern-4', value: 'dotted', label: 'Dotted', sortOrder: 4 },
      { id: 'pattern-5', value: 'floral', label: 'Floral', sortOrder: 5 },
      { id: 'pattern-6', value: 'graphic', label: 'Graphic', sortOrder: 6 },
      { id: 'pattern-7', value: 'camo', label: 'Camouflage', sortOrder: 7 }
    ],
    metadata: {
      displayType: 'dropdown',
      renderFrontend: true
    }
  },
  {
    id: 'attr-12',
    code: 'screen_size',
    name: 'Screen Size',
    type: ATTRIBUTE_TYPES.SELECT,
    description: 'Device screen size in inches',
    isRequired: false,
    isFilterable: true,
    isSearchable: false,
    isComparable: true,
    isVariant: true,
    isActive: true,
    displayOrder: 15,
    defaultValue: null,
    groupCode: 'specifications',
    groupName: 'Specifications',
    validations: {
      validationType: VALIDATION_TYPES.NONE
    },
    options: [
      { id: 'screen-1', value: '5', label: '5"', sortOrder: 1 },
      { id: 'screen-2', value: '5.5', label: '5.5"', sortOrder: 2 },
      { id: 'screen-3', value: '6', label: '6"', sortOrder: 3 },
      { id: 'screen-4', value: '6.5', label: '6.5"', sortOrder: 4 },
      { id: 'screen-5', value: '7', label: '7"', sortOrder: 5 },
      { id: 'screen-6', value: '13', label: '13"', sortOrder: 6 },
      { id: 'screen-7', value: '15', label: '15"', sortOrder: 7 },
      { id: 'screen-8', value: '17', label: '17"', sortOrder: 8 }
    ],
    metadata: {
      displayType: 'dropdown',
      renderFrontend: true
    }
  },
  {
    id: 'attr-13',
    code: 'storage',
    name: 'Storage Capacity',
    type: ATTRIBUTE_TYPES.SELECT,
    description: 'Device storage capacity',
    isRequired: false,
    isFilterable: true,
    isSearchable: false,
    isComparable: true,
    isVariant: true,
    isActive: true,
    displayOrder: 16,
    defaultValue: null,
    groupCode: 'specifications',
    groupName: 'Specifications',
    validations: {
      validationType: VALIDATION_TYPES.NONE
    },
    options: [
      { id: 'storage-1', value: '64gb', label: '64GB', sortOrder: 1 },
      { id: 'storage-2', value: '128gb', label: '128GB', sortOrder: 2 },
      { id: 'storage-3', value: '256gb', label: '256GB', sortOrder: 3 },
      { id: 'storage-4', value: '512gb', label: '512GB', sortOrder: 4 },
      { id: 'storage-5', value: '1tb', label: '1TB', sortOrder: 5 },
      { id: 'storage-6', value: '2tb', label: '2TB', sortOrder: 6 }
    ],
    metadata: {
      displayType: 'button',
      renderFrontend: true
    }
  },
  {
    id: 'attr-14',
    code: 'processor',
    name: 'Processor',
    type: ATTRIBUTE_TYPES.SELECT,
    description: 'Processor type',
    isRequired: false,
    isFilterable: true,
    isSearchable: false,
    isComparable: true,
    isVariant: true,
    isActive: true,
    displayOrder: 17,
    defaultValue: null,
    groupCode: 'specifications',
    groupName: 'Specifications',
    validations: {
      validationType: VALIDATION_TYPES.NONE
    },
    options: [
      { id: 'processor-1', value: 'intel_i3', label: 'Intel Core i3', sortOrder: 1 },
      { id: 'processor-2', value: 'intel_i5', label: 'Intel Core i5', sortOrder: 2 },
      { id: 'processor-3', value: 'intel_i7', label: 'Intel Core i7', sortOrder: 3 },
      { id: 'processor-4', value: 'intel_i9', label: 'Intel Core i9', sortOrder: 4 },
      { id: 'processor-5', value: 'amd_ryzen_5', label: 'AMD Ryzen 5', sortOrder: 5 },
      { id: 'processor-6', value: 'amd_ryzen_7', label: 'AMD Ryzen 7', sortOrder: 6 },
      { id: 'processor-7', value: 'amd_ryzen_9', label: 'AMD Ryzen 9', sortOrder: 7 },
      { id: 'processor-8', value: 'apple_m1', label: 'Apple M1', sortOrder: 8 },
      { id: 'processor-9', value: 'apple_m2', label: 'Apple M2', sortOrder: 9 }
    ],
    metadata: {
      displayType: 'dropdown',
      renderFrontend: true
    }
  },
  {
    id: 'attr-15',
    code: 'memory',
    name: 'Memory (RAM)',
    type: ATTRIBUTE_TYPES.SELECT,
    description: 'Device RAM capacity',
    isRequired: false,
    isFilterable: true,
    isSearchable: false,
    isComparable: true,
    isVariant: true,
    isActive: true,
    displayOrder: 18,
    defaultValue: null,
    groupCode: 'specifications',
    groupName: 'Specifications',
    validations: {
      validationType: VALIDATION_TYPES.NONE
    },
    options: [
      { id: 'ram-1', value: '4gb', label: '4GB', sortOrder: 1 },
      { id: 'ram-2', value: '8gb', label: '8GB', sortOrder: 2 },
      { id: 'ram-3', value: '16gb', label: '16GB', sortOrder: 3 },
      { id: 'ram-4', value: '32gb', label: '32GB', sortOrder: 4 },
      { id: 'ram-5', value: '64gb', label: '64GB', sortOrder: 5 }
    ],
    metadata: {
      displayType: 'button',
      renderFrontend: true
    }
  },
  {
    id: 'attr-16',
    code: 'compatible_with',
    name: 'Compatible With',
    type: ATTRIBUTE_TYPES.MULTISELECT,
    description: 'Compatible devices',
    isRequired: false,
    isFilterable: true,
    isSearchable: false,
    isComparable: true,
    isVariant: false,
    isActive: true,
    displayOrder: 100,
    defaultValue: null,
    groupCode: 'compatibility',
    groupName: 'Compatibility',
    validations: {
      validationType: VALIDATION_TYPES.NONE
    },
    options: [
      { id: 'compat-1', value: 'iphone', label: 'iPhone', sortOrder: 1 },
      { id: 'compat-2', value: 'ipad', label: 'iPad', sortOrder: 2 },
      { id: 'compat-3', value: 'macbook', label: 'MacBook', sortOrder: 3 },
      { id: 'compat-4', value: 'android', label: 'Android', sortOrder: 4 },
      { id: 'compat-5', value: 'windows', label: 'Windows', sortOrder: 5 },
      { id: 'compat-6', value: 'playstation', label: 'PlayStation', sortOrder: 6 },
      { id: 'compat-7', value: 'xbox', label: 'Xbox', sortOrder: 7 },
      { id: 'compat-8', value: 'nintendo', label: 'Nintendo', sortOrder: 8 }
    ],
    metadata: {
      displayType: 'checkbox',
      renderFrontend: true
    }
  },
  {
    id: 'attr-17',
    code: 'display_resolution',
    name: 'Display Resolution',
    type: ATTRIBUTE_TYPES.SELECT,
    description: 'Screen resolution',
    isRequired: false,
    isFilterable: true,
    isSearchable: false,
    isComparable: true,
    isVariant: false,
    isActive: true,
    displayOrder: 110,
    defaultValue: null,
    groupCode: 'specifications',
    groupName: 'Specifications',
    validations: {
      validationType: VALIDATION_TYPES.NONE
    },
    options: [
      { id: 'resolution-1', value: 'hd', label: 'HD (1280x720)', sortOrder: 1 },
      { id: 'resolution-2', value: 'fhd', label: 'Full HD (1920x1080)', sortOrder: 2 },
      { id: 'resolution-3', value: 'qhd', label: 'QHD (2560x1440)', sortOrder: 3 },
      { id: 'resolution-4', value: '4k', label: '4K (3840x2160)', sortOrder: 4 },
      { id: 'resolution-5', value: '8k', label: '8K (7680x4320)', sortOrder: 5 },
      { id: 'resolution-6', value: 'retina', label: 'Retina Display', sortOrder: 6 }
    ],
    metadata: {
      displayType: 'dropdown',
      renderFrontend: true
    }
  },
  {
    id: 'attr-18',
    code: 'battery_life',
    name: 'Battery Life',
    type: ATTRIBUTE_TYPES.SELECT,
    description: 'Average battery life',
    isRequired: false,
    isFilterable: true,
    isSearchable: false,
    isComparable: true,
    isVariant: false,
    isActive: true,
    displayOrder: 120,
    defaultValue: null,
    groupCode: 'specifications',
    groupName: 'Specifications',
    validations: {
      validationType: VALIDATION_TYPES.NONE
    },
    options: [
      { id: 'battery-1', value: 'upto8', label: 'Up to 8 hours', sortOrder: 1 },
      { id: 'battery-2', value: '8to12', label: '8-12 hours', sortOrder: 2 },
      { id: 'battery-3', value: '12to16', label: '12-16 hours', sortOrder: 3 },
      { id: 'battery-4', value: '16to24', label: '16-24 hours', sortOrder: 4 },
      { id: 'battery-5', value: 'over24', label: 'Over 24 hours', sortOrder: 5 }
    ],
    metadata: {
      displayType: 'dropdown',
      renderFrontend: true
    }
  },
  {
    id: 'attr-19',
    code: 'os',
    name: 'Operating System',
    type: ATTRIBUTE_TYPES.SELECT,
    description: 'Device operating system',
    isRequired: false,
    isFilterable: true,
    isSearchable: true,
    isComparable: true,
    isVariant: false,
    isActive: true,
    displayOrder: 130,
    defaultValue: null,
    groupCode: 'specifications',
    groupName: 'Specifications',
    validations: {
      validationType: VALIDATION_TYPES.NONE
    },
    options: [
      { id: 'os-1', value: 'ios', label: 'iOS', sortOrder: 1 },
      { id: 'os-2', value: 'android', label: 'Android', sortOrder: 2 },
      { id: 'os-3', value: 'windows', label: 'Windows', sortOrder: 3 },
      { id: 'os-4', value: 'macos', label: 'macOS', sortOrder: 4 },
      { id: 'os-5', value: 'linux', label: 'Linux', sortOrder: 5 },
      { id: 'os-6', value: 'chrome', label: 'Chrome OS', sortOrder: 6 }
    ],
    metadata: {
      displayType: 'dropdown',
      renderFrontend: true
    }
  },
  {
    id: 'attr-20',
    code: 'camera',
    name: 'Camera Resolution',
    type: ATTRIBUTE_TYPES.SELECT,
    description: 'Main camera resolution',
    isRequired: false,
    isFilterable: true,
    isSearchable: false,
    isComparable: true,
    isVariant: false,
    isActive: true,
    displayOrder: 140,
    defaultValue: null,
    groupCode: 'specifications',
    groupName: 'Specifications',
    validations: {
      validationType: VALIDATION_TYPES.NONE
    },
    options: [
      { id: 'camera-1', value: '12mp', label: '12 MP', sortOrder: 1 },
      { id: 'camera-2', value: '24mp', label: '24 MP', sortOrder: 2 },
      { id: 'camera-3', value: '48mp', label: '48 MP', sortOrder: 3 },
      { id: 'camera-4', value: '64mp', label: '64 MP', sortOrder: 4 },
      { id: 'camera-5', value: '108mp', label: '108 MP', sortOrder: 5 }
    ],
    metadata: {
      displayType: 'dropdown',
      renderFrontend: true
    }
  }
];

// Attribute Groups
export const attributeGroups = [
  {
    id: 'group-1',
    code: 'basic',
    name: 'Basic Information',
    description: 'Basic product information',
    sortOrder: 10
  },
  {
    id: 'group-2',
    code: 'appearance',
    name: 'Appearance',
    description: 'Visual characteristics',
    sortOrder: 20
  },
  {
    id: 'group-3',
    code: 'specifications',
    name: 'Specifications',
    description: 'Technical specifications',
    sortOrder: 30
  },
  {
    id: 'group-4',
    code: 'inventory',
    name: 'Inventory Information',
    description: 'Inventory-related data',
    sortOrder: 40
  },
  {
    id: 'group-5',
    code: 'compatibility',
    name: 'Compatibility',
    description: 'Compatibility information',
    sortOrder: 50
  }
];

// Attribute Sets for different product types
export const attributeSets = [
  {
    id: 'set-1',
    code: 'clothing',
    name: 'Clothing',
    description: 'Attributes for clothing products',
    attributeIds: ['attr-1', 'attr-2', 'attr-3', 'attr-6', 'attr-8', 'attr-11'],
    isDefault: false,
    isActive: true,
    createdAt: '2024-11-15T10:00:00Z',
    updatedAt: '2024-11-15T10:00:00Z'
  },
  {
    id: 'set-2',
    code: 'electronics',
    name: 'Electronics',
    description: 'Attributes for electronic products',
    attributeIds: ['attr-1', 'attr-4', 'attr-5', 'attr-6', 'attr-7', 'attr-8', 'attr-12', 'attr-13', 'attr-14', 'attr-15', 'attr-16', 'attr-17', 'attr-18', 'attr-19'],
    isDefault: false,
    isActive: true,
    createdAt: '2024-11-15T10:30:00Z',
    updatedAt: '2024-11-15T10:30:00Z'
  },
  {
    id: 'set-3',
    code: 'smartphones',
    name: 'Smartphones',
    description: 'Attributes for smartphone products',
    attributeIds: ['attr-1', 'attr-4', 'attr-6', 'attr-7', 'attr-8', 'attr-12', 'attr-13', 'attr-16', 'attr-18', 'attr-19', 'attr-20'],
    isDefault: false,
    isActive: true,
    createdAt: '2024-11-15T11:00:00Z',
    updatedAt: '2024-11-15T11:00:00Z'
  },
  {
    id: 'set-4',
    code: 'furniture',
    name: 'Furniture',
    description: 'Attributes for furniture products',
    attributeIds: ['attr-1', 'attr-3', 'attr-4', 'attr-5', 'attr-6', 'attr-7'],
    isDefault: false,
    isActive: true,
    createdAt: '2024-11-15T11:30:00Z',
    updatedAt: '2024-11-15T11:30:00Z'
  },
  {
    id: 'set-5',
    code: 'food',
    name: 'Food & Beverages',
    description: 'Attributes for food and beverage products',
    attributeIds: ['attr-4', 'attr-6', 'attr-9', 'attr-10'],
    isDefault: false,
    isActive: true,
    createdAt: '2024-11-15T12:00:00Z',
    updatedAt: '2024-11-15T12:00:00Z'
  },
  {
    id: 'set-6',
    code: 'default',
    name: 'Default Attribute Set',
    description: 'Default attributes for all products',
    attributeIds: ['attr-1', 'attr-4', 'attr-6', 'attr-7', 'attr-8'],
    isDefault: true,
    isActive: true,
    createdAt: '2024-11-15T09:00:00Z',
    updatedAt: '2024-11-15T09:00:00Z'
  }
];

// Sample variant matrices for different product types
export const variantMatrices = {
  // T-shirt variant matrix (color × size × pattern)
  tshirt: {
    productId: 'prod-1001',
    name: 'Classic Cotton T-Shirt',
    variantAttributes: ['attr-1', 'attr-2', 'attr-11'],
    variants: [
      {
        id: 'var-t-1',
        sku: 'TSHIRT-RED-S-SOLID',
        attributeValues: {
          'attr-1': 'red',    // Color: Red
          'attr-2': 's',      // Size: S
          'attr-11': 'solid'  // Pattern: Solid
        },
        price: 19.99,
        compareAtPrice: 24.99,
        cost: 8.50,
        stock: 45,
        isAvailable: true,
        images: [
          '/assets/products/tshirt-red-s-solid-1.jpg',
          '/assets/products/tshirt-red-s-solid-2.jpg'
        ],
        weight: 150,
        dimensions: '25 x 20 x 2',
        barcode: '123456789012',
        isDefault: false
      },
      {
        id: 'var-t-2',
        sku: 'TSHIRT-RED-M-SOLID',
        attributeValues: {
          'attr-1': 'red',    // Color: Red
          'attr-2': 'm',      // Size: M
          'attr-11': 'solid'  // Pattern: Solid
        },
        price: 19.99,
        compareAtPrice: 24.99,
        cost: 8.50,
        stock: 38,
        isAvailable: true,
        images: [
          '/assets/products/tshirt-red-m-solid-1.jpg',
          '/assets/products/tshirt-red-m-solid-2.jpg'
        ],
        weight: 160,
        dimensions: '27 x 22 x 2',
        barcode: '123456789013',
        isDefault: true
      },
      {
        id: 'var-t-3',
        sku: 'TSHIRT-BLUE-S-SOLID',
        attributeValues: {
          'attr-1': 'blue',   // Color: Blue
          'attr-2': 's',      // Size: S
          'attr-11': 'solid'  // Pattern: Solid
        },
        price: 19.99,
        compareAtPrice: 24.99,
        cost: 8.50,
        stock: 32,
        isAvailable: true,
        images: [
          '/assets/products/tshirt-blue-s-solid-1.jpg',
          '/assets/products/tshirt-blue-s-solid-2.jpg'
        ],
        weight: 150,
        dimensions: '25 x 20 x 2',
        barcode: '123456789014',
        isDefault: false
      },
      {
        id: 'var-t-4',
        sku: 'TSHIRT-BLUE-M-SOLID',
        attributeValues: {
          'attr-1': 'blue',   // Color: Blue
          'attr-2': 'm',      // Size: M
          'attr-11': 'solid'  // Pattern: Solid
        },
        price: 19.99,
        compareAtPrice: 24.99,
        cost: 8.50,
        stock: 29,
        isAvailable: true,
        images: [
          '/assets/products/tshirt-blue-m-solid-1.jpg',
          '/assets/products/tshirt-blue-m-solid-2.jpg'
        ],
        weight: 160,
        dimensions: '27 x 22 x 2',
        barcode: '123456789015',
        isDefault: false
      },
      {
        id: 'var-t-5',
        sku: 'TSHIRT-RED-S-STRIPED',
        attributeValues: {
          'attr-1': 'red',     // Color: Red
          'attr-2': 's',       // Size: S
          'attr-11': 'striped' // Pattern: Striped
        },
        price: 22.99,
        compareAtPrice: 27.99,
        cost: 9.50,
        stock: 18,
        isAvailable: true,
        images: [
          '/assets/products/tshirt-red-s-striped-1.jpg',
          '/assets/products/tshirt-red-s-striped-2.jpg'
        ],
        weight: 155,
        dimensions: '25 x 20 x 2',
        barcode: '123456789016',
        isDefault: false
      },
      {
        id: 'var-t-6',
        sku: 'TSHIRT-BLUE-S-STRIPED',
        attributeValues: {
          'attr-1': 'blue',    // Color: Blue
          'attr-2': 's',       // Size: S
          'attr-11': 'striped' // Pattern: Striped
        },
        price: 22.99,
        compareAtPrice: 27.99,
        cost: 9.50,
        stock: 0,
        isAvailable: false,
        images: [
          '/assets/products/tshirt-blue-s-striped-1.jpg',
          '/assets/products/tshirt-blue-s-striped-2.jpg'
        ],
        weight: 155,
        dimensions: '25 x 20 x 2',
        barcode: '123456789017',
        isDefault: false
      }
    ],
    variantPricing: {
      'attr-2': {
        'l': { priceAdjustment: 2.00 },
        'xl': { priceAdjustment: 3.50 },
        'xxl': { priceAdjustment: 5.00 }
      },
      'attr-11': {
        'striped': { priceAdjustment: 3.00 },
        'checked': { priceAdjustment: 3.00 },
        'graphic': { priceAdjustment: 5.00 }
      }
    },
    excludedCombinations: [
      // Certain color/pattern combinations are not available
      { 'attr-1': 'black', 'attr-11': 'striped' },
      { 'attr-1': 'white', 'attr-11': 'checked' }
    ]
  },
  
  // Smartphone variant matrix (color × storage × memory)
  smartphone: {
    productId: 'prod-2001',
    name: 'UltraPhone X',
    variantAttributes: ['attr-1', 'attr-13', 'attr-15'],
    variants: [
      {
        id: 'var-s-1',
        sku: 'UPHONE-BLACK-128GB-8GB',
        attributeValues: {
          'attr-1': 'black',  // Color: Black
          'attr-13': '128gb', // Storage: 128GB
          'attr-15': '8gb'    // RAM: 8GB
        },
        price: 799.99,
        compareAtPrice: 849.99,
        cost: 550.00,
        stock: 25,
        isAvailable: true,
        images: [
          '/assets/products/uphone-black-1.jpg',
          '/assets/products/uphone-black-2.jpg'
        ],
        weight: 180,
        dimensions: '15 x 7 x 0.8',
        barcode: '987654321001',
        isDefault: true
      },
      {
        id: 'var-s-2',
        sku: 'UPHONE-BLACK-256GB-8GB',
        attributeValues: {
          'attr-1': 'black',  // Color: Black
          'attr-13': '256gb', // Storage: 256GB
          'attr-15': '8gb'    // RAM: 8GB
        },
        price: 899.99,
        compareAtPrice: 949.99,
        cost: 600.00,
        stock: 18,
        isAvailable: true,
        images: [
          '/assets/products/uphone-black-1.jpg',
          '/assets/products/uphone-black-2.jpg'
        ],
        weight: 180,
        dimensions: '15 x 7 x 0.8',
        barcode: '987654321002',
        isDefault: false
      },
      {
        id: 'var-s-3',
        sku: 'UPHONE-BLACK-512GB-16GB',
        attributeValues: {
          'attr-1': 'black',  // Color: Black
          'attr-13': '512gb', // Storage: 512GB
          'attr-15': '16gb'   // RAM: 16GB
        },
        price: 1099.99,
        compareAtPrice: 1199.99,
        cost: 750.00,
        stock: 8,
        isAvailable: true,
        images: [
          '/assets/products/uphone-black-1.jpg',
          '/assets/products/uphone-black-2.jpg'
        ],
        weight: 180,
        dimensions: '15 x 7 x 0.8',
        barcode: '987654321003',
        isDefault: false
      },
      {
        id: 'var-s-4',
        sku: 'UPHONE-BLUE-128GB-8GB',
        attributeValues: {
          'attr-1': 'blue',   // Color: Blue
          'attr-13': '128gb', // Storage: 128GB
          'attr-15': '8gb'    // RAM: 8GB
        },
        price: 799.99,
        compareAtPrice: 849.99,
        cost: 550.00,
        stock: 22,
        isAvailable: true,
        images: [
          '/assets/products/uphone-blue-1.jpg',
          '/assets/products/uphone-blue-2.jpg'
        ],
        weight: 180,
        dimensions: '15 x 7 x 0.8',
        barcode: '987654321004',
        isDefault: false
      },
      {
        id: 'var-s-5',
        sku: 'UPHONE-BLUE-256GB-8GB',
        attributeValues: {
          'attr-1': 'blue',   // Color: Blue
          'attr-13': '256gb', // Storage: 256GB
          'attr-15': '8gb'    // RAM: 8GB
        },
        price: 899.99,
        compareAtPrice: 949.99,
        cost: 600.00,
        stock: 15,
        isAvailable: true,
        images: [
          '/assets/products/uphone-blue-1.jpg',
          '/assets/products/uphone-blue-2.jpg'
        ],
        weight: 180,
        dimensions: '15 x 7 x 0.8',
        barcode: '987654321005',
        isDefault: false
      }
    ],
    variantPricing: {
      'attr-13': {
        '128gb': { priceAdjustment: 0 },
        '256gb': { priceAdjustment: 100.00 },
        '512gb': { priceAdjustment: 200.00 },
        '1tb': { priceAdjustment: 350.00 }
      },
      'attr-15': {
        '8gb': { priceAdjustment: 0 },
        '16gb': { priceAdjustment: 100.00 },
        '32gb': { priceAdjustment: 200.00 }
      }
    },
    excludedCombinations: [
      // These combinations don't exist
      { 'attr-13': '128gb', 'attr-15': '32gb' },
      { 'attr-1': 'white', 'attr-13': '1tb' }
    ]
  },
  
  // Laptop variant matrix
  laptop: {
    productId: 'prod-3001',
    name: 'ProBook Elite',
    variantAttributes: ['attr-1', 'attr-13', 'attr-14', 'attr-15'],
    variants: [
      {
        id: 'var-l-1',
        sku: 'PROBOOK-SILVER-512GB-INTEL_I5-16GB',
        attributeValues: {
          'attr-1': 'gray',       // Color: Gray
          'attr-13': '512gb',     // Storage: 512GB
          'attr-14': 'intel_i5',  // Processor: Intel i5
          'attr-15': '16gb'       // RAM: 16GB
        },
        price: 1299.99,
        compareAtPrice: 1399.99,
        cost: 900.00,
        stock: 12,
        isAvailable: true,
        images: [
          '/assets/products/probook-silver-1.jpg',
          '/assets/products/probook-silver-2.jpg'
        ],
        weight: 1800,
        dimensions: '35 x 25 x 2',
        barcode: '456789123001',
        isDefault: true
      },
      {
        id: 'var-l-2',
        sku: 'PROBOOK-SILVER-1TB-INTEL_I7-16GB',
        attributeValues: {
          'attr-1': 'gray',       // Color: Gray
          'attr-13': '1tb',       // Storage: 1TB
          'attr-14': 'intel_i7',  // Processor: Intel i7
          'attr-15': '16gb'       // RAM: 16GB
        },
        price: 1599.99,
        compareAtPrice: 1699.99,
        cost: 1100.00,
        stock: 8,
        isAvailable: true,
        images: [
          '/assets/products/probook-silver-1.jpg',
          '/assets/products/probook-silver-2.jpg'
        ],
        weight: 1800,
        dimensions: '35 x 25 x 2',
        barcode: '456789123002',
        isDefault: false
      },
      {
        id: 'var-l-3',
        sku: 'PROBOOK-SILVER-1TB-INTEL_I7-32GB',
        attributeValues: {
          'attr-1': 'gray',       // Color: Gray
          'attr-13': '1tb',       // Storage: 1TB
          'attr-14': 'intel_i7',  // Processor: Intel i7
          'attr-15': '32gb'       // RAM: 32GB
        },
        price: 1799.99,
        compareAtPrice: 1899.99,
        cost: 1300.00,
        stock: 5,
        isAvailable: true,
        images: [
          '/assets/products/probook-silver-1.jpg',
          '/assets/products/probook-silver-2.jpg'
        ],
        weight: 1800,
        dimensions: '35 x 25 x 2',
        barcode: '456789123003',
        isDefault: false
      },
      {
        id: 'var-l-4',
        sku: 'PROBOOK-SPACE-512GB-INTEL_I5-16GB',
        attributeValues: {
          'attr-1': 'black',      // Color: Black
          'attr-13': '512gb',     // Storage: 512GB
          'attr-14': 'intel_i5',  // Processor: Intel i5
          'attr-15': '16gb'       // RAM: 16GB
        },
        price: 1299.99,
        compareAtPrice: 1399.99,
        cost: 900.00,
        stock: 10,
        isAvailable: true,
        images: [
          '/assets/products/probook-space-1.jpg',
          '/assets/products/probook-space-2.jpg'
        ],
        weight: 1800,
        dimensions: '35 x 25 x 2',
        barcode: '456789123004',
        isDefault: false
      }
    ],
    variantPricing: {
      'attr-13': {
        '512gb': { priceAdjustment: 0 },
        '1tb': { priceAdjustment: 150.00 },
        '2tb': { priceAdjustment: 300.00 }
      },
      'attr-14': {
        'intel_i5': { priceAdjustment: 0 },
        'intel_i7': { priceAdjustment: 200.00 },
        'intel_i9': { priceAdjustment: 400.00 }
      },
      'attr-15': {
        '16gb': { priceAdjustment: 0 },
        '32gb': { priceAdjustment: 200.00 },
        '64gb': { priceAdjustment: 400.00 }
      }
    },
    excludedCombinations: [
      // These combinations are not manufactured
      { 'attr-14': 'intel_i5', 'attr-15': '64gb' },
      { 'attr-13': '512gb', 'attr-14': 'intel_i9' }
    ]
  }
};

// Attribute dependency rules
export const attributeDependencyRules = [
  {
    id: 'rule-1',
    name: 'Material constraints for colors',
    description: 'Certain materials only support specific colors',
    condition: {
      attributeId: 'attr-3',  // Material
      operator: 'equals',
      value: 'leather'
    },
    actions: [
      {
        attributeId: 'attr-1',  // Color
        action: 'restrict',
        allowedValues: ['black', 'brown', 'navy']
      }
    ]
  },
  {
    id: 'rule-2',
    name: 'RAM constraints for processors',
    description: 'Higher-end processors require more RAM',
    condition: {
      attributeId: 'attr-14',  // Processor
      operator: 'in',
      value: ['intel_i9', 'amd_ryzen_9']
    },
    actions: [
      {
        attributeId: 'attr-15',  // RAM
        action: 'restrict',
        allowedValues: ['16gb', '32gb', '64gb']
      }
    ]
  },
  {
    id: 'rule-3',
    name: 'Storage constraints for specific models',
    description: 'Budget models have limited storage options',
    condition: {
      attributeId: 'attr-6',  // Brand
      operator: 'equals',
      value: 'budget_brand'
    },
    actions: [
      {
        attributeId: 'attr-13',  // Storage
        action: 'restrict',
        allowedValues: ['64gb', '128gb', '256gb']
      }
    ]
  }
];

// Compatibility matrix
export const compatibilityMatrix = [
  {
    id: 'compat-matrix-1',
    name: 'Phone Case Compatibility',
    description: 'Shows which phone cases fit which phone models',
    baseProductType: 'phone_case',
    compatibleWithType: 'smartphone',
    matrix: [
      {
        accessoryId: 'prod-5001',  // UltraPhone X Case
        compatibleWith: ['prod-2001', 'prod-2002']  // UltraPhone X, UltraPhone X Pro
      },
      {
        accessoryId: 'prod-5002',  // SuperPhone Pro Case
        compatibleWith: ['prod-2005', 'prod-2006']  // SuperPhone Pro, SuperPhone Ultra
      }
    ]
  },
  {
    id: 'compat-matrix-2',
    name: 'Laptop Accessory Compatibility',
    description: 'Shows which accessories are compatible with which laptop models',
    baseProductType: 'laptop_accessory',
    compatibleWithType: 'laptop',
    matrix: [
      {
        accessoryId: 'prod-6001',  // USB-C Dock
        compatibleWith: ['prod-3001', 'prod-3002', 'prod-3003']  // Various laptop models
      },
      {
        accessoryId: 'prod-6002',  // Laptop Sleeve
        compatibleWith: ['prod-3001', 'prod-3002', 'prod-3003', 'prod-3004']
      }
    ]
  }
];

// Cross-selling rules based on attributes
export const crossSellingRules = [
  {
    id: 'cross-sell-1',
    name: 'Phone & Case',
    description: 'Suggest phone cases for phones',
    triggerProductType: 'smartphone',
    suggestedProductType: 'phone_case',
    attributeMatching: [
      {
        sourceAttribute: 'attr-6',  // Brand
        targetAttribute: 'attr-16', // Compatible With
        matchingLogic: 'exact'
      }
    ]
  },
  {
    id: 'cross-sell-2',
    name: 'T-Shirt Combinations',
    description: 'Suggest matching t-shirts',
    triggerProductType: 'tshirt',
    suggestedProductType: 'tshirt',
    attributeMatching: [
      {
        sourceAttribute: 'attr-1',  // Color
        targetAttribute: 'attr-1',  // Color
        matchingLogic: 'complementary'
      }
    ]
  }
];

// Helper functions for working with the attribute system
export const attributeUtils = {
  // Find an attribute by ID
  findAttributeById(attributeId) {
    return attributesData.find(attr => attr.id === attributeId);
  },
  
  // Find an attribute by code
  findAttributeByCode(code) {
    return attributesData.find(attr => attr.code === code);
  },
  
  // Get all attributes of a specific type
  getAttributesByType(type) {
    return attributesData.filter(attr => attr.type === type);
  },
  
  // Get all variant attributes
  getVariantAttributes() {
    return attributesData.filter(attr => attr.isVariant);
  },
  
  // Get all filterable attributes
  getFilterableAttributes() {
    return attributesData.filter(attr => attr.isFilterable);
  },
  
  // Get attributes in a group
  getAttributesByGroup(groupCode) {
    return attributesData.filter(attr => attr.groupCode === groupCode);
  },
  
  // Find an attribute set by ID
  findAttributeSetById(setId) {
    return attributeSets.find(set => set.id === setId);
  },
  
  // Get attributes for a specific attribute set
  getAttributesForSet(setId) {
    const set = this.findAttributeSetById(setId);
    if (!set) return [];
    
    return set.attributeIds.map(attrId => this.findAttributeById(attrId)).filter(Boolean);
  },
  
  // Get option details for a select/multiselect attribute
  getAttributeOptions(attributeId) {
    const attribute = this.findAttributeById(attributeId);
    if (!attribute || !attribute.options) return [];
    
    return attribute.options;
  },
  
  // Get option label from value
  getOptionLabel(attributeId, value) {
    const attribute = this.findAttributeById(attributeId);
    if (!attribute || !attribute.options) return value;
    
    const option = attribute.options.find(opt => opt.value === value);
    return option ? option.label : value;
  },
  
  // Check if a variant combination is valid according to dependency rules
  isValidVariantCombination(combination, rules = attributeDependencyRules) {
    for (const rule of rules) {
      const conditionAttribute = rule.condition.attributeId;
      const conditionValue = combination[conditionAttribute];
      
      // Skip if the condition attribute isn't part of this combination
      if (!conditionValue) continue;
      
      // Check if condition is met
      let conditionMet = false;
      
      if (rule.condition.operator === 'equals') {
        conditionMet = conditionValue === rule.condition.value;
      } else if (rule.condition.operator === 'in') {
        conditionMet = rule.condition.value.includes(conditionValue);
      }
      
      // If condition is met, check restrictions
      if (conditionMet) {
        for (const action of rule.actions) {
          const actionAttribute = action.attributeId;
          const actionValue = combination[actionAttribute];
          
          // Skip if the action attribute isn't part of this combination
          if (!actionValue) continue;
          
          if (action.action === 'restrict' && !action.allowedValues.includes(actionValue)) {
            return false;
          }
        }
      }
    }
    
    return true;
  },
  
  // Generate all possible variant combinations for a set of attributes
  generateVariantCombinations(variantAttributes, excludedCombinations = []) {
    // Start with an empty combination
    let combinations = [{}];
    
    // For each attribute
    for (const attrId of variantAttributes) {
      const attribute = this.findAttributeById(attrId);
      if (!attribute || !attribute.options) continue;
      
      // Create new combinations with each option of the current attribute
      const newCombinations = [];
      
      for (const combination of combinations) {
        for (const option of attribute.options) {
          newCombinations.push({
            ...combination,
            [attrId]: option.value
          });
        }
      }
      
      combinations = newCombinations;
    }
    
    // Filter out excluded combinations
    if (excludedCombinations.length > 0) {
      combinations = combinations.filter(combination => {
        return !excludedCombinations.some(excluded => {
          return Object.entries(excluded).every(([key, value]) => 
            combination[key] === value
          );
        });
      });
    }
    
    // Filter by dependency rules
    combinations = combinations.filter(combination => 
      this.isValidVariantCombination(combination)
    );
    
    return combinations;
  },
  
  // Create a pricing map for a variant based on pricing rules
  calculateVariantPrice(basePrice, combination, variantPricing) {
    let price = basePrice;
    
    if (!variantPricing) return price;
    
    // Apply price adjustments for each attribute
    for (const [attributeId, values] of Object.entries(variantPricing)) {
      const selectedValue = combination[attributeId];
      
      // Skip if this attribute isn't part of the combination or doesn't have pricing rules
      if (!selectedValue || !values[selectedValue]) continue;
      
      // Apply the price adjustment
      price += values[selectedValue].priceAdjustment || 0;
    }
    
    return price;
  },
  
  // Generate default SKU for a variant based on its attributes
  generateVariantSku(baseCode, combination) {
    let sku = baseCode;
    
    // Add attribute values to SKU
    for (const [attributeId, value] of Object.entries(combination)) {
      const attribute = this.findAttributeById(attributeId);
      if (!attribute) continue;
      
      // Get attribute code and uppercase the value
      const code = attribute.code.toUpperCase();
      const val = String(value).toUpperCase();
      
      sku += `-${val}`;
    }
    
    return sku;
  },
  
  // Check if two attribute combinations can be considered complementary
  areComplementaryAttributes(sourceValue, targetValue, attributeId) {
    // Simple implementation for color complementary relationships
    if (attributeId === 'attr-1') { // Color attribute
      const complementaryPairs = {
        'red': ['green', 'blue'],
        'blue': ['orange', 'yellow'],
        'yellow': ['purple', 'blue'],
        'green': ['red', 'purple'],
        'purple': ['yellow', 'green'],
        'orange': ['blue', 'black'],
        'black': ['white', 'orange'],
        'white': ['black', 'red']
      };
      
      return complementaryPairs[sourceValue]?.includes(targetValue) || false;
    }
    
    // Default to false for other attributes
    return false;
  },
  
  // Find product variants that match a specific attribute value
  findVariantsByAttributeValue(variants, attributeId, value) {
    return variants.filter(variant => 
      variant.attributeValues[attributeId] === value
    );
  },
  
  // Get available attribute options based on already selected attributes
  getAvailableOptions(attributeId, selectedAttributes, allVariants) {
    // Filter variants that match all currently selected attributes
    let matchingVariants = allVariants;
    
    for (const [attrId, value] of Object.entries(selectedAttributes)) {
      // Skip the attribute we're getting options for
      if (attrId === attributeId) continue;
      
      matchingVariants = matchingVariants.filter(variant => 
        variant.attributeValues[attrId] === value
      );
    }
    
    // Extract all possible values for the target attribute from matching variants
    const values = matchingVariants.map(variant => 
      variant.attributeValues[attributeId]
    );
    
    // Get unique values
    const uniqueValues = [...new Set(values)];
    
    // Get full option details
    const attribute = this.findAttributeById(attributeId);
    if (!attribute || !attribute.options) return [];
    
    return attribute.options.filter(option => 
      uniqueValues.includes(option.value)
    );
  }
};

export default {
  ATTRIBUTE_TYPES,
  VALIDATION_TYPES,
  attributesData,
  attributeGroups,
  attributeSets,
  variantMatrices,
  attributeDependencyRules,
  compatibilityMatrix,
  crossSellingRules,
  attributeUtils
};