import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useRewards } from "@/hooks/use-rewards"
import { useCreatePointsTransaction } from "@/hooks/use-points-transactions"
import type { Customer, Reward } from "@/types/database.types"

interface RedeemRewardDialogProps {
  customer: Customer
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function RedeemRewardDialog({
  customer,
  open,
  onOpenChange,
  onSuccess,
}: RedeemRewardDialogProps) {
  const { data: rewards, isLoading } = useRewards(true)
  const { mutate: createTransaction } = useCreatePointsTransaction()
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null)
  const [isRedeeming, setIsRedeeming] = useState(false)

  async function handleRedeem() {
    if (!selectedReward) return

    setIsRedeeming(true)
    try {
      await createTransaction({
        customer_id: customer.id,
        type: "redeem",
        amount: -selectedReward.points_cost,
        description: `Redeemed: ${selectedReward.name}`,
      })
      toast.success(`Redeemed "${selectedReward.name}" for ${selectedReward.points_cost} points`)
      setSelectedReward(null)
      onOpenChange(false)
      onSuccess()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to redeem")
    } finally {
      setIsRedeeming(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Redeem Reward</DialogTitle>
          <DialogDescription>
            {customer.name} has {customer.points_balance} points. Select a reward to redeem.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <p className="text-sm text-muted-foreground py-4">Loading rewards...</p>
        ) : rewards.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">No active rewards available.</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {rewards.map((reward) => {
              const canAfford = customer.points_balance >= reward.points_cost
              return (
                <button
                  key={reward.id}
                  type="button"
                  disabled={!canAfford}
                  onClick={() => setSelectedReward(reward)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedReward?.id === reward.id
                      ? "border-primary bg-primary/5"
                      : canAfford
                      ? "border-border hover:border-primary/50"
                      : "border-border opacity-50 cursor-not-allowed"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{reward.name}</span>
                    <span className="text-sm font-semibold text-primary">
                      {reward.points_cost} pts
                    </span>
                  </div>
                  {reward.description && (
                    <p className="text-xs text-muted-foreground mt-1">{reward.description}</p>
                  )}
                  {!canAfford && (
                    <p className="text-xs text-destructive mt-1">
                      Needs {reward.points_cost - customer.points_balance} more points
                    </p>
                  )}
                </button>
              )
            })}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleRedeem}
            disabled={!selectedReward || isRedeeming}
          >
            {isRedeeming ? "Redeeming..." : "Redeem"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
