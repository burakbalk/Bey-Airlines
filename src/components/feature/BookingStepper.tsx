interface Step {
  label: string;
  sublabel: string;
  icon: string;
}

const STEPS: Step[] = [
  { label: 'Yolcu Bilgileri', sublabel: 'Kimlik ve iletişim', icon: 'ri-user-line' },
  { label: 'Koltuk Seçimi', sublabel: 'Uçuş kabini', icon: 'ri-layout-grid-line' },
  { label: 'Ek Hizmetler', sublabel: 'Bagaj, yemek', icon: 'ri-service-line' },
  { label: 'Ödeme', sublabel: 'Güvenli ödeme', icon: 'ri-secure-payment-line' },
];

interface BookingStepperProps {
  currentStep: 1 | 2 | 3 | 4;
}

export default function BookingStepper({ currentStep }: BookingStepperProps) {
  return (
    <div className="bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => {
            const stepNum = index + 1;
            const isDone = stepNum < currentStep;
            const isActive = stepNum === currentStep;
            const isPending = stepNum > currentStep;

            return (
              <div key={stepNum} className="flex items-center flex-1">
                {/* Step */}
                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                  <div
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                      isDone
                        ? 'bg-green-500 text-white'
                        : isActive
                        ? 'bg-primary text-white shadow-md shadow-red-200'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {isDone ? (
                      <i className="ri-check-line text-base font-bold"></i>
                    ) : (
                      <i className={`${step.icon} text-base`}></i>
                    )}
                  </div>
                  <div className="hidden sm:block">
                    <p className={`text-sm font-semibold leading-tight ${isActive ? 'text-primary' : isDone ? 'text-green-600' : 'text-gray-400'}`}>
                      {step.label}
                    </p>
                    <p className={`text-xs mt-0.5 ${isActive ? 'text-gray-500' : 'text-gray-400'}`}>
                      {isDone ? 'Tamamlandı' : step.sublabel}
                    </p>
                  </div>
                </div>

                {/* Connector line (not after last step) */}
                {index < STEPS.length - 1 && (
                  <div className="flex-1 mx-2 sm:mx-4">
                    <div className={`h-0.5 rounded-full transition-all ${isDone ? 'bg-green-400' : 'bg-gray-200'}`}></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
