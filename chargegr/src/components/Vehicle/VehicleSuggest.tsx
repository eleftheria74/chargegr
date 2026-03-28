'use client';

import { useState } from 'react';
import { X, Loader2, Send } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { useAppStore } from '@/store/appStore';

interface Props {
  open: boolean;
  onClose: () => void;
}

const BASE_URL = '/api';

export default function VehicleSuggest({ open, onClose }: Props) {
  const { t } = useTranslation();
  const user = useAppStore(s => s.user);
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [batteryKwh, setBatteryKwh] = useState('');
  const [maxChargingKw, setMaxChargingKw] = useState('');
  const [connectorType, setConnectorType] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!open) return null;

  const handleSubmit = async () => {
    if (!brand.trim() || !model.trim()) {
      setError(t('vehicle.suggestRequired'));
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const jwt = localStorage.getItem('chargegr_jwt');
      const res = await fetch(`${BASE_URL}/vehicles/suggest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`,
        },
        body: JSON.stringify({
          brand: brand.trim(),
          model: model.trim(),
          batteryKwh: batteryKwh ? parseFloat(batteryKwh) : undefined,
          maxChargingKw: maxChargingKw ? parseFloat(maxChargingKw) : undefined,
          connectorType: connectorType || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed');
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setBrand('');
        setModel('');
        setBatteryKwh('');
        setMaxChargingKw('');
        setConnectorType('');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{t('vehicle.suggestTitle')}</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {success ? (
          <div className="p-6 text-center">
            <p className="text-green-600 font-medium text-lg">{t('vehicle.suggestSuccess')}</p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {!user && (
              <p className="text-sm text-amber-600 bg-amber-50 rounded-lg p-3">
                {t('auth.signIn')}
              </p>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('vehicle.brand')} *</label>
              <input
                type="text"
                value={brand}
                onChange={e => setBrand(e.target.value)}
                placeholder="e.g. Tesla"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('vehicle.model')} *</label>
              <input
                type="text"
                value={model}
                onChange={e => setModel(e.target.value)}
                placeholder="e.g. Model 3 Long Range"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('vehicle.battery')} (kWh)</label>
                <input
                  type="number"
                  value={batteryKwh}
                  onChange={e => setBatteryKwh(e.target.value)}
                  placeholder="e.g. 60"
                  step="0.1"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max charging (kW)</label>
                <input
                  type="number"
                  value={maxChargingKw}
                  onChange={e => setMaxChargingKw(e.target.value)}
                  placeholder="e.g. 250"
                  step="0.1"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('station.connectors')}</label>
              <select
                value={connectorType}
                onChange={e => setConnectorType(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              >
                <option value="">--</option>
                <option value="CCS2">CCS2</option>
                <option value="Type 2">Type 2</option>
                <option value="CHAdeMO">CHAdeMO</option>
                <option value="Type 1">Type 1</option>
                <option value="Tesla">Tesla</option>
              </select>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              onClick={handleSubmit}
              disabled={submitting || !user}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-medium py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {submitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
              {t('vehicle.suggestSubmit')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
