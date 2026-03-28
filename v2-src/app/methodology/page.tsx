import { Card, CardTitle } from '@/components/ui/card';
import { WEIGHTS, THRESHOLDS, RISK } from '@/config/constants';

export default function MethodologyPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-content-primary">方法論</h1>
      <p className="text-sm text-content-secondary">
        本工具使用三維度加權評分系統，結合護欄規則與風險控制，產生買入/觀望/賣出建議。
        以下是完整的評分與決策邏輯。
      </p>

      {/* Scoring system */}
      <Card>
        <CardTitle>三維度評分系統</CardTitle>
        <p className="text-sm text-content-secondary mt-2 mb-4">
          每個維度獨立計算 0-100 分，再加權合計為總分。
        </p>
        <div className="space-y-3">
          <DimRow
            name="基本面"
            weight={`${WEIGHTS.FUND * 100}%`}
            desc="PE/PB/PEG/殖利率/ROE/負債比/利潤率/營收成長/目標價"
          />
          <DimRow
            name="技術面"
            weight={`${WEIGHTS.TECH * 100}%`}
            desc="MA(5/20/60)/MACD(12,26,9)/RSI(14)/KD(9,3,3)/布林通道/ATR(14)/量比"
          />
          <DimRow
            name="市場情緒"
            weight={`${WEIGHTS.SENT * 100}%`}
            desc="VIX 恐慌指數/個股近期漲跌幅/量能方向"
          />
        </div>
      </Card>

      {/* Signal determination */}
      <Card>
        <CardTitle>信號判定</CardTitle>
        <div className="mt-3 space-y-2 text-sm text-content-secondary">
          <p>
            <span className="text-positive font-medium">買入</span>：總分 &ge; {THRESHOLDS.BUY}
          </p>
          <p>
            <span className="text-negative font-medium">賣出</span>：總分 &le; {THRESHOLDS.SELL}
          </p>
          <p>
            <span className="text-neutral font-medium">觀望</span>：{THRESHOLDS.SELL} &lt; 總分 &lt; {THRESHOLDS.BUY}
          </p>
        </div>
      </Card>

      {/* Guardrails */}
      <Card>
        <CardTitle>護欄規則</CardTitle>
        <ul className="mt-3 space-y-2 text-sm text-content-secondary list-disc pl-5">
          <li>買入信號但基本面 &le; 25 分 &#8594; 否決為觀望</li>
          <li>買入信號但技術面 &le; 15 分 &#8594; 否決為觀望</li>
          <li>三維度均偏多（基本面 &ge; 65, 技術面 &ge; 55, 情緒 &ge; 55）&#8594; 確認買入</li>
          <li>三維度均偏空（基本面 &le; 35, 技術面 &le; 40, 情緒 &le; 40）&#8594; 確認賣出</li>
        </ul>
      </Card>

      {/* Risk control */}
      <Card>
        <CardTitle>風險控制</CardTitle>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-content-muted border-b border-surface-border">
                <th className="pb-2">風險等級</th>
                <th className="pb-2">建議持倉</th>
                <th className="pb-2">停損幅度</th>
                <th className="pb-2">觸發條件</th>
              </tr>
            </thead>
            <tbody className="text-content-secondary">
              <tr className="border-b border-surface-border/50">
                <td className="py-2 text-negative font-medium">高風險</td>
                <td>&le;{RISK.HIGH_RISK.maxPosition}%</td>
                <td>{RISK.HIGH_RISK.stopLoss}%</td>
                <td className="text-xs">ATR/價格&gt;{RISK.ATR_HIGH * 100}%, PE&gt;{RISK.PE_HIGH}, 負債&gt;{RISK.DEBT_HIGH}%, 異常量比&gt;{RISK.VOL_HIGH}x, 總分&le;{RISK.SCORE_LOW}</td>
              </tr>
              <tr className="border-b border-surface-border/50">
                <td className="py-2 text-neutral font-medium">中風險</td>
                <td>&le;{RISK.MED_RISK.maxPosition}%</td>
                <td>{RISK.MED_RISK.stopLoss}%</td>
                <td className="text-xs">不滿足高/低風險條件</td>
              </tr>
              <tr>
                <td className="py-2 text-positive font-medium">低風險</td>
                <td>&le;{RISK.LOW_RISK.maxPosition}%</td>
                <td>{RISK.LOW_RISK.stopLoss}%</td>
                <td className="text-xs">ATR/價格&lt;{RISK.ATR_LOW * 100}%, PE 5-25, 負債&lt;{RISK.DEBT_LOW}%, 總分&ge;{RISK.SCORE_OK}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Data source */}
      <Card>
        <CardTitle>資料來源與限制</CardTitle>
        <ul className="mt-3 space-y-2 text-sm text-content-secondary list-disc pl-5">
          <li>價格數據：Yahoo Finance（延遲 15-20 分鐘）</li>
          <li>基本面數據：Yahoo Finance 頁面解析（可能不完整）</li>
          <li>本工具不使用即時行情，不適合當日沖銷</li>
          <li>所有評分模型未經歷史回測驗證</li>
          <li>不構成任何投資建議</li>
        </ul>
      </Card>
    </div>
  );
}

function DimRow({ name, weight, desc }: { name: string; weight: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-surface-elevated/50 rounded-lg">
      <div className="w-16 shrink-0">
        <div className="text-sm font-semibold text-content-primary">{name}</div>
        <div className="text-xs text-accent">{weight}</div>
      </div>
      <p className="text-xs text-content-muted flex-1">{desc}</p>
    </div>
  );
}
