export interface ContactFormInput {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export const contactApi = {
  submit: async (_input: ContactFormInput): Promise<{ success: boolean }> => {
    await new Promise(r => setTimeout(r, 800));
    return { success: true };
  },
};
