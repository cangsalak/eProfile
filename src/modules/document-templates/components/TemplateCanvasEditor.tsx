'use client';

import React, { useState, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import { Button, Badge } from '@/components/ui';
import toast from 'react-hot-toast';
import { 
  CanvasTagElement, 
  TEMPLATE_TAG_DEFINITIONS, 
  TemplateFieldTag,
  TemplateMappingConfig 
} from './templateCanvasTypes';

interface TemplateCanvasEditorProps {
  templateId: string;
  templateName: string;
  templateCode: string;
  pdfUrl?: string;
  docxUrl?: string;
  initialMappingJson?: string | null;
  onClose: () => void;
  onSaveSuccess?: () => void;
}

// Standard A4 Canvas Base Dimensions (pt)
const A4_WIDTH = 595.28;
const A4_HEIGHT = 841.89;

// Default Fixed Font Size & Box Heights for Official Thai Standard Documents
const FIXED_FONT_SIZE = 14;
const FIXED_LINE_HEIGHT = 26;

// Magnetic Snap Grid Steps (pt)
const SNAP_GRID_SIZE = 8;
const SNAP_THRESHOLD = 6;

function isDateTag(tag: string): boolean {
  const clean = tag.replace(/[{}]/g, '').trim();
  return [
    'todayDay', 'todayMonth', 'todayYear', 'todayFull',
    'startDay', 'startMonth', 'startYear', 'startDate',
    'endDay', 'endMonth', 'endYear', 'endDate',
  ].includes(clean);
}

function getDefaultInputType(tag: string): 'text' | 'textarea' | 'date' | 'number' | 'readonly' {
  const clean = tag.replace(/[{}]/g, '').trim();
  if (['fullName', 'rank', 'firstName', 'lastName', 'position', 'department', 'subDepartment', 'phone', 'citizenId', 'todayFull', 'todayDay', 'todayMonth', 'todayYear'].includes(clean)) {
    return 'readonly';
  }
  if (['startDate', 'endDate', 'ordainDate'].includes(clean)) {
    return 'date';
  }
  if (['reason', 'contactAddress'].includes(clean)) {
    return 'textarea';
  }
  if (['accumulatedLeaveDays', 'thisYearLeaveDays', 'totalDays', 'totalAvailableDays', 'maternityLeaveTimes', 'maternityLeaveDays'].includes(clean)) {
    return 'number';
  }
  return 'text';
}

export default function TemplateCanvasEditor({
  templateId,
  templateName,
  templateCode,
  pdfUrl,
  docxUrl,
  initialMappingJson,
  onClose,
  onSaveSuccess,
}: TemplateCanvasEditorProps) {
  const [elements, setElements] = useState<CanvasTagElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(100);
  const [previewMode, setPreviewMode] = useState<boolean>(false);
  const [searchTag, setSearchTag] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Word Tag Detection State
  const [isScanningDocx, setIsScanningDocx] = useState<boolean>(false);
  const [detectedDocxTags, setDetectedDocxTags] = useState<{ raw: string; tag: string; name: string }[]>([]);

  // Multi-page state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  // PDF.js Canvas Rendering (replaces faulty scrolling iframe)
  const pdfCanvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const pdfDocRef = React.useRef<any>(null);
  const [isPdfLoading, setIsPdfLoading] = useState<boolean>(false);

  // PDF blank-field auto-detection
  const [isDetectingPdfFields, setIsDetectingPdfFields] = useState<boolean>(false);
  const [detectedPdfFields, setDetectedPdfFields] = useState<{ x: number; y: number; width: number; page: number }[]>([]);

  // Magnetic Snapping
  const [snapToGrid, setSnapToGrid] = useState<boolean>(true);

  // Live drag coordinates display
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);

  // Arrow-key nudge for selected element (1pt per key press)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!selectedId) return;
      // Ignore when typing in inputs
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      const STEP = e.shiftKey ? 8 : 1; // Shift = 8pt jump
      let dx = 0, dy = 0;
      if (e.key === 'ArrowLeft')  { dx = -STEP; }
      else if (e.key === 'ArrowRight') { dx = STEP; }
      else if (e.key === 'ArrowUp')    { dy = -STEP; }
      else if (e.key === 'ArrowDown')  { dy = STEP; }
      else if (e.key === 'Delete' || e.key === 'Backspace') {
        handleDeleteElement(selectedId);
        return;
      } else return;

      e.preventDefault();
      setElements(prev => prev.map(el =>
        el.id === selectedId
          ? { ...el, x: Math.max(0, el.x + dx), y: Math.max(0, el.y + dy) }
          : el
      ));
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);


  // Parse initial mapping
  useEffect(() => {
    if (initialMappingJson) {
      try {
        const parsed = JSON.parse(initialMappingJson);
        if (parsed && Array.isArray(parsed.elements)) {
          setElements(parsed.elements);
          const maxP = Math.max(1, ...parsed.elements.map((el: any) => el.page || 1));
          setTotalPages(prev => Math.max(prev, maxP));
        } else if (Array.isArray(parsed)) {
          setElements(parsed);
          const maxP = Math.max(1, ...parsed.map((el: any) => el.page || 1));
          setTotalPages(prev => Math.max(prev, maxP));
        }
      } catch (e) {
        console.error('Failed to parse initial mapping JSON', e);
      }
    }
  }, [initialMappingJson]);

  // Load PDF.js client-side library from local static assets
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if ((window as any).pdfjsLib) return;

    const script = document.createElement('script');
    script.src = '/libs/pdfjs/pdf.min.js';
    script.async = true;
    script.onload = () => {
      if ((window as any).pdfjsLib) {
        (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc = '/libs/pdfjs/pdf.worker.min.js';
      }
    };
    document.head.appendChild(script);
  }, []);

  // Render specific page on the fixed HTML5 Canvas
  const renderPdfPage = React.useCallback(async (pdfDoc: any, pageNum: number) => {
    if (!pdfDoc || !pdfCanvasRef.current) return;
    try {
      const page = await pdfDoc.getPage(pageNum);
      const canvas = pdfCanvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Fit to A4 width with high definition scale (1.5x)
      const baseViewport = page.getViewport({ scale: 1 });
      const fitScale = (A4_WIDTH / baseViewport.width) * 1.5;
      const viewport = page.getViewport({ scale: fitScale });

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const renderContext = {
        canvasContext: ctx,
        viewport: viewport,
      };

      await page.render(renderContext).promise;
    } catch (e) {
      console.error('Failed to render PDF page', e);
    }
  }, []);

  // Load PDF Document when pdfUrl changes
  useEffect(() => {
    if (!pdfUrl) return;

    let isMounted = true;
    const loadPdfDoc = async () => {
      setIsPdfLoading(true);
      try {
        let attempts = 0;
        while (!(window as any).pdfjsLib && attempts < 30) {
          await new Promise(r => setTimeout(r, 100));
          attempts++;
        }

        const pdfjs = (window as any).pdfjsLib;
        if (!pdfjs) {
          console.warn('PDF.js not loaded');
          setIsPdfLoading(false);
          return;
        }

        const loadingTask = pdfjs.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;
        if (!isMounted) return;

        pdfDocRef.current = pdf;
        setTotalPages(prev => Math.max(prev, pdf.numPages));
        await renderPdfPage(pdf, currentPage);
      } catch (err) {
        console.error('Failed to load PDF via PDF.js', err);
      } finally {
        if (isMounted) setIsPdfLoading(false);
      }
    };

    loadPdfDoc();
    return () => {
      isMounted = false;
    };
  }, [pdfUrl, renderPdfPage, currentPage]);

  // Re-render when currentPage changes
  useEffect(() => {
    if (pdfDocRef.current) {
      renderPdfPage(pdfDocRef.current, currentPage);
    }
  }, [currentPage, renderPdfPage]);

  /**
   * Calculate generic dynamic initial position for any template without hardcoded tag coordinates
   */
  const getDynamicTagPosition = React.useCallback((index: number) => {
    // 2-column organized staging layout so tags are neatly placed and easy to drag
    const col = index % 2;
    const row = Math.floor(index / 2) % 18;
    const x = col === 0 ? 80 : 310;
    const y = 120 + (row * (FIXED_LINE_HEIGHT + 14));
    return { x, y, width: 180 };
  }, []);

  /**
   * Detect blank fields in a PDF page using a 3-layer approach:
   *
   * Layer 1 — PDF Operator Parsing (getOperatorList):
   *   Reads the actual PDF drawing commands (moveTo, lineTo, rectangle).
   *   Thai government forms draw their blank lines as vector paths, NOT text underscores.
   *   This catches them directly at their exact coordinate.
   *
   * Layer 2 — Pixel Canvas Scanning (offscreen render):
   *   Renders the page to an offscreen canvas at scale=1 (1px=1pt),
   *   then scans for long, high-density horizontal dark segments.
   *   Fallback for forms using rasterized / scanned content.
   *
   * Layer 3 — Text Gap Detection (getTextContent):
   *   Finds horizontal gaps ≥30pt between text items on the same row.
   *   Last resort for forms where blanks are implied by empty space.
   */
  const detectPdfBlankFields = React.useCallback(async (pageNum: number): Promise<{ x: number; y: number; width: number; page: number }[]> => {
    const pdfDoc = pdfDocRef.current;
    if (!pdfDoc) return [];

    const page = await pdfDoc.getPage(pageNum);
    const baseVP = page.getViewport({ scale: 1 });
    const pageW = baseVP.width;
    const pageH = baseVP.height;

    type BlankField = { x: number; y: number; width: number; page: number };
    const results: BlankField[] = [];

    // ─────────────────────────────────────────────────────────────────
    // LAYER 1: PDF Operator List — vector path horizontal line detection
    // ─────────────────────────────────────────────────────────────────
    try {
      const pdfjs = (window as any).pdfjsLib;
      const OPS = pdfjs?.OPS ?? {};

      // Resolve OPS codes with safe fallbacks across PDF.js versions
      const OP_MOVE = OPS.moveTo ?? 13;
      const OP_LINE = OPS.lineTo ?? 14;
      const OP_RECT = OPS.rectangle ?? 19;
      const OP_CONSTRUCT = OPS.constructPath ?? 91;

      const opList = await page.getOperatorList();
      const { fnArray, argsArray } = opList;

      let curX = 0, curY = 0;
      const MIN_LINE_PT = 25; // minimum horizontal line width in pt

      const addHLine = (x1: number, y1: number, x2: number, y2: number) => {
        if (Math.abs(y2 - y1) > 2) return; // not horizontal
        const lineW = Math.abs(x2 - x1);
        if (lineW < MIN_LINE_PT) return;
        const flippedY = pageH - Math.max(y1, y2); // PDF bottom-left → top-left
        results.push({ x: Math.min(x1, x2), y: flippedY, width: lineW, page: pageNum });
      };

      for (let i = 0; i < fnArray.length; i++) {
        const fn = fnArray[i];
        const args = argsArray[i] as number[];

        if (fn === OP_MOVE) {
          curX = args[0]; curY = args[1];
        } else if (fn === OP_LINE) {
          addHLine(curX, curY, args[0], args[1]);
          curX = args[0]; curY = args[1];
        } else if (fn === OP_RECT) {
          // Rectangle: x, y, width, height — thin rect = horizontal line
          const [rx, ry, rw, rh] = args;
          if (Math.abs(rh) <= 3 && Math.abs(rw) >= MIN_LINE_PT) {
            results.push({ x: rx, y: pageH - ry, width: Math.abs(rw), page: pageNum });
          }
        } else if (fn === OP_CONSTRUCT) {
          // constructPath bundles multiple path ops: [cmdCodes[], coords[]]
          const cmds = (args as any)[0] as number[];
          const coords = (args as any)[1] as number[];
          let ci = 0;
          let mx = 0, my = 0;

          for (const cmd of cmds) {
            if (cmd === OP_MOVE) {
              mx = coords[ci++]; my = coords[ci++];
            } else if (cmd === OP_LINE) {
              const tx = coords[ci++], ty = coords[ci++];
              addHLine(mx, my, tx, ty);
              mx = tx; my = ty;
            } else if (cmd === OP_RECT) {
              const rx = coords[ci++], ry = coords[ci++];
              const rw = coords[ci++], rh = coords[ci++];
              if (Math.abs(rh) <= 3 && Math.abs(rw) >= MIN_LINE_PT) {
                results.push({ x: rx, y: pageH - ry, width: Math.abs(rw), page: pageNum });
              }
            } else {
              // curveTo and others consume 4-6 coords — skip them
              if (cmd === 15 || cmd === 16 || cmd === 17) ci += 4; // curveBezierV/Y
              else if (cmd === (OPS.curveBezierC ?? 15)) ci += 6;
            }
          }
        }
      }
    } catch (e) {
      console.warn('[detectPdfBlankFields] getOperatorList failed, skipping layer 1', e);
    }

    // ─────────────────────────────────────────────────────────────────
    // LAYER 2: Pixel Canvas Scan — offscreen render at 1x (1px = 1pt)
    // Used when the operator list yields no results (e.g., scanned PDF)
    // ─────────────────────────────────────────────────────────────────
    if (results.length === 0) {
      try {
        const viewport = page.getViewport({ scale: 1.0 });
        const offscreen = document.createElement('canvas');
        offscreen.width = Math.round(viewport.width);
        offscreen.height = Math.round(viewport.height);
        const ctx2d = offscreen.getContext('2d');
        if (ctx2d) {
          await page.render({ canvasContext: ctx2d, viewport }).promise;

          const imgData = ctx2d.getImageData(0, 0, offscreen.width, offscreen.height);
          const { data, width: cw, height: ch } = imgData;

          const DARK = 90;       // luminance threshold (0=black, 255=white)
          const MIN_W = 30;      // minimum segment width in pixels (= pt at scale 1)
          const DENSITY = 0.88;  // dark pixel density to qualify as a line
          let lastY = -10;

          for (let y = 1; y < ch - 1; y++) {
            if (y - lastY < 3) continue;

            let segX = -1, segLen = 0, segDark = 0;
            const lineResults: BlankField[] = [];

            for (let x = 0; x <= cw; x++) {
              const isDark = x < cw && (() => {
                const idx = (y * cw + x) * 4;
                return (data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114) < DARK;
              })();

              if (isDark) {
                if (segX === -1) segX = x;
                segLen++; segDark++;
              } else if (segX !== -1) {
                if (segLen >= MIN_W && segDark / segLen >= DENSITY) {
                  // Verify line is thin vertically (not text): row above/below should be light
                  const aboveDark = (() => {
                    let d = 0;
                    for (let dx = segX; dx < segX + segLen && dx < cw; dx++) {
                      const idx = ((y - 1) * cw + dx) * 4;
                      if ((data[idx] * 0.299 + data[idx+1] * 0.587 + data[idx+2] * 0.114) < DARK) d++;
                    }
                    return d / segLen;
                  })();
                  if (aboveDark < 0.4) { // mostly light above → it's a thin line, not text
                    lineResults.push({ x: segX, y, width: segLen, page: pageNum });
                    lastY = y;
                  }
                }
                segX = -1; segLen = 0; segDark = 0;
              }
            }
            results.push(...lineResults);
          }
        }
      } catch (e) {
        console.warn('[detectPdfBlankFields] pixel scan failed', e);
      }
    }

    // ─────────────────────────────────────────────────────────────────
    // LAYER 3: Text Gap Detection — last resort via getTextContent
    // ─────────────────────────────────────────────────────────────────
    if (results.length === 0) {
      try {
        const textContent = await page.getTextContent();
        interface RawItem { x: number; y: number; width: number; }
        const items: RawItem[] = textContent.items
          .filter((it: any) => typeof it.str === 'string' && it.width > 0)
          .map((it: any) => ({
            x: it.transform[4] as number,
            y: pageH - (it.transform[5] as number),
            width: it.width as number,
          }));

        const rowMap = new Map<number, RawItem[]>();
        for (const item of items) {
          let matched = false;
          for (const [ky] of rowMap) {
            if (Math.abs(ky - item.y) <= 4) { rowMap.get(ky)!.push(item); matched = true; break; }
          }
          if (!matched) rowMap.set(item.y, [item]);
        }

        for (const [, rowItems] of rowMap) {
          const sorted = rowItems.sort((a, b) => a.x - b.x);
          for (let i = 0; i < sorted.length - 1; i++) {
            const gapStart = sorted[i].x + sorted[i].width;
            const gapW = sorted[i + 1].x - gapStart;
            if (gapW >= 30) results.push({ x: gapStart + 2, y: sorted[i].y, width: gapW - 4, page: pageNum });
          }
          const last = sorted[sorted.length - 1];
          const trailing = 530 - (last.x + last.width);
          if (trailing >= 30 && last.x + last.width < 480) {
            results.push({ x: last.x + last.width + 2, y: last.y, width: trailing - 4, page: pageNum });
          }
        }
      } catch (e) {
        console.warn('[detectPdfBlankFields] getTextContent failed', e);
      }
    }

    // ─── De-duplicate by proximity (within 20pt X, 6pt Y) ────────────
    const deduped: BlankField[] = [];
    for (const cand of results) {
      if (!deduped.some(ex => Math.abs(ex.x - cand.x) < 20 && Math.abs(ex.y - cand.y) < 6)) {
        deduped.push(cand);
      }
    }

    // ─── Sort: top-to-bottom, left-to-right ──────────────────────────
    deduped.sort((a, b) => a.y !== b.y ? a.y - b.y : a.x - b.x);

    return deduped;
  }, []);

  /**
   * Main handler: scan ALL pages of the PDF for blank fields, then
   * auto-map detected Word tags onto those blank positions in order.
   */
  const handleAutoMapTagsToPdfFields = React.useCallback(async () => {
    if (!pdfDocRef.current) {
      toast.error('ยังไม่มีไฟล์ PDF โปรดอัปโหลด PDF ก่อน');
      return;
    }
    if (detectedDocxTags.length === 0) {
      toast.error('ยังไม่มีแท็กจากไฟล์ Word โปรดสแกนไฟล์ Word ก่อน');
      return;
    }

    setIsDetectingPdfFields(true);
    try {
      // Scan all pages
      const allFields: { x: number; y: number; width: number; page: number }[] = [];
      for (let p = 1; p <= totalPages; p++) {
        const pageFields = await detectPdfBlankFields(p);
        allFields.push(...pageFields);
      }

      setDetectedPdfFields(allFields);

      if (allFields.length === 0) {
        toast('ไม่พบเส้นขีด/ช่องว่างในไฟล์ PDF\nอาจใช้เส้นกราฟฟิก → ลากวางแท็กด้วยตนเองได้เลยครับ', { duration: 5000 });
        return;
      }

      // Map tags onto detected fields.
      // IMPORTANT: We rebuild all elements from scratch using the detected field positions.
      // This correctly handles the case where elements were pre-loaded from initialMappingJson
      // (old saved positions from DB) — we must UPDATE their positions, not skip them.
      setElements(prev => {
        // Build a lookup: tag (lowercase) → existing element (for preserving label/style)
        const existingByTag = new Map(prev.map(el => [el.tag.toLowerCase(), el]));

        // Custom text elements (isCustom) — keep them as-is since they are not tag-mapped
        const customElements = prev.filter(el => el.isCustom);

        let mappedCount = 0;
        const remappedElements = detectedDocxTags.map((t, idx) => {
          const field = allFields[idx]; // match by order top-to-bottom, left-to-right
          const existing = existingByTag.get(t.tag.toLowerCase());
          const tagDef = TEMPLATE_TAG_DEFINITIONS.find(def => def.tag.toLowerCase() === t.tag.toLowerCase());

          const pos = field
            ? { x: field.x, y: field.y - 2, width: Math.max(60, field.width), page: field.page }
            : (() => { const d = getDynamicTagPosition(idx); return { ...d, page: 1 }; })();

          mappedCount++;
          return {
            // Preserve existing id/label/style, just update coordinates
            id: existing?.id ?? `tag-auto-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
            tag: t.tag,
            label: existing?.label ?? tagDef?.name ?? t.name,
            x: pos.x,
            y: pos.y,
            width: pos.width,
            height: existing?.height ?? FIXED_LINE_HEIGHT,
            fontSize: existing?.fontSize ?? FIXED_FONT_SIZE,
            fontFamily: existing?.fontFamily ?? 'TH Sarabun New, Sarabun, sans-serif',
            fontWeight: existing?.fontWeight ?? 'normal',
            textAlign: existing?.textAlign ?? 'left',
            color: existing?.color ?? '#000000',
            page: pos.page,
          };
        });

        const onField = Math.min(mappedCount, allFields.length);
        const inStaging = Math.max(0, mappedCount - allFields.length);
        const msg = inStaging > 0
          ? `✅ วาง ${onField} แท็กลงช่องจาก PDF, อีก ${inStaging} แท็กอยู่ใน staging area`
          : `✅ อัปเดตพิกัด ${mappedCount} แท็กลงบนช่องว่างจาก PDF สำเร็จ!`;
        toast.success(msg, { duration: 5000 });

        return [...customElements, ...remappedElements];
      });
    } catch (err) {
      console.error('detectPdfBlankFields failed', err);
      toast.error('เกิดข้อผิดพลาดในการสแกน PDF');
    } finally {
      setIsDetectingPdfFields(false);
    }
  }, [detectedDocxTags, totalPages, detectPdfBlankFields, getDynamicTagPosition]);

  /**
   * Auto place all detected tags directly onto the Canvas dynamically
   */
  const handleAutoPlaceDetectedTags = React.useCallback((tagsToPlace?: { tag: string; name: string }[]) => {
    const list = tagsToPlace || detectedDocxTags;
    if (!list || list.length === 0) {
      toast.error('ยังไม่มีแท็กที่ตรวจพบจากไฟล์ Word');
      return;
    }

    setElements(prev => {
      const existingTags = new Set(prev.map(e => e.tag.toLowerCase()));
      const newElements = [...prev];
      let addedCount = 0;

      list.forEach((t, idx) => {
        if (existingTags.has(t.tag.toLowerCase())) return;

        const pos = getDynamicTagPosition(prev.length + addedCount);
        const tagDef = TEMPLATE_TAG_DEFINITIONS.find(def => def.tag.toLowerCase() === t.tag.toLowerCase());

        newElements.push({
          id: `tag-auto-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
          tag: t.tag,
          label: tagDef?.name || t.name,
          x: pos.x,
          y: pos.y,
          width: pos.width,
          height: FIXED_LINE_HEIGHT,
          fontSize: FIXED_FONT_SIZE,
          fontFamily: 'TH Sarabun New, Sarabun, sans-serif',
          fontWeight: 'normal',
          textAlign: 'left',
          color: '#000000',
          page: currentPage,
        });
        addedCount++;
      });

      if (addedCount > 0) {
        toast.success(`วางแท็ก ${addedCount} รายการลงบนแบบฟอร์มหน้าที่ ${currentPage} เรียบร้อยแล้ว`);
      } else {
        toast('แท็กทั้งหมดวางอยู่บนแบบฟอร์มแล้ว');
      }

      return newElements;
    });
  }, [detectedDocxTags, currentPage, getDynamicTagPosition]);

  const handleScanDocx = React.useCallback(async () => {
    if (!docxUrl && !templateId) return;
    setIsScanningDocx(true);
    try {
      const res = await fetch('/api/modules/document-templates/scan-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docxUrl, templateId }),
      });
      const data = await res.json();
      if (data.success && data.data?.tags) {
        setDetectedDocxTags(data.data.tags);
        toast.success(`ตรวจพบ ${data.data.totalFound} แท็กในไฟล์ Word!`);

        // Automatically place them on the canvas dynamically if canvas is currently empty
        setElements(currentElements => {
          if (currentElements.length === 0 && data.data.tags.length > 0) {
            const autoElements: CanvasTagElement[] = data.data.tags.map((t: any, idx: number) => {
              const pos = getDynamicTagPosition(idx);
              const tagDef = TEMPLATE_TAG_DEFINITIONS.find(def => def.tag.toLowerCase() === t.tag.toLowerCase());
              return {
                id: `tag-auto-${Date.now()}-${idx}`,
                tag: t.tag,
                label: tagDef?.name || t.name,
                x: pos.x,
                y: pos.y,
                width: pos.width,
                height: FIXED_LINE_HEIGHT,
                fontSize: FIXED_FONT_SIZE,
                fontFamily: 'TH Sarabun New, Sarabun, sans-serif',
                fontWeight: 'normal',
                textAlign: 'left',
                color: '#000000',
                page: 1,
              };
            });
            toast.success(`✨ วางแท็กทั้ง ${autoElements.length} รายการลงบนแบบฟอร์มให้เรียบร้อยแล้ว`);
            return autoElements;
          }
          return currentElements;
        });
      }
    } catch (err) {
      console.warn('Scan docx failed', err);
    } finally {
      setIsScanningDocx(false);
    }
  }, [docxUrl, templateId, getDynamicTagPosition]);

  // Auto scan tags from Word file on load if docxUrl is present
  useEffect(() => {
    if (docxUrl) {
      handleScanDocx();
    }
  }, [docxUrl, handleScanDocx]);

  const scale = zoom / 100;

  /**
   * Helper: Magnetic snap coordinate calculator
   */
  const calculateMagneticSnap = (x: number, y: number, currentId?: string): { x: number; y: number; snappedX: boolean; snappedY: boolean } => {
    let finalX = x;
    let finalY = y;
    let snappedX = false;
    let snappedY = false;

    // 1. Magnetic Attraction to other placed tags (Smart Guide Lines)
    for (const other of elements) {
      if (other.id === currentId) continue;

      // Align Left (X)
      if (Math.abs(other.x - x) <= SNAP_THRESHOLD) {
        finalX = other.x;
        snappedX = true;
      }
      // Align Right (X + Width)
      else if (Math.abs((other.x + other.width) - x) <= SNAP_THRESHOLD) {
        finalX = other.x + other.width;
        snappedX = true;
      }

      // Align Top / Baseline (Y)
      if (Math.abs(other.y - y) <= SNAP_THRESHOLD) {
        finalY = other.y;
        snappedY = true;
      }
    }

    // 2. Snap to Modular Grid if not snapped to an element
    if (snapToGrid) {
      if (!snappedX) finalX = Math.round(finalX / SNAP_GRID_SIZE) * SNAP_GRID_SIZE;
      if (!snappedY) finalY = Math.round(finalY / SNAP_GRID_SIZE) * SNAP_GRID_SIZE;
    }

    return { x: finalX, y: finalY, snappedX, snappedY };
  };

  /**
   * Add Tag Element onto Canvas with auto-fitting box & fixed official font size
   */
  const handleAddTag = (tagDef: TemplateFieldTag) => {
    const newId = `tag-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    
    // Auto-calculate width based on typical Thai content length
    let defaultWidth = 140;
    if (tagDef.id.includes('fullName') || tagDef.id.includes('department') || tagDef.id.includes('Address')) {
      defaultWidth = 240;
    } else if (tagDef.id.includes('reason') || tagDef.id.includes('writtenAt')) {
      defaultWidth = 200;
    } else if (tagDef.id.includes('Day') || tagDef.id.includes('totalDays')) {
      defaultWidth = 48;
    } else if (tagDef.id.includes('Year') || tagDef.id.includes('Month')) {
      defaultWidth = 72;
    }

    const rawY = 180 + (elements.length % 12) * (FIXED_LINE_HEIGHT + 6);
    const snap = calculateMagneticSnap(120, rawY);

    const newElement: CanvasTagElement = {
      id: newId,
      tag: tagDef.tag,
      label: tagDef.name,
      x: snap.x,
      y: snap.y,
      width: defaultWidth,
      height: FIXED_LINE_HEIGHT,
      fontSize: FIXED_FONT_SIZE, // Fixed 14pt standard
      fontFamily: 'TH Sarabun New, Sarabun, sans-serif',
      fontWeight: 'normal',
      textAlign: (tagDef.id.includes('Day') || tagDef.id.includes('totalDays') || tagDef.id.includes('Year')) ? 'center' : 'left',
      color: '#000000',
      page: currentPage,
    };

    setElements(prev => [...prev, newElement]);
    setSelectedId(newId);
    toast.success(`เพิ่มแท็ก "${tagDef.name}" ในหน้าที่ ${currentPage} แล้ว`);
  };

  /**
   * Add Custom Static / Dynamic Text Element created by Admin
   */
  const handleAddCustomText = () => {
    const newId = `custom-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const customCount = elements.filter(e => e.isCustom).length + 1;
    const rawY = 200 + (elements.length % 10) * (FIXED_LINE_HEIGHT + 8);
    const snap = calculateMagneticSnap(150, rawY);

    const newElement: CanvasTagElement = {
      id: newId,
      tag: `{{ข้อความกำหนดเอง_${customCount}}}`,
      label: `ข้อความกำหนดเอง ${customCount}`,
      x: snap.x,
      y: snap.y,
      width: 180,
      height: FIXED_LINE_HEIGHT,
      fontSize: FIXED_FONT_SIZE,
      fontFamily: 'TH Sarabun New, Sarabun, sans-serif',
      fontWeight: 'normal',
      textAlign: 'left',
      color: '#000000',
      page: currentPage,
      isCustom: true,
      customValue: 'ข้อความที่ต้องการระบุ',
    };

    setElements(prev => [...prev, newElement]);
    setSelectedId(newId);
    toast.success('เพิ่มกล่องข้อความกำหนดเองแล้ว พิมพ์ข้อความได้ที่แถบขวา');
  };

  // Update specific element
  const handleUpdateElement = (id: string, updates: Partial<CanvasTagElement>) => {
    setElements(prev => prev.map(el => (el.id === id ? { ...el, ...updates } : el)));
  };

  // Remove element
  const handleDeleteElement = (id: string) => {
    setElements(prev => prev.filter(el => el.id !== id));
    if (selectedId === id) setSelectedId(null);
    toast.success('ลบแท็กออกจากเอกสารแล้ว');
  };

  // Auto Align All Selected/Similar Elements
  const handleAutoAlignRow = () => {
    if (!selectedElement) return;
    const targetY = selectedElement.y;
    setElements(prev => prev.map(el => {
      if (Math.abs(el.y - targetY) <= 16) {
        return { ...el, y: targetY };
      }
      return el;
    }));
    toast.success('ดูดและจัดระดับบรรทัดให้อยู่ในระนาบเดียวกันเรียบร้อย');
  };

  // Reset all tag positions back to 2-column staging layout
  const handleResetPositions = () => {
    setElements(prev => prev.map((el, idx) => {
      const pos = getDynamicTagPosition(idx);
      return { ...el, x: pos.x, y: pos.y, width: pos.width, page: 1 };
    }));
    toast('คืนตำแหน่งแท็กทั้งหมดไปยัง Staging Area แล้ว');
  };


  // Save Mapping to Database
  const handleSaveMapping = async () => {
    setIsSaving(true);
    try {
      const config: TemplateMappingConfig = {
        version: '1.0.0',
        pageWidth: A4_WIDTH,
        pageHeight: A4_HEIGHT,
        elements,
      };

      const res = await fetch(`/api/modules/document-templates/templates/${templateId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mappingJson: JSON.stringify(config),
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success('บันทึกพิกัดแท็กบนแบบฟอร์มสำเร็จเรียบร้อย!');
        if (onSaveSuccess) onSaveSuccess();
      } else {
        toast.error(data.error || 'บันทึกไม่สำเร็จ');
      }
    } catch (err) {
      console.error(err);
      toast.error('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    } finally {
      setIsSaving(false);
    }
  };

  const selectedElement = elements.find(el => el.id === selectedId);

  // Combine standard tags and detected Word tags
  const combinedTags = React.useMemo(() => {
    const list = [...TEMPLATE_TAG_DEFINITIONS];
    if (detectedDocxTags.length > 0) {
      for (const d of detectedDocxTags) {
        if (!list.some(t => t.tag.toLowerCase() === d.tag.toLowerCase())) {
          list.unshift({
            id: `word-${d.name}`,
            tag: d.tag,
            name: `(Word) ${d.name}`,
            category: 'word' as any,
            defaultValue: `[${d.name}]`,
            description: `ตรวจพบจากไฟล์ ${d.raw}`,
          });
        }
      }
    }
    return list;
  }, [detectedDocxTags]);

  // Filtered tags for sidebar
  const filteredTags = combinedTags.filter(t => {
    const matchCat = selectedCategory === 'all' 
      ? true 
      : selectedCategory === 'word' 
        ? t.category === ('word' as any) || detectedDocxTags.some(d => d.tag.toLowerCase() === t.tag.toLowerCase())
        : t.category === selectedCategory;
    const matchSearch = !searchTag || t.name.includes(searchTag) || t.tag.toLowerCase().includes(searchTag.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-900/95 backdrop-blur-md text-slate-100 overflow-hidden select-none">
      {/* Top Navbar */}
      <header className="h-16 px-6 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-4">
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
          >
            <i className="fa-solid fa-arrow-left text-lg" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-bold text-lg text-white tracking-wide">{templateName}</h2>
              <Badge variant="primary" size="sm">{templateCode}</Badge>
            </div>
            <div className="flex items-center space-x-3 text-xs text-slate-400">
              <span>พิกัดแม่นยำด้วยระบบ Smart Magnetic Snap</span>
              <span className="text-slate-600">•</span>
              <span className="text-indigo-400 font-medium">ขนาดอักษรมาตรฐาน: {FIXED_FONT_SIZE}pt</span>
            </div>
          </div>
        </div>

        {/* Action Controls & Magnetic Toggle */}
        <div className="flex items-center space-x-3">
          {/* Snap-to-grid toggle button (Magnetic Icon) */}
          <button
            onClick={() => setSnapToGrid(!snapToGrid)}
            title="เปิด/ปิดการดูดติดช่องและเส้นบรรทัดอัตโนมัติ (Magnetic Snap)"
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-2 border transition-all ${
              snapToGrid 
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm shadow-indigo-500/30' 
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
          >
            <i className="fa-solid fa-magnet text-sm" />
            <span>{snapToGrid ? 'ระบบดูดตำแหน่ง: เปิด' : 'ระบบดูด: ปิด'}</span>
          </button>

          {/* Page Switcher Controls */}
          <div className="flex items-center bg-slate-800 rounded-xl px-2 py-1 text-xs text-slate-300 space-x-1.5 border border-slate-700">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="p-1 hover:text-white disabled:opacity-40"
              title="หน้าก่อนหน้า"
            >
              <i className="fa-solid fa-chevron-left" />
            </button>
            <span className="font-semibold text-white px-1">
              หน้า {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="p-1 hover:text-white disabled:opacity-40"
              title="หน้าถัดไป"
            >
              <i className="fa-solid fa-chevron-right" />
            </button>
            <button
              onClick={() => {
                const nextP = totalPages + 1;
                setTotalPages(nextP);
                setCurrentPage(nextP);
                toast.success(`เพิ่มหน้าที่ ${nextP} แล้ว`);
              }}
              className="px-2 py-0.5 text-[11px] bg-indigo-600 hover:bg-indigo-500 rounded text-white ml-1 font-medium flex items-center gap-1"
              title="เพิ่มหน้าใหม่สำหรับเอกสารหลายหน้า"
            >
              <i className="fa-solid fa-plus text-[10px]" />
              <span>เพิ่มหน้า</span>
            </button>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center bg-slate-800 rounded-xl px-2 py-1 text-sm text-slate-300 space-x-2 border border-slate-700">
            <button 
              onClick={() => setZoom(z => Math.max(50, z - 10))}
              className="p-1 hover:text-white"
              title="ซูมออก"
            >
              <i className="fa-solid fa-minus" />
            </button>
            <span className="w-12 text-center font-mono text-xs">{zoom}%</span>
            <button 
              onClick={() => setZoom(z => Math.min(250, z + 10))}
              className="p-1 hover:text-white"
              title="ซูมเข้า"
            >
              <i className="fa-solid fa-plus" />
            </button>
            <button 
              onClick={() => setZoom(100)}
              className="px-2 py-0.5 text-xs bg-slate-700 hover:bg-slate-600 rounded text-white"
            >
              100%
            </button>
            <button 
              onClick={() => setZoom(175)}
              className="px-2 py-0.5 text-xs bg-slate-700 hover:bg-slate-600 rounded text-white"
              title="ซูม 175% เพื่อวางตำแหน่งอย่างละเอียด"
            >
              175%
            </button>
          </div>


          {/* Toggle Preview / Edit Mode */}
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className={`px-3 py-2 rounded-xl text-xs font-medium flex items-center space-x-2 transition-all border ${
              previewMode 
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' 
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
            }`}
          >
            <i className={`fa-solid ${previewMode ? 'fa-eye' : 'fa-pen-to-square'}`} />
            <span>{previewMode ? 'พรีวิวเสมือนจริง' : 'โหมดจัดวาง'}</span>
          </button>

          {/* Reset Positions Button */}
          <button
            onClick={handleResetPositions}
            title="คืนตำแหน่งแท็กทั้งหมดกลับ Staging Area (2 คอลัมน์) เพื่อเริ่มวางใหม่"
            className="px-3 py-2 rounded-xl text-xs font-medium flex items-center space-x-1.5 bg-slate-800 text-rose-400 border border-rose-500/30 hover:bg-rose-500/10 transition-all"
          >
            <i className="fa-solid fa-rotate-left text-xs" />
            <span>Reset</span>
          </button>

          {/* Save Button */}
          <Button 
            variant="primary"
            onClick={handleSaveMapping}
            disabled={isSaving}
            className="flex items-center space-x-2 shadow-lg shadow-indigo-500/20"
          >
            <i className="fa-solid fa-floppy-disk" />
            <span>{isSaving ? 'กำลังบันทึก...' : 'บันทึกพิกัดตำแหน่ง'}</span>
          </Button>
        </div>
      </header>


      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Tags Library */}
        <aside className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
          <div className="p-4 border-b border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-200 flex items-center space-x-2">
                <i className="fa-solid fa-tags text-indigo-400" />
                <span>คลังแท็กตัวแปร</span>
              </h3>
              <span className="text-[11px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-slate-700 font-mono">
                {elements.length} แท็ก
              </span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <i className="fa-solid fa-magnifying-glass absolute left-3 top-3 text-slate-500 text-xs" />
              <input
                type="text"
                value={searchTag}
                onChange={e => setSearchTag(e.target.value)}
                placeholder="ค้นหาแท็กข้อความ..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-800 text-white placeholder-slate-500 rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Category Filter Chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[
                { id: 'all', label: 'ทั้งหมด' },
                { id: 'word', label: detectedDocxTags.length > 0 ? `📄 ตรวจพบจาก Word (${detectedDocxTags.length})` : '📄 ตรวจพบจาก Word' },
                { id: 'personnel', label: 'บุคคล' },
                { id: 'leave', label: 'การลา' },
                { id: 'date', label: 'วันที่' },
                { id: 'stats', label: 'สถิติ' },
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2.5 py-1 text-xs rounded-lg transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-indigo-600 text-white font-medium shadow-xs'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Auto Place Word Tags Button */}
            {detectedDocxTags.length > 0 && (
              <div className="pt-2 space-y-1.5">
                {/* Smart PDF scan: detect blank fields and auto-map tags */}
                <button
                  onClick={handleAutoMapTagsToPdfFields}
                  disabled={isDetectingPdfFields}
                  className="w-full py-2.5 px-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-60 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all shadow-md shadow-indigo-600/30 active:scale-[0.98]"
                  title="สแกนช่องว่าง (_____) จาก PDF โดยตรง แล้ววางแท็กลงตำแหน่งจริงอัตโนมัติ"
                >
                  {isDetectingPdfFields ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin text-xs" />
                      <span>กำลังสแกนช่องว่างจาก PDF...</span>
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-magnifying-glass-chart text-amber-300 text-xs" />
                      <span>🔍 สแกน PDF วางแท็กอัตโนมัติ ({detectedDocxTags.length} แท็ก)</span>
                    </>
                  )}
                </button>
                {/* Fallback: place all tags in staging area (manual drag) */}
                <button
                  onClick={() => handleAutoPlaceDetectedTags()}
                  className="w-full py-1.5 px-3 bg-slate-700/60 hover:bg-slate-700 text-slate-300 border border-slate-600 rounded-xl text-xs font-medium flex items-center justify-center space-x-2 transition-all"
                  title="วางแท็กทั้งหมดในพื้นที่ staging แบบ 2 คอลัมน์ เพื่อลากวางเองทีหลัง"
                >
                  <i className="fa-solid fa-grid-2 text-slate-400 text-xs" />
                  <span>วางใน Staging Area (ลากเองทีหลัง)</span>
                </button>
                {detectedPdfFields.length > 0 && (
                  <p className="text-[10px] text-emerald-400 text-center pt-0.5">
                    ✓ พบ {detectedPdfFields.length} ช่องว่างใน PDF
                  </p>
                )}
              </div>
            )}

            {/* Custom Text Button */}
            <div className="pt-1">
              <button
                onClick={handleAddCustomText}
                className="w-full py-2 px-3 bg-gradient-to-r from-emerald-600/30 to-teal-600/30 hover:from-emerald-600/40 hover:to-teal-600/40 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-medium flex items-center justify-center space-x-2 transition-all shadow-xs"
              >
                <i className="fa-solid fa-pen-nib text-emerald-400" />
                <span>+ เพิ่มข้อความกำหนดเอง (Custom Text)</span>
              </button>
            </div>

            {/* Scan Word Button */}
            {docxUrl && (
              <div className="pt-1">
                <button
                  onClick={handleScanDocx}
                  disabled={isScanningDocx}
                  className="w-full py-1.5 px-3 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 rounded-xl text-xs font-medium flex items-center justify-center space-x-1.5 transition-all"
                >
                  <i className={`fa-solid ${isScanningDocx ? 'fa-spinner fa-spin' : 'fa-file-word'}`} />
                  <span>{isScanningDocx ? 'กำลังสแกนไฟล์ Word...' : `ตรวจจับแท็กใน Word (${detectedDocxTags.length} พบ)`}</span>
                </button>
              </div>
            )}

            {/* Download Starter Word Template with All Tags */}
            <div className="pt-1">
              <a
                href="/templates/docx/starter_leave_template.docx"
                download="แบบฟอร์มใบลา_ทบ100-006_มีแท็กครบ.docx"
                className="w-full py-1.5 px-3 bg-slate-800/80 hover:bg-slate-800 text-indigo-300 hover:text-indigo-200 border border-slate-700 hover:border-indigo-500/40 rounded-xl text-[11px] font-medium flex items-center justify-center space-x-1.5 transition-all text-center block"
              >
                <i className="fa-solid fa-file-arrow-down text-[10px]" />
                <span>โหลด Word แม่แบบตัวอย่าง (มีแท็กครบ)</span>
              </a>
            </div>
          </div>

          {/* List of Available Tags */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            {filteredTags.map(tagDef => {
              const isUsed = elements.some(el => el.tag.toLowerCase() === tagDef.tag.toLowerCase());
              const isDetectedInWord = detectedDocxTags.some(d => d.tag.toLowerCase() === tagDef.tag.toLowerCase());
              return (
                <div
                  key={tagDef.id}
                  onClick={() => handleAddTag(tagDef)}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all group flex items-center justify-between shadow-xs ${
                    isDetectedInWord
                      ? 'bg-slate-800/90 hover:bg-slate-800 border-indigo-500/40 hover:border-indigo-400'
                      : 'bg-slate-800/70 hover:bg-slate-800 border-slate-700/80 hover:border-indigo-500/50'
                  }`}
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-xs text-slate-200 group-hover:text-indigo-300 transition-colors">
                        {tagDef.name}
                      </span>
                      {isDetectedInWord && (
                        <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded-full font-mono">
                          ใน Word
                        </span>
                      )}
                      {isUsed && (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full font-mono">
                          ใช้อยู่
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] font-mono text-indigo-400/90 mt-0.5">
                      {tagDef.tag}
                    </div>
                    {tagDef.description && (
                      <p className="text-[10px] text-slate-400 mt-1">{tagDef.description}</p>
                    )}
                  </div>
                  <div className="w-7 h-7 rounded-xl bg-slate-700/60 group-hover:bg-indigo-600 text-slate-300 group-hover:text-white flex items-center justify-center transition-all shrink-0">
                    <i className="fa-solid fa-plus text-xs" />
                  </div>
                </div>
              );
            })}
            {filteredTags.length === 0 && (
              <div className="text-center py-8 text-xs text-slate-500">
                ไม่พบแท็กที่ค้นหา
              </div>
            )}
          </div>
        </aside>

        {/* Center: Canvas Workspace Area */}
        <div 
          onClick={() => setSelectedId(null)}
          className="flex-1 bg-slate-950 overflow-auto flex items-center justify-center p-12 relative"
          style={{
            backgroundImage: `
              radial-gradient(circle at center, rgba(99, 102, 241, 0.08) 0, transparent 70%),
              linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)
            `,
            backgroundSize: '100% 100%, 24px 24px, 24px 24px'
          }}
        >
          {/* Scaled A4 Paper Sheet */}
          <div
            style={{
              width: `${A4_WIDTH * scale}px`,
              height: `${A4_HEIGHT * scale}px`,
              transition: 'width 0.1s ease-out, height 0.1s ease-out',
            }}
            className="relative shrink-0 shadow-2xl flex items-center justify-center my-auto mx-auto"
          >
            <div
              className="relative bg-white shadow-2xl overflow-visible"

              style={{
                width: `${A4_WIDTH}px`,
                height: `${A4_HEIGHT}px`,
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
                position: 'absolute',
                top: 0,
                left: 0,
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* Static High-Precision HTML5 Canvas Render (Zero Independent Scroll) */}
              {pdfUrl ? (
                <>
                  <canvas
                    ref={pdfCanvasRef}
                    className="absolute inset-0 w-full h-full pointer-events-none select-none block"
                    style={{ width: `${A4_WIDTH}px`, height: `${A4_HEIGHT}px` }}
                  />
                  {isPdfLoading && (
                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center text-indigo-600 text-xs font-medium z-0">
                      <i className="fa-solid fa-spinner fa-spin mr-2" /> กำลังเรนเดอร์เอกสารหน้าที่ {currentPage}...
                    </div>
                  )}
                </>
              ) : (
                <div className="absolute inset-0 p-8 border border-slate-200 pointer-events-none flex flex-col justify-between text-slate-300">
                  <div className="text-center font-bold text-xs uppercase tracking-widest text-slate-400">
                    หน้า {currentPage} (ขนาดมาตรฐาน A4: 595.28 x 841.89 pt)
                  </div>
                  <div className="text-center text-xs text-slate-400">
                    ลากแท็กไปวางในช่องว่าง หรือบนเส้นประของแบบฟอร์ม
                  </div>
                </div>
              )}

              {/* Tag Elements Placed on Canvas for CURRENT PAGE ONLY */}
              {elements
                .filter(el => (el.page || 1) === currentPage)
                .map(el => {
                const isSelected = el.id === selectedId;
                const tagDef = TEMPLATE_TAG_DEFINITIONS.find(t => t.tag === el.tag);
                const isCustom = el.isCustom || Boolean(el.customValue);
                const displayText = previewMode 
                  ? (el.customValue || tagDef?.defaultValue || el.tag) 
                  : (el.isCustom ? (el.customValue || el.tag) : (el.customValue ? `${el.tag} (${el.customValue})` : el.tag));

                return (
                  <Rnd
                    key={el.id}
                    size={{ width: el.width, height: el.height }}
                    position={{ x: el.x, y: el.y }}
                    dragGrid={snapToGrid ? [SNAP_GRID_SIZE, SNAP_GRID_SIZE] : [1, 1]}
                    resizeGrid={snapToGrid ? [SNAP_GRID_SIZE, SNAP_GRID_SIZE] : [1, 1]}
                    onDragStop={(_e, d) => {
                      const snap = calculateMagneticSnap(d.x, d.y, el.id);
                      handleUpdateElement(el.id, { x: snap.x, y: snap.y });
                    }}
                    onResizeStop={(_e, _direction, ref, _delta, position) => {
                      const snap = calculateMagneticSnap(position.x, position.y, el.id);
                      handleUpdateElement(el.id, {
                        width: Math.round(ref.offsetWidth),
                        height: FIXED_LINE_HEIGHT, // Keep fixed line height
                        x: snap.x,
                        y: snap.y,
                      });
                    }}
                    bounds="parent"
                    scale={scale}
                    className={`group ${
                      isSelected
                        ? isCustom
                          ? 'ring-2 ring-emerald-500 shadow-md z-30'
                          : 'ring-2 ring-indigo-500 shadow-md z-30'
                        : isCustom
                          ? 'hover:ring-1 hover:ring-emerald-400/60 z-10'
                          : 'hover:ring-1 hover:ring-indigo-400/60 z-10'
                    }`}
                  >
                    <div 
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        setSelectedId(el.id);
                      }}
                      className={`w-full h-full flex items-center px-1 transition-all cursor-move ${
                        previewMode 
                          ? 'bg-transparent' 
                          : isSelected
                            ? isCustom
                              ? 'border-b-2 border-emerald-500 bg-emerald-500/5'
                              : 'border-b-2 border-indigo-500 bg-indigo-500/5'
                            : isCustom
                              ? 'border-b border-dashed border-emerald-400/50 bg-transparent hover:bg-emerald-500/5'
                              : 'border-b border-dashed border-indigo-400/50 bg-transparent hover:bg-indigo-500/5'
                      }`}
                      style={{
                        fontSize: `${el.fontSize || FIXED_FONT_SIZE}px`,
                        fontFamily: el.fontFamily || 'TH Sarabun New, sans-serif',
                        fontWeight: el.fontWeight || 'normal',
                        textAlign: el.textAlign || 'left',
                        color: el.color || '#000000',
                        lineHeight: `${FIXED_LINE_HEIGHT}px`,
                        overflow: 'visible',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {/* Magnetic alignment indicator bar on left when selected */}
                      {isSelected && !previewMode && (
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${isCustom ? 'bg-emerald-600' : 'bg-indigo-600'} rounded-l`} />
                      )}

                      <span className="font-sarabun leading-none select-none flex items-center gap-1" style={{ whiteSpace: 'nowrap' }}>
                        {el.isCustom && !previewMode && (
                          <i className="fa-solid fa-pen-nib text-[9px] text-emerald-600 shrink-0" title="ข้อความกำหนดเอง" />
                        )}
                        <span>{displayText}</span>
                      </span>

                      {!previewMode && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 flex items-center shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteElement(el.id);
                            }}
                            className="w-4 h-4 bg-rose-500 text-white rounded-full flex items-center justify-center text-[9px] hover:bg-rose-600 shadow-xs"
                            title="ลบแท็กนี้"
                          >
                            <i className="fa-solid fa-xmark" />
                          </button>
                        </div>
                      )}
                    </div>
                  </Rnd>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Properties Panel for Selected Tag */}
        {selectedElement && (
          <aside className="w-72 bg-slate-900 border-l border-slate-800 p-5 flex flex-col shrink-0 space-y-4 text-xs overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-1.5">
                <i className="fa-solid fa-sliders text-indigo-400" />
                <h4 className="font-bold text-slate-200">คุณสมบัติการล็อกพิกัด</h4>
              </div>
              <button
                onClick={() => handleDeleteElement(selectedElement.id)}
                className="text-rose-400 hover:text-rose-300 p-1"
                title="ลบแท็กนี้"
              >
                <i className="fa-solid fa-trash-can" />
              </button>
            </div>

            <div className="space-y-3.5">
              {/* If Custom Text Element */}
              {selectedElement.isCustom ? (
                <div className="space-y-2.5 p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <label className="block text-emerald-300 font-semibold text-xs">
                      <i className="fa-solid fa-pen-to-square mr-1.5" />
                      ข้อความที่ต้องการแสดง
                    </label>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-medium">
                      กำหนดเอง
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    value={selectedElement.customValue || ''}
                    onChange={e => handleUpdateElement(selectedElement.id, { customValue: e.target.value })}
                    placeholder="พิมพ์ข้อความที่ต้องการให้พิมพ์ลงแบบฟอร์ม..."
                    className="w-full bg-slate-800 border border-emerald-500/40 text-white rounded-xl px-2.5 py-2 text-xs focus:outline-none focus:border-emerald-400 font-sarabun"
                  />
                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">ชื่อแท็กอ้างอิง (Tag Name)</label>
                    <input
                      type="text"
                      value={selectedElement.tag}
                      onChange={e => handleUpdateElement(selectedElement.id, { tag: e.target.value, label: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 text-indigo-300 rounded-xl px-2.5 py-1.5 font-mono text-xs"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-slate-400 mb-1">แท็กตัวแปร</label>
                  <div className="font-mono bg-slate-800 text-indigo-300 px-2.5 py-2 rounded-xl border border-slate-700 font-semibold flex items-center justify-between">
                    <span>{selectedElement.tag}</span>
                    <span className="text-[10px] text-emerald-400 font-normal">ล็อกความสูง {FIXED_LINE_HEIGHT}pt</span>
                  </div>
                  <div className="mt-2">
                    <label className="block text-slate-400 text-[11px] mb-1">
                      ข้อความคงที่บังคับพิมพ์ (เว้นว่างเพื่อดึงจากระบบ)
                    </label>
                    <input
                      type="text"
                      value={selectedElement.customValue || ''}
                      onChange={e => handleUpdateElement(selectedElement.id, { customValue: e.target.value })}
                      placeholder="ดึงข้อมูลจากระบบอัตโนมัติ"
                      className="w-full bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-500 rounded-xl px-2.5 py-1.5 text-xs font-sarabun"
                    />
                  </div>
                </div>
              )}

              {/* ── Form Generation Options (การสร้างแบบฟอร์ม) ── */}
              {isDateTag(selectedElement.tag) ? (
                <div className="p-3 bg-slate-800/60 border border-slate-700/60 rounded-2xl flex items-start gap-2.5 text-xs text-slate-400">
                  <i className="fa-solid fa-calendar-check text-indigo-400 mt-0.5 shrink-0" />
                  <div className="leading-relaxed text-[11px]">
                    <span className="text-slate-200 font-semibold block mb-0.5">แท็กวันที่เชื่อมโยงอัตโนมัติ</span>
                    แท็กนี้ถูกเชื่อมโยงกับปฏิทิน (DatePicker) และวันที่ปัจจุบันของระบบในแบบฟอร์มโดยอัตโนมัติ จึงไม่ต้องตั้งค่าคุณสมบัติฟอร์มแยก
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-slate-800/90 border border-slate-700/80 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-200 font-bold flex items-center gap-1.5 text-xs">
                      <i className="fa-solid fa-list-check text-primary-400" />
                      <span>สร้างเป็นช่องในแบบฟอร์ม (Form)</span>
                    </label>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedElement.includeInForm ?? true}
                        onChange={e => handleUpdateElement(selectedElement.id, { includeInForm: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-8 h-4 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    เปิดตัวเลือกนี้เพื่อนำแท็กนี้ไปสร้างเป็นช่องกรอกข้อมูลในแบบฟอร์มยื่นคำขออัตโนมัติ
                  </p>

                  {(selectedElement.includeInForm ?? true) && (
                    <div className="space-y-2.5 pt-2 border-t border-slate-700/60">
                      <div>
                        <label className="block text-slate-400 text-[11px] mb-1">ชื่อช่องในฟอร์ม (Form Label)</label>
                        <input
                          type="text"
                          value={selectedElement.formLabel ?? selectedElement.label}
                          onChange={e => handleUpdateElement(selectedElement.id, { formLabel: e.target.value })}
                          placeholder={selectedElement.label}
                          className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-primary-500 font-prompt"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 text-[11px] mb-1">ประเภทช่องกรอก (Input Type)</label>
                        <select
                          value={selectedElement.formInputType ?? getDefaultInputType(selectedElement.tag)}
                          onChange={e => handleUpdateElement(selectedElement.id, { formInputType: e.target.value as any })}
                          className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-primary-500 font-prompt"
                        >
                          <option value="text">ข้อความสั้น (Text)</option>
                          <option value="textarea">ข้อความยาว (Textarea)</option>
                          <option value="date">วันที่ (DatePicker)</option>
                          <option value="number">ตัวเลข (Number)</option>
                          <option value="readonly">ดึงข้อมูลอัตโนมัติ (Read-only)</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between pt-0.5">
                        <label className="text-slate-300 text-[11px] flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedElement.isRequired ?? false}
                            onChange={e => handleUpdateElement(selectedElement.id, { isRequired: e.target.checked })}
                            className="rounded border-slate-700 text-primary-600 focus:ring-primary-500 bg-slate-900"
                          />
                          <span>จำเป็นต้องกรอก (Required)</span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Quick Action: Magnetic Auto-Align */}
              <div className="pt-1">
                <button
                  onClick={handleAutoAlignRow}
                  className="w-full py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 rounded-xl font-medium flex items-center justify-center space-x-2 transition-colors"
                >
                  <i className="fa-solid fa-arrows-to-dot text-sm" />
                  <span>ดูดแนวบรรทัดให้ตรงกัน</span>
                </button>
              </div>

              {/* Coordinates (with Snap step) */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">พิกัด X (แนวนอน)</label>
                  <input
                    type="number"
                    step={SNAP_GRID_SIZE}
                    value={selectedElement.x}
                    onChange={e => handleUpdateElement(selectedElement.id, { x: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-2.5 py-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">พิกัด Y (แนวตั้ง)</label>
                  <input
                    type="number"
                    step={SNAP_GRID_SIZE}
                    value={selectedElement.y}
                    onChange={e => handleUpdateElement(selectedElement.id, { y: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-2.5 py-1.5 font-mono"
                  />
                </div>
              </div>

              {/* Dimensions */}
              <div>
                <label className="block text-slate-400 mb-1">ความกว้างช่องกรอก (Width pt)</label>
                <input
                  type="number"
                  step={SNAP_GRID_SIZE}
                  value={selectedElement.width}
                  onChange={e => handleUpdateElement(selectedElement.id, { width: Number(e.target.value) })}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-2.5 py-1.5 font-mono"
                />
                <p className="text-[10px] text-slate-500 mt-1">ขยายหรือย่อให้พอดีกับความกว้างของช่องว่างในแบบฟอร์ม</p>
              </div>

              {/* Typography Settings (Fixed to standard 14pt by default) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-400">ขนาดตัวอักษร (Font Size)</label>
                  <span className="font-mono text-indigo-300 font-bold">{selectedElement.fontSize || FIXED_FONT_SIZE} pt</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  {[12, 14, 16].map(sz => (
                    <button
                      key={sz}
                      onClick={() => handleUpdateElement(selectedElement.id, { fontSize: sz })}
                      className={`py-1.5 rounded-xl border text-xs font-mono font-medium transition-all ${
                        (selectedElement.fontSize || FIXED_FONT_SIZE) === sz
                          ? 'bg-indigo-600 text-white border-indigo-500'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                      }`}
                    >
                      {sz} pt {sz === FIXED_FONT_SIZE && '(มาตรฐาน)'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">การจัดวางข้อความในช่อง</label>
                <div className="grid grid-cols-3 gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
                  {(['left', 'center', 'right'] as const).map(align => (
                    <button
                      key={align}
                      onClick={() => handleUpdateElement(selectedElement.id, { textAlign: align })}
                      className={`py-1.5 rounded-lg capitalize ${
                        selectedElement.textAlign === align
                          ? 'bg-indigo-600 text-white font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                      title={`จัดชิด${align === 'left' ? 'ซ้าย' : align === 'center' ? 'กึ่งกลาง' : 'ขวา'}`}
                    >
                      <i className={`fa-solid fa-align-${align}`} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
