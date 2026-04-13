export function formatPrice(value: number) {
  return `Rs.${value}`;
}

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

