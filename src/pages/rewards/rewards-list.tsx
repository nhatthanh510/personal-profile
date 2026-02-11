import { useState } from "react"
import { toast } from "sonner"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useRewards, useCreateReward, useUpdateReward, useDeleteReward } from "@/hooks/use-rewards"
import { rewardFormSchema, type RewardFormValues } from "@/lib/schemas/reward"
import type { Reward } from "@/types/database.types"

export default function RewardsList() {
  const { data: rewards, isLoading, refetch } = useRewards()
  const { mutate: createReward } = useCreateReward()
  const { mutate: updateReward } = useUpdateReward()
  const { mutate: deleteReward } = useDeleteReward()

  const [formOpen, setFormOpen] = useState(false)
  const [editingReward, setEditingReward] = useState<Reward | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingReward, setDeletingReward] = useState<Reward | null>(null)

  const form = useForm<RewardFormValues>({
    resolver: zodResolver(rewardFormSchema),
    defaultValues: { name: "", description: "", points_cost: 100, is_active: true },
  })

  function openCreate() {
    setEditingReward(null)
    form.reset({ name: "", description: "", points_cost: 100, is_active: true })
    setFormOpen(true)
  }

  function openEdit(reward: Reward) {
    setEditingReward(reward)
    form.reset({
      name: reward.name,
      description: reward.description || "",
      points_cost: reward.points_cost,
      is_active: reward.is_active,
    })
    setFormOpen(true)
  }

  async function onSubmit(values: RewardFormValues) {
    try {
      if (editingReward) {
        await updateReward(editingReward.id, {
          name: values.name,
          description: values.description || null,
          points_cost: values.points_cost,
          is_active: values.is_active,
        })
        toast.success("Reward updated")
      } else {
        await createReward({
          name: values.name,
          description: values.description || null,
          points_cost: values.points_cost,
          is_active: values.is_active,
        })
        toast.success("Reward created")
      }
      setFormOpen(false)
      refetch()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save reward")
    }
  }

  async function toggleActive(reward: Reward) {
    try {
      await updateReward(reward.id, { is_active: !reward.is_active })
      toast.success(reward.is_active ? "Reward deactivated" : "Reward activated")
      refetch()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update")
    }
  }

  async function handleDelete() {
    if (!deletingReward) return
    try {
      await deleteReward(deletingReward.id)
      toast.success("Reward deleted")
      setDeleteDialogOpen(false)
      setDeletingReward(null)
      refetch()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Rewards</h1>
          <p className="text-muted-foreground mt-1">Manage your rewards catalog.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Reward
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      ) : rewards.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No rewards yet. Create your first reward to get started.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rewards.map((reward) => (
            <Card key={reward.id} className={!reward.is_active ? "opacity-60" : ""}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{reward.name}</CardTitle>
                  <Badge variant={reward.is_active ? "default" : "secondary"}>
                    {reward.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {reward.description && (
                  <p className="text-sm text-muted-foreground">{reward.description}</p>
                )}
                <p className="text-lg font-semibold text-primary">
                  {reward.points_cost} points
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => toggleActive(reward)}>
                    {reward.is_active ? "Deactivate" : "Activate"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => openEdit(reward)}>
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setDeletingReward(reward)
                      setDeleteDialogOpen(true)
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingReward ? "Edit Reward" : "Add Reward"}</DialogTitle>
            <DialogDescription>
              {editingReward
                ? "Update the reward details."
                : "Create a new reward for your loyalty program."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Free Manicure" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="What the customer gets..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="points_cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Points Cost</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">
                  {editingReward ? "Save Changes" : "Create Reward"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Reward</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deletingReward?.name}"? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
