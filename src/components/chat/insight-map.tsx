import { Card } from '@/components/ui/card';
export default function InsightMap() {
  return (
    <Card className="m-4 p-4 rounded-xl shadow-[0_0_4px_#00f6ff,0_0_8px_#00f6ff] bg-[var(--background)]/90 h-full">
      <h3 className="text-base font-bold text-[var(--primary)] tracking-tight mb-2" style={{textShadow:'0 0 4px #00f6ff,0 0 8px #00f6ff'}}>인사이트 맵</h3>
      <div className="text-[var(--muted-foreground)] text-sm font-medium">
        여기에 인사이트 맵(지식 그래프 등)이 표시됩니다.
      </div>
    </Card>
  );
}