export interface Category {
  id: string;
  name: string;
}

export interface Material {
  id: string;
  name: string;
  categoryId: string;
  totalQuantity: number;
  optionalBarcode?: string;
  optionalImageUrl?: string;
  notes?: string;
  createdAt: string;
}

export interface Loan {
  id: string;
  materialId: string;
  materialName: string;
  categoryName: string;
  borrowerName: string;
  borrowerTeam: string;
  quantity: number;
  borrowedAtDate: string; // e.g., DD-MM-YYYY
  borrowedAtTime: string; // e.g., HH:MM
  status: "uitgeleend" | "teruggebracht";
  returnedAt?: string; // Date string
}

export type Role = "admin" | "uitlener" | null;
