import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import type { PointsTransaction } from "@/types/database.types"

interface PointsHistoryTableProps {
  transactions: PointsTransaction[]
  isLoading: boolean
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

function typeBadge(type: PointsTransaction["type"]) {
  switch (type) {
    case "earn":
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Earn</Badge>
    case "redeem":
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Redeem</Badge>
    case "adjust":
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Adjust</Badge>
  }
}

export function PointsHistoryTable({ transactions, isLoading }: PointsHistoryTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <p className="text-center py-8 text-muted-foreground">
        No points transactions yet.
      </p>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Description</TableHead>
          <TableHead className="text-right">Points</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((tx) => (
          <TableRow key={tx.id}>
            <TableCell className="text-sm">{formatDate(tx.created_at)}</TableCell>
            <TableCell>{typeBadge(tx.type)}</TableCell>
            <TableCell className="text-sm">{tx.description || "-"}</TableCell>
            <TableCell className="text-right font-medium">
              <span className={tx.amount >= 0 ? "text-green-600" : "text-red-600"}>
                {tx.amount >= 0 ? "+" : ""}{tx.amount}
              </span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
