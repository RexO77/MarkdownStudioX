
export const calculateDocumentStats = (content: string) => {
  const words = content.trim() ? content.trim().split(/\s+/).filter(word => word.length > 0).length : 0;
  const characters = content.length;
  const readingTime = Math.max(1, Math.ceil(words / 200)); // 200 words per minute

  return { words, characters, readingTime };
};
