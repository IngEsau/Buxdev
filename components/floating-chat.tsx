"use client"

import { useState } from "react"
import { MessageCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from "@/hooks/use-language"

export function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null)
  const { t } = useLanguage()

  const questions = [
    { key: "whoWeAre", label: t.chat.questions.whoWeAre, answer: t.chat.answers.whoWeAre },
    { key: "whatWeDo", label: t.chat.questions.whatWeDo, answer: t.chat.answers.whatWeDo },
    { key: "contact", label: t.chat.questions.contact, answer: t.chat.answers.contact },
  ]

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <Card className="mb-4 w-80 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg">{t.chat.title}</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setIsOpen(false)
                setSelectedQuestion(null)
              }}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {selectedQuestion ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {questions.find((q) => q.key === selectedQuestion)?.answer}
                </p>
                <Button variant="outline" size="sm" onClick={() => setSelectedQuestion(null)} className="w-full">
                  ← Volver
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {questions.map((question) => (
                  <Button
                    key={question.key}
                    variant="outline"
                    className="w-full justify-start text-left h-auto py-2 bg-transparent"
                    onClick={() => setSelectedQuestion(question.key)}
                  >
                    <span className="text-sm">{question.label}</span>
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Button
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="h-14 w-14 rounded-full shadow-lg bg-[#2c4c9b] hover:bg-[#4a6bc7] text-white"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>
    </div>
  )
}
