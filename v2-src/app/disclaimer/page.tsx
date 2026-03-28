import { Card, CardTitle } from '@/components/ui/card';

export default function DisclaimerPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-content-primary">風險聲明</h1>

      <Card>
        <CardTitle>免責聲明</CardTitle>
        <div className="mt-3 space-y-3 text-sm text-content-secondary">
          <p>
            Smart Stock（以下稱「本工具」）是一個開源的股票分析學習專案，
            旨在展示技術分析與基本面分析的程式化實作方式。
          </p>
          <p className="text-negative font-medium">
            本工具不構成任何形式的投資建議、推薦或招攬。
          </p>
          <p>
            使用者應自行判斷並承擔所有投資風險。過去的表現不代表未來的結果。
          </p>
        </div>
      </Card>

      <Card>
        <CardTitle>資料準確性</CardTitle>
        <ul className="mt-3 space-y-2 text-sm text-content-secondary list-disc pl-5">
          <li>價格數據來自 Yahoo Finance，可能延遲 15-20 分鐘</li>
          <li>基本面數據透過網頁解析取得，可能不完整或有誤</li>
          <li>評分模型為簡化版本，未經嚴格的歷史回測驗證</li>
          <li>CORS 代理可能導致資料暫時不可用</li>
          <li>台股數據可能缺少部分基本面指標</li>
        </ul>
      </Card>

      <Card>
        <CardTitle>已知限制</CardTitle>
        <ul className="mt-3 space-y-2 text-sm text-content-secondary list-disc pl-5">
          <li>無即時行情，不適合日內交易</li>
          <li>無歷史決策追蹤（Track Record）功能，無法驗證準確率</li>
          <li>評分權重為人工設定，非機器學習優化</li>
          <li>不考慮個股特殊事件（財報、併購、監管等）</li>
          <li>市場情緒維度目前僅使用 VIX + 漲跌幅 + 量比，覆蓋面有限</li>
        </ul>
      </Card>

      <Card>
        <CardTitle>使用建議</CardTitle>
        <div className="mt-3 space-y-2 text-sm text-content-secondary">
          <p>如果您仍然決定參考本工具的分析結果：</p>
          <ol className="list-decimal pl-5 space-y-1">
            <li>永遠不要將全部資金投入單一標的</li>
            <li>嚴格遵守停損紀律</li>
            <li>結合其他資訊來源交叉驗證</li>
            <li>了解您投資的每一檔股票的基本業務</li>
            <li>只用閒錢投資，不要借錢投資</li>
          </ol>
        </div>
      </Card>

      <p className="text-xs text-content-muted text-center py-4">
        使用本工具即表示您已閱讀並同意以上風險聲明。
      </p>
    </div>
  );
}
