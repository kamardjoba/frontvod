import { ru, dictionaries } from './ru.js';

let currentLocale = 'ru';

export function t(key) {
  const dict = dictionaries[currentLocale] || ru;
  return dict[key] || key;
}

export function setLocale(locale) {
  if (dictionaries[locale]) currentLocale = locale;
}

export function getLocale() {
  return currentLocale;
}
