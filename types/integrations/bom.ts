
export interface BomState {
  boms: Bom[];
  isLoading: boolean;
  error: string | null;
  useMockData: boolean;
}

export interface BomComponent {
  itemId: string;
  itemName: string;
  sku: string;
  quantity: number;
  unitOfMeasure: string;
  position: string;
  isOptional: boolean;
  notes: string | null;
  substitutes: any[];
}

export interface BomStep {
  stepNumber: number;
  description: string;
  estimatedTime: number;
  instructions: string;
  requiredTools: string[];
  imageUrl: string;
}

export interface QualityCheck {
  checkName: string;
  description: string;
  acceptanceCriteria: string;
}

export interface BomAttachment {
  name: string;
  fileType: string;
  url: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface Bom {
  id: string;
  name: string;
  productId: string;
  productName: string;
  productSku: string;
  description: string;
  version: string;
  status: 'draft' | 'active' | 'archived';
  effectiveDate: string | null;
  expirationDate: string | null;
  batchSize: number;
  notes: string;
  components: BomComponent[];
  steps: BomStep[];
  qualityChecks: QualityCheck[];
  attachments: BomAttachment[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface BomState {
  boms: Bom[];
  isLoading: boolean;
  error: string | null;
  useMockData: boolean;
}
