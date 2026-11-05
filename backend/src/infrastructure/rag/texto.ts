const STOPWORDS = new Set([
  "de", "da", "do", "das", "dos", "e", "o", "a", "os", "as", "um", "uma",
  "para", "por", "com", "que", "em", "no", "na", "nos", "nas", "ao", "aos",
  "se", "como", "mais", "menos", "ou", "the", "of", "and", "to", "in", "eu",
  "meu", "minha", "tem", "ter", "foi", "ser", "sao", "estou", "quero", "voce",
]);

export function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

export function tokenizar(texto: string): string[] {
  return normalizar(texto)
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length >= 3 && !STOPWORDS.has(token));
}
