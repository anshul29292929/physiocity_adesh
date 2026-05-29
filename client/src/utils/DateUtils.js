export const getRelativeTime = (date) => {
  const now = new Date();
  const diffTime = Math.abs(now - new Date(date));
  const diffSeconds = Math.floor(diffTime / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffYears >= 1) return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
  if (diffMonths >= 1) return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
  if (diffWeeks >= 1) return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`;
  if (diffDays >= 1) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  if (diffHours >= 1) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffMinutes >= 1) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  return 'Just now';
};
