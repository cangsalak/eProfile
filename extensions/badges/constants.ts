/**
 * ISO/IEC 7810 Type ID-1 (CR80 Standard) Specifications
 * Official standard for Thai National ID, Driving License, Officer IDs, and CR80 Cards.
 */
export const CR80_DIMENSIONS = {
  /** Standard Portrait Width: 53.98 mm (~5.4 cm) */
  width: '53.98mm',
  /** Standard Portrait Height: 85.60 mm (~8.56 cm) */
  height: '85.60mm',
  /** Standard Landscape Width: 85.60 mm (~8.56 cm) */
  landscapeWidth: '85.60mm',
  /** Standard Landscape Height: 53.98 mm (~5.4 cm) */
  landscapeHeight: '53.98mm',
  /** Standard ISO ID-1 Corner Radius: 3.18 mm (~1/8 inch) */
  cornerRadius: '3.18mm',
  /** Center Fold / Cut Dividing Guide Gap for 2-sided Sheet Print: 0.05 mm */
  pairGap: '0.05mm',
  /** Standard Physical PVC Thickness: 0.76 mm (30 mil) */
  thickness: '0.76mm',
} as const;
