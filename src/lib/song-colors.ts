export function getRatingRowClass(rating: number) {
  if (rating >= 8) return "bg-emerald-600/10";
  if (rating >= 6) return "bg-sky-500/10";
  if (rating >= 4) return "bg-amber-500/10";
  if (rating >= 2) return "bg-orange-500/10";
  return "bg-rose-500/10";
}

export function getScoreBarClass(rating: number) {
  if (rating >= 8) return "bg-emerald-600";
  if (rating >= 6) return "bg-sky-500";
  if (rating >= 4) return "bg-amber-500";
  if (rating >= 2) return "bg-orange-500";
  return "bg-rose-500";
}