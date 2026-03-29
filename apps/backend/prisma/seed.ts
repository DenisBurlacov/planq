import 'dotenv/config';
import { PrismaClient, OrderStatus, PaymentMethod, TransactionType } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const SALT_ROUNDS = 10;

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

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
    ].map(cat =>
      prisma.category.upsert({
        where: { slug: cat.slug },
        update: {},
        create: cat,
      })
    )
  );

  const [livingRoom, bedroom, kitchen, bathroom, office, outdoor] = categories;

  // ─── Products ────────────────────────────────────────────────────────────

  const productData = [
    // Living Room (6)
    {
      name: 'Nordic Sofa',
      slug: 'nordic-sofa',
      description:
        'Comfortable 3-seater sofa in Scandinavian style with solid oak legs and premium fabric upholstery.',
      price: 899.99,
      salePrice: 749.99,
      stock: 12,
      categoryId: livingRoom.id,
      images: [
        'https://loremflickr.com/600/400/sofa,living-room?lock=1',
        'https://loremflickr.com/600/400/sofa,interior?lock=2',
      ],
      rating: 4.5,
      reviewCount: 23,
    },
    {
      name: 'Minimalist Coffee Table',
      slug: 'minimalist-coffee-table',
      description:
        'Round coffee table with walnut top and black metal legs. Perfect centerpiece for any living room.',
      price: 249.99,
      stock: 30,
      categoryId: livingRoom.id,
      images: ['https://loremflickr.com/600/400/coffee-table,furniture?lock=3'],
      rating: 4.2,
      reviewCount: 15,
    },
    {
      name: 'Floor Lamp Arco',
      slug: 'floor-lamp-arco',
      description:
        'Modern arc floor lamp with adjustable head and marble base. Warm LED light included.',
      price: 189.99,
      stock: 45,
      categoryId: livingRoom.id,
      images: [
        'https://loremflickr.com/600/400/floor-lamp,interior?lock=4',
        'https://loremflickr.com/600/400/lamp,home?lock=5',
      ],
      rating: 4.8,
      reviewCount: 42,
    },
    {
      name: 'Bookshelf Tall Oak',
      slug: 'bookshelf-tall-oak',
      description:
        'Tall 5-tier bookshelf made from solid oak. Open design for books and decorative items.',
      price: 449.99,
      stock: 8,
      categoryId: livingRoom.id,
      images: ['https://loremflickr.com/600/400/bookshelf,shelf?lock=6'],
      rating: 4.0,
      reviewCount: 7,
    },
    {
      name: 'Wool Area Rug 200x300',
      slug: 'wool-area-rug',
      description: 'Hand-woven wool rug in neutral tones. Soft underfoot, durable construction.',
      price: 329.99,
      salePrice: 279.99,
      stock: 15,
      categoryId: livingRoom.id,
      images: ['https://loremflickr.com/600/400/rug,carpet?lock=7'],
      rating: 4.6,
      reviewCount: 19,
    },
    // Edge case: very long name
    {
      name: 'Premium Scandinavian Design Extra Large L-Shaped Sectional Sofa With Integrated Storage And Adjustable Headrests In Natural Linen',
      slug: 'premium-sectional-sofa-xl',
      description:
        'Ultimate comfort for large living spaces. L-shaped design with built-in storage compartments.',
      price: 2499.99,
      stock: 3,
      categoryId: livingRoom.id,
      images: [
        'https://loremflickr.com/600/400/sofa,sectional?lock=8',
        'https://loremflickr.com/600/400/sofa,modern?lock=9',
        'https://loremflickr.com/600/400/living-room,sofa?lock=10',
      ],
      rating: 5.0,
      reviewCount: 2,
    },

    // Bedroom (5)
    {
      name: 'Platform Bed Frame Queen',
      slug: 'platform-bed-queen',
      description:
        'Low-profile platform bed with solid wood slats. No box spring needed. Queen size.',
      price: 599.99,
      stock: 20,
      categoryId: bedroom.id,
      images: [
        'https://loremflickr.com/600/400/bed,bedroom?lock=11',
        'https://loremflickr.com/600/400/bedroom,furniture?lock=12',
      ],
      rating: 4.7,
      reviewCount: 31,
    },
    {
      name: 'Bedside Table Duo',
      slug: 'bedside-table-duo',
      description:
        'Set of two matching bedside tables with one drawer each. White lacquered finish.',
      price: 179.99,
      salePrice: 149.99,
      stock: 25,
      categoryId: bedroom.id,
      images: ['https://loremflickr.com/600/400/bedside-table,bedroom?lock=13'],
      rating: 4.3,
      reviewCount: 12,
    },
    {
      name: 'Wardrobe Sliding Doors',
      slug: 'wardrobe-sliding',
      description:
        'Spacious wardrobe with sliding mirror doors. Internal shelves and hanging rail included.',
      price: 799.99,
      stock: 6,
      categoryId: bedroom.id,
      images: [
        'https://loremflickr.com/600/400/wardrobe,closet?lock=14',
        'https://loremflickr.com/600/400/wardrobe,furniture?lock=15',
      ],
      rating: 4.1,
      reviewCount: 9,
    },
    {
      name: 'Dresser 6-Drawer',
      slug: 'dresser-6-drawer',
      description:
        'Classic dresser with six spacious drawers. Solid wood construction with soft-close mechanism.',
      price: 449.99,
      stock: 14,
      categoryId: bedroom.id,
      images: ['https://loremflickr.com/600/400/dresser,furniture?lock=16'],
      rating: 4.4,
      reviewCount: 18,
    },
    // Edge case: no images
    {
      name: 'Memory Foam Pillow Set',
      slug: 'memory-foam-pillow',
      description: 'Set of two ergonomic memory foam pillows. Hypoallergenic bamboo cover.',
      price: 69.99,
      stock: 100,
      categoryId: bedroom.id,
      images: [],
      rating: 3.8,
      reviewCount: 56,
    },

    // Kitchen (5)
    {
      name: 'Dining Table Extendable',
      slug: 'dining-table-extendable',
      description:
        'Extendable dining table for 4-8 people. Solid birch with white lacquered surface.',
      price: 549.99,
      stock: 10,
      categoryId: kitchen.id,
      images: [
        'https://loremflickr.com/600/400/dining-table,furniture?lock=17',
        'https://loremflickr.com/600/400/dining-room?lock=18',
      ],
      rating: 4.6,
      reviewCount: 27,
    },
    {
      name: 'Dining Chair Set of 4',
      slug: 'dining-chairs-set',
      description: 'Set of four stackable dining chairs. Molded seat with beech wood legs.',
      price: 299.99,
      salePrice: 249.99,
      stock: 18,
      categoryId: kitchen.id,
      images: ['https://loremflickr.com/600/400/dining-chair,chair?lock=19'],
      rating: 4.3,
      reviewCount: 34,
    },
    {
      name: 'Kitchen Island Cart',
      slug: 'kitchen-island-cart',
      description: 'Mobile kitchen island with butcher block top, shelves, and towel rack.',
      price: 379.99,
      stock: 7,
      categoryId: kitchen.id,
      images: ['https://loremflickr.com/600/400/kitchen,interior?lock=20'],
      rating: 4.5,
      reviewCount: 11,
    },
    {
      name: 'Wall Shelf Set Kitchen',
      slug: 'wall-shelf-kitchen',
      description:
        'Set of three floating shelves in different sizes. Perfect for spices and small items.',
      price: 59.99,
      stock: 50,
      categoryId: kitchen.id,
      images: ['https://loremflickr.com/600/400/shelf,kitchen?lock=21'],
      rating: 4.1,
      reviewCount: 22,
    },
    // Edge case: stock 0
    {
      name: 'Bar Stool Height-Adjustable',
      slug: 'bar-stool-adjustable',
      description:
        'Height-adjustable bar stool with chrome base and faux leather seat. Swivel function.',
      price: 129.99,
      stock: 0,
      categoryId: kitchen.id,
      images: ['https://loremflickr.com/600/400/bar-stool,stool?lock=22'],
      rating: 3.9,
      reviewCount: 8,
    },

    // Bathroom (5)
    {
      name: 'Bathroom Cabinet Mirror',
      slug: 'bathroom-cabinet-mirror',
      description: 'Wall-mounted bathroom cabinet with mirror door and two interior shelves.',
      price: 159.99,
      stock: 22,
      categoryId: bathroom.id,
      images: ['https://loremflickr.com/600/400/bathroom,cabinet?lock=23'],
      rating: 4.2,
      reviewCount: 16,
    },
    {
      name: 'Towel Rack Freestanding',
      slug: 'towel-rack-freestanding',
      description: 'Freestanding towel rack in bamboo with three bars. Water-resistant coating.',
      price: 49.99,
      stock: 40,
      categoryId: bathroom.id,
      images: ['https://loremflickr.com/600/400/bathroom,towel?lock=24'],
      rating: 4.0,
      reviewCount: 29,
    },
    {
      name: 'Laundry Basket Woven',
      slug: 'laundry-basket-woven',
      description: 'Handwoven seagrass laundry basket with cotton liner and handles.',
      price: 39.99,
      stock: 35,
      categoryId: bathroom.id,
      images: ['https://loremflickr.com/600/400/basket,wicker?lock=25'],
      rating: 4.4,
      reviewCount: 21,
    },
    {
      name: 'Shower Shelf Corner',
      slug: 'shower-shelf-corner',
      description: 'Rust-proof stainless steel corner shelf for shower. No-drill installation.',
      price: 24.99,
      stock: 60,
      categoryId: bathroom.id,
      images: ['https://loremflickr.com/600/400/bathroom,shower?lock=26'],
      rating: 4.7,
      reviewCount: 45,
    },
    {
      name: 'Vanity Stool Velvet',
      slug: 'vanity-stool-velvet',
      description: 'Upholstered vanity stool with velvet seat and gold-tone legs.',
      price: 89.99,
      salePrice: 69.99,
      stock: 16,
      categoryId: bathroom.id,
      images: ['https://loremflickr.com/600/400/vanity,stool?lock=27'],
      rating: 4.6,
      reviewCount: 13,
    },

    // Office (5)
    {
      name: 'Standing Desk Electric',
      slug: 'standing-desk-electric',
      description: 'Electric height-adjustable desk with memory presets. 140x70cm bamboo top.',
      price: 699.99,
      stock: 9,
      categoryId: office.id,
      images: [
        'https://loremflickr.com/600/400/standing-desk,desk?lock=28',
        'https://loremflickr.com/600/400/office-desk?lock=29',
      ],
      rating: 4.8,
      reviewCount: 38,
    },
    {
      name: 'Ergonomic Office Chair',
      slug: 'ergonomic-office-chair',
      description: 'Mesh back office chair with lumbar support, adjustable armrests, and headrest.',
      price: 499.99,
      salePrice: 399.99,
      stock: 15,
      categoryId: office.id,
      images: [
        'https://loremflickr.com/600/400/office-chair,ergonomic?lock=30',
        'https://loremflickr.com/600/400/chair,office?lock=31',
      ],
      rating: 4.9,
      reviewCount: 67,
    },
    {
      name: 'Monitor Stand Bamboo',
      slug: 'monitor-stand-bamboo',
      description:
        'Bamboo monitor riser with storage compartments underneath. Fits monitors up to 32 inches.',
      price: 44.99,
      stock: 55,
      categoryId: office.id,
      images: ['https://loremflickr.com/600/400/desk,computer?lock=32'],
      rating: 4.3,
      reviewCount: 24,
    },
    {
      name: 'Filing Cabinet 3-Drawer',
      slug: 'filing-cabinet-3',
      description: 'Metal filing cabinet with three lockable drawers. Fits under standard desks.',
      price: 149.99,
      stock: 20,
      categoryId: office.id,
      images: ['https://loremflickr.com/600/400/filing-cabinet,office?lock=33'],
      rating: 3.7,
      reviewCount: 5,
    },
    // Edge case: lowest rating
    {
      name: 'Desk Organizer Plastic',
      slug: 'desk-organizer-plastic',
      description: 'Basic desk organizer with compartments for pens, clips, and sticky notes.',
      price: 12.99,
      stock: 200,
      categoryId: office.id,
      images: ['https://loremflickr.com/600/400/desk,organizer?lock=34'],
      rating: 1.0,
      reviewCount: 3,
    },

    // Outdoor (4)
    {
      name: 'Garden Lounge Set',
      slug: 'garden-lounge-set',
      description: 'Outdoor lounge set with 2 chairs, sofa, and table. Weather-resistant rattan.',
      price: 1299.99,
      salePrice: 999.99,
      stock: 4,
      categoryId: outdoor.id,
      images: [
        'https://loremflickr.com/600/400/garden-furniture,outdoor?lock=35',
        'https://loremflickr.com/600/400/outdoor-furniture?lock=36',
      ],
      rating: 4.5,
      reviewCount: 14,
    },
    {
      name: 'Folding Bistro Table',
      slug: 'folding-bistro-table',
      description: 'Compact folding table for balcony or small patio. Powder-coated steel.',
      price: 79.99,
      stock: 30,
      categoryId: outdoor.id,
      images: ['https://loremflickr.com/600/400/table,outdoor?lock=37'],
      rating: 4.2,
      reviewCount: 20,
    },
    {
      name: 'Outdoor Bench Storage',
      slug: 'outdoor-bench-storage',
      description: 'Wooden garden bench with built-in storage under the seat. Seats 2-3 people.',
      price: 229.99,
      stock: 11,
      categoryId: outdoor.id,
      images: ['https://loremflickr.com/600/400/bench,garden?lock=38'],
      rating: 4.4,
      reviewCount: 9,
    },
    {
      name: 'Planter Box Large',
      slug: 'planter-box-large',
      description: 'Large wooden planter box for flowers or herbs. Drainage holes included.',
      price: 54.99,
      stock: 25,
      categoryId: outdoor.id,
      images: ['https://loremflickr.com/600/400/planter,garden?lock=39'],
      rating: 4.1,
      reviewCount: 17,
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

  // ─── Carts (empty for all users) ─────────────────────────────────────────

  for (const user of [userRegular, userNew, userRich]) {
    await prisma.cart.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id },
    });
  }

  // ─── Orders (3 for user@planq.dev) ───────────────────────────────────────

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

  // Order 1: DELIVERED (old)
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

  // Order 2: SHIPPED (in transit)
  const existingOrder2 = await prisma.order.findFirst({
    where: { userId: userRegular.id, status: OrderStatus.SHIPPED },
  });
  if (!existingOrder2) {
    await prisma.order.create({
      data: {
        userId: userRegular.id,
        status: OrderStatus.SHIPPED,
        totalAmount: 599.99,
        shippingAddress: '123 Test Street, Stockholm, Sweden',
        paymentMethod: PaymentMethod.WALLET,
        createdAt: new Date('2026-03-20'),
        items: {
          create: [{ productId: bedQueen.id, quantity: 1, priceAtOrder: 599.99 }],
        },
      },
    });
  }

  // Order 3: PENDING (fresh)
  const existingOrder3 = await prisma.order.findFirst({
    where: { userId: userRegular.id, status: OrderStatus.PENDING },
  });
  if (!existingOrder3) {
    await prisma.order.create({
      data: {
        userId: userRegular.id,
        status: OrderStatus.PENDING,
        totalAmount: 949.98,
        shippingAddress: '123 Test Street, Stockholm, Sweden',
        paymentMethod: PaymentMethod.CARD,
        items: {
          create: [
            { productId: officeChair.id, quantity: 1, priceAtOrder: 399.99 },
            { productId: diningTable.id, quantity: 1, priceAtOrder: 549.99 },
          ],
        },
      },
    });
  }

  // ─── Wishlist (3 products for user@planq.dev) ────────────────────────────

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

  // ─── Reviews ─────────────────────────────────────────────────────────────

  await prisma.review.upsert({
    where: {
      userId_productId: { userId: userRegular.id, productId: nordicSofa.id },
    },
    update: {},
    create: {
      userId: userRegular.id,
      productId: nordicSofa.id,
      rating: 5,
      comment: 'Excellent quality and very comfortable. The fabric feels premium.',
    },
  });

  await prisma.review.upsert({
    where: {
      userId_productId: { userId: userRegular.id, productId: coffeeTable.id },
    },
    update: {},
    create: {
      userId: userRegular.id,
      productId: coffeeTable.id,
      rating: 4,
      comment: 'Nice design but took a while to assemble.',
    },
  });

  // ─── Promo Codes ─────────────────────────────────────────────────────────

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

  // ─── Transactions ────────────────────────────────────────────────────────

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
