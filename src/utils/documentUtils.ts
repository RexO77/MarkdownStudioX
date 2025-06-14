
export const generateTitleFromContent = (content: string): string => {
  const firstLine = content.split('\n')[0].trim();
  if (firstLine && firstLine.length > 0) {
    const cleanTitle = firstLine.replace(/^#+\s*/, '').replace(/\*\*|\*|`/g, '');
    return cleanTitle.length > 50 ? cleanTitle.substring(0, 50) + '...' : cleanTitle;
  }
  return 'Untitled Document';
};
