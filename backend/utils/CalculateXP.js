function computeXpForEntry(entry) {
  const { mode, steps = 0, distance = 0, calories = 0, activeTime = 0 } = entry;
  let xp = 0;

  switch (mode) {
    case "walk":
      xp = Math.round(steps * 0.01 + distance * 0.1 + calories * 0.05);
      break;
    case "run":
      xp = Math.round(steps * 0.015 + distance * 0.15 + calories * 0.07);
      break;
    case "bike":
      xp = Math.round(distance * 0.2 + calories * 0.1 + activeTime * 0.5);
      break;
    default:
      xp = 0;
  }

  return Math.max(0, Math.floor(xp)); // éviter XP négatif
}

module.exports = { computeXpForEntry };
