export interface Testimonial {
  id: number;
  nameKey: string;
  locationKey: string;
  quoteKey: string;
  rating: number;
  avatar: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    nameKey: 'catalog:home.testimonials.1.name',
    locationKey: 'catalog:home.testimonials.1.location',
    quoteKey: 'catalog:home.testimonials.1.quote',
    rating: 5,
    avatar: 'AK',
  },
  {
    id: 2,
    nameKey: 'catalog:home.testimonials.2.name',
    locationKey: 'catalog:home.testimonials.2.location',
    quoteKey: 'catalog:home.testimonials.2.quote',
    rating: 5,
    avatar: 'LM',
  },
  {
    id: 3,
    nameKey: 'catalog:home.testimonials.3.name',
    locationKey: 'catalog:home.testimonials.3.location',
    quoteKey: 'catalog:home.testimonials.3.quote',
    rating: 4,
    avatar: 'SJ',
  },
  {
    id: 4,
    nameKey: 'catalog:home.testimonials.4.name',
    locationKey: 'catalog:home.testimonials.4.location',
    quoteKey: 'catalog:home.testimonials.4.quote',
    rating: 5,
    avatar: 'EN',
  },
  {
    id: 5,
    nameKey: 'catalog:home.testimonials.5.name',
    locationKey: 'catalog:home.testimonials.5.location',
    quoteKey: 'catalog:home.testimonials.5.quote',
    rating: 4,
    avatar: 'MP',
  },
  {
    id: 6,
    nameKey: 'catalog:home.testimonials.6.name',
    locationKey: 'catalog:home.testimonials.6.location',
    quoteKey: 'catalog:home.testimonials.6.quote',
    rating: 5,
    avatar: 'JV',
  },
];
