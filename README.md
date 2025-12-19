# Ety — Telegram Mini App for ety.ai

## Index
1. Overview  
2. Track Description  
3. What This Project Does  
4. Key Features  
5. Technologies Used  
6. Project Structure  
7. Bonus Features Implemented  
8. Bot & Deployment  
9. Notes for Reviewers  

---

## 1. Overview

**Ety** is a Telegram Mini App that brings the functionality of **ety.ai** directly into Telegram.  
It allows users to search for a word, instantly view its etymology, mnemonic, and short story, and share the result into Telegram chats or groups without leaving the app.

The goal is to make word exploration fast, contextual, and native to the Telegram experience.

---

## 2. Track Description

This project is submitted under:

**💬 Track 3: Telegram Mini App**  
> Build a Telegram Mini App that allows users to search, explore, and share ety.ai word results directly in Telegram.

---

## 3. What This Project Does

- Lets users search for any word inside Telegram
- Fetches real-time etymology data from the ety.ai API
- Displays:
  - Word
  - Etymology
  - Mnemonic (if available)
  - Short story (if available)
- Pushes formatted results back into Telegram chat context
- Enables one-click sharing of results to groups or individual chats

All interactions happen within the Telegram Mini App environment.

---

## 4. Key Features

### Word Search
Users can type a word and retrieve structured etymology data instantly.

### Clean Reading Experience
Results are displayed using card-based UI sections for clarity and readability.

### Telegram-Native Sharing
Results can be shared directly to Telegram chats or groups using Telegram’s share URL flow.

### Telegram User Context
The app detects the Telegram user ID when opened inside Telegram and uses it to send messages back to the chat.

---

## 5. Technologies Used

### Frontend
- **Next.js (App Router)**
- **React (Client Components)**
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui** for UI components
- **lucide-react** for icons

### Telegram Integration
- **@tma.js/sdk** for:
  - Mini App initialization
  - Accessing launch parameters
  - Telegram WebApp context

### Backend / API
- **ety.ai public API** for etymology data
- **Next.js API routes** for sending messages back to Telegram

---

## 6. Project Structure

app/
├── api/                 # Telegram message send endpoint
├── layout.tsx           # App layout
├── page.tsx             # Main Mini App UI
├── loading.tsx          # Loading state
components/                # Reusable UI components
lib/                        # Helpers and utilities
public/                     # Static assets
styles/                     # Global styles


The app is built entirely using the Next.js App Router and client-side rendering for Telegram compatibility.

---

## 7. Bonus Features Implemented

**✔ Share to Group**  
Users can share word results directly to Telegram groups or chats using Telegram’s native share mechanism.

(Login and AI-generated summaries were not implemented in this version.)

---

## 8. Bot & Deployment

- **Telegram Bot:** `@etytelegrambot`  
- **Mini App URL:** https://telegramety.vercel.app  

The Mini App is launched via the Telegram bot and runs as a web-based Mini App hosted on Vercel.

---

## 9. Notes for Reviewers

- The Mini App must be opened from within Telegram for full functionality.
- Telegram user context is automatically detected via launch parameters.
- The UI is optimized for mobile-first usage inside Telegram.
- The app is production-ready and deployed using standard Next.js workflows.

---

**Powered by ety.ai**
