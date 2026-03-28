/**
 * Fundamental (Value) Analysis Engine
 */

import type { ValueAnalysis, ValueFactor } from '@/types';

function r(obj: any): number | null {
  return obj?.raw != null ? obj.raw : null;
}

export function valueAnalysis(
  meta: any,
  fundamentals: Record<string, any> | null,
  price: number
): ValueAnalysis {
  const sd = fundamentals?.summaryDetail || {};
  const dk = fundamentals?.defaultKeyStatistics || {};
  const fd = fundamentals?.financialData || {};

  const pe = r(sd.trailingPE);
  const fpe = r(sd.forwardPE);
  const pb = r(sd.priceToBook);
  const peg = r(dk.pegRatio);
  const dyRaw = r(sd.dividendYield);
  const dy = dyRaw != null ? dyRaw * 100 : null;
  const roeRaw = r(fd.returnOnEquity);
  const roe = roeRaw != null ? roeRaw * 100 : null;
  const debtRaw = r(fd.debtToEquity);
  const debt = debtRaw;
  const pmRaw = r(fd.profitMargins);
  const pm = pmRaw != null ? pmRaw * 100 : null;
  const rgRaw = r(fd.revenueGrowth);
  const rg = rgRaw != null ? rgRaw * 100 : null;
  const tp = r(fd.targetMeanPrice);
  const upside = tp && price > 0 ? ((tp - price) / price) * 100 : null;

  const factors: ValueFactor[] = [];
  let score = 0;

  // PE
  if (pe != null) {
    if (pe < 10) { score += 20; factors.push({ n: `本益比偏低(${pe.toFixed(1)})`, i: '+' }); }
    else if (pe < 15) { score += 10; factors.push({ n: `本益比合理(${pe.toFixed(1)})`, i: '+' }); }
    else if (pe > 50) { score -= 25; factors.push({ n: `本益比過高(${pe.toFixed(1)})`, i: '-' }); }
    else if (pe > 30) { score -= 15; factors.push({ n: `本益比偏高(${pe.toFixed(1)})`, i: '-' }); }
  }

  // PB
  if (pb != null) {
    if (pb < 1) { score += 20; factors.push({ n: `PB<1 低於淨值(${pb.toFixed(2)})`, i: '+' }); }
    else if (pb < 2) { score += 10; factors.push({ n: `PB合理(${pb.toFixed(2)})`, i: '+' }); }
    else if (pb > 10) { score -= 10; factors.push({ n: `PB偏高(${pb.toFixed(2)})`, i: '-' }); }
  }

  // PEG
  if (peg != null) {
    if (peg > 0 && peg < 1) { score += 15; factors.push({ n: `PEG<1 成長被低估(${peg.toFixed(2)})`, i: '+' }); }
    else if (peg > 2) { score -= 10; factors.push({ n: `PEG偏高(${peg.toFixed(2)})`, i: '-' }); }
  }

  // Dividend yield
  if (dy != null) {
    if (dy > 4) { score += 15; factors.push({ n: `高殖利率(${dy.toFixed(2)}%)`, i: '+' }); }
    else if (dy > 2) { score += 5; factors.push({ n: `殖利率尚可(${dy.toFixed(2)}%)`, i: '0' }); }
  }

  // ROE
  if (roe != null) {
    if (roe > 20) { score += 15; factors.push({ n: `高ROE(${roe.toFixed(1)}%)`, i: '+' }); }
    else if (roe > 15) { score += 10; factors.push({ n: `ROE良好(${roe.toFixed(1)}%)`, i: '+' }); }
    else if (roe < 5 && roe >= 0) { score -= 10; factors.push({ n: `ROE偏低(${roe.toFixed(1)}%)`, i: '-' }); }
  }

  // Debt
  if (debt != null) {
    if (debt < 50) { score += 10; factors.push({ n: `低負債(${debt.toFixed(0)}%)`, i: '+' }); }
    else if (debt > 150) { score -= 15; factors.push({ n: `高負債(${debt.toFixed(0)}%)`, i: '-' }); }
  }

  // Profit margin
  if (pm != null) {
    if (pm > 20) { score += 10; factors.push({ n: `高利潤率(${pm.toFixed(1)}%)`, i: '+' }); }
    else if (pm < 5 && pm >= 0) { score -= 10; factors.push({ n: `低利潤率(${pm.toFixed(1)}%)`, i: '-' }); }
  }

  // Revenue growth
  if (rg != null) {
    if (rg > 20) { score += 15; factors.push({ n: `營收高成長(${rg.toFixed(1)}%)`, i: '+' }); }
    else if (rg > 5) { score += 5; factors.push({ n: `營收穩定成長(${rg.toFixed(1)}%)`, i: '+' }); }
    else if (rg < -5) { score -= 15; factors.push({ n: `營收衰退(${rg.toFixed(1)}%)`, i: '-' }); }
  }

  // Target price
  if (upside != null) {
    if (upside > 20) { score += 15; factors.push({ n: `目標價上檔空間大(+${upside.toFixed(1)}%)`, i: '+' }); }
    else if (upside > 0) { score += 5; factors.push({ n: `目標價高於現價(+${upside.toFixed(1)}%)`, i: '+' }); }
    else { score -= 10; factors.push({ n: `低於分析師目標(${upside.toFixed(1)}%)`, i: '-' }); }
  }

  score = Math.max(-100, Math.min(100, score));

  let verdict: string;
  if (score >= 30) verdict = '估值偏低，具投資價值';
  else if (score >= 10) verdict = '估值合理';
  else if (score >= -10) verdict = '估值中性';
  else if (score >= -30) verdict = '估值偏高';
  else verdict = '嚴重高估，風險偏高';

  return { pe, fpe, pb, peg, dy, roe, debt, pm, rg, tp, upside, score, factors, verdict };
}
