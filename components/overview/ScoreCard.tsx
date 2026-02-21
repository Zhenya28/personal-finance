import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatPLN } from "@/lib/utils";
import { Flame, Zap, Wallet } from "lucide-react";

interface ScoreCardProps {
  freeCash: number;
  streak: number;
  monthlyScore: number;
  budgetPoints: number;
  savingsPoints: number;
  investmentPoints: number;
}

export function ScoreCard({
  freeCash,
  streak,
  monthlyScore,
  budgetPoints,
  savingsPoints,
  investmentPoints,
}: ScoreCardProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Wolna kasa
          </CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{formatPLN(freeCash)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Przychody - wydatki - cele
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Streak
          </CardTitle>
          <Flame className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {streak} <span className="text-lg">dni</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Kolejne dni z transakcją
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Monthly Score
          </CardTitle>
          <Zap className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{monthlyScore}</div>
          <Progress value={monthlyScore} className="mt-2" />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>Budżet: {budgetPoints}/40</span>
            <span>Oszcz.: {savingsPoints}/30</span>
            <span>Inwest.: {investmentPoints}/30</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
