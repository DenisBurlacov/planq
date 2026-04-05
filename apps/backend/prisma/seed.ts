import 'dotenv/config';
import { PrismaClient, OrderStatus, PaymentMethod, TransactionType, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const SALT_ROUNDS = 10;

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

// Unsplash photo URLs — verified working (200 with browser UA)
const PHOTOS = {
  // Living Room
  sofa1: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=600&h=400&fit=crop',
  sofa2: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=600&h=400&fit=crop',
  sofa3: 'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=600&h=400&fit=crop',
  coffeeTable1: 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=600&h=400&fit=crop',
  coffeeTable2: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=400&fit=crop',
  floorLamp1: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=600&h=400&fit=crop',
  floorLamp2: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=600&h=400&fit=crop',
  bookshelf1: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop',
  rug1: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600&h=400&fit=crop',
  tvStand1: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&h=400&fit=crop',
  armchair1: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=400&fit=crop',
  // Bedroom
  bed1: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&h=400&fit=crop',
  bed2: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=600&h=400&fit=crop',
  bed3: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=600&h=400&fit=crop',
  bedsideTable1:
    'https://images.unsplash.com/photo-1595526051245-4506e0005bd0?w=600&h=400&fit=crop',
  wardrobe1: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop',
  wardrobe2: 'https://images.unsplash.com/photo-1595526051245-4506e0005bd0?w=600&h=400&fit=crop',
  dresser1: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=600&h=400&fit=crop',
  // Kitchen / Dining
  diningTable1: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=600&h=400&fit=crop',
  diningTable2: 'https://images.unsplash.com/photo-1550226891-ef816aed4a98?w=600&h=400&fit=crop',
  diningChair1: 'https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?w=600&h=400&fit=crop',
  kitchenIsland1:
    'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=600&h=400&fit=crop',
  kitchenShelf1: 'https://images.unsplash.com/photo-1550226891-ef816aed4a98?w=600&h=400&fit=crop',
  barStool1: 'https://images.unsplash.com/photo-1581539250439-c96689b516dd?w=600&h=400&fit=crop',
  // Bathroom
  bathroomCabinet1:
    'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&h=400&fit=crop',
  towelRack1: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=600&h=400&fit=crop',
  laundryBasket1: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&h=400&fit=crop',
  showerShelf1: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&h=400&fit=crop',
  vanityStool1: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=600&h=400&fit=crop',
  // Office
  standingDesk1:
    'https://images.unsplash.com/photo-1593642634315-48f5414c3ad9?w=600&h=400&fit=crop',
  standingDesk2:
    'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&h=400&fit=crop',
  officeChair1: 'https://images.unsplash.com/photo-1596079890744-c1a0462d0975?w=600&h=400&fit=crop',
  officeChair2: 'https://images.unsplash.com/photo-1596079890744-c1a0462d0975?w=600&h=400&fit=crop',
  monitorStand1:
    'https://images.unsplash.com/photo-1593640495253-23196b27a87f?w=600&h=400&fit=crop',
  filingCabinet1:
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop',
  deskOrganizer1:
    'https://images.unsplash.com/photo-1593640495253-23196b27a87f?w=600&h=400&fit=crop',
  // Outdoor
  gardenSet1: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=400&fit=crop',
  gardenSet2: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=400&fit=crop',
  bistroTable1: 'https://images.unsplash.com/photo-1521747116042-5a810fda9664?w=600&h=400&fit=crop',
  gardenBench1: 'https://images.unsplash.com/photo-1521747116042-5a810fda9664?w=600&h=400&fit=crop',
  planterBox1: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=400&fit=crop',
  // Decor
  wallArt1: 'https://images.unsplash.com/photo-1533158326339-7f3cf2404354?w=600&h=400&fit=crop',
  wallArt2: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=600&h=400&fit=crop',
  wallArt3: 'https://images.unsplash.com/photo-1533158326339-7f3cf2404354?w=600&h=400&fit=crop',
  mirror1: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&h=400&fit=crop',
  mirror2: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&h=400&fit=crop',
  vase1: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=600&h=400&fit=crop',
  vase2: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=600&h=400&fit=crop',
  candle1: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=600&h=400&fit=crop',
  clock1: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=600&h=400&fit=crop',
  // Textiles
  bedding1: 'https://images.unsplash.com/photo-1588614959060-4d144f28b207?w=600&h=400&fit=crop',
  bedding2: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&h=400&fit=crop',
  pillow1: 'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=600&h=400&fit=crop',
  pillow2: 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=600&h=400&fit=crop',
  throwBlanket1:
    'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600&h=400&fit=crop',
  curtain1: 'https://images.unsplash.com/photo-1497296690583-da0e2a4ce49a?w=600&h=400&fit=crop',
  tableRunner1: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=600&h=400&fit=crop',
  // Lighting
  pendantLight1:
    'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=600&h=400&fit=crop',
  pendantLight2:
    'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=600&h=400&fit=crop',
  wallSconce1: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=600&h=400&fit=crop',
  deskLamp1: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&h=400&fit=crop',
  tableLamp1: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&h=400&fit=crop',
  ledStrip1: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600&h=400&fit=crop',
  // Storage
  coatRack1: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop',
  storageBasket1:
    'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&h=400&fit=crop',
  storageBasket2:
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=400&fit=crop',
  wallHook1: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=600&h=400&fit=crop',
  shoeRack1: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop',
  storageBox1: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&h=400&fit=crop',
};

async function main() {
  const passwordHash = await hashPassword('Password1!');

  // ─── Users ───────────────────────────────────────────────────────────────

  const userRegular = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: { emailVerified: true },
    create: {
      email: 'alice@example.com',
      password: passwordHash,
      name: 'Alice',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
      walletBalance: 150,
      emailVerified: true,
    },
  });

  const userNew = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: { emailVerified: true },
    create: {
      email: 'bob@example.com',
      password: passwordHash,
      name: 'Bob',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob',
      walletBalance: 0,
      emailVerified: true,
    },
  });

  const userRich = await prisma.user.upsert({
    where: { email: 'admin@planq.com' },
    update: { role: Role.ADMIN, emailVerified: true },
    create: {
      email: 'admin@planq.com',
      password: passwordHash,
      name: 'Admin',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
      walletBalance: 999,
      role: Role.ADMIN,
      emailVerified: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'blocked@example.com' },
    update: { emailVerified: true },
    create: {
      email: 'blocked@example.com',
      password: passwordHash,
      name: 'Blocked User',
      isBlocked: true,
      walletBalance: 0,
      emailVerified: true,
    },
  });

  // Unverified test user
  await prisma.user.upsert({
    where: { email: 'unverified@example.com' },
    update: { emailVerified: false },
    create: {
      email: 'unverified@example.com',
      password: passwordHash,
      name: 'Unverified User',
      walletBalance: 0,
      emailVerified: false,
    },
  });

  // ─── Categories ──────────────────────────────────────────────────────────

  const categories = await Promise.all(
    [
      { name: 'Living Room', slug: 'living-room' },
      { name: 'Bedroom', slug: 'bedroom' },
      { name: 'Kitchen', slug: 'kitchen' },
      { name: 'Bathroom', slug: 'bathroom' },
      { name: 'Office', slug: 'office' },
      { name: 'Outdoor', slug: 'outdoor' },
      { name: 'Decor', slug: 'decor' },
      { name: 'Textiles', slug: 'textiles' },
      { name: 'Lighting', slug: 'lighting' },
      { name: 'Storage', slug: 'storage' },
    ].map(cat =>
      prisma.category.upsert({
        where: { slug: cat.slug },
        update: {},
        create: cat,
      })
    )
  );

  const [
    livingRoom,
    bedroom,
    kitchen,
    bathroom,
    office,
    outdoor,
    decor,
    textiles,
    lighting,
    storage,
  ] = categories;

  // ─── Products ────────────────────────────────────────────────────────────

  const productData = [
    // ── Living Room (7) ──────────────────────────────────────────────────
    {
      name: 'Nordic Sofa 3-Seater',
      slug: 'nordic-sofa',
      description:
        'Comfortable 3-seater sofa in Scandinavian style with solid oak legs and premium linen upholstery. Available in light grey and sand.',
      price: 899.99,
      salePrice: 749.99,
      stock: 12,
      categoryId: livingRoom.id,
      images: [PHOTOS.sofa1, PHOTOS.sofa2],
      rating: 4.5,
      reviewCount: 23,
      specs: {
        material: 'Premium linen upholstery, solid oak legs',
        dimensions: '210x90x85 cm',
        weight: '42 kg',
        color: 'Light Grey',
        warranty: '5 years',
        careInstructions: 'Vacuum regularly, spot clean with mild detergent',
      },
    },
    {
      name: 'Minimalist Coffee Table',
      slug: 'minimalist-coffee-table',
      description:
        'Round coffee table with walnut veneer top and powder-coated black metal legs. 90cm diameter.',
      price: 249.99,
      stock: 30,
      categoryId: livingRoom.id,
      images: [PHOTOS.coffeeTable1, PHOTOS.coffeeTable2],
      rating: 4.2,
      reviewCount: 15,
      specs: {
        material: 'Walnut veneer top, powder-coated steel legs',
        dimensions: '90x90x45 cm',
        weight: '12.5 kg',
        color: 'Walnut / Black',
        warranty: '2 years',
        careInstructions: 'Wipe with damp cloth, avoid abrasive cleaners',
      },
    },
    {
      name: 'Arc Floor Lamp',
      slug: 'floor-lamp-arco',
      description:
        'Modern arc floor lamp with adjustable marble base and warm-white E27 LED bulb. Height 190cm.',
      price: 189.99,
      stock: 45,
      categoryId: livingRoom.id,
      images: [PHOTOS.floorLamp1, PHOTOS.floorLamp2],
      rating: 4.8,
      reviewCount: 42,
      specs: {
        material: 'Marble base, brushed steel arm, fabric shade',
        dimensions: '40x40x190 cm',
        weight: '8.2 kg',
        color: 'White / Silver',
        warranty: '2 years',
        careInstructions: 'Dust with soft cloth, use E27 LED bulb max 12W',
      },
    },
    {
      name: 'Bookshelf Tall Oak',
      slug: 'bookshelf-tall-oak',
      description:
        'Tall 5-tier open bookshelf in solid oak. Clean lines, no hardware visible. H: 180cm.',
      price: 449.99,
      stock: 8,
      categoryId: livingRoom.id,
      images: [PHOTOS.bookshelf1],
      rating: 4.0,
      reviewCount: 7,
      specs: {
        material: 'Solid oak',
        dimensions: '80x30x180 cm',
        weight: '28 kg',
        color: 'Natural Oak',
        warranty: '3 years',
        careInstructions: 'Dust regularly, treat with wood oil every 6 months',
      },
    },
    {
      name: 'Wool Area Rug 200×300',
      slug: 'wool-area-rug',
      description:
        'Hand-tufted pure wool rug in warm ivory and terracotta. Thick pile, soft underfoot.',
      price: 329.99,
      salePrice: 279.99,
      stock: 15,
      categoryId: livingRoom.id,
      images: [PHOTOS.rug1],
      rating: 4.6,
      reviewCount: 19,
      specs: {
        material: '100% pure wool, cotton backing',
        dimensions: '200x300 cm',
        weight: '9.5 kg',
        color: 'Ivory / Terracotta',
        warranty: '2 years',
        careInstructions: 'Professional cleaning recommended, vacuum on low power',
      },
    },
    {
      name: 'Bouclé Armchair',
      slug: 'boucle-armchair',
      description:
        'Cozy bouclé fabric armchair with solid beech wood legs. Perfect reading corner companion.',
      price: 399.99,
      salePrice: 349.99,
      stock: 10,
      categoryId: livingRoom.id,
      images: [PHOTOS.armchair1, PHOTOS.sofa3],
      rating: 4.7,
      reviewCount: 31,
      specs: {
        material: 'Bouclé fabric, solid beech legs',
        dimensions: '75x80x82 cm',
        weight: '18 kg',
        color: 'Cream',
        warranty: '3 years',
        careInstructions: 'Brush gently to maintain texture, spot clean only',
      },
    },
    {
      name: 'TV Stand with Storage',
      slug: 'tv-stand-storage',
      description:
        'Low-profile TV stand with two drawers and open shelf. Fits TVs up to 65 inches. W: 150cm.',
      price: 299.99,
      stock: 18,
      categoryId: livingRoom.id,
      images: [PHOTOS.tvStand1],
      rating: 4.3,
      reviewCount: 14,
      specs: {
        material: 'MDF with oak veneer, steel handles',
        dimensions: '150x40x50 cm',
        weight: '24 kg',
        color: 'Natural Oak / Black',
        warranty: '2 years',
        careInstructions: 'Wipe with slightly damp cloth, do not use polish',
      },
    },

    // ── Bedroom (6) ──────────────────────────────────────────────────────
    {
      name: 'Platform Bed Frame Queen',
      slug: 'platform-bed-queen',
      description:
        'Low-profile platform bed with slatted solid wood base. No box spring needed. 160×200cm.',
      price: 599.99,
      stock: 20,
      categoryId: bedroom.id,
      specs: {
        material: 'Solid pine wood with walnut stain',
        dimensions: '160x200x30 cm',
        weight: '35 kg',
        color: 'Walnut',
        warranty: '5 years',
        careInstructions: 'Tighten bolts every 6 months, wipe with dry cloth',
      },
      images: [PHOTOS.bed1, PHOTOS.bed2],
      rating: 4.7,
      reviewCount: 31,
    },
    {
      name: 'Bedside Table Set of 2',
      slug: 'bedside-table-duo',
      description:
        'Pair of matching bedside tables with one drawer and open shelf. White lacquered MDF.',
      price: 179.99,
      salePrice: 149.99,
      stock: 25,
      categoryId: bedroom.id,
      images: [PHOTOS.bedsideTable1],
      rating: 4.3,
      reviewCount: 12,
      specs: {
        material: 'White lacquered MDF, solid beech legs',
        dimensions: '40x35x55 cm (each)',
        weight: '7.5 kg (each)',
        color: 'White',
        warranty: '2 years',
        careInstructions: 'Wipe with damp cloth, avoid excessive moisture',
      },
    },
    {
      name: 'Wardrobe with Sliding Doors',
      slug: 'wardrobe-sliding',
      description:
        'Spacious wardrobe with two sliding mirror doors, internal shelves and hanging rail. W: 200cm.',
      price: 799.99,
      stock: 6,
      categoryId: bedroom.id,
      images: [PHOTOS.wardrobe1, PHOTOS.wardrobe2],
      rating: 4.1,
      reviewCount: 9,
      specs: {
        material: 'Particleboard with melamine finish, mirror glass',
        dimensions: '200x62x220 cm',
        weight: '95 kg',
        color: 'White / Mirror',
        warranty: '5 years',
        careInstructions: 'Clean mirrors with glass cleaner, wipe surfaces with dry cloth',
      },
    },
    {
      name: 'Dresser 6-Drawer',
      slug: 'dresser-6-drawer',
      description: 'Solid oak dresser with six deep drawers and soft-close mechanism. W: 120cm.',
      price: 449.99,
      stock: 14,
      categoryId: bedroom.id,
      images: [PHOTOS.dresser1],
      rating: 4.4,
      reviewCount: 18,
      specs: {
        material: 'Solid oak, brass handles',
        dimensions: '120x45x80 cm',
        weight: '38 kg',
        color: 'Natural Oak',
        warranty: '3 years',
        careInstructions: 'Treat with wood oil annually, use coasters for drinks',
      },
    },
    {
      name: 'Upholstered Headboard King',
      slug: 'upholstered-headboard-king',
      description:
        'Velvet upholstered headboard for king-size bed. Button-tufted design. W: 180cm.',
      price: 219.99,
      salePrice: 179.99,
      stock: 22,
      categoryId: bedroom.id,
      images: [PHOTOS.bed3],
      rating: 4.6,
      reviewCount: 28,
      specs: {
        material: 'Velvet upholstery, plywood frame, foam padding',
        dimensions: '180x8x120 cm',
        weight: '15 kg',
        color: 'Dusty Rose',
        warranty: '2 years',
        careInstructions: 'Vacuum with upholstery attachment, spot clean only',
      },
    },
    // Edge case: no images
    {
      name: 'Memory Foam Pillow Set',
      slug: 'memory-foam-pillow',
      description:
        'Set of two ergonomic memory foam pillows with bamboo-derived covers. Hypoallergenic.',
      price: 69.99,
      stock: 100,
      categoryId: bedroom.id,
      images: [],
      rating: 3.8,
      reviewCount: 56,
      specs: {
        material: 'Memory foam core, bamboo-derived rayon cover',
        dimensions: '60x40x12 cm (each)',
        weight: '1.2 kg (each)',
        color: 'White',
        warranty: '2 years',
        careInstructions: 'Machine wash covers at 40°C, do not wash foam core',
      },
    },

    // ── Kitchen / Dining (6) ─────────────────────────────────────────────
    {
      name: 'Extendable Dining Table',
      slug: 'dining-table-extendable',
      description:
        'Solid birch dining table that extends from 120cm to 200cm. Seats 4–8. White lacquered.',
      price: 549.99,
      stock: 10,
      categoryId: kitchen.id,
      images: [PHOTOS.diningTable1, PHOTOS.diningTable2],
      rating: 4.6,
      reviewCount: 27,
      specs: {
        material: 'Solid birch with white lacquer finish',
        dimensions: '120-200x85x75 cm',
        weight: '45 kg',
        color: 'White',
        warranty: '5 years',
        careInstructions: 'Wipe spills immediately, use placemats to protect surface',
      },
    },
    {
      name: 'Dining Chair Set of 4',
      slug: 'dining-chairs-set',
      description:
        'Set of four stackable chairs with moulded plastic seat and solid beech legs. Various colours.',
      price: 299.99,
      salePrice: 249.99,
      stock: 18,
      categoryId: kitchen.id,
      images: [PHOTOS.diningChair1],
      rating: 4.3,
      reviewCount: 34,
      specs: {
        material: 'Moulded polypropylene seat, solid beech legs',
        dimensions: '46x52x82 cm (each)',
        weight: '4.2 kg (each)',
        color: 'White / Natural',
        warranty: '2 years',
        careInstructions: 'Wipe with damp cloth, use felt pads on leg bottoms',
      },
    },
    {
      name: 'Kitchen Island Cart',
      slug: 'kitchen-island-cart',
      description:
        'Mobile kitchen island on lockable wheels with butcher block top and two open shelves.',
      price: 379.99,
      stock: 7,
      categoryId: kitchen.id,
      images: [PHOTOS.kitchenIsland1],
      rating: 4.5,
      reviewCount: 11,
      specs: {
        material: 'Solid rubberwood top, steel frame',
        dimensions: '90x60x90 cm',
        weight: '30 kg',
        color: 'Natural Wood / Black',
        warranty: '2 years',
        careInstructions: 'Oil butcher block monthly, lock wheels when stationary',
      },
    },
    {
      name: 'Floating Shelves Set of 3',
      slug: 'wall-shelf-kitchen',
      description:
        'Set of three oak veneer floating shelves in S/M/L sizes. Easy wall mount. Max load 15kg each.',
      price: 59.99,
      stock: 50,
      categoryId: kitchen.id,
      images: [PHOTOS.kitchenShelf1],
      rating: 4.1,
      reviewCount: 22,
      specs: {
        material: 'Oak veneer over MDF, concealed steel bracket',
        dimensions: '40/60/80x20x3 cm',
        weight: '2.5 kg (set)',
        color: 'Natural Oak',
        warranty: '2 years',
        careInstructions: 'Dust regularly, do not exceed 15 kg per shelf',
      },
    },
    // Edge case: stock 0
    {
      name: 'Height-Adjustable Bar Stool',
      slug: 'bar-stool-adjustable',
      description:
        'Bar stool with chrome base, 360° swivel and faux leather seat. Adjustable height 60–80cm.',
      price: 129.99,
      stock: 0,
      categoryId: kitchen.id,
      images: [PHOTOS.barStool1],
      rating: 3.9,
      reviewCount: 8,
      specs: {
        material: 'Chrome-plated steel, faux leather seat',
        dimensions: '40x40x60-80 cm',
        weight: '6.8 kg',
        color: 'Black / Chrome',
        warranty: '1 year',
        careInstructions: 'Wipe seat with leather cleaner, do not use bleach',
      },
    },
    {
      name: 'Marble Lazy Susan 40cm',
      slug: 'marble-lazy-susan',
      description:
        'Elegant white marble rotating serving board. Perfect for dining table centerpiece or cheese board.',
      price: 44.99,
      stock: 35,
      categoryId: kitchen.id,
      images: [PHOTOS.diningTable2],
      rating: 4.8,
      reviewCount: 43,
      specs: {
        material: 'Natural marble with rubber base',
        dimensions: '40x40x3 cm',
        weight: '3.8 kg',
        color: 'White Marble',
        warranty: '1 year',
        careInstructions: 'Hand wash only, do not use in microwave, seal annually',
      },
    },

    // ── Bathroom (5) ─────────────────────────────────────────────────────
    {
      name: 'Bathroom Mirror Cabinet',
      slug: 'bathroom-cabinet-mirror',
      description:
        'Wall-mounted cabinet with integrated mirror door and two interior glass shelves. W: 60cm.',
      price: 159.99,
      stock: 22,
      categoryId: bathroom.id,
      images: [PHOTOS.bathroomCabinet1],
      rating: 4.2,
      reviewCount: 16,
      specs: {
        material: 'MDF with moisture-resistant coating, mirror glass',
        dimensions: '60x15x70 cm',
        weight: '11 kg',
        color: 'White',
        warranty: '2 years',
        careInstructions: 'Clean mirror with glass cleaner, wipe body with dry cloth',
      },
    },
    {
      name: 'Bamboo Towel Rack',
      slug: 'towel-rack-freestanding',
      description:
        'Freestanding bamboo towel rack with three bars. Water-resistant lacquer finish. H: 160cm.',
      price: 49.99,
      stock: 40,
      categoryId: bathroom.id,
      images: [PHOTOS.towelRack1],
      rating: 4.0,
      reviewCount: 29,
      specs: {
        material: 'Solid bamboo with water-resistant lacquer',
        dimensions: '50x28x160 cm',
        weight: '3.5 kg',
        color: 'Natural Bamboo',
        warranty: '2 years',
        careInstructions: 'Wipe dry after contact with water, re-lacquer yearly',
      },
    },
    {
      name: 'Seagrass Laundry Basket',
      slug: 'laundry-basket-woven',
      description:
        'Handwoven seagrass laundry basket with removable cotton liner and leather handles. 50L.',
      price: 39.99,
      stock: 35,
      categoryId: bathroom.id,
      images: [PHOTOS.laundryBasket1],
      rating: 4.4,
      reviewCount: 21,
      specs: {
        material: 'Natural seagrass, cotton liner, leather handles',
        dimensions: '40x40x55 cm',
        weight: '2.2 kg',
        color: 'Natural',
        warranty: '1 year',
        careInstructions: 'Remove liner for washing, keep seagrass dry',
      },
    },
    {
      name: 'Corner Shower Shelf',
      slug: 'shower-shelf-corner',
      description:
        'Rust-proof brushed stainless steel corner shower caddy. No-drill adhesive mounting. 2-tier.',
      price: 24.99,
      stock: 60,
      categoryId: bathroom.id,
      images: [PHOTOS.showerShelf1],
      rating: 4.7,
      reviewCount: 45,
      specs: {
        material: 'Brushed 304 stainless steel',
        dimensions: '25x25x35 cm',
        weight: '1.1 kg',
        color: 'Brushed Silver',
        warranty: '3 years',
        careInstructions: 'Rinse after use to prevent soap buildup, no abrasive pads',
      },
    },
    {
      name: 'Velvet Vanity Stool',
      slug: 'vanity-stool-velvet',
      description:
        'Round vanity stool with dusty pink velvet seat and gold-finish tapered legs. H: 50cm.',
      price: 89.99,
      salePrice: 69.99,
      stock: 16,
      categoryId: bathroom.id,
      images: [PHOTOS.vanityStool1],
      rating: 4.6,
      reviewCount: 13,
      specs: {
        material: 'Velvet seat, steel legs with gold finish',
        dimensions: '38x38x50 cm',
        weight: '4.5 kg',
        color: 'Dusty Pink / Gold',
        warranty: '1 year',
        careInstructions: 'Spot clean velvet, avoid placing in wet areas',
      },
    },

    // ── Office (6) ───────────────────────────────────────────────────────
    {
      name: 'Electric Standing Desk',
      slug: 'standing-desk-electric',
      description:
        'Electric sit-stand desk with memory presets, cable management, and bamboo surface. 140×70cm.',
      price: 699.99,
      stock: 9,
      categoryId: office.id,
      images: [PHOTOS.standingDesk1, PHOTOS.standingDesk2],
      rating: 4.8,
      reviewCount: 38,
      specs: {
        material: 'Bamboo surface, powder-coated steel frame',
        dimensions: '140x70x65-130 cm',
        weight: '32 kg',
        color: 'Natural Bamboo / Black',
        warranty: '5 years',
        careInstructions: 'Wipe bamboo surface with damp cloth, lubricate motor yearly',
      },
    },
    {
      name: 'Ergonomic Mesh Office Chair',
      slug: 'ergonomic-office-chair',
      description:
        'Fully adjustable mesh chair with lumbar support, adjustable armrests, headrest, and tilt lock.',
      price: 499.99,
      salePrice: 399.99,
      stock: 15,
      categoryId: office.id,
      images: [PHOTOS.officeChair1, PHOTOS.officeChair2],
      rating: 4.9,
      reviewCount: 67,
      specs: {
        material: 'Breathable mesh back, foam seat, nylon base',
        dimensions: '68x68x110-125 cm',
        weight: '14 kg',
        color: 'Black',
        warranty: '5 years',
        careInstructions: 'Vacuum mesh periodically, tighten screws every 3 months',
      },
    },
    {
      name: 'Bamboo Monitor Riser',
      slug: 'monitor-stand-bamboo',
      description:
        'Solid bamboo monitor stand with integrated USB hub and storage compartment underneath.',
      price: 44.99,
      stock: 55,
      categoryId: office.id,
      images: [PHOTOS.monitorStand1],
      rating: 4.3,
      reviewCount: 24,
      specs: {
        material: 'Solid bamboo with USB 3.0 hub',
        dimensions: '50x22x8 cm',
        weight: '1.8 kg',
        color: 'Natural Bamboo',
        warranty: '2 years',
        careInstructions: 'Wipe with damp cloth, do not submerge USB hub in water',
      },
    },
    {
      name: '3-Drawer Filing Cabinet',
      slug: 'filing-cabinet-3',
      description:
        'Steel filing cabinet with three lockable drawers and anti-tilt mechanism. Fits A4 and foolscap.',
      price: 149.99,
      stock: 20,
      categoryId: office.id,
      images: [PHOTOS.filingCabinet1],
      rating: 3.7,
      reviewCount: 5,
      specs: {
        material: 'Cold-rolled steel with powder coating',
        dimensions: '47x62x103 cm',
        weight: '28 kg',
        color: 'Matte Black',
        warranty: '5 years',
        careInstructions: 'Lubricate drawer slides annually, wipe with dry cloth',
      },
    },
    {
      name: 'Acoustic Office Divider',
      slug: 'acoustic-office-divider',
      description:
        'Freestanding acoustic desk divider to reduce noise and provide privacy. W: 120cm.',
      price: 89.99,
      stock: 30,
      categoryId: office.id,
      images: [PHOTOS.standingDesk2],
      rating: 4.2,
      reviewCount: 17,
      specs: {
        material: 'Recycled polyester felt, aluminium frame',
        dimensions: '120x3x50 cm',
        weight: '3.2 kg',
        color: 'Dark Grey',
        warranty: '2 years',
        careInstructions: 'Vacuum felt surface, spot clean with mild detergent',
      },
    },
    // Edge case: lowest rating
    {
      name: 'Basic Desk Organizer',
      slug: 'desk-organizer-plastic',
      description:
        'Simple plastic desk organizer with compartments for pens, scissors, and sticky notes.',
      price: 12.99,
      stock: 200,
      categoryId: office.id,
      images: [PHOTOS.deskOrganizer1],
      rating: 1.0,
      reviewCount: 3,
      specs: {
        material: 'Recycled ABS plastic',
        dimensions: '25x15x12 cm',
        weight: '0.4 kg',
        color: 'Black',
        warranty: '1 year',
        careInstructions: 'Wash with warm soapy water, air dry',
      },
    },

    // ── Outdoor (5) ──────────────────────────────────────────────────────
    {
      name: 'Garden Lounge Set 4-Piece',
      slug: 'garden-lounge-set',
      description:
        'Outdoor rattan lounge set: 2 armchairs, sofa, and glass-top table. All-weather wicker.',
      price: 1299.99,
      salePrice: 999.99,
      stock: 4,
      categoryId: outdoor.id,
      images: [PHOTOS.gardenSet1, PHOTOS.gardenSet2],
      rating: 4.5,
      reviewCount: 14,
      specs: {
        material: 'PE rattan wicker, aluminium frame, tempered glass',
        dimensions: '220x180x75 cm (set)',
        weight: '48 kg',
        color: 'Brown / Beige cushions',
        warranty: '3 years',
        careInstructions: 'Cover in winter, wash cushion covers at 30°C',
      },
    },
    {
      name: 'Folding Bistro Table',
      slug: 'folding-bistro-table',
      description:
        'Compact folding steel bistro table for balcony or patio. Powder-coated, rust-resistant.',
      price: 79.99,
      stock: 30,
      categoryId: outdoor.id,
      images: [PHOTOS.bistroTable1],
      rating: 4.2,
      reviewCount: 20,
      specs: {
        material: 'Powder-coated steel',
        dimensions: '60x60x72 cm',
        weight: '5.5 kg',
        color: 'Matte Black',
        warranty: '2 years',
        careInstructions: 'Store folded in dry area during winter, wipe with damp cloth',
      },
    },
    {
      name: 'Garden Storage Bench',
      slug: 'outdoor-bench-storage',
      description:
        'Teak garden bench with weatherproof storage compartment under the seat. Seats 2–3.',
      price: 229.99,
      stock: 11,
      categoryId: outdoor.id,
      images: [PHOTOS.gardenBench1],
      rating: 4.4,
      reviewCount: 9,
      specs: {
        material: 'Grade-A teak wood',
        dimensions: '120x55x90 cm',
        weight: '22 kg',
        color: 'Natural Teak',
        warranty: '5 years',
        careInstructions: 'Apply teak oil every 6 months, will naturally silver if untreated',
      },
    },
    {
      name: 'Large Planter Box',
      slug: 'planter-box-large',
      description:
        'Powder-coated steel planter box for indoor or outdoor use. Drainage holes and tray included.',
      price: 54.99,
      stock: 25,
      categoryId: outdoor.id,
      images: [PHOTOS.planterBox1],
      rating: 4.1,
      reviewCount: 17,
      specs: {
        material: 'Powder-coated galvanized steel',
        dimensions: '60x25x50 cm',
        weight: '4.8 kg',
        color: 'Anthracite Grey',
        warranty: '3 years',
        careInstructions: 'Ensure drainage holes are clear, rinse with water seasonally',
      },
    },
    {
      name: 'Hammock with Stand',
      slug: 'hammock-with-stand',
      description:
        'Cotton rope hammock with sturdy steel stand. Easy assembly, no trees required. Max load 150kg.',
      price: 149.99,
      salePrice: 119.99,
      stock: 8,
      categoryId: outdoor.id,
      images: [PHOTOS.gardenSet2],
      rating: 4.7,
      reviewCount: 36,
      specs: {
        material: 'Organic cotton rope, powder-coated steel stand',
        dimensions: '280x100x110 cm',
        weight: '15 kg',
        color: 'Natural White / Black stand',
        warranty: '2 years',
        careInstructions: 'Bring indoors during rain, machine wash hammock at 30°C',
      },
    },

    // ── Decor (8) ────────────────────────────────────────────────────────
    {
      name: 'Abstract Canvas Print Large',
      slug: 'abstract-canvas-print',
      description:
        'Museum-quality canvas print with abstract brushstroke art. Stretched on solid wood frame. 80×120cm.',
      price: 119.99,
      salePrice: 89.99,
      stock: 20,
      categoryId: decor.id,
      images: [PHOTOS.wallArt1, PHOTOS.wallArt2],
      rating: 4.6,
      reviewCount: 33,
      specs: {
        material: 'Giclée print on cotton canvas, pine stretcher bars',
        dimensions: '80x120x3 cm',
        weight: '2.5 kg',
        color: 'Multicolor',
        warranty: '1 year',
        careInstructions: 'Dust with soft brush, avoid direct sunlight',
      },
    },
    {
      name: 'Gallery Wall Set of 5',
      slug: 'gallery-wall-set',
      description:
        'Curated set of five black-and-white art prints in black frames. Ready to hang. Various sizes.',
      price: 79.99,
      stock: 15,
      categoryId: decor.id,
      images: [PHOTOS.wallArt3, PHOTOS.wallArt1],
      rating: 4.8,
      reviewCount: 51,
      specs: {
        material: 'Art paper prints, black aluminium frames, glass front',
        dimensions: '20x30 to 30x40 cm',
        weight: '3.5 kg (set)',
        color: 'Black & White',
        warranty: '1 year',
        careInstructions: 'Clean glass with glass cleaner, dust frames regularly',
      },
    },
    {
      name: 'Round Arch Mirror 80cm',
      slug: 'round-arch-mirror',
      description:
        'Arch-top wall mirror with thin gold-tone metal frame. Elegant minimal design. H: 80cm.',
      price: 139.99,
      stock: 18,
      categoryId: decor.id,
      images: [PHOTOS.mirror1, PHOTOS.mirror2],
      rating: 4.9,
      reviewCount: 72,
      specs: {
        material: 'Float glass mirror, iron frame with gold finish',
        dimensions: '50x80x2 cm',
        weight: '5.8 kg',
        color: 'Gold',
        warranty: '2 years',
        careInstructions: 'Clean with glass cleaner, avoid abrasive materials on frame',
      },
    },
    {
      name: 'Ceramic Vase Set of 3',
      slug: 'ceramic-vase-set',
      description:
        'Set of three handmade ceramic vases in neutral earth tones. Different heights for layered display.',
      price: 49.99,
      salePrice: 39.99,
      stock: 40,
      categoryId: decor.id,
      images: [PHOTOS.vase1, PHOTOS.vase2],
      rating: 4.7,
      reviewCount: 48,
      specs: {
        material: 'Handmade stoneware ceramic with matte glaze',
        dimensions: '12x12x20/25/30 cm',
        weight: '2.8 kg (set)',
        color: 'Sand / Terracotta / Sage',
        warranty: '1 year',
        careInstructions: 'Hand wash, not dishwasher safe, waterproof for fresh flowers',
      },
    },
    {
      name: 'Scented Candle Set',
      slug: 'scented-candle-set',
      description:
        'Set of four soy-wax candles in amber glass jars. Scents: cedar, vanilla, eucalyptus, linen.',
      price: 34.99,
      stock: 80,
      categoryId: decor.id,
      images: [PHOTOS.candle1],
      rating: 4.5,
      reviewCount: 89,
      specs: {
        material: 'Soy wax, cotton wick, amber glass jars',
        dimensions: '8x8x10 cm (each)',
        weight: '0.35 kg (each)',
        color: 'Amber Glass',
        warranty: 'N/A',
        careInstructions: 'Trim wick to 5mm before each use, burn max 4 hours at a time',
      },
    },
    {
      name: 'Minimalist Wall Clock',
      slug: 'minimalist-wall-clock',
      description:
        'Silent sweep mechanism wall clock. Black hands on white face with oak frame. 30cm diameter.',
      price: 44.99,
      stock: 55,
      categoryId: decor.id,
      images: [PHOTOS.clock1],
      rating: 4.4,
      reviewCount: 27,
      specs: {
        material: 'Oak frame, glass face, quartz movement',
        dimensions: '30x30x4 cm',
        weight: '0.8 kg',
        color: 'Natural Oak / White',
        warranty: '2 years',
        careInstructions: 'Replace AA battery annually, dust with soft cloth',
      },
    },
    {
      name: 'Macramé Wall Hanging',
      slug: 'macrame-wall-hanging',
      description:
        'Hand-knotted cotton macramé wall art on driftwood. Boho style. W: 60cm, H: 90cm.',
      price: 59.99,
      stock: 12,
      categoryId: decor.id,
      images: [PHOTOS.wallArt2],
      rating: 4.3,
      reviewCount: 19,
      specs: {
        material: '100% natural cotton rope, driftwood rod',
        dimensions: '60x90 cm',
        weight: '0.9 kg',
        color: 'Natural Ivory',
        warranty: '1 year',
        careInstructions: 'Shake out dust, spot clean with cold water only',
      },
    },
    {
      name: 'Decorative Tray Set',
      slug: 'decorative-tray-set',
      description:
        'Nesting set of two rectangular trays in matte black steel. Style your coffee table or dresser.',
      price: 29.99,
      stock: 60,
      categoryId: decor.id,
      images: [PHOTOS.vase2],
      rating: 4.2,
      reviewCount: 15,
      specs: {
        material: 'Matte powder-coated steel',
        dimensions: '30x20x3 cm / 40x25x3 cm',
        weight: '1.5 kg (set)',
        color: 'Matte Black',
        warranty: '1 year',
        careInstructions: 'Wipe with damp cloth, dry immediately to prevent spots',
      },
    },

    // ── Textiles (7) ─────────────────────────────────────────────────────
    {
      name: 'Linen Duvet Cover Set',
      slug: 'linen-duvet-cover',
      description:
        'Washed French linen duvet cover and two pillowcases. Breathable and pre-softened. 200×200cm.',
      price: 129.99,
      salePrice: 99.99,
      stock: 30,
      categoryId: textiles.id,
      images: [PHOTOS.bedding1, PHOTOS.bedding2],
      rating: 4.8,
      reviewCount: 64,
      specs: {
        material: '100% French flax linen, OEKO-TEX certified',
        dimensions: '200x200 cm (duvet), 50x70 cm (pillowcases)',
        weight: '1.8 kg',
        color: 'Natural Linen',
        warranty: '1 year',
        careInstructions: 'Machine wash 40°C gentle, tumble dry low, gets softer with each wash',
      },
    },
    {
      name: 'Velvet Cushion Set of 4',
      slug: 'velvet-cushion-set',
      description:
        'Set of four velvet throw cushions in complementary muted tones. 45×45cm. Inserts included.',
      price: 69.99,
      salePrice: 54.99,
      stock: 45,
      categoryId: textiles.id,
      images: [PHOTOS.pillow1, PHOTOS.pillow2],
      rating: 4.6,
      reviewCount: 41,
      specs: {
        material: 'Cotton velvet covers, polyester fill inserts',
        dimensions: '45x45 cm (each)',
        weight: '0.6 kg (each)',
        color: 'Sage / Terracotta / Ivory / Dusty Blue',
        warranty: '1 year',
        careInstructions: 'Remove covers and machine wash at 30°C, do not bleach',
      },
    },
    {
      name: 'Chunky Knit Throw Blanket',
      slug: 'chunky-knit-throw',
      description:
        'Hand-knitted merino wool throw blanket. Extra thick and warm. 130×170cm. Natural ivory.',
      price: 89.99,
      stock: 20,
      categoryId: textiles.id,
      images: [PHOTOS.throwBlanket1],
      rating: 4.9,
      reviewCount: 93,
      specs: {
        material: '100% merino wool, hand-knitted',
        dimensions: '130x170 cm',
        weight: '2.5 kg',
        color: 'Natural Ivory',
        warranty: '1 year',
        careInstructions: 'Dry clean only or hand wash in cold water, lay flat to dry',
      },
    },
    {
      name: 'Linen Blackout Curtains',
      slug: 'linen-blackout-curtains',
      description:
        'Room-darkening linen-look curtains. Each panel 140×250cm. Sold as a pair with eyelet top.',
      price: 79.99,
      stock: 25,
      categoryId: textiles.id,
      images: [PHOTOS.curtain1],
      rating: 4.4,
      reviewCount: 38,
      specs: {
        material: 'Polyester-linen blend with thermal blackout lining',
        dimensions: '140x250 cm (per panel)',
        weight: '2.2 kg (pair)',
        color: 'Oatmeal',
        warranty: '1 year',
        careInstructions: 'Machine wash cold, hang dry, iron on low heat if needed',
      },
    },
    {
      name: 'Cotton Waffle Bath Towels',
      slug: 'waffle-bath-towels',
      description:
        'Set of four premium waffle-weave cotton towels: 2 bath and 2 hand towels. Quick-dry.',
      price: 49.99,
      salePrice: 39.99,
      stock: 60,
      categoryId: textiles.id,
      images: [PHOTOS.towelRack1],
      rating: 4.5,
      reviewCount: 55,
      specs: {
        material: '100% long-staple Turkish cotton, 400 GSM',
        dimensions: '70x140 cm (bath), 40x70 cm (hand)',
        weight: '1.6 kg (set)',
        color: 'White',
        warranty: '1 year',
        careInstructions: 'Machine wash 60°C, tumble dry, avoid fabric softener',
      },
    },
    {
      name: 'Table Runner Natural Linen',
      slug: 'table-runner-linen',
      description:
        'Hand-stitched natural linen table runner with fringed ends. 40×180cm. Washes beautifully.',
      price: 24.99,
      stock: 70,
      categoryId: textiles.id,
      images: [PHOTOS.tableRunner1],
      rating: 4.3,
      reviewCount: 22,
      specs: {
        material: '100% natural linen',
        dimensions: '40x180 cm',
        weight: '0.3 kg',
        color: 'Natural Flax',
        warranty: '1 year',
        careInstructions: 'Machine wash 40°C, iron while damp for crisp look',
      },
    },
    {
      name: 'Shaggy Bathroom Mat',
      slug: 'shaggy-bath-mat',
      description:
        'Extra-thick microfibre bath mat with non-slip backing. 50×80cm. Machine washable.',
      price: 19.99,
      stock: 90,
      categoryId: textiles.id,
      images: [PHOTOS.bathroomCabinet1],
      rating: 4.1,
      reviewCount: 31,
      specs: {
        material: 'Microfibre pile, TPR non-slip backing',
        dimensions: '50x80 cm',
        weight: '0.7 kg',
        color: 'Light Grey',
        warranty: '1 year',
        careInstructions: 'Machine wash 40°C, do not tumble dry, air dry flat',
      },
    },

    // ── Lighting (6) ─────────────────────────────────────────────────────
    {
      name: 'Brass Pendant Light',
      slug: 'brass-pendant-light',
      description:
        'Adjustable brass pendant lamp with opaque white glass shade. E27 socket. Cable length 150cm.',
      price: 89.99,
      salePrice: 74.99,
      stock: 25,
      categoryId: lighting.id,
      images: [PHOTOS.pendantLight1, PHOTOS.pendantLight2],
      rating: 4.7,
      reviewCount: 44,
      specs: {
        material: 'Brass-plated steel, opal glass shade',
        dimensions: '22x22x25 cm (shade), 150 cm cable',
        weight: '2.1 kg',
        color: 'Brass / White',
        warranty: '2 years',
        careInstructions: 'Dust shade gently, use max 12W E27 LED bulb',
      },
    },
    {
      name: 'Wall Sconce Set of 2',
      slug: 'wall-sconce-set',
      description:
        'Pair of minimalist wall sconces in matte black. Compatible with G9 LED bulbs (not included).',
      price: 64.99,
      stock: 30,
      categoryId: lighting.id,
      images: [PHOTOS.wallSconce1],
      rating: 4.5,
      reviewCount: 29,
      specs: {
        material: 'Steel with matte black powder coating',
        dimensions: '10x12x18 cm (each)',
        weight: '0.6 kg (each)',
        color: 'Matte Black',
        warranty: '2 years',
        careInstructions: 'Professional installation recommended, use G9 LED max 5W',
      },
    },
    {
      name: 'LED Desk Lamp',
      slug: 'led-desk-lamp',
      description:
        'Touch-control desk lamp with 5 brightness levels, USB charging port, and flexible gooseneck arm.',
      price: 39.99,
      stock: 80,
      categoryId: lighting.id,
      images: [PHOTOS.deskLamp1],
      rating: 4.6,
      reviewCount: 112,
      specs: {
        material: 'Aluminium body, silicone gooseneck',
        dimensions: '15x15x45 cm',
        weight: '0.9 kg',
        color: 'Matte White',
        warranty: '2 years',
        careInstructions: 'Wipe with dry cloth, do not expose USB port to moisture',
      },
    },
    {
      name: 'Rattan Table Lamp',
      slug: 'rattan-table-lamp',
      description:
        'Natural rattan table lamp with white linen shade. E27 socket. H: 45cm. Warm ambient light.',
      price: 59.99,
      stock: 22,
      categoryId: lighting.id,
      images: [PHOTOS.tableLamp1],
      rating: 4.8,
      reviewCount: 37,
      specs: {
        material: 'Natural rattan base, white linen shade',
        dimensions: '25x25x45 cm',
        weight: '1.4 kg',
        color: 'Natural / White',
        warranty: '1 year',
        careInstructions: 'Dust rattan with soft brush, use max 10W E27 LED bulb',
      },
    },
    {
      name: 'Smart LED Strip 5m',
      slug: 'smart-led-strip',
      description:
        'Wi-Fi controlled RGB LED strip. App and voice control. Self-adhesive backing. 5m roll.',
      price: 29.99,
      salePrice: 24.99,
      stock: 120,
      categoryId: lighting.id,
      images: [PHOTOS.ledStrip1],
      rating: 4.3,
      reviewCount: 178,
      specs: {
        material: 'Flexible PCB, 3M adhesive backing',
        dimensions: '500x1x0.3 cm',
        weight: '0.2 kg',
        color: 'RGB (16 million colors)',
        warranty: '2 years',
        careInstructions: 'Clean surface before applying, do not bend at sharp angles',
      },
    },
    {
      name: 'Cluster Ceiling Light',
      slug: 'cluster-ceiling-light',
      description:
        'Industrial-style cluster light with 6 adjustable pendant arms. Matte black metal. E27 sockets.',
      price: 149.99,
      stock: 10,
      categoryId: lighting.id,
      images: [PHOTOS.pendantLight2],
      rating: 4.6,
      reviewCount: 21,
      specs: {
        material: 'Steel with matte black finish',
        dimensions: '50x50x40 cm (adjustable arms)',
        weight: '4.5 kg',
        color: 'Matte Black',
        warranty: '2 years',
        careInstructions: 'Professional installation required, use 6x E27 LED max 8W',
      },
    },

    // ── Storage (6) ──────────────────────────────────────────────────────
    {
      name: 'Wooden Coat Rack',
      slug: 'wooden-coat-rack',
      description:
        'Freestanding coat rack in solid beech with 8 hooks and lower shoe shelf. H: 170cm.',
      price: 69.99,
      stock: 35,
      categoryId: storage.id,
      images: [PHOTOS.coatRack1],
      rating: 4.4,
      reviewCount: 26,
      specs: {
        material: 'Solid beech wood, steel hooks',
        dimensions: '45x45x170 cm',
        weight: '6.5 kg',
        color: 'Natural Beech',
        warranty: '2 years',
        careInstructions: 'Wipe with dry cloth, do not overload hooks (max 3 kg each)',
      },
    },
    {
      name: 'Seagrass Basket Set of 3',
      slug: 'seagrass-basket-set',
      description:
        'Nesting set of three handwoven seagrass baskets with leather handles. S/M/L. Multipurpose.',
      price: 44.99,
      stock: 50,
      categoryId: storage.id,
      images: [PHOTOS.storageBasket1, PHOTOS.storageBasket2],
      rating: 4.7,
      reviewCount: 59,
      specs: {
        material: 'Natural seagrass, genuine leather handles',
        dimensions: '25x20/30x25/35x30 cm',
        weight: '1.8 kg (set)',
        color: 'Natural',
        warranty: '1 year',
        careInstructions: 'Keep dry, shake out dust, store nested when not in use',
      },
    },
    {
      name: 'Floating Wall Shelf with Hooks',
      slug: 'wall-shelf-with-hooks',
      description:
        'Oak wall shelf with 4 matte black hooks underneath. Ideal for hallway or bathroom. W: 80cm.',
      price: 34.99,
      stock: 45,
      categoryId: storage.id,
      images: [PHOTOS.wallHook1],
      rating: 4.5,
      reviewCount: 33,
      specs: {
        material: 'Solid oak shelf, steel hooks with black finish',
        dimensions: '80x15x12 cm',
        weight: '2.8 kg',
        color: 'Oak / Black',
        warranty: '2 years',
        careInstructions: 'Max load 10 kg on shelf, 2 kg per hook, use wall anchors for drywall',
      },
    },
    {
      name: '10-Tier Shoe Rack',
      slug: 'shoe-rack-10-tier',
      description:
        'Stackable metal shoe rack for 10 pairs. Space-saving design, easy assembly. H: 150cm.',
      price: 39.99,
      stock: 40,
      categoryId: storage.id,
      images: [PHOTOS.shoeRack1],
      rating: 4.2,
      reviewCount: 18,
      specs: {
        material: 'Powder-coated steel tubes, plastic connectors',
        dimensions: '55x25x150 cm',
        weight: '3.2 kg',
        color: 'Black',
        warranty: '2 years',
        careInstructions: 'Wipe with damp cloth, ensure level ground for stability',
      },
    },
    {
      name: 'Linen Storage Boxes Set of 4',
      slug: 'linen-storage-boxes',
      description:
        'Set of four collapsible linen storage boxes with lids and labels. Wardrobe and shelf-friendly.',
      price: 29.99,
      stock: 65,
      categoryId: storage.id,
      images: [PHOTOS.storageBox1],
      rating: 4.3,
      reviewCount: 42,
      specs: {
        material: 'Linen-cotton blend fabric, cardboard frame',
        dimensions: '33x33x33 cm (each)',
        weight: '0.5 kg (each)',
        color: 'Grey',
        warranty: '1 year',
        careInstructions: 'Spot clean exterior, collapse flat for storage',
      },
    },
    // Edge case: very long name
    {
      name: 'Premium Scandinavian Design Extra Large L-Shaped Sectional Sofa With Integrated Storage And Adjustable Headrests In Natural Linen',
      slug: 'premium-sectional-sofa-xl',
      description:
        'Ultimate comfort for large living spaces. L-shaped design with built-in storage compartments and motorised recline.',
      price: 2499.99,
      stock: 3,
      categoryId: livingRoom.id,
      images: [PHOTOS.sofa2, PHOTOS.sofa3, PHOTOS.sofa1],
      rating: 5.0,
      reviewCount: 2,
      specs: {
        material: 'Natural linen upholstery, solid oak frame, high-density foam',
        dimensions: '320x200x90 cm',
        weight: '85 kg',
        color: 'Natural Linen',
        warranty: '7 years',
        careInstructions:
          'Professional cleaning recommended, vacuum weekly, rotate cushions monthly',
      },
    },
  ];

  const products = await Promise.all(
    productData.map(p =>
      prisma.product.upsert({
        where: { slug: p.slug },
        update: { images: p.images, specs: p.specs },
        create: p,
      })
    )
  );

  // ─── Carts ────────────────────────────────────────────────────────────────

  for (const user of [userRegular, userNew, userRich]) {
    await prisma.cart.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id },
    });
  }

  // ─── Orders ───────────────────────────────────────────────────────────────

  const findProduct = (slug: string) => {
    const product = products.find(p => p.slug === slug);
    if (!product) throw new Error(`Product not found: ${slug}`);
    return product;
  };

  const nordicSofa = findProduct('nordic-sofa');
  const coffeeTable = findProduct('minimalist-coffee-table');
  const bedQueen = findProduct('platform-bed-queen');
  const officeChair = findProduct('ergonomic-office-chair');
  const diningTable = findProduct('dining-table-extendable');
  const canvasArt = findProduct('abstract-canvas-print');
  const linens = findProduct('linen-duvet-cover');

  const existingOrder1 = await prisma.order.findFirst({
    where: { userId: userRegular.id, status: OrderStatus.DELIVERED },
  });
  if (!existingOrder1) {
    await prisma.order.create({
      data: {
        userId: userRegular.id,
        status: OrderStatus.DELIVERED,
        totalAmount: 1149.98,
        shippingAddress: '123 Test Street, Stockholm, Sweden',
        paymentMethod: PaymentMethod.CARD,
        createdAt: new Date('2026-01-15'),
        items: {
          create: [
            { productId: nordicSofa.id, quantity: 1, priceAtOrder: 899.99 },
            { productId: coffeeTable.id, quantity: 1, priceAtOrder: 249.99 },
          ],
        },
      },
    });
  }

  const existingOrder2 = await prisma.order.findFirst({
    where: { userId: userRegular.id, status: OrderStatus.SHIPPED },
  });
  if (!existingOrder2) {
    await prisma.order.create({
      data: {
        userId: userRegular.id,
        status: OrderStatus.SHIPPED,
        totalAmount: 699.98,
        shippingAddress: '123 Test Street, Stockholm, Sweden',
        paymentMethod: PaymentMethod.WALLET,
        createdAt: new Date('2026-03-20'),
        items: {
          create: [
            { productId: bedQueen.id, quantity: 1, priceAtOrder: 599.99 },
            { productId: linens.id, quantity: 1, priceAtOrder: 99.99 },
          ],
        },
      },
    });
  }

  const existingOrder3 = await prisma.order.findFirst({
    where: { userId: userRegular.id, status: OrderStatus.PENDING },
  });
  if (!existingOrder3) {
    await prisma.order.create({
      data: {
        userId: userRegular.id,
        status: OrderStatus.PENDING,
        totalAmount: 1038.97,
        shippingAddress: '123 Test Street, Stockholm, Sweden',
        paymentMethod: PaymentMethod.CARD,
        items: {
          create: [
            { productId: officeChair.id, quantity: 1, priceAtOrder: 399.99 },
            { productId: diningTable.id, quantity: 1, priceAtOrder: 549.99 },
            { productId: canvasArt.id, quantity: 1, priceAtOrder: 89.99 },
          ],
        },
      },
    });
  }

  // ─── Wishlist ─────────────────────────────────────────────────────────────

  const wishlistProducts = [nordicSofa, officeChair, bedQueen];
  for (const product of wishlistProducts) {
    await prisma.wishlist.upsert({
      where: {
        userId_productId: { userId: userRegular.id, productId: product.id },
      },
      update: {},
      create: { userId: userRegular.id, productId: product.id },
    });
  }

  // ─── Reviews ──────────────────────────────────────────────────────────────

  await prisma.review.upsert({
    where: { userId_productId: { userId: userRegular.id, productId: nordicSofa.id } },
    update: {},
    create: {
      userId: userRegular.id,
      productId: nordicSofa.id,
      rating: 5,
      comment:
        'Excellent quality and very comfortable. The fabric feels premium and the oak legs are solid.',
    },
  });

  await prisma.review.upsert({
    where: { userId_productId: { userId: userRegular.id, productId: coffeeTable.id } },
    update: {},
    create: {
      userId: userRegular.id,
      productId: coffeeTable.id,
      rating: 4,
      comment: 'Nice design and sturdy build. Took about 20 minutes to assemble.',
    },
  });

  await prisma.review.upsert({
    where: { userId_productId: { userId: userRegular.id, productId: officeChair.id } },
    update: {},
    create: {
      userId: userRegular.id,
      productId: officeChair.id,
      rating: 5,
      comment: 'My back pain is gone after switching to this chair. Worth every penny.',
    },
  });

  // ─── Promo Codes ──────────────────────────────────────────────────────────

  await prisma.promoCode.upsert({
    where: { code: 'SAVE10' },
    update: {},
    create: {
      code: 'SAVE10',
      discountPercent: 10,
      validFrom: new Date('2026-01-01'),
      validUntil: new Date('2027-12-31'),
      maxUses: 1000,
      currentUses: 42,
      isActive: true,
    },
  });

  await prisma.promoCode.upsert({
    where: { code: 'WELCOME20' },
    update: {},
    create: {
      code: 'WELCOME20',
      discountPercent: 20,
      validFrom: new Date('2026-01-01'),
      validUntil: new Date('2027-12-31'),
      maxUses: 500,
      currentUses: 0,
      isActive: true,
    },
  });

  await prisma.promoCode.upsert({
    where: { code: 'FLASH30' },
    update: {},
    create: {
      code: 'FLASH30',
      discountPercent: 30,
      validFrom: new Date('2026-01-01'),
      validUntil: new Date('2027-06-30'),
      minOrderAmount: 500,
      maxUses: 100,
      currentUses: 5,
      isActive: true,
    },
  });

  // ─── Transactions ─────────────────────────────────────────────────────────

  const existingTxRich = await prisma.transaction.findFirst({
    where: { userId: userRich.id, type: TransactionType.TOPUP },
  });
  if (!existingTxRich) {
    await prisma.transaction.create({
      data: {
        userId: userRich.id,
        amount: 999,
        type: TransactionType.TOPUP,
        description: 'Initial wallet top-up',
      },
    });
  }

  const existingTxRegular = await prisma.transaction.findFirst({
    where: { userId: userRegular.id, type: TransactionType.TOPUP },
  });
  if (!existingTxRegular) {
    await prisma.transaction.create({
      data: {
        userId: userRegular.id,
        amount: 50,
        type: TransactionType.TOPUP,
        description: 'Initial wallet top-up',
      },
    });
  }

  // ─── Addresses ────────────────────────────────────────────��────────────

  const existingAddresses = await prisma.address.count({ where: { userId: userRegular.id } });
  if (existingAddresses === 0) {
    await prisma.address.create({
      data: {
        userId: userRegular.id,
        name: 'Home',
        street: '123 Birch Avenue, Apt 4B',
        city: 'Stockholm',
        zip: '114 35',
        country: 'Sweden',
        isDefault: true,
      },
    });
    await prisma.address.create({
      data: {
        userId: userRegular.id,
        name: 'Office',
        street: '45 Kungsgatan, Floor 3',
        city: 'Stockholm',
        zip: '111 56',
        country: 'Sweden',
        isDefault: false,
      },
    });
  }

  // ─── Store Settings ──────────────────────────────────────────────────────

  const defaultSettings = [
    { key: 'storeName', value: 'PLANQ' },
    { key: 'currency', value: 'EUR' },
    { key: 'contactEmail', value: 'support@planq.com' },
    { key: 'maxCartItems', value: '20' },
    { key: 'freeShippingThreshold', value: '200' },
    { key: 'returnDays', value: '30' },
  ];

  for (const setting of defaultSettings) {
    await prisma.storeSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }

  // ─── Blog Articles ────────────────────────────────────────────────────────

  const blogArticles = [
    {
      title: 'Scandinavian Design Trends for 2026',
      slug: 'scandinavian-design-trends-2026',
      excerpt:
        'Explore the latest Scandinavian design trends that are shaping modern interiors this year.',
      content:
        '<h2>The Evolution of Nordic Minimalism</h2><p>Scandinavian design continues to evolve, blending functionality with warmth. This year, we see a shift toward organic shapes, earth tones, and sustainable materials that bring nature indoors.</p><h2>Key Trends</h2><ul><li><strong>Curved furniture:</strong> Soft, rounded edges replace sharp angles</li><li><strong>Natural textures:</strong> Bouclé, linen, and raw wood dominate</li><li><strong>Warm neutrals:</strong> Sand, terracotta, and warm grey replace cool whites</li><li><strong>Biophilic design:</strong> Indoor plants and natural light take center stage</li></ul><p>These trends reflect a broader movement toward creating homes that feel both modern and deeply comfortable.</p>',
      coverImage:
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=450&fit=crop',
      category: 'trends',
      authorName: 'Emma Lindqvist',
    },
    {
      title: 'Small-Space Furniture Guide: Maximize Every Square Meter',
      slug: 'small-space-furniture-guide',
      excerpt:
        'Smart furniture solutions for apartments and compact living spaces without sacrificing style.',
      content:
        '<h2>Living Large in Small Spaces</h2><p>Urban living often means working with limited square footage, but that does not mean compromising on style or comfort. The key is choosing furniture that works harder.</p><h2>Essential Strategies</h2><ul><li><strong>Multi-functional pieces:</strong> Sofa beds, extendable tables, and storage ottomans</li><li><strong>Vertical storage:</strong> Tall bookshelves and wall-mounted solutions</li><li><strong>Light colors:</strong> Pale tones create an illusion of space</li><li><strong>Transparent furniture:</strong> Glass and acrylic pieces reduce visual clutter</li></ul><p>With thoughtful selection, even the smallest apartment can feel spacious and inviting.</p>',
      coverImage:
        'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&h=450&fit=crop',
      category: 'guides',
      authorName: 'Marcus Berg',
    },
    {
      title: 'Color Palettes That Transform Your Living Room',
      slug: 'living-room-color-palettes',
      excerpt:
        'Discover how the right color combinations can completely change the mood of your living space.',
      content:
        '<h2>The Power of Color</h2><p>Color is one of the most powerful tools in interior design. The right palette can make a room feel larger, cozier, more energetic, or more serene.</p><h2>Our Favorite Palettes</h2><ul><li><strong>Warm Earth:</strong> Terracotta, sand, olive green, and cream</li><li><strong>Coastal Calm:</strong> Soft blue, white, driftwood grey, and sand</li><li><strong>Modern Luxe:</strong> Deep navy, gold accents, marble white, and charcoal</li><li><strong>Forest Retreat:</strong> Deep green, brown, cream, and moss</li></ul><p>Start with a neutral base and layer in accent colors through textiles, art, and accessories.</p>',
      coverImage:
        'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=800&h=450&fit=crop',
      category: 'inspiration',
      authorName: 'Sofia Andersson',
    },
    {
      title: 'Sustainable Materials: The Future of Furniture',
      slug: 'sustainable-materials-furniture',
      excerpt:
        'How eco-friendly materials are revolutionizing furniture manufacturing without compromising quality.',
      content:
        '<h2>Building a Greener Future</h2><p>The furniture industry is undergoing a sustainability revolution. Consumers increasingly demand products that are kind to the planet without sacrificing quality or aesthetics.</p><h2>Materials Leading the Change</h2><ul><li><strong>Bamboo:</strong> Fast-growing, durable, and beautiful</li><li><strong>Recycled metals:</strong> Aluminum and steel get a second life</li><li><strong>FSC-certified wood:</strong> Responsibly sourced timber</li><li><strong>Recycled plastics:</strong> Ocean plastics transformed into furniture</li><li><strong>Cork:</strong> Renewable, lightweight, and naturally antimicrobial</li></ul><p>At PLANQ, we are committed to increasing our range of sustainably sourced products every year.</p>',
      coverImage:
        'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=450&fit=crop',
      category: 'sustainability',
      authorName: 'Lars Eriksson',
    },
    {
      title: 'The Perfect Home Office Setup',
      slug: 'perfect-home-office-setup',
      excerpt:
        'Create a productive and comfortable workspace at home with the right furniture and layout.',
      content:
        '<h2>Work From Home, Done Right</h2><p>A well-designed home office can dramatically improve your productivity and well-being. The key is balancing ergonomics, aesthetics, and functionality.</p><h2>Essential Elements</h2><ul><li><strong>Ergonomic chair:</strong> Invest in proper lumbar support</li><li><strong>Standing desk:</strong> Alternate between sitting and standing</li><li><strong>Good lighting:</strong> Natural light supplemented by task lighting</li><li><strong>Cable management:</strong> Keep your workspace tidy and organized</li><li><strong>Personal touches:</strong> Plants, art, and photos boost mood</li></ul><p>Remember: your home office should inspire you, not feel like a corporate cubicle.</p>',
      coverImage:
        'https://images.unsplash.com/photo-1593642634315-48f5414c3ad9?w=800&h=450&fit=crop',
      category: 'guides',
      authorName: 'Anna Johansson',
    },
    {
      title: 'Bedroom Makeover Inspiration: From Dull to Dream',
      slug: 'bedroom-makeover-inspiration',
      excerpt:
        'Transform your bedroom into a serene retreat with these design ideas and furniture picks.',
      content:
        '<h2>Your Personal Sanctuary</h2><p>The bedroom should be your most peaceful room. A well-designed sleeping space promotes better rest and starts each day on the right note.</p><h2>Makeover Ideas</h2><ul><li><strong>Layer your bedding:</strong> Mix textures with linen, cotton, and knit throws</li><li><strong>Ambient lighting:</strong> Ditch the overhead light for bedside lamps and fairy lights</li><li><strong>Declutter:</strong> A clean room equals a calm mind</li><li><strong>Statement headboard:</strong> Make the bed the focal point</li><li><strong>Soft rugs:</strong> Warm your feet and add visual warmth</li></ul><p>Small changes can make a dramatic difference. Start with one element and build from there.</p>',
      coverImage:
        'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&h=450&fit=crop',
      category: 'inspiration',
      authorName: 'Emma Lindqvist',
    },
  ];

  for (const article of blogArticles) {
    await prisma.blogArticle.upsert({
      where: { slug: article.slug },
      update: {},
      create: article,
    });
  }

  // eslint-disable-next-line no-console
  console.log('Seed completed successfully');
  // eslint-disable-next-line no-console
  console.log(`  Users: 5 (4 verified + 1 unverified)`);
  // eslint-disable-next-line no-console
  console.log(`  Categories: ${categories.length}`);
  // eslint-disable-next-line no-console
  console.log(`  Products: ${products.length}`);
  // eslint-disable-next-line no-console
  console.log(`  Promo codes: 3`);
  // eslint-disable-next-line no-console
  console.log(`  Store settings: ${defaultSettings.length}`);
  // eslint-disable-next-line no-console
  console.log(`  Blog articles: ${blogArticles.length}`);
}

// Export for use in /api/test/reset endpoint
export default main;

// Run directly when executed as a script
if (process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js')) {
  main()
    .catch(e => {
      // eslint-disable-next-line no-console
      console.error('Seed failed:', e);
      process.exit(1);
    })
    .finally(() => {
      void prisma.$disconnect();
    });
}
