"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowLeft, ArrowUpRight, MessageCircle, X } from "lucide-react"

import { useLanguage } from "@/hooks/use-language"

import styles from "./floating-chat.module.css"

export function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const triggerButtonRef = useRef<HTMLButtonElement>(null)
  const { t } = useLanguage()

  const questions = [
    { key: "whoWeAre", label: t.chat.questions.whoWeAre, answer: t.chat.answers.whoWeAre },
    { key: "whatWeDo", label: t.chat.questions.whatWeDo, answer: t.chat.answers.whatWeDo },
    { key: "contact", label: t.chat.questions.contact, answer: t.chat.answers.contact },
  ]

  useEffect(() => {
    if (!isOpen) return

    closeButtonRef.current?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return

      setIsOpen(false)
      setSelectedQuestion(null)
      triggerButtonRef.current?.focus()
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen])

  const closeChat = () => {
    setIsOpen(false)
    setSelectedQuestion(null)
    triggerButtonRef.current?.focus()
  }

  return (
    <div className={styles.chat}>
      {isOpen && (
        <section
          id="buxdev-help-panel"
          className={styles.panel}
          role="dialog"
          aria-modal="false"
          aria-labelledby="buxdev-help-title"
        >
          <header className={styles.panelHeader}>
            <div>
              <span aria-hidden="true" />
              <h2 id="buxdev-help-title">{t.chat.title}</h2>
            </div>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={closeChat}
              className={styles.closeButton}
              aria-label={t.chat.close}
            >
              <X aria-hidden="true" />
            </button>
          </header>

          <div className={styles.panelBody}>
            {selectedQuestion ? (
              <div className={styles.answer} aria-live="polite">
                <p>
                  {questions.find((q) => q.key === selectedQuestion)?.answer}
                </p>
                <button type="button" onClick={() => setSelectedQuestion(null)} className={styles.backButton}>
                  <ArrowLeft aria-hidden="true" />
                  <span>{t.chat.back}</span>
                </button>
              </div>
            ) : (
              <div className={styles.questions}>
                {questions.map((question) => (
                  <button
                    type="button"
                    key={question.key}
                    className={styles.question}
                    onClick={() => setSelectedQuestion(question.key)}
                  >
                    <span>{question.label}</span>
                    <ArrowUpRight aria-hidden="true" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      <button
        ref={triggerButtonRef}
        type="button"
        onClick={() => {
          setIsOpen((current) => !current)
          if (isOpen) setSelectedQuestion(null)
        }}
        className={styles.trigger}
        aria-label={isOpen ? t.chat.close : t.chat.open}
        aria-expanded={isOpen}
        aria-controls="buxdev-help-panel"
      >
        {isOpen ? <X aria-hidden="true" /> : <MessageCircle aria-hidden="true" />}
      </button>
    </div>
  )
}
