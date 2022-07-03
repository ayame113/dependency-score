export async function svg(text: string, color: string) {
  const res = await fetch(
    `https://img.shields.io/badge/dependencies--score-${text}-${color}`,
  );
  return await res.text();
}
