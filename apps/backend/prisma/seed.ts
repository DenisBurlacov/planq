import 'dotenv/config';
import { PrismaClient, OrderStatus, PaymentMethod, TransactionType, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const SALT_ROUNDS = 10;

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

// ── Local image helper ──────────────────────────────────────────────────────
// All images served from /images/* via express.static('public/images')
const img = {
  product: (slug: string) => `/images/products/${slug}.svg`,
  category: (slug: string) => `/images/categories/${slug}.svg`,
  hero: (name: string) => `/images/hero/${name}.svg`,
  blog: (slug: string) => `/images/blog/${slug}.svg`,
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

  const userAdmin = await prisma.user.upsert({
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
    where: { email: 'manager@planq.com' },
    update: { role: Role.MANAGER, emailVerified: true },
    create: {
      email: 'manager@planq.com',
      password: passwordHash,
      name: 'Manager',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=manager',
      walletBalance: 500,
      role: Role.MANAGER,
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
      {
        name: 'Living Room',
        nameRu: 'Гостиная',
        slug: 'living-room',
        image: img.category('living-room'),
      },
      { name: 'Bedroom', nameRu: 'Спальня', slug: 'bedroom', image: img.category('bedroom') },
      { name: 'Kitchen', nameRu: 'Кухня', slug: 'kitchen', image: img.category('kitchen') },
      { name: 'Bathroom', nameRu: 'Ванная', slug: 'bathroom', image: img.category('bathroom') },
      { name: 'Office', nameRu: 'Кабинет', slug: 'office', image: img.category('office') },
      { name: 'Outdoor', nameRu: 'Сад и терраса', slug: 'outdoor', image: img.category('outdoor') },
      { name: 'Decor', nameRu: 'Декор', slug: 'decor', image: img.category('decor') },
      { name: 'Textiles', nameRu: 'Текстиль', slug: 'textiles', image: img.category('textiles') },
      { name: 'Lighting', nameRu: 'Освещение', slug: 'lighting', image: img.category('lighting') },
      { name: 'Storage', nameRu: 'Хранение', slug: 'storage', image: img.category('storage') },
    ].map(cat =>
      prisma.category.upsert({
        where: { slug: cat.slug },
        update: { image: cat.image, nameRu: cat.nameRu },
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

  // ─── Products (100+) ────────────────────────────────────────────────────

  const productData = [
    // ── Living Room (13) ──────────────────────────────────────────────────
    {
      name: 'Nordic Sofa 3-Seater',
      nameRu: 'Скандинавский диван 3-местный',
      slug: 'nordic-sofa',
      description:
        'Comfortable 3-seater sofa in Scandinavian style with solid oak legs and premium linen upholstery. Available in light grey and sand.',
      descriptionRu:
        'Удобный 3-местный диван в скандинавском стиле с ножками из массива дуба и обивкой из премиального льна. Доступен в светло-сером и песочном.',
      price: 899.99,
      salePrice: 749.99,
      stock: 12,
      categoryId: livingRoom.id,
      images: [img.product('nordic-sofa')],
      rating: 4.5,
      reviewCount: 23,
      specs: {
        material: 'Premium linen upholstery, solid oak legs',
        dimensions: '210x90x85 cm',
        weight: '42 kg',
        color: 'Light Grey',
        style: 'Scandinavian',
        warranty: '5 years',
        careInstructions: 'Vacuum regularly, spot clean with mild detergent',
      },
    },
    {
      name: 'Minimalist Coffee Table',
      nameRu: 'Минималистичный журнальный столик',
      slug: 'minimalist-coffee-table',
      description:
        'Round coffee table with walnut veneer top and powder-coated black metal legs. 90cm diameter.',
      descriptionRu:
        'Круглый журнальный столик со столешницей из шпона ореха и металлическими ножками с порошковым покрытием. Диаметр 90 см.',
      price: 249.99,
      stock: 30,
      categoryId: livingRoom.id,
      images: [img.product('minimalist-coffee-table')],
      rating: 4.2,
      reviewCount: 15,
      specs: {
        material: 'Walnut veneer top, powder-coated steel legs',
        dimensions: '90x90x45 cm',
        weight: '12.5 kg',
        color: 'Walnut / Black',
        style: 'Minimalist',
        warranty: '2 years',
        careInstructions: 'Wipe with damp cloth, avoid abrasive cleaners',
      },
    },
    {
      name: 'Arc Floor Lamp',
      nameRu: 'Напольная лампа-дуга',
      slug: 'floor-lamp-arco',
      description:
        'Modern arc floor lamp with adjustable marble base and warm-white E27 LED bulb. Height 190cm.',
      descriptionRu:
        'Современная напольная лампа-дуга с мраморным основанием и тёплой белой LED-лампой E27. Высота 190 см.',
      price: 189.99,
      stock: 45,
      categoryId: livingRoom.id,
      images: [img.product('floor-lamp-arco')],
      rating: 4.8,
      reviewCount: 42,
      specs: {
        material: 'Marble base, brushed steel arm, fabric shade',
        dimensions: '40x40x190 cm',
        weight: '8.2 kg',
        color: 'White / Silver',
        style: 'Modern',
        warranty: '2 years',
        careInstructions: 'Dust with soft cloth, use E27 LED bulb max 12W',
      },
    },
    {
      name: 'Bookshelf Tall Oak',
      nameRu: 'Высокий стеллаж из дуба',
      slug: 'bookshelf-tall-oak',
      description:
        'Tall 5-tier open bookshelf in solid oak. Clean lines, no hardware visible. H: 180cm.',
      descriptionRu:
        'Высокий 5-ярусный открытый стеллаж из массива дуба. Чистые линии, скрытый крепёж. Высота 180 см.',
      price: 449.99,
      stock: 8,
      categoryId: livingRoom.id,
      images: [img.product('bookshelf-tall-oak')],
      rating: 4.0,
      reviewCount: 7,
      specs: {
        material: 'Solid oak',
        dimensions: '80x30x180 cm',
        weight: '28 kg',
        color: 'Natural Oak',
        style: 'Scandinavian',
        warranty: '3 years',
        careInstructions: 'Dust regularly, treat with wood oil every 6 months',
      },
    },
    {
      name: 'Wool Area Rug 200x300',
      nameRu: 'Шерстяной ковёр 200x300',
      slug: 'wool-area-rug',
      description:
        'Hand-tufted pure wool rug in warm ivory and terracotta. Thick pile, soft underfoot.',
      descriptionRu:
        'Тафтинговый ковёр из чистой шерсти в тёплых тонах слоновой кости и терракоты. Густой ворс, мягкий на ощупь.',
      price: 329.99,
      salePrice: 279.99,
      stock: 15,
      categoryId: livingRoom.id,
      images: [img.product('wool-area-rug')],
      rating: 4.6,
      reviewCount: 19,
      specs: {
        material: '100% pure wool, cotton backing',
        dimensions: '200x300 cm',
        weight: '9.5 kg',
        color: 'Ivory / Terracotta',
        style: 'Bohemian',
        warranty: '2 years',
        careInstructions: 'Professional cleaning recommended, vacuum on low power',
      },
    },
    {
      name: 'Boucle Armchair',
      nameRu: 'Кресло букле',
      slug: 'boucle-armchair',
      description:
        'Cozy boucle fabric armchair with solid beech wood legs. Perfect reading corner companion.',
      descriptionRu:
        'Уютное кресло из ткани букле с ножками из массива бука. Идеальный компаньон для уголка чтения.',
      price: 399.99,
      salePrice: 349.99,
      stock: 10,
      categoryId: livingRoom.id,
      images: [img.product('boucle-armchair')],
      rating: 4.7,
      reviewCount: 31,
      specs: {
        material: 'Boucle fabric, solid beech legs',
        dimensions: '75x80x82 cm',
        weight: '18 kg',
        color: 'Cream',
        style: 'Scandinavian',
        warranty: '3 years',
        careInstructions: 'Brush gently to maintain texture, spot clean only',
      },
    },
    {
      name: 'TV Stand with Storage',
      nameRu: 'ТВ-тумба с хранением',
      slug: 'tv-stand-storage',
      description:
        'Low-profile TV stand with two drawers and open shelf. Fits TVs up to 65 inches. W: 150cm.',
      descriptionRu:
        'Низкая ТВ-тумба с двумя ящиками и открытой полкой. Подходит для ТВ до 65 дюймов. Ширина 150 см.',
      price: 299.99,
      stock: 18,
      categoryId: livingRoom.id,
      images: [img.product('tv-stand-storage')],
      rating: 4.3,
      reviewCount: 14,
      specs: {
        material: 'MDF with oak veneer, steel handles',
        dimensions: '150x40x50 cm',
        weight: '24 kg',
        color: 'Natural Oak / Black',
        style: 'Scandinavian',
        warranty: '2 years',
        careInstructions: 'Wipe with slightly damp cloth, do not use polish',
      },
    },
    {
      name: 'Premium L-Shaped Sectional Sofa',
      nameRu: 'Премиальный угловой диван L-образный',
      slug: 'premium-sectional-sofa-xl',
      description:
        'Ultimate comfort for large living spaces. L-shaped design with built-in storage and motorised recline.',
      descriptionRu:
        'Максимальный комфорт для больших гостиных. L-образный дизайн со встроенным хранением и моторизованным наклоном.',
      price: 2499.99,
      stock: 3,
      categoryId: livingRoom.id,
      images: [img.product('premium-sectional-sofa-xl')],
      rating: 5.0,
      reviewCount: 2,
      specs: {
        material: 'Natural linen upholstery, solid oak frame, high-density foam',
        dimensions: '320x200x90 cm',
        weight: '85 kg',
        color: 'Natural Linen',
        style: 'Scandinavian',
        warranty: '7 years',
        careInstructions:
          'Professional cleaning recommended, vacuum weekly, rotate cushions monthly',
      },
    },
    // NEW premium
    {
      name: 'Designer Sofa Set 5-Piece',
      nameRu: 'Дизайнерский диванный гарнитур из 5 предметов',
      slug: 'designer-sofa-set',
      description:
        'Luxurious 5-piece modular sofa set in Italian leather. Includes 3-seater, 2-seater, armchair, ottoman, and chaise longue.',
      descriptionRu:
        'Роскошный модульный диванный гарнитур из 5 предметов в итальянской коже. 3-местный, 2-местный, кресло, пуф и шезлонг.',
      price: 2499.0,
      stock: 2,
      categoryId: livingRoom.id,
      images: [img.product('designer-sofa-set')],
      rating: 4.9,
      reviewCount: 4,
      specs: {
        material: 'Full-grain Italian leather, kiln-dried hardwood frame',
        dimensions: '380x280x85 cm (assembled)',
        weight: '120 kg',
        color: 'Cognac',
        style: 'Contemporary',
        warranty: '10 years',
        careInstructions: 'Condition leather every 3 months, avoid direct sunlight',
      },
    },
    {
      name: 'Leather Recliner Chair',
      nameRu: 'Кожаное кресло-реклайнер',
      slug: 'leather-recliner',
      description: 'Premium top-grain leather recliner with manual footrest and padded armrests.',
      descriptionRu:
        'Премиальное кресло-реклайнер из кожи высшего качества с ручной подставкой для ног и мягкими подлокотниками.',
      price: 699.99,
      stock: 7,
      categoryId: livingRoom.id,
      images: [img.product('leather-recliner')],
      rating: 4.4,
      reviewCount: 11,
      specs: {
        material: 'Top-grain leather, steel reclining mechanism',
        dimensions: '85x90x100 cm',
        weight: '32 kg',
        color: 'Dark Brown',
        warranty: '5 years',
        careInstructions: 'Condition leather twice yearly, keep away from heat sources',
      },
    },
    {
      name: 'Glass Side Table',
      nameRu: 'Стеклянный приставной столик',
      slug: 'glass-side-table',
      description:
        'Tempered glass top side table with brushed gold metal frame. Elegant and space-saving.',
      descriptionRu:
        'Приставной столик со столешницей из закалённого стекла и рамой из матового золотого металла. Элегантный и компактный.',
      price: 79.99,
      stock: 35,
      categoryId: livingRoom.id,
      images: [img.product('glass-side-table')],
      rating: 4.1,
      reviewCount: 9,
      specs: {
        material: 'Tempered glass, brushed gold steel',
        dimensions: '45x45x55 cm',
        weight: '5.5 kg',
        color: 'Glass / Gold',
        warranty: '1 year',
        careInstructions: 'Clean glass with glass cleaner, avoid placing heavy objects',
      },
    },
    {
      name: 'Console Table Marble Top',
      nameRu: 'Консольный стол с мраморной столешницей',
      slug: 'console-table-marble',
      description:
        'Slim console table with genuine marble top and black steel frame. Perfect for hallways.',
      descriptionRu:
        'Узкий консольный стол с натуральной мраморной столешницей и рамой из чёрной стали. Идеален для прихожих.',
      price: 349.99,
      stock: 10,
      categoryId: livingRoom.id,
      images: [img.product('console-table-marble')],
      rating: 4.6,
      reviewCount: 8,
      specs: {
        material: 'Natural marble top, powder-coated steel frame',
        dimensions: '120x35x80 cm',
        weight: '25 kg',
        color: 'White Marble / Black',
        warranty: '2 years',
        careInstructions: 'Seal marble annually, wipe spills immediately',
      },
    },
    {
      name: 'Knitted Pouf Ottoman',
      nameRu: 'Вязаный пуф-оттоманка',
      slug: 'pouf-ottoman',
      description:
        'Hand-knitted cotton pouf filled with polystyrene beads. Extra seating or footrest.',
      descriptionRu:
        'Вязаный вручную хлопковый пуф с наполнителем из полистироловых шариков. Дополнительное сиденье или подставка для ног.',
      price: 59.99,
      stock: 40,
      categoryId: livingRoom.id,
      images: [img.product('pouf-ottoman')],
      rating: 4.3,
      reviewCount: 17,
      specs: {
        material: '100% cotton cover, polystyrene bead fill',
        dimensions: '50x50x35 cm',
        weight: '3 kg',
        color: 'Natural White',
        warranty: '1 year',
        careInstructions: 'Spot clean cover, reshape by hand after sitting',
      },
    },

    // ── Bedroom (10) ──────────────────────────────────────────────────────
    {
      name: 'Platform Bed Frame Queen',
      nameRu: 'Платформенная кровать Queen',
      slug: 'platform-bed-queen',
      description:
        'Low-profile platform bed with slatted solid wood base. No box spring needed. 160x200cm.',
      descriptionRu:
        'Низкая платформенная кровать с реечным основанием из массива дерева. Без пружинного блока. 160x200 см.',
      price: 599.99,
      stock: 20,
      categoryId: bedroom.id,
      images: [img.product('platform-bed-queen')],
      rating: 4.7,
      reviewCount: 31,
      specs: {
        material: 'Solid pine wood with walnut stain',
        dimensions: '160x200x30 cm',
        weight: '35 kg',
        color: 'Walnut',
        style: 'Minimalist',
        warranty: '5 years',
        careInstructions: 'Tighten bolts every 6 months, wipe with dry cloth',
      },
    },
    {
      name: 'Bedside Table Set of 2',
      nameRu: 'Прикроватные тумбочки, 2 шт.',
      slug: 'bedside-table-duo',
      description:
        'Pair of matching bedside tables with one drawer and open shelf. White lacquered MDF.',
      descriptionRu:
        'Пара одинаковых прикроватных тумбочек с ящиком и открытой полкой. Белая лакированная МДФ.',
      price: 179.99,
      salePrice: 149.99,
      stock: 25,
      categoryId: bedroom.id,
      images: [img.product('bedside-table-duo')],
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
      nameRu: 'Шкаф с раздвижными дверями',
      slug: 'wardrobe-sliding',
      description:
        'Spacious wardrobe with two sliding mirror doors, internal shelves and hanging rail. W: 200cm.',
      descriptionRu:
        'Просторный шкаф с двумя зеркальными раздвижными дверями, полками и штангой для одежды. Ширина 200 см.',
      price: 799.99,
      stock: 6,
      categoryId: bedroom.id,
      images: [img.product('wardrobe-sliding')],
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
      nameRu: 'Комод с 6 ящиками',
      slug: 'dresser-6-drawer',
      description: 'Solid oak dresser with six deep drawers and soft-close mechanism. W: 120cm.',
      descriptionRu:
        'Комод из массива дуба с шестью глубокими ящиками и механизмом мягкого закрывания. Ширина 120 см.',
      price: 449.99,
      stock: 14,
      categoryId: bedroom.id,
      images: [img.product('dresser-6-drawer')],
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
      nameRu: 'Мягкое изголовье King',
      slug: 'upholstered-headboard-king',
      description:
        'Velvet upholstered headboard for king-size bed. Button-tufted design. W: 180cm.',
      descriptionRu:
        'Мягкое бархатное изголовье для кровати king-size. Стёганый дизайн с каретной стяжкой. Ширина 180 см.',
      price: 219.99,
      salePrice: 179.99,
      stock: 22,
      categoryId: bedroom.id,
      images: [img.product('upholstered-headboard-king')],
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
    {
      name: 'Memory Foam Pillow Set',
      nameRu: 'Набор подушек с эффектом памяти',
      slug: 'memory-foam-pillow',
      description:
        'Set of two ergonomic memory foam pillows with bamboo-derived covers. Hypoallergenic.',
      descriptionRu:
        'Набор из двух эргономичных подушек с эффектом памяти и чехлами из бамбукового волокна. Гипоаллергенные.',
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
        careInstructions: 'Machine wash covers at 40C, do not wash foam core',
      },
    },
    // NEW premium
    {
      name: 'King Size Solid Oak Bed Frame',
      nameRu: 'Кровать King Size из массива дуба',
      slug: 'king-bed-frame-oak',
      description:
        'Handcrafted king-size bed frame in solid European oak with slatted base. Timeless design that lasts generations.',
      descriptionRu:
        'Кровать king-size ручной работы из массива европейского дуба с реечным основанием. Вневременной дизайн на поколения.',
      price: 1599.0,
      stock: 4,
      categoryId: bedroom.id,
      images: [img.product('king-bed-frame-oak')],
      rating: 4.8,
      reviewCount: 6,
      specs: {
        material: 'Solid European oak, steel center support',
        dimensions: '200x220x40 cm',
        weight: '68 kg',
        color: 'Natural Oak',
        warranty: '10 years',
        careInstructions: 'Oil with Danish oil every 12 months, check slats periodically',
      },
    },
    {
      name: 'Walk-in Closet System',
      nameRu: 'Система гардеробной',
      slug: 'walk-in-closet-system',
      description:
        'Modular walk-in closet system with adjustable shelves, drawers, hanging rails, and shoe racks. Fits rooms up to 10m2.',
      descriptionRu:
        'Модульная система гардеробной с регулируемыми полками, ящиками, штангами и обувницами. Для комнат до 10 м2.',
      price: 2799.0,
      stock: 2,
      categoryId: bedroom.id,
      images: [img.product('walk-in-closet-system')],
      rating: 4.7,
      reviewCount: 3,
      specs: {
        material: 'Melamine-coated particleboard, aluminium rails, soft-close drawers',
        dimensions: 'Modular (fits up to 400x250x60 cm)',
        weight: '180 kg',
        color: 'White / Oak',
        warranty: '10 years',
        careInstructions: 'Wipe with damp cloth, lubricate drawer slides annually',
      },
    },
    {
      name: 'Vanity Desk with Mirror',
      nameRu: 'Туалетный столик с зеркалом',
      slug: 'vanity-desk-bedroom',
      description:
        'Elegant vanity desk with tilting mirror, two drawers, and padded stool. White lacquered finish.',
      descriptionRu:
        'Элегантный туалетный столик с наклонным зеркалом, двумя ящиками и мягким пуфом. Белая лакированная отделка.',
      price: 289.99,
      stock: 12,
      categoryId: bedroom.id,
      images: [img.product('vanity-desk-bedroom')],
      rating: 4.5,
      reviewCount: 15,
      specs: {
        material: 'MDF with lacquer finish, mirror glass, velvet stool',
        dimensions: '100x45x140 cm (with mirror)',
        weight: '22 kg',
        color: 'White',
        warranty: '2 years',
        careInstructions: 'Clean mirror with glass cleaner, wipe desk with soft cloth',
      },
    },
    {
      name: 'Upholstered Bedroom Bench',
      nameRu: 'Мягкая скамья для спальни',
      slug: 'bedroom-bench',
      description:
        'Tufted velvet bench for the foot of the bed. Storage compartment underneath. W: 120cm.',
      descriptionRu:
        'Стёганая бархатная скамья у изножья кровати. Отделение для хранения внизу. Ширина 120 см.',
      price: 199.99,
      stock: 16,
      categoryId: bedroom.id,
      images: [img.product('bedroom-bench')],
      rating: 4.4,
      reviewCount: 10,
      specs: {
        material: 'Velvet upholstery, plywood frame, foam padding',
        dimensions: '120x40x48 cm',
        weight: '12 kg',
        color: 'Emerald Green',
        warranty: '2 years',
        careInstructions: 'Vacuum velvet regularly, spot clean only',
      },
    },

    // ── Kitchen / Dining (10) ─────────────────────────────────────────────
    {
      name: 'Extendable Dining Table',
      nameRu: 'Раскладной обеденный стол',
      slug: 'dining-table-extendable',
      description:
        'Solid birch dining table that extends from 120cm to 200cm. Seats 4-8. White lacquered.',
      descriptionRu:
        'Обеденный стол из массива берёзы, раздвигается с 120 до 200 см. На 4-8 персон. Белая лакировка.',
      price: 549.99,
      stock: 10,
      categoryId: kitchen.id,
      images: [img.product('dining-table-extendable')],
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
      nameRu: 'Набор обеденных стульев, 4 шт.',
      slug: 'dining-chairs-set',
      description:
        'Set of four stackable chairs with moulded plastic seat and solid beech legs. Various colours.',
      descriptionRu:
        'Набор из четырёх штабелируемых стульев с формованным пластиковым сиденьем и ножками из массива бука.',
      price: 299.99,
      salePrice: 249.99,
      stock: 18,
      categoryId: kitchen.id,
      images: [img.product('dining-chairs-set')],
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
      nameRu: 'Кухонный островок на колёсах',
      slug: 'kitchen-island-cart',
      description:
        'Mobile kitchen island on lockable wheels with butcher block top and two open shelves.',
      descriptionRu:
        'Мобильный кухонный островок на фиксируемых колёсах с разделочной столешницей и двумя открытыми полками.',
      price: 379.99,
      stock: 7,
      categoryId: kitchen.id,
      images: [img.product('kitchen-island-cart')],
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
      nameRu: 'Настенные полки, 3 шт.',
      slug: 'wall-shelf-kitchen',
      description:
        'Set of three oak veneer floating shelves in S/M/L sizes. Easy wall mount. Max load 15kg each.',
      descriptionRu:
        'Набор из трёх подвесных полок из шпона дуба размеров S/M/L. Простое крепление. Нагрузка до 15 кг.',
      price: 59.99,
      stock: 50,
      categoryId: kitchen.id,
      images: [img.product('wall-shelf-kitchen')],
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
    {
      name: 'Height-Adjustable Bar Stool',
      nameRu: 'Барный стул с регулировкой высоты',
      slug: 'bar-stool-adjustable',
      description:
        'Bar stool with chrome base, 360 swivel and faux leather seat. Adjustable height 60-80cm.',
      descriptionRu:
        'Барный стул с хромированным основанием, поворотом на 360 и сиденьем из экокожи. Высота 60-80 см.',
      price: 129.99,
      stock: 0,
      categoryId: kitchen.id,
      images: [img.product('bar-stool-adjustable')],
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
      nameRu: 'Мраморная вращающаяся подставка 40 см',
      slug: 'marble-lazy-susan',
      description:
        'Elegant white marble rotating serving board. Perfect for dining table centerpiece or cheese board.',
      descriptionRu:
        'Элегантная вращающаяся подставка из белого мрамора. Идеальна как украшение стола или сырная доска.',
      price: 44.99,
      stock: 35,
      categoryId: kitchen.id,
      images: [img.product('marble-lazy-susan')],
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
    // NEW premium
    {
      name: 'Solid Oak Dining Table 8-Seater',
      nameRu: 'Обеденный стол из массива дуба на 8 персон',
      slug: 'solid-oak-dining-table',
      description:
        'Handcrafted dining table in solid European oak with live edge detail. Seats up to 8. A statement piece for any dining room.',
      descriptionRu:
        'Обеденный стол ручной работы из массива европейского дуба с натуральным краем. До 8 персон. Центральный элемент любой столовой.',
      price: 1899.0,
      stock: 3,
      categoryId: kitchen.id,
      images: [img.product('solid-oak-dining-table')],
      rating: 4.9,
      reviewCount: 5,
      specs: {
        material: 'Solid European oak, matte lacquer finish',
        dimensions: '240x100x76 cm',
        weight: '72 kg',
        color: 'Natural Oak',
        warranty: '10 years',
        careInstructions: 'Oil every 6 months, use trivets for hot dishes',
      },
    },
    {
      name: 'Custom Kitchen Island with Sink',
      nameRu: 'Индивидуальный кухонный остров с мойкой',
      slug: 'custom-kitchen-island',
      description:
        'Premium kitchen island with integrated stainless steel sink, granite top, and wine rack. Professional-grade construction.',
      descriptionRu:
        'Премиальный кухонный остров со встроенной мойкой из нержавеющей стали, гранитной столешницей и винной полкой.',
      price: 3299.0,
      stock: 1,
      categoryId: kitchen.id,
      images: [img.product('custom-kitchen-island')],
      rating: 5.0,
      reviewCount: 2,
      specs: {
        material: 'Granite top, hardwood body, stainless steel sink',
        dimensions: '180x90x92 cm',
        weight: '150 kg',
        color: 'Black Granite / White',
        warranty: '15 years',
        careInstructions: 'Seal granite annually, clean sink with stainless steel cleaner',
      },
    },
    {
      name: 'Wall-Mounted Wine Rack',
      nameRu: 'Настенная полка для вина',
      slug: 'wine-rack-wall',
      description:
        'Metal wall-mounted wine rack holding 12 bottles. Industrial design with cork display strip.',
      descriptionRu:
        'Металлическая настенная полка для 12 бутылок вина. Индустриальный дизайн с полоской для пробок.',
      price: 69.99,
      stock: 28,
      categoryId: kitchen.id,
      images: [img.product('wine-rack-wall')],
      rating: 4.2,
      reviewCount: 14,
      specs: {
        material: 'Powder-coated steel, cork strip',
        dimensions: '60x15x45 cm',
        weight: '3.5 kg',
        color: 'Matte Black',
        warranty: '2 years',
        careInstructions: 'Wipe with dry cloth, max load 12 standard bottles',
      },
    },
    {
      name: 'Bamboo Spice Rack Organizer',
      nameRu: 'Бамбуковая подставка для специй',
      slug: 'spice-rack-bamboo',
      description:
        'Tiered bamboo spice rack organizer for kitchen counter or cabinet. Holds 20+ jars.',
      descriptionRu:
        'Ярусная подставка для специй из бамбука для столешницы или шкафа. Вмещает 20+ баночек.',
      price: 29.99,
      stock: 55,
      categoryId: kitchen.id,
      images: [img.product('spice-rack-bamboo')],
      rating: 4.4,
      reviewCount: 31,
      specs: {
        material: 'Solid bamboo',
        dimensions: '40x20x20 cm',
        weight: '1.2 kg',
        color: 'Natural Bamboo',
        warranty: '1 year',
        careInstructions: 'Wipe with damp cloth, keep dry',
      },
    },

    // ── Bathroom (7) ─────────────────────────────────────────────────────
    {
      name: 'Bathroom Mirror Cabinet',
      nameRu: 'Зеркальный шкафчик для ванной',
      slug: 'bathroom-cabinet-mirror',
      description:
        'Wall-mounted cabinet with integrated mirror door and two interior glass shelves. W: 60cm.',
      descriptionRu:
        'Навесной шкафчик со встроенной зеркальной дверцей и двумя стеклянными полками внутри. Ширина 60 см.',
      price: 159.99,
      stock: 22,
      categoryId: bathroom.id,
      images: [img.product('bathroom-cabinet-mirror')],
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
      nameRu: 'Бамбуковая вешалка для полотенец',
      slug: 'towel-rack-freestanding',
      description:
        'Freestanding bamboo towel rack with three bars. Water-resistant lacquer finish. H: 160cm.',
      descriptionRu:
        'Напольная бамбуковая вешалка для полотенец с тремя перекладинами. Влагостойкая лакировка. Высота 160 см.',
      price: 49.99,
      stock: 40,
      categoryId: bathroom.id,
      images: [img.product('towel-rack-freestanding')],
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
      nameRu: 'Корзина для белья из морской травы',
      slug: 'laundry-basket-woven',
      description:
        'Handwoven seagrass laundry basket with removable cotton liner and leather handles. 50L.',
      descriptionRu:
        'Плетёная корзина для белья из морской травы со съёмным хлопковым вкладышем и кожаными ручками. 50 л.',
      price: 39.99,
      stock: 35,
      categoryId: bathroom.id,
      images: [img.product('laundry-basket-woven')],
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
      nameRu: 'Угловая полка для душа',
      slug: 'shower-shelf-corner',
      description:
        'Rust-proof brushed stainless steel corner shower caddy. No-drill adhesive mounting. 2-tier.',
      descriptionRu:
        'Нержавеющая угловая полка для душа с матовой отделкой. Крепление на клей без сверления. 2 яруса.',
      price: 24.99,
      stock: 60,
      categoryId: bathroom.id,
      images: [img.product('shower-shelf-corner')],
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
      nameRu: 'Бархатный стул для туалетного столика',
      slug: 'vanity-stool-velvet',
      description:
        'Round vanity stool with dusty pink velvet seat and gold-finish tapered legs. H: 50cm.',
      descriptionRu:
        'Круглый стул с пыльно-розовым бархатным сиденьем и ножками с золотой отделкой. Высота 50 см.',
      price: 89.99,
      salePrice: 69.99,
      stock: 16,
      categoryId: bathroom.id,
      images: [img.product('vanity-stool-velvet')],
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
    {
      name: 'Bathroom Ladder Shelf',
      nameRu: 'Полка-лестница для ванной',
      slug: 'bathroom-shelf-ladder',
      description:
        'Leaning ladder shelf in matte white bamboo with 4 tiers. Perfect for towels and toiletries.',
      descriptionRu:
        'Полка-лестница из белого бамбука с 4 ярусами. Идеальна для полотенец и косметики.',
      price: 79.99,
      stock: 20,
      categoryId: bathroom.id,
      images: [img.product('bathroom-shelf-ladder')],
      rating: 4.3,
      reviewCount: 18,
      specs: {
        material: 'Bamboo with matte white finish',
        dimensions: '50x35x150 cm',
        weight: '4 kg',
        color: 'Matte White',
        warranty: '2 years',
        careInstructions: 'Wipe dry after splashes, keep base on non-slip surface',
      },
    },
    {
      name: 'Ceramic Soap Dispenser Set',
      nameRu: 'Набор керамических дозаторов для мыла',
      slug: 'soap-dispenser-set',
      description:
        'Matching set of soap dispenser, toothbrush holder, and soap dish in matte ceramic.',
      descriptionRu:
        'Набор из дозатора для мыла, стакана для зубных щёток и мыльницы из матовой керамики.',
      price: 34.99,
      stock: 45,
      categoryId: bathroom.id,
      images: [img.product('soap-dispenser-set')],
      rating: 4.5,
      reviewCount: 22,
      specs: {
        material: 'Matte ceramic with bamboo accents',
        dimensions: 'Various (dispenser: 8x8x18 cm)',
        weight: '1.5 kg (set)',
        color: 'White / Bamboo',
        warranty: '1 year',
        careInstructions: 'Hand wash, avoid dropping on hard surfaces',
      },
    },

    // ── Office (8) ───────────────────────────────────────────────────────
    {
      name: 'Electric Standing Desk',
      nameRu: 'Электрический стол для работы стоя',
      slug: 'standing-desk-electric',
      description:
        'Electric sit-stand desk with memory presets, cable management, and bamboo surface. 140x70cm.',
      descriptionRu:
        'Электрический стол с памятью положений, кабель-менеджментом и бамбуковой столешницей. 140x70 см.',
      price: 699.99,
      stock: 9,
      categoryId: office.id,
      images: [img.product('standing-desk-electric')],
      rating: 4.8,
      reviewCount: 38,
      specs: {
        material: 'Bamboo surface, powder-coated steel frame',
        dimensions: '140x70x65-130 cm',
        weight: '32 kg',
        color: 'Natural Bamboo / Black',
        style: 'Modern',
        warranty: '5 years',
        careInstructions: 'Wipe bamboo surface with damp cloth, lubricate motor yearly',
      },
    },
    {
      name: 'Ergonomic Mesh Office Chair',
      nameRu: 'Эргономичное сетчатое офисное кресло',
      slug: 'ergonomic-office-chair',
      description:
        'Fully adjustable mesh chair with lumbar support, adjustable armrests, headrest, and tilt lock.',
      descriptionRu:
        'Полностью регулируемое сетчатое кресло с поясничной поддержкой, настраиваемыми подлокотниками, подголовником и фиксацией наклона.',
      price: 499.99,
      salePrice: 399.99,
      stock: 15,
      categoryId: office.id,
      images: [img.product('ergonomic-office-chair')],
      rating: 4.9,
      reviewCount: 67,
      specs: {
        material: 'Breathable mesh back, foam seat, nylon base',
        dimensions: '68x68x110-125 cm',
        weight: '14 kg',
        color: 'Black',
        style: 'Modern',
        warranty: '5 years',
        careInstructions: 'Vacuum mesh periodically, tighten screws every 3 months',
      },
    },
    {
      name: 'Bamboo Monitor Riser',
      nameRu: 'Бамбуковая подставка под монитор',
      slug: 'monitor-stand-bamboo',
      description:
        'Solid bamboo monitor stand with integrated USB hub and storage compartment underneath.',
      descriptionRu:
        'Подставка под монитор из массива бамбука со встроенным USB-хабом и отсеком для хранения.',
      price: 44.99,
      stock: 55,
      categoryId: office.id,
      images: [img.product('monitor-stand-bamboo')],
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
      nameRu: 'Картотека с 3 ящиками',
      slug: 'filing-cabinet-3',
      description:
        'Steel filing cabinet with three lockable drawers and anti-tilt mechanism. Fits A4 and foolscap.',
      descriptionRu:
        'Стальная картотека с тремя запираемыми ящиками и механизмом предотвращения опрокидывания. Для формата A4.',
      price: 149.99,
      stock: 20,
      categoryId: office.id,
      images: [img.product('filing-cabinet-3')],
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
      nameRu: 'Акустическая офисная перегородка',
      slug: 'acoustic-office-divider',
      description:
        'Freestanding acoustic desk divider to reduce noise and provide privacy. W: 120cm.',
      descriptionRu:
        'Напольная акустическая перегородка для снижения шума и обеспечения приватности. Ширина 120 см.',
      price: 89.99,
      stock: 30,
      categoryId: office.id,
      images: [img.product('acoustic-office-divider')],
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
    {
      name: 'Basic Desk Organizer',
      nameRu: 'Базовый настольный органайзер',
      slug: 'desk-organizer-plastic',
      description:
        'Simple plastic desk organizer with compartments for pens, scissors, and sticky notes.',
      descriptionRu:
        'Простой пластиковый настольный органайзер с отделениями для ручек, ножниц и стикеров.',
      price: 12.99,
      stock: 200,
      categoryId: office.id,
      images: [img.product('desk-organizer-plastic')],
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
    {
      name: 'Executive Walnut Desk',
      nameRu: 'Представительский стол из ореха',
      slug: 'executive-desk-walnut',
      description:
        'Large executive desk in solid walnut with three drawers, cable tray, and leather writing pad.',
      descriptionRu:
        'Большой представительский стол из массива ореха с тремя ящиками, лотком для кабелей и кожаным бюваром.',
      price: 1249.0,
      stock: 5,
      categoryId: office.id,
      images: [img.product('executive-desk-walnut')],
      rating: 4.7,
      reviewCount: 7,
      specs: {
        material: 'Solid walnut, soft-close drawer mechanisms, leather pad',
        dimensions: '160x80x76 cm',
        weight: '55 kg',
        color: 'Walnut',
        warranty: '5 years',
        careInstructions: 'Oil surface every 6 months, condition leather pad annually',
      },
    },
    {
      name: 'Office Bookcase 5-Shelf',
      nameRu: 'Офисный стеллаж с 5 полками',
      slug: 'bookcase-office',
      description: 'Open 5-shelf bookcase in industrial style with steel frame and MDF shelves.',
      descriptionRu:
        'Открытый 5-полочный стеллаж в индустриальном стиле со стальным каркасом и полками из МДФ.',
      price: 199.99,
      stock: 15,
      categoryId: office.id,
      images: [img.product('bookcase-office')],
      rating: 4.1,
      reviewCount: 12,
      specs: {
        material: 'Powder-coated steel frame, MDF shelves',
        dimensions: '80x35x180 cm',
        weight: '22 kg',
        color: 'Black / Natural',
        style: 'Industrial',
        warranty: '3 years',
        careInstructions: 'Dust shelves regularly, anchor to wall for safety',
      },
    },

    // ── Outdoor (7) ──────────────────────────────────────────────────────
    {
      name: 'Garden Lounge Set 4-Piece',
      nameRu: 'Садовый комплект для отдыха, 4 предмета',
      slug: 'garden-lounge-set',
      description:
        'Outdoor rattan lounge set: 2 armchairs, sofa, and glass-top table. All-weather wicker.',
      descriptionRu:
        'Садовый комплект из ротанга: 2 кресла, диван и столик со стеклянной столешницей. Всепогодный.',
      price: 1299.99,
      salePrice: 999.99,
      stock: 4,
      categoryId: outdoor.id,
      images: [img.product('garden-lounge-set')],
      rating: 4.5,
      reviewCount: 14,
      specs: {
        material: 'PE rattan wicker, aluminium frame, tempered glass',
        dimensions: '220x180x75 cm (set)',
        weight: '48 kg',
        color: 'Brown / Beige cushions',
        warranty: '3 years',
        careInstructions: 'Cover in winter, wash cushion covers at 30C',
      },
    },
    {
      name: 'Folding Bistro Table',
      nameRu: 'Складной столик-бистро',
      slug: 'folding-bistro-table',
      description:
        'Compact folding steel bistro table for balcony or patio. Powder-coated, rust-resistant.',
      descriptionRu:
        'Компактный складной стальной столик для балкона или террасы. Порошковое покрытие, устойчив к ржавчине.',
      price: 79.99,
      stock: 30,
      categoryId: outdoor.id,
      images: [img.product('folding-bistro-table')],
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
      nameRu: 'Садовая скамья с хранением',
      slug: 'outdoor-bench-storage',
      description:
        'Teak garden bench with weatherproof storage compartment under the seat. Seats 2-3.',
      descriptionRu:
        'Садовая скамья из тика с водонепроницаемым отделением для хранения под сиденьем. На 2-3 человека.',
      price: 229.99,
      stock: 11,
      categoryId: outdoor.id,
      images: [img.product('outdoor-bench-storage')],
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
      nameRu: 'Большой ящик-кашпо',
      slug: 'planter-box-large',
      description:
        'Powder-coated steel planter box for indoor or outdoor use. Drainage holes and tray included.',
      descriptionRu:
        'Стальной ящик-кашпо с порошковым покрытием для дома или сада. Дренажные отверстия и поддон в комплекте.',
      price: 54.99,
      stock: 25,
      categoryId: outdoor.id,
      images: [img.product('planter-box-large')],
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
      nameRu: 'Гамак со стойкой',
      slug: 'hammock-with-stand',
      description:
        'Cotton rope hammock with sturdy steel stand. Easy assembly, no trees required. Max load 150kg.',
      descriptionRu:
        'Хлопковый верёвочный гамак с прочной стальной стойкой. Лёгкая сборка, деревья не нужны. Нагрузка до 150 кг.',
      price: 149.99,
      salePrice: 119.99,
      stock: 8,
      categoryId: outdoor.id,
      images: [img.product('hammock-with-stand')],
      rating: 4.7,
      reviewCount: 36,
      specs: {
        material: 'Organic cotton rope, powder-coated steel stand',
        dimensions: '280x100x110 cm',
        weight: '15 kg',
        color: 'Natural White / Black stand',
        warranty: '2 years',
        careInstructions: 'Bring indoors during rain, machine wash hammock at 30C',
      },
    },
    {
      name: 'Outdoor Dining Set 6-Seater',
      nameRu: 'Обеденный комплект для улицы на 6 персон',
      slug: 'outdoor-dining-set',
      description:
        'Aluminium outdoor dining table and 6 stackable chairs. UV-resistant and lightweight.',
      descriptionRu:
        'Алюминиевый обеденный стол для улицы и 6 штабелируемых стульев. Устойчив к УФ-лучам, лёгкий.',
      price: 899.99,
      stock: 5,
      categoryId: outdoor.id,
      images: [img.product('outdoor-dining-set')],
      rating: 4.3,
      reviewCount: 11,
      specs: {
        material: 'Powder-coated aluminium, polywood slats',
        dimensions: '180x90x75 cm (table)',
        weight: '35 kg (set)',
        color: 'Anthracite',
        warranty: '3 years',
        careInstructions: 'Wipe with damp cloth, stack chairs for storage',
      },
    },
    {
      name: 'Propane Fire Pit Table',
      nameRu: 'Газовый стол-камин',
      slug: 'fire-pit-table',
      description:
        'Rectangular propane fire pit coffee table with lava rocks and auto-ignition. CSA certified.',
      descriptionRu:
        'Прямоугольный газовый журнальный стол-камин с лавовыми камнями и автоподжигом. Сертификат безопасности.',
      price: 549.99,
      stock: 6,
      categoryId: outdoor.id,
      images: [img.product('fire-pit-table')],
      rating: 4.6,
      reviewCount: 8,
      specs: {
        material: 'Fibre-reinforced concrete, stainless steel burner',
        dimensions: '120x60x45 cm',
        weight: '40 kg',
        color: 'Grey Concrete',
        warranty: '3 years',
        careInstructions: 'Cover when not in use, check gas connections annually',
      },
    },

    // ── Decor (10) ────────────────────────────────────────────────────────
    {
      name: 'Abstract Canvas Print Large',
      nameRu: 'Абстрактная картина на холсте, большая',
      slug: 'abstract-canvas-print',
      description:
        'Museum-quality canvas print with abstract brushstroke art. Stretched on solid wood frame. 80x120cm.',
      descriptionRu:
        'Картина музейного качества на холсте с абстрактными мазками. Натянута на деревянный подрамник. 80x120 см.',
      price: 119.99,
      salePrice: 89.99,
      stock: 20,
      categoryId: decor.id,
      images: [img.product('abstract-canvas-print')],
      rating: 4.6,
      reviewCount: 33,
      specs: {
        material: 'Giclee print on cotton canvas, pine stretcher bars',
        dimensions: '80x120x3 cm',
        weight: '2.5 kg',
        color: 'Multicolor',
        warranty: '1 year',
        careInstructions: 'Dust with soft brush, avoid direct sunlight',
      },
    },
    {
      name: 'Gallery Wall Set of 5',
      nameRu: 'Набор для галерейной стены из 5 рамок',
      slug: 'gallery-wall-set',
      description: 'Curated set of five black-and-white art prints in black frames. Ready to hang.',
      descriptionRu:
        'Подобранный набор из пяти чёрно-белых принтов в чёрных рамках. Готовы к подвешиванию.',
      price: 79.99,
      stock: 15,
      categoryId: decor.id,
      images: [img.product('gallery-wall-set')],
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
      nameRu: 'Арочное зеркало круглое 80 см',
      slug: 'round-arch-mirror',
      description:
        'Arch-top wall mirror with thin gold-tone metal frame. Elegant minimal design. H: 80cm.',
      descriptionRu:
        'Настенное зеркало с арочным верхом и тонкой золотистой рамой. Элегантный минималистичный дизайн. Высота 80 см.',
      price: 139.99,
      stock: 18,
      categoryId: decor.id,
      images: [img.product('round-arch-mirror')],
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
      nameRu: 'Набор керамических ваз, 3 шт.',
      slug: 'ceramic-vase-set',
      description:
        'Set of three handmade ceramic vases in neutral earth tones. Different heights for layered display.',
      descriptionRu:
        'Набор из трёх керамических ваз ручной работы в нейтральных земляных тонах. Разная высота для многоярусной композиции.',
      price: 49.99,
      salePrice: 39.99,
      stock: 40,
      categoryId: decor.id,
      images: [img.product('ceramic-vase-set')],
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
      nameRu: 'Набор ароматических свечей',
      slug: 'scented-candle-set',
      description:
        'Set of four soy-wax candles in amber glass jars. Scents: cedar, vanilla, eucalyptus, linen.',
      descriptionRu:
        'Набор из четырёх соевых свечей в янтарных стеклянных банках. Ароматы: кедр, ваниль, эвкалипт, лён.',
      price: 34.99,
      stock: 80,
      categoryId: decor.id,
      images: [img.product('scented-candle-set')],
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
      nameRu: 'Минималистичные настенные часы',
      slug: 'minimalist-wall-clock',
      description:
        'Silent sweep mechanism wall clock. Black hands on white face with oak frame. 30cm diameter.',
      descriptionRu:
        'Настенные часы с бесшумным механизмом. Чёрные стрелки на белом циферблате в дубовой рамке. Диаметр 30 см.',
      price: 44.99,
      stock: 55,
      categoryId: decor.id,
      images: [img.product('minimalist-wall-clock')],
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
      name: 'Macrame Wall Hanging',
      nameRu: 'Панно макраме',
      slug: 'macrame-wall-hanging',
      description:
        'Hand-knotted cotton macrame wall art on driftwood. Boho style. W: 60cm, H: 90cm.',
      descriptionRu:
        'Панно макраме из хлопкового шнура ручной работы на коряге. Стиль бохо. 60x90 см.',
      price: 59.99,
      stock: 12,
      categoryId: decor.id,
      images: [img.product('macrame-wall-hanging')],
      rating: 4.3,
      reviewCount: 19,
      specs: {
        material: '100% natural cotton rope, driftwood rod',
        dimensions: '60x90 cm',
        weight: '0.9 kg',
        color: 'Natural Ivory',
        style: 'Bohemian',
        warranty: '1 year',
        careInstructions: 'Shake out dust, spot clean with cold water only',
      },
    },
    {
      name: 'Decorative Tray Set',
      nameRu: 'Набор декоративных подносов',
      slug: 'decorative-tray-set',
      description:
        'Nesting set of two rectangular trays in matte black steel. Style your coffee table or dresser.',
      descriptionRu:
        'Набор из двух вкладывающихся прямоугольных подносов из матовой чёрной стали. Украсьте журнальный столик или комод.',
      price: 29.99,
      stock: 60,
      categoryId: decor.id,
      images: [img.product('decorative-tray-set')],
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
    {
      name: 'Terrazzo Bookends Pair',
      nameRu: 'Книгодержатели из терраццо, пара',
      slug: 'terrazzo-bookends',
      description:
        'Pair of L-shaped terrazzo bookends with non-slip felt base. Modern geometric design.',
      descriptionRu:
        'Пара L-образных книгодержателей из терраццо с нескользящим фетровым основанием. Современный геометрический дизайн.',
      price: 39.99,
      stock: 30,
      categoryId: decor.id,
      images: [img.product('terrazzo-bookends')],
      rating: 4.4,
      reviewCount: 13,
      specs: {
        material: 'Cement terrazzo with marble chips, felt base',
        dimensions: '14x10x20 cm (each)',
        weight: '2.5 kg (pair)',
        color: 'White Terrazzo',
        warranty: '1 year',
        careInstructions: 'Wipe with damp cloth, keep away from shelf edges',
      },
    },
    {
      name: 'Abstract Sculpture Bronze',
      nameRu: 'Абстрактная скульптура бронза',
      slug: 'sculpture-abstract',
      description:
        'Hand-finished abstract bronze sculpture on marble base. Statement piece for shelves or consoles.',
      descriptionRu:
        'Абстрактная бронзовая скульптура ручной отделки на мраморном основании. Выразительный элемент для полок и консолей.',
      price: 159.99,
      stock: 8,
      categoryId: decor.id,
      images: [img.product('sculpture-abstract')],
      rating: 4.6,
      reviewCount: 6,
      specs: {
        material: 'Cast bronze, marble base',
        dimensions: '15x15x35 cm',
        weight: '3.8 kg',
        color: 'Bronze / White Marble',
        warranty: '1 year',
        careInstructions: 'Dust with soft cloth, do not use chemical cleaners on bronze',
      },
    },

    // ── Textiles (9) ─────────────────────────────────────────────────────
    {
      name: 'Linen Duvet Cover Set',
      nameRu: 'Комплект постельного белья из льна',
      slug: 'linen-duvet-cover',
      description:
        'Washed French linen duvet cover and two pillowcases. Breathable and pre-softened. 200x200cm.',
      descriptionRu:
        'Пододеяльник и две наволочки из стираного французского льна. Дышащий и предварительно смягчённый. 200x200 см.',
      price: 129.99,
      salePrice: 99.99,
      stock: 30,
      categoryId: textiles.id,
      images: [img.product('linen-duvet-cover')],
      rating: 4.8,
      reviewCount: 64,
      specs: {
        material: '100% French flax linen, OEKO-TEX certified',
        dimensions: '200x200 cm (duvet), 50x70 cm (pillowcases)',
        weight: '1.8 kg',
        color: 'Natural Linen',
        warranty: '1 year',
        careInstructions: 'Machine wash 40C gentle, tumble dry low, gets softer with each wash',
      },
    },
    {
      name: 'Velvet Cushion Set of 4',
      nameRu: 'Набор бархатных подушек, 4 шт.',
      slug: 'velvet-cushion-set',
      description:
        'Set of four velvet throw cushions in complementary muted tones. 45x45cm. Inserts included.',
      descriptionRu:
        'Набор из четырёх бархатных декоративных подушек в приглушённых тонах. 45x45 см. Вкладыши в комплекте.',
      price: 69.99,
      salePrice: 54.99,
      stock: 45,
      categoryId: textiles.id,
      images: [img.product('velvet-cushion-set')],
      rating: 4.6,
      reviewCount: 41,
      specs: {
        material: 'Cotton velvet covers, polyester fill inserts',
        dimensions: '45x45 cm (each)',
        weight: '0.6 kg (each)',
        color: 'Sage / Terracotta / Ivory / Dusty Blue',
        warranty: '1 year',
        careInstructions: 'Remove covers and machine wash at 30C, do not bleach',
      },
    },
    {
      name: 'Chunky Knit Throw Blanket',
      nameRu: 'Крупновязаный плед',
      slug: 'chunky-knit-throw',
      description:
        'Hand-knitted merino wool throw blanket. Extra thick and warm. 130x170cm. Natural ivory.',
      descriptionRu:
        'Плед крупной вязки из шерсти мериноса ручной работы. Очень тёплый и толстый. 130x170 см. Цвет слоновой кости.',
      price: 89.99,
      stock: 20,
      categoryId: textiles.id,
      images: [img.product('chunky-knit-throw')],
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
      nameRu: 'Льняные шторы блэкаут',
      slug: 'linen-blackout-curtains',
      description:
        'Room-darkening linen-look curtains. Each panel 140x250cm. Sold as a pair with eyelet top.',
      descriptionRu:
        'Затемняющие шторы с льняной текстурой. Каждое полотно 140x250 см. Продаются парой с люверсами.',
      price: 79.99,
      stock: 25,
      categoryId: textiles.id,
      images: [img.product('linen-blackout-curtains')],
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
      nameRu: 'Хлопковые вафельные полотенца',
      slug: 'waffle-bath-towels',
      description:
        'Set of four premium waffle-weave cotton towels: 2 bath and 2 hand towels. Quick-dry.',
      descriptionRu:
        'Набор из четырёх хлопковых полотенец вафельного плетения: 2 банных и 2 для рук. Быстро сохнут.',
      price: 49.99,
      salePrice: 39.99,
      stock: 60,
      categoryId: textiles.id,
      images: [img.product('waffle-bath-towels')],
      rating: 4.5,
      reviewCount: 55,
      specs: {
        material: '100% long-staple Turkish cotton, 400 GSM',
        dimensions: '70x140 cm (bath), 40x70 cm (hand)',
        weight: '1.6 kg (set)',
        color: 'White',
        warranty: '1 year',
        careInstructions: 'Machine wash 60C, tumble dry, avoid fabric softener',
      },
    },
    {
      name: 'Table Runner Natural Linen',
      nameRu: 'Дорожка на стол из льна',
      slug: 'table-runner-linen',
      description:
        'Hand-stitched natural linen table runner with fringed ends. 40x180cm. Washes beautifully.',
      descriptionRu:
        'Дорожка на стол из натурального льна ручной работы с бахромой. 40x180 см. Прекрасно стирается.',
      price: 24.99,
      stock: 70,
      categoryId: textiles.id,
      images: [img.product('table-runner-linen')],
      rating: 4.3,
      reviewCount: 22,
      specs: {
        material: '100% natural linen',
        dimensions: '40x180 cm',
        weight: '0.3 kg',
        color: 'Natural Flax',
        warranty: '1 year',
        careInstructions: 'Machine wash 40C, iron while damp for crisp look',
      },
    },
    {
      name: 'Shaggy Bathroom Mat',
      nameRu: 'Пушистый коврик для ванной',
      slug: 'shaggy-bath-mat',
      description:
        'Extra-thick microfibre bath mat with non-slip backing. 50x80cm. Machine washable.',
      descriptionRu:
        'Сверхтолстый коврик для ванной из микрофибры с нескользящим основанием. 50x80 см. Можно стирать в машинке.',
      price: 19.99,
      stock: 90,
      categoryId: textiles.id,
      images: [img.product('shaggy-bath-mat')],
      rating: 4.1,
      reviewCount: 31,
      specs: {
        material: 'Microfibre pile, TPR non-slip backing',
        dimensions: '50x80 cm',
        weight: '0.7 kg',
        color: 'Light Grey',
        warranty: '1 year',
        careInstructions: 'Machine wash 40C, do not tumble dry, air dry flat',
      },
    },
    {
      name: 'Silk Pillowcase Set',
      nameRu: 'Набор шёлковых наволочек',
      slug: 'silk-pillowcase-set',
      description:
        'Set of two 22-momme mulberry silk pillowcases with envelope closure. Kind to skin and hair.',
      descriptionRu:
        'Набор из двух наволочек из шёлка шелковицы плотностью 22 момме. Полезен для кожи и волос.',
      price: 79.99,
      stock: 25,
      categoryId: textiles.id,
      images: [img.product('silk-pillowcase-set')],
      rating: 4.7,
      reviewCount: 36,
      specs: {
        material: '100% mulberry silk, 22 momme',
        dimensions: '50x70 cm (each)',
        weight: '0.2 kg (set)',
        color: 'Champagne',
        warranty: '1 year',
        careInstructions: 'Hand wash in cold water or machine wash delicate, air dry in shade',
      },
    },
    {
      name: 'Wool Plaid Blanket',
      nameRu: 'Шерстяной клетчатый плед',
      slug: 'wool-plaid-blanket',
      description: 'Classic plaid blanket in pure lambswool. Soft, warm, and timeless. 140x200cm.',
      descriptionRu:
        'Классический клетчатый плед из чистой шерсти ягнёнка. Мягкий, тёплый и вневременной. 140x200 см.',
      price: 119.99,
      stock: 18,
      categoryId: textiles.id,
      images: [img.product('wool-plaid-blanket')],
      rating: 4.5,
      reviewCount: 20,
      specs: {
        material: '100% lambswool',
        dimensions: '140x200 cm',
        weight: '1.4 kg',
        color: 'Grey / Cream Plaid',
        warranty: '1 year',
        careInstructions: 'Dry clean recommended, air out regularly',
      },
    },

    // ── Lighting (8) ─────────────────────────────────────────────────────
    {
      name: 'Brass Pendant Light',
      nameRu: 'Латунный подвесной светильник',
      slug: 'brass-pendant-light',
      description:
        'Adjustable brass pendant lamp with opaque white glass shade. E27 socket. Cable length 150cm.',
      descriptionRu:
        'Регулируемый латунный подвесной светильник с матовым белым стеклянным плафоном. Цоколь E27. Длина кабеля 150 см.',
      price: 89.99,
      salePrice: 74.99,
      stock: 25,
      categoryId: lighting.id,
      images: [img.product('brass-pendant-light')],
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
      nameRu: 'Набор настенных светильников, 2 шт.',
      slug: 'wall-sconce-set',
      description:
        'Pair of minimalist wall sconces in matte black. Compatible with G9 LED bulbs (not included).',
      descriptionRu:
        'Пара минималистичных настенных светильников в матовом чёрном. Совместимы с LED-лампами G9 (не в комплекте).',
      price: 64.99,
      stock: 30,
      categoryId: lighting.id,
      images: [img.product('wall-sconce-set')],
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
      nameRu: 'Светодиодная настольная лампа',
      slug: 'led-desk-lamp',
      description:
        'Touch-control desk lamp with 5 brightness levels, USB charging port, and flexible gooseneck arm.',
      descriptionRu:
        'Настольная лампа с сенсорным управлением, 5 уровнями яркости, USB-зарядкой и гибкой ножкой.',
      price: 39.99,
      stock: 80,
      categoryId: lighting.id,
      images: [img.product('led-desk-lamp')],
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
      nameRu: 'Настольная лампа из ротанга',
      slug: 'rattan-table-lamp',
      description:
        'Natural rattan table lamp with white linen shade. E27 socket. H: 45cm. Warm ambient light.',
      descriptionRu:
        'Настольная лампа из натурального ротанга с белым льняным абажуром. Цоколь E27. Высота 45 см.',
      price: 59.99,
      stock: 22,
      categoryId: lighting.id,
      images: [img.product('rattan-table-lamp')],
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
      nameRu: 'Умная светодиодная лента 5 м',
      slug: 'smart-led-strip',
      description:
        'Wi-Fi controlled RGB LED strip. App and voice control. Self-adhesive backing. 5m roll.',
      descriptionRu:
        'RGB светодиодная лента с Wi-Fi управлением. Управление через приложение и голосом. Самоклеящаяся. 5 м.',
      price: 29.99,
      salePrice: 24.99,
      stock: 120,
      categoryId: lighting.id,
      images: [img.product('smart-led-strip')],
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
      nameRu: 'Кластерный потолочный светильник',
      slug: 'cluster-ceiling-light',
      description:
        'Industrial-style cluster light with 6 adjustable pendant arms. Matte black metal. E27 sockets.',
      descriptionRu:
        'Кластерный светильник в индустриальном стиле с 6 регулируемыми подвесами. Матовый чёрный металл. Цоколь E27.',
      price: 149.99,
      stock: 10,
      categoryId: lighting.id,
      images: [img.product('cluster-ceiling-light')],
      rating: 4.6,
      reviewCount: 21,
      specs: {
        material: 'Steel with matte black finish',
        dimensions: '50x50x40 cm (adjustable arms)',
        weight: '4.5 kg',
        color: 'Matte Black',
        style: 'Industrial',
        warranty: '2 years',
        careInstructions: 'Professional installation required, use 6x E27 LED max 8W',
      },
    },
    {
      name: 'Crystal Chandelier 8-Arm',
      nameRu: 'Хрустальная люстра с 8 рожками',
      slug: 'chandelier-crystal',
      description:
        'Classic 8-arm crystal chandelier with hand-cut K9 crystals and chrome frame. Stunning centerpiece.',
      descriptionRu:
        'Классическая хрустальная люстра с 8 рожками, кристаллами K9 ручной огранки и хромированной рамой.',
      price: 449.99,
      stock: 5,
      categoryId: lighting.id,
      images: [img.product('chandelier-crystal')],
      rating: 4.8,
      reviewCount: 9,
      specs: {
        material: 'Chrome-plated steel, K9 crystal pendants',
        dimensions: '60x60x50 cm',
        weight: '8.5 kg',
        color: 'Chrome / Crystal',
        warranty: '3 years',
        careInstructions: 'Professional cleaning recommended, handle crystals carefully',
      },
    },
    {
      name: 'Tripod Floor Lamp',
      nameRu: 'Напольная лампа на треноге',
      slug: 'floor-lamp-tripod',
      description:
        'Mid-century modern tripod floor lamp with fabric drum shade. Solid walnut legs. H: 150cm.',
      descriptionRu:
        'Напольная лампа на треноге в стиле модерн середины века с тканевым абажуром-барабаном. Ножки из ореха. Высота 150 см.',
      price: 169.99,
      stock: 14,
      categoryId: lighting.id,
      images: [img.product('floor-lamp-tripod')],
      rating: 4.5,
      reviewCount: 25,
      specs: {
        material: 'Solid walnut tripod legs, linen drum shade',
        dimensions: '45x45x150 cm',
        weight: '5.2 kg',
        color: 'Walnut / White',
        warranty: '2 years',
        careInstructions: 'Dust shade regularly, use E27 LED max 12W',
      },
    },

    // ── Storage (7) ──────────────────────────────────────────────────────
    {
      name: 'Wooden Coat Rack',
      nameRu: 'Деревянная вешалка для одежды',
      slug: 'wooden-coat-rack',
      description:
        'Freestanding coat rack in solid beech with 8 hooks and lower shoe shelf. H: 170cm.',
      descriptionRu:
        'Напольная вешалка из массива бука с 8 крючками и нижней полкой для обуви. Высота 170 см.',
      price: 69.99,
      stock: 35,
      categoryId: storage.id,
      images: [img.product('wooden-coat-rack')],
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
      nameRu: 'Набор корзин из морской травы, 3 шт.',
      slug: 'seagrass-basket-set',
      description:
        'Nesting set of three handwoven seagrass baskets with leather handles. S/M/L. Multipurpose.',
      descriptionRu:
        'Набор из трёх вложенных плетёных корзин из морской травы с кожаными ручками. S/M/L. Универсальные.',
      price: 44.99,
      stock: 50,
      categoryId: storage.id,
      images: [img.product('seagrass-basket-set')],
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
      nameRu: 'Настенная полка с крючками',
      slug: 'wall-shelf-with-hooks',
      description:
        'Oak wall shelf with 4 matte black hooks underneath. Ideal for hallway or bathroom. W: 80cm.',
      descriptionRu:
        'Дубовая настенная полка с 4 матовыми чёрными крючками снизу. Идеальна для прихожей или ванной. Ширина 80 см.',
      price: 34.99,
      stock: 45,
      categoryId: storage.id,
      images: [img.product('wall-shelf-with-hooks')],
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
      nameRu: 'Обувница на 10 ярусов',
      slug: 'shoe-rack-10-tier',
      description:
        'Stackable metal shoe rack for 10 pairs. Space-saving design, easy assembly. H: 150cm.',
      descriptionRu:
        'Штабелируемая металлическая обувница на 10 пар. Компактный дизайн, лёгкая сборка. Высота 150 см.',
      price: 39.99,
      stock: 40,
      categoryId: storage.id,
      images: [img.product('shoe-rack-10-tier')],
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
      nameRu: 'Набор льняных коробок для хранения, 4 шт.',
      slug: 'linen-storage-boxes',
      description:
        'Set of four collapsible linen storage boxes with lids and labels. Wardrobe and shelf-friendly.',
      descriptionRu:
        'Набор из четырёх складных льняных коробок с крышками и этикетками. Для шкафов и полок.',
      price: 29.99,
      stock: 65,
      categoryId: storage.id,
      images: [img.product('linen-storage-boxes')],
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
    {
      name: 'Modular Shelving Unit',
      nameRu: 'Модульный стеллаж',
      slug: 'modular-shelving',
      description:
        'Configurable modular shelving system with 9 cube compartments. Mix open and closed sections.',
      descriptionRu:
        'Модульная система стеллажей с 9 ячейками. Комбинируйте открытые и закрытые секции.',
      price: 179.99,
      stock: 12,
      categoryId: storage.id,
      images: [img.product('modular-shelving')],
      rating: 4.4,
      reviewCount: 20,
      specs: {
        material: 'Melamine-coated MDF, steel connectors',
        dimensions: '110x35x110 cm',
        weight: '25 kg',
        color: 'White / Oak',
        warranty: '3 years',
        careInstructions: 'Anchor to wall for safety, wipe with damp cloth',
      },
    },
    {
      name: 'Entryway Bench with Storage',
      nameRu: 'Скамья для прихожей с хранением',
      slug: 'entryway-bench-storage',
      description:
        'Padded bench with shoe storage underneath and coat hooks on back panel. All-in-one hallway solution.',
      descriptionRu:
        'Мягкая скамья с обувницей внизу и крючками для одежды на задней панели. Комплексное решение для прихожей.',
      price: 249.99,
      stock: 9,
      categoryId: storage.id,
      images: [img.product('entryway-bench-storage')],
      rating: 4.6,
      reviewCount: 14,
      specs: {
        material: 'MDF body, polyester cushion, steel hooks',
        dimensions: '100x40x180 cm',
        weight: '18 kg',
        color: 'White / Grey cushion',
        warranty: '2 years',
        careInstructions: 'Wipe surfaces with damp cloth, remove cushion for washing',
      },
    },

    // ── Additional products to reach 100+ ────────────────────────────────
    {
      name: 'Marble Dining Table Round',
      nameRu: 'Круглый обеденный стол из мрамора',
      slug: 'marble-dining-table-round',
      description:
        'Round dining table with genuine Carrara marble top and brass pedestal base. Seats 4-6.',
      descriptionRu:
        'Круглый обеденный стол с натуральной каррарской мраморной столешницей и латунным пьедесталом. На 4-6 персон.',
      price: 1399.0,
      stock: 3,
      categoryId: kitchen.id,
      images: [img.product('solid-oak-dining-table')],
      rating: 4.8,
      reviewCount: 4,
      specs: {
        material: 'Carrara marble top, brass-plated steel base',
        dimensions: '120x120x76 cm',
        weight: '55 kg',
        color: 'White Marble / Brass',
        warranty: '5 years',
        careInstructions: 'Seal marble every 6 months, use coasters, wipe spills immediately',
      },
    },
    {
      name: 'Rattan Lounge Chair',
      nameRu: 'Кресло для отдыха из ротанга',
      slug: 'rattan-lounge-chair',
      description: 'Handwoven natural rattan lounge chair with linen cushion. Indoor/outdoor use.',
      descriptionRu:
        'Плетёное вручную кресло из натурального ротанга с льняной подушкой. Для дома и сада.',
      price: 349.99,
      stock: 8,
      categoryId: livingRoom.id,
      images: [img.product('boucle-armchair')],
      rating: 4.5,
      reviewCount: 12,
      specs: {
        material: 'Natural rattan, linen cushion',
        dimensions: '75x85x90 cm',
        weight: '10 kg',
        color: 'Natural / White cushion',
        warranty: '2 years',
        careInstructions: 'Keep away from prolonged rain, wash cushion cover at 30C',
      },
    },
    {
      name: 'Velvet Sofa 2-Seater',
      nameRu: 'Бархатный диван 2-местный',
      slug: 'velvet-sofa-2-seater',
      description:
        'Luxurious 2-seater sofa in emerald green velvet with brass legs. Perfect for smaller rooms.',
      descriptionRu:
        'Роскошный 2-местный диван из изумрудно-зелёного бархата с латунными ножками. Идеален для небольших комнат.',
      price: 649.99,
      salePrice: 549.99,
      stock: 6,
      categoryId: livingRoom.id,
      images: [img.product('nordic-sofa')],
      rating: 4.6,
      reviewCount: 15,
      specs: {
        material: 'Velvet upholstery, hardwood frame, brass legs',
        dimensions: '160x85x80 cm',
        weight: '35 kg',
        color: 'Emerald Green',
        warranty: '3 years',
        careInstructions: 'Vacuum with soft brush, professional cleaning recommended',
      },
    },
    {
      name: 'Oak Side Table with Shelf',
      nameRu: 'Приставной столик из дуба с полкой',
      slug: 'oak-side-table-shelf',
      description:
        'Compact side table in solid oak with lower shelf. Perfect bedside or sofa companion.',
      descriptionRu:
        'Компактный приставной столик из массива дуба с нижней полкой. Идеален как прикроватная тумба.',
      price: 89.99,
      stock: 30,
      categoryId: livingRoom.id,
      images: [img.product('glass-side-table')],
      rating: 4.3,
      reviewCount: 19,
      specs: {
        material: 'Solid oak',
        dimensions: '45x40x55 cm',
        weight: '6 kg',
        color: 'Natural Oak',
        warranty: '2 years',
        careInstructions: 'Dust regularly, oil with wood care oil every 6 months',
      },
    },
    {
      name: 'Outdoor Parasol 3m',
      nameRu: 'Садовый зонт 3 м',
      slug: 'outdoor-parasol-3m',
      description:
        'Large cantilever parasol with 360 rotation, tilt, and crank mechanism. UV50+ protection.',
      descriptionRu:
        'Большой консольный зонт с поворотом на 360, наклоном и механизмом вращения. Защита UV50+.',
      price: 299.99,
      stock: 10,
      categoryId: outdoor.id,
      images: [img.product('garden-lounge-set')],
      rating: 4.4,
      reviewCount: 16,
      specs: {
        material: 'Polyester canopy, aluminium pole, steel cross base',
        dimensions: '300x300x260 cm',
        weight: '18 kg',
        color: 'Anthracite',
        warranty: '2 years',
        careInstructions: 'Close and cover when not in use, store indoors during winter',
      },
    },
    {
      name: 'Kids Bookshelf Animal',
      nameRu: 'Детский стеллаж с фигуркой животного',
      slug: 'kids-bookshelf-animal',
      description:
        'Playful children bookshelf shaped like a tree with animal decorations. Non-toxic paint.',
      descriptionRu:
        'Игривый детский стеллаж в форме дерева с фигурками животных. Нетоксичная краска.',
      price: 149.99,
      stock: 15,
      categoryId: storage.id,
      images: [img.product('modular-shelving')],
      rating: 4.7,
      reviewCount: 22,
      specs: {
        material: 'MDF with non-toxic water-based paint',
        dimensions: '60x30x120 cm',
        weight: '14 kg',
        color: 'White / Pastel accents',
        warranty: '2 years',
        careInstructions: 'Wipe with damp cloth, anchor to wall for safety',
      },
    },
    {
      name: 'Woven Pendant Shade',
      nameRu: 'Плетёный подвесной абажур',
      slug: 'woven-pendant-shade',
      description:
        'Handwoven jute pendant lampshade. Natural texture, warm diffused light. Fits standard E27.',
      descriptionRu:
        'Подвесной абажур из джута ручного плетения. Натуральная текстура, тёплый рассеянный свет. Цоколь E27.',
      price: 49.99,
      stock: 25,
      categoryId: lighting.id,
      images: [img.product('rattan-table-lamp')],
      rating: 4.4,
      reviewCount: 18,
      specs: {
        material: 'Natural jute, steel ring frame',
        dimensions: '40x40x30 cm',
        weight: '0.8 kg',
        color: 'Natural Jute',
        warranty: '1 year',
        careInstructions: 'Dust with soft brush, keep away from moisture, max 12W LED',
      },
    },
    {
      name: 'Bathroom Vanity Unit 80cm',
      nameRu: 'Тумба под раковину 80 см',
      slug: 'bathroom-vanity-unit',
      description:
        'Wall-mounted bathroom vanity with ceramic basin and two soft-close drawers. W: 80cm.',
      descriptionRu:
        'Навесная тумба с керамической раковиной и двумя ящиками с доводчиком. Ширина 80 см.',
      price: 449.99,
      stock: 7,
      categoryId: bathroom.id,
      images: [img.product('bathroom-cabinet-mirror')],
      rating: 4.5,
      reviewCount: 10,
      specs: {
        material: 'MDF with moisture-resistant coating, ceramic basin',
        dimensions: '80x46x55 cm',
        weight: '25 kg',
        color: 'White',
        warranty: '3 years',
        careInstructions: 'Wipe with damp cloth, clean basin with non-abrasive cleaner',
      },
    },
    {
      name: 'Wooden Desk Tidy',
      nameRu: 'Деревянный настольный органайзер',
      slug: 'wooden-desk-tidy',
      description: 'Solid walnut desk organizer with compartments for pens, phone, and stationery.',
      descriptionRu:
        'Настольный органайзер из массива ореха с отделениями для ручек, телефона и канцелярии.',
      price: 34.99,
      stock: 40,
      categoryId: office.id,
      images: [img.product('desk-organizer-plastic')],
      rating: 4.6,
      reviewCount: 14,
      specs: {
        material: 'Solid walnut, felt-lined base',
        dimensions: '25x12x10 cm',
        weight: '0.6 kg',
        color: 'Walnut',
        warranty: '2 years',
        careInstructions: 'Dust regularly, oil with wood care product annually',
      },
    },
    {
      name: 'Cotton Floor Cushion',
      nameRu: 'Хлопковая напольная подушка',
      slug: 'cotton-floor-cushion',
      description:
        'Large floor cushion in hand-block printed cotton. Extra seating for guests. 60x60cm.',
      descriptionRu:
        'Большая напольная подушка из хлопка с ручной печатью. Дополнительное сиденье для гостей. 60x60 см.',
      price: 44.99,
      stock: 35,
      categoryId: textiles.id,
      images: [img.product('velvet-cushion-set')],
      rating: 4.2,
      reviewCount: 11,
      specs: {
        material: 'Cotton cover, polyester fill',
        dimensions: '60x60x15 cm',
        weight: '1.5 kg',
        color: 'Indigo / White',
        warranty: '1 year',
        careInstructions: 'Remove cover for washing at 30C, tumble dry low',
      },
    },
    {
      name: 'Ceramic Table Lamp',
      nameRu: 'Керамическая настольная лампа',
      slug: 'ceramic-table-lamp',
      description:
        'Handmade ceramic table lamp with linen shade. Textured matte finish. E27 socket.',
      descriptionRu:
        'Настольная лампа из керамики ручной работы с льняным абажуром. Текстурированная матовая отделка. Цоколь E27.',
      price: 79.99,
      stock: 20,
      categoryId: lighting.id,
      images: [img.product('rattan-table-lamp')],
      rating: 4.5,
      reviewCount: 16,
      specs: {
        material: 'Handmade ceramic base, linen shade',
        dimensions: '25x25x40 cm',
        weight: '2.5 kg',
        color: 'Sage Green / White',
        warranty: '1 year',
        careInstructions: 'Dust with soft cloth, handle base carefully, max 10W E27 LED',
      },
    },
    {
      name: 'Outdoor Rug 160x230',
      nameRu: 'Уличный ковёр 160x230',
      slug: 'outdoor-rug-flat',
      description: 'Flat-weave polypropylene outdoor rug. UV and water resistant. Easy to clean.',
      descriptionRu:
        'Плоский плетёный уличный ковёр из полипропилена. Устойчив к УФ-лучам и воде. Легко чистится.',
      price: 69.99,
      stock: 20,
      categoryId: outdoor.id,
      images: [img.product('wool-area-rug')],
      rating: 4.1,
      reviewCount: 13,
      specs: {
        material: '100% polypropylene',
        dimensions: '160x230 cm',
        weight: '3.5 kg',
        color: 'Grey / Cream geometric',
        warranty: '2 years',
        careInstructions: 'Hose down to clean, hang to dry, store rolled up in winter',
      },
    },
  ];

  const products = await Promise.all(
    productData.map(p =>
      prisma.product.upsert({
        where: { slug: p.slug },
        update: {
          images: p.images,
          specs: p.specs,
          nameRu: p.nameRu,
          descriptionRu: p.descriptionRu,
        },
        create: p,
      })
    )
  );

  // ─── Product Variants ─────────────────────────────────────────────────────

  await prisma.productVariant.deleteMany({});

  const variantData: Record<
    string,
    Array<{ name: string; color?: string; size?: string; stock: number; priceAdjustment: number }>
  > = {
    'nordic-sofa': [
      { name: 'Light Grey', color: '#D3D3D3', stock: 5, priceAdjustment: 0 },
      { name: 'Sand', color: '#C2B280', stock: 4, priceAdjustment: 0 },
      { name: 'Charcoal', color: '#36454F', stock: 3, priceAdjustment: 20 },
    ],
    'minimalist-coffee-table': [
      { name: 'Walnut / Black', color: '#5B3A29', stock: 15, priceAdjustment: 0 },
      { name: 'Oak / White', color: '#D4A76A', stock: 15, priceAdjustment: 10 },
    ],
    'floor-lamp-arco': [
      { name: 'White / Silver', color: '#FFFFFF', stock: 20, priceAdjustment: 0 },
      { name: 'Black / Gold', color: '#000000', stock: 25, priceAdjustment: 15 },
    ],
    'bookshelf-tall-oak': [
      { name: 'Natural Oak', color: '#D4A76A', stock: 4, priceAdjustment: 0 },
      { name: 'Walnut', color: '#5B3A29', stock: 4, priceAdjustment: 30 },
    ],
    'boucle-armchair': [
      { name: 'Cream', color: '#FFFDD0', stock: 5, priceAdjustment: 0 },
      { name: 'Sage', color: '#9DC183', stock: 3, priceAdjustment: 0 },
      { name: 'Dusty Pink', color: '#DCAE96', stock: 2, priceAdjustment: 10 },
    ],
    'designer-sofa-set': [
      { name: 'Cognac', color: '#9A463D', stock: 1, priceAdjustment: 0 },
      { name: 'Black', color: '#000000', stock: 1, priceAdjustment: 200 },
    ],
    'leather-recliner': [
      { name: 'Dark Brown', color: '#3E2723', stock: 4, priceAdjustment: 0 },
      { name: 'Black', color: '#000000', stock: 3, priceAdjustment: 0 },
    ],
    'platform-bed-queen': [
      { name: 'Walnut', color: '#5B3A29', stock: 10, priceAdjustment: 0 },
      { name: 'Natural Oak', color: '#D4A76A', stock: 10, priceAdjustment: -20 },
    ],
    'bedside-table-duo': [
      { name: 'White', color: '#FFFFFF', stock: 12, priceAdjustment: 0 },
      { name: 'Black', color: '#000000', stock: 13, priceAdjustment: 0 },
    ],
    'dresser-6-drawer': [
      { name: 'Natural Oak', color: '#D4A76A', stock: 7, priceAdjustment: 0 },
      { name: 'White', color: '#FFFFFF', stock: 7, priceAdjustment: -20 },
    ],
    'king-bed-frame-oak': [
      { name: 'Natural Oak', color: '#D4A76A', stock: 2, priceAdjustment: 0 },
      { name: 'Dark Walnut', color: '#3E2723', stock: 2, priceAdjustment: 100 },
    ],
    'dining-table-extendable': [
      { name: 'White', color: '#FFFFFF', stock: 5, priceAdjustment: 0 },
      { name: 'Natural Birch', color: '#E8D4A2', stock: 5, priceAdjustment: 30 },
    ],
    'dining-chairs-set': [
      { name: 'White / Natural', color: '#FFFFFF', stock: 6, priceAdjustment: 0 },
      { name: 'Black / Natural', color: '#000000', stock: 6, priceAdjustment: 0 },
      { name: 'Grey / Natural', color: '#808080', stock: 6, priceAdjustment: 0 },
    ],
    'standing-desk-electric': [
      { name: 'Natural Bamboo / Black', color: '#D4A76A', stock: 5, priceAdjustment: 0 },
      { name: 'Walnut / Black', color: '#5B3A29', stock: 4, priceAdjustment: 50 },
    ],
    'ergonomic-office-chair': [
      { name: 'Black', color: '#000000', stock: 8, priceAdjustment: 0 },
      { name: 'Grey', color: '#808080', stock: 7, priceAdjustment: 0 },
    ],
    'abstract-canvas-print': [
      { name: 'Multicolor', stock: 10, priceAdjustment: 0 },
      { name: 'Blue Tones', stock: 10, priceAdjustment: 0 },
    ],
    'ceramic-vase-set': [
      { name: 'Sand / Terracotta / Sage', color: '#C2B280', stock: 20, priceAdjustment: 0 },
      { name: 'White / Grey / Black', color: '#FFFFFF', stock: 20, priceAdjustment: 5 },
    ],
    'linen-duvet-cover': [
      { name: 'Natural Linen', color: '#E0D5C1', stock: 10, priceAdjustment: 0 },
      { name: 'White', color: '#FFFFFF', stock: 10, priceAdjustment: 0 },
      { name: 'Dusty Blue', color: '#7BA7BC', stock: 10, priceAdjustment: 10 },
    ],
    'velvet-cushion-set': [
      {
        name: 'Sage / Terracotta / Ivory / Dusty Blue',
        color: '#9DC183',
        stock: 15,
        priceAdjustment: 0,
      },
      { name: 'Navy / Mustard / Cream / Blush', color: '#000080', stock: 15, priceAdjustment: 0 },
      { name: 'S', size: 'S', stock: 15, priceAdjustment: -10 },
      { name: 'L', size: 'L', stock: 15, priceAdjustment: 15 },
    ],
    'chunky-knit-throw': [
      { name: 'Natural Ivory', color: '#FFFFF0', stock: 10, priceAdjustment: 0 },
      { name: 'Light Grey', color: '#D3D3D3', stock: 10, priceAdjustment: 0 },
    ],
    'brass-pendant-light': [
      { name: 'Brass / White', color: '#B5A642', stock: 12, priceAdjustment: 0 },
      { name: 'Matte Black / White', color: '#000000', stock: 13, priceAdjustment: -5 },
    ],
    'garden-lounge-set': [
      { name: 'Brown / Beige', color: '#8B4513', stock: 2, priceAdjustment: 0 },
      { name: 'Grey / Charcoal', color: '#808080', stock: 2, priceAdjustment: 50 },
    ],
    'wooden-coat-rack': [
      { name: 'Natural Beech', color: '#D4A76A', stock: 15, priceAdjustment: 0 },
      { name: 'Walnut', color: '#5B3A29', stock: 10, priceAdjustment: 10 },
      { name: 'White', color: '#FFFFFF', stock: 10, priceAdjustment: 0 },
    ],
    'chandelier-crystal': [
      { name: 'Chrome / Crystal', color: '#C0C0C0', stock: 3, priceAdjustment: 0 },
      { name: 'Gold / Crystal', color: '#FFD700', stock: 2, priceAdjustment: 50 },
    ],
    'outdoor-dining-set': [
      { name: 'Anthracite', color: '#383838', stock: 3, priceAdjustment: 0 },
      { name: 'White', color: '#FFFFFF', stock: 2, priceAdjustment: 0 },
    ],
    'modular-shelving': [
      { name: 'White / Oak', color: '#FFFFFF', stock: 6, priceAdjustment: 0 },
      { name: 'All White', color: '#FFFFFF', stock: 3, priceAdjustment: -10 },
      { name: 'All Oak', color: '#D4A76A', stock: 3, priceAdjustment: 20 },
    ],
  };

  for (const [slug, variants] of Object.entries(variantData)) {
    const product = products.find(p => p.slug === slug);
    if (!product) continue;
    for (const v of variants) {
      await prisma.productVariant.create({
        data: {
          productId: product.id,
          name: v.name,
          color: v.color,
          size: v.size,
          stock: v.stock,
          priceAdjustment: v.priceAdjustment,
        },
      });
    }
  }

  // ─── Carts ────────────────────────────────────────────────────────────────

  for (const user of [userRegular, userNew, userAdmin]) {
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

  // ─── Reviews (50+) ────────────────────────────────────────────────────────

  const reviewData: Array<{
    slug: string;
    userId: string;
    rating: number;
    comment: string;
  }> = [
    // Alice reviews
    {
      slug: 'nordic-sofa',
      userId: userRegular.id,
      rating: 5,
      comment:
        'Excellent quality and very comfortable. The fabric feels premium and the oak legs are solid.',
    },
    {
      slug: 'minimalist-coffee-table',
      userId: userRegular.id,
      rating: 4,
      comment: 'Nice design and sturdy build. Took about 20 minutes to assemble.',
    },
    {
      slug: 'ergonomic-office-chair',
      userId: userRegular.id,
      rating: 5,
      comment: 'My back pain is gone after switching to this chair. Worth every penny.',
    },
    {
      slug: 'platform-bed-queen',
      userId: userRegular.id,
      rating: 5,
      comment: 'Beautiful bed frame. Assembly was straightforward with two people. Very stable.',
    },
    {
      slug: 'linen-duvet-cover',
      userId: userRegular.id,
      rating: 5,
      comment: 'Gets softer with every wash. Love the natural linen color. Premium quality.',
    },
    {
      slug: 'chunky-knit-throw',
      userId: userRegular.id,
      rating: 5,
      comment: 'Incredibly soft and warm. Looks beautiful draped over the sofa.',
    },
    {
      slug: 'brass-pendant-light',
      userId: userRegular.id,
      rating: 4,
      comment: 'Beautiful light, easy to install. The brass finish is warm and elegant.',
    },
    {
      slug: 'seagrass-basket-set',
      userId: userRegular.id,
      rating: 5,
      comment: 'Perfect for organizing the living room. The leather handles are a nice touch.',
    },
    {
      slug: 'ceramic-vase-set',
      userId: userRegular.id,
      rating: 4,
      comment: 'Lovely matte finish. The three different heights create a nice arrangement.',
    },
    {
      slug: 'wool-area-rug',
      userId: userRegular.id,
      rating: 5,
      comment: 'Gorgeous rug! Thick and plush, adds warmth to the whole room.',
    },
    {
      slug: 'boucle-armchair',
      userId: userRegular.id,
      rating: 5,
      comment: 'The most comfortable chair I own. Love curling up in it to read.',
    },
    {
      slug: 'standing-desk-electric',
      userId: userRegular.id,
      rating: 4,
      comment: 'Great desk with smooth motor. The memory presets are very convenient.',
    },
    {
      slug: 'scented-candle-set',
      userId: userRegular.id,
      rating: 4,
      comment: 'Cedar and vanilla are my favorites. Long burn time, nice subtle scent.',
    },
    {
      slug: 'gallery-wall-set',
      userId: userRegular.id,
      rating: 5,
      comment: 'Made my wall look like a gallery. Easy to hang with included template.',
    },
    {
      slug: 'velvet-cushion-set',
      userId: userRegular.id,
      rating: 4,
      comment: 'Lovely colors that match well together. The velvet is soft and luxurious.',
    },
    {
      slug: 'round-arch-mirror',
      userId: userRegular.id,
      rating: 5,
      comment: 'This mirror makes the room feel twice as big. Elegant gold frame.',
    },
    {
      slug: 'tv-stand-storage',
      userId: userRegular.id,
      rating: 4,
      comment: 'Clean design, fits my 55-inch TV perfectly. Good cable management at the back.',
    },
    {
      slug: 'shower-shelf-corner',
      userId: userRegular.id,
      rating: 5,
      comment: 'No drilling required and holds up great. Very sturdy for its price.',
    },
    {
      slug: 'led-desk-lamp',
      userId: userRegular.id,
      rating: 4,
      comment: 'Good lamp with nice brightness levels. USB port is very handy.',
    },
    {
      slug: 'waffle-bath-towels',
      userId: userRegular.id,
      rating: 4,
      comment: 'Quick-drying and surprisingly soft for waffle weave. Great value.',
    },
    {
      slug: 'bookshelf-tall-oak',
      userId: userRegular.id,
      rating: 3,
      comment:
        'Nice looking but arrived with a small scratch on one shelf. Customer service was helpful though.',
    },
    {
      slug: 'vanity-stool-velvet',
      userId: userRegular.id,
      rating: 5,
      comment: 'So pretty! The dusty pink is exactly the right shade. Gold legs are elegant.',
    },
    {
      slug: 'wooden-coat-rack',
      userId: userRegular.id,
      rating: 4,
      comment: 'Solid construction, looks great in the hallway. Easy to assemble.',
    },
    {
      slug: 'garden-lounge-set',
      userId: userRegular.id,
      rating: 4,
      comment: 'Great set for the patio. Cushions are comfortable. Survived a rainy week well.',
    },
    {
      slug: 'linen-blackout-curtains',
      userId: userRegular.id,
      rating: 4,
      comment: 'Really blocks the light. Nice linen texture. Good length for standard windows.',
    },

    // Bob reviews
    {
      slug: 'nordic-sofa',
      userId: userNew.id,
      rating: 4,
      comment: 'Good sofa, comfortable for everyday use. Delivery was quick and professional.',
    },
    {
      slug: 'ergonomic-office-chair',
      userId: userNew.id,
      rating: 5,
      comment: 'Best office chair I have ever used. The lumbar support is exceptional.',
    },
    {
      slug: 'minimalist-coffee-table',
      userId: userNew.id,
      rating: 3,
      comment:
        'The table is nice but the walnut veneer chipped slightly during assembly. Be careful.',
    },
    {
      slug: 'floor-lamp-arco',
      userId: userNew.id,
      rating: 5,
      comment:
        'Stunning lamp. The marble base gives it a luxurious feel. Light is warm and pleasant.',
    },
    {
      slug: 'platform-bed-queen',
      userId: userNew.id,
      rating: 4,
      comment: 'Sturdy bed, good value for money. Instructions could be clearer.',
    },
    {
      slug: 'dining-table-extendable',
      userId: userNew.id,
      rating: 5,
      comment: 'Perfect for our apartment. Compact when small, seats 8 when extended. Love it!',
    },
    {
      slug: 'dining-chairs-set',
      userId: userNew.id,
      rating: 4,
      comment: 'Comfortable chairs. Stackable feature is great for small spaces.',
    },
    {
      slug: 'kitchen-island-cart',
      userId: userNew.id,
      rating: 4,
      comment:
        'Wheels roll smoothly, locking mechanism works well. Butcher block top is beautiful.',
    },
    {
      slug: 'smart-led-strip',
      userId: userNew.id,
      rating: 3,
      comment: 'App is a bit buggy but the lights themselves look great. Colors are vivid.',
    },
    {
      slug: 'hammock-with-stand',
      userId: userNew.id,
      rating: 5,
      comment: 'Perfect for lazy summer afternoons. Easy to set up, very relaxing.',
    },
    {
      slug: 'rattan-table-lamp',
      userId: userNew.id,
      rating: 5,
      comment: 'Beautiful warm light through the rattan. Adds so much ambiance to the room.',
    },
    {
      slug: 'wall-shelf-with-hooks',
      userId: userNew.id,
      rating: 4,
      comment:
        'Very practical for the entryway. Hooks are strong, shelf is wide enough for keys and mail.',
    },
    {
      slug: 'shoe-rack-10-tier',
      userId: userNew.id,
      rating: 3,
      comment: 'Does the job but feels a bit wobbly. Best placed against a wall.',
    },
    {
      slug: 'linen-storage-boxes',
      userId: userNew.id,
      rating: 4,
      comment: 'Clean look for wardrobe organization. Labels are a nice detail.',
    },
    {
      slug: 'table-runner-linen',
      userId: userNew.id,
      rating: 5,
      comment: 'Beautiful quality linen. The fringed edges add a lovely rustic touch.',
    },
    {
      slug: 'macrame-wall-hanging',
      userId: userNew.id,
      rating: 4,
      comment: 'Gorgeous handmade piece. Really completes the boho look of our bedroom.',
    },
    {
      slug: 'scented-candle-set',
      userId: userNew.id,
      rating: 5,
      comment: 'Love these candles! The eucalyptus scent is particularly fresh and relaxing.',
    },
    {
      slug: 'abstract-canvas-print',
      userId: userNew.id,
      rating: 4,
      comment: 'Colors are vibrant. Quality print on good canvas. Makes a great focal point.',
    },
    {
      slug: 'folding-bistro-table',
      userId: userNew.id,
      rating: 4,
      comment: 'Perfect for our small balcony. Folds flat for storage. Rust-resistant finish.',
    },
    {
      slug: 'bar-stool-adjustable',
      userId: userNew.id,
      rating: 2,
      comment: 'Looks ok but the hydraulic started leaking after a month. Seat slowly sinks down.',
    },
    {
      slug: 'desk-organizer-plastic',
      userId: userNew.id,
      rating: 1,
      comment: 'Very flimsy plastic. Broke when I tried to move it. Not worth even the low price.',
    },
    {
      slug: 'memory-foam-pillow',
      userId: userNew.id,
      rating: 3,
      comment:
        'Decent pillows but the chemical smell took about a week to go away. Comfortable once aired out.',
    },
    {
      slug: 'wardrobe-sliding',
      userId: userNew.id,
      rating: 4,
      comment:
        'Big wardrobe with lots of space. Mirror doors make the room look bigger. Assembly took 3 hours.',
    },
    {
      slug: 'minimalist-wall-clock',
      userId: userNew.id,
      rating: 5,
      comment: 'Truly silent mechanism. Beautiful simple design. Keeps perfect time.',
    },
    {
      slug: 'dresser-6-drawer',
      userId: userNew.id,
      rating: 5,
      comment: 'Solid oak, beautiful grain. Soft-close drawers are smooth. Worth the investment.',
    },
    {
      slug: 'silk-pillowcase-set',
      userId: userNew.id,
      rating: 5,
      comment: 'My skin and hair feel so much better. Pure luxury at a reasonable price.',
    },
    {
      slug: 'chandelier-crystal',
      userId: userNew.id,
      rating: 5,
      comment:
        'Absolutely stunning when lit. The crystals catch light beautifully. Professional install recommended.',
    },
    {
      slug: 'designer-sofa-set',
      userId: userNew.id,
      rating: 5,
      comment:
        'The Italian leather is buttery soft. This is a true investment piece. Incredible quality.',
    },
    {
      slug: 'solid-oak-dining-table',
      userId: userNew.id,
      rating: 5,
      comment: 'Breathtaking live edge detail. Every guest comments on it. Worth every euro.',
    },
  ];

  for (const r of reviewData) {
    const product = products.find(p => p.slug === r.slug);
    if (!product) continue;
    await prisma.review.upsert({
      where: { userId_productId: { userId: r.userId, productId: product.id } },
      update: {},
      create: {
        userId: r.userId,
        productId: product.id,
        rating: r.rating,
        comment: r.comment,
      },
    });
  }

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
    where: { userId: userAdmin.id, type: TransactionType.TOPUP },
  });
  if (!existingTxRich) {
    await prisma.transaction.create({
      data: {
        userId: userAdmin.id,
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

  // ─── Addresses ────────────────────────────────────────────────────────────

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
        '<h2>The Evolution of Nordic Minimalism</h2><p>Scandinavian design continues to evolve, blending functionality with warmth. This year, we see a shift toward organic shapes, earth tones, and sustainable materials that bring nature indoors.</p><h2>Key Trends</h2><ul><li><strong>Curved furniture:</strong> Soft, rounded edges replace sharp angles</li><li><strong>Natural textures:</strong> Boucle, linen, and raw wood dominate</li><li><strong>Warm neutrals:</strong> Sand, terracotta, and warm grey replace cool whites</li><li><strong>Biophilic design:</strong> Indoor plants and natural light take center stage</li></ul><p>These trends reflect a broader movement toward creating homes that feel both modern and deeply comfortable.</p>',
      coverImage: img.blog('scandinavian-design-trends-2026'),
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
      coverImage: img.blog('small-space-furniture-guide'),
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
      coverImage: img.blog('living-room-color-palettes'),
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
      coverImage: img.blog('sustainable-materials-furniture'),
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
      coverImage: img.blog('perfect-home-office-setup'),
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
      coverImage: img.blog('bedroom-makeover-inspiration'),
      category: 'inspiration',
      authorName: 'Emma Lindqvist',
    },
  ];

  for (const article of blogArticles) {
    await prisma.blogArticle.upsert({
      where: { slug: article.slug },
      update: { coverImage: article.coverImage },
      create: article,
    });
  }

  // eslint-disable-next-line no-console
  console.log('Seed completed successfully');
  // eslint-disable-next-line no-console
  console.log(`  Users: 6 (4 verified + 1 blocked + 1 unverified)`);
  // eslint-disable-next-line no-console
  console.log(`  Categories: ${categories.length}`);
  // eslint-disable-next-line no-console
  console.log(`  Products: ${products.length}`);
  // eslint-disable-next-line no-console
  console.log(`  Product variants: ${Object.values(variantData).flat().length}`);
  // eslint-disable-next-line no-console
  console.log(`  Reviews: ${reviewData.length}`);
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
