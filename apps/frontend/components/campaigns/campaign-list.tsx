"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, CheckCircle, Clock, Mail, XCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getCampaigns } from "@/lib/api/campaigns"
import { formatDate } from "@/lib/utils"

export default function CampaignList() {
  const { toast } = useToast()
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setIsLoading(true)
        const data = await getCampaigns()
        setCampaigns(data)
      } catch (error) {
        console.error("Error fetching campaigns:", error)
        toast({
          title: "Error",
          description: "Failed to load campaigns. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchCampaigns()
  }, [toast])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return (
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3 w-3" /> Scheduled
          </Badge>
        )
      case "in_progress":
        return (
          <Badge variant="secondary" className="gap-1">
            <Mail className="h-3 w-3" /> In Progress
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="secondary" className="gap-1">
            <CheckCircle className="h-3 w-3" /> Completed
          </Badge>
        )
      case "failed":
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" /> Failed
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (isLoading) {
    return <div>Loading campaigns...</div>
  }

  if (campaigns.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">No campaigns found. Create your first campaign to get started.</p>
        <Link href="/segments/create">
          <Button>Create Campaign</Button>
        </Link>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Segment</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Audience</TableHead>
          <TableHead>Sent/Failed</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {campaigns.map((campaign) => (
          <TableRow key={campaign.id}>
            <TableCell className="font-medium">{campaign.name}</TableCell>
            <TableCell>{campaign.segment.name}</TableCell>
            <TableCell>{getStatusBadge(campaign.status)}</TableCell>
            <TableCell>{campaign.audienceSize}</TableCell>
            <TableCell>
              {campaign.sentCount}/{campaign.failedCount}
            </TableCell>
            <TableCell>{formatDate(campaign.createdAt)}</TableCell>
            <TableCell className="text-right">
              <Link href={`/campaigns/${campaign.id}`}>
                <Button variant="ghost" size="icon">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
