#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

async function loadPdfJs() {
  // Use ESM build via dynamic import for Node
  const mod = await import('pdfjs-dist/legacy/build/pdf.mjs');
  return mod;
}

async function extractFirstLine(pdfPath, pageNumber) {
  const pdfjsLib = await loadPdfJs();
  const absPath = path.isAbsolute(pdfPath) ? pdfPath : path.resolve(process.cwd(), pdfPath);
  if (!fs.existsSync(absPath)) {
    throw new Error(`PDF not found at path: ${absPath}`);
  }
  const data = new Uint8Array(fs.readFileSync(absPath));

  const loadingTask = pdfjsLib.getDocument({ data, disableWorker: true });
  const doc = await loadingTask.promise;

  if (pageNumber < 1 || pageNumber > doc.numPages) {
    throw new Error(`Page ${pageNumber} out of range (1..${doc.numPages}).`);
  }

  const page = await doc.getPage(pageNumber);
  const textContent = await page.getTextContent();

  // Group text items into lines by y position with a small tolerance
  const tolerance = 2.0;
  const lines = []; // [{ y, items: [{x, str}] }]

  for (const item of textContent.items) {
    const y = item.transform[5];
    const x = item.transform[4];
    const str = item.str || '';

    if (!str) continue;

    let line = null;
    for (const l of lines) {
      if (Math.abs(l.y - y) <= tolerance) {
        line = l;
        break;
      }
    }
    if (!line) {
      line = { y, items: [] };
      lines.push(line);
    }
    line.items.push({ x, str });
  }

  // Sort lines from top to bottom (higher y first in PDF space)
  lines.sort((a, b) => b.y - a.y);

  // Build text for each line by sorting items left-to-right
  const builtLines = lines.map(l => {
    l.items.sort((a, b) => a.x - b.x);
    // naive join; many PDFs include internal spaces already in item.str
    // For better spacing, insert a space when the gap is large
    let lineText = '';
    let prevX = null;
    for (const seg of l.items) {
      if (prevX !== null) {
        const gap = seg.x - prevX;
        if (gap > 6) lineText += ' ';
      }
      lineText += seg.str;
      prevX = seg.x + seg.str.length; // rough
    }
    return lineText.replace(/\s+/g, ' ').trim();
  }).filter(t => t.length > 0);

  return builtLines[0] || '';
}

async function extractAllLines(pdfPath, pageNumber) {
  const pdfjsLib = await loadPdfJs();
  const absPath = path.isAbsolute(pdfPath) ? pdfPath : path.resolve(process.cwd(), pdfPath);
  if (!fs.existsSync(absPath)) {
    throw new Error(`PDF not found at path: ${absPath}`);
  }
  const data = new Uint8Array(fs.readFileSync(absPath));

  const loadingTask = pdfjsLib.getDocument({ data, disableWorker: true });
  const doc = await loadingTask.promise;

  if (pageNumber < 1 || pageNumber > doc.numPages) {
    throw new Error(`Page ${pageNumber} out of range (1..${doc.numPages}).`);
  }

  const page = await doc.getPage(pageNumber);
  const textContent = await page.getTextContent();

  // Group text items into lines by y position with a small tolerance
  const tolerance = 2.0;
  const lines = []; // [{ y, items: [{x, str}] }]

  for (const item of textContent.items) {
    const y = item.transform[5];
    const x = item.transform[4];
    const str = item.str || '';

    if (!str) continue;

    let line = null;
    for (const l of lines) {
      if (Math.abs(l.y - y) <= tolerance) {
        line = l;
        break;
      }
    }
    if (!line) {
      line = { y, items: [] };
      lines.push(line);
    }
    line.items.push({ x, str });
  }

  // Sort lines from top to bottom (higher y first in PDF space)
  lines.sort((a, b) => b.y - a.y);

  // Build text for each line by sorting items left-to-right
  const builtLines = lines.map(l => {
    l.items.sort((a, b) => a.x - b.x);
    let lineText = '';
    let prevX = null;
    for (const seg of l.items) {
      if (prevX !== null) {
        const gap = seg.x - prevX;
        if (gap > 6) lineText += ' ';
      }
      lineText += seg.str;
      prevX = seg.x + seg.str.length;
    }
    return lineText.replace(/\s+/g, ' ').trim();
  }).filter(t => t.length > 0);

  return builtLines;
}

async function main() {
  const [, , fileArg, pageArg, modeArg] = process.argv;
  const filePath = fileArg || 'Achille Marozzo - opéra nova.pdf';
  const pageNumber = parseInt(pageArg || '27', 10);
  const mode = modeArg || 'first';
  
  try {
    if (mode === 'all') {
      const allLines = await extractAllLines(filePath, pageNumber);
      allLines.forEach(line => process.stdout.write(line + '\n'));
    } else {
      const firstLine = await extractFirstLine(filePath, pageNumber);
      process.stdout.write(firstLine + '\n');
    }
  } catch (err) {
    console.error(err.message || String(err));
    process.exit(1);
  }
}

main();
