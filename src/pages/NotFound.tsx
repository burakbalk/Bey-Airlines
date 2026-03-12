import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="relative flex flex-col items-center justify-center h-screen text-center px-4 bg-gray-50">
      <h1 className="absolute bottom-0 text-9xl md:text-[12rem] font-black text-gray-100 select-none pointer-events-none z-0">
        404
      </h1>
      <div className="relative z-10">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <i className="ri-plane-line text-4xl text-red-600"></i>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Sayfa Bulunamadı</h1>
        <p className="text-lg text-gray-500 mb-8 max-w-md">
          Aradığınız sayfa mevcut değil veya kaldırılmış olabilir.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors shadow-lg"
        >
          <i className="ri-home-line"></i>
          Anasayfaya Dön
        </Link>
      </div>
    </div>
  );
}
