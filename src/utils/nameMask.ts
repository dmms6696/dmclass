export function maskMiddleName(name: string) {
  const trimmed = name.trim();
  if (trimmed.length <= 1) {
    return trimmed;
  }
  if (trimmed.length === 2) {
    return `${trimmed[0]}○`;
  }
  return `${trimmed[0]}${'○'.repeat(trimmed.length - 2)}${trimmed[trimmed.length - 1]}`;
}
