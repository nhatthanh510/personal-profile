import { useState, useEffect } from "react"
import { useNavigate } from "react-router"
import { toast } from "sonner"
import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { createAndSendCampaign } from "@/lib/services/campaign-service"
import { countCustomersBySegment, fieldLabels, operatorLabels } from "@/lib/segments"
import type { SegmentFilter, SegmentRule } from "@/types/database.types"

export default function CampaignNew() {
  const navigate = useNavigate()

  const [name, setName] = useState("")
  const [type, setType] = useState<"sms" | "email">("sms")
  const [subject, setSubject] = useState("")
  const [body, setBody] = useState("")

  const [useSegment, setUseSegment] = useState(false)
  const [rules, setRules] = useState<SegmentRule[]>([])
  const [logic] = useState<"and" | "or">("and")

  const [audienceCount, setAudienceCount] = useState<number | null>(null)
  const [isCountLoading, setIsCountLoading] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [isSending, setIsSending] = useState(false)

  // Compute segment filter
  const segmentFilter: SegmentFilter | null =
    useSegment && rules.length > 0
      ? { rules, logic }
      : null

  // Live audience count
  useEffect(() => {
    async function updateCount() {
      setIsCountLoading(true)
      try {
        const count = await countCustomersBySegment(segmentFilter)
        setAudienceCount(count)
      } catch {
        setAudienceCount(null)
      }
      setIsCountLoading(false)
    }
    updateCount()
  }, [useSegment, rules, logic])

  function addRule() {
    setRules([...rules, { field: "total_visits", operator: "gte", value: 1 }])
  }

  function removeRule(index: number) {
    setRules(rules.filter((_, i) => i !== index))
  }

  function updateRule(index: number, updates: Partial<SegmentRule>) {
    setRules(
      rules.map((rule, i) =>
        i === index ? { ...rule, ...updates } : rule
      )
    )
  }

  async function handleSend() {
    if (!name.trim()) {
      toast.error("Campaign name is required")
      return
    }
    if (!body.trim()) {
      toast.error("Message body is required")
      return
    }

    setIsSending(true)
    try {
      const result = await createAndSendCampaign({
        name,
        type,
        subject: type === "email" ? subject : undefined,
        body,
        segment_filter: segmentFilter,
      })
      toast.success(`Campaign sent to ${result.recipientCount} customers`)
      navigate("/campaigns")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send campaign")
    } finally {
      setIsSending(false)
      setConfirmOpen(false)
    }
  }

  const smsCharCount = body.length
  const smsSegments = Math.ceil(smsCharCount / 160) || 1

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Create Campaign</h1>
        <p className="text-muted-foreground mt-1">
          Set up a new marketing campaign for your customers.
        </p>
      </div>

      {/* Step 1: Basics */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Campaign Name</Label>
            <Input
              placeholder="e.g. Valentine's Day Promo"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as "sms" | "email")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sms">SMS</SelectItem>
                <SelectItem value="email">Email</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Step 2: Audience */}
      <Card>
        <CardHeader>
          <CardTitle>Audience</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={useSegment}
                onChange={(e) => setUseSegment(e.target.checked)}
                className="rounded"
              />
              Filter by customer attributes
            </label>
          </div>

          {useSegment && (
            <div className="space-y-3 pl-6">
              {rules.map((rule, i) => (
                <div key={i} className="flex items-center gap-2">
                  {i > 0 && (
                    <span className="text-xs text-muted-foreground uppercase font-medium w-8">
                      {logic}
                    </span>
                  )}
                  <Select
                    value={rule.field}
                    onValueChange={(v) =>
                      updateRule(i, { field: v as SegmentRule["field"] })
                    }
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(fieldLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={rule.operator}
                    onValueChange={(v) =>
                      updateRule(i, { operator: v as SegmentRule["operator"] })
                    }
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(operatorLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Input
                    type="number"
                    className="w-24"
                    value={rule.value}
                    onChange={(e) =>
                      updateRule(i, { value: parseFloat(e.target.value) || 0 })
                    }
                  />

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeRule(i)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <Button variant="outline" size="sm" onClick={addRule}>
                <Plus className="h-3 w-3 mr-1" />
                Add Rule
              </Button>
            </div>
          )}

          <Separator />

          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Audience:</span>
            {isCountLoading ? (
              <span className="text-muted-foreground">Counting...</span>
            ) : (
              <Badge variant="secondary">
                {audienceCount ?? 0} customer{audienceCount !== 1 ? "s" : ""}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Step 3: Compose */}
      <Card>
        <CardHeader>
          <CardTitle>Compose Message</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {type === "email" && (
            <div className="space-y-2">
              <Label>Subject Line</Label>
              <Input
                placeholder="e.g. Special offer just for you!"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>
              Message Body
              {type === "sms" && (
                <span className="text-muted-foreground font-normal ml-2">
                  {smsCharCount}/160 ({smsSegments} segment{smsSegments > 1 ? "s" : ""})
                </span>
              )}
            </Label>
            <Textarea
              placeholder={
                type === "sms"
                  ? "Hi {{name}}, we miss you at Nail Store! Come in this week for 20% off..."
                  : "Write your email message here..."
              }
              rows={6}
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Available template variables: {"{{name}}"}, {"{{points_balance}}"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          onClick={() => setConfirmOpen(true)}
          disabled={!name.trim() || !body.trim() || audienceCount === 0}
        >
          Send Campaign
        </Button>
        <Button variant="outline" onClick={() => navigate("/campaigns")}>
          Cancel
        </Button>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Campaign</DialogTitle>
            <DialogDescription>
              You are about to send "{name}" to {audienceCount} customer
              {audienceCount !== 1 ? "s" : ""} via {type.toUpperCase()}.
              {"\n\n"}This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSend} disabled={isSending}>
              {isSending ? "Sending..." : "Confirm & Send"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
