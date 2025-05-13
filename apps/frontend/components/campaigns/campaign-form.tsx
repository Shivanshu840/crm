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
import { AlertCircle, Sparkles } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Card, CardContent } from "@/components/ui/card"

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
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false)
  const [objective, setObjective] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      name,
      messageTemplate,
      executeNow,
    })
  }

  const generateSuggestions = async () => {
    if (!segment?.name) {
      return
    }

    try {
      setIsGeneratingSuggestions(true)
      const response = await fetch("https://crm-h0gd.onrender.com/api/ai/message-suggestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          segmentName: segment.name,
          objective: objective || "increase engagement",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate suggestions")
      }

      const data = await response.json()
      setSuggestions(data.suggestions || [])
    } catch (error) {
      console.error("Error generating suggestions:", error)
    } finally {
      setIsGeneratingSuggestions(false)
    }
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
        <div className="flex gap-2">
          <div className="flex-1">
            <Textarea
              id="messageTemplate"
              value={messageTemplate}
              onChange={(e) => setMessageTemplate(e.target.value)}
              placeholder="Hi {name}, here's a special offer just for you!"
              rows={5}
              required
            />
          </div>
          {segment && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 shrink-0 self-start"
                  disabled={isGeneratingSuggestions}
                >
                  <Sparkles className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <div className="p-4 pb-0">
                  <div className="space-y-2">
                    <h4 className="font-medium">AI Message Suggestions</h4>
                    <p className="text-sm text-muted-foreground">Generate message templates with AI</p>
                    <div className="space-y-2">
                      <Label htmlFor="objective">Campaign Objective</Label>
                      <Input
                        id="objective"
                        value={objective}
                        onChange={(e) => setObjective(e.target.value)}
                        placeholder="e.g., increase sales, promote new product"
                      />
                    </div>
                    <Button onClick={generateSuggestions} className="w-full" disabled={isGeneratingSuggestions}>
                      {isGeneratingSuggestions ? "Generating..." : "Generate Suggestions"}
                    </Button>
                  </div>
                </div>
                {suggestions.length > 0 && (
                  <div className="p-4 pt-0">
                    <div className="mt-4 space-y-2">
                      {suggestions.map((suggestion, index) => (
                        <Card
                          key={index}
                          className="cursor-pointer hover:bg-accent"
                          onClick={() => setMessageTemplate(suggestion)}
                        >
                          <CardContent className="p-3">
                            <p className="text-sm">{suggestion}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          )}
        </div>
        <p className="text-xs text-muted-foreground">Use {"{name}"} to include the customer's name in your message.</p>
      </div>
      {segment && (
        <Alert variant="default" className="mt-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            Click the sparkles icon to generate AI-powered message suggestions based on your campaign objective.
          </AlertDescription>
        </Alert>
      )}

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
