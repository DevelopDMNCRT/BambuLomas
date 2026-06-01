export const normalizeTitleCase = (text: string) => {
  if (!text) return '';
  const lowerWords = ['de', 'del', 'el', 'la', 'los', 'las', 'y', 'en', 'con', 'a', 'al', 'por', 'para'];
  return text
    .toLowerCase()
    .split(/\s+/)
    .map((word, index) => {
      if (index > 0 && lowerWords.includes(word)) {
        return word;
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ')
    .trim();
};
