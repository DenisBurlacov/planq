export interface FaqSection {
  titleKey: string;
  items: {
    questionKey: string;
    answerKey: string;
  }[];
}

export const FAQ_SECTIONS: FaqSection[] = [
  {
    titleKey: 'pages:faq.sections.ordersShipping',
    items: [
      { questionKey: 'pages:faq.questions.0.0.q', answerKey: 'pages:faq.questions.0.0.a' },
      { questionKey: 'pages:faq.questions.0.1.q', answerKey: 'pages:faq.questions.0.1.a' },
      { questionKey: 'pages:faq.questions.0.2.q', answerKey: 'pages:faq.questions.0.2.a' },
      { questionKey: 'pages:faq.questions.0.3.q', answerKey: 'pages:faq.questions.0.3.a' },
    ],
  },
  {
    titleKey: 'pages:faq.sections.returnsRefunds',
    items: [
      { questionKey: 'pages:faq.questions.1.0.q', answerKey: 'pages:faq.questions.1.0.a' },
      { questionKey: 'pages:faq.questions.1.1.q', answerKey: 'pages:faq.questions.1.1.a' },
      { questionKey: 'pages:faq.questions.1.2.q', answerKey: 'pages:faq.questions.1.2.a' },
      { questionKey: 'pages:faq.questions.1.3.q', answerKey: 'pages:faq.questions.1.3.a' },
    ],
  },
  {
    titleKey: 'pages:faq.sections.products',
    items: [
      { questionKey: 'pages:faq.questions.2.0.q', answerKey: 'pages:faq.questions.2.0.a' },
      { questionKey: 'pages:faq.questions.2.1.q', answerKey: 'pages:faq.questions.2.1.a' },
      { questionKey: 'pages:faq.questions.2.2.q', answerKey: 'pages:faq.questions.2.2.a' },
    ],
  },
  {
    titleKey: 'pages:faq.sections.payment',
    items: [
      { questionKey: 'pages:faq.questions.3.0.q', answerKey: 'pages:faq.questions.3.0.a' },
      { questionKey: 'pages:faq.questions.3.1.q', answerKey: 'pages:faq.questions.3.1.a' },
      { questionKey: 'pages:faq.questions.3.2.q', answerKey: 'pages:faq.questions.3.2.a' },
    ],
  },
  {
    titleKey: 'pages:faq.sections.account',
    items: [
      { questionKey: 'pages:faq.questions.4.0.q', answerKey: 'pages:faq.questions.4.0.a' },
      { questionKey: 'pages:faq.questions.4.1.q', answerKey: 'pages:faq.questions.4.1.a' },
      { questionKey: 'pages:faq.questions.4.2.q', answerKey: 'pages:faq.questions.4.2.a' },
    ],
  },
];
