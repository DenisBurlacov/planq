/**
 * Generate placeholder SVG images for all products, categories, hero, and blog.
 *
 * Usage:  npx tsx scripts/generate-placeholders.ts
 */
import fs from 'node:fs';
import path from 'node:path';

const BASE = path.resolve(import.meta.dirname, '..', 'apps', 'backend', 'public', 'images');

// ── Category colors ─────────────────────────────────────────────────────────
const CATEGORY_COLORS: Record<string, string> = {
  'living-room': '#E8D5B7',
  bedroom: '#D5C4E0',
  kitchen: '#C4D5B7',
  bathroom: '#B7D5E8',
  office: '#D5D5D5',
  outdoor: '#B7E8C4',
  decor: '#E8C4B7',
  textiles: '#E0D5C4',
  lighting: '#E8E8B7',
  storage: '#C4C4D5',
};

function makeSvg(w: number, h: number, bg: string, label: string, subLabel?: string): string {
  // Wrap long labels
  const maxChars = Math.floor(w / 11);
  const lines: string[] = [];
  const words = label.split(' ');
  let cur = '';
  for (const word of words) {
    if (cur && (cur + ' ' + word).length > maxChars) {
      lines.push(cur);
      cur = word;
    } else {
      cur = cur ? cur + ' ' + word : word;
    }
  }
  if (cur) lines.push(cur);

  const fontSize = Math.min(24, Math.floor(w / 20));
  const subFontSize = Math.floor(fontSize * 0.6);
  const lineHeight = fontSize * 1.4;
  const totalTextH = lines.length * lineHeight + (subLabel ? subFontSize + 10 : 0);
  const startY = (h - totalTextH) / 2 + fontSize;

  const textEls = lines
    .map(
      (line, i) =>
        `<text x="${w / 2}" y="${startY + i * lineHeight}" font-family="system-ui,sans-serif" font-size="${fontSize}" font-weight="600" fill="#333" text-anchor="middle">${escXml(line)}</text>`
    )
    .join('\n    ');

  const subEl = subLabel
    ? `<text x="${w / 2}" y="${startY + lines.length * lineHeight + 6}" font-family="system-ui,sans-serif" font-size="${subFontSize}" fill="#666" text-anchor="middle">${escXml(subLabel)}</text>`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="${w}" height="${h}" fill="${bg}" />
  <rect x="1" y="1" width="${w - 2}" height="${h - 2}" fill="none" stroke="#00000015" stroke-width="1" rx="4" />
    ${textEls}
    ${subEl}
</svg>`;
}

function escXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function write(dir: string, name: string, content: string) {
  const full = path.join(BASE, dir, name);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf-8');
}

// ── Products (600x400) ──────────────────────────────────────────────────────
const products: Array<{ file: string; name: string; category: string }> = [
  // Living Room
  { file: 'nordic-sofa.svg', name: 'Nordic Sofa 3-Seater', category: 'living-room' },
  { file: 'minimalist-coffee-table.svg', name: 'Minimalist Coffee Table', category: 'living-room' },
  { file: 'floor-lamp-arco.svg', name: 'Arc Floor Lamp', category: 'living-room' },
  { file: 'bookshelf-tall-oak.svg', name: 'Bookshelf Tall Oak', category: 'living-room' },
  { file: 'wool-area-rug.svg', name: 'Wool Area Rug', category: 'living-room' },
  { file: 'boucle-armchair.svg', name: 'Boucle Armchair', category: 'living-room' },
  { file: 'tv-stand-storage.svg', name: 'TV Stand with Storage', category: 'living-room' },
  {
    file: 'premium-sectional-sofa-xl.svg',
    name: 'Premium L-Shaped Sectional',
    category: 'living-room',
  },
  { file: 'designer-sofa-set.svg', name: 'Designer Sofa Set', category: 'living-room' },
  { file: 'leather-recliner.svg', name: 'Leather Recliner', category: 'living-room' },
  { file: 'glass-side-table.svg', name: 'Glass Side Table', category: 'living-room' },
  { file: 'console-table-marble.svg', name: 'Console Table Marble', category: 'living-room' },
  { file: 'pouf-ottoman.svg', name: 'Pouf Ottoman', category: 'living-room' },
  // Bedroom
  { file: 'platform-bed-queen.svg', name: 'Platform Bed Queen', category: 'bedroom' },
  { file: 'bedside-table-duo.svg', name: 'Bedside Table Set', category: 'bedroom' },
  { file: 'wardrobe-sliding.svg', name: 'Wardrobe Sliding Doors', category: 'bedroom' },
  { file: 'dresser-6-drawer.svg', name: 'Dresser 6-Drawer', category: 'bedroom' },
  { file: 'upholstered-headboard-king.svg', name: 'Upholstered Headboard', category: 'bedroom' },
  { file: 'memory-foam-pillow.svg', name: 'Memory Foam Pillow Set', category: 'bedroom' },
  { file: 'king-bed-frame-oak.svg', name: 'King Bed Frame Oak', category: 'bedroom' },
  { file: 'walk-in-closet-system.svg', name: 'Walk-in Closet System', category: 'bedroom' },
  { file: 'vanity-desk-bedroom.svg', name: 'Vanity Desk', category: 'bedroom' },
  { file: 'bedroom-bench.svg', name: 'Bedroom Bench', category: 'bedroom' },
  // Kitchen
  { file: 'dining-table-extendable.svg', name: 'Extendable Dining Table', category: 'kitchen' },
  { file: 'dining-chairs-set.svg', name: 'Dining Chair Set', category: 'kitchen' },
  { file: 'kitchen-island-cart.svg', name: 'Kitchen Island Cart', category: 'kitchen' },
  { file: 'wall-shelf-kitchen.svg', name: 'Floating Shelves', category: 'kitchen' },
  { file: 'bar-stool-adjustable.svg', name: 'Bar Stool', category: 'kitchen' },
  { file: 'marble-lazy-susan.svg', name: 'Marble Lazy Susan', category: 'kitchen' },
  { file: 'solid-oak-dining-table.svg', name: 'Solid Oak Dining Table', category: 'kitchen' },
  { file: 'custom-kitchen-island.svg', name: 'Custom Kitchen Island', category: 'kitchen' },
  { file: 'wine-rack-wall.svg', name: 'Wine Rack Wall', category: 'kitchen' },
  { file: 'spice-rack-bamboo.svg', name: 'Spice Rack Bamboo', category: 'kitchen' },
  // Bathroom
  { file: 'bathroom-cabinet-mirror.svg', name: 'Bathroom Mirror Cabinet', category: 'bathroom' },
  { file: 'towel-rack-freestanding.svg', name: 'Bamboo Towel Rack', category: 'bathroom' },
  { file: 'laundry-basket-woven.svg', name: 'Seagrass Laundry Basket', category: 'bathroom' },
  { file: 'shower-shelf-corner.svg', name: 'Corner Shower Shelf', category: 'bathroom' },
  { file: 'vanity-stool-velvet.svg', name: 'Velvet Vanity Stool', category: 'bathroom' },
  { file: 'bathroom-shelf-ladder.svg', name: 'Bathroom Ladder Shelf', category: 'bathroom' },
  { file: 'soap-dispenser-set.svg', name: 'Soap Dispenser Set', category: 'bathroom' },
  // Office
  { file: 'standing-desk-electric.svg', name: 'Electric Standing Desk', category: 'office' },
  { file: 'ergonomic-office-chair.svg', name: 'Ergonomic Office Chair', category: 'office' },
  { file: 'monitor-stand-bamboo.svg', name: 'Bamboo Monitor Riser', category: 'office' },
  { file: 'filing-cabinet-3.svg', name: 'Filing Cabinet', category: 'office' },
  { file: 'acoustic-office-divider.svg', name: 'Acoustic Divider', category: 'office' },
  { file: 'desk-organizer-plastic.svg', name: 'Desk Organizer', category: 'office' },
  { file: 'executive-desk-walnut.svg', name: 'Executive Desk Walnut', category: 'office' },
  { file: 'bookcase-office.svg', name: 'Office Bookcase', category: 'office' },
  // Outdoor
  { file: 'garden-lounge-set.svg', name: 'Garden Lounge Set', category: 'outdoor' },
  { file: 'folding-bistro-table.svg', name: 'Folding Bistro Table', category: 'outdoor' },
  { file: 'outdoor-bench-storage.svg', name: 'Garden Storage Bench', category: 'outdoor' },
  { file: 'planter-box-large.svg', name: 'Large Planter Box', category: 'outdoor' },
  { file: 'hammock-with-stand.svg', name: 'Hammock with Stand', category: 'outdoor' },
  { file: 'outdoor-dining-set.svg', name: 'Outdoor Dining Set', category: 'outdoor' },
  { file: 'fire-pit-table.svg', name: 'Fire Pit Table', category: 'outdoor' },
  // Decor
  { file: 'abstract-canvas-print.svg', name: 'Abstract Canvas Print', category: 'decor' },
  { file: 'gallery-wall-set.svg', name: 'Gallery Wall Set', category: 'decor' },
  { file: 'round-arch-mirror.svg', name: 'Round Arch Mirror', category: 'decor' },
  { file: 'ceramic-vase-set.svg', name: 'Ceramic Vase Set', category: 'decor' },
  { file: 'scented-candle-set.svg', name: 'Scented Candle Set', category: 'decor' },
  { file: 'minimalist-wall-clock.svg', name: 'Minimalist Wall Clock', category: 'decor' },
  { file: 'macrame-wall-hanging.svg', name: 'Macrame Wall Hanging', category: 'decor' },
  { file: 'decorative-tray-set.svg', name: 'Decorative Tray Set', category: 'decor' },
  { file: 'terrazzo-bookends.svg', name: 'Terrazzo Bookends', category: 'decor' },
  { file: 'sculpture-abstract.svg', name: 'Abstract Sculpture', category: 'decor' },
  // Textiles
  { file: 'linen-duvet-cover.svg', name: 'Linen Duvet Cover', category: 'textiles' },
  { file: 'velvet-cushion-set.svg', name: 'Velvet Cushion Set', category: 'textiles' },
  { file: 'chunky-knit-throw.svg', name: 'Chunky Knit Throw', category: 'textiles' },
  { file: 'linen-blackout-curtains.svg', name: 'Blackout Curtains', category: 'textiles' },
  { file: 'waffle-bath-towels.svg', name: 'Waffle Bath Towels', category: 'textiles' },
  { file: 'table-runner-linen.svg', name: 'Table Runner Linen', category: 'textiles' },
  { file: 'shaggy-bath-mat.svg', name: 'Shaggy Bath Mat', category: 'textiles' },
  { file: 'silk-pillowcase-set.svg', name: 'Silk Pillowcase Set', category: 'textiles' },
  { file: 'wool-plaid-blanket.svg', name: 'Wool Plaid Blanket', category: 'textiles' },
  // Lighting
  { file: 'brass-pendant-light.svg', name: 'Brass Pendant Light', category: 'lighting' },
  { file: 'wall-sconce-set.svg', name: 'Wall Sconce Set', category: 'lighting' },
  { file: 'led-desk-lamp.svg', name: 'LED Desk Lamp', category: 'lighting' },
  { file: 'rattan-table-lamp.svg', name: 'Rattan Table Lamp', category: 'lighting' },
  { file: 'smart-led-strip.svg', name: 'Smart LED Strip', category: 'lighting' },
  { file: 'cluster-ceiling-light.svg', name: 'Cluster Ceiling Light', category: 'lighting' },
  { file: 'chandelier-crystal.svg', name: 'Crystal Chandelier', category: 'lighting' },
  { file: 'floor-lamp-tripod.svg', name: 'Tripod Floor Lamp', category: 'lighting' },
  // Storage
  { file: 'wooden-coat-rack.svg', name: 'Wooden Coat Rack', category: 'storage' },
  { file: 'seagrass-basket-set.svg', name: 'Seagrass Basket Set', category: 'storage' },
  { file: 'wall-shelf-with-hooks.svg', name: 'Wall Shelf with Hooks', category: 'storage' },
  { file: 'shoe-rack-10-tier.svg', name: '10-Tier Shoe Rack', category: 'storage' },
  { file: 'linen-storage-boxes.svg', name: 'Linen Storage Boxes', category: 'storage' },
  { file: 'modular-shelving.svg', name: 'Modular Shelving', category: 'storage' },
  { file: 'entryway-bench-storage.svg', name: 'Entryway Bench', category: 'storage' },
];

for (const p of products) {
  const bg = CATEGORY_COLORS[p.category] || '#E0E0E0';
  const svg = makeSvg(600, 400, bg, p.name, p.category.replace('-', ' '));
  write('products', p.file, svg);
}

// ── Categories (800x600) ────────────────────────────────────────────────────
const categories = [
  'living-room',
  'bedroom',
  'kitchen',
  'bathroom',
  'office',
  'outdoor',
  'decor',
  'textiles',
  'lighting',
  'storage',
];

const categoryLabels: Record<string, string> = {
  'living-room': 'Living Room',
  bedroom: 'Bedroom',
  kitchen: 'Kitchen & Dining',
  bathroom: 'Bathroom',
  office: 'Office',
  outdoor: 'Outdoor',
  decor: 'Decor',
  textiles: 'Textiles',
  lighting: 'Lighting',
  storage: 'Storage',
};

for (const cat of categories) {
  const bg = CATEGORY_COLORS[cat] || '#E0E0E0';
  const svg = makeSvg(800, 600, bg, categoryLabels[cat] || cat);
  write('categories', `${cat}.svg`, svg);
}

// ── Hero images (1600x900) ──────────────────────────────────────────────────
const heroes = [
  { file: 'hero-main.svg', label: 'PLANQ Furniture', sub: 'Scandinavian Design for Modern Living' },
  { file: 'hero-sale.svg', label: 'Spring Sale', sub: 'Up to 40% off selected items' },
  { file: 'hero-new.svg', label: 'New Collection', sub: 'Fresh arrivals for your home' },
];

for (const h of heroes) {
  const svg = makeSvg(1600, 900, '#E8D5B7', h.label, h.sub);
  write('hero', h.file, svg);
}

// ── Blog images (800x450) ───────────────────────────────────────────────────
const blogs = [
  'scandinavian-design-trends-2026',
  'small-space-furniture-guide',
  'living-room-color-palettes',
  'sustainable-materials-furniture',
  'perfect-home-office-setup',
  'bedroom-makeover-inspiration',
];

for (const slug of blogs) {
  const svg = makeSvg(800, 450, '#E0D5C4', slug.replace(/-/g, ' '));
  write('blog', `${slug}.svg`, svg);
}

// eslint-disable-next-line no-console
console.log('Placeholder images generated successfully');
// eslint-disable-next-line no-console
console.log(`  Products: ${products.length}`);
// eslint-disable-next-line no-console
console.log(`  Categories: ${categories.length}`);
// eslint-disable-next-line no-console
console.log(`  Hero: ${heroes.length}`);
// eslint-disable-next-line no-console
console.log(`  Blog: ${blogs.length}`);
