import { apiFetch } from './client';

export interface ContactFormInput {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export const contactApi = {
  submit: (input: ContactFormInput) =>
    apiFetch<{ message: string }>('/api/v1/contact', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
};
