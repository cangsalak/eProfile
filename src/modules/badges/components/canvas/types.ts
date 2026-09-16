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
}

export type CanvaTab = 'templates' | 'text' | 'elements' | 'codes' | 'media' | 'background' | 'layers';

export interface BadgeCanvasEditorProps {
  initialElements?: CanvasElement[];
  initialBackElements?: CanvasElement[];
  onChange: (elements: CanvasElement[]) => void;
  onBackChange?: (elements: CanvasElement[]) => void;
}
