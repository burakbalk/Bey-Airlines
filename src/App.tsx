import { Suspense } from "react";
import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./router";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import { AuthProvider } from "./contexts/AuthContext";
import { useFlightInit } from "./hooks/useFlightInit";
import { useDataInit } from "./hooks/useDataInit";

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <i className="ri-loader-4-line animate-spin text-4xl text-red-600"></i>
    </div>
  );
}

function FlightInitWrapper({ children }: { children: React.ReactNode }) {
  useFlightInit();
  useDataInit();
  return <>{children}</>;
}

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <AuthProvider>
        <BrowserRouter basename={__BASE_PATH__}>
          <FlightInitWrapper>
            <Suspense fallback={<PageLoader />}>
              <AppRoutes />
            </Suspense>
          </FlightInitWrapper>
        </BrowserRouter>
      </AuthProvider>
    </I18nextProvider>
  );
}

export default App;
