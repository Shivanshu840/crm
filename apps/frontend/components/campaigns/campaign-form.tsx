"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"

type CampaignFormProps = {
  onSubmit: (data: {
    name: string
    messageTemplate: string
    executeNow: boolean
  }) => void
  isLoading?: boolean
  segment?: any
}

export default function CampaignForm({ onSubmit, isLoading = false, segment }: CampaignFormProps) {
  const [name, setName] = useState("")
  const [messageTemplate, setMessageTemplate] = useState("Hi {name}, here's a special offer just for you!")
  const [executeNow, setExecuteNow] = useState(true)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      name,
      messageTemplate,
      executeNow,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Campaign Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Spring Sale Campaign"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="messageTemplate">Message Template</Label>
        <Textarea
          id="messageTemplate"
          value={messageTemplate}
          onChange={(e) => setMessageTemplate(e.target.value)}
          placeholder="Hi {name}, here's a special offer just for you!"
          rows={5}
          required
        />
        <p className="text-xs text-muted-foreground">Use {"{name}"} to include the customer's name in your message.</p>
      </div>

      {segment && (
        <Alert>
          <InfoIcon className="h-4 w-4" />
          <AlertDescription>
            This campaign will be sent to <strong>{segment.audienceSize}</strong> customers in the{" "}
            <strong>{segment.name}</strong> segment.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center space-x-2">
        <Switch id="executeNow" checked={executeNow} onCheckedChange={setExecuteNow} />
        <Label htmlFor="executeNow">Execute campaign immediately after creation</Label>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Creating Campaign..." : "Create Campaign"}
      </Button>
    </form>
  )
}
