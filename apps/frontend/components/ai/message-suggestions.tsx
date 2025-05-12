"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Loader2, MessageSquare } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getMessageSuggestions } from "@/lib/api/ai"

type MessageSuggestionsProps = {
  segmentName: string
  onSelectMessage: (message: string) => void
}

export default function MessageSuggestions({ segmentName, onSelectMessage }: MessageSuggestionsProps) {
  const [objective, setObjective] = useState("bring back inactive users")
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [selectedMessage, setSelectedMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const objectives = [
    { value: "bring back inactive users", label: "Bring back inactive users" },
    { value: "promote new products", label: "Promote new products" },
    { value: "offer discount", label: "Offer a discount" },
    { value: "announce event", label: "Announce an event" },
  ]

  const handleGenerateSuggestions = async () => {
    try {
      setIsLoading(true)
      const { suggestions } = await getMessageSuggestions(segmentName, objective)
      setSuggestions(suggestions)
    } catch (error) {
      console.error("Error generating message suggestions:", error)
      toast({
        title: "Error",
        description: "Failed to generate message suggestions. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectMessage = (message: string) => {
    setSelectedMessage(message)
    onSelectMessage(message)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          AI Message Suggestions
        </CardTitle>
        <CardDescription>Generate personalized message suggestions based on your campaign objective.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Campaign Objective</Label>
          <RadioGroup value={objective} onValueChange={setObjective} className="grid grid-cols-2 gap-2">
            {objectives.map((obj) => (
              <div key={obj.value} className="flex items-center space-x-2">
                <RadioGroupItem value={obj.value} id={obj.value} />
                <Label htmlFor={obj.value}>{obj.label}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <Button onClick={handleGenerateSuggestions} disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            "Generate Suggestions"
          )}
        </Button>

        {suggestions.length > 0 && (
          <div className="space-y-3 mt-4">
            <Label>Select a message template:</Label>
            <RadioGroup value={selectedMessage} onValueChange={handleSelectMessage} className="space-y-3">
              {suggestions.map((suggestion, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <RadioGroupItem value={suggestion} id={`suggestion-${index}`} className="mt-1" />
                  <Label htmlFor={`suggestion-${index}`} className="font-normal">
                    {suggestion}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
