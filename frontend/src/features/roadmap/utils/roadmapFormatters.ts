export function formatRoadmapDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function capitalize(value: string): string {
  if (!value) {
    return "Not provided";
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}