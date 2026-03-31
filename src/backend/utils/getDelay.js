const getDelay = (plannedAt, actualAt) => {
  if (!plannedAt || !actualAt) return null;

  const planned = plannedAt.toDate();
  const actual = actualAt.toDate();
  const diffMs = actual - planned;

  if (diffMs <= 0) return "On Time";

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  return days > 0 ? `${days} day(s) delay` : `${hours} hr delay`;
};
export default getDelay;
