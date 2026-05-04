
"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { DollarSign, UserPlus, UserX, CreditCard, Loader2 } from "lucide-react"
import { getBillingDashboardStats } from "@/lib/auth-actions" 
import type { BillingStats } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton"

const chartConfig = {
  stripe: {
    label: "Cartão",
    color: "hsl(var(--primary))",
  },
  mercadoPago: {
    label: "PIX",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

const filters = [
  { label: "7 Dias", value: "7" },
  { label: "15 Dias", value: "15" },
  { label: "30 Dias", value: "30" },
  { label: "60 Dias", value: "60" },
  { label: "90 Dias", value: "90" },
  { label: "Ano", value: "365" },
]

export default function BillingPage() {
  const [activeFilter, setActiveFilter] = React.useState("30")
  const [stats, setStats] = React.useState<BillingStats | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const periodInDays = parseInt(activeFilter, 10);
        const fetchedStats = await getBillingDashboardStats({ periodInDays });
        setStats(fetchedStats);
      } catch (error) {
        console.error("Failed to fetch billing stats:", error);
        setStats({
            totalRevenue: 0,
            totalStripeRevenue: 0,
            totalMercadoPagoRevenue: 0,
            newCustomers: 0,
            canceledCustomers: 0,
            chartData: []
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [activeFilter]);
  
  const renderCardSkeleton = () => (
     <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-2/5" />
            <Skeleton className="h-6 w-6 rounded-full" />
        </CardHeader>
        <CardContent>
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-3 w-4/5 mt-2" />
        </CardContent>
     </Card>
  );

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Dashboard de Faturamento</h1>
        <div className="grid grid-cols-3 sm:flex items-center gap-2">
          {filters.map((filter) => (
            <Button
              key={filter.value}
              variant={activeFilter === filter.value ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveFilter(filter.value)}
              disabled={isLoading}
              className="w-full"
            >
              {filter.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-6">
        {isLoading ? (
            <>
                {Array.from({length: 4}).map((_, i) => renderCardSkeleton())}
            </>
        ) : (
            <>
                <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Receita Cartão (Stripe)</CardTitle>
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats?.totalStripeRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
                    <p className="text-xs text-muted-foreground">
                    Período selecionado
                    </p>
                </CardContent>
                </Card>
                <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Receita PIX (MP)</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats?.totalMercadoPagoRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
                    <p className="text-xs text-muted-foreground">
                    Período selecionado
                    </p>
                </CardContent>
                </Card>
                <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                    Clientes Novos
                    </CardTitle>
                    <UserPlus className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">+{stats?.newCustomers}</div>
                    <p className="text-xs text-muted-foreground">
                    Novos usuários no período
                    </p>
                </CardContent>
                </Card>
                <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Clientes Cancelados</CardTitle>
                    <UserX className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">-{stats?.canceledCustomers}</div>
                    <p className="text-xs text-muted-foreground">
                    Cancelamentos no período
                    </p>
                </CardContent>
                </Card>
            </>
        )}
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Visão Geral da Receita</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="min-h-[300px] w-full flex items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : (
          <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
            <BarChart accessibilityLayer data={stats?.chartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <YAxis
                tickFormatter={(value) => `R$${Number(value) / 1000}k`}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Bar dataKey="stripe" fill="var(--color-stripe)" radius={4} stackId="a" />
              <Bar dataKey="mercadoPago" fill="var(--color-mercadoPago)" radius={4} stackId="a" />
            </BarChart>
          </ChartContainer>
          )}
        </CardContent>
      </Card>
    </>
  )
}
