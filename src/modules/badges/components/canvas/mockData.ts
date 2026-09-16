export interface MockProfile {
  fullName: string;
  firstName: string;
  lastName: string;
  prefix: string;
  position: string;
  department: string;
  subDepartment: string;
  bloodType: string;
  badgeNo: string;
  citizenId: string;
  avatar: string;
  rank: string;
  rankType: 'commissioned' | 'non_commissioned' | 'conscript';
  rankColor: string;
  issueDate: string;
  expireDate: string;
}

export const MOCK_PROFILES: Record<string, MockProfile> = {
  commissioned: {
    fullName: 'ร้อยเอก สมชาย ใจหาญ',
    firstName: 'สมชาย',
    lastName: 'ใจหาญ',
    prefix: 'ร้อยเอก',
    position: 'นายทหารยุทธการและการฝึก',
    department: 'กองพันทหารราบที่ ๑ กรมทหารราบที่ ๑',
    subDepartment: 'ฝ่ายยุทธการ (ฝยก.)',
    bloodType: 'O (Rh+)',
    badgeNo: 'RTARF-2567-0099',
    citizenId: '1-1002-00345-67-8',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    rank: 'นายทหารสัญญาบัตร',
    rankType: 'commissioned',
    rankColor: '#dc2626', // Red
    issueDate: '01 ม.ค. 2567',
    expireDate: '31 ธ.ค. 2571'
  },
  non_commissioned: {
    fullName: 'จ่าสิบเอก พัฒนา วงศ์สุวรรณ',
    firstName: 'พัฒนา',
    lastName: 'วงศ์สุวรรณ',
    prefix: 'จ่าสิบเอก',
    position: 'เสมียนกำลังพลและสารบรรณ',
    department: 'กองพันทหารราบที่ ๑ กรมทหารราบที่ ๑',
    subDepartment: 'ฝ่ายกำลังพล (ฝกพ.)',
    bloodType: 'B (Rh+)',
    badgeNo: 'RTARF-2567-0158',
    citizenId: '3-1005-00789-12-3',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    rank: 'นายทหารประทวน',
    rankType: 'non_commissioned',
    rankColor: '#d97706', // Amber / Orange
    issueDate: '01 ม.ค. 2567',
    expireDate: '31 ธ.ค. 2571'
  },
  conscript: {
    fullName: 'พลทหาร มานะ ขยันยิ่ง',
    firstName: 'มานะ',
    lastName: 'ขยันยิ่ง',
    prefix: 'พลทหาร',
    position: 'พลปืนเล็ก / ทหารกองประจำการ',
    department: 'กองพันทหารราบที่ ๑ กรมทหารราบที่ ๑',
    subDepartment: 'ร้อย.อาวุธเบาที่ ๑',
    bloodType: 'A (Rh+)',
    badgeNo: 'RTARF-2567-0842',
    citizenId: '1-4502-00998-34-1',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    rank: 'ทหารกองประจำการ',
    rankType: 'conscript',
    rankColor: '#16a34a', // Emerald / Green
    issueDate: '01 พ.ค. 2567',
    expireDate: '30 เม.ย. 2569'
  }
};

export const MOCK_PERSONNEL = MOCK_PROFILES.commissioned;
