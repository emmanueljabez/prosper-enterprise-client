/**
 * Mock data for Bills of Materials (BOMs)
 */

/**
 * Mock BOM data
 */
export const mockBoms = [
  {
    id: 'bom-001',
    name: 'Assembly G Manufacturing',
    productId: 'prod-007',
    productName: 'Assembly G',
    productSku: 'INV-007',
    description: 'Complete BOM for Assembly G production',
    version: '1.2',
    status: 'active',
    effectiveDate: '2025-01-15T00:00:00Z',
    expirationDate: null,
    batchSize: 10,
    notes: 'Updated with new component specifications',
    components: [
      {
        itemId: 'item-002',
        itemName: 'Gadget B',
        sku: 'INV-002',
        quantity: 2,
        unitOfMeasure: 'each',
        position: 'A1',
        isOptional: false,
        notes: 'Must use latest revision',
        substitutes: []
      },
      {
        itemId: 'item-003',
        itemName: 'Component C',
        sku: 'INV-003',
        quantity: 5,
        unitOfMeasure: 'each',
        position: 'B2',
        isOptional: false,
        notes: null,
        substitutes: []
      },
      {
        itemId: 'item-005',
        itemName: 'Material E',
        sku: 'INV-005',
        quantity: 0.5,
        unitOfMeasure: 'kg',
        position: 'C3',
        isOptional: false,
        notes: 'Apply evenly during assembly',
        substitutes: []
      }
    ],
    steps: [
      {
        stepNumber: 1,
        description: 'Prepare Gadget B components',
        estimatedTime: 15, // minutes
        instructions: 'Inspect Gadget B components for any defects before assembly',
        requiredTools: ['Precision screwdriver set', 'Calibration tools'],
        imageUrl: '/images/assembly-g-step1.jpg'
      },
      {
        stepNumber: 2,
        description: 'Assemble Component C modules',
        estimatedTime: 20,
        instructions: 'Connect all 5 Component C modules using the provided diagram',
        requiredTools: ['Soldering iron', 'Heat gun'],
        imageUrl: '/images/assembly-g-step2.jpg'
      },
      {
        stepNumber: 3,
        description: 'Apply Material E and finalize assembly',
        estimatedTime: 25,
        instructions: 'Apply Material E evenly across the assembly points and secure all components',
        requiredTools: ['Application brush', 'Clamps'],
        imageUrl: '/images/assembly-g-step3.jpg'
      }
    ],
    qualityChecks: [
      {
        checkName: 'Electrical continuity test',
        description: 'Verify electrical connections between all components',
        acceptanceCriteria: 'No resistance greater than 0.1 ohms'
      },
      {
        checkName: 'Visual inspection',
        description: 'Check for proper alignment and seating of all components',
        acceptanceCriteria: 'No visible gaps or misalignments'
      },
      {
        checkName: 'Functional test',
        description: 'Test all mechanical functions of the assembly',
        acceptanceCriteria: 'Smooth operation with no binding or noise'
      }
    ],
    attachments: [
      {
        name: 'Assembly G Schematic',
        fileType: 'pdf',
        url: '/documents/assembly-g-schematic.pdf',
        uploadedBy: 'user-001',
        uploadedAt: '2025-01-10T13:25:00Z'
      },
      {
        name: 'Quality Assurance Protocol',
        fileType: 'pdf',
        url: '/documents/assembly-g-qa-protocol.pdf',
        uploadedBy: 'user-002',
        uploadedAt: '2025-01-12T09:40:00Z'
      }
    ],
    createdAt: '2025-01-01T09:00:00Z',
    updatedAt: '2025-01-15T14:30:00Z',
    createdBy: 'user-001',
    updatedBy: 'user-002'
  },
  {
    id: 'bom-002',
    name: 'Widget A Standard Assembly',
    productId: 'prod-001',
    productName: 'Widget A',
    productSku: 'INV-001',
    description: 'Standard BOM for Widget A manufacturing',
    version: '2.0',
    status: 'active',
    effectiveDate: '2024-11-01T00:00:00Z',
    expirationDate: null,
    batchSize: 50,
    notes: 'High volume production configuration',
    components: [
      {
        itemId: 'item-003',
        itemName: 'Component C',
        sku: 'INV-003',
        quantity: 3,
        unitOfMeasure: 'each',
        position: 'A1',
        isOptional: false,
        notes: null,
        substitutes: []
      },
      {
        itemId: 'item-005',
        itemName: 'Material E',
        sku: 'INV-005',
        quantity: 0.2,
        unitOfMeasure: 'kg',
        position: 'B1',
        isOptional: false,
        notes: 'Required for adhesion',
        substitutes: []
      }
    ],
    steps: [
      {
        stepNumber: 1,
        description: 'Prepare base components',
        estimatedTime: 10,
        instructions: 'Arrange Component C modules in triangle formation',
        requiredTools: ['Assembly jig A'],
        imageUrl: '/images/widget-a-step1.jpg'
      },
      {
        stepNumber: 2,
        description: 'Apply adhesive material',
        estimatedTime: 5,
        instructions: 'Apply Material E to connection points',
        requiredTools: ['Adhesive applicator'],
        imageUrl: '/images/widget-a-step2.jpg'
      },
      {
        stepNumber: 3,
        description: 'Complete assembly',
        estimatedTime: 10,
        instructions: 'Press components together and allow to cure for 30 minutes',
        requiredTools: ['Hydraulic press'],
        imageUrl: '/images/widget-a-step3.jpg'
      }
    ],
    qualityChecks: [
      {
        checkName: 'Pressure test',
        description: 'Verify integrity under pressure',
        acceptanceCriteria: 'No deformation at 50 PSI'
      },
      {
        checkName: 'Dimensional check',
        description: 'Measure final dimensions',
        acceptanceCriteria: 'Within 0.5mm of specification'
      }
    ],
    attachments: [
      {
        name: 'Widget A Specifications',
        fileType: 'pdf',
        url: '/documents/widget-a-specs.pdf',
        uploadedBy: 'user-001',
        uploadedAt: '2024-10-20T10:15:00Z'
      }
    ],
    createdAt: '2024-10-15T13:20:00Z',
    updatedAt: '2024-10-28T16:45:00Z',
    createdBy: 'user-002',
    updatedBy: 'user-002'
  },
  {
    id: 'bom-003',
    name: 'Tool Set D Manufacturing',
    productId: 'prod-004',
    productName: 'Tool Set D',
    productSku: 'INV-004',
    description: 'BOM for professional tool set assembly',
    version: '1.0',
    status: 'draft',
    effectiveDate: null,
    expirationDate: null,
    batchSize: 5,
    notes: 'Pending approval from quality department',
    components: [
      {
        itemId: 'item-002',
        itemName: 'Gadget B',
        sku: 'INV-002',
        quantity: 1,
        unitOfMeasure: 'each',
        position: 'A1',
        isOptional: false,
        notes: null,
        substitutes: []
      },
      {
        itemId: 'item-003',
        itemName: 'Component C',
        sku: 'INV-003',
        quantity: 10,
        unitOfMeasure: 'each',
        position: 'B1-B10',
        isOptional: false,
        notes: 'Arrange in carrying case',
        substitutes: []
      },
      {
        itemId: 'item-009',
        itemName: 'Shipping Boxes (Medium)',
        sku: 'PKG-001',
        quantity: 1,
        unitOfMeasure: 'each',
        position: 'P1',
        isOptional: false,
        notes: 'For carrying case',
        substitutes: []
      }
    ],
    steps: [
      {
        stepNumber: 1,
        description: 'Prepare carrying case',
        estimatedTime: 5,
        instructions: 'Set up the carrying case with foam inserts',
        requiredTools: ['Utility knife'],
        imageUrl: '/images/toolset-d-step1.jpg'
      },
      {
        stepNumber: 2,
        description: 'Arrange components',
        estimatedTime: 15,
        instructions: 'Place all components in designated positions',
        requiredTools: [],
        imageUrl: '/images/toolset-d-step2.jpg'
      },
      {
        stepNumber: 3,
        description: 'Quality check and packaging',
        estimatedTime: 10,
        instructions: 'Inspect arrangement and seal case',
        requiredTools: ['Inspection checklist'],
        imageUrl: '/images/toolset-d-step3.jpg'
      }
    ],
    qualityChecks: [
      {
        checkName: 'Component count verification',
        description: 'Ensure all components are present',
        acceptanceCriteria: 'All items accounted for'
      },
      {
        checkName: 'Case closure test',
        description: 'Check that case closes properly with all components',
        acceptanceCriteria: 'Case closes and latches securely'
      }
    ],
    attachments: [],
    createdAt: '2025-03-10T09:45:00Z',
    updatedAt: '2025-03-10T09:45:00Z',
    createdBy: 'user-003',
    updatedBy: 'user-003'
  },
  {
    id: 'bom-004',
    name: 'Product F Assembly',
    productId: 'prod-006',
    productName: 'Product F',
    productSku: 'INV-006',
    description: 'Manufacturing process for Product F',
    version: '3.1',
    status: 'active',
    effectiveDate: '2024-12-01T00:00:00Z',
    expirationDate: null,
    batchSize: 25,
    notes: 'Updated with improved process flow',
    components: [
      {
        itemId: 'item-001',
        itemName: 'Widget A',
        sku: 'INV-001',
        quantity: 2,
        unitOfMeasure: 'each',
        position: 'A1-A2',
        isOptional: false,
        notes: null,
        substitutes: []
      },
      {
        itemId: 'item-002',
        itemName: 'Gadget B',
        sku: 'INV-002',
        quantity: 1,
        unitOfMeasure: 'each',
        position: 'B1',
        isOptional: false,
        notes: null,
        substitutes: []
      },
      {
        itemId: 'item-005',
        itemName: 'Material E',
        sku: 'INV-005',
        quantity: 0.8,
        unitOfMeasure: 'kg',
        position: 'C1',
        isOptional: false,
        notes: 'Applied during phase 2 of assembly',
        substitutes: []
      }
    ],
    steps: [
      {
        stepNumber: 1,
        description: 'Initial assembly',
        estimatedTime: 20,
        instructions: 'Connect Widget A components to base frame',
        requiredTools: ['Torque wrench', 'Assembly jig B'],
        imageUrl: '/images/product-f-step1.jpg'
      },
      {
        stepNumber: 2,
        description: 'Install Gadget B',
        estimatedTime: 15,
        instructions: 'Mount Gadget B to the primary connection point',
        requiredTools: ['Precision screwdriver'],
        imageUrl: '/images/product-f-step2.jpg'
      },
      {
        stepNumber: 3,
        description: 'Apply Material E',
        estimatedTime: 10,
        instructions: 'Apply Material E to all sealed joints',
        requiredTools: ['Application gun'],
        imageUrl: '/images/product-f-step3.jpg'
      },
      {
        stepNumber: 4,
        description: 'Final assembly and testing',
        estimatedTime: 25,
        instructions: 'Complete assembly and perform initial function tests',
        requiredTools: ['Test equipment alpha'],
        imageUrl: '/images/product-f-step4.jpg'
      }
    ],
    qualityChecks: [
      {
        checkName: 'Pressure integrity test',
        description: 'Test sealed joints for leakage',
        acceptanceCriteria: 'No leakage at 75 PSI for 5 minutes'
      },
      {
        checkName: 'Functional verification',
        description: 'Operate all moving components',
        acceptanceCriteria: 'Smooth operation through full range of motion'
      },
      {
        checkName: 'Finish inspection',
        description: 'Check external finish for defects',
        acceptanceCriteria: 'No visible scratches, dents, or material inconsistencies'
      }
    ],
    attachments: [
      {
        name: 'Product F Engineering Drawings',
        fileType: 'pdf',
        url: '/documents/product-f-drawings.pdf',
        uploadedBy: 'user-002',
        uploadedAt: '2024-11-15T13:20:00Z'
      },
      {
        name: 'Assembly Process Documentation',
        fileType: 'pdf',
        url: '/documents/product-f-assembly-process.pdf',
        uploadedBy: 'user-002',
        uploadedAt: '2024-11-20T09:15:00Z'
      }
    ],
    createdAt: '2024-11-10T08:30:00Z',
    updatedAt: '2024-12-05T14:15:00Z',
    createdBy: 'user-001',
    updatedBy: 'user-002'
  },
  {
    id: 'bom-005',
    name: 'Component C Production',
    productId: 'prod-003',
    productName: 'Component C',
    productSku: 'INV-003',
    description: 'BOM for Component C manufacturing',
    version: '1.5',
    status: 'archived',
    effectiveDate: '2024-06-01T00:00:00Z',
    expirationDate: '2024-12-31T23:59:59Z',
    batchSize: 100,
    notes: 'Replaced by improved manufacturing process (BOM-008)',
    components: [
      {
        itemId: 'item-005',
        itemName: 'Material E',
        sku: 'INV-005',
        quantity: 0.05,
        unitOfMeasure: 'kg',
        position: 'A1',
        isOptional: false,
        notes: null,
        substitutes: []
      }
    ],
    steps: [
      {
        stepNumber: 1,
        description: 'Material preparation',
        estimatedTime: 5,
        instructions: 'Prepare Material E for molding process',
        requiredTools: ['Measuring scale'],
        imageUrl: '/images/component-c-step1.jpg'
      },
      {
        stepNumber: 2,
        description: 'Molding process',
        estimatedTime: 10,
        instructions: 'Place material in mold and process',
        requiredTools: ['Mold C-101', 'Heat press'],
        imageUrl: '/images/component-c-step2.jpg'
      },
      {
        stepNumber: 3,
        description: 'Quality control',
        estimatedTime: 5,
        instructions: 'Inspect finished components',
        requiredTools: ['Caliper', 'Inspection light'],
        imageUrl: '/images/component-c-step3.jpg'
      }
    ],
    qualityChecks: [
      {
        checkName: 'Dimensional check',
        description: 'Verify critical dimensions',
        acceptanceCriteria: 'Within ±0.1mm of specification'
      },
      {
        checkName: 'Surface inspection',
        description: 'Check for surface defects',
        acceptanceCriteria: 'No visible voids, cracks, or imperfections'
      }
    ],
    attachments: [],
    createdAt: '2024-05-15T10:20:00Z',
    updatedAt: '2024-12-15T16:30:00Z',
    createdBy: 'user-002',
    updatedBy: 'user-001'
  }
];


export default {
  mockBoms,
};