import * as React from "react"
import {
  Layer,
  Rectangle,
  ResponsiveContainer,
  Sankey,
  Tooltip,
} from "recharts"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { CardTitleRow } from "@/components/home/accounts-card"
import { CardPromptFooter } from "@/components/ask-halo-action"
import {
  buildFlow,
  flowNodes,
  flowPct,
  INCOME_COUNT,
  MONEY_RANGES,
  type FlowStage,
  type MoneyRange,
} from "@/lib/money-flow"
import { formatUSD } from "@/lib/format"

// Color follows the flow *stage* (an entity property, not rank). Labels are
// drawn in ink — never the series color — so identity isn't color-alone.
const STAGE_COLOR: Record<FlowStage, string> = {
  income: "var(--chart-4)",
  budget: "var(--chart-3)",
  expense: "var(--chart-2)",
}

const CHART_HEIGHT = 560

/* eslint-disable @typescript-eslint/no-explicit-any */
function FlowNodeShape(props: any) {
  const { x, y, width, height, index, payload, total } = props
  const node = flowNodes[index]
  const value = payload.value as number
  const color = STAGE_COLOR[node.stage]

  if (node.stage === "budget") {
    return (
      <Layer key={`node-${index}`}>
        <Rectangle x={x} y={y} width={width} height={height} radius={3} fill={color} fillOpacity={0.9} />
        <text
          x={x + width / 2}
          y={y - 10}
          textAnchor="middle"
          className="fill-muted-foreground"
          fontSize={11}
          fontWeight={600}
        >
          {formatUSD(value)}
        </text>
      </Layer>
    )
  }

  const isExpense = node.stage === "expense"
  const labelX = isExpense ? x + width + 10 : x - 10
  const anchor = isExpense ? "start" : "end"

  return (
    <Layer key={`node-${index}`}>
      <Rectangle x={x} y={y} width={width} height={height} radius={3} fill={color} fillOpacity={0.9} />
      <text
        x={labelX}
        y={y + height / 2}
        textAnchor={anchor}
        dominantBaseline="central"
        fontSize={12.5}
      >
        <tspan className="fill-muted-foreground">{flowPct(value, total)}</tspan>
        <tspan className="fill-foreground" dx={6} fontWeight={500}>
          {node.emoji} {node.name}
        </tspan>
      </text>
    </Layer>
  )
}

function FlowLinkShape(props: any) {
  const {
    sourceX,
    sourceY,
    sourceControlX,
    targetX,
    targetY,
    targetControlX,
    linkWidth,
    index,
  } = props
  // Links are ordered income→budget first, then budget→expense — so the stage
  // pair is known from the index without touching the (per-range) link data.
  const incomeLink = index < INCOME_COUNT
  const from = incomeLink ? STAGE_COLOR.income : STAGE_COLOR.budget
  const to = incomeLink ? STAGE_COLOR.budget : STAGE_COLOR.expense
  const gid = `mf-grad-${index}`

  return (
    <Layer key={`link-${index}`}>
      <defs>
        <linearGradient id={gid} gradientUnits="userSpaceOnUse" x1={sourceX} y1={0} x2={targetX} y2={0}>
          <stop offset="0%" stopColor={from} />
          <stop offset="100%" stopColor={to} />
        </linearGradient>
      </defs>
      <path
        d={`M${sourceX},${sourceY}C${sourceControlX},${sourceY} ${targetControlX},${targetY} ${targetX},${targetY}`}
        fill="none"
        stroke={`url(#${gid})`}
        strokeWidth={Math.max(1, linkWidth)}
        strokeOpacity={0.4}
      />
    </Layer>
  )
}

function FlowTooltip({ active, payload, total }: any) {
  if (!active || !payload?.length) return null
  const p = payload[0].payload

  if (p?.source && p?.target && typeof p.source === "object") {
    return (
      <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-md">
        <div className="text-[11px] text-muted-foreground">
          {p.source.name} → {p.target.name}
        </div>
        <div className="mt-0.5 text-[13px] font-semibold tabular-nums text-foreground">
          {formatUSD(p.value)}
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-md">
      <div className="text-[11px] text-muted-foreground">{p.name}</div>
      <div className="mt-0.5 text-[13px] font-semibold tabular-nums text-foreground">
        {formatUSD(p.value)} · {flowPct(p.value, total)}
      </div>
    </div>
  )
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export function MoneyFlowCard() {
  const [range, setRange] = React.useState<MoneyRange>("1M")
  const flow = buildFlow(range)

  return (
    <Card className="gap-0 p-5 sm:p-6">
      <CardTitleRow
        title="Money flow"
        caption={`${formatUSD(flow.total)} in · ${flow.period}`}
      />

      <div className="mt-3 overflow-x-auto">
        <div className="min-w-[720px]">
          <ResponsiveContainer width="100%" height={CHART_HEIGHT} minWidth={0}>
            <Sankey
              key={range}
              data={{ nodes: flow.nodes, links: flow.links }}
              node={<FlowNodeShape total={flow.total} />}
              link={<FlowLinkShape />}
              nodePadding={16}
              nodeWidth={12}
              linkCurvature={0.5}
              iterations={64}
              margin={{ top: 24, right: 188, bottom: 16, left: 176 }}
            >
              <Tooltip content={<FlowTooltip total={flow.total} />} />
            </Sankey>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center gap-1">
        {MONEY_RANGES.map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors",
              r === range
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
            )}
          >
            {r}
          </button>
        ))}
      </div>

      <CardPromptFooter
        text="Where is my money going?"
        prompt="Break down my money flow — which categories am I overspending on, and where could I cut back?"
      />
    </Card>
  )
}
