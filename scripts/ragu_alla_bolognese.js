#!/usr/bin/env node
/**
 * Script d'import de texte depuis un PDF vers le format YAML des traités
 * 
 * Usage: node ragu_alla_bolognese.js <pdf_file> --lang <language> --pages <page_range> 
 *        --master <master> --work <work> --book <book> --year <year>
 * 
 * Exemple: node ragu_alla_bolognese.js "Achille Marozzo - opéra nova.pdf" --lang fr --pages 27-30 
 *          --master achille_marozzo --work "Opera Nova" --book 2 --year 1536
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

async function loadPdfJs() {
  // Use ESM build via dynamic import for Node
  const mod = await import('pdfjs-dist/legacy/build/pdf.mjs');
  return mod;
}

function parseArgs(args) {
  const parsed = {
    pdfFile: null,
    lang: 'fr',
    pages: null,
    master: null,
    work: null,
    book: null,
    year: null
  };

  let i = 0;
  while (i < args.length) {
    const arg = args[i];
    if (arg === '--lang' && i + 1 < args.length) {
      parsed.lang = args[i + 1];
      i += 2;
    } else if (arg === '--pages' && i + 1 < args.length) {
      parsed.pages = args[i + 1];
      i += 2;
    } else if (arg === '--master' && i + 1 < args.length) {
      parsed.master = args[i + 1];
      i += 2;
    } else if (arg === '--work' && i + 1 < args.length) {
      parsed.work = args[i + 1];
      i += 2;
    } else if (arg === '--book' && i + 1 < args.length) {
      parsed.book = parseInt(args[i + 1], 10);
      i += 2;
    } else if (arg === '--year' && i + 1 < args.length) {
      parsed.year = parseInt(args[i + 1], 10);
      i += 2;
    } else if (!arg.startsWith('--') && !parsed.pdfFile) {
      parsed.pdfFile = arg;
      i++;
    } else {
      i++;
    }
  }

  return parsed;
}

function parsePageRange(pageStr) {
  // Supports formats: "27", "27-30", "27,28,30"
  const pages = [];
  const parts = pageStr.split(',');
  for (const part of parts) {
    if (part.includes('-')) {
      const [start, end] = part.split('-').map(p => parseInt(p.trim(), 10));
      for (let p = start; p <= end; p++) {
        pages.push(p);
      }
    } else {
      pages.push(parseInt(part.trim(), 10));
    }
  }
  return pages;
}

async function loadGlossary() {
  const glossaryPath = path.join(__dirname, '..', 'data', 'glossary.yaml');
  if (!fs.existsSync(glossaryPath)) {
    return {};
  }
  const content = fs.readFileSync(glossaryPath, 'utf8');
  return yaml.load(content) || {};
}

function buildGlossaryTerms(glossary) {
  // Build a map of term variations to glossary keys
  const termMap = new Map();
  
  for (const [key, entry] of Object.entries(glossary)) {
    if (entry && entry.term) {
      // Add the main term
      termMap.set(entry.term.toLowerCase(), key);
      // Add underscored version
      termMap.set(key.toLowerCase(), key);
      // Add spaced version (replace underscores with spaces)
      termMap.set(key.replace(/_/g, ' ').toLowerCase(), key);
    }
  }
  
  return termMap;
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function annotateWithGlossary(text, termMap) {
  // Sort terms by length (longer first) to avoid partial matches
  const sortedTerms = Array.from(termMap.keys()).sort((a, b) => b.length - a.length);
  
  let annotatedText = text;
  const usedTerms = new Set();
  
  for (const term of sortedTerms) {
    const key = termMap.get(term);
    // Create a case-insensitive regex that matches the term as a word
    const regex = new RegExp(`\\b(${escapeRegExp(term)})\\b`, 'gi');
    
    // Use a replacer function to check if the match is already inside braces
    annotatedText = annotatedText.replace(regex, (match, p1, offset, string) => {
      // Check if this match is already inside braces by looking at surrounding chars
      const charBefore = offset > 0 ? string[offset - 1] : '';
      const charAfter = offset + match.length < string.length ? string[offset + match.length] : '';
      
      // Skip if already annotated (inside braces)
      if (charBefore === '{' || charAfter === '}') {
        return match;
      }
      
      usedTerms.add(key);
      return `{${key}}`;
    });
  }
  
  return { annotatedText, usedTerms };
}

function detectChapters(text) {
  // Detect chapter patterns like "Chap. 95.", "Chapitre 95", "Chapter 95", etc.
  const chapterPatterns = [
    /Chap\.\s*(\d+)\.\s*(.*?)(?=\n|$)/gi,
    /Chapitre\s*(\d+)\s*[-–—:.]?\s*(.*?)(?=\n|$)/gi,
    /Chapter\s*(\d+)\s*[-–—:.]?\s*(.*?)(?=\n|$)/gi,
    /Capitolo\s*(\d+)\s*[-–—:.]?\s*(.*?)(?=\n|$)/gi
  ];
  
  const chapters = [];
  
  for (const pattern of chapterPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      chapters.push({
        chapterNumber: parseInt(match[1], 10),
        title: match[2] ? match[2].trim() : '',
        fullMatch: match[0],
        index: match.index
      });
    }
  }
  
  // Sort by position in text
  chapters.sort((a, b) => a.index - b.index);
  
  // Remove duplicates (same chapter number)
  const seen = new Set();
  return chapters.filter(ch => {
    if (seen.has(ch.chapterNumber)) return false;
    seen.add(ch.chapterNumber);
    return true;
  });
}

function splitByChapters(text, chapters) {
  if (chapters.length === 0) {
    return [{ chapterNumber: null, title: '', content: text }];
  }
  
  const sections = [];
  
  for (let i = 0; i < chapters.length; i++) {
    const chapter = chapters[i];
    const nextChapter = chapters[i + 1];
    
    const startIndex = chapter.index + chapter.fullMatch.length;
    const endIndex = nextChapter ? nextChapter.index : text.length;
    
    const content = text.substring(startIndex, endIndex).trim();
    
    sections.push({
      chapterNumber: chapter.chapterNumber,
      title: chapter.fullMatch.trim(),
      content: content
    });
  }
  
  return sections;
}

async function extractAllLinesFromPage(pdfjsLib, doc, pageNumber) {
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

async function extractTextFromPages(pdfPath, pages) {
  const pdfjsLib = await loadPdfJs();
  const absPath = path.isAbsolute(pdfPath) ? pdfPath : path.resolve(process.cwd(), pdfPath);
  
  if (!fs.existsSync(absPath)) {
    throw new Error(`PDF not found at path: ${absPath}`);
  }
  
  const data = new Uint8Array(fs.readFileSync(absPath));
  const loadingTask = pdfjsLib.getDocument({ data, disableWorker: true });
  const doc = await loadingTask.promise;

  const allLines = [];
  
  for (const pageNum of pages) {
    const lines = await extractAllLinesFromPage(pdfjsLib, doc, pageNum);
    allLines.push(...lines);
  }

  // Preserve line breaks by joining with newlines
  return allLines.join('\n');
}

// Term category configuration for mapping glossary types to annotation categories
const TERM_CATEGORIES = {
  guards: ['garde', 'guard'],
  techniques: ['attaque', 'technique', 'attack', 'mouvement', 'tactique', 'frappe', 'coup', 'déplacement']
};

function slugify(text) {
  // Convert text to a safe slug format for IDs
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9]+/g, '_')     // Replace non-alphanumeric with underscores
    .replace(/^_+|_+$/g, '');        // Trim leading/trailing underscores
}

function generateId(master, book, chapter) {
  const masterSlug = slugify(master);
  return `${masterSlug}_l${book}_c${chapter}`;
}

function generateAnnotationId() {
  return `anno_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

function categorizeTermType(type) {
  const lowerType = type.toLowerCase();
  
  for (const keyword of TERM_CATEGORIES.guards) {
    if (lowerType.includes(keyword)) {
      return 'guards';
    }
  }
  
  for (const keyword of TERM_CATEGORIES.techniques) {
    if (lowerType.includes(keyword)) {
      return 'techniques';
    }
  }
  
  return null;
}

function buildTreatiseEntry(section, metadata, lang, usedTerms, glossary) {
  const entry = {
    id: generateId(metadata.master, metadata.book, section.chapterNumber || 1),
    title: section.title || `Chapitre ${section.chapterNumber}`,
    metadata: {
      master: metadata.master,
      work: metadata.work,
      book: metadata.book,
      chapter: section.chapterNumber || 1,
      year: metadata.year
    },
    annotation: {
      id: generateAnnotationId(),
      note: null,
      weapons: [],
      guards_mentioned: [],
      techniques: [],
      measure: null,
      strategy: []
    },
    content: {}
  };

  // Categorize used terms into guards and techniques
  for (const termKey of usedTerms) {
    const glossaryEntry = glossary[termKey];
    if (glossaryEntry && glossaryEntry.type) {
      const category = categorizeTermType(glossaryEntry.type);
      
      if (category === 'guards') {
        if (!entry.annotation.guards_mentioned.includes(termKey)) {
          entry.annotation.guards_mentioned.push(termKey);
        }
      } else if (category === 'techniques') {
        if (!entry.annotation.techniques.includes(termKey)) {
          entry.annotation.techniques.push(termKey);
        }
      }
    }
  }

  // Set content for the specified language
  entry.content[lang] = section.content + '\n';

  return entry;
}

function printUsage() {
  console.log(`
Usage: node ragu_alla_bolognese.js <pdf_file> [options]

Arguments:
  <pdf_file>           Path to the PDF file to extract text from

Options:
  --lang <language>    Language code (it, fr, en). Default: fr
  --pages <range>      Page or page range to read (e.g., "27", "27-30", "27,28,30")
  --master <master>    Master name (e.g., "achille_marozzo")
  --work <work>        Work title (e.g., "Opera Nova")
  --book <book>        Book number
  --year <year>        Publication year

Examples:
  node ragu_alla_bolognese.js "document.pdf" --lang fr --pages 27-30 \\
    --master achille_marozzo --work "Opera Nova" --book 2 --year 1536

  node ragu_alla_bolognese.js "document.pdf" --lang it --pages 1,5,10 \\
    --master antonio_manciolino --work "Opera Nuova" --book 1 --year 1531
`);
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    printUsage();
    process.exit(0);
  }

  const config = parseArgs(args);

  // Validate required arguments
  if (!config.pdfFile) {
    console.error('Error: PDF file is required.');
    printUsage();
    process.exit(1);
  }

  if (!config.pages) {
    console.error('Error: Page range is required (--pages).');
    printUsage();
    process.exit(1);
  }

  if (!config.master || !config.work || !config.book || !config.year) {
    console.error('Error: Metadata (--master, --work, --book, --year) is required.');
    printUsage();
    process.exit(1);
  }

  try {
    const pages = parsePageRange(config.pages);
    console.error(`Extracting text from pages: ${pages.join(', ')}`);

    // Load glossary
    const glossary = await loadGlossary();
    const termMap = buildGlossaryTerms(glossary);
    console.error(`Loaded ${termMap.size} glossary terms`);

    // Extract text from PDF
    const rawText = await extractTextFromPages(config.pdfFile, pages);
    console.error(`Extracted ${rawText.length} characters`);

    // Detect chapters
    const chapters = detectChapters(rawText);
    console.error(`Detected ${chapters.length} chapters`);

    // Split text by chapters
    const sections = splitByChapters(rawText, chapters);

    // Build treatise entries
    const entries = [];
    
    for (const section of sections) {
      // Annotate text with glossary terms
      const { annotatedText, usedTerms } = annotateWithGlossary(section.content, termMap);
      section.content = annotatedText;

      const entry = buildTreatiseEntry(section, config, config.lang, usedTerms, glossary);
      entries.push(entry);
    }

    // Output YAML
    const yamlOutput = yaml.dump(entries, {
      indent: 2,
      lineWidth: -1,
      quotingType: '"',
      forceQuotes: false
    });

    process.stdout.write(yamlOutput);
    
    console.error(`\nGenerated ${entries.length} treatise entries`);

  } catch (err) {
    console.error('Error:', err.message || String(err));
    process.exit(1);
  }
}

main();
