"use client"

import { useEffect, useState } from "react"
import { Search, Share2, BookOpen, Lightbulb, BookText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { init, retrieveLaunchParams, shareURL } from "@tma.js/sdk"


interface SearchResult {
  word: string
  etymology: string
  mnemonic?: string
  shortStory?: string
}

export default function EtyMiniApp() {
  const [query, setQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<SearchResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<number | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      init()
      const launchParams = retrieveLaunchParams()
      const telegramUserId =
        launchParams?.tgWebAppData?.user?.id ??
        (window as any)?.Telegram?.WebApp?.initDataUnsafe?.user?.id ??
        null
      setUserId(telegramUserId ?? null)
      if (!telegramUserId) {
        console.warn("Telegram user id not found; mini app must be opened from Telegram to send chat replies.")
      }
    } catch (err) {
      console.warn("Telegram SDK init failed:", err)
    }
  }, [])

  const sendResultToTelegram = async (searchResult: SearchResult) => {
    if (!userId) return
    try {
      const resp = await fetch("/api/telegram/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId: userId,
          word: searchResult.word,
          etymology: searchResult.etymology,
          mnemonic: searchResult.mnemonic,
          shortStory: searchResult.shortStory,
        }),
      })
      if (!resp.ok) {
        console.warn("Failed to push styled message to Telegram: response not ok")
      }
    } catch (err) {
      console.warn("Failed to push styled message to Telegram:", err)
    }
  }

  const handleSearch = async () => {
    if (!query.trim()) return

    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch(`https://api.etymology.ai/etymology?word=${encodeURIComponent(query.trim())}`)

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`)
      }

      const data = await response.json()
      const firstEntry = data?.etymology?.[0]

      if (!firstEntry) {
        throw new Error("No etymology found for that word.")
      }

      setResult({
        word: firstEntry.word || query.trim(),
        etymology: firstEntry.etymology || "No etymology returned.",
        mnemonic: firstEntry.mnemonic,
        shortStory: firstEntry.shortStory || firstEntry.short_story,
      })
      await sendResultToTelegram({
        word: firstEntry.word || query.trim(),
        etymology: firstEntry.etymology || "No etymology returned.",
        mnemonic: firstEntry.mnemonic,
        shortStory: firstEntry.shortStory || firstEntry.short_story,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const escapeHTML = (s: string) =>
    s.replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")

  const handleShare = () => {
    if (!result) return

    const text =
      `<b>${escapeHTML(result.word)}</b><br><br>` +
      `<i>${escapeHTML(result.etymology)}</i>` +
      (result.mnemonic
        ? `<br><br><b>Mnemonic</b> — ${escapeHTML(result.mnemonic)}`
        : "") +
      (result.shortStory
        ? `<br><br>${escapeHTML(result.shortStory)}`
        : "")

    const url =
      "https://t.me/share/url?" +
      new URLSearchParams({
        url: "https://telegramety.vercel.app",
        text
      }).toString()

    window.open(url, "_blank")
  }



  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-md px-4 py-6">
        {/* Header */}
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Ety</h1>
            <p className="text-sm text-muted-foreground">Etymology, mnemonic, story — inside Telegram</p>
          </div>
        </header>

        {/* Search Section */}
        <Card className="mb-6 border-border bg-card">
          <CardContent className="p-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Search a word… (e.g., bread)"
                  className="pl-10 bg-secondary border-input text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <Button
                onClick={handleSearch}
                disabled={isLoading}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isLoading ? "..." : "Search"}
              </Button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Tip: press Enter to search fast</p>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <div className="mb-6 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="mt-2 text-sm text-muted-foreground">Looking up "{query}"...</p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && <p className="mb-6 text-sm text-destructive">{error}</p>}

        {/* Results Section */}
        {result && !isLoading && (
          <div className="space-y-4">
            {/* Word Header */}
            <Card className="border-border bg-card">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <h2 className="text-2xl font-bold text-foreground">{result.word}</h2>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleShare}
                    className="border-border text-muted-foreground hover:bg-secondary hover:text-foreground bg-transparent"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Etymology Card */}
            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
                  <BookOpen className="h-4 w-4 text-primary" />
                  Etymology
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-card-foreground">{result.etymology}</p>
              </CardContent>
            </Card>

            {/* Mnemonic Card */}
            {result.mnemonic && (
              <Card className="border-border bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
                    <Lightbulb className="h-4 w-4 text-primary" />
                    Mnemonic
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-card-foreground">{result.mnemonic}</p>
                </CardContent>
              </Card>
            )}

            {/* Story Card */}
            {result.shortStory && (
              <Card className="border-border bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
                    <BookText className="h-4 w-4 text-primary" />
                    Short Story
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-card-foreground">{result.shortStory}</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Footer */}
        <footer className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">Powered by ety.ai</p>
        </footer>
      </div>
    </div>
  )
}
