import { CanvasTagElement } from '@/modules/document-templates/components/templateCanvasTypes';

export interface FormFieldDef {
  key: string;
  tag: string;
  label: string;
  type: 'text' | 'textarea' | 'date' | 'number' | 'readonly';
  placeholder?: string;
  defaultValue?: string | number;
  category: 'personnel' | 'details' | 'dates' | 'stats' | 'custom';
  required?: boolean;
  gridSpan?: number; // 1 to 3 cols
}

export interface ParsedTemplateForm {
  rawTags: string[];
  fields: FormFieldDef[];
  personnelFields: FormFieldDef[];
  detailFields: FormFieldDef[];
  dateFields: FormFieldDef[];
  statFields: FormFieldDef[];
  customFields: FormFieldDef[];
  requiresStartDate: boolean;
  requiresEndDate: boolean;
  requiresTotalDays: boolean;
}

/**
 * Normalizes raw tag string e.g. "{{fullName}}" or "fullName"
 */
function normalizeTag(tagStr: string): string {
  return tagStr.replace(/[{}]/g, '').trim();
}

/**
 * Parses template mapping JSON and extracts ONLY active tags that have `includeInForm !== false`.
 * STRICT RULE: Never inject or guess fields that are not placed on the canvas or not enabled.
 */
export function parseTemplateToFormFields(mappingJson?: string | null): ParsedTemplateForm {
  const emptyResult: ParsedTemplateForm = {
    rawTags: [],
    fields: [],
    personnelFields: [],
    detailFields: [],
    dateFields: [],
    statFields: [],
    customFields: [],
    requiresStartDate: false,
    requiresEndDate: false,
    requiresTotalDays: false,
  };

  if (!mappingJson) return emptyResult;

  let elements: CanvasTagElement[] = [];
  try {
    const parsed = JSON.parse(mappingJson);
    if (parsed && Array.isArray(parsed.elements)) {
      elements = parsed.elements;
    } else if (Array.isArray(parsed)) {
      elements = parsed;
    }
  } catch {
    return emptyResult;
  }

  // Filter ONLY elements explicitly configured to be in the form (default true if undefined)
  const formElements = elements.filter(el => el.includeInForm !== false && el.tag);
  if (formElements.length === 0) {
    return emptyResult;
  }

  const rawTags = formElements.map(el => el.tag);
  const elementMap = new Map<string, CanvasTagElement>();
  for (const el of formElements) {
    const key = normalizeTag(el.tag);
    if (!elementMap.has(key)) {
      elementMap.set(key, el);
    }
  }

  // All placed tags on canvas
  const allPlacedTagKeys = new Set(elements.map(el => normalizeTag(el.tag)));
  const requiresStartDate = allPlacedTagKeys.has('startDate') || allPlacedTagKeys.has('startDay') || allPlacedTagKeys.has('startMonth') || allPlacedTagKeys.has('startYear');
  const requiresEndDate = allPlacedTagKeys.has('endDate') || allPlacedTagKeys.has('endDay') || allPlacedTagKeys.has('endMonth') || allPlacedTagKeys.has('endYear');
  const requiresTotalDays = allPlacedTagKeys.has('totalDays') || elementMap.has('totalDays');

  const fields: FormFieldDef[] = [];
  const processedKeys = new Set<string>();

  // Prevent all date tags from leaking into custom / details text input fields
  const DATE_TAG_KEYS = [
    'todayDay', 'todayMonth', 'todayYear', 'todayFull',
    'startDay', 'startMonth', 'startYear', 'startDate',
    'endDay', 'endMonth', 'endYear', 'endDate',
  ];
  for (const dk of DATE_TAG_KEYS) {
    processedKeys.add(dk);
  }

  // 1. Personnel info tags (Readonly display in form)
  const personnelTagDefs: { key: string; defaultLabel: string }[] = [
    { key: 'fullName', defaultLabel: 'ยศ ชื่อ-นามสกุล' },
    { key: 'rank', defaultLabel: 'ยศ / คำนำหน้า' },
    { key: 'firstName', defaultLabel: 'ชื่อตัว' },
    { key: 'lastName', defaultLabel: 'นามสกุล' },
    { key: 'position', defaultLabel: 'ตำแหน่ง' },
    { key: 'department', defaultLabel: 'สังกัด / กอง' },
    { key: 'subDepartment', defaultLabel: 'แผนก / ฝ่าย' },
    { key: 'phone', defaultLabel: 'เบอร์โทรศัพท์' },
    { key: 'citizenId', defaultLabel: 'เลขประจำตัวประชาชน' },
  ];

  for (const p of personnelTagDefs) {
    if (elementMap.has(p.key)) {
      const el = elementMap.get(p.key)!;
      fields.push({
        key: p.key,
        tag: `{{${p.key}}}`,
        label: el.formLabel || el.label || p.defaultLabel,
        type: el.formInputType || 'readonly',
        category: 'personnel',
        gridSpan: 1,
      });
      processedKeys.add(p.key);
    }
  }

  // 2. Dates section (STRICT: handled via unified DatePicker in the form)
  if (requiresStartDate) {
    const el = elementMap.get('startDate') || elementMap.get('startDay') || elementMap.get('startMonth') || elementMap.get('startYear');
    fields.push({
      key: 'startDate',
      tag: '{{startDate}}',
      label: el?.formLabel || 'วันที่เริ่มลา',
      type: 'date',
      category: 'dates',
      required: el?.isRequired ?? true,
      gridSpan: 1,
    });
  }

  if (requiresEndDate) {
    const el = elementMap.get('endDate') || elementMap.get('endDay') || elementMap.get('endMonth') || elementMap.get('endYear');
    fields.push({
      key: 'endDate',
      tag: '{{endDate}}',
      label: el?.formLabel || 'วันที่สิ้นสุดการลา',
      type: 'date',
      category: 'dates',
      required: el?.isRequired ?? true,
      gridSpan: 1,
    });
  }

  if (requiresTotalDays) {
    const el = elementMap.get('totalDays')!;
    fields.push({
      key: 'totalDays',
      tag: '{{totalDays}}',
      label: el.formLabel || 'จำนวนวันลาทั้งหมด',
      type: 'number',
      category: 'dates',
      placeholder: 'คำนวณอัตโนมัติ',
      gridSpan: 1,
    });
    processedKeys.add('totalDays');
  }

  // 3. Leave Details section (STRICT: only if placed on canvas)
  if (elementMap.has('writtenAt')) {
    const el = elementMap.get('writtenAt')!;
    fields.push({
      key: 'writtenAt',
      tag: '{{writtenAt}}',
      label: el.formLabel || el.label || 'เขียนที่ (สถานที่เขียนใบลา)',
      type: el.formInputType || 'text',
      placeholder: 'เช่น บก.ศฝยว.ทบ.',
      defaultValue: 'บก.ศฝยว.ทบ.',
      category: 'details',
      required: el.isRequired ?? false,
      gridSpan: 1,
    });
    processedKeys.add('writtenAt');
  }

  if (elementMap.has('toPerson')) {
    const el = elementMap.get('toPerson')!;
    fields.push({
      key: 'toPerson',
      tag: '{{toPerson}}',
      label: el.formLabel || el.label || 'เรียน (ตำแหน่งผู้บังคับบัญชา)',
      type: el.formInputType || 'text',
      placeholder: 'เช่น ผบ.ศฝยว.ทบ.',
      defaultValue: 'ผบ.ศฝยว.ทบ.',
      category: 'details',
      required: el.isRequired ?? false,
      gridSpan: 1,
    });
    processedKeys.add('toPerson');
  }

  if (elementMap.has('reason')) {
    const el = elementMap.get('reason')!;
    fields.push({
      key: 'reason',
      tag: '{{reason}}',
      label: el.formLabel || el.label || 'เหตุผลการลา (เนื่องจาก/เพื่อ...)',
      type: el.formInputType || 'text',
      placeholder: 'ระบุเหตุผลการขอลา เช่น ติดต่อธุระครอบครัว, พักผ่อนประจำปี',
      category: 'details',
      required: el.isRequired ?? true,
      gridSpan: 2,
    });
    processedKeys.add('reason');
  }

  if (elementMap.has('substitutePerson')) {
    const el = elementMap.get('substitutePerson')!;
    fields.push({
      key: 'substitutePerson',
      tag: '{{substitutePerson}}',
      label: el.formLabel || el.label || 'ผู้ปฏิบัติหน้าที่แทน (ยศ นามสกุล)',
      type: el.formInputType || 'text',
      placeholder: 'ระบุผู้รับมอบหน้าที่แทนระหว่างลา (ถ้ามี)',
      category: 'details',
      required: el.isRequired ?? false,
      gridSpan: 1,
    });
    processedKeys.add('substitutePerson');
  }

  if (elementMap.has('contactAddress')) {
    const el = elementMap.get('contactAddress')!;
    fields.push({
      key: 'contactAddress',
      tag: '{{contactAddress}}',
      label: el.formLabel || el.label || 'ที่อยู่ติดต่อระหว่างลา',
      type: el.formInputType || 'text',
      placeholder: 'บ้านเลขที่ หมู่ ถนน ตำบล อำเภอ จังหวัด',
      category: 'details',
      required: el.isRequired ?? false,
      gridSpan: 3,
    });
    processedKeys.add('contactAddress');
  }

  // 4. Stats section (Leave balance) (STRICT: only if placed on canvas)
  if (elementMap.has('accumulatedLeaveDays')) {
    const el = elementMap.get('accumulatedLeaveDays')!;
    fields.push({
      key: 'accumulatedLeaveDays',
      tag: '{{accumulatedLeaveDays}}',
      label: el.formLabel || el.label || 'วันลาพักผ่อนสะสมยกมา (วัน)',
      type: el.formInputType || 'number',
      defaultValue: 0,
      category: 'stats',
      required: el.isRequired ?? false,
      gridSpan: 1,
    });
    processedKeys.add('accumulatedLeaveDays');
  }

  if (elementMap.has('thisYearLeaveDays')) {
    const el = elementMap.get('thisYearLeaveDays')!;
    fields.push({
      key: 'thisYearLeaveDays',
      tag: '{{thisYearLeaveDays}}',
      label: el.formLabel || el.label || 'สิทธิลาปีนี้ (วัน)',
      type: el.formInputType || 'number',
      defaultValue: 10,
      category: 'stats',
      required: el.isRequired ?? false,
      gridSpan: 1,
    });
    processedKeys.add('thisYearLeaveDays');
  }

  if (elementMap.has('totalAvailableDays')) {
    const el = elementMap.get('totalAvailableDays')!;
    fields.push({
      key: 'totalAvailableDays',
      tag: '{{totalAvailableDays}}',
      label: el.formLabel || el.label || 'รวมวันลาที่ใช้ได้ (วัน)',
      type: el.formInputType || 'number',
      category: 'stats',
      required: el.isRequired ?? false,
      gridSpan: 1,
    });
    processedKeys.add('totalAvailableDays');
  }

  // 5. Remaining tags or custom tags that were placed and have includeInForm !== false
  for (const [key, el] of elementMap.entries()) {
    if (!processedKeys.has(key)) {
      fields.push({
        key,
        tag: el.tag,
        label: el.formLabel || el.label || key,
        type: el.formInputType || (el.isCustom ? 'text' : 'text'),
        category: el.isCustom ? 'custom' : 'details',
        defaultValue: el.customValue || '',
        required: el.isRequired ?? false,
        gridSpan: 1,
      });
      processedKeys.add(key);
    }
  }

  return {
    rawTags,
    fields,
    personnelFields: fields.filter(f => f.category === 'personnel'),
    detailFields: fields.filter(f => f.category === 'details'),
    dateFields: fields.filter(f => f.category === 'dates'),
    statFields: fields.filter(f => f.category === 'stats'),
    customFields: fields.filter(f => f.category === 'custom'),
    requiresStartDate,
    requiresEndDate,
    requiresTotalDays,
  };
}
