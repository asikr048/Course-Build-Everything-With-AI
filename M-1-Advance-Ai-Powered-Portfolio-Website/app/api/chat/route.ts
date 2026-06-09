import { NextResponse } from "next/server";
import { getDoc } from "@/lib/store";

export const dynamic = "force-dynamic";

interface Message { role: "user" | "assistant"; content: string; }

interface AiSettings {
  provider: string;
  openaiKey: string; openaiModel: string;
  geminiKey: string; geminiModel: string;
  claudeKey: string; claudeModel: string;
  openrouterKey: string; openrouterModel: string;
  assistantName: string;
}

// Build the full site context from all stored documents
async function buildSiteContext(): Promise<string> {
  try {
    const config    = await getDoc<Record<string, string>>("config", {});
    const projects  = await getDoc<{ items: Record<string, unknown>[] }>("projects", { items: [] });
    const career    = await getDoc<{ intro: string; sections: { title: string; items: Record<string, string>[] }[] }>("career", { intro: "", sections: [] });
    const skills    = await getDoc<{ groups: { name: string; items: string[] }[] }>("skills", { groups: [] });

    const projectList = projects.items.map(p =>
      `• ${p.title} (${p.category}, ${p.year}): ${p.description}. Tech: ${(p.tech as string[]).join(", ")}. ${p.link ? `Link: ${p.link}` : ""}`
    ).join("\n");

    const careerList = career.sections.map(s =>
      `${s.title}:\n` + s.items.map(i => `  • ${i.title} at ${i.org || "N/A"} (${i.years}) — ${i.type}`).join("\n")
    ).join("\n\n");

    const skillList = skills.groups.map(g =>
      `${g.name}: ${g.items.join(", ")}`
    ).join("\n");

    return `
=== PORTFOLIO OWNER PROFILE ===
Name: ${config.heroTitle || "N/A"}
Role/Title: ${config.heroSubtitle || "N/A"}
Location: ${config.location || "N/A"}
Email: ${config.email || "N/A"}
About: ${config.aboutText || "N/A"}
GitHub: ${config.github || "N/A"}
LinkedIn: ${config.linkedin || "N/A"}
Twitter: ${config.twitter || "N/A"}

=== PROJECTS ===
${projectList || "No projects listed."}

=== CAREER & EDUCATION ===
${careerList || "No career info listed."}

=== SKILLS ===
${skillList || "No skills listed."}
`.trim();
  } catch {
    return "Portfolio data unavailable.";
  }
}

// ── Provider callers ──────────────────────────────────────────────

async function callOpenAI(key: string, model: string, systemPrompt: string, messages: Message[]): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
    body: JSON.stringify({
      model,
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      max_tokens: 400,
      temperature: 0.5,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI error: ${err}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "No response.";
}

async function callGemini(key: string, model: string, systemPrompt: string, messages: Message[]): Promise<string> {
  // Strip any legacy version suffix like "-001" for newer API
  const modelId = model.trim();
  // Build Gemini contents — inject system prompt as first user turn if needed
  const contents = messages.map(m => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents,
        generationConfig: { maxOutputTokens: 600, temperature: 0.5 },
      }),
    }
  );
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini error: ${err}`);
  }
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "No response.";
}

async function callClaude(key: string, model: string, systemPrompt: string, messages: Message[]): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 400,
      system: systemPrompt,
      messages,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Claude error: ${err}`);
  }
  const data = await res.json();
  return data.content?.[0]?.text ?? "No response.";
}

async function callOpenRouter(key: string, model: string, systemPrompt: string, messages: Message[]): Promise<string> {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${key}`,
      "HTTP-Referer": "https://portfolio.local",
      "X-Title": "Portfolio AI Assistant",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      max_tokens: 400,
      temperature: 0.5,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenRouter error: ${err}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "No response.";
}

// ── Main handler ─────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const { messages }: { messages: Message[] } = await req.json();

    if (!messages?.length) {
      return NextResponse.json({ error: "No messages provided" }, { status: 400 });
    }

    const settings = await getDoc<AiSettings>("ai-settings", {} as AiSettings);
    const siteContext = await buildSiteContext();

    const systemPrompt = `You are a concise AI assistant for a personal portfolio website. Answer questions about the portfolio owner using ONLY the data below.

Rules:
- Use ONLY the data provided. Never invent details.
- If info isn't in the data, say: "I don't have that info — reach out via the contact page."
- Keep replies short (2-4 sentences max). Be friendly and professional.
- Don't mention you're an AI or discuss your model/technology.

PORTFOLIO DATA:
${siteContext}
END DATA`;

    const { provider } = settings;

    let reply: string;

    if (provider === "openai") {
      if (!settings.openaiKey) throw new Error("OpenAI API key not configured. Please add it in the admin AI settings.");
      reply = await callOpenAI(settings.openaiKey, settings.openaiModel, systemPrompt, messages);
    } else if (provider === "gemini") {
      if (!settings.geminiKey) throw new Error("Gemini API key not configured. Please add it in the admin AI settings.");
      reply = await callGemini(settings.geminiKey, settings.geminiModel, systemPrompt, messages);
    } else if (provider === "claude") {
      if (!settings.claudeKey) throw new Error("Claude API key not configured. Please add it in the admin AI settings.");
      reply = await callClaude(settings.claudeKey, settings.claudeModel, systemPrompt, messages);
    } else if (provider === "openrouter") {
      if (!settings.openrouterKey) throw new Error("OpenRouter API key not configured. Please add it in the admin AI settings.");
      reply = await callOpenRouter(settings.openrouterKey, settings.openrouterModel, systemPrompt, messages);
    } else {
      throw new Error("No AI provider configured. Please set one up in the admin AI settings.");
    }

    return NextResponse.json({ reply });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
