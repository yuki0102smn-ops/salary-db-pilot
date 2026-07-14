/*
 * 手取り年収シミュレーター（簡易版）
 * 前提: 独身・扶養なし、社会保険料は額面の15%と仮定した概算計算。
 * 実際の手取り額は年齢・居住自治体・加入保険組合により変動する。
 */

function calcNetIncome(grossManYen) {
  const gross = grossManYen * 10000;
  if (gross <= 0) return null;

  let salaryDeduction;
  if (gross <= 1625000) salaryDeduction = 550000;
  else if (gross <= 1800000) salaryDeduction = gross * 0.4 - 100000;
  else if (gross <= 3600000) salaryDeduction = gross * 0.3 + 80000;
  else if (gross <= 6600000) salaryDeduction = gross * 0.2 + 440000;
  else if (gross <= 8500000) salaryDeduction = gross * 0.1 + 1100000;
  else salaryDeduction = 1950000;

  const salaryIncome = Math.max(gross - salaryDeduction, 0);
  const socialInsurance = Math.round(gross * 0.15);

  const incomeTaxBrackets = [
    [1950000, 0.05, 0],
    [3300000, 0.10, 97500],
    [6950000, 0.20, 427500],
    [9000000, 0.23, 636000],
    [18000000, 0.33, 1536000],
    [40000000, 0.40, 2796000],
    [Infinity, 0.45, 4796000],
  ];
  const taxableIncomeTax = Math.max(salaryIncome - 480000 - socialInsurance, 0);
  let incomeTaxBase = 0;
  for (const [limit, rate, deduct] of incomeTaxBrackets) {
    if (taxableIncomeTax <= limit) {
      incomeTaxBase = Math.max(taxableIncomeTax * rate - deduct, 0);
      break;
    }
  }
  const incomeTax = Math.round(incomeTaxBase * 1.021);

  const taxableResidentTax = Math.max(salaryIncome - 430000 - socialInsurance, 0);
  const residentTax = Math.round(taxableResidentTax * 0.10) + 5000;

  const netIncome = gross - socialInsurance - incomeTax - residentTax;

  return {
    gross,
    socialInsurance,
    incomeTax,
    residentTax,
    netIncome,
    netIncomeMonthly: netIncome / 12,
  };
}

function formatManYen(yen) {
  return (yen / 10000).toFixed(1);
}

function initNetIncomeCalculator() {
  const containers = document.querySelectorAll('[data-net-income-calc]');
  containers.forEach((container) => {
    const input = container.querySelector('[data-income-input]');
    const button = container.querySelector('[data-calc-button]');
    const result = container.querySelector('[data-calc-result]');
    if (!input || !button || !result) return;

    const run = () => {
      const grossManYen = parseFloat(input.value);
      if (isNaN(grossManYen) || grossManYen <= 0) {
        result.textContent = '額面年収を万円単位で入力してください。';
        return;
      }
      const r = calcNetIncome(grossManYen);
      result.innerHTML =
        `手取り年収の目安: <strong>${formatManYen(r.netIncome)}万円</strong>` +
        `（月換算 約${formatManYen(r.netIncomeMonthly)}万円）<br>` +
        `内訳: 社会保険料 約${formatManYen(r.socialInsurance)}万円 ／ ` +
        `所得税 約${formatManYen(r.incomeTax)}万円 ／ ` +
        `住民税 約${formatManYen(r.residentTax)}万円`;
    };

    button.addEventListener('click', run);
    if (input.value) run();
  });
}

document.addEventListener('DOMContentLoaded', initNetIncomeCalculator);
