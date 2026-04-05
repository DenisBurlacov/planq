const STORAGE_KEY = 'planq_newsletter_email';

export const newsletterApi = {
  subscribe: async (email: string): Promise<{ success: boolean; alreadySubscribed: boolean }> => {
    await new Promise(r => setTimeout(r, 300));
    const existing = localStorage.getItem(STORAGE_KEY);
    if (existing) {
      return { success: false, alreadySubscribed: true };
    }
    localStorage.setItem(STORAGE_KEY, email);
    return { success: true, alreadySubscribed: false };
  },

  isSubscribed: (): boolean => {
    return !!localStorage.getItem(STORAGE_KEY);
  },
};
