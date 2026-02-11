import { useState } from "react"
import { useParams, useNavigate, Link } from "react-router"
import { toast } from "sonner"
import {
  ArrowLeft,
  DollarSign,
  Star,
  CalendarDays,
  Pencil,
  Trash2,
  Plus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useCustomer, useUpdateCustomer, useDeleteCustomer } from "@/hooks/use-customers"
import { usePointsTransactions } from "@/hooks/use-points-transactions"
import { RecordVisitDialog } from "@/components/customers/record-visit-dialog"
import { RedeemRewardDialog } from "@/components/customers/redeem-reward-dialog"
import { AdjustPointsDialog } from "@/components/customers/adjust-points-dialog"
import { PointsHistoryTable } from "@/components/customers/points-history-table"

export default function CustomerDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: customer, isLoading, refetch } = useCustomer(id!)
  const { data: transactions, isLoading: txLoading, refetch: refetchTx } = usePointsTransactions(id!)
  const { mutate: updateCustomer } = useUpdateCustomer()
  const { mutate: deleteCustomer } = useDeleteCustomer()

  const [visitDialogOpen, setVisitDialogOpen] = useState(false)
  const [redeemDialogOpen, setRedeemDialogOpen] = useState(false)
  const [adjustDialogOpen, setAdjustDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState("")
  const [editPhone, setEditPhone] = useState("")
  const [editEmail, setEditEmail] = useState("")
  const [editNotes, setEditNotes] = useState("")

  function startEditing() {
    if (!customer) return
    setEditName(customer.name)
    setEditPhone(customer.phone || "")
    setEditEmail(customer.email || "")
    setEditNotes(customer.notes || "")
    setEditing(true)
  }

  async function saveEdit() {
    if (!customer) return
    try {
      await updateCustomer(customer.id, {
        name: editName,
        phone: editPhone || null,
        email: editEmail || null,
        notes: editNotes || null,
      })
      toast.success("Customer updated")
      setEditing(false)
      refetch()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update")
    }
  }

  async function handleDelete() {
    if (!customer) return
    try {
      await deleteCustomer(customer.id)
      toast.success("Customer deleted")
      navigate("/customers")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete")
    }
  }

  function handleVisitSuccess() {
    refetch()
    refetchTx()
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Customer not found.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/customers">Back to Customers</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/customers">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold">{customer.name}</h1>
          <p className="text-muted-foreground text-sm">
            Customer since {new Date(customer.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button onClick={() => setVisitDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Record Visit
          </Button>
          <Button variant="secondary" onClick={() => setRedeemDialogOpen(true)}>
            Redeem
          </Button>
          <Button variant="secondary" onClick={() => setAdjustDialogOpen(true)}>
            Adjust Points
          </Button>
          <Button variant="outline" onClick={startEditing}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline" onClick={() => setDeleteDialogOpen(true)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Star className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{customer.points_balance}</p>
                <p className="text-sm text-muted-foreground">Points Balance</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                <CalendarDays className="h-5 w-5 text-green-700" />
              </div>
              <div>
                <p className="text-2xl font-bold">{customer.total_visits}</p>
                <p className="text-sm text-muted-foreground">Total Visits</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <DollarSign className="h-5 w-5 text-blue-700" />
              </div>
              <div>
                <p className="text-2xl font-bold">${Number(customer.total_spent).toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">Total Spent</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info / Edit Section */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent>
          {editing ? (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Name</label>
                <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Phone</label>
                <Input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Email</label>
                <Input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Notes</label>
                <Textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)} />
              </div>
              <div className="flex gap-2">
                <Button onClick={saveEdit}>Save</Button>
                <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Phone</span>
                <span className="text-sm">{customer.phone || "Not provided"}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Email</span>
                <span className="text-sm">{customer.email || "Not provided"}</span>
              </div>
              {customer.notes && (
                <>
                  <Separator />
                  <div>
                    <span className="text-sm text-muted-foreground">Notes</span>
                    <p className="text-sm mt-1">{customer.notes}</p>
                  </div>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Points History */}
      <Card>
        <CardHeader>
          <CardTitle>Points History</CardTitle>
        </CardHeader>
        <CardContent>
          <PointsHistoryTable transactions={transactions} isLoading={txLoading} />
        </CardContent>
      </Card>

      {/* Record Visit Dialog */}
      <RecordVisitDialog
        customer={customer}
        pointsPerDollar={1}
        open={visitDialogOpen}
        onOpenChange={setVisitDialogOpen}
        onSuccess={handleVisitSuccess}
      />

      {/* Redeem Reward Dialog */}
      <RedeemRewardDialog
        customer={customer}
        open={redeemDialogOpen}
        onOpenChange={setRedeemDialogOpen}
        onSuccess={handleVisitSuccess}
      />

      {/* Adjust Points Dialog */}
      <AdjustPointsDialog
        customer={customer}
        open={adjustDialogOpen}
        onOpenChange={setAdjustDialogOpen}
        onSuccess={handleVisitSuccess}
      />

      {/* Delete Confirmation */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Customer</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {customer.name}? This action cannot be undone.
              All points history will also be deleted.
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
