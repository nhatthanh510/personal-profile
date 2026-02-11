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
import { supabase } from "@/lib/supabase"
import type { Customer } from "@/types/database.types"

interface RecordVisitDialogProps {
  customer: Customer
  pointsPerDollar: number
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function RecordVisitDialog({
  customer,
  pointsPerDollar,
  open,
  onOpenChange,
  onSuccess,
}: RecordVisitDialogProps) {
  const [amount, setAmount] = useState("")
  const [note, setNote] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const visitAmount = parseFloat(amount) || 0
  const earnedPoints = Math.floor(visitAmount * pointsPerDollar)

  async function handleSubmit() {
    if (visitAmount <= 0) {
      toast.error("Please enter a valid amount")
      return
    }

    setIsLoading(true)
    try {
      // Update customer visit count and total spent
      const { error: updateError } = await supabase
        .from("customers")
        .update({
          total_visits: customer.total_visits + 1,
          total_spent: Number(customer.total_spent) + visitAmount,
        })
        .eq("id", customer.id)

      if (updateError) throw new Error(updateError.message)

      // Create points transaction (trigger updates points_balance)
      const { error: txError } = await supabase
        .from("points_transactions")
        .insert({
          customer_id: customer.id,
          type: "earn" as const,
          amount: earnedPoints,
          description: `Visit - $${visitAmount.toFixed(2)}`,
          visit_amount: visitAmount,
          staff_note: note || null,
        })

      if (txError) throw new Error(txError.message)

      toast.success(`Visit recorded! ${earnedPoints} points earned.`)
      setAmount("")
      setNote("")
      onOpenChange(false)
      onSuccess()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to record visit")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record Visit</DialogTitle>
          <DialogDescription>
            Record a visit for {customer.name}. Points are earned based on the amount spent.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="visit-amount">Visit Amount ($)</Label>
            <Input
              id="visit-amount"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          {visitAmount > 0 && (
            <p className="text-sm text-muted-foreground">
              {customer.name} will earn <span className="font-semibold text-primary">{earnedPoints} points</span> ({pointsPerDollar} pt per $1)
            </p>
          )}

          <div className="space-y-2">
            <Label htmlFor="visit-note">Note (optional)</Label>
            <Textarea
              id="visit-note"
              placeholder="Service details..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || visitAmount <= 0}>
            {isLoading ? "Recording..." : "Record Visit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
