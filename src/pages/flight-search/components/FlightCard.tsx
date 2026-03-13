import { useNavigate, useSearchParams } from 'react-router-dom';

interface FlightCardProps {
  flight: {
    id: number;
    flightNumber: string;
    flightClass: string;
    departure: { time: string; airport: string; city: string };
    arrival: { time: string; airport: string; city: string };
    duration: string;
    type: string;
    price: number;
    baggage: boolean;
    meal: boolean;
    changeable: boolean;
  };
}

export default function FlightCard({ flight }: FlightCardProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isVip = flight.flightClass === 'vip';

  const handleSelectFlight = () => {
    const from = searchParams.get('from') || flight.departure.city;
    const to = searchParams.get('to') || flight.arrival.city;
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    navigate(
      `/ucus-rezervasyon?flightId=${flight.id}` +
      `&from=${encodeURIComponent(from)}` +
      `&to=${encodeURIComponent(to)}` +
      `&date=${date}` +
      `&price=${flight.price}` +
      `&flightNumber=${encodeURIComponent(flight.flightNumber)}` +
      `&departureTime=${encodeURIComponent(flight.departure.time)}` +
      `&flightClass=${encodeURIComponent(flight.flightClass)}` +
      `&duration=${encodeURIComponent(flight.duration)}`
    );
  };

  return (
    <div
      className={`rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border ${
        isVip
          ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 hover:border-amber-300'
          : 'bg-white border-gray-100 hover:border-red-100'
      }`}
    >
      {/* VIP banner */}
      {isVip && (
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-1.5 flex items-center gap-2">
          <i className="ri-vip-crown-fill text-white text-sm"></i>
          <span className="text-white text-xs font-bold tracking-widest uppercase">VIP Sınıfı</span>
          <span className="ml-auto text-amber-100 text-xs">Premium Konfor</span>
        </div>
      )}

      <div className="p-4 sm:p-5">
        {/* Top row: flight number + class + direct badge */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isVip ? 'bg-amber-100' : 'bg-red-50'}`}>
              <img src="/logo.png" alt="Bey Airlines" className="w-5 h-5 object-contain" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-700 leading-none">Bey Airlines</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{flight.flightNumber}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
              flight.type === 'Direkt'
                ? 'bg-green-100 text-green-700'
                : 'bg-blue-100 text-blue-700'
            }`}>
              <i className={`${flight.type === 'Direkt' ? 'ri-arrow-right-line' : 'ri-route-line'} text-xs`}></i>
              {flight.type}
            </span>
            {!isVip && (
              <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full font-medium">
                Ekonomi
              </span>
            )}
          </div>
        </div>

        {/* Main flight info */}
        <div className="grid grid-cols-12 gap-3 items-center">
          {/* Departure */}
          <div className="col-span-4">
            <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-none">{flight.departure.time}</p>
            <p className={`text-sm font-bold mt-1.5 ${isVip ? 'text-amber-600' : 'text-primary'}`}>
              {flight.departure.airport}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">{flight.departure.city}</p>
          </div>

          {/* Route visualization */}
          <div className="col-span-4 flex flex-col items-center gap-1.5">
            <p className="text-xs font-semibold text-gray-500 bg-gray-50 px-2.5 py-0.5 rounded-full">
              {flight.duration}
            </p>
            <div className="w-full flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full border-2 flex-shrink-0 ${isVip ? 'border-amber-400' : 'border-primary'}`}></div>
              <div className={`flex-1 h-px ${isVip ? 'bg-amber-300' : 'bg-red-200'} relative`}>
                <div className={`absolute inset-0 border-t border-dashed ${isVip ? 'border-amber-300' : 'border-red-300'}`}></div>
              </div>
              <div className={`flex-shrink-0 ${isVip ? 'text-amber-500' : 'text-primary'}`}>
                <i className="ri-plane-fill text-base transform rotate-0"></i>
              </div>
              <div className={`flex-1 h-px ${isVip ? 'bg-amber-300' : 'bg-red-200'} relative`}>
                <div className={`absolute inset-0 border-t border-dashed ${isVip ? 'border-amber-300' : 'border-red-300'}`}></div>
              </div>
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isVip ? 'bg-amber-400' : 'bg-primary'}`}></div>
            </div>
          </div>

          {/* Arrival */}
          <div className="col-span-4 text-right">
            <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-none">{flight.arrival.time}</p>
            <p className={`text-sm font-bold mt-1.5 ${isVip ? 'text-amber-600' : 'text-primary'}`}>
              {flight.arrival.airport}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">{flight.arrival.city}</p>
          </div>
        </div>

        {/* Bottom row: services + price + button */}
        <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4 pt-4 border-t ${isVip ? 'border-amber-100' : 'border-gray-100'}`}>
          {/* Service badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-medium ${
              flight.baggage ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-400 line-through'
            }`}>
              <i className={`ri-luggage-cart-line ${flight.baggage ? 'text-green-500' : 'text-gray-300'}`}></i>
              Bagaj
            </span>
            <span className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-medium ${
              flight.meal ? 'bg-orange-50 text-orange-700' : 'bg-gray-50 text-gray-400 line-through'
            }`}>
              <i className={`ri-restaurant-line ${flight.meal ? 'text-orange-500' : 'text-gray-300'}`}></i>
              Yemek
            </span>
            <span className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-medium ${
              flight.changeable ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-400 line-through'
            }`}>
              <i className={`ri-refresh-line ${flight.changeable ? 'text-blue-500' : 'text-gray-300'}`}></i>
              Değişim
            </span>
          </div>

          {/* Price + CTA */}
          <div className="flex items-center gap-4 sm:flex-shrink-0">
            <div className="text-right">
              <p className="text-[10px] text-gray-400 leading-none mb-0.5">kişi başı</p>
              <p className={`text-2xl font-extrabold leading-none ${isVip ? 'text-amber-600' : 'text-primary'}`}>
                {flight.price.toLocaleString('tr-TR')} ₺
              </p>
            </div>
            <button
              onClick={handleSelectFlight}
              className={`flex-shrink-0 font-bold py-3 px-6 rounded-xl transition-all cursor-pointer text-sm flex items-center gap-2 shadow-sm hover:shadow-md active:scale-[0.97] ${
                isVip
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white'
                  : 'bg-gradient-to-r from-primary to-secondary hover:from-primary-dark hover:to-primary text-white'
              }`}
            >
              Seç
              <i className="ri-arrow-right-line text-sm"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
