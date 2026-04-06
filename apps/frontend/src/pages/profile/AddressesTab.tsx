import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Trash2 } from 'lucide-react';
import { Button } from '@components/ui/Button';
import { Modal } from '@components/ui/Modal';
import { Badge } from '@components/ui/Badge';
import { addressesApi, type Address, type AddressInput } from '@api/addresses';
import { ApiException } from '@api/client';
import { useConfirmModal } from '@hooks/useConfirmModal';

const COUNTRIES = [
  'Sweden',
  'Germany',
  'France',
  'United Kingdom',
  'Netherlands',
  'Spain',
  'Italy',
  'Norway',
  'Denmark',
  'Finland',
  'Poland',
  'United States',
];

export interface AddressesTabProps {
  toast: (type: 'success' | 'error' | 'warning' | 'info', message: string) => void;
}

export function AddressesTab({ toast }: AddressesTabProps) {
  const { t } = useTranslation('profile');

  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const deleteAddressConfirm = useConfirmModal<Address>();
  const [addressForm, setAddressForm] = useState<AddressInput>({
    name: '',
    street: '',
    city: '',
    zip: '',
    country: 'Sweden',
    isDefault: false,
  });
  const [savingAddress, setSavingAddress] = useState(false);
  const [addressErrors, setAddressErrors] = useState<Record<string, string>>({});

  const { data: addresses, refetch: refetchAddresses } = useQuery({
    queryKey: ['addresses'],
    queryFn: async () => {
      try {
        return await addressesApi.list();
      } catch {
        return [] as Address[];
      }
    },
  });

  const handleOpenAddressModal = (address?: Address) => {
    if (address) {
      setEditingAddress(address);
      setAddressForm({
        name: address.name,
        street: address.street,
        city: address.city,
        zip: address.zip,
        country: address.country,
        isDefault: address.isDefault,
      });
    } else {
      setEditingAddress(null);
      setAddressForm({
        name: '',
        street: '',
        city: '',
        zip: '',
        country: 'Sweden',
        isDefault: false,
      });
    }
    setAddressModalOpen(true);
  };

  const handleSaveAddress = async () => {
    const { validateField: vf, hasDangerousContent: hdc } = await import('@utils/validation');
    const errs: Record<string, string> = {};
    const nameErr = vf(addressForm.name, {
      required: true,
      minLength: 2,
      maxLength: 50,
      fieldName: t('addresses.form.name'),
    });
    if (nameErr) errs.name = nameErr;
    const streetErr = vf(addressForm.street, {
      required: true,
      minLength: 5,
      maxLength: 100,
      fieldName: t('addresses.form.street'),
    });
    if (streetErr) errs.street = streetErr;
    const cityErr = vf(addressForm.city, {
      required: true,
      minLength: 2,
      maxLength: 50,
      fieldName: t('addresses.form.city'),
    });
    if (cityErr) errs.city = cityErr;
    const zipErr = vf(addressForm.zip, {
      required: true,
      minLength: 3,
      maxLength: 10,
      fieldName: t('addresses.form.zip'),
    });
    if (zipErr) errs.zip = zipErr;
    for (const [key, val] of Object.entries(addressForm)) {
      if (typeof val === 'string' && hdc(val)) {
        errs[key] = t('addresses.validation.dangerousContent');
      }
    }
    setAddressErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSavingAddress(true);
    try {
      if (editingAddress) {
        await addressesApi.update(editingAddress.id, addressForm);
      } else {
        await addressesApi.create(addressForm);
      }
      await refetchAddresses();
      setAddressModalOpen(false);
      toast('success', editingAddress ? t('toast.addressUpdated') : t('toast.addressAdded'));
    } catch (err) {
      toast(
        'error',
        err instanceof ApiException ? err.message : t('common:errors.generic', { ns: 'common' })
      );
    } finally {
      setSavingAddress(false);
    }
  };

  const handleDeleteAddress = async () => {
    if (!deleteAddressConfirm.target) return;
    try {
      await addressesApi.remove(deleteAddressConfirm.target.id);
      await refetchAddresses();
      toast('success', t('toast.addressDeleted'));
    } catch (err) {
      toast(
        'error',
        err instanceof ApiException ? err.message : t('common:errors.generic', { ns: 'common' })
      );
    } finally {
      deleteAddressConfirm.close();
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await addressesApi.setDefault(id);
      await refetchAddresses();
      toast('success', t('toast.defaultAddressUpdated'));
    } catch (err) {
      toast(
        'error',
        err instanceof ApiException ? err.message : t('common:errors.generic', { ns: 'common' })
      );
    }
  };

  return (
    <div data-testid="tab-panel-addresses">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-[var(--text-primary)]">{t('addresses.title')}</h2>
        <Button
          data-testid="add-address-button"
          size="sm"
          onClick={() => handleOpenAddressModal()}
          disabled={(addresses?.length ?? 0) >= 5}
        >
          + {t('addresses.add')}
        </Button>
      </div>

      {!addresses?.length ? (
        <div
          data-testid="addresses-empty"
          className="flex flex-col items-center justify-center py-16 gap-3"
        >
          <MapPin className="h-16 w-16 text-[var(--text-secondary)]" />
          <p className="text-[var(--text-primary)] font-medium">{t('addresses.empty')}</p>
          <p className="text-sm text-[var(--text-secondary)]">{t('addresses.emptyHint')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map((addr, index) => (
            <div
              key={addr.id}
              data-testid={`address-card-${index}`}
              className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 relative"
            >
              {addr.isDefault && (
                <div data-testid="address-default-badge" className="absolute top-3 right-3">
                  <Badge>{t('addresses.default')}</Badge>
                </div>
              )}
              <p className="font-medium text-sm text-[var(--text-primary)]">{addr.name}</p>
              <p className="text-sm text-[var(--text-secondary)] mt-1">{addr.street}</p>
              <p className="text-sm text-[var(--text-secondary)]">
                {addr.zip} {addr.city}
              </p>
              <p className="text-sm text-[var(--text-secondary)]">{addr.country}</p>
              <div className="flex gap-2 mt-3 pt-3 border-t border-[var(--border)]">
                <Button
                  data-testid={`address-edit-${index}`}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleOpenAddressModal(addr)}
                >
                  {t('common:actions.edit', { ns: 'common' })}
                </Button>
                <Button
                  data-testid={`address-delete-${index}`}
                  variant="ghost"
                  size="sm"
                  className="text-red-500"
                  onClick={() => deleteAddressConfirm.open(addr)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {t('addresses.delete')}
                </Button>
                {!addr.isDefault && (
                  <Button
                    data-testid={`address-set-default-${index}`}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSetDefault(addr.id)}
                  >
                    {t('addresses.setDefault')}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Address Form Modal */}
      <Modal
        open={addressModalOpen}
        title={editingAddress ? t('addresses.edit') : t('addresses.add')}
        onConfirm={handleSaveAddress}
        onCancel={() => setAddressModalOpen(false)}
        confirmLabel={t('common:actions.save', { ns: 'common' })}
        cancelLabel={t('common:actions.cancel', { ns: 'common' })}
        loading={savingAddress}
      >
        <div data-testid="address-modal">
          <form data-testid="address-form" className="space-y-3" onSubmit={e => e.preventDefault()}>
            <div>
              <label className="text-xs font-medium text-[var(--text-secondary)]">
                {t('addresses.form.name')}
              </label>
              <input
                data-testid="address-name-input"
                value={addressForm.name}
                onChange={e => {
                  setAddressForm(f => ({ ...f, name: e.target.value }));
                  setAddressErrors(p => ({ ...p, name: '' }));
                }}
                className={`mt-1 w-full rounded-lg border bg-[var(--bg-card)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent ${addressErrors.name ? 'border-red-500' : 'border-[var(--border)]'}`}
                maxLength={50}
              />
              {addressErrors.name && (
                <p data-testid="address-name-error" className="text-xs text-red-500 mt-1">
                  {addressErrors.name}
                </p>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--text-secondary)]">
                {t('addresses.form.street')}
              </label>
              <input
                data-testid="address-street-input"
                value={addressForm.street}
                onChange={e => {
                  setAddressForm(f => ({ ...f, street: e.target.value }));
                  setAddressErrors(p => ({ ...p, street: '' }));
                }}
                className={`mt-1 w-full rounded-lg border bg-[var(--bg-card)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent ${addressErrors.street ? 'border-red-500' : 'border-[var(--border)]'}`}
                maxLength={100}
              />
              {addressErrors.street && (
                <p data-testid="address-street-error" className="text-xs text-red-500 mt-1">
                  {addressErrors.street}
                </p>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-[var(--text-secondary)]">
                  {t('addresses.form.city')}
                </label>
                <input
                  data-testid="address-city-input"
                  value={addressForm.city}
                  onChange={e => {
                    setAddressForm(f => ({ ...f, city: e.target.value }));
                    setAddressErrors(p => ({ ...p, city: '' }));
                  }}
                  className={`mt-1 w-full rounded-lg border bg-[var(--bg-card)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent ${addressErrors.city ? 'border-red-500' : 'border-[var(--border)]'}`}
                  maxLength={50}
                />
                {addressErrors.city && (
                  <p data-testid="address-city-error" className="text-xs text-red-500 mt-1">
                    {addressErrors.city}
                  </p>
                )}
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--text-secondary)]">
                  {t('addresses.form.zip')}
                </label>
                <input
                  data-testid="address-zip-input"
                  value={addressForm.zip}
                  onChange={e => {
                    setAddressForm(f => ({ ...f, zip: e.target.value }));
                    setAddressErrors(p => ({ ...p, zip: '' }));
                  }}
                  className={`mt-1 w-full rounded-lg border bg-[var(--bg-card)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent ${addressErrors.zip ? 'border-red-500' : 'border-[var(--border)]'}`}
                  maxLength={10}
                />
                {addressErrors.zip && (
                  <p data-testid="address-zip-error" className="text-xs text-red-500 mt-1">
                    {addressErrors.zip}
                  </p>
                )}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--text-secondary)]">
                {t('addresses.form.country')}
              </label>
              <select
                data-testid="address-country-select"
                value={addressForm.country}
                onChange={e => setAddressForm(f => ({ ...f, country: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                required
              >
                {COUNTRIES.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <label
              data-testid="address-default-checkbox"
              className="flex items-center gap-2 text-sm cursor-pointer"
            >
              <input
                type="checkbox"
                checked={addressForm.isDefault ?? false}
                onChange={e => setAddressForm(f => ({ ...f, isDefault: e.target.checked }))}
                className="rounded"
              />
              {t('addresses.form.isDefault')}
            </label>
          </form>
        </div>
      </Modal>

      {/* Delete confirmation */}
      <Modal
        open={deleteAddressConfirm.isOpen}
        title={t('addresses.delete')}
        onConfirm={handleDeleteAddress}
        onCancel={() => deleteAddressConfirm.close()}
        confirmLabel={t('addresses.delete')}
        cancelLabel={t('common:actions.cancel', { ns: 'common' })}
        danger
      >
        <p>
          {t('addresses.form.name')}: {deleteAddressConfirm.target?.name}
        </p>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          {deleteAddressConfirm.target?.street}, {deleteAddressConfirm.target?.city}
        </p>
      </Modal>
    </div>
  );
}
