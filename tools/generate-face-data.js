const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', 'solitaire');
const cardsDir = path.join(root, 'cards');
const outFile = path.join(root, 'faceData.js');
const mirroredFaces = new Set(['QS', 'JH', 'JD', 'QD', 'QC', 'JC']);

function attrsToObject(attrs) {
  const result = {};
  attrs.replace(/([\w:-]+)="([^"]*)"/g, (_, key, value) => {
    result[key] = value;
    return '';
  });
  return result;
}

function presentationAttrs(attrs) {
  const skip = new Set(['xlink:href', 'href', 'width', 'height', 'x', 'y', 'transform']);
  return Object.entries(attrs)
    .filter(([key]) => !skip.has(key))
    .map(([key, value]) => `${key}="${value}"`)
    .join(' ');
}

function transformForUse(attrs, symbolAttrs) {
  const viewBox = (symbolAttrs.viewBox || '0 0 0 0').split(/\s+/).map(Number);
  const [minX, minY, vbW, vbH] = viewBox;
  const width = Number(attrs.width || vbW);
  const height = Number(attrs.height || vbH);
  const x = Number(attrs.x || 0);
  const y = Number(attrs.y || 0);
  const base = attrs.transform ? `${attrs.transform} ` : '';
  const preserve = symbolAttrs.preserveAspectRatio || 'xMidYMid meet';

  if (preserve === 'none') {
    return `${base}translate(${x},${y}) scale(${width / vbW},${height / vbH}) translate(${-minX},${-minY})`;
  }

  const scale = Math.min(width / vbW, height / vbH);
  let dx = 0;
  let dy = 0;
  if (preserve.includes('xMid')) dx = (width - vbW * scale) / 2;
  if (preserve.includes('xMax')) dx = width - vbW * scale;
  if (preserve.includes('YMid')) dy = (height - vbH * scale) / 2;
  if (preserve.includes('YMax')) dy = height - vbH * scale;

  return `${base}translate(${x + dx},${y + dy}) scale(${scale}) translate(${-minX},${-minY})`;
}

function extractSymbols(svg) {
  const symbols = {};
  const re = /<symbol\s+id="([^"]+)"([^>]*)>([\s\S]*?)<\/symbol>/g;
  let match;
  while ((match = re.exec(svg))) {
    symbols[match[1]] = {
      attrs: attrsToObject(match[2]),
      body: match[3],
    };
  }
  return symbols;
}

function flattenUses(content, symbols) {
  return content.replace(/<use\s+([^>]*?)(?:><\/use>|\/>)/g, (full, rawAttrs) => {
    const attrs = attrsToObject(rawAttrs);
    const href = attrs['xlink:href'] || attrs.href;
    if (!href || !href.startsWith('#')) return full;

    const id = href.slice(1);
    const symbol = symbols[id];
    if (!symbol) return '';

    const inherited = presentationAttrs(attrs);
    const inheritedOpen = inherited ? `<g ${inherited}>` : '<g>';
    const body = flattenUses(symbol.body, symbols)
      .replace(/stroke="#44F"/g, 'stroke="#2239d6"')
      .replace(/stroke-width="3"/g, 'stroke-width="10"');
    return `<g transform="${transformForUse(attrs, symbol.attrs)}">${inheritedOpen}${body}</g></g>`;
  });
}

function extractFaceBody(svg, cardId, symbols) {
  const suit = cardId[1];
  const rank = cardId[0];
  const body = svg.match(/<\/defs>([\s\S]*?)<\/svg>/)[1];
  const useRe = new RegExp(`<use\\s+([^>]*?xlink:href="#${suit}${rank}[1-6]"[^>]*?)(?:><\\/use>|\\/>)`, 'g');
  const parts = [];
  let match;
  while ((match = useRe.exec(body))) {
    parts.push(flattenUses(`<use ${match[1]}></use>`, symbols));
  }

  const mirror = mirroredFaces.has(cardId) ? ' scale(-1,1)' : '';
  return `<g transform="translate(50,70) scale(${(100 / 240) * 0.9 * 0.95})${mirror}">${parts.join('')}</g>`;
}

const data = {};
for (const file of fs.readdirSync(cardsDir).sort()) {
  if (!/^[JQK][CDHS]\.svg$/.test(file)) continue;
  const cardId = path.basename(file, '.svg');
  const svg = fs.readFileSync(path.join(cardsDir, file), 'utf8');
  const symbols = extractSymbols(svg);
  data[cardId] = extractFaceBody(svg, cardId, symbols);
}

fs.writeFileSync(outFile, `const faceData = ${JSON.stringify(data, null, 2)};\n`);
