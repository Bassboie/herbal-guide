import fs from 'fs';
import path from 'path';
import {
  AILMENTS_REMEDIES_LIST,
  AUTHOR_INFO,
  BENEFITS,
  FAQS,
  INSIDE_TOPICS,
} from '../src/data/guideData.ts';

/**
 * Pure-Node PDF 1.4 Generator for the Herbal Guide Digital Handbook.
 * Writes strictly to private server storage (NEVER public/ or dist/).
 */

const PAGE_WIDTH = 595; // A4 width in pt
const PAGE_HEIGHT = 842; // A4 height in pt
const MARGIN_LEFT = 54;
const MARGIN_RIGHT = 54;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;
const TOP_Y = PAGE_HEIGHT - 64;
const BOTTOM_Y = 58;

type FontKey = 'F1' | 'F2' | 'F3'; // F1=Helvetica, F2=Helvetica-Bold, F3=Times-Italic

interface PageState {
  commands: string[];
  y: number;
}

/**
 * Normalizes Unicode punctuation to clean WinAnsi / PDFDocEncoding ASCII characters
 * so built-in Type1 PDF fonts render cleanly without encoding artifacts.
 */
function sanitizePdfText(raw: string): string {
  return String(raw || '')
    .replace(/\u20A6/g, 'NGN ')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '--')
    .replace(/\u2022/g, '*')
    .replace(/\u00B7/g, '|')
    .replace(/\u00A9/g, '(c)')
    .replace(/[^\x20-\x7E]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapePdfLiteral(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

function estimateCharWidth(font: FontKey, fontSize: number): number {
  if (font === 'F2') return fontSize * 0.54;
  if (font === 'F3') return fontSize * 0.46;
  return fontSize * 0.50;
}

function wrapText(text: string, maxWidthPt: number, font: FontKey, fontSize: number): string[] {
  const clean = sanitizePdfText(text);
  if (!clean) return [];

  const avgChar = estimateCharWidth(font, fontSize);
  const maxChars = Math.max(16, Math.floor(maxWidthPt / avgChar));

  const words = clean.split(' ');
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    if (!current) {
      current = word;
    } else if (current.length + 1 + word.length <= maxChars) {
      current = `${current} ${word}`;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

class PdfDocumentBuilder {
  private pages: PageState[] = [];
  private currentPage!: PageState;

  constructor() {
    this.newPage();
  }

  newPage(): void {
    this.currentPage = {
      commands: [],
      y: TOP_Y,
    };
    this.pages.push(this.currentPage);
  }

  private ensureSpace(neededPt: number): void {
    if (this.currentPage.y - neededPt < BOTTOM_Y) {
      this.newPage();
    }
  }

  addSpacer(pt: number): void {
    this.currentPage.y -= pt;
    if (this.currentPage.y < BOTTOM_Y) {
      this.newPage();
    }
  }

  drawRule(colorRgb: [number, number, number] = [0.83, 0.69, 0.22], thickness = 0.75): void {
    this.ensureSpace(14);
    const y = this.currentPage.y;
    const [r, g, b] = colorRgb;
    this.currentPage.commands.push(
      `q ${r} ${g} ${b} RG ${thickness} w ${MARGIN_LEFT} ${y.toFixed(2)} m ${PAGE_WIDTH - MARGIN_RIGHT} ${y.toFixed(2)} l S Q`
    );
    this.currentPage.y -= 12;
  }

  drawFilledBox(
    heightPt: number,
    fillRgb: [number, number, number],
    borderRgb?: [number, number, number]
  ): number {
    this.ensureSpace(heightPt + 8);
    const topY = this.currentPage.y;
    const bottomY = topY - heightPt;
    const [fr, fg, fb] = fillRgb;
    if (borderRgb) {
      const [br, bg, bb] = borderRgb;
      this.currentPage.commands.push(
        `q ${fr} ${fg} ${fb} rg ${br} ${bg} ${bb} RG 1 w ${MARGIN_LEFT} ${bottomY.toFixed(2)} ${CONTENT_WIDTH} ${heightPt.toFixed(2)} re B Q`
      );
    } else {
      this.currentPage.commands.push(
        `q ${fr} ${fg} ${fb} rg ${MARGIN_LEFT} ${bottomY.toFixed(2)} ${CONTENT_WIDTH} ${heightPt.toFixed(2)} re f Q`
      );
    }
    return topY;
  }

  drawLineAt(
    text: string,
    x: number,
    y: number,
    font: FontKey,
    fontSize: number,
    colorRgb: [number, number, number] = [0.05, 0.16, 0.09]
  ): void {
    const clean = escapePdfLiteral(sanitizePdfText(text));
    const [r, g, b] = colorRgb;
    this.currentPage.commands.push(
      `BT /${font} ${fontSize} Tf ${r} ${g} ${b} rg 1 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)} Tm (${clean}) Tj ET`
    );
  }

  addParagraph(
    text: string,
    options: {
      font?: FontKey;
      fontSize?: number;
      lineHeight?: number;
      indent?: number;
      color?: [number, number, number];
      spaceAfter?: number;
    } = {}
  ): void {
    const font = options.font || 'F1';
    const fontSize = options.fontSize || 10.5;
    const lineHeight = options.lineHeight || fontSize * 1.45;
    const indent = options.indent || 0;
    const color = options.color || [0.12, 0.16, 0.13];
    const spaceAfter = options.spaceAfter ?? 6;

    const lines = wrapText(text, CONTENT_WIDTH - indent, font, fontSize);
    for (const line of lines) {
      this.ensureSpace(lineHeight);
      this.drawLineAt(line, MARGIN_LEFT + indent, this.currentPage.y, font, fontSize, color);
      this.currentPage.y -= lineHeight;
    }
    if (spaceAfter > 0) {
      this.currentPage.y -= spaceAfter;
    }
  }

  addSectionHeading(eyebrow: string, title: string): void {
    this.ensureSpace(56);
    if (eyebrow) {
      this.drawLineAt(
        eyebrow.toUpperCase(),
        MARGIN_LEFT,
        this.currentPage.y,
        'F2',
        8.5,
        [0.65, 0.50, 0.10]
      );
      this.currentPage.y -= 14;
    }
    const titleLines = wrapText(title, CONTENT_WIDTH, 'F2', 15);
    for (const line of titleLines) {
      this.ensureSpace(20);
      this.drawLineAt(line, MARGIN_LEFT, this.currentPage.y, 'F2', 15, [0.02, 0.10, 0.05]);
      this.currentPage.y -= 20;
    }
    this.drawRule([0.83, 0.69, 0.22], 1.0);
  }

  addCoverPage(): void {
    // Deep forest green cover band
    const topY = this.drawFilledBox(190, [0.024, 0.102, 0.055], [0.83, 0.69, 0.22]);
    this.drawLineAt(
      'VERIFIED DIGITAL EDITION  |  MASTER GUIDE',
      MARGIN_LEFT + 22,
      topY - 38,
      'F2',
      9,
      [0.96, 0.82, 0.38]
    );
    this.drawLineAt(
      'HERBAL GUIDE',
      MARGIN_LEFT + 22,
      topY - 76,
      'F2',
      28,
      [1, 1, 1]
    );
    this.drawLineAt(
      'Traditional Wellness Handbook &',
      MARGIN_LEFT + 22,
      topY - 106,
      'F2',
      15,
      [0.92, 0.89, 0.80]
    );
    this.drawLineAt(
      'Practical Home Reference Compendium',
      MARGIN_LEFT + 22,
      topY - 126,
      'F2',
      15,
      [0.92, 0.89, 0.80]
    );
    this.drawLineAt(
      `Authored by ${AUTHOR_INFO.name}  |  ${AUTHOR_INFO.title}`,
      MARGIN_LEFT + 22,
      topY - 162,
      'F1',
      10,
      [0.83, 0.69, 0.22]
    );

    this.currentPage.y = topY - 218;

    this.addSectionHeading('Digital Handbook Overview', 'About This Reference Manual');
    this.addParagraph(
      'Welcome to Herbal Guide. This structured wellness handbook brings together traditional West African herbal knowledge, safe home preparation standards, storage hygiene, and 29 practical ailments & remedies reference entries inside one clear digital manual.',
      { fontSize: 11, spaceAfter: 10 }
    );
    this.addParagraph(
      `Author's Note: "${AUTHOR_INFO.reason}"`,
      { font: 'F3', fontSize: 10.5, color: [0.16, 0.24, 0.18], spaceAfter: 14 }
    );

    this.addSectionHeading('What You Will Learn Inside', 'Key Educational Pillars');
    for (const benefit of BENEFITS) {
      this.addParagraph(`* ${benefit.title}: ${benefit.description}`, {
        font: 'F1',
        fontSize: 10,
        indent: 8,
        spaceAfter: 7,
      });
    }

    this.addSpacer(8);
    const noticeTop = this.drawFilledBox(92, [0.98, 0.96, 0.90], [0.83, 0.69, 0.22]);
    this.drawLineAt(
      'EDUCATIONAL & MEDICAL BOUNDARY NOTICE',
      MARGIN_LEFT + 14,
      noticeTop - 20,
      'F2',
      9.5,
      [0.50, 0.36, 0.05]
    );
    const disclaimerLines = wrapText(
      'This handbook is written strictly for educational and cultural wellness reference. Traditional remedies support everyday health habits but never replace licensed medical diagnosis, laboratory testing, prescription drugs, or emergency hospital care. Always consult a qualified physician or pharmacist before starting any new herbal preparation, especially if pregnant, nursing, or managing chronic conditions.',
      CONTENT_WIDTH - 28,
      'F1',
      8.8
    );
    let ny = noticeTop - 36;
    for (const line of disclaimerLines.slice(0, 4)) {
      this.drawLineAt(line, MARGIN_LEFT + 14, ny, 'F1', 8.8, [0.22, 0.20, 0.15]);
      ny -= 13;
    }
    this.currentPage.y = noticeTop - 108;
  }

  buildBytes(): Buffer {
    const totalPages = this.pages.length;

    // Stamp running header & footer on every content page (pages 2..N) and footer on cover
    this.pages.forEach((page, idx) => {
      const pageNum = idx + 1;
      if (pageNum > 1) {
        page.commands.unshift(
          `BT /F1 8 Tf 0.45 0.50 0.46 rg 1 0 0 1 ${MARGIN_LEFT} ${PAGE_HEIGHT - 36} Tm (${escapePdfLiteral('HERBAL GUIDE  |  TRADITIONAL WELLNESS HANDBOOK BY PRINCE EMMANUEL')}) Tj ET`,
          `q 0.88 0.85 0.76 RG 0.5 w ${MARGIN_LEFT} ${PAGE_HEIGHT - 44} m ${PAGE_WIDTH - MARGIN_RIGHT} ${PAGE_HEIGHT - 44} l S Q`
        );
      }

      const footerLeft = `Personal Licensed Copy  |  Support: ${AUTHOR_INFO.email}`;
      const footerRight = `Page ${pageNum} of ${totalPages}`;
      page.commands.push(
        `q 0.88 0.85 0.76 RG 0.5 w ${MARGIN_LEFT} 40 m ${PAGE_WIDTH - MARGIN_RIGHT} 40 l S Q`,
        `BT /F1 8 Tf 0.45 0.50 0.46 rg 1 0 0 1 ${MARGIN_LEFT} 26 Tm (${escapePdfLiteral(footerLeft)}) Tj ET`,
        `BT /F2 8 Tf 0.20 0.28 0.22 rg 1 0 0 1 ${PAGE_WIDTH - MARGIN_RIGHT - 56} 26 Tm (${escapePdfLiteral(footerRight)}) Tj ET`
      );
    });

    // Assemble PDF objects:
    // 1 = Catalog, 2 = Pages, 3 = Font F1 (Helvetica), 4 = Font F2 (Helvetica-Bold), 5 = Font F3 (Times-Italic)
    // For each page i: content stream obj = 6 + i*2, page obj = 7 + i*2
    const objects: string[] = [];

    const pageObjIds: number[] = [];
    for (let i = 0; i < totalPages; i++) {
      pageObjIds.push(7 + i * 2);
    }

    objects.push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');
    objects.push(
      `2 0 obj\n<< /Type /Pages /Kids [${pageObjIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${totalPages} >>\nendobj\n`
    );
    objects.push(
      '3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj\n'
    );
    objects.push(
      '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj\n'
    );
    objects.push(
      '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Times-Italic /Encoding /WinAnsiEncoding >>\nendobj\n'
    );

    this.pages.forEach((page, i) => {
      const streamObjId = 6 + i * 2;
      const pageObjId = 7 + i * 2;
      const streamBody = page.commands.join('\n') + '\n';
      const streamLen = Buffer.byteLength(streamBody, 'latin1');

      objects.push(
        `${streamObjId} 0 obj\n<< /Length ${streamLen} >>\nstream\n${streamBody}endstream\nendobj\n`
      );
      objects.push(
        `${pageObjId} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 3 0 R /F2 4 0 R /F3 5 0 R >> >> /Contents ${streamObjId} 0 R >>\nendobj\n`
      );
    });

    const header = '%PDF-1.4\n%\xE2\xE3\xCF\xD3\n';
    const chunks: Buffer[] = [Buffer.from(header, 'latin1')];
    const offsets: number[] = [0];
    let currentOffset = chunks[0].length;

    for (const objStr of objects) {
      offsets.push(currentOffset);
      const buf = Buffer.from(objStr, 'latin1');
      chunks.push(buf);
      currentOffset += buf.length;
    }

    const xrefOffset = currentOffset;
    const xrefLines: string[] = [`xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`];
    for (let i = 1; i <= objects.length; i++) {
      xrefLines.push(`${String(offsets[i]).padStart(10, '0')} 00000 n \n`);
    }
    xrefLines.push(
      `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`
    );

    chunks.push(Buffer.from(xrefLines.join(''), 'latin1'));
    return Buffer.concat(chunks);
  }
}

export function generateHerbalGuidePdfBuffer(): Buffer {
  const doc = new PdfDocumentBuilder();

  // Page 1: Cover & Overview
  doc.addCoverPage();

  // Part I: Core Wellness & Botanical Chapters
  doc.newPage();
  doc.addSectionHeading('Part I  |  Foundational Chapters', '8 Core Natural Wellness Chapters');
  doc.addParagraph(
    `By ${AUTHOR_INFO.name}: ${AUTHOR_INFO.bio}`,
    { fontSize: 10, color: [0.22, 0.28, 0.24], spaceAfter: 12 }
  );

  for (const chapter of INSIDE_TOPICS) {
    doc.addParagraph(
      `Chapter ${chapter.number}: ${chapter.title}  [${chapter.sampleTag}]`,
      { font: 'F2', fontSize: 11.5, color: [0.04, 0.20, 0.10], spaceAfter: 3 }
    );
    doc.addParagraph(chapter.summary, { fontSize: 10, spaceAfter: 4 });
    for (const point of chapter.keyPoints) {
      doc.addParagraph(`* ${point}`, { fontSize: 9.5, indent: 12, spaceAfter: 2 });
    }
    doc.addSpacer(8);
  }

  // Part II: 29 Documented Remedies Reference Directory
  doc.newPage();
  doc.addSectionHeading(
    'Part II  |  Master Guide',
    '29 Documented Remedies & Preparation Protocols'
  );
  doc.addParagraph(
    'Each entry below documents traditional preparation methods, key purpose notes, and practical hygiene/usage details for calm and responsible household reference.',
    { fontSize: 10, color: [0.22, 0.28, 0.24], spaceAfter: 10 }
  );

  for (const item of AILMENTS_REMEDIES_LIST) {
    doc.addParagraph(
      `${String(item.id).padStart(2, '0')}. ${item.name}  --  [${item.tag}]`,
      { font: 'F2', fontSize: 11, color: [0.04, 0.20, 0.10], spaceAfter: 2 }
    );
    doc.addParagraph(`Preparation Method: ${item.method}`, {
      font: 'F2',
      fontSize: 9.5,
      indent: 10,
      color: [0.45, 0.34, 0.06],
      spaceAfter: 2,
    });
    doc.addParagraph(`Overview: ${item.note}`, {
      font: 'F1',
      fontSize: 9.5,
      indent: 10,
      spaceAfter: 2,
    });
    doc.addParagraph(`Guidance & Safety Details: ${item.details}`, {
      font: 'F1',
      fontSize: 9.5,
      indent: 10,
      color: [0.18, 0.24, 0.20],
      spaceAfter: 8,
    });
  }

  // Part III: Reader FAQ & Support
  doc.newPage();
  doc.addSectionHeading('Part III  |  Reader Reference', 'Frequently Asked Questions & Licensing');
  for (const faq of FAQS) {
    doc.addParagraph(`Q: ${faq.question}`, {
      font: 'F2',
      fontSize: 10.5,
      color: [0.04, 0.20, 0.10],
      spaceAfter: 2,
    });
    doc.addParagraph(`A: ${faq.answer}`, {
      font: 'F1',
      fontSize: 9.8,
      indent: 10,
      spaceAfter: 8,
    });
  }

  return doc.buildBytes();
}

/**
 * Ensures a valid private PDF binary exists at the given private path
 * without overwriting an existing custom PDF uploaded by the site owner.
 */
export function ensureDefaultPrivateHandbookPdf(targetPath: string): string {
  const dir = path.dirname(targetPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  let hasValidExistingPdf = false;
  if (fs.existsSync(targetPath)) {
    try {
      const fd = fs.openSync(targetPath, 'r');
      const headerBuf = Buffer.alloc(5);
      const bytesRead = fs.readSync(fd, headerBuf, 0, 5, 0);
      fs.closeSync(fd);
      if (bytesRead === 5 && headerBuf.toString('latin1') === '%PDF-') {
        hasValidExistingPdf = true;
      }
    } catch {
      hasValidExistingPdf = false;
    }
  }

  if (!hasValidExistingPdf) {
    const pdfBuffer = generateHerbalGuidePdfBuffer();
    fs.writeFileSync(targetPath, pdfBuffer);
  }

  return targetPath;
}

interface CachedUpstreamPdf {
  url: string;
  buffer: Buffer;
  fetchedAt: number;
}

const UPSTREAM_CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes
let cachedUpstreamPdf: CachedUpstreamPdf | null = null;

function extractGoogleDriveFileId(rawUrl: string): string | null {
  try {
    const parsed = new URL(rawUrl);
    if (
      parsed.hostname !== 'drive.google.com' &&
      parsed.hostname !== 'drive.usercontent.google.com' &&
      parsed.hostname !== 'docs.google.com'
    ) {
      return null;
    }

    const pathMatch = parsed.pathname.match(/\/file\/d\/([a-zA-Z0-9_-]{10,})/);
    if (pathMatch?.[1]) return pathMatch[1];

    const idParam = parsed.searchParams.get('id');
    if (idParam && /^[a-zA-Z0-9_-]{10,}$/.test(idParam)) return idParam;
  } catch {
    return null;
  }
  return null;
}

function isPdfBuffer(buf: Buffer): boolean {
  return buf.length >= 5 && buf.subarray(0, 5).toString('latin1') === '%PDF-';
}

/**
 * Fetches a PDF strictly on the server side from an HTTPS URL (including Google Drive links).
 * Handles Google Drive direct download normalization and large-file confirm tokens.
 * Returns null if the upstream returns HTML (e.g. Google Sign-In for restricted files) or fails.
 */
export async function fetchVerifiedUpstreamPdf(
  sourceUrl: string
): Promise<{ buffer: Buffer } | { errorReason: 'auth_required' | 'not_pdf' | 'upstream_error'; status?: number }> {
  if (!sourceUrl || !/^https:\/\//i.test(sourceUrl)) {
    return { errorReason: 'upstream_error' };
  }

  const now = Date.now();
  if (
    cachedUpstreamPdf &&
    cachedUpstreamPdf.url === sourceUrl &&
    now - cachedUpstreamPdf.fetchedAt < UPSTREAM_CACHE_TTL_MS
  ) {
    return { buffer: cachedUpstreamPdf.buffer };
  }

  const driveFileId = extractGoogleDriveFileId(sourceUrl);
  const targetUrl = driveFileId
    ? `https://drive.usercontent.google.com/download?id=${encodeURIComponent(driveFileId)}&export=download&confirm=t`
    : sourceUrl;

  try {
    const resp = await fetch(targetUrl, {
      method: 'GET',
      redirect: 'follow',
      signal: AbortSignal.timeout(15000),
      headers: {
        'User-Agent': 'HerbalGuide-ServerPDFProxy/1.0',
        Accept: 'application/pdf,*/*;q=0.8',
      },
    });

    const finalUrl = resp.url || '';
    if (finalUrl.includes('accounts.google.com')) {
      return { errorReason: 'auth_required', status: resp.status };
    }

    if (!resp.ok) {
      return { errorReason: 'upstream_error', status: resp.status };
    }

    const firstBuf = Buffer.from(await resp.arrayBuffer());
    if (isPdfBuffer(firstBuf)) {
      cachedUpstreamPdf = { url: sourceUrl, buffer: firstBuf, fetchedAt: now };
      return { buffer: firstBuf };
    }

    // Check if Google Drive returned a virus-scan HTML confirmation page instead of Sign-In
    const htmlSnippet = firstBuf.subarray(0, 16384).toString('utf8');
    if (
      driveFileId &&
      htmlSnippet.includes('download-form') &&
      !htmlSnippet.includes('ServiceLogin')
    ) {
      const confirmMatch = htmlSnippet.match(/name="confirm"\s+value="([^"]+)"/i);
      const uuidMatch = htmlSnippet.match(/name="uuid"\s+value="([^"]+)"/i);
      if (confirmMatch?.[1]) {
        const confirmUrl = new URL('https://drive.usercontent.google.com/download');
        confirmUrl.searchParams.set('id', driveFileId);
        confirmUrl.searchParams.set('export', 'download');
        confirmUrl.searchParams.set('confirm', confirmMatch[1]);
        if (uuidMatch?.[1]) {
          confirmUrl.searchParams.set('uuid', uuidMatch[1]);
        }

        const retryResp = await fetch(confirmUrl.toString(), {
          method: 'GET',
          redirect: 'follow',
          signal: AbortSignal.timeout(15000),
          headers: {
            'User-Agent': 'HerbalGuide-ServerPDFProxy/1.0',
            Accept: 'application/pdf,*/*;q=0.8',
          },
        });

        if (retryResp.ok && !retryResp.url.includes('accounts.google.com')) {
          const retryBuf = Buffer.from(await retryResp.arrayBuffer());
          if (isPdfBuffer(retryBuf)) {
            cachedUpstreamPdf = { url: sourceUrl, buffer: retryBuf, fetchedAt: now };
            return { buffer: retryBuf };
          }
        }
      }
    }

    return { errorReason: 'not_pdf', status: resp.status };
  } catch {
    return { errorReason: 'upstream_error' };
  }
}

