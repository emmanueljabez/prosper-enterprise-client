export interface SupplierAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Supplier {
  id: string;
  name: string;
  code: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: SupplierAddress;
  paymentTerms: string;
  currency: string;
  accountNumber: string;
  taxId: string;
  minOrderValue: number;
  leadTime: number;
  status: 'active' | 'inactive';
  notes: string;
  rating: number; // 1-5 scale
  categories: string[];
  primaryCategory: string;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierFilters {
  status?: string;
  category?: string;
  minRating?: number;
  search?: string;
}

export interface SupplierState {
  suppliers: Supplier[];
  isLoading: boolean;
  error: string | null;
  useMockData: boolean;
}