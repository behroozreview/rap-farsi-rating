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

export function getPublicRatingClass(rating: number) {
  const classes = [
    "bg-rose-500/10",
    "bg-pink-500/10",
    "bg-orange-500/10",
    "bg-amber-500/10",
    "bg-yellow-500/10",
    "bg-lime-500/10",
    "bg-emerald-500/10",
    "bg-teal-500/10",
    "bg-sky-500/10",
    "bg-indigo-500/10",
  ];

  return classes[Math.min(Math.max(rating, 0), 9)] ?? classes[0];
}

export function getPublicScoreBarClass(rating: number) {
  const classes = [
    "bg-rose-500",
    "bg-pink-500",
    "bg-orange-500",
    "bg-amber-500",
    "bg-yellow-500",
    "bg-lime-500",
    "bg-emerald-500",
    "bg-teal-500",
    "bg-sky-500",
    "bg-indigo-500",
  ];

  return classes[Math.min(Math.max(rating, 0), 9)] ?? classes[0];
}