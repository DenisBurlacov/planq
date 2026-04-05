export interface SavedCard {
  id: string;
  last4: string;
  brand: 'Visa' | 'Mastercard' | 'Amex';
  expMonth: number;
  expYear: number;
  isDefault: boolean;
  cardholderName: string;
}

const STORAGE_KEY = 'planq_saved_cards';

function loadCards(): SavedCard[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveCards(cards: SavedCard[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
}

function detectBrand(number: string): SavedCard['brand'] {
  const clean = number.replace(/\s/g, '');
  if (clean.startsWith('4')) return 'Visa';
  if (clean.startsWith('5')) return 'Mastercard';
  if (clean.startsWith('3')) return 'Amex';
  return 'Visa';
}

function luhnCheck(number: string): boolean {
  const clean = number.replace(/\s/g, '');
  if (!/^\d{13,19}$/.test(clean)) return false;
  let sum = 0;
  let alternate = false;
  for (let i = clean.length - 1; i >= 0; i--) {
    let n = parseInt(clean[i], 10);
    if (alternate) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alternate = !alternate;
  }
  return sum % 10 === 0;
}

export const cardsApi = {
  list: async (): Promise<SavedCard[]> => {
    await new Promise(r => setTimeout(r, 100));
    return loadCards();
  },

  add: async (input: {
    cardNumber: string;
    cardholderName: string;
    expMonth: number;
    expYear: number;
  }): Promise<SavedCard> => {
    await new Promise(r => setTimeout(r, 200));
    const cards = loadCards();
    if (cards.length >= 5) throw new Error('Maximum 5 cards allowed');
    if (!luhnCheck(input.cardNumber)) throw new Error('Invalid card number');

    const clean = input.cardNumber.replace(/\s/g, '');
    const card: SavedCard = {
      id: crypto.randomUUID(),
      last4: clean.slice(-4),
      brand: detectBrand(clean),
      expMonth: input.expMonth,
      expYear: input.expYear,
      isDefault: cards.length === 0,
      cardholderName: input.cardholderName,
    };
    cards.push(card);
    saveCards(cards);
    return card;
  },

  delete: async (id: string): Promise<void> => {
    await new Promise(r => setTimeout(r, 100));
    let cards = loadCards();
    const wasDefault = cards.find(c => c.id === id)?.isDefault;
    cards = cards.filter(c => c.id !== id);
    if (wasDefault && cards.length > 0) {
      cards[0].isDefault = true;
    }
    saveCards(cards);
  },

  setDefault: async (id: string): Promise<void> => {
    await new Promise(r => setTimeout(r, 100));
    const cards = loadCards();
    cards.forEach(c => {
      c.isDefault = c.id === id;
    });
    saveCards(cards);
  },
};
