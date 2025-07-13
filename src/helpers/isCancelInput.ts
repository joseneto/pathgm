export function isCancelInput(text: unknown): boolean {
  if (typeof text !== 'string') return false;
  const input = text.trim().toLowerCase();
  return input === 'cancel' || input === 'cancelar';
}
