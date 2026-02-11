import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useCreatePointsTransaction } from "@/hooks/use-points-transactions"
import type { Customer } from "@/types/database.types"

interface AdjustPointsDialogProps {
  customer: Customer
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AdjustPointsDialog({
  customer,
  open,
  onOpenChange,
  onSuccess,
}: AdjustPointsDialogProps) {
  const { mutate: createTransaction } = useCreatePointsTransaction()
  const [amount, setAmount] = useState("")
  const [reason, setReason] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const pointsAmount = parseInt(amount) || 0
  const newBalance = customer.points_balance + pointsAmount

  async function handleSubmit() {
    if (pointsAmount === 0) {
      toast.error("Amount cannot be zero")
      return
    }
    if (!reason.trim()) {
      toast.error("Please provide a reason")
      return
    }
    if (newBalance < 0) {
      toast.error("Cannot reduce balance below zero")
      return
    }

    setIsLoading(true)
    try {
      await createTransaction({
        customer_id: customer.id,
        type: "adjust",
        amount: pointsAmount,
        description: `Manual adjustment: ${reason}`,
        staff_note: reason,
      })
      toast.success(`Points adjusted by ${pointsAmount > 0 ? "+" : ""}${pointsAmount}`)
      setAmount("")
      setReason("")
      onOpenChange(false)
      onSuccess()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to adjust points")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adjust Points</DialogTitle>
          <DialogDescription>
            Manually add or remove points for {customer.name}.
            Current balance: {customer.points_balance} points.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="adjust-amount">Amount (use negative to subtract)</Label>
            <Input
              id="adjust-amount"
              type="number"
              placeholder="e.g. 50 or -25"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          {pointsAmount !== 0 && (
            <p className="text-sm text-muted-foreground">
              New balance: <span className={newBalance < 0 ? "text-destructive font-semibold" : "font-semibold"}>{newBalance} points</span>
            </p>
          )}

          <div className="space-y-2">
            <Label htmlFor="adjust-reason">Reason *</Label>
            <Textarea
              id="adjust-reason"
              placeholder="Why are you adjusting points?"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || pointsAmount === 0 || !reason.trim() || newBalance < 0}
          >
            {isLoading ? "Adjusting..." : "Adjust Points"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
