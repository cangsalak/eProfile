import { prisma, requirePermission } from '@/modules/core';
import { NextRequest, NextResponse } from 'next/server';
import PizZip from 'pizzip';
import fs from 'fs';
import path from 'path';

/**
 * Scan a Word .docx file and extract all placeholder tags like {tag} or {{tag}}
 */
export async function handleScanDocxTags(req: NextRequest, context: { params: Record<string, string | string[]> }) {
  const { error } = await requirePermission(req as any, 'MANAGE_SYSTEM');
  if (error) return error;

  try {
    const { docxUrl, templateId } = await req.json();

    let fileBuffer: Buffer | null = null;

    if (docxUrl) {
      if (docxUrl.startsWith('http')) {
        const res = await fetch(docxUrl);
        if (res.ok) {
          fileBuffer = Buffer.from(await res.arrayBuffer());
        }
      } else {
        // Local path
        const cleanedPath = docxUrl.startsWith('/') ? docxUrl.substring(1) : docxUrl;
        const localPath = path.join(process.cwd(), 'public', cleanedPath);
        if (fs.existsSync(localPath)) {
          fileBuffer = fs.readFileSync(localPath);
        } else {
          const directPath = path.join(process.cwd(), cleanedPath);
          if (fs.existsSync(directPath)) {
            fileBuffer = fs.readFileSync(directPath);
          }
        }
      }
    } else if (templateId) {
      const template = await prisma.documentTemplate.findUnique({ where: { id: templateId } });
      if (template?.docxUrl) {
        if (template.docxUrl.startsWith('http')) {
          const res = await fetch(template.docxUrl);
          if (res.ok) fileBuffer = Buffer.from(await res.arrayBuffer());
        } else {
          const cleanedPath = template.docxUrl.startsWith('/') ? template.docxUrl.substring(1) : template.docxUrl;
          const localPath = path.join(process.cwd(), 'public', cleanedPath);
          if (fs.existsSync(localPath)) {
            fileBuffer = fs.readFileSync(localPath);
          }
        }
      }
    }

    if (!fileBuffer) {
      return NextResponse.json({ error: 'ไม่พบไฟล์ Word หรือไม่สามารถอ่านไฟล์ได้' }, { status: 400 });
    }

    // Unzip docx to read word/document.xml
    const zip = new PizZip(fileBuffer);
    const documentXml = zip.file('word/document.xml')?.asText() || '';
    const headerXmls = Object.keys(zip.files)
      .filter(f => f.startsWith('word/header') && f.endsWith('.xml'))
      .map(f => zip.file(f)?.asText() || '')
      .join(' ');
    const footerXmls = Object.keys(zip.files)
      .filter(f => f.startsWith('word/footer') && f.endsWith('.xml'))
      .map(f => zip.file(f)?.asText() || '')
      .join(' ');

    const combinedXml = `${documentXml} ${headerXmls} ${footerXmls}`;

    // Regex to detect both {tag} and {{tag}}
    // Word sometimes splits text into runs <w:t>, so we also strip basic XML tags to get pure text runs
    const strippedText = combinedXml.replace(/<[^>]+>/g, '');
    
    // Find all occurrences of {something} or {{something}}
    const tagMatches = strippedText.match(/\{+[a-zA-Z0-9_\u0E00-\u0E7F]+\}+/g) || [];
    
    // Deduplicate and normalize
    const uniqueTags = Array.from(new Set(tagMatches)).map(rawTag => {
      // Normalize to clean tag name e.g. "fullName"
      const cleanName = rawTag.replace(/[\{\}]/g, '').trim();
      return {
        raw: rawTag,
        tag: `{{${cleanName}}}`,
        name: cleanName,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        totalFound: uniqueTags.length,
        tags: uniqueTags,
      }
    });

  } catch (err: any) {
    console.error('Scan DOCX tags error:', err);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการตรวจสอบไฟล์ Word', details: err.message }, { status: 500 });
  }
}
