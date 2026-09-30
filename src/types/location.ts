export interface LocationData {
  address: string;
  lat: number;
  lng: number;
  road?: string;
  suburb?: string;
  city?: string;
  state?: string;
  postcode?: string;
}

export interface SavedAddress {
  id: string;
  type: 'Home' | 'Work' | 'Other';
  customType?: string;
  fullName: string;
  phone: string;
  altPhone?: string;
  houseFlat: string;
  street: string;
  locality: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
  address: string;
  lat?: number;
  lng?: number;
}
