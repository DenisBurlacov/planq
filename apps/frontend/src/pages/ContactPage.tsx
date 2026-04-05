import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import { useToast } from '@components/ui/Toast';

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

export function ContactPage() {
  const { t } = useTranslation('pages');
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [sending, setSending] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validate = (): FormErrors => {
    const e: FormErrors = {};
    if (!name.trim()) e.name = t('contact.validation.nameRequired');
    else if (name.trim().length < 2) e.name = t('contact.validation.nameMin');
    if (!email.trim()) e.email = t('contact.validation.emailRequired');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      e.email = t('contact.validation.emailInvalid');
    if (!subject) e.subject = t('contact.validation.subjectRequired');
    if (!message.trim()) e.message = t('contact.validation.messageRequired');
    else if (message.trim().length < 10) e.message = t('contact.validation.messageMin');
    return e;
  };

  const isValid = Object.keys(validate()).length === 0;

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    setErrors(validate());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    setTouched({ name: true, email: true, subject: true, message: true });
    if (Object.keys(validationErrors).length > 0) return;

    setSending(true);
    // Simulate sending
    await new Promise(resolve => setTimeout(resolve, 800));
    setSending(false);
    toast('success', t('contact.successMessage'));
    setName('');
    setEmail('');
    setSubject('');
    setMessage('');
    setTouched({});
    setErrors({});
  };

  const subjects = ['general', 'order', 'product', 'feedback', 'other'] as const;

  const inputClass = (hasError: boolean) =>
    `w-full rounded-lg border ${hasError ? 'border-red-500' : 'border-[var(--border)]'} bg-[var(--bg-card)] px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-accent`;

  return (
    <div data-testid="contact-page" className="max-w-5xl mx-auto">
      <h1
        data-testid="contact-title"
        className="text-2xl font-bold text-[var(--text-primary)] mb-2"
      >
        {t('contact.title')}
      </h1>
      <p className="text-sm text-[var(--text-secondary)] mb-8">{t('contact.subtitle')}</p>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Form */}
        <div className="md:col-span-2">
          <form
            data-testid="contact-form"
            onSubmit={handleSubmit}
            className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6 space-y-4"
          >
            <div>
              <label className="text-sm font-medium text-[var(--text-primary)] mb-1 block">
                {t('contact.name')}
              </label>
              <input
                data-testid="contact-name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                onBlur={() => handleBlur('name')}
                placeholder={t('contact.namePlaceholder')}
                className={inputClass(!!touched.name && !!errors.name)}
              />
              {touched.name && errors.name && (
                <p data-testid="contact-name-error" className="text-xs text-red-500 mt-1">
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-[var(--text-primary)] mb-1 block">
                {t('contact.email')}
              </label>
              <input
                data-testid="contact-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onBlur={() => handleBlur('email')}
                placeholder={t('contact.emailPlaceholder')}
                className={inputClass(!!touched.email && !!errors.email)}
              />
              {touched.email && errors.email && (
                <p data-testid="contact-email-error" className="text-xs text-red-500 mt-1">
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-[var(--text-primary)] mb-1 block">
                {t('contact.subject')}
              </label>
              <select
                data-testid="contact-subject"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                onBlur={() => handleBlur('subject')}
                className={inputClass(!!touched.subject && !!errors.subject)}
              >
                <option value="">{t('contact.subjectPlaceholder')}</option>
                {subjects.map(s => (
                  <option key={s} value={s}>
                    {t(`contact.subjects.${s}`)}
                  </option>
                ))}
              </select>
              {touched.subject && errors.subject && (
                <p data-testid="contact-subject-error" className="text-xs text-red-500 mt-1">
                  {errors.subject}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-[var(--text-primary)] mb-1 block">
                {t('contact.message')}
              </label>
              <textarea
                data-testid="contact-message"
                value={message}
                onChange={e => setMessage(e.target.value)}
                onBlur={() => handleBlur('message')}
                placeholder={t('contact.messagePlaceholder')}
                rows={5}
                className={`${inputClass(!!touched.message && !!errors.message)} resize-none`}
              />
              {touched.message && errors.message && (
                <p data-testid="contact-message-error" className="text-xs text-red-500 mt-1">
                  {errors.message}
                </p>
              )}
            </div>

            <button
              data-testid="contact-submit"
              type="submit"
              disabled={!isValid || sending}
              className="w-full rounded-lg bg-accent text-white px-5 py-2.5 text-sm font-medium hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? t('contact.sending') : t('contact.send')}
            </button>
          </form>
        </div>

        {/* Contact info */}
        <div
          data-testid="contact-info"
          className="rounded-xl bg-[var(--bg-sidebar)] border border-[var(--border)] p-6 space-y-5 h-fit"
        >
          <div data-testid="contact-info-email" className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-accent shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)]">
                {t('contact.info.emailLabel')}
              </p>
              <p className="text-sm text-[var(--text-secondary)]">{t('contact.info.emailValue')}</p>
            </div>
          </div>

          <div data-testid="contact-info-phone" className="flex items-start gap-3">
            <Phone className="h-5 w-5 text-accent shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)]">
                {t('contact.info.phoneLabel')}
              </p>
              <p className="text-sm text-[var(--text-secondary)]">{t('contact.info.phoneValue')}</p>
            </div>
          </div>

          <div data-testid="contact-info-address" className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-accent shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)]">
                {t('contact.info.addressLabel')}
              </p>
              <p className="text-sm text-[var(--text-secondary)]">
                {t('contact.info.addressValue')}
              </p>
            </div>
          </div>

          <div data-testid="contact-info-hours" className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-accent shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)]">
                {t('contact.info.hoursLabel')}
              </p>
              <p className="text-sm text-[var(--text-secondary)]">{t('contact.info.hoursValue')}</p>
            </div>
          </div>

          {/* Map placeholder */}
          <div
            data-testid="contact-map-placeholder"
            className="rounded-lg bg-[var(--bg-page)] border border-[var(--border)] h-48 flex items-center justify-center"
          >
            <MapPin className="h-8 w-8 text-[var(--text-secondary)]" />
          </div>
        </div>
      </div>
    </div>
  );
}
