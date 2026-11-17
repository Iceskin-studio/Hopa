import React from 'react';
import { useTranslation } from 'react-i18next';

export default function LanguageToggle() {
  const { i18n, t } = useTranslation();

  const toggle = () => {
    const next = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(next);
  };

  return (
    <button
      onClick={toggle}
      className="px-3 py-1 border rounded hover:bg-gray-100"
    >
      {t('language')}: {i18n.language.toUpperCase()}
    </button>
  );
}
