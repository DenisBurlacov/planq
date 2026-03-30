import 'dotenv/config';
import { PrismaClient, OrderStatus, PaymentMethod, TransactionType } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const SALT_ROUNDS = 10;

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

// Unsplash photo URLs — real furniture & home decor photos
const PHOTOS = {
  // Living Room
  sofa1: 'https://images.unsplash.com/photo-1555041469-b8035584d43b?w=600&h=400&fit=crop',
  sofa2: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=600&h=400&fit=crop',
  sofa3: 'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=600&h=400&fit=crop',
  coffeeTable1: 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=600&h=400&fit=crop',
  coffeeTable2: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=400&fit=crop',
  floorLamp1: 'https://images.unsplash.com/photo-1507149651823-06db76b17ee3?w=600&h=400&fit=crop',
  floorLamp2: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=600&h=400&fit=crop',
  bookshelf1: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop',
  rug1: 'https://images.unsplash.com/photo-1600166898405-ababb987f8e4?w=600&h=400&fit=crop',
  tvStand1: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&h=400&fit=crop',
  armchair1: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=400&fit=crop',
  // Bedroom
  bed1: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&h=400&fit=crop',
  bed2: 'https://images.unsplash.com/photo-1588046130851-a6b9b9cc1a3a?w=600&h=400&fit=crop',
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
    'https://images.unsplash.com/photo-1565538810643-a18eee985c5f?w=600&h=400&fit=crop',
  kitchenShelf1: 'https://images.unsplash.com/photo-1556909114-a5a5a6a7e6a6?w=600&h=400&fit=crop',
  barStool1: 'https://images.unsplash.com/photo-1581539250439-c96689b516dd?w=600&h=400&fit=crop',
  // Bathroom
  bathroomCabinet1:
    'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&h=400&fit=crop',
  towelRack1: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=600&h=400&fit=crop',
  laundryBasket1: 'https://images.unsplash.com/photo-1558997519-a3ebb7dc2ee4?w=600&h=400&fit=crop',
  showerShelf1: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&h=400&fit=crop',
  vanityStool1: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=600&h=400&fit=crop',
  // Office
  standingDesk1:
    'https://images.unsplash.com/photo-1593642634315-48f5414c3ad9?w=600&h=400&fit=crop',
  standingDesk2:
    'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&h=400&fit=crop',
  officeChair1: 'https://images.unsplash.com/photo-1589301760014-a3cbca7d7a83?w=600&h=400&fit=crop',
  officeChair2: 'https://images.unsplash.com/photo-1596079890744-c1a0462d0975?w=600&h=400&fit=crop',
  monitorStand1:
    'https://images.unsplash.com/photo-1593640495253-23196b27a87f?w=600&h=400&fit=crop',
  filingCabinet1:
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop',
  deskOrganizer1:
    'https://images.unsplash.com/photo-1593640495253-23196b27a87f?w=600&h=400&fit=crop',
  // Outdoor
  gardenSet1: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600&h=400&fit=crop',
  gardenSet2: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=400&fit=crop',
  bistroTable1: 'https://images.unsplash.com/photo-1521747116042-5a810fda9664?w=600&h=400&fit=crop',
  gardenBench1: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600&h=400&fit=crop',
  planterBox1: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=400&fit=crop',
  // Decor
  wallArt1: 'https://images.unsplash.com/photo-1513694203232-719a280e0f5e?w=600&h=400&fit=crop',
  wallArt2: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&h=400&fit=crop',
  wallArt3: 'https://images.unsplash.com/photo-1533158326339-7f3cf2404354?w=600&h=400&fit=crop',
  mirror1: 'https://images.unsplash.com/photo-1595407602892-1d19ff5a6a8d?w=600&h=400&fit=crop',
  mirror2: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&h=400&fit=crop',
  vase1: 'https://images.unsplash.com/photo-1567225477277-d59eedde9c5d?w=600&h=400&fit=crop',
  vase2: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=600&h=400&fit=crop',
  candle1: 'https://images.unsplash.com/photo-1603905763879-af28a9f3613e?w=600&h=400&fit=crop',
  clock1: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=600&h=400&fit=crop',
  // Textiles
  bedding1: 'https://images.unsplash.com/photo-1588614959060-4d144f28b207?w=600&h=400&fit=crop',
  bedding2: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&h=400&fit=crop',
  pillow1: 'https://images.unsplash.com/photo-1516455207474-71e00e0e95a6?w=600&h=400&fit=crop',
  pillow2: 'https://images.unsplash.com/photo-1555041469-b8035584d43b?w=600&h=400&fit=crop',
  throwBlanket1:
    'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600&h=400&fit=crop',
  curtain1: 'https://images.unsplash.com/photo-1497296690583-da0e2a4ce49a?w=600&h=400&fit=crop',
  tableRunner1: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=600&h=400&fit=crop',
  // Lighting
  pendantLight1:
    'https://images.unsplash.com/photo-1565814329452-e1f89acb5bb9?w=600&h=400&fit=crop',
  pendantLight2:
    'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=600&h=400&fit=crop',
  wallSconce1: 'https://images.unsplash.com/photo-1507149651823-06db76b17ee3?w=600&h=400&fit=crop',
  deskLamp1: 'https://images.unsplash.com/photo-1532456745301-b2c645d8b80d?w=600&h=400&fit=crop',
  tableLamp1: 'https://images.unsplash.com/photo-1522771739844-6a9a6b0c9571?w=600&h=400&fit=crop',
  ledStrip1: 'https://images.unsplash.com/photo-1565814329452-e1f89acb5bb9?w=600&h=400&fit=crop',
  // Storage
  coatRack1: 'https://images.unsplash.com/photo-1558997519-a3ebb7dc2ee4?w=600&h=400&fit=crop',
  storageBasket1: 'https://images.unsplash.com/photo-1558997519-a3ebb7dc2ee4?w=600&h=400&fit=crop',
  storageBasket2:
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=400&fit=crop',
  wallHook1: 'https://images.unsplash.com/photo-1556909114-a5a5a6a7e6a6?w=600&h=400&fit=crop',
  shoeRack1: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop',
  storageBox1: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&h=400&fit=crop',
};

async function main() {
  const passwordHash = await hashPassword('Test1234!');

  // ─── Users ───────────────────────────────────────────────────────────────

  const userRegular = await prisma.user.upsert({
    where: { email: 'user@planq.dev' },
    update: {},
    create: {
      email: 'user@planq.dev',
      password: passwordHash,
      name: 'Test User',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user',
      walletBalance: 50,
    },
  });

  const userNew = await prisma.user.upsert({
    where: { email: 'new@planq.dev' },
    update: {},
    create: {
      email: 'new@planq.dev',
      password: passwordHash,
      name: 'New User',
      walletBalance: 0,
    },
  });

  const userRich = await prisma.user.upsert({
    where: { email: 'rich@planq.dev' },
    update: {},
    create: {
      email: 'rich@planq.dev',
      password: passwordHash,
      name: 'Rich User',
      walletBalance: 999,
    },
  });

  await prisma.user.upsert({
    where: { email: 'blocked@planq.dev' },
    update: {},
    create: {
      email: 'blocked@planq.dev',
      password: passwordHash,
      name: 'Blocked User',
      isBlocked: true,
      walletBalance: 0,
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
    },
  ];

  const products = await Promise.all(
    productData.map(p =>
      prisma.product.upsert({
        where: { slug: p.slug },
        update: { images: p.images },
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
    where: { code: 'WELCOME10' },
    update: {},
    create: {
      code: 'WELCOME10',
      discountPercent: 10,
      validFrom: new Date('2026-01-01'),
      validUntil: new Date('2027-12-31'),
      maxUses: 1000,
      currentUses: 42,
      isActive: true,
    },
  });

  await prisma.promoCode.upsert({
    where: { code: 'EXPIRED20' },
    update: {},
    create: {
      code: 'EXPIRED20',
      discountPercent: 20,
      validFrom: new Date('2025-01-01'),
      validUntil: new Date('2025-12-31'),
      maxUses: 500,
      currentUses: 500,
      isActive: false,
    },
  });

  await prisma.promoCode.upsert({
    where: { code: 'BIG30' },
    update: {},
    create: {
      code: 'BIG30',
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

  // eslint-disable-next-line no-console
  console.log('Seed completed successfully');
  // eslint-disable-next-line no-console
  console.log(`  Users: 4`);
  // eslint-disable-next-line no-console
  console.log(`  Categories: ${categories.length}`);
  // eslint-disable-next-line no-console
  console.log(`  Products: ${products.length}`);
  // eslint-disable-next-line no-console
  console.log(`  Promo codes: 3`);
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
