interface Flight {
  flightNumber: string;
  from: string;
  to: string;
  date: string;
  departureTime: string;
  arrivalTime: string;
  estimatedDeparture: string;
  estimatedArrival: string;
  status: string;
  gate: string;
  terminal: string;
  flightType: string;
}

interface StatusCardProps {
  flight: Flight;
}

export default function StatusCard({ flight }: StatusCardProps) {
  const getStatusBadge = (status: string) => {
    const badges = {
      zamaninda: {
        bg: 'bg-green-100',
        text: 'text-green-700',
        icon: 'ri-check-line',
        label: 'Zamanında'
      },
      gecikmeli: {
        bg: 'bg-orange-100',
        text: 'text-orange-700',
        icon: 'ri-time-line',
        label: 'Gecikmeli'
      },
      iptal: {
        bg: 'bg-red-100',
        text: 'text-red-700',
        icon: 'ri-close-line',
        label: 'İptal Edildi'
      },
      kalkti: {
        bg: 'bg-blue-100',
        text: 'text-blue-700',
        icon: 'ri-flight-takeoff-line',
        label: 'Kalktı'
      },
      indi: {
        bg: 'bg-purple-100',
        text: 'text-purple-700',
        icon: 'ri-flight-land-line',
        label: 'İndi'
      }
    };

    const badge = badges[status as keyof typeof badges] || badges.zamaninda;

    return (
      <span className={`inline-flex items-center px-4 py-2 rounded-full font-semibold ${badge.bg} ${badge.text}`}>
        <i className={`${badge.icon} mr-2`}></i>
        {badge.label}
      </span>
    );
  };

  const isVip = flight.flightType === 'vip';

  return (
    <div className={`bg-white rounded-lg shadow-lg p-3 sm:p-6 border-2 ${isVip ? 'border-amber-400' : 'border-red-600'}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h3 className="text-2xl font-bold text-gray-900">{flight.flightNumber}</h3>
          {isVip && (
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-white text-sm font-semibold">
              <i className="ri-vip-crown-line mr-1"></i>
              VIP
            </span>
          )}
        </div>
        {getStatusBadge(flight.status)}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div>
          <div className="text-gray-500 text-sm mb-1">Kalkış</div>
          <div className="text-xl font-bold text-gray-900">{flight.from}</div>
          <div className="text-gray-600 mt-1">
            Planlanan: <span className="font-semibold">{flight.departureTime}</span>
          </div>
          <div className="text-gray-600">
            Tahmini: <span className="font-semibold text-red-600">{flight.estimatedDeparture}</span>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <div className="text-center">
            <i className="ri-flight-takeoff-line text-4xl text-red-600 mb-2"></i>
            <div className="text-gray-500 text-sm">{flight.date}</div>
          </div>
        </div>

        <div>
          <div className="text-gray-500 text-sm mb-1">Varış</div>
          <div className="text-xl font-bold text-gray-900">{flight.to}</div>
          <div className="text-gray-600 mt-1">
            Planlanan: <span className="font-semibold">{flight.arrivalTime}</span>
          </div>
          <div className="text-gray-600">
            Tahmini: <span className="font-semibold text-red-600">{flight.estimatedArrival}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 pt-6 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
            <i className="ri-door-open-line text-xl text-red-600"></i>
          </div>
          <div>
            <div className="text-gray-500 text-sm">Kapı</div>
            <div className="text-lg font-bold text-gray-900">{flight.gate}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
            <i className="ri-building-line text-xl text-red-600"></i>
          </div>
          <div>
            <div className="text-gray-500 text-sm">Terminal</div>
            <div className="text-lg font-bold text-gray-900">{flight.terminal}</div>
          </div>
        </div>
      </div>
    </div>
  );
}