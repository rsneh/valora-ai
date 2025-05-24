export const currencyOptions = [
  { code: 'USD', name: 'US Dollar', icon: "$" },
  { code: 'EUR', name: 'Euro', icon: "€" },
  { code: 'ILS', name: 'Israeli Shekel', icon: "₪" },
];

export const getCurrencySymbol = (currencyCode: string) => {
  const currency = currencyOptions.find((option) => option.code === currencyCode);
  return currency ? currency.icon : "$";
};