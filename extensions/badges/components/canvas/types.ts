export type CanvasElementType = 'text' | 'image' | 'rect' | 'circle' | 'line' | 'ribbon' | 'hologram' | 'qr' | 'barcode' | 'emblem';

export type FieldMapping = 
  | 'static' 
  | 'fullName' 
  | 'firstName' 
  | 'lastName' 
  | 'prefix' 
  | 'position' 
  | 'department' 
  | 'subDepartment' 
  | 'bloodType' 
  | 'badgeNo' 
  | 'citizenId' 
  | 'avatar' 
  | 'rank' 
  | 'issueDate' 
  | 'expireDate';

export interface CanvasElement {
  id: string;
  type: CanvasElementType;
  field: FieldMapping;
  x: number; // in pixels (canvas space)
  y: number; // in pixels (canvas space)
  width: number; // in pixels
  height: number; // in pixels
  rotation?: number; // degrees
  content?: string;
  fontFamily?: string;
  fontSize?: number; // px
  color?: string;
  backgroundColor?: string;
  gradientEnabled?: boolean;
  gradientFrom?: string;
  gradientTo?: string;
  gradientDirection?: 'to-b' | 'to-r' | 'to-br' | 'to-tr';
  fontWeight?: string;
  fontStyle?: 'normal' | 'italic';
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  letterSpacing?: number; // px
  lineHeight?: number;
  borderWidth?: number; // px
  borderStyle?: 'solid' | 'dashed' | 'dotted';
  borderColor?: string;
  borderRadius?: number; // px
  boxShadow?: 'none' | 'sm' | 'md' | 'lg' | 'glow';
  opacity?: number; // 0-100
  zIndex: number;
  locked?: boolean;
  hidden?: boolean;
  dynamicBg?: boolean;
  dynamicText?: boolean;
  dynamicBorder?: boolean;
  objectFit?: 'cover' | 'contain' | 'fill';
}

export type CanvaTab = 'templates' | 'text' | 'elements' | 'codes' | 'media' | 'background' | 'layers';

export interface RankColorsConfig {
  colorMode?: 'auto' | 'custom' | string;
  customColor?: string;
  commissioned?: string;
  nonCommissioned?: string;
  conscript?: string;
}

export interface BadgeCanvasEditorProps {
  initialElements?: CanvasElement[];
  initialBackElements?: CanvasElement[];
  onChange: (elements: CanvasElement[]) => void;
  onBackChange?: (elements: CanvasElement[]) => void;
  rankColors?: RankColorsConfig;
  onRankColorsChange?: (colors: Partial<RankColorsConfig>) => void;
}

export const AVAILABLE_FONTS = [
  { id: 'TH Sarabun New', label: 'TH Sarabun New (มาตรฐานราชการ / ทบ.)' },
  { id: 'Prompt', label: 'Prompt (พรอพท์ โมเดิร์น)' },
  { id: 'Kanit', label: 'Kanit (คณิต หัวมนหนา)' },
  { id: 'Sarabun', label: 'Sarabun (Google Fonts สารบรรณ)' },
  { id: 'Niramit', label: 'Niramit (นิรมิต ทางการประณีต)' },
] as const;

export function resolveBadgeFontFamily(fontName?: string): string {
  if (!fontName || fontName === 'TH Sarabun New' || fontName === 'THSarabunNew' || fontName === 'sarabun-new') {
    return "'TH Sarabun New', 'THSarabunNew', 'Sarabun', sans-serif";
  }
  if (fontName === 'Prompt') {
    return "'Prompt', sans-serif";
  }
  if (fontName === 'Kanit') {
    return "'Kanit', sans-serif";
  }
  if (fontName === 'Sarabun') {
    return "'Sarabun', 'TH Sarabun New', sans-serif";
  }
  if (fontName === 'Niramit') {
    return "'Niramit', sans-serif";
  }
  return `${fontName}, 'TH Sarabun New', 'THSarabunNew', 'Sarabun', sans-serif`;
}
