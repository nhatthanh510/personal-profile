import { Link } from "react-router"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
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
import { useCampaigns } from "@/hooks/use-campaigns"
import type { CampaignStatus, CampaignType } from "@/types/database.types"

function statusBadge(status: CampaignStatus) {
  const variants: Record<CampaignStatus, string> = {
    draft: "bg-gray-100 text-gray-800",
    scheduled: "bg-yellow-100 text-yellow-800",
    sending: "bg-blue-100 text-blue-800",
    sent: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
  }
  return (
    <Badge className={`${variants[status]} hover:${variants[status]}`}>
      {status}
    </Badge>
  )
}

function typeBadge(type: CampaignType) {
  return (
    <Badge variant="outline">
      {type.toUpperCase()}
    </Badge>
  )
}

export default function CampaignList() {
  const { data: campaigns, isLoading } = useCampaigns()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Campaigns</h1>
          <p className="text-muted-foreground mt-1">
            Manage your SMS and email marketing campaigns.
          </p>
        </div>
        <Button asChild>
          <Link to="/campaigns/new">
            <Plus className="h-4 w-4 mr-2" />
            New Campaign
          </Link>
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Sent At</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : campaigns.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                  No campaigns yet. Create your first campaign to start reaching customers.
                </TableCell>
              </TableRow>
            ) : (
              campaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell className="font-medium">{campaign.name}</TableCell>
                  <TableCell>{typeBadge(campaign.type)}</TableCell>
                  <TableCell>{statusBadge(campaign.status)}</TableCell>
                  <TableCell>
                    {campaign.sent_at
                      ? new Date(campaign.sent_at).toLocaleDateString()
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {new Date(campaign.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
