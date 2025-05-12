"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table"
import { Badge } from "@repo/ui/badge"
import { CheckCircle, Clock, XCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getCommunicationLogsByCampaignId } from "@/lib/api/communication-logs"
import { formatDate } from "@/lib/utils"

export default function DeliveryLogs({ campaignId }: { campaignId: string }) {
  const { toast } = useToast()
  const [logs, setLogs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setIsLoading(true)
        const data = await getCommunicationLogsByCampaignId(campaignId)
        setLogs(data)
      } catch (error) {
        console.error("Error fetching delivery logs:", error)
        toast({
          title: "Error",
          description: "Failed to load delivery logs. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchLogs()

    // Poll for updates every 5 seconds
    const interval = setInterval(fetchLogs, 5000)

    return () => clearInterval(interval)
  }, [campaignId, toast])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3 w-3" /> Pending
          </Badge>
        )
      case "SENT":
        return (
          <Badge variant="success" className="gap-1">
            <CheckCircle className="h-3 w-3" /> Sent
          </Badge>
        )
      case "FAILED":
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
    return <div>Loading delivery logs...</div>
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-muted-foreground">No delivery logs available yet.</p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Customer</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Sent At</TableHead>
          <TableHead>Updated At</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {logs.map((log) => (
          <TableRow key={log.id}>
            <TableCell className="font-medium">{log.customer.name}</TableCell>
            <TableCell>{log.customer.email}</TableCell>
            <TableCell>{getStatusBadge(log.status)}</TableCell>
            <TableCell>{formatDate(log.createdAt)}</TableCell>
            <TableCell>{log.statusUpdatedAt ? formatDate(log.statusUpdatedAt) : "-"}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
