export interface Personnel {
  id: string;
  badgeNo: string;
  prefix: string;
  firstName: string;
  lastName: string;
  position: string;
  department: string;
  subDepartment: string;
  personnelType?: string;
  phone: string;
  mobile: string;
  email: string;
  status: string;
  avatarColor: string;
  skills: string[];
  education: string;
  experience: string;
  notes: string;
  citizenId: string;
  dateOfBirth: string;
  bloodType: string;
  religion: string;
  officialId: string;
  militaryBranch: string;
  commissionDate: string;
  currentAddress: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  royalDecorations: string;
  trainingHistory: string;
  vehicles?: Vehicle[];
}

export interface Vehicle {
  id: string;
  personnelId: string;
  type: string;
  licensePlate: string;
  brand: string;
  model: string;
  color: string;
  photoFront?: string | null;
  photoBack?: string | null;
  photoSide?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

