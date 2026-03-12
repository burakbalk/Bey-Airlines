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
    
    navigate(`/ucus-rezervasyon?flightId=${flight.id}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${date}&price=${flight.price}`);
  };

  return (
    <div className={`rounded-2xl p-3 sm:p-6 shadow-md hover:shadow-lg transition-all border-l-4 border border-gray-100 ${isVip ? 'bg-amber-50 border-l-amber-500' : 'bg-white border-l-primary'}`}>
      {/* Class badge */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold text-gray-400 tracking-wider">{flight.flightNumber}</span>
        {isVip ? (
          <span className="flex items-center gap-1 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
            <i className="ri-vip-crown-fill"></i> VIP
          </span>
        ) : (
          <span className="flex items-center gap-1 bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
            <i className="ri-plane-line"></i> Normal
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-12 gap-2 sm:gap-4 items-center">
        {/* Departure */}
        <div className="sm:col-span-3">
          <p className="text-xl sm:text-2xl font-bold text-gray-900">{flight.departure.time}</p>
          <p className="text-sm sm:text-base font-semibold text-primary mt-1">{flight.departure.airport}</p>
          <p className="text-xs sm:text-sm text-gray-400">{flight.departure.city}</p>
        </div>

        {/* Route line */}
        <div className="sm:col-span-3 flex flex-col items-center">
          <p className="text-xs text-gray-400 mb-2">{flight.duration}</p>
          <div className="w-full flex items-center">
            <div className="flex-1 border-t-2 border-dashed border-gray-300"></div>
            <div className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center mx-1 sm:mx-2 bg-primary/10 rounded-full">
              <i className="ri-plane-line text-sm sm:text-base text-primary"></i>
            </div>
            <div className="flex-1 border-t-2 border-dashed border-gray-300"></div>
          </div>
          <span className="mt-2 px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 whitespace-nowrap">
            {flight.type}
          </span>
        </div>

        {/* Arrival */}
        <div className="sm:col-span-3 text-right sm:text-left">
          <p className="text-xl sm:text-2xl font-bold text-gray-900">{flight.arrival.time}</p>
          <p className="text-sm sm:text-base font-semibold text-primary mt-1">{flight.arrival.airport}</p>
          <p className="text-xs sm:text-sm text-gray-400">{flight.arrival.city}</p>
        </div>

        {/* Price & CTA */}
        <div className="col-span-3 sm:col-span-3 flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 sm:gap-0 mt-3 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100">
          <div className="sm:text-right">
            <p className="text-2xl sm:text-3xl font-bold text-primary">{flight.price.toLocaleString('tr-TR')} TL</p>
            <p className="text-xs text-gray-400 mt-1">kişi başı</p>
            <div className="flex gap-2 mt-2 sm:mt-3 sm:justify-end">
              <div className="flex items-center gap-1" title={flight.baggage ? 'Bagaj Dahil' : 'Bagaj Yok'}>
                <i className={`ri-luggage-cart-line text-base ${flight.baggage ? 'text-green-500' : 'text-gray-300'}`}></i>
              </div>
              <div className="flex items-center gap-1" title={flight.meal ? 'Yemek Dahil' : 'Yemek Yok'}>
                <i className={`ri-restaurant-line text-base ${flight.meal ? 'text-green-500' : 'text-gray-300'}`}></i>
              </div>
              <div className="flex items-center gap-1" title={flight.changeable ? 'Değiştirilebilir' : 'Değiştirilemez'}>
                <i className={`ri-refresh-line text-base ${flight.changeable ? 'text-green-500' : 'text-gray-300'}`}></i>
              </div>
            </div>
          </div>
          <button
            onClick={handleSelectFlight}
            className={`sm:w-full mt-0 sm:mt-3 font-semibold py-3 px-6 sm:px-0 rounded-xl transition-colors whitespace-nowrap cursor-pointer text-sm ${isVip ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'bg-primary hover:bg-red-700 text-white'}`}
          >
            Seç
          </button>
        </div>
      </div>
    </div>
  );
}
