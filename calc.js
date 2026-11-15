// 계산 로직 + 수치 (이 파일만 고치면 모든 화면에 반영됨)
// ⚠ 아래 수치는 전부 "임시값"입니다. 근거 자료(논문/보고서)를 찾으면 교체하고 source에 출처를 적으세요.
const PLACEHOLDER = true; // 근거 수치로 교체 완료하면 false로 바꾸기 (화면의 '임시값' 표시가 사라짐)

const WEEKS_PER_SEMESTER = 16;
const MAX_PER_ITEM = 50; // 이상값 방지 (일주일 기준 한 항목 최대)

// 일회용품 한 개당 무게(g) — 임시값
const ITEMS = [
  { key: "cups",       label: "일회용 컵",        grams: 10, source: "TODO" },
  { key: "containers", label: "포장·배달 용기",    grams: 25, source: "TODO" },
  { key: "bags",       label: "비닐봉투",          grams: 6,  source: "TODO" },
  { key: "straws",     label: "빨대·수저 등",      grams: 2,  source: "TODO" },
];

// 소재별 탄소배출량(kg CO2e / kg 소재), 가격(원 / kg) — 임시값
const MATERIALS = {
  conventional: { name: "일반 플라스틱", co2PerKg: 3.0, costPerKg: 2000, source: "TODO" },
  pla:          { name: "PLA",           co2PerKg: 2.0, costPerKg: 4000, source: "TODO" },
  pha:          { name: "PHA",           co2PerKg: 2.5, costPerKg: 8000, source: "TODO" },
};

function clampCount(v) {
  const n = Math.floor(Number(v));
  if (!isFinite(n) || n < 0) return 0;
  return Math.min(n, MAX_PER_ITEM);
}

function totalGrams(counts) {
  return ITEMS.reduce((sum, it) => sum + clampCount(counts[it.key]) * it.grams, 0);
}

// counts: {cups, containers, bags, straws} (일주일 기준) → 한 소재로 만들었을 때의 결과
function footprint(counts, materialKey, weeks = 1) {
  const m = MATERIALS[materialKey];
  const kg = (totalGrams(counts) * weeks) / 1000;
  return { plasticKg: kg, co2Kg: kg * m.co2PerKg, cost: kg * m.costPerKg };
}

// 여러 명의 응답 합산
function sumCounts(list) {
  const total = { cups: 0, containers: 0, bags: 0, straws: 0 };
  list.forEach(r => ITEMS.forEach(it => { total[it.key] += clampCount(r[it.key]); }));
  return total;
}

if (typeof module !== "undefined") {
  module.exports = { ITEMS, MATERIALS, WEEKS_PER_SEMESTER, MAX_PER_ITEM, clampCount, totalGrams, footprint, sumCounts };
}
