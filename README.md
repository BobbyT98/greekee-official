# Greekee 🥣

Strained Greek-style yogurt bowls, made fresh in Punggol & Hougang, Singapore.

This repo hosts the customer-facing order page for Greekee — a single-page site where customers browse the menu, build a custom bowl, and send their order straight to WhatsApp for confirmation and payment.

**Live site:** [add your Vercel link here once deployed]

---

## What this is

A static, self-contained landing page — no backend, no database. Orders are collated in-browser and handed off to WhatsApp via a pre-filled message link (`wa.me`). Keeps things simple for a home-based food business at this stage.

## Features

- 🥣 Four signature bowls + a Build-Your-Own option with toppings
- 🛒 Cart with quantity controls, live total, and per-bowl extra toppings
- 📍 Pickup scheduling (same-day + up to 7 days ahead) across two locations
- 🚚 Delivery with area-based fees and free-delivery threshold
- 📱 WhatsApp checkout — no accounts, no payment gateway needed

## Tech

Plain HTML, CSS, and JavaScript in a single `index.html` file. No build step, no dependencies. Deployed on [Vercel](https://vercel.com) directly from this repo — any commit to `main` auto-deploys.

## Making changes

Menu items, prices, and toppings currently live directly inside `index.html`. To update the menu, edit that file and commit the change — Vercel will redeploy automatically within about a minute.

## Known limitations

- No order history is kept on the business side — orders exist only in WhatsApp chat history
- No payment enforcement; payment is arranged manually after ordering
- Menu changes require editing the HTML file directly (no admin panel)

---

Made with 🍯 for Greekee.
