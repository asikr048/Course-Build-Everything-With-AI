"""
╔══════════════════════════════════════════════════════════════════╗
║              AI HARDWARE HUB  —  v1.2.0 (Classic BT)             ║
║  Universal bridge: LLMs ↔ Telegram Bot ↔ Classic Bluetooth (SPP) ║
╚══════════════════════════════════════════════════════════════════╝

DEPENDENCIES (install before running):
    pip install customtkinter pyserial python-telegram-bot openai
              google-generativeai anthropic pyperclip

PACKAGING (build .exe):
    pyinstaller --onefile --windowed --name "AI_Hardware_Hub"
                --icon=hub.ico ai_hardware_hub.py

Author  : AI Hardware Hub Project
License : MIT
"""

# ─── Standard Library ────────────────────────────────────────────
import asyncio
import threading
import json
import sys
import time
import traceback
from datetime import datetime
from queue import Queue, Empty
from typing import Optional

# ─── GUI ─────────────────────────────────────────────────────────
import customtkinter as ctk

# ─── Classic Bluetooth (Serial) ──────────────────────────────────
import serial
import serial.tools.list_ports

# ─── Telegram ────────────────────────────────────────────────────
from telegram import Update
from telegram.ext import (
    Application as TGApplication,
    CommandHandler,
    MessageHandler,
    filters,
    ContextTypes,
)

# ─── LLM Providers ───────────────────────────────────────────────
import openai
import google.generativeai as genai
import anthropic

# ─── Misc ────────────────────────────────────────────────────────
try:
    import pyperclip
    HAS_CLIPBOARD = True
except ImportError:
    HAS_CLIPBOARD = False

# ══════════════════════════════════════════════════════════════════
#  THEME CONSTANTS  —  Futuristic HUD / Sci-Fi Terminal Palette
# ══════════════════════════════════════════════════════════════════
THEME = {
    "bg_root":    "#050a0f",
    "bg_panel":   "#0a1520",
    "bg_widget":  "#0d1e2e",
    "bg_hover":   "#122333",
    "cyan":       "#00d4ff",
    "cyan_dim":   "#007ea8",
    "cyan_glow":  "#00f7ff",
    "green":      "#00ff9d",
    "red":        "#ff3c5a",
    "amber":      "#ffb300",
    "white":      "#d0f0ff",
    "muted":      "#4a7a99",
    "border":     "#1a3a55",
    "font_hud":   ("Consolas", 12),
    "font_title": ("Consolas", 20, "bold"),
    "font_mono":  ("Courier New", 11),
    "font_small": ("Consolas", 10),
    "font_code":  ("Courier New", 11),
    "font_btn":   ("Consolas", 12, "bold"),
    "font_label": ("Consolas", 12),
    "font_big":   ("Consolas", 15, "bold"),
}

# ── LLM Model Catalogue ───────────────────────────────────────────
LLM_MODELS = {
    "OpenAI": [
        # Latest flagship (2025)
        "gpt-4.1",
        "gpt-4.1-mini",
        "gpt-4.1-nano",
        "o3",
        "o4-mini",
        "o3-mini",
        # Proven stable
        "gpt-4o",
        "gpt-4o-mini",
        "gpt-4-turbo",
        # Legacy
        "gpt-3.5-turbo",
    ],
    "Gemini": [
        "gemini-2.5-pro-preview-05-06",
        "gemini-2.5-flash-preview-04-17",
        "gemini-2.0-flash",
        "gemini-2.0-flash-lite",
        "gemini-1.5-pro",
        "gemini-1.5-flash",
    ],
    "Claude": [
        "claude-opus-4-5",
        "claude-sonnet-4-5",
        "claude-haiku-4-5",
        "claude-3-7-sonnet-20250219",
        "claude-3-5-sonnet-20241022",
        "claude-3-5-haiku-20241022",
        "claude-3-opus-20240229",
    ],
    "OpenRouter": [
        # OpenAI via OpenRouter
        "openai/gpt-4.1",
        "openai/gpt-4o",
        "openai/o3-mini",
        # Anthropic via OpenRouter
        "anthropic/claude-opus-4",
        "anthropic/claude-sonnet-4",
        "anthropic/claude-3.5-sonnet",
        # Google via OpenRouter
        "google/gemini-2.5-pro-preview",
        "google/gemini-2.0-flash-001",
        # Meta Llama
        "meta-llama/llama-4-maverick",
        "meta-llama/llama-4-scout",
        "meta-llama/llama-3.3-70b-instruct",
        # Mistral
        "mistralai/mistral-large-2411",
        "mistralai/mistral-small-3.1-24b-instruct",
        # DeepSeek
        "deepseek/deepseek-r1",
        "deepseek/deepseek-chat-v3-0324",
        # Other
        "x-ai/grok-3-beta",
        "microsoft/phi-4",
    ],
}

# ══════════════════════════════════════════════════════════════════
#  BACKGROUND ASYNC ENGINE
# ══════════════════════════════════════════════════════════════════
class AsyncEngine:
    def __init__(self):
        self.loop: asyncio.AbstractEventLoop = asyncio.new_event_loop()
        self._thread = threading.Thread(
            target=self._run_loop, daemon=True, name="AsyncEngine"
        )
        self._thread.start()

    def _run_loop(self):
        asyncio.set_event_loop(self.loop)
        self.loop.run_forever()

    def run(self, coro, callback=None):
        future = asyncio.run_coroutine_threadsafe(coro, self.loop)
        if callback:
            def _done(fut):
                try:
                    callback(fut.result(), None)
                except Exception as exc:
                    callback(None, exc)
            future.add_done_callback(_done)
        return future

    def stop(self):
        self.loop.call_soon_threadsafe(self.loop.stop)


# ══════════════════════════════════════════════════════════════════
#  CLASSIC BLUETOOTH (SERIAL) MANAGER
# ══════════════════════════════════════════════════════════════════
class BTManager:
    """Wraps pyserial for Classic Bluetooth SPP communication."""

    def __init__(self, log_cb):
        self.serial: Optional[serial.Serial] = None
        self.connected = False
        self.log = log_cb
        self._read_task = None
        self._notify_cb = None

    async def scan(self) -> list:
        self.log("[BT] Scanning COM ports for paired Classic BT devices...")
        loop = asyncio.get_event_loop()
        ports = await loop.run_in_executor(None, serial.tools.list_ports.comports)
        result = [
            {"name": p.description or "Unknown Device", "port": p.device}
            for p in ports
        ]
        self.log(f"[BT] Found {len(result)} port(s).")
        return result

    async def connect(self, port: str) -> bool:
        try:
            loop = asyncio.get_event_loop()
            self.serial = await loop.run_in_executor(
                None, lambda: serial.Serial(port, baudrate=115200, timeout=0.1)
            )
            self.connected = True
            self.log(f"[BT] Connected -> {port}")
            self._read_task = asyncio.create_task(self._read_loop())
            return True
        except Exception as exc:
            self.log(f"[BT] Connect failed: {exc}")
            self.connected = False
            return False

    async def disconnect(self):
        self.connected = False
        if self._read_task:
            self._read_task.cancel()
        if self.serial and self.serial.is_open:
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(None, self.serial.close)
        self.log("[BT] Disconnected.")

    async def send(self, payload: dict) -> bool:
        if not self.connected or not self.serial:
            self.log("[BT] Not connected — payload dropped.")
            return False
        try:
            data = (json.dumps(payload) + "\n").encode("utf-8")
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(None, self.serial.write, data)
            self.log(f"[BT -> MCU] {json.dumps(payload)}")
            return True
        except Exception as exc:
            self.log(f"[BT] Send error: {exc}")
            await self.disconnect()
            return False

    async def subscribe(self, callback):
        self._notify_cb = callback
        self.log("[BT] Telemetry listening enabled.")

    async def _read_loop(self):
        loop = asyncio.get_event_loop()
        while self.connected and self.serial and self.serial.is_open:
            try:
                if self.serial.in_waiting > 0:
                    data = await loop.run_in_executor(None, self.serial.readline)
                    if data and self._notify_cb:
                        self._notify_cb(self, bytearray(data))
                else:
                    await asyncio.sleep(0.05)
            except Exception as exc:
                self.log(f"[BT] Read error: {exc}")
                await self.disconnect()
                break


# ══════════════════════════════════════════════════════════════════
#  LLM GATEWAY
# ══════════════════════════════════════════════════════════════════
class LLMGateway:
    def __init__(self, log_cb):
        self.log = log_cb

    # Reasoning / O-series models that do NOT support a system role
    _NO_SYSTEM_ROLE = {"o1", "o1-mini", "o1-preview", "o3", "o3-mini", "o4-mini"}
    # Models that do NOT support response_format json_object
    _NO_JSON_FORMAT  = {"o1", "o1-mini", "o1-preview", "o3", "o4-mini"}

    async def call(self, provider, model, api_key, system_prompt, user_message,
                   expect_json=True):
        raw = ""
        try:
            if provider == "OpenAI":
                raw = await self._call_openai(api_key, model, system_prompt, user_message)
            elif provider == "Gemini":
                raw = await self._call_gemini(api_key, model, system_prompt, user_message)
            elif provider == "Claude":
                raw = await self._call_claude(api_key, model, system_prompt, user_message)
            elif provider == "OpenRouter":
                raw = await self._call_openrouter(api_key, model, system_prompt, user_message)
            else:
                raise ValueError(f"Unknown provider: {provider}")
        except Exception as exc:
            self.log(f"[LLM] {provider} error: {exc}")
            self.log(f"[LLM] Detail: {traceback.format_exc()}")
            return "", None

        self.log(f"[LLM <- {provider}] {raw[:200]}{'...' if len(raw) > 200 else ''}")
        if not expect_json:
            return raw, None

        parsed = self._extract_json(raw)
        if not parsed:
            self.log("[LLM] JSON parse failed — returning raw text only.")
        return raw, parsed

    # ── OpenAI ────────────────────────────────────────────────────
    async def _call_openai(self, key, model, sys_p, user_msg) -> str:
        client    = openai.AsyncOpenAI(api_key=key)
        base_name = model.lower()

        if base_name in self._NO_SYSTEM_ROLE:
            # Reasoning models: merge system prompt into user turn
            messages = [{"role": "user", "content": f"{sys_p}\n\n{user_msg}"}]
        else:
            messages = [
                {"role": "system", "content": sys_p},
                {"role": "user",   "content": user_msg},
            ]

        kwargs = dict(model=model, messages=messages, timeout=60)

        if base_name not in self._NO_JSON_FORMAT:
            kwargs["response_format"] = {"type": "json_object"}

        resp = await client.chat.completions.create(**kwargs)
        return resp.choices[0].message.content or ""

    # ── OpenRouter (OpenAI-compatible, different base URL) ────────
    async def _call_openrouter(self, key, model, sys_p, user_msg) -> str:
        client = openai.AsyncOpenAI(
            api_key=key,
            base_url="https://openrouter.ai/api/v1",
        )
        messages = [
            {"role": "system", "content": sys_p},
            {"role": "user",   "content": user_msg},
        ]
        resp = await client.chat.completions.create(
            model=model, messages=messages, timeout=60
        )
        return resp.choices[0].message.content or ""

    # ── Gemini ────────────────────────────────────────────────────
    async def _call_gemini(self, key, model, sys_p, user_msg) -> str:
        genai.configure(api_key=key)
        gmodel = genai.GenerativeModel(model_name=model, system_instruction=sys_p)
        loop   = asyncio.get_event_loop()
        resp   = await loop.run_in_executor(
            None, lambda: gmodel.generate_content(user_msg)
        )
        return resp.text or ""

    # ── Claude ────────────────────────────────────────────────────
    async def _call_claude(self, key, model, sys_p, user_msg) -> str:
        client = anthropic.AsyncAnthropic(api_key=key)
        msg    = await client.messages.create(
            model=model,
            max_tokens=4096,
            system=sys_p,
            messages=[{"role": "user", "content": user_msg}],
        )
        return msg.content[0].text if msg.content else ""

    # ── JSON extractor ────────────────────────────────────────────
    def _extract_json(self, text: str):
        if not text:
            return None
        stripped = text.strip()

        # Strip markdown fences (```json ... ``` or ``` ... ```)
        if stripped.startswith("```"):
            lines  = stripped.splitlines()
            inner  = []
            for i, line in enumerate(lines):
                if i == 0:
                    continue
                if line.strip().startswith("```"):
                    break
                inner.append(line)
            stripped = "\n".join(inner).strip()

        # Direct parse
        try:
            return json.loads(stripped)
        except json.JSONDecodeError:
            pass

        # Find outermost { … }
        start = text.find("{")
        end   = text.rfind("}") + 1
        if start != -1 and end > start:
            try:
                return json.loads(text[start:end])
            except json.JSONDecodeError:
                pass

        self.log("[LLM] Could not parse JSON from response.")
        return None


# ══════════════════════════════════════════════════════════════════
#  TELEGRAM BOT MANAGER
# ══════════════════════════════════════════════════════════════════
class TelegramManager:
    def __init__(self, log_cb, message_cb):
        self.log        = log_cb
        self.message_cb = message_cb
        self.app: Optional[TGApplication] = None
        self.running    = False

    async def start(self, token: str):
        if self.running:
            return
        try:
            self.app = TGApplication.builder().token(token).build()
            self.app.add_handler(CommandHandler("start", self._cmd_start))
            self.app.add_handler(
                MessageHandler(filters.TEXT & ~filters.COMMAND, self._on_message)
            )
            await self.app.initialize()
            await self.app.start()
            await self.app.updater.start_polling(drop_pending_updates=True)
            self.running = True
            self.log("[TG] Bot polling started.")
        except Exception as exc:
            self.log(f"[TG] Start failed: {exc}")

    async def stop(self):
        if self.app and self.running:
            await self.app.updater.stop()
            await self.app.stop()
            await self.app.shutdown()
        self.running = False
        self.log("[TG] Bot stopped.")

    async def send(self, chat_id: int, text: str):
        if self.app and self.running:
            try:
                await self.app.bot.send_message(chat_id=chat_id, text=text)
            except Exception as exc:
                self.log(f"[TG] Send error: {exc}")

    async def _cmd_start(self, update: Update, ctx: ContextTypes.DEFAULT_TYPE):
        await update.message.reply_text(
            "AI Hardware Hub connected. Send commands to control your device."
        )

    async def _on_message(self, update: Update, ctx: ContextTypes.DEFAULT_TYPE):
        text    = update.message.text
        chat_id = update.effective_chat.id
        self.log(f"[TG <- @{update.effective_user.username}] {text}")
        await self.message_cb(text, reply_chat_id=chat_id)


# ══════════════════════════════════════════════════════════════════
#  GUI HELPER WIDGETS
# ══════════════════════════════════════════════════════════════════
def hud_label(parent, text, **kw) -> ctk.CTkLabel:
    return ctk.CTkLabel(
        parent, text=text, text_color=THEME["muted"],
        font=THEME["font_label"], **kw
    )

def hud_entry(parent, placeholder="", show="", width=300) -> ctk.CTkEntry:
    return ctk.CTkEntry(
        parent, placeholder_text=placeholder, show=show, width=width,
        fg_color=THEME["bg_widget"], border_color=THEME["border"],
        text_color=THEME["white"], placeholder_text_color=THEME["muted"],
        font=THEME["font_hud"]
    )

def hud_button(parent, text, command, width=180, color=None) -> ctk.CTkButton:
    c = color or THEME["cyan_dim"]
    return ctk.CTkButton(
        parent, text=text, command=command, width=width,
        fg_color=c, hover_color=THEME["cyan"],
        text_color="#000000", font=THEME["font_btn"],
        corner_radius=4, border_width=1, border_color=THEME["cyan"]
    )

def hud_textbox(parent, height=200, width=None, font=None) -> ctk.CTkTextbox:
    kw = dict(
        height=height, fg_color=THEME["bg_widget"], border_color=THEME["border"],
        border_width=1, text_color=THEME["white"],
        font=font or THEME["font_code"], wrap="word"
    )
    if width:
        kw["width"] = width
    return ctk.CTkTextbox(parent, **kw)

def status_dot(parent, color: str) -> ctk.CTkLabel:
    return ctk.CTkLabel(parent, text="●", font=("Consolas", 14), text_color=color)

def section_header(parent, text: str):
    """Cyan section title with a horizontal rule line."""
    row = ctk.CTkFrame(parent, fg_color="transparent")
    row.pack(fill="x", padx=0, pady=(14, 4))
    ctk.CTkLabel(
        row, text=text, font=THEME["font_big"], text_color=THEME["cyan"]
    ).pack(side="left")
    ctk.CTkFrame(row, height=1, fg_color=THEME["border"]).pack(
        side="left", fill="x", expand=True, padx=(10, 0)
    )


# ══════════════════════════════════════════════════════════════════
#  MAIN APPLICATION WINDOW
# ══════════════════════════════════════════════════════════════════
class AIHardwareHub(ctk.CTk):
    def __init__(self):
        super().__init__()
        ctk.set_appearance_mode("dark")
        ctk.set_default_color_theme("dark-blue")

        self.title("AI HARDWARE HUB  //  v1.2.0")
        self.geometry("1220x880")
        self.minsize(1000, 720)
        self.configure(fg_color=THEME["bg_root"])

        self.engine          = AsyncEngine()
        self.bt              = BTManager(self._log)
        self.llm             = LLMGateway(self._log)
        self.tg              = TelegramManager(self._log, self._pipeline)
        self.scanned_devices = []
        self.system_prompt   = ""
        self.log_queue       = Queue()

        self._build_header()
        self._build_tabs()
        self._build_statusbar()
        self._drain_log()
        self.protocol("WM_DELETE_WINDOW", self._on_close)

    # ══════════════════════════════════════════════════════════════
    #  HEADER
    # ══════════════════════════════════════════════════════════════
    def _build_header(self):
        hdr = ctk.CTkFrame(
            self, fg_color=THEME["bg_panel"],
            border_color=THEME["border"], border_width=1, height=58
        )
        hdr.pack(fill="x", padx=10, pady=(8, 0))
        hdr.pack_propagate(False)
        ctk.CTkLabel(
            hdr, text="⬡  AI HARDWARE HUB",
            font=THEME["font_title"], text_color=THEME["cyan_glow"]
        ).pack(side="left", padx=18, pady=10)
        ctk.CTkLabel(
            hdr, text="//  UNIVERSAL LLM ↔ BLUETOOTH BRIDGE",
            font=("Consolas", 11), text_color=THEME["muted"]
        ).pack(side="left", padx=0, pady=10)
        self._clock_var = ctk.StringVar(value="")
        ctk.CTkLabel(
            hdr, textvariable=self._clock_var,
            font=THEME["font_hud"], text_color=THEME["cyan_dim"]
        ).pack(side="right", padx=18)
        self._tick_clock()

    def _tick_clock(self):
        self._clock_var.set(datetime.now().strftime("%Y-%m-%d  %H:%M:%S"))
        self.after(1000, self._tick_clock)

    # ══════════════════════════════════════════════════════════════
    #  TABS
    # ══════════════════════════════════════════════════════════════
    def _build_tabs(self):
        self.tabs = ctk.CTkTabview(
            self,
            fg_color=THEME["bg_panel"],
            segmented_button_fg_color=THEME["bg_root"],
            segmented_button_selected_color=THEME["cyan_dim"],
            segmented_button_selected_hover_color=THEME["cyan"],
            segmented_button_unselected_color=THEME["bg_panel"],
            segmented_button_unselected_hover_color=THEME["bg_hover"],
            text_color=THEME["white"],
            text_color_disabled=THEME["muted"],
            border_color=THEME["border"],
            border_width=1,
        )
        self.tabs.pack(fill="both", expand=True, padx=10, pady=8)
        self.tabs.add("  SETTINGS & CONFIG  ")
        self.tabs.add("  AI FIRMWARE & AGENT  ")
        self.tabs.add("  LIVE DASHBOARD  ")
        self._build_tab_settings(self.tabs.tab("  SETTINGS & CONFIG  "))
        self._build_tab_firmware(self.tabs.tab("  AI FIRMWARE & AGENT  "))
        self._build_tab_dashboard(self.tabs.tab("  LIVE DASHBOARD  "))

    # ══════════════════════════════════════════════════════════════
    #  TAB 1 — SETTINGS & CONFIG
    # ══════════════════════════════════════════════════════════════
    def _build_tab_settings(self, tab):
        tab.configure(fg_color=THEME["bg_root"])
        sf = ctk.CTkScrollableFrame(tab, fg_color=THEME["bg_root"])
        sf.pack(fill="both", expand=True, padx=4, pady=4)

        # ── LLM Provider ──────────────────────────────────────────
        section_header(sf, "LLM PROVIDER")
        llm_card = ctk.CTkFrame(
            sf, fg_color=THEME["bg_panel"],
            border_color=THEME["border"], border_width=1
        )
        llm_card.pack(fill="x", pady=(0, 6))

        llm_inner = ctk.CTkFrame(llm_card, fg_color="transparent")
        llm_inner.pack(fill="x", padx=16, pady=12)

        hud_label(llm_inner, "Provider:").grid(row=0, column=0, sticky="w", padx=(0, 8))
        self.provider_var = ctk.StringVar(value="OpenAI")
        ctk.CTkOptionMenu(
            llm_inner, values=list(LLM_MODELS.keys()),
            variable=self.provider_var, command=self._update_model_list,
            fg_color=THEME["bg_widget"], button_color=THEME["cyan_dim"],
            button_hover_color=THEME["cyan"], text_color=THEME["white"],
            font=THEME["font_hud"], width=180
        ).grid(row=0, column=1, padx=(0, 24))

        hud_label(llm_inner, "Model:").grid(row=0, column=2, sticky="w", padx=(0, 8))
        self.model_var = ctk.StringVar(value=LLM_MODELS["OpenAI"][0])
        self.model_dd = ctk.CTkOptionMenu(
            llm_inner, values=LLM_MODELS["OpenAI"],
            variable=self.model_var,
            fg_color=THEME["bg_widget"], button_color=THEME["cyan_dim"],
            button_hover_color=THEME["cyan"], text_color=THEME["white"],
            font=THEME["font_hud"], width=320
        )
        self.model_dd.grid(row=0, column=3)

        self._or_note = ctk.CTkLabel(
            llm_card, text="", font=THEME["font_small"],
            text_color=THEME["amber"], wraplength=760, justify="left"
        )
        self._or_note.pack(anchor="w", padx=16, pady=(0, 8))

        # ── API Keys ──────────────────────────────────────────────
        section_header(sf, "API KEYS")
        key_card = ctk.CTkFrame(
            sf, fg_color=THEME["bg_panel"],
            border_color=THEME["border"], border_width=1
        )
        key_card.pack(fill="x", pady=(0, 6))

        key_inner = ctk.CTkFrame(key_card, fg_color="transparent")
        key_inner.pack(fill="x", padx=16, pady=12)

        hud_label(key_inner, "LLM API Key:").grid(
            row=0, column=0, sticky="w", padx=(0, 12), pady=(0, 8)
        )
        self.llm_key_entry = hud_entry(
            key_inner,
            placeholder="sk-...  /  AIzaSy...  /  sk-ant-...  /  sk-or-...",
            show="*", width=540
        )
        self.llm_key_entry.grid(row=0, column=1, pady=(0, 8))

        hud_label(key_inner, "Telegram Token:").grid(
            row=1, column=0, sticky="w", padx=(0, 12)
        )
        self.tg_token_entry = hud_entry(
            key_inner, placeholder="1234567890:AABBcc...",
            show="*", width=540
        )
        self.tg_token_entry.grid(row=1, column=1)

        # ── Classic Bluetooth ─────────────────────────────────────
        section_header(sf, "CLASSIC BLUETOOTH (COM PORT / SPP)")
        bt_card = ctk.CTkFrame(
            sf, fg_color=THEME["bg_panel"],
            border_color=THEME["border"], border_width=1
        )
        bt_card.pack(fill="x", pady=(0, 6))

        bt_top = ctk.CTkFrame(bt_card, fg_color="transparent")
        bt_top.pack(fill="x", padx=16, pady=(12, 4))
        self.scan_btn = hud_button(
            bt_top, "REFRESH COM PORTS", self._scan_bt, width=220
        )
        self.scan_btn.pack(side="left")
        self._scan_status = ctk.StringVar(value="  Idle — pair device in OS first")
        ctk.CTkLabel(
            bt_top, textvariable=self._scan_status,
            font=THEME["font_small"], text_color=THEME["muted"]
        ).pack(side="left", padx=14)

        bt_bot = ctk.CTkFrame(bt_card, fg_color="transparent")
        bt_bot.pack(fill="x", padx=16, pady=(4, 12))
        hud_label(bt_bot, "Select COM Port:").pack(side="left", padx=(0, 10))
        self.bt_device_var = ctk.StringVar(value="-- no ports found --")
        self.bt_device_dd = ctk.CTkOptionMenu(
            bt_bot, values=["-- no ports found --"],
            variable=self.bt_device_var,
            fg_color=THEME["bg_widget"], button_color=THEME["cyan_dim"],
            button_hover_color=THEME["cyan"], text_color=THEME["white"],
            font=THEME["font_hud"], width=480
        )
        self.bt_device_dd.pack(side="left")

        hud_button(
            sf, "SAVE CONFIGURATION", self._save_config,
            width=220, color=THEME["cyan_dim"]
        ).pack(anchor="w", pady=10)

    def _update_model_list(self, provider: str):
        models = LLM_MODELS.get(provider, [])
        self.model_dd.configure(values=models)
        self.model_var.set(models[0] if models else "")
        if provider == "OpenRouter":
            self._or_note.configure(
                text=(
                    "ⓘ  OpenRouter uses a single key (sk-or-...) to route to 300+ models. "
                    "Get yours free at openrouter.ai  —  base URL: https://openrouter.ai/api/v1"
                )
            )
        else:
            self._or_note.configure(text="")

    def _scan_bt(self):
        self._scan_status.set("  Scanning ...")
        self.scan_btn.configure(state="disabled")

        def on_done(result, error):
            def update():
                self.scan_btn.configure(state="normal")
                if error:
                    self._scan_status.set(f"  Error: {error}")
                    return
                self.scanned_devices = result or []
                if self.scanned_devices:
                    labels = [
                        f"{d['name']}  [{d['port']}]" for d in self.scanned_devices
                    ]
                    self.bt_device_dd.configure(values=labels)
                    self.bt_device_var.set(labels[0])
                    self._scan_status.set(f"  {len(labels)} port(s) found.")
                else:
                    self._scan_status.set("  No COM ports found.")
            self.after(0, update)

        self.engine.run(self.bt.scan(), callback=on_done)

    def _save_config(self):
        self._log("[CFG] Configuration saved in session memory.")

    # ══════════════════════════════════════════════════════════════
    #  TAB 2 — AI FIRMWARE & AGENT  (scrollable, clean grid)
    # ══════════════════════════════════════════════════════════════
    def _build_tab_firmware(self, tab):
        tab.configure(fg_color=THEME["bg_root"])

        sf = ctk.CTkScrollableFrame(tab, fg_color=THEME["bg_root"])
        sf.pack(fill="both", expand=True, padx=2, pady=2)

        # ── Info banner ────────────────────────────────────────────
        banner = ctk.CTkFrame(
            sf, fg_color=THEME["bg_panel"],
            border_color=THEME["cyan_dim"], border_width=1
        )
        banner.pack(fill="x", pady=(4, 0))
        ctk.CTkLabel(
            banner,
            text=(
                "① Paste your sketch  →  ② GENERATE to get System Prompt + BT firmware  "
                "→  ③ If compile fails, paste the error and click FIX WITH AI"
            ),
            font=THEME["font_small"], text_color=THEME["muted"],
            wraplength=1100, justify="left"
        ).pack(anchor="w", padx=16, pady=8)

        # ── ① Input code ──────────────────────────────────────────
        section_header(sf, "① BASE MICROCONTROLLER CODE  (Input)")
        self.base_code_box = hud_textbox(sf, height=200)
        self.base_code_box.pack(fill="x", pady=(0, 4))
        self.base_code_box.insert(
            "0.0",
            "// Paste your Arduino / ESP32 sketch here.\n"
            "void setup() { pinMode(LED_BUILTIN, OUTPUT); }\n"
            "void loop()  { digitalWrite(LED_BUILTIN, !digitalRead(LED_BUILTIN)); delay(500); }\n",
        )

        # ── Generate row ───────────────────────────────────────────
        gen_row = ctk.CTkFrame(sf, fg_color="transparent")
        gen_row.pack(fill="x", pady=6)
        self.gen_btn = hud_button(
            gen_row, "⚡  ANALYZE & GENERATE AI FIRMWARE",
            self._generate_firmware, width=370, color=THEME["cyan_dim"]
        )
        self.gen_btn.pack(side="left")
        self._gen_status = ctk.StringVar(value="")
        ctk.CTkLabel(
            gen_row, textvariable=self._gen_status,
            font=THEME["font_small"], text_color=THEME["amber"]
        ).pack(side="left", padx=12)

        # ── ② System Prompt output ─────────────────────────────────
        section_header(sf, "② GENERATED SYSTEM PROMPT  (Output)")
        self.sysprompt_box = hud_textbox(sf, height=150)
        self.sysprompt_box.pack(fill="x", pady=(0, 4))
        sp_btns = ctk.CTkFrame(sf, fg_color="transparent")
        sp_btns.pack(fill="x", pady=(0, 4))
        hud_button(
            sp_btns, "📋  Copy Prompt",
            lambda: self._copy_textbox(self.sysprompt_box), width=200
        ).pack(side="left")
        hud_button(
            sp_btns, "✔  Use as Active Prompt",
            self._apply_system_prompt, width=220
        ).pack(side="left", padx=10)

        # ── ③ Firmware output ──────────────────────────────────────
        section_header(sf, "③ BLUETOOTH-READY C++ FIRMWARE  (Output)")
        self.firmware_box = hud_textbox(sf, height=220)
        self.firmware_box.pack(fill="x", pady=(0, 4))
        fw_btns = ctk.CTkFrame(sf, fg_color="transparent")
        fw_btns.pack(fill="x", pady=(0, 4))
        hud_button(
            fw_btns, "📋  Copy Firmware",
            lambda: self._copy_textbox(self.firmware_box), width=200
        ).pack(side="left")

        # ── ④ Error Fix ────────────────────────────────────────────
        section_header(sf, "④ AI ERROR FIX  —  paste compiler / runtime error below")

        err_banner = ctk.CTkFrame(
            sf, fg_color="#160e00",
            border_color=THEME["amber"], border_width=1
        )
        err_banner.pack(fill="x", pady=(0, 6))
        ctk.CTkLabel(
            err_banner,
            text=(
                "If your firmware fails to compile or misbehaves at runtime, paste the full "
                "error message here. The AI will receive the current firmware + error and "
                "return a corrected, fully compilable version."
            ),
            font=THEME["font_small"], text_color=THEME["amber"],
            wraplength=1100, justify="left"
        ).pack(anchor="w", padx=14, pady=8)

        self.error_box = hud_textbox(sf, height=140)
        self.error_box.pack(fill="x", pady=(0, 4))
        self.error_box.insert(
            "0.0",
            "// Paste Arduino IDE / PlatformIO compiler error or runtime issue here ...\n"
        )

        fix_row = ctk.CTkFrame(sf, fg_color="transparent")
        fix_row.pack(fill="x", pady=(0, 20))
        self.fix_btn = hud_button(
            fix_row, "🔧  FIX FIRMWARE WITH AI",
            self._fix_firmware_errors, width=260, color="#7a3a00"
        )
        self.fix_btn.pack(side="left")
        self._fix_status = ctk.StringVar(value="")
        ctk.CTkLabel(
            fix_row, textvariable=self._fix_status,
            font=THEME["font_small"], text_color=THEME["amber"]
        ).pack(side="left", padx=12)

    # ── Firmware generation ────────────────────────────────────────
    def _generate_firmware(self):
        base_code = self.base_code_box.get("0.0", "end").strip()
        if not base_code:
            return self._log("[ERR] No base code supplied.")

        provider = self.provider_var.get()
        model    = self.model_var.get()
        api_key  = self.llm_key_entry.get().strip()
        if not api_key:
            return self._log("[ERR] No API key. Set it in Settings & Config tab.")

        self._gen_status.set("⏳  Generating — please wait …")
        self.gen_btn.configure(state="disabled")

        meta_system = (
            "You are an expert embedded systems engineer and AI prompt engineer.\n"
            "You will receive an existing Arduino / ESP32 sketch.\n"
            "Return ONLY a valid JSON object with exactly two string keys:\n\n"
            "\"system_prompt\": A precise natural-language instruction set for an "
            "LLM runtime agent that describes every Classic Bluetooth command available "
            "on this device, the exact JSON format to use (e.g. {\"led\": 1}), and "
            "safety constraints. Be specific and comprehensive.\n\n"
            "\"firmware_code\": The complete, compilable C++ Arduino sketch that extends "
            "the user's original code with: Classic Bluetooth (BluetoothSerial.h for ESP32), "
            "JSON parsing via ArduinoJson v6/v7, and telemetry back to the BT client. "
            "Add detailed comments throughout.\n\n"
            "Output ONLY the raw JSON object — no markdown fences, no triple backticks, "
            "no explanation outside the JSON."
        )
        user_msg = f"Here is the existing code:\n\n```cpp\n{base_code}\n```"

        async def do_gen():
            return await self.llm.call(
                provider, model, api_key, meta_system, user_msg, expect_json=True
            )

        def on_done(result, error):
            def update():
                self.gen_btn.configure(state="normal")
                self._gen_status.set("")
                if error:
                    return self._log(f"[ERR] Generation failed: {error}")
                _raw, parsed = result
                if not parsed:
                    self._log("[ERR] LLM did not return valid JSON — showing raw output.")
                    self.firmware_box.delete("0.0", "end")
                    self.firmware_box.insert("0.0", _raw)
                    return
                sp = parsed.get("system_prompt", "")
                fw = parsed.get("firmware_code",  "")
                self.system_prompt = sp
                self.sysprompt_box.delete("0.0", "end")
                self.sysprompt_box.insert("0.0", sp)
                self.firmware_box.delete("0.0", "end")
                self.firmware_box.insert("0.0", fw)
                self._log("[GEN] ✔ AI Firmware & System Prompt generated successfully.")
            self.after(0, update)

        self.engine.run(do_gen(), callback=on_done)

    # ── Apply generated system prompt to the live pipeline ────────
    def _apply_system_prompt(self):
        sp = self.sysprompt_box.get("0.0", "end").strip()
        if sp:
            self.system_prompt = sp
            self._log("[CFG] ✔ System prompt applied to live pipeline.")
        else:
            self._log("[WARN] System prompt box is empty — nothing applied.")

    # ── AI Error Fix ───────────────────────────────────────────────
    def _fix_firmware_errors(self):
        firmware  = self.firmware_box.get("0.0", "end").strip()
        error_log = self.error_box.get("0.0", "end").strip()

        if not firmware or len(firmware) < 30:
            return self._log("[ERR] Firmware box is empty — generate firmware first.")
        placeholder_hints = ("paste", "// paste", "// ✔")
        if not error_log or any(error_log.lower().startswith(h) for h in placeholder_hints):
            return self._log("[ERR] Please paste the compiler / runtime error in the error box.")

        provider = self.provider_var.get()
        model    = self.model_var.get()
        api_key  = self.llm_key_entry.get().strip()
        if not api_key:
            return self._log("[ERR] No API key configured.")

        self._fix_status.set("⏳  Fixing — please wait …")
        self.fix_btn.configure(state="disabled")

        fix_system = (
            "You are an expert Arduino / ESP32 firmware engineer.\n"
            "You will receive:\n"
            "  1. A C++ sketch that has errors or issues.\n"
            "  2. The compiler or runtime error log.\n\n"
            "Return ONLY a valid JSON object with exactly two string keys:\n\n"
            "\"fixed_firmware\": The complete, corrected, compilable C++ sketch. "
            "Fix ALL reported errors. Add a short comment above each changed line.\n\n"
            "\"fix_summary\": Concise plain-English bullet points (2-8) explaining "
            "what was wrong and what was changed.\n\n"
            "Output ONLY the raw JSON — no markdown fences, no preamble."
        )
        user_msg = (
            f"=== CURRENT FIRMWARE ===\n```cpp\n{firmware}\n```\n\n"
            f"=== COMPILER / RUNTIME ERROR ===\n{error_log}"
        )

        async def do_fix():
            return await self.llm.call(
                provider, model, api_key, fix_system, user_msg, expect_json=True
            )

        def on_done(result, error):
            def update():
                self.fix_btn.configure(state="normal")
                self._fix_status.set("")
                if error:
                    return self._log(f"[ERR] Fix request failed: {error}")
                _raw, parsed = result
                if not parsed:
                    self._log("[ERR] LLM did not return valid JSON — showing raw output.")
                    self.firmware_box.delete("0.0", "end")
                    self.firmware_box.insert("0.0", _raw)
                    return
                fixed   = parsed.get("fixed_firmware", "")
                summary = parsed.get("fix_summary", "")
                if fixed:
                    self.firmware_box.delete("0.0", "end")
                    self.firmware_box.insert("0.0", fixed)
                    self._log("[FIX] ✔ Firmware replaced with AI-corrected version.")
                if summary:
                    self._log(f"[FIX] Summary:\n{summary}")
                # Replace error box with result note
                self.error_box.delete("0.0", "end")
                summary_lines = "\n".join(
                    f"// {ln}" for ln in summary.splitlines()
                ) if summary else "// (no summary)"
                self.error_box.insert(
                    "0.0",
                    f"// ✔ Fixed by AI — paste new errors here if issues persist.\n"
                    f"{summary_lines}\n"
                )
            self.after(0, update)

        self.engine.run(do_fix(), callback=on_done)

    # ── Clipboard helper ──────────────────────────────────────────
    def _copy_textbox(self, box: ctk.CTkTextbox):
        content = box.get("0.0", "end")
        if HAS_CLIPBOARD:
            pyperclip.copy(content)
        else:
            self.clipboard_clear()
            self.clipboard_append(content)
        self._log("[GUI] ✔ Copied to clipboard.")

    # ══════════════════════════════════════════════════════════════
    #  TAB 3 — LIVE DASHBOARD
    # ══════════════════════════════════════════════════════════════
    def _build_tab_dashboard(self, tab):
        tab.configure(fg_color=THEME["bg_root"])

        ctrl = ctk.CTkFrame(
            tab, fg_color=THEME["bg_panel"],
            border_color=THEME["border"], border_width=1
        )
        ctrl.pack(fill="x", padx=4, pady=(6, 4))

        self.bt_conn_btn = hud_button(ctrl, "+ CONNECT BT (COM)", self._connect_bt, width=210)
        self.bt_conn_btn.grid(row=0, column=0, padx=12, pady=10)
        self._bt_dot = status_dot(ctrl, THEME["red"])
        self._bt_dot.grid(row=0, column=1, padx=(0, 4))
        self._bt_status = ctk.StringVar(value="BT: Disconnected")
        ctk.CTkLabel(
            ctrl, textvariable=self._bt_status,
            font=THEME["font_hud"], text_color=THEME["white"]
        ).grid(row=0, column=2, padx=(0, 28))

        self.tg_btn = hud_button(ctrl, "+ START TELEGRAM BOT", self._start_telegram, width=220)
        self.tg_btn.grid(row=0, column=3, padx=12, pady=10)
        self._tg_dot = status_dot(ctrl, THEME["red"])
        self._tg_dot.grid(row=0, column=4, padx=(0, 4))
        self._tg_status = ctk.StringVar(value="BOT: Offline")
        ctk.CTkLabel(
            ctrl, textvariable=self._tg_status,
            font=THEME["font_hud"], text_color=THEME["white"]
        ).grid(row=0, column=5)

        # Two-column pane
        pane = ctk.CTkFrame(tab, fg_color="transparent")
        pane.pack(fill="both", expand=True, padx=4, pady=4)
        pane.columnconfigure(0, weight=3)
        pane.columnconfigure(1, weight=2)
        pane.rowconfigure(0, weight=1)

        # Terminal (left)
        log_frame = ctk.CTkFrame(
            pane, fg_color=THEME["bg_panel"],
            border_color=THEME["border"], border_width=1
        )
        log_frame.grid(row=0, column=0, sticky="nsew", padx=(0, 4))
        log_frame.rowconfigure(1, weight=1)
        log_frame.columnconfigure(0, weight=1)
        ctk.CTkLabel(
            log_frame, text="TERMINAL LOG",
            font=THEME["font_big"], text_color=THEME["cyan"]
        ).grid(row=0, column=0, sticky="w", padx=12, pady=(8, 2))
        self.terminal_box = hud_textbox(log_frame, height=480)
        self.terminal_box.grid(row=1, column=0, sticky="nsew", padx=8, pady=(0, 4))
        self.terminal_box.configure(state="disabled")
        hud_button(
            log_frame, "Clear Log", self._clear_terminal, width=130
        ).grid(row=2, column=0, sticky="e", padx=8, pady=(0, 8))

        # HUD chat (right)
        chat_frame = ctk.CTkFrame(
            pane, fg_color=THEME["bg_panel"],
            border_color=THEME["border"], border_width=1
        )
        chat_frame.grid(row=0, column=1, sticky="nsew")
        chat_frame.rowconfigure(1, weight=1)
        chat_frame.columnconfigure(0, weight=1)
        ctk.CTkLabel(
            chat_frame, text="LOCAL HUD CHAT",
            font=THEME["font_big"], text_color=THEME["cyan"]
        ).grid(row=0, column=0, columnspan=2, sticky="w", padx=12, pady=(8, 2))
        self.chat_box = hud_textbox(chat_frame, height=400)
        self.chat_box.grid(
            row=1, column=0, columnspan=2, sticky="nsew", padx=8, pady=4
        )
        self.chat_box.configure(state="disabled")
        self.chat_entry = hud_entry(chat_frame, placeholder="Type command...", width=230)
        self.chat_entry.grid(row=2, column=0, padx=(8, 4), pady=(4, 8), sticky="ew")
        self.chat_entry.bind("<Return>", lambda _e: self._transmit_hud())
        hud_button(
            chat_frame, "TRANSMIT >", self._transmit_hud, width=120
        ).grid(row=2, column=1, padx=(0, 8), pady=(4, 8))

    # ══════════════════════════════════════════════════════════════
    #  BLUETOOTH / TELEGRAM CONTROLS
    # ══════════════════════════════════════════════════════════════
    def _connect_bt(self):
        if self.bt.connected:
            def on_done(r, e):
                def update():
                    self._bt_dot.configure(text_color=THEME["red"])
                    self._bt_status.set("BT: Disconnected")
                    self.bt_conn_btn.configure(text="+ CONNECT BT (COM)")
                self.after(0, update)
            self.engine.run(self.bt.disconnect(), callback=on_done)
            return

        selection = self.bt_device_var.get()
        if not selection or "no ports" in selection:
            return self._log(
                "[ERR] No port selected. Pair device in OS, then Refresh COM Ports."
            )
        try:
            port = selection.split("[")[-1].rstrip("]")
        except Exception:
            return self._log("[ERR] Could not parse COM port from selection.")

        self._bt_status.set("BT: Connecting …")
        self._bt_dot.configure(text_color=THEME["amber"])
        self.bt_conn_btn.configure(state="disabled")

        async def do_connect():
            ok = await self.bt.connect(port)
            if ok:
                await self.bt.subscribe(self._bt_notify_callback)
            return ok

        def on_done(result, error):
            def update():
                self.bt_conn_btn.configure(state="normal")
                if error or not result:
                    self._bt_dot.configure(text_color=THEME["red"])
                    self._bt_status.set("BT: Failed")
                    self.bt_conn_btn.configure(text="+ CONNECT BT (COM)")
                else:
                    self._bt_dot.configure(text_color=THEME["green"])
                    self._bt_status.set("BT: Connected")
                    self.bt_conn_btn.configure(text="✕  DISCONNECT BT")
            self.after(0, update)

        self.engine.run(do_connect(), callback=on_done)

    def _bt_notify_callback(self, _sender, data: bytearray):
        text = data.decode("utf-8", errors="replace").strip()
        self._log(f"[MCU -> BT] {text}")

    def _start_telegram(self):
        if self.tg.running:
            def on_done(r, e):
                def update():
                    self._tg_dot.configure(text_color=THEME["red"])
                    self._tg_status.set("BOT: Offline")
                    self.tg_btn.configure(text="+ START TELEGRAM BOT")
                self.after(0, update)
            self.engine.run(self.tg.stop(), callback=on_done)
            return

        token = self.tg_token_entry.get().strip()
        if not token:
            return self._log("[ERR] No Telegram token. Set it in Settings & Config.")

        self._tg_status.set("BOT: Starting …")
        self._tg_dot.configure(text_color=THEME["amber"])
        self.tg_btn.configure(state="disabled")

        def on_done(r, e):
            def update():
                self.tg_btn.configure(state="normal")
                if e or not self.tg.running:
                    self._tg_dot.configure(text_color=THEME["red"])
                    self._tg_status.set("BOT: Error")
                    self.tg_btn.configure(text="+ START TELEGRAM BOT")
                else:
                    self._tg_dot.configure(text_color=THEME["green"])
                    self._tg_status.set("BOT: Online")
                    self.tg_btn.configure(text="✕  STOP BOT")
            self.after(0, update)

        self.engine.run(self.tg.start(token), callback=on_done)

    # ══════════════════════════════════════════════════════════════
    #  MAIN LLM → BT PIPELINE
    # ══════════════════════════════════════════════════════════════
    def _transmit_hud(self):
        text = self.chat_entry.get().strip()
        if not text:
            return
        self.chat_entry.delete(0, "end")
        self._append_chat("YOU", text, THEME["cyan"])
        self.engine.run(self._pipeline(text, reply_chat_id=None))

    async def _pipeline(self, user_text: str, reply_chat_id=None):
        provider = self.provider_var.get()
        model    = self.model_var.get()
        api_key  = self.llm_key_entry.get().strip()
        if not api_key:
            return self._log("[PIPE] No API key configured. Aborting.")

        system = self.system_prompt or (
            "You are an IoT device controller. "
            "Respond ONLY with a valid JSON object representing the hardware action. "
            "Example: {\"led\": 1} or {\"relay\": 2, \"state\": 1}"
        )

        self._log(f"[PIPE] Sending to {provider}/{model} …")
        raw, parsed = await self.llm.call(
            provider, model, api_key, system, user_text, expect_json=True
        )

        if parsed:
            self._log(f"[PIPE] JSON command: {json.dumps(parsed)}")
            await self.bt.send(parsed)
            reply = f"Executed: {json.dumps(parsed)}"
        else:
            reply = f"Could not parse JSON command. Raw: {raw[:300]}"
            self._log(f"[PIPE] {reply}")

        self.after(0, lambda: self._append_chat("AI", reply, THEME["green"]))
        if reply_chat_id is not None and self.tg.running:
            await self.tg.send(reply_chat_id, reply)

    # ══════════════════════════════════════════════════════════════
    #  STATUS BAR & LOG
    # ══════════════════════════════════════════════════════════════
    def _build_statusbar(self):
        bar = ctk.CTkFrame(
            self, fg_color=THEME["bg_panel"],
            border_color=THEME["border"], border_width=1, height=28
        )
        bar.pack(fill="x", padx=10, pady=(0, 8))
        bar.pack_propagate(False)
        self._status_var = ctk.StringVar(value="System ready.")
        ctk.CTkLabel(
            bar, textvariable=self._status_var,
            font=THEME["font_small"], text_color=THEME["muted"]
        ).pack(side="left", padx=12)

    def _log(self, msg: str):
        ts = datetime.now().strftime("%H:%M:%S.%f")[:-3]
        self.log_queue.put(f"[{ts}]  {msg}")

    def _drain_log(self):
        try:
            while True:
                msg = self.log_queue.get_nowait()
                self.terminal_box.configure(state="normal")
                self.terminal_box.insert("end", msg + "\n")
                self.terminal_box.see("end")
                self.terminal_box.configure(state="disabled")
                self._status_var.set(msg[:100])
        except Empty:
            pass
        self.after(80, self._drain_log)

    def _clear_terminal(self):
        self.terminal_box.configure(state="normal")
        self.terminal_box.delete("0.0", "end")
        self.terminal_box.configure(state="disabled")

    def _append_chat(self, sender: str, text: str, color: str):
        ts = datetime.now().strftime("%H:%M")
        self.chat_box.configure(state="normal")
        self.chat_box.insert("end", f"[{ts}] {sender}:\n  {text}\n\n")
        self.chat_box.see("end")
        self.chat_box.configure(state="disabled")

    # ══════════════════════════════════════════════════════════════
    #  SHUTDOWN
    # ══════════════════════════════════════════════════════════════
    def _on_close(self):
        self._log("[SYS] Shutting down …")
        if self.tg.running:
            self.engine.run(self.tg.stop())
            time.sleep(0.5)
        if self.bt.connected:
            self.engine.run(self.bt.disconnect())
            time.sleep(0.3)
        self.engine.stop()
        self.destroy()


# ══════════════════════════════════════════════════════════════════
if __name__ == "__main__":
    app = AIHardwareHub()
    app.mainloop()
