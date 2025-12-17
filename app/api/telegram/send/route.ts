import { NextResponse } from "next/server"

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const TELEGRAM_API = BOT_TOKEN ? `https://api.telegram.org/bot${BOT_TOKEN}` : null

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (c) => {
    switch (c) {
      case "&":
        return "&amp;"
      case "<":
        return "&lt;"
      case ">":
        return "&gt;"
      case '"':
        return "&quot;"
      case "'":
        return "&#39;"
      default:
        return c
    }
  })
}

function formatMessage({
  word,
  etymology,
  mnemonic,
  shortStory,
}: {
  word: string
  etymology: string
  mnemonic?: string
  shortStory?: string
}) {
  const parts: string[] = [`<b>${escapeHtml(word)}</b>`]

  if (etymology) {
    parts.push(`<blockquote>${escapeHtml(etymology)}</blockquote>`)
  }

  if (mnemonic) {
    parts.push(`<b>Mnemonic</b>\n<blockquote>${escapeHtml(mnemonic)}</blockquote>`)
  }

  if (shortStory) {
    parts.push(`<b>Short Story</b>\n<blockquote>${escapeHtml(shortStory)}</blockquote>`)
  }

  return parts.join("\n\n")
}

export async function POST(req: Request) {
  if (!TELEGRAM_API) {
    console.warn("Attempted to send Telegram message but TELEGRAM_BOT_TOKEN is not set")
    return NextResponse.json({ ok: false, error: "Missing TELEGRAM_BOT_TOKEN" }, { status: 500 })
  }

  try {
    const { chatId, word, etymology, mnemonic, shortStory } = await req.json()

    if (!chatId || !word || !etymology) {
      return NextResponse.json({ ok: false, error: "chatId, word, and etymology are required" }, { status: 400 })
    }

    const text = formatMessage({ word, etymology, mnemonic, shortStory })

    const resp = await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    })

    if (!resp.ok) {
      const body = await resp.text()
      console.error("Failed to push search result:", resp.status, body)
      return NextResponse.json({ ok: false, error: "Failed to send message" }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Error sending Telegram push:", error)
    return NextResponse.json({ ok: false, error: "Unexpected error" }, { status: 500 })
  }
}
