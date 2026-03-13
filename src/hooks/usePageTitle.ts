import { useEffect } from 'react';

const BASE_TITLE = 'Bey Airlines';

export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = title ? `${title} | ${BASE_TITLE}` : BASE_TITLE;
    return () => {
      document.title = `${BASE_TITLE} - Türkiye'nin Yeni Nesil Havayolu`;
    };
  }, [title]);
}
