#!/usr/bin/env bash
# Download Unsplash images to local public/images directories.
# Run from project root: bash scripts/download-images.sh
#
# NOTE: This replaces the placeholder SVGs with real photos.
# Make sure you have curl installed.

set -euo pipefail

BASE="apps/backend/public/images"

mkdir -p "$BASE/products" "$BASE/categories" "$BASE/hero" "$BASE/blog"

download() {
  local url="$1"
  local dest="$2"
  if [ -f "$dest" ]; then
    echo "  SKIP  $dest (exists)"
  else
    echo "  GET   $dest"
    curl -sSL -o "$dest" "$url"
  fi
}

echo "=== Downloading product images ==="

# Living Room
download "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=600&h=400&fit=crop" "$BASE/products/nordic-sofa.jpg"
download "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=600&h=400&fit=crop" "$BASE/products/minimalist-coffee-table.jpg"
download "https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=600&h=400&fit=crop" "$BASE/products/floor-lamp-arco.jpg"
download "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop" "$BASE/products/bookshelf-tall-oak.jpg"
download "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600&h=400&fit=crop" "$BASE/products/wool-area-rug.jpg"
download "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=400&fit=crop" "$BASE/products/boucle-armchair.jpg"
download "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&h=400&fit=crop" "$BASE/products/tv-stand-storage.jpg"
download "https://images.unsplash.com/photo-1567016432779-094069958ea5?w=600&h=400&fit=crop" "$BASE/products/premium-sectional-sofa-xl.jpg"
download "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=400&fit=crop" "$BASE/products/designer-sofa-set.jpg"
download "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=600&h=400&fit=crop" "$BASE/products/leather-recliner.jpg"
download "https://images.unsplash.com/photo-1532372576444-dda954194ad0?w=600&h=400&fit=crop" "$BASE/products/glass-side-table.jpg"
download "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&h=400&fit=crop" "$BASE/products/console-table-marble.jpg"
download "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop" "$BASE/products/pouf-ottoman.jpg"

# Bedroom
download "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&h=400&fit=crop" "$BASE/products/platform-bed-queen.jpg"
download "https://images.unsplash.com/photo-1595526051245-4506e0005bd0?w=600&h=400&fit=crop" "$BASE/products/bedside-table-duo.jpg"
download "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop" "$BASE/products/wardrobe-sliding.jpg"
download "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=600&h=400&fit=crop" "$BASE/products/dresser-6-drawer.jpg"
download "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=600&h=400&fit=crop" "$BASE/products/upholstered-headboard-king.jpg"
download "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=600&h=400&fit=crop" "$BASE/products/king-bed-frame-oak.jpg"
download "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop" "$BASE/products/walk-in-closet-system.jpg"
download "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=600&h=400&fit=crop" "$BASE/products/vanity-desk-bedroom.jpg"
download "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&h=400&fit=crop" "$BASE/products/bedroom-bench.jpg"

# Kitchen / Dining
download "https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=600&h=400&fit=crop" "$BASE/products/dining-table-extendable.jpg"
download "https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?w=600&h=400&fit=crop" "$BASE/products/dining-chairs-set.jpg"
download "https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=600&h=400&fit=crop" "$BASE/products/kitchen-island-cart.jpg"
download "https://images.unsplash.com/photo-1550226891-ef816aed4a98?w=600&h=400&fit=crop" "$BASE/products/wall-shelf-kitchen.jpg"
download "https://images.unsplash.com/photo-1581539250439-c96689b516dd?w=600&h=400&fit=crop" "$BASE/products/bar-stool-adjustable.jpg"
download "https://images.unsplash.com/photo-1550226891-ef816aed4a98?w=600&h=400&fit=crop" "$BASE/products/marble-lazy-susan.jpg"
download "https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=600&h=400&fit=crop" "$BASE/products/solid-oak-dining-table.jpg"
download "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=400&fit=crop" "$BASE/products/custom-kitchen-island.jpg"
download "https://images.unsplash.com/photo-1550226891-ef816aed4a98?w=600&h=400&fit=crop" "$BASE/products/wine-rack-wall.jpg"
download "https://images.unsplash.com/photo-1550226891-ef816aed4a98?w=600&h=400&fit=crop" "$BASE/products/spice-rack-bamboo.jpg"

# Bathroom
download "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&h=400&fit=crop" "$BASE/products/bathroom-cabinet-mirror.jpg"
download "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=600&h=400&fit=crop" "$BASE/products/towel-rack-freestanding.jpg"
download "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&h=400&fit=crop" "$BASE/products/laundry-basket-woven.jpg"
download "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&h=400&fit=crop" "$BASE/products/shower-shelf-corner.jpg"
download "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=600&h=400&fit=crop" "$BASE/products/vanity-stool-velvet.jpg"
download "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&h=400&fit=crop" "$BASE/products/bathroom-shelf-ladder.jpg"
download "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&h=400&fit=crop" "$BASE/products/soap-dispenser-set.jpg"

# Office
download "https://images.unsplash.com/photo-1593642634315-48f5414c3ad9?w=600&h=400&fit=crop" "$BASE/products/standing-desk-electric.jpg"
download "https://images.unsplash.com/photo-1596079890744-c1a0462d0975?w=600&h=400&fit=crop" "$BASE/products/ergonomic-office-chair.jpg"
download "https://images.unsplash.com/photo-1593640495253-23196b27a87f?w=600&h=400&fit=crop" "$BASE/products/monitor-stand-bamboo.jpg"
download "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop" "$BASE/products/filing-cabinet-3.jpg"
download "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&h=400&fit=crop" "$BASE/products/acoustic-office-divider.jpg"
download "https://images.unsplash.com/photo-1593640495253-23196b27a87f?w=600&h=400&fit=crop" "$BASE/products/desk-organizer-plastic.jpg"
download "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&h=400&fit=crop" "$BASE/products/executive-desk-walnut.jpg"
download "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop" "$BASE/products/bookcase-office.jpg"

# Outdoor
download "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=400&fit=crop" "$BASE/products/garden-lounge-set.jpg"
download "https://images.unsplash.com/photo-1521747116042-5a810fda9664?w=600&h=400&fit=crop" "$BASE/products/folding-bistro-table.jpg"
download "https://images.unsplash.com/photo-1521747116042-5a810fda9664?w=600&h=400&fit=crop" "$BASE/products/outdoor-bench-storage.jpg"
download "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=400&fit=crop" "$BASE/products/planter-box-large.jpg"
download "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=400&fit=crop" "$BASE/products/hammock-with-stand.jpg"
download "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=400&fit=crop" "$BASE/products/outdoor-dining-set.jpg"
download "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=400&fit=crop" "$BASE/products/fire-pit-table.jpg"

# Decor
download "https://images.unsplash.com/photo-1533158326339-7f3cf2404354?w=600&h=400&fit=crop" "$BASE/products/abstract-canvas-print.jpg"
download "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=600&h=400&fit=crop" "$BASE/products/gallery-wall-set.jpg"
download "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&h=400&fit=crop" "$BASE/products/round-arch-mirror.jpg"
download "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=600&h=400&fit=crop" "$BASE/products/ceramic-vase-set.jpg"
download "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=600&h=400&fit=crop" "$BASE/products/scented-candle-set.jpg"
download "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=600&h=400&fit=crop" "$BASE/products/minimalist-wall-clock.jpg"
download "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=600&h=400&fit=crop" "$BASE/products/macrame-wall-hanging.jpg"
download "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=600&h=400&fit=crop" "$BASE/products/decorative-tray-set.jpg"
download "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=600&h=400&fit=crop" "$BASE/products/terrazzo-bookends.jpg"
download "https://images.unsplash.com/photo-1533158326339-7f3cf2404354?w=600&h=400&fit=crop" "$BASE/products/sculpture-abstract.jpg"

# Textiles
download "https://images.unsplash.com/photo-1588614959060-4d144f28b207?w=600&h=400&fit=crop" "$BASE/products/linen-duvet-cover.jpg"
download "https://images.unsplash.com/photo-1567016432779-094069958ea5?w=600&h=400&fit=crop" "$BASE/products/velvet-cushion-set.jpg"
download "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600&h=400&fit=crop" "$BASE/products/chunky-knit-throw.jpg"
download "https://images.unsplash.com/photo-1497296690583-da0e2a4ce49a?w=600&h=400&fit=crop" "$BASE/products/linen-blackout-curtains.jpg"
download "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=600&h=400&fit=crop" "$BASE/products/waffle-bath-towels.jpg"
download "https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=600&h=400&fit=crop" "$BASE/products/table-runner-linen.jpg"
download "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&h=400&fit=crop" "$BASE/products/shaggy-bath-mat.jpg"
download "https://images.unsplash.com/photo-1588614959060-4d144f28b207?w=600&h=400&fit=crop" "$BASE/products/silk-pillowcase-set.jpg"
download "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600&h=400&fit=crop" "$BASE/products/wool-plaid-blanket.jpg"

# Lighting
download "https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=600&h=400&fit=crop" "$BASE/products/brass-pendant-light.jpg"
download "https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=600&h=400&fit=crop" "$BASE/products/wall-sconce-set.jpg"
download "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&h=400&fit=crop" "$BASE/products/led-desk-lamp.jpg"
download "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&h=400&fit=crop" "$BASE/products/rattan-table-lamp.jpg"
download "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600&h=400&fit=crop" "$BASE/products/smart-led-strip.jpg"
download "https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=600&h=400&fit=crop" "$BASE/products/cluster-ceiling-light.jpg"
download "https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=600&h=400&fit=crop" "$BASE/products/chandelier-crystal.jpg"
download "https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=600&h=400&fit=crop" "$BASE/products/floor-lamp-tripod.jpg"

# Storage
download "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop" "$BASE/products/wooden-coat-rack.jpg"
download "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&h=400&fit=crop" "$BASE/products/seagrass-basket-set.jpg"
download "https://images.unsplash.com/photo-1558002038-1055907df827?w=600&h=400&fit=crop" "$BASE/products/wall-shelf-with-hooks.jpg"
download "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop" "$BASE/products/shoe-rack-10-tier.jpg"
download "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&h=400&fit=crop" "$BASE/products/linen-storage-boxes.jpg"
download "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=400&fit=crop" "$BASE/products/modular-shelving.jpg"
download "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop" "$BASE/products/entryway-bench-storage.jpg"

echo ""
echo "=== Downloading category images ==="
download "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop" "$BASE/categories/living-room.jpg"
download "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&h=600&fit=crop" "$BASE/categories/bedroom.jpg"
download "https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=800&h=600&fit=crop" "$BASE/categories/kitchen.jpg"
download "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&h=600&fit=crop" "$BASE/categories/bathroom.jpg"
download "https://images.unsplash.com/photo-1593642634315-48f5414c3ad9?w=800&h=600&fit=crop" "$BASE/categories/office.jpg"
download "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop" "$BASE/categories/outdoor.jpg"
download "https://images.unsplash.com/photo-1533158326339-7f3cf2404354?w=800&h=600&fit=crop" "$BASE/categories/decor.jpg"
download "https://images.unsplash.com/photo-1588614959060-4d144f28b207?w=800&h=600&fit=crop" "$BASE/categories/textiles.jpg"
download "https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=800&h=600&fit=crop" "$BASE/categories/lighting.jpg"
download "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop" "$BASE/categories/storage.jpg"

echo ""
echo "=== Downloading hero images ==="
download "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1600&h=900&fit=crop" "$BASE/hero/hero-main.jpg"
download "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1600&h=900&fit=crop" "$BASE/hero/hero-sale.jpg"
download "https://images.unsplash.com/photo-1567016432779-094069958ea5?w=1600&h=900&fit=crop" "$BASE/hero/hero-new.jpg"

echo ""
echo "=== Downloading blog images ==="
download "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=450&fit=crop" "$BASE/blog/scandinavian-design-trends-2026.jpg"
download "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&h=450&fit=crop" "$BASE/blog/small-space-furniture-guide.jpg"
download "https://images.unsplash.com/photo-1567016432779-094069958ea5?w=800&h=450&fit=crop" "$BASE/blog/living-room-color-palettes.jpg"
download "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=450&fit=crop" "$BASE/blog/sustainable-materials-furniture.jpg"
download "https://images.unsplash.com/photo-1593642634315-48f5414c3ad9?w=800&h=450&fit=crop" "$BASE/blog/perfect-home-office-setup.jpg"
download "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&h=450&fit=crop" "$BASE/blog/bedroom-makeover-inspiration.jpg"

echo ""
echo "Done! All images downloaded to $BASE/"
