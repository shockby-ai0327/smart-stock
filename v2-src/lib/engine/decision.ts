/**
 * Unified Decision Engine + Risk Control
 *
 * 3-Dimension 0-100 Scoring:
 * - Fundamentals (40%)
 * - Technical (30%)
 * - Market Sentiment (30%)
 *
 * + Guardrail rules
 * + Top 3 reasons extraction
 * + Risk level classification
 */

import { WEIGHTS, THRESHOLDS, RISK } from '@/config/constants';
import type {
  TechnicalAnalysis, ValueAnalysis,
  UnifiedDecision, DecisionStep, RiskControl,
} from '@/types';

// ── Unified Decision ──

export function unifiedDecision(
  ta: TechnicalAnalysis,
  va: ValueAnalysis,
  vixPrice: number | null,
  stockChgPct: number
): UnifiedDecision {
  const steps: DecisionStep[] = [];

  // Dimension 1: Fundamentals (0-100)
  const fundScore = clamp(Math.round((va.score + 100) / 2), 0, 100);
  const fundLabel = fundScore >= 70 ? '基本面強勁' : fundScore >= 50 ? '基本面中性' : fundScore >= 30 ? '基本面偏弱' : '基本面不佳';
  steps.push({ label: '基本面', detail: `${fundLabel}（PE/PB/ROE/殖利率/成長性）`, value: fundScore, weight: '40%' });

  // Dimension 2: Technical (0-100)
  const techScore = clamp(Math.round((ta.score + 100) / 2), 0, 100);
  const techLabel = techScore >= 70 ? '技術面強勢' : techScore >= 50 ? '技術面中性' : techScore >= 30 ? '技術面偏弱' : '技術面弱勢';
  steps.push({ label: '技術面', detail: `${techLabel}（均線/MACD/RSI/KD/量能）`, value: techScore, weight: '30%' });

  // Dimension 3: Market Sentiment (0-100)
  let sentScore = 50;
  const sentFactors: string[] = [];

  if (vixPrice != null) {
    if (vixPrice < 15) { sentScore += 20; sentFactors.push(`VIX ${vixPrice.toFixed(1)} 極低，市場樂觀`); }
    else if (vixPrice < 20) { sentScore += 10; sentFactors.push(`VIX ${vixPrice.toFixed(1)} 偏低，情緒穩定`); }
    else if (vixPrice > 30) { sentScore -= 25; sentFactors.push(`VIX ${vixPrice.toFixed(1)} 極高，市場恐慌`); }
    else if (vixPrice > 25) { sentScore -= 15; sentFactors.push(`VIX ${vixPrice.toFixed(1)} 偏高，避險升溫`); }
    else { sentFactors.push(`VIX ${vixPrice.toFixed(1)} 中性`); }
  } else {
    sentFactors.push('VIX 資料不可用');
  }

  if (stockChgPct > 3) { sentScore += 12; sentFactors.push(`個股近期漲幅 +${stockChgPct.toFixed(1)}%，動能強`); }
  else if (stockChgPct > 1) { sentScore += 6; sentFactors.push(`個股溫和上漲 +${stockChgPct.toFixed(1)}%`); }
  else if (stockChgPct < -3) { sentScore -= 12; sentFactors.push(`個股近期跌幅 ${stockChgPct.toFixed(1)}%，賣壓重`); }
  else if (stockChgPct < -1) { sentScore -= 6; sentFactors.push(`個股溫和下跌 ${stockChgPct.toFixed(1)}%`); }

  if (ta.volRatio > 1.5 && ta.score > 0) { sentScore += 8; sentFactors.push('放量上攻，買盤積極'); }
  else if (ta.volRatio > 1.5 && ta.score < 0) { sentScore -= 8; sentFactors.push('放量下殺，恐慌賣壓'); }
  else if (ta.volRatio < 0.5) { sentScore -= 3; sentFactors.push('量能萎縮，觀望濃厚'); }

  sentScore = clamp(Math.round(sentScore), 0, 100);
  const sentLabel = sentScore >= 70 ? '情緒樂觀' : sentScore >= 50 ? '情緒中性' : sentScore >= 30 ? '情緒偏冷' : '情緒悲觀';
  steps.push({ label: '市場情緒', detail: `${sentLabel}（${sentFactors.join('；')}）`, value: sentScore, weight: '30%' });

  // Weighted total
  const totalScore = Math.round(fundScore * WEIGHTS.FUND + techScore * WEIGHTS.TECH + sentScore * WEIGHTS.SENT);
  steps.push({ label: '加權總分', detail: '基本面×40% + 技術面×30% + 情緒×30%', value: totalScore, weight: '' });

  // Signal determination
  let signal: 'buy' | 'hold' | 'sell' = totalScore >= THRESHOLDS.BUY ? 'buy' : totalScore <= THRESHOLDS.SELL ? 'sell' : 'hold';

  // Guardrails
  let vetoed: string | null = null;
  if (signal === 'buy' && fundScore <= 25) { signal = 'hold'; vetoed = '基本面分數過低（≤ 25），否決買入'; }
  if (signal === 'buy' && techScore <= 15) { signal = 'hold'; vetoed = '技術面嚴重破位（≤ 15），否決買入'; }
  if (fundScore >= 65 && techScore >= 55 && sentScore >= 55) { signal = 'buy'; vetoed = '三維度均偏多，確認買入'; }
  if (fundScore <= 35 && techScore <= 40 && sentScore <= 40) { signal = 'sell'; vetoed = '三維度均偏空，確認賣出'; }

  steps.push({ label: '最終決策', detail: vetoed || '依總分判定，無觸發護欄', value: signal === 'buy' ? '買入' : signal === 'sell' ? '賣出' : '觀望', weight: '' });

  // Confidence
  const confidence = clamp(Math.round(Math.abs(totalScore - 50) * 2.5), 0, 100);
  const confLabel = confidence >= 70 ? '高' : confidence >= 40 ? '中等' : '低';

  // Top 3 reasons
  const topReasons = extractTopReasons(signal, vetoed, va, ta, sentFactors);

  return { signal, totalScore, fundScore, techScore, sentScore, confidence, confLabel, steps, vetoed, sentFactors, topReasons };
}

function extractTopReasons(
  signal: string,
  vetoed: string | null,
  va: ValueAnalysis,
  ta: TechnicalAnalysis,
  sentFactors: string[]
): string[] {
  const reasons: string[] = [];
  if (vetoed) reasons.push(vetoed);

  type ScoredReason = { text: string; dim: string; align: number };
  const scored: ScoredReason[] = [];

  va.factors.forEach(ff => {
    const w = ff.i === '+' ? 1 : ff.i === '-' ? -1 : 0;
    scored.push({ text: `基本面：${ff.n}`, dim: 'fund', align: signal === 'buy' ? w : -w });
  });

  ta.sigs.forEach(s => {
    const w = s.t === 'b' ? 1 : -1;
    scored.push({ text: `技術面：${s.n}`, dim: 'tech', align: signal === 'buy' ? w : -w });
  });

  sentFactors.forEach(sf => {
    if (sf.includes('不可用') || sf.includes('中性')) return;
    const positive = /樂觀|穩定|上漲|上攻|積極|極低/.test(sf);
    scored.push({ text: `情緒：${sf}`, dim: 'sent', align: signal === 'buy' ? (positive ? 1 : -1) : (positive ? -1 : 1) });
  });

  scored.sort((a, b) => b.align - a.align);

  const usedDims = new Set<string>();
  for (const r of scored) {
    if (reasons.length >= 3) break;
    if (usedDims.size < 2 && usedDims.has(r.dim)) continue;
    reasons.push(r.text);
    usedDims.add(r.dim);
  }
  for (const r of scored) {
    if (reasons.length >= 3) break;
    if (!reasons.includes(r.text)) reasons.push(r.text);
  }

  return reasons.slice(0, 3);
}

// ── Risk Control ──

export function riskControl(
  ta: TechnicalAnalysis,
  va: ValueAnalysis,
  ud: UnifiedDecision,
  price: number
): RiskControl {
  const factors: string[] = [];
  let highCount = 0;

  const atrPct = price > 0 && ta.atr ? (ta.atr / price) : 0;
  if (atrPct > RISK.ATR_HIGH) { highCount++; factors.push(`日均波動 ${(atrPct * 100).toFixed(1)}% 偏高`); }
  else if (atrPct > RISK.ATR_LOW) { factors.push(`日均波動 ${(atrPct * 100).toFixed(1)}%`); }

  if (va.pe != null) {
    if (va.pe > RISK.PE_HIGH) { highCount++; factors.push(`本益比過高（${va.pe.toFixed(1)}）`); }
    else if (va.pe < 0) { highCount++; factors.push('公司虧損（PE < 0）'); }
  }

  if (va.debt != null && va.debt > RISK.DEBT_HIGH) { highCount++; factors.push(`負債比過高（${va.debt.toFixed(0)}%）`); }
  if (ta.volRatio > RISK.VOL_HIGH) { highCount++; factors.push(`量能異常放大（${ta.volRatio.toFixed(1)}x）`); }
  if (ud.totalScore <= RISK.SCORE_LOW) { highCount++; factors.push(`綜合評分偏低（${ud.totalScore}/100）`); }

  let riskLevel: RiskControl['riskLevel'];
  let riskLabel: string;
  let maxPosition: number;
  let stopLoss: number;

  if (highCount >= 2) {
    riskLevel = 'high'; riskLabel = '高風險';
    maxPosition = RISK.HIGH_RISK.maxPosition; stopLoss = RISK.HIGH_RISK.stopLoss;
  } else if (
    atrPct < RISK.ATR_LOW &&
    (va.pe == null || (va.pe >= RISK.PE_RANGE[0] && va.pe <= RISK.PE_RANGE[1])) &&
    (va.debt == null || va.debt < RISK.DEBT_LOW) &&
    ud.totalScore >= RISK.SCORE_OK
  ) {
    riskLevel = 'low'; riskLabel = '低風險';
    maxPosition = RISK.LOW_RISK.maxPosition; stopLoss = RISK.LOW_RISK.stopLoss;
  } else {
    riskLevel = 'medium'; riskLabel = '中風險';
    maxPosition = RISK.MED_RISK.maxPosition; stopLoss = RISK.MED_RISK.stopLoss;
  }

  const stopPrice = price * (1 + stopLoss / 100);

  let advice: string;
  if (riskLevel === 'high') advice = '高波動或高估值標的，僅建議極輕倉試探，嚴守停損';
  else if (riskLevel === 'low') advice = '波動低、估值合理，可較放心持有，但仍需停損';
  else advice = '風險適中，建議標準倉位操作，設好停損點';

  if (!factors.length) factors.push('各項指標在正常範圍內');

  return { riskLevel, riskLabel, maxPosition, stopLoss, stopPrice, riskFactors: factors, advice };
}

// ── Utility ──

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}
