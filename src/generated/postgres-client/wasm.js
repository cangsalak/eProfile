
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.PersonnelScalarFieldEnum = {
  id: 'id',
  badgeNo: 'badgeNo',
  username: 'username',
  password: 'password',
  role: 'role',
  prefix: 'prefix',
  firstName: 'firstName',
  lastName: 'lastName',
  position: 'position',
  department: 'department',
  subDepartment: 'subDepartment',
  personnelType: 'personnelType',
  phone: 'phone',
  mobile: 'mobile',
  email: 'email',
  status: 'status',
  avatarColor: 'avatarColor',
  skills: 'skills',
  education: 'education',
  experience: 'experience',
  notes: 'notes',
  citizenId: 'citizenId',
  dateOfBirth: 'dateOfBirth',
  bloodType: 'bloodType',
  religion: 'religion',
  officialId: 'officialId',
  militaryBranch: 'militaryBranch',
  commissionDate: 'commissionDate',
  currentAddress: 'currentAddress',
  currentTambon: 'currentTambon',
  currentAmphoe: 'currentAmphoe',
  currentProvince: 'currentProvince',
  currentZipcode: 'currentZipcode',
  emergencyContactName: 'emergencyContactName',
  emergencyContactPhone: 'emergencyContactPhone',
  emergencyContactRelation: 'emergencyContactRelation',
  royalDecorations: 'royalDecorations',
  trainingHistory: 'trainingHistory',
  coverPhoto: 'coverPhoto',
  profileTheme: 'profileTheme',
  mustChangePassword: 'mustChangePassword',
  failedLoginAttempts: 'failedLoginAttempts',
  lockedUntil: 'lockedUntil',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.VehicleScalarFieldEnum = {
  id: 'id',
  personnelId: 'personnelId',
  type: 'type',
  licensePlate: 'licensePlate',
  brand: 'brand',
  model: 'model',
  color: 'color',
  photoFront: 'photoFront',
  photoBack: 'photoBack',
  photoSide: 'photoSide',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.LeaveRecordScalarFieldEnum = {
  id: 'id',
  personnelId: 'personnelId',
  leaveType: 'leaveType',
  startDate: 'startDate',
  endDate: 'endDate',
  reason: 'reason',
  writtenAt: 'writtenAt',
  toPerson: 'toPerson',
  contactAddress: 'contactAddress',
  contactTambon: 'contactTambon',
  contactAmphoe: 'contactAmphoe',
  contactProvince: 'contactProvince',
  status: 'status',
  approvedById: 'approvedById',
  approvedAt: 'approvedAt',
  rejectionReason: 'rejectionReason',
  approvalNote: 'approvalNote',
  substitutePerson: 'substitutePerson',
  accumulatedLeaveDays: 'accumulatedLeaveDays',
  thisYearLeaveDays: 'thisYearLeaveDays',
  totalLeaveDays: 'totalLeaveDays',
  ordainedBefore: 'ordainedBefore',
  ordainTempleName: 'ordainTempleName',
  ordainTempleLocation: 'ordainTempleLocation',
  ordainDate: 'ordainDate',
  stayTempleName: 'stayTempleName',
  stayTempleLocation: 'stayTempleLocation',
  maternityLeaveTimes: 'maternityLeaveTimes',
  maternityLeaveDays: 'maternityLeaveDays',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.DepartmentScalarFieldEnum = {
  id: 'id',
  name: 'name',
  shortName: 'shortName',
  subDepartments: 'subDepartments',
  sortOrder: 'sortOrder',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SystemSettingScalarFieldEnum = {
  id: 'id',
  key: 'key',
  value: 'value'
};

exports.Prisma.CalendarEventScalarFieldEnum = {
  id: 'id',
  title: 'title',
  description: 'description',
  startDate: 'startDate',
  endDate: 'endDate',
  type: 'type',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.NotificationScalarFieldEnum = {
  id: 'id',
  personnelId: 'personnelId',
  title: 'title',
  message: 'message',
  type: 'type',
  isRead: 'isRead',
  link: 'link',
  createdAt: 'createdAt'
};

exports.Prisma.NotificationReadScalarFieldEnum = {
  id: 'id',
  notificationId: 'notificationId',
  personnelId: 'personnelId',
  readAt: 'readAt'
};

exports.Prisma.PostScalarFieldEnum = {
  id: 'id',
  title: 'title',
  content: 'content',
  category: 'category',
  image: 'image',
  published: 'published',
  authorId: 'authorId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ContactMessageScalarFieldEnum = {
  id: 'id',
  name: 'name',
  email: 'email',
  phone: 'phone',
  message: 'message',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AuditLogScalarFieldEnum = {
  id: 'id',
  personnelId: 'personnelId',
  action: 'action',
  entity: 'entity',
  entityId: 'entityId',
  details: 'details',
  ipAddress: 'ipAddress',
  createdAt: 'createdAt'
};

exports.Prisma.MediaFileScalarFieldEnum = {
  id: 'id',
  filename: 'filename',
  url: 'url',
  size: 'size',
  mimetype: 'mimetype',
  uploadedById: 'uploadedById',
  createdAt: 'createdAt'
};

exports.Prisma.PasswordResetTokenScalarFieldEnum = {
  id: 'id',
  personnelId: 'personnelId',
  token: 'token',
  expiresAt: 'expiresAt',
  createdAt: 'createdAt'
};

exports.Prisma.ServiceScalarFieldEnum = {
  id: 'id',
  title: 'title',
  description: 'description',
  price: 'price',
  image: 'image',
  icon: 'icon',
  published: 'published',
  order: 'order',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SystemRoleScalarFieldEnum = {
  id: 'id',
  name: 'name',
  displayName: 'displayName',
  description: 'description',
  permissions: 'permissions',
  isSystem: 'isSystem',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PersonnelDocumentScalarFieldEnum = {
  id: 'id',
  personnelId: 'personnelId',
  category: 'category',
  filename: 'filename',
  mimeType: 'mimeType',
  size: 'size',
  storagePath: 'storagePath',
  uploadedBy: 'uploadedBy',
  notes: 'notes',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  expiresAt: 'expiresAt'
};

exports.Prisma.InspectionScalarFieldEnum = {
  id: 'id',
  page: 'page',
  url: 'url',
  scanMode: 'scanMode',
  userId: 'userId',
  startedAt: 'startedAt',
  completedAt: 'completedAt',
  durationMs: 'durationMs',
  status: 'status',
  overallResult: 'overallResult',
  criticalCount: 'criticalCount',
  highCount: 'highCount',
  mediumCount: 'mediumCount',
  lowCount: 'lowCount',
  infoCount: 'infoCount',
  totalFindings: 'totalFindings',
  createdAt: 'createdAt'
};

exports.Prisma.InspectionFindingScalarFieldEnum = {
  id: 'id',
  inspectionId: 'inspectionId',
  findingCode: 'findingCode',
  category: 'category',
  severity: 'severity',
  title: 'title',
  description: 'description',
  expected: 'expected',
  actual: 'actual',
  element: 'element',
  selector: 'selector',
  recommendation: 'recommendation',
  status: 'status',
  notes: 'notes',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.Rpb1RecordScalarFieldEnum = {
  id: 'id',
  personnelId: 'personnelId',
  status: 'status',
  version: 'version',
  classification: 'classification',
  photoUrl: 'photoUrl',
  titleRank: 'titleRank',
  firstName: 'firstName',
  middleName: 'middleName',
  lastName: 'lastName',
  gender: 'gender',
  age: 'age',
  formerFirstName: 'formerFirstName',
  nameChangeDoc: 'nameChangeDoc',
  formerLastName: 'formerLastName',
  lastNameChangeDoc: 'lastNameChangeDoc',
  nickname: 'nickname',
  citizenId: 'citizenId',
  dateOfBirth: 'dateOfBirth',
  birthPlaceHospital: 'birthPlaceHospital',
  race: 'race',
  nationality: 'nationality',
  formerNationality: 'formerNationality',
  naturalizationDoc: 'naturalizationDoc',
  religion: 'religion',
  formerReligion: 'formerReligion',
  registeredHouseNo: 'registeredHouseNo',
  registeredVillage: 'registeredVillage',
  registeredMoo: 'registeredMoo',
  registeredSoi: 'registeredSoi',
  registeredRoad: 'registeredRoad',
  registeredSubdistrict: 'registeredSubdistrict',
  registeredDistrict: 'registeredDistrict',
  registeredProvince: 'registeredProvince',
  registeredPhone: 'registeredPhone',
  currentHouseNo: 'currentHouseNo',
  currentVillage: 'currentVillage',
  currentMoo: 'currentMoo',
  currentSoi: 'currentSoi',
  currentRoad: 'currentRoad',
  currentSubdistrict: 'currentSubdistrict',
  currentDistrict: 'currentDistrict',
  currentProvince: 'currentProvince',
  currentPhone: 'currentPhone',
  phoneLandline: 'phoneLandline',
  phoneMobile: 'phoneMobile',
  email: 'email',
  lineId: 'lineId',
  facebook: 'facebook',
  instagram: 'instagram',
  otherContact: 'otherContact',
  alienCardNo: 'alienCardNo',
  alienCardDate: 'alienCardDate',
  alienCardIssuedAt: 'alienCardIssuedAt',
  alienResidenceDocNo: 'alienResidenceDocNo',
  alienResidenceDocDate: 'alienResidenceDocDate',
  alienResidenceIssuedAt: 'alienResidenceIssuedAt',
  alienIdInThailand: 'alienIdInThailand',
  birthCountry: 'birthCountry',
  entryDateToThailand: 'entryDateToThailand',
  workPermitNo: 'workPermitNo',
  workPermitIssuedBy: 'workPermitIssuedBy',
  workPermitIssueDate: 'workPermitIssueDate',
  workPermitExpiryDate: 'workPermitExpiryDate',
  height: 'height',
  weight: 'weight',
  scarsDistinguishingMarks: 'scarsDistinguishingMarks',
  bloodGroup: 'bloodGroup',
  addressesPast15Years: 'addressesPast15Years',
  educations: 'educations',
  specialActivities: 'specialActivities',
  languages: 'languages',
  workHistory: 'workHistory',
  specialOccupationsHobbies: 'specialOccupationsHobbies',
  militaryStatus: 'militaryStatus',
  militaryRank: 'militaryRank',
  militaryRegNumber: 'militaryRegNumber',
  militaryBranchUnit: 'militaryBranchUnit',
  militaryUnitLocation: 'militaryUnitLocation',
  militaryServiceFrom: 'militaryServiceFrom',
  militaryServiceTo: 'militaryServiceTo',
  militaryYearsServed: 'militaryYearsServed',
  militaryDischargeReason: 'militaryDischargeReason',
  militaryLastCommander: 'militaryLastCommander',
  militarySpecialOperations: 'militarySpecialOperations',
  militarySpecialOpDate: 'militarySpecialOpDate',
  militarySpecialOpDuration: 'militarySpecialOpDuration',
  militaryExemptionReason: 'militaryExemptionReason',
  writerDetails: 'writerDetails',
  politicalSocialMemberships: 'politicalSocialMemberships',
  foreignTravels: 'foreignTravels',
  identificationDocuments: 'identificationDocuments',
  legalCases: 'legalCases',
  disciplinaryPunishments: 'disciplinaryPunishments',
  fatherDetails: 'fatherDetails',
  motherDetails: 'motherDetails',
  maritalStatus: 'maritalStatus',
  spouseFormerDetails: 'spouseFormerDetails',
  spouseCurrentDetails: 'spouseCurrentDetails',
  children: 'children',
  siblings: 'siblings',
  relativesInGovernment: 'relativesInGovernment',
  overseasContacts: 'overseasContacts',
  cohabitants: 'cohabitants',
  closeFriendsRef: 'closeFriendsRef',
  supporters: 'supporters',
  additionalExplanations: 'additionalExplanations',
  ownerSignatureDate: 'ownerSignatureDate',
  inspectorRankName: 'inspectorRankName',
  inspectorPosition: 'inspectorPosition',
  inspectorSignatureDate: 'inspectorSignatureDate',
  sketchMapImage: 'sketchMapImage',
  mapHouseNo: 'mapHouseNo',
  mapVillage: 'mapVillage',
  mapMoo: 'mapMoo',
  mapSoi: 'mapSoi',
  mapRoad: 'mapRoad',
  mapSubdistrict: 'mapSubdistrict',
  mapDistrict: 'mapDistrict',
  mapProvince: 'mapProvince',
  mapPhone: 'mapPhone',
  mapHouseOwnerName: 'mapHouseOwnerName',
  mapHouseOwnerPhone: 'mapHouseOwnerPhone',
  emergencyContactRankName: 'emergencyContactRankName',
  emergencyContactRelation: 'emergencyContactRelation',
  emergencyContactAddress: 'emergencyContactAddress',
  extraTitleName: 'extraTitleName',
  extraGender: 'extraGender',
  extraBloodGroup: 'extraBloodGroup',
  extraRegisteredAddress: 'extraRegisteredAddress',
  extraCurrentAddress: 'extraCurrentAddress',
  extraIsSameAddress: 'extraIsSameAddress',
  extraMobilePhone: 'extraMobilePhone',
  extraHomePhone: 'extraHomePhone',
  extraOfficePhone: 'extraOfficePhone',
  extraEmail: 'extraEmail',
  extraOwnerSignatureDate: 'extraOwnerSignatureDate',
  extraOfficerName: 'extraOfficerName',
  extraOfficerPosition: 'extraOfficerPosition',
  extraOfficerSignatureDate: 'extraOfficerSignatureDate',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};


exports.Prisma.ModelName = {
  Personnel: 'Personnel',
  Vehicle: 'Vehicle',
  LeaveRecord: 'LeaveRecord',
  Department: 'Department',
  SystemSetting: 'SystemSetting',
  CalendarEvent: 'CalendarEvent',
  Notification: 'Notification',
  NotificationRead: 'NotificationRead',
  Post: 'Post',
  ContactMessage: 'ContactMessage',
  AuditLog: 'AuditLog',
  MediaFile: 'MediaFile',
  PasswordResetToken: 'PasswordResetToken',
  Service: 'Service',
  SystemRole: 'SystemRole',
  PersonnelDocument: 'PersonnelDocument',
  Inspection: 'Inspection',
  InspectionFinding: 'InspectionFinding',
  Rpb1Record: 'Rpb1Record'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
