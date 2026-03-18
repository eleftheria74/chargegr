import { Plug, Zap } from 'lucide-react';
import type { Connector } from '@/lib/types';
import { CONNECTOR_LABELS } from '@/lib/charging';

interface Props {
  connector: Connector;
}

export default function ConnectorInfo({ connector }: Props) {
  const label = CONNECTOR_LABELS[connector.type] || connector.type;
  const isDC = connector.currentType === 'DC';

  return (
    <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg max-w-full">
      <div className="flex items-center gap-2 min-w-0">
        {isDC ? (
          <Zap size={18} className="text-orange-500 shrink-0" />
        ) : (
          <Plug size={18} className="text-green-600 shrink-0" />
        )}
        <div className="min-w-0">
          <span className="font-semibold text-sm text-gray-700">{label}</span>
          <span className="ml-1.5 text-xs font-semibold text-gray-700">{connector.currentType}</span>
        </div>
      </div>
      <div className="text-right shrink-0 ml-2">
        <span className="font-bold text-sm text-gray-700">{connector.powerKw} kW</span>
        <span className="ml-1.5 text-xs font-semibold text-gray-700">&times;{connector.quantity}</span>
      </div>
    </div>
  );
}
