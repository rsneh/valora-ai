import { type ClassValue, clsx } from "clsx"
import { ReadonlyURLSearchParams } from 'next/navigation'
import { twMerge } from "tailwind-merge"
import { Dictionary } from "./dictionaries";
import { AppLocale } from "@/locales/config";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const createUrl = (
  pathname: string,
  params: URLSearchParams | ReadonlyURLSearchParams
) => {
  const paramsString = params.toString();
  const queryString = `${paramsString.length ? '?' : ''}${paramsString}`;

  return `${pathname}${queryString}`;
};

export const translate = (dictionary: Dictionary | null, key: string, scope?: string): string => {
  if (!dictionary) return key;
  let path = key.split('.');
  if (scope) {
    path = [scope, ...path];
  }

  let result: any = dictionary;
  for (const p of path) {
    result = result?.[p];
    if (result === undefined) {
      console.warn(`Translation key not found: ${scope ? scope + '.' : ''}${key}`);
      return key;
    }
  }
  return typeof result === 'string' ? result : key;
};

export const getLocalCurrency = (locale?: AppLocale) => {
  if (!locale) return "USD";

  switch (locale) {
    case "he":
      return "ILS";
    default:
      return "USD";
  }
};
