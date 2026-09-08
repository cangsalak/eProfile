/**
 * TypeScript definitions for แบบฟอร์ม รปภ. ๑ (แบบรายงานประวัติบุคคล)
 * ตามระเบียบสำนักนายกรัฐมนตรี ว่าด้วยการรักษาความปลอดภัยแห่งชาติ พ.ศ. ๒๕๕๒ และกรมข่าวทหารอากาศ
 */

export interface Address15YearItem {
  fromYear: string;
  toYear: string;
  houseNo: string;
  soi: string;
  road: string;
  subdistrict: string;
  district: string;
  province: string;
  country: string;
}

export interface EducationItem {
  fromYear: string;
  toYear: string;
  schoolName: string;
  degree: string;
  major: string;
  gpa: string;
}

export interface SpecialActivityItem {
  fromYear: string;
  toYear: string;
  schoolName: string;
  positionRole: string;
}

export interface LanguageItem {
  language: string;
  readLevel: 'ดีมาก' | 'ดี' | 'พอใช้' | '';
  listenLevel: 'ดีมาก' | 'ดี' | 'พอใช้' | '';
  writeLevel: 'ดีมาก' | 'ดี' | 'พอใช้' | '';
  speakLevel: 'ดีมาก' | 'ดี' | 'พอใช้' | '';
}

export interface WorkHistoryItem {
  fromYear: string;
  toYear: string;
  employerOrAgency: string;
  position: string;
  reasonForLeaving: string;
  locationPhone: string;
}

export interface OrganizationMembershipItem {
  fromYear: string;
  toYear: string;
  organizationName: string;
  location: string;
  memberNo: string;
}

export interface ForeignTravelItem {
  fromYear: string;
  toYear: string;
  cityCountry: string;
  purposeAndSponsorship: string;
}

export interface IdentificationDocItem {
  docType: string;
  docNumber: string;
  issuedAt: string;
  issueAndExpiryDate: string;
}

export interface LegalCaseItem {
  date: string;
  crimeScene: string;
  charge: string;
  caseResult: string;
}

export interface ParentDetails {
  titleName: string;
  dob: string;
  birthPlace: string;
  citizenId: string;
  race: string;
  religion: string;
  nationalityOriginal: string;
  nationalityCurrent: string;
  addressPhone: string;
  occupation: string;
  workplacePhone: string;
}

export interface SpouseDetails {
  titleNameOriginal: string;
  dob: string;
  birthPlace: string;
  race: string;
  religion: string;
  nationalityOriginal: string;
  nationalityCurrent: string;
  occupation: string;
  workplacePhone: string;
  marriageDate: string;
  marriagePlace: string;
  currentAddressPhone: string;
  divorceDate?: string;
  divorcePlace?: string;
  divorceReason?: string;
  lastAddress?: string;
}

export interface ChildItem {
  order: number;
  titleName: string;
  dob: string;
  race: string;
  nationality: string;
  religion: string;
  currentAddress: string;
  occupation: string;
  schoolWorkplace: string;
  phone: string;
}

export interface SiblingItem {
  order: number;
  titleName: string;
  dob: string;
  race: string;
  nationality: string;
  religion: string;
  citizenId: string;
  currentAddress: string;
  occupation: string;
  schoolWorkplace: string;
  phone: string;
  spouseNameOriginal: string;
  spouseRaceNationalityReligion: string;
  spouseOccupation: string;
  spouseSchoolWorkplace: string;
  spousePhone: string;
}

export interface RelativeInGovItem {
  order: number;
  titleName: string;
  relation: string;
  raceNationalityReligion: string;
  occupation: string;
  workplacePhone: string;
  currentAddressPhone: string;
}

export interface OverseasContactItem {
  order: number;
  titleName: string;
  relation: string;
  raceNationalityReligion: string;
  occupation: string;
  schoolWorkplace: string;
  currentAddress: string;
  reasonLivingAbroad: string;
}

export interface CohabitantItem {
  order: number;
  titleName: string;
  relation: string;
}

export interface CloseFriendItem {
  titleName: string;
  yearsKnown: string;
  raceNationalityReligion: string;
  addressPhone: string;
  workplacePhone: string;
}

export interface SupporterItem {
  titleName: string;
  raceNationalityReligion: string;
  addressPhone: string;
  workplacePhone: string;
}

export interface Rpb1FormData {
  id?: string;
  personnelId: string;
  status: string;
  version: number;
  classification: string;
  photoUrl?: string | null;
  photoTakenDate?: string;
  // Page 1 (Sections 1-7)
  titleRank: string;
  firstName: string;
  middleName: string;
  lastName: string;
  gender: string;
  age: number | '';
  formerFirstName: string;
  nameChangeDoc: string;
  formerLastName: string;
  lastNameChangeDoc: string;
  nickname: string;
  citizenId: string;
  dateOfBirth: string;
  birthPlaceHospital: string;
  race: string;
  nationality: string;
  formerNationality: string;
  naturalizationDoc: string;
  religion: string;
  formerReligion: string;
  // Registered address
  registeredHouseNo: string;
  registeredVillage: string;
  registeredMoo: string;
  registeredSoi: string;
  registeredRoad: string;
  registeredSubdistrict: string;
  registeredDistrict: string;
  registeredProvince: string;
  registeredPhone: string;
  // Current address
  currentHouseNo: string;
  currentVillage: string;
  currentMoo: string;
  currentSoi: string;
  currentRoad: string;
  currentSubdistrict: string;
  currentDistrict: string;
  currentProvince: string;
  currentPhone: string;
  // Contacts
  phoneLandline: string;
  phoneMobile: string;
  email: string;
  lineId: string;
  facebook: string;
  instagram: string;
  otherContact: string;
  // Aliens
  alienCardNo: string;
  alienCardDate: string;
  alienCardIssuedAt: string;
  alienCardDistrict?: string;
  alienCardProvince?: string;
  alienResidenceDocNo: string;
  alienResidenceDocDate: string;
  alienResidenceIssuedAt: string;
  alienResidenceDistrict?: string;
  alienResidenceProvince?: string;
  alienIdInThailand: string;
  birthCountry: string;
  entryDateToThailand: string;
  workPermitNo: string;
  workPermitIssuedBy: string;
  workPermitIssueDate: string;
  workPermitExpiryDate: string;

  // Page 2 (Sections 8-11)
  height: number | '';
  weight: number | '';
  scarsDistinguishingMarks: string;
  bloodGroup: string;
  addressesPast15Years: Address15YearItem[];
  educations: EducationItem[];
  specialActivities: SpecialActivityItem[];

  // Page 3 (Sections 12-15)
  languages: LanguageItem[];
  workHistory: WorkHistoryItem[];
  specialOccupationsHobbies: string;
  militaryStatus: string;
  militaryRank: string;
  militaryRegNumber: string;
  militaryBranchUnit: string;
  militaryUnitLocation: string;
  militaryServiceFrom: string;
  militaryServiceTo: string;
  militaryYearsServed: string;
  militaryDischargeReason: string;
  militaryLastCommander: string;
  militarySpecialOperations: string;
  militarySpecialOpDate: string;
  militarySpecialOpDuration: string;
  militaryExemptionReason: string;

  // Page 4 (Sections 16-18)
  writerDetails: string;
  politicalSocialMemberships: OrganizationMembershipItem[];
  foreignTravels: ForeignTravelItem[];

  // Page 5 (Sections 19-21)
  identificationDocuments: IdentificationDocItem[];
  legalCases: LegalCaseItem[];
  disciplinaryPunishments: string;
  fatherDetails: ParentDetails;
  motherDetails: ParentDetails;

  // Page 6 (Sections 22-23)
  maritalStatus: 'โสด' | 'หมั้น' | 'สมรส' | 'หม้าย' | 'แยกกันอยู่' | 'หย่า' | '';
  spouseFormerDetails: SpouseDetails;
  spouseCurrentDetails: SpouseDetails;
  children: ChildItem[];

  // Page 7 (Sections 24-26)
  siblings: SiblingItem[];
  relativesInGovernment: RelativeInGovItem[];
  overseasContacts: OverseasContactItem[];

  // Page 8 (Sections 27-30)
  cohabitants: CohabitantItem[];
  closeFriendsRef: CloseFriendItem[];
  supporters: SupporterItem[];
  additionalExplanations: string;
  ownerSignatureDate: string;
  inspectorRankName: string;
  inspectorPosition: string;
  inspectorSignatureDate: string;

  // Page 9 (Map & Emergency Contact)
  sketchMapImage: string;
  mapHouseNo: string;
  mapVillage: string;
  mapMoo: string;
  mapSoi: string;
  mapRoad: string;
  mapSubdistrict: string;
  mapDistrict: string;
  mapProvince: string;
  mapPhone: string;
  mapHouseOwnerName: string;
  mapHouseOwnerPhone: string;
  emergencyContactRankName: string;
  emergencyContactRelation: string;
  emergencyContactAddress: string;

  // Page 10 (Additional Record)
  extraTitleName: string;
  extraGender: string;
  extraBloodGroup: string;
  extraRegisteredAddress: string;
  extraCurrentAddress: string;
  extraIsSameAddress: boolean;
  extraMobilePhone: string;
  extraHomePhone: string;
  extraOfficePhone: string;
  extraEmail: string;
  extraOwnerSignatureDate: string;
  extraOfficerName: string;
  extraOfficerPosition: string;
  extraOfficerSignatureDate: string;
}

export const INITIAL_RPB1_FORM_DATA: Rpb1FormData = {
  personnelId: '',
  status: 'DRAFT',
  version: 1,
  classification: 'ลับ',
  photoUrl: '',
  photoTakenDate: '',

  // Page 1
  titleRank: '',
  firstName: '',
  middleName: '',
  lastName: '',
  gender: '',
  age: '',
  formerFirstName: '',
  nameChangeDoc: '',
  formerLastName: '',
  lastNameChangeDoc: '',
  nickname: '',
  citizenId: '',
  dateOfBirth: '',
  birthPlaceHospital: '',
  race: 'ไทย',
  nationality: 'ไทย',
  formerNationality: '',
  naturalizationDoc: '',
  religion: 'พุทธ',
  formerReligion: '',
  registeredHouseNo: '',
  registeredVillage: '',
  registeredMoo: '',
  registeredSoi: '',
  registeredRoad: '',
  registeredSubdistrict: '',
  registeredDistrict: '',
  registeredProvince: '',
  registeredPhone: '',
  currentHouseNo: '',
  currentVillage: '',
  currentMoo: '',
  currentSoi: '',
  currentRoad: '',
  currentSubdistrict: '',
  currentDistrict: '',
  currentProvince: '',
  currentPhone: '',
  phoneLandline: '',
  phoneMobile: '',
  email: '',
  lineId: '',
  facebook: '',
  instagram: '',
  otherContact: '',
  alienCardNo: '',
  alienCardDate: '',
  alienCardIssuedAt: '',
  alienCardDistrict: '',
  alienCardProvince: '',
  alienResidenceDocNo: '',
  alienResidenceDocDate: '',
  alienResidenceIssuedAt: '',
  alienResidenceDistrict: '',
  alienResidenceProvince: '',
  alienIdInThailand: '',
  birthCountry: '',
  entryDateToThailand: '',
  workPermitNo: '',
  workPermitIssuedBy: '',
  workPermitIssueDate: '',
  workPermitExpiryDate: '',

  // Page 2
  height: '',
  weight: '',
  scarsDistinguishingMarks: '',
  bloodGroup: '',
  addressesPast15Years: [],
  educations: [],
  specialActivities: [],

  // Page 3
  languages: [
    { language: 'ภาษาไทย', readLevel: 'ดีมาก', listenLevel: 'ดีมาก', writeLevel: 'ดีมาก', speakLevel: 'ดีมาก' },
    { language: 'ภาษาอังกฤษ', readLevel: '', listenLevel: '', writeLevel: '', speakLevel: '' },
  ],
  workHistory: [],
  specialOccupationsHobbies: '',
  militaryStatus: 'ทหารประจำการ',
  militaryRank: '',
  militaryRegNumber: '',
  militaryBranchUnit: '',
  militaryUnitLocation: '',
  militaryServiceFrom: '',
  militaryServiceTo: '',
  militaryYearsServed: '',
  militaryDischargeReason: '',
  militaryLastCommander: '',
  militarySpecialOperations: '',
  militarySpecialOpDate: '',
  militarySpecialOpDuration: '',
  militaryExemptionReason: '',

  // Page 4
  writerDetails: '',
  politicalSocialMemberships: [],
  foreignTravels: [],

  // Page 5
  identificationDocuments: [],
  legalCases: [],
  disciplinaryPunishments: '',
  fatherDetails: {
    titleName: '',
    dob: '',
    birthPlace: '',
    citizenId: '',
    race: 'ไทย',
    religion: 'พุทธ',
    nationalityOriginal: 'ไทย',
    nationalityCurrent: 'ไทย',
    addressPhone: '',
    occupation: '',
    workplacePhone: '',
  },
  motherDetails: {
    titleName: '',
    dob: '',
    birthPlace: '',
    citizenId: '',
    race: 'ไทย',
    religion: 'พุทธ',
    nationalityOriginal: 'ไทย',
    nationalityCurrent: 'ไทย',
    addressPhone: '',
    occupation: '',
    workplacePhone: '',
  },

  // Page 6
  maritalStatus: 'โสด',
  spouseFormerDetails: {
    titleNameOriginal: '',
    dob: '',
    birthPlace: '',
    race: 'ไทย',
    religion: 'พุทธ',
    nationalityOriginal: 'ไทย',
    nationalityCurrent: 'ไทย',
    occupation: '',
    workplacePhone: '',
    marriageDate: '',
    marriagePlace: '',
    currentAddressPhone: '',
    divorceDate: '',
    divorcePlace: '',
    divorceReason: '',
    lastAddress: '',
  },
  spouseCurrentDetails: {
    titleNameOriginal: '',
    dob: '',
    birthPlace: '',
    race: 'ไทย',
    religion: 'พุทธ',
    nationalityOriginal: 'ไทย',
    nationalityCurrent: 'ไทย',
    occupation: '',
    workplacePhone: '',
    marriageDate: '',
    marriagePlace: '',
    currentAddressPhone: '',
  },
  children: [],

  // Page 7
  siblings: [],
  relativesInGovernment: [],
  overseasContacts: [],

  // Page 8
  cohabitants: [],
  closeFriendsRef: [],
  supporters: [],
  additionalExplanations: '',
  ownerSignatureDate: '',
  inspectorRankName: '',
  inspectorPosition: '',
  inspectorSignatureDate: '',

  // Page 9
  sketchMapImage: '',
  mapHouseNo: '',
  mapVillage: '',
  mapMoo: '',
  mapSoi: '',
  mapRoad: '',
  mapSubdistrict: '',
  mapDistrict: '',
  mapProvince: '',
  mapPhone: '',
  mapHouseOwnerName: '',
  mapHouseOwnerPhone: '',
  emergencyContactRankName: '',
  emergencyContactRelation: '',
  emergencyContactAddress: '',

  // Page 10
  extraTitleName: '',
  extraGender: '',
  extraBloodGroup: '',
  extraRegisteredAddress: '',
  extraCurrentAddress: '',
  extraIsSameAddress: true,
  extraMobilePhone: '',
  extraHomePhone: '',
  extraOfficePhone: '',
  extraEmail: '',
  extraOwnerSignatureDate: '',
  extraOfficerName: '',
  extraOfficerPosition: '',
  extraOfficerSignatureDate: '',
};
