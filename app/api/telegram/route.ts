import { NextResponse } from "next/server"

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const TELEGRAM_API = BOT_TOKEN ? `https://api.telegram.org/bot${BOT_TOKEN}` : null

async function sendMessage(chatId: number, text: string) {
  if (!TELEGRAM_API) {
    console.warn("Message received but TELEGRAM_BOT_TOKEN is not set")
    return
  }

  const payload = {
    chat_id: chatId,
    text,
    parse_mode: "HTML", // allow basic styling
    disable_web_page_preview: true,
  }

  const resp = await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  if (!resp.ok) {
    const body = await resp.text()
    console.error("Failed to sendMessage:", resp.status, body)
  }
}

async function answerInlineQuery(inlineQueryId: string) {
  if (!TELEGRAM_API) {
    console.warn("Inline query received but TELEGRAM_BOT_TOKEN is not set")
    return
  }

  const payload = {
    inline_query_id: inlineQueryId,
    // Return a single simple result that sends "hi"
    results: [
      {
        type: "article",
        id: "hi-1",
        title: "Send hi",
        description: "Reply with a friendly hi",
        input_message_content: {
          message_text: "<b>hi</b>",
          parse_mode: "HTML",
        },
      },
    ],
    cache_time: 0, // avoid caching while iterating
    is_personal: true,
  }

  const resp = await fetch(`${TELEGRAM_API}/answerInlineQuery`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  if (!resp.ok) {
    const text = await resp.text()
    console.error("Failed to answer inline query:", resp.status, text)
  }
}

export async function POST(req: Request) {
  try {
    const update = await req.json()

    if (update?.message?.chat?.id) {
      const styledReply = [
        "<b>Hi there!</b>",
        "This reply uses basic HTML styling.",
        "Try an inline query too: @YourBotName <i>word</i>.",
      ].join("\n")
      await sendMessage(update.message.chat.id, styledReply)
    }

    if (update?.inline_query?.id) {
      await answerInlineQuery(update.inline_query.id)
    }

    // Always acknowledge Telegram's webhook call quickly
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Error handling Telegram update:", error)
    return NextResponse.json({ ok: false })
  }
}
