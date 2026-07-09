# AI Assistant Setup

The first AI feature is "AI 帮我开单" on the order creation page.

## What It Does

- Sales users paste a natural-language material list.
- The backend calls DeepSeek to identify requested materials and quantities.
- The backend validates every matched product against `data/db.json`.
- The frontend fills matched products into the cart only after the sales user confirms.
- Orders are not saved automatically. The sales user still clicks the normal save button.

## Rules

- AI must not create products.
- AI must not change product names, units, or prices.
- Final order lines always use product `id`, `name`, `unit`, and `price` from the local product catalog.
- Unmatched products are not added.
- Unclear products require sales user selection.
- Missing quantities require sales user input.

## Server Environment

Set the DeepSeek API key on the server:

```bash
sudo systemctl edit building-sales-system
```

Add:

```ini
[Service]
Environment=DEEPSEEK_API_KEY=your_deepseek_api_key
Environment=DEEPSEEK_MODEL=deepseek-chat
```

Then reload:

```bash
sudo systemctl daemon-reload
sudo systemctl restart building-sales-system
```

Do not commit API keys to GitHub.

