// api/chat.js
// Vercel serverless function. Lives at the URL path /api/chat.
// Holds the Anthropic API key server-side and proxies the request.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: "Server missing ANTHROPIC_API_KEY. Set it in Vercel → Settings → Environment Variables, then redeploy."
    });
  }

  try {
    const { messages, system, model, max_tokens } = req.body || {};

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Body must include a non-empty messages array." });
    }

    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: model || "claude-sonnet-4-20250514",
        max_tokens: max_tokens || 1000,
        system,
        messages,
      }),
    });

    const data = await anthropicRes.json();

    if (!anthropicRes.ok) {
      return res.status(anthropicRes.status).json({
        error: data?.error?.message || "Anthropic API error",
        details: data,
      });
    }

    const text = (data.content || [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("");

    return res.status(200).json({ text, raw: data });
  } catch (err) {
    return res.status(500).json({ error: String(err?.message || err) });
  }
}
