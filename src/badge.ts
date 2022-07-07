/**
 * create badge from score
 * スコアからバッジ画像を生成
 */
export async function createBadge(score: number) {
  // Rounded to the third decimal place
  // 小数第3位で四捨五入
  const scoreText = (Math.round(score * 1000) / 1000).toString();

  let color: string;
  if (score < 0.3) {
    color = "red";
  } else if (score < 0.7) {
    color = "orange";
  } else {
    color = "brightgreen";
  }

  // api: https://shields.io/#your-badge
  const url =
    `https://img.shields.io/badge/dependencies--score-${scoreText}-${color}`;

  // get badge image
  // バッジ画像を取得
  const response = await fetch(url);
  return await response.text();
}
