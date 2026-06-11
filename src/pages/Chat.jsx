import React, { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Send, Sparkles, Wrench } from "lucide-react";
import { sendChat } from "../api.js";
import ChatChart from "../components/ChatChart.jsx";

const SUGGESTIONS = [
  "Chart this month's collections",
  "Show attendance trend for the worst batch",
  "Who are the students at risk right now?",
  "Compare students in a batch",
];

function renderInline(text) {
  const parts = String(text).split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
}

function FormattedAssistantMessage({ content }) {
  const lines = String(content || "").replace(/\r\n/g, "\n").split("\n");
  const blocks = [];
  let list = null;
  let paragraph = [];

  function flushParagraph() {
    if (!paragraph.length) return;
    blocks.push({ type: "paragraph", text: paragraph.join(" ") });
    paragraph = [];
  }

  function flushList() {
    if (!list) return;
    blocks.push(list);
    list = null;
  }

  lines.forEach((rawLine) => {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      flushList();
      return;
    }

    const heading = line.match(/^#{1,3}\s+(.+)$/);
    if (heading) {
      flushParagraph();
      flushList();
      blocks.push({ type: "heading", text: heading[1] });
      return;
    }

    const bullet = line.match(/^[-*•]\s+(.+)$/);
    if (bullet) {
      flushParagraph();
      if (!list || list.type !== "bullets") {
        flushList();
        list = { type: "bullets", items: [] };
      }
      list.items.push(bullet[1]);
      return;
    }

    const number = line.match(/^\d+[.)]\s+(.+)$/);
    if (number) {
      flushParagraph();
      if (!list || list.type !== "numbers") {
        flushList();
        list = { type: "numbers", items: [] };
      }
      list.items.push(number[1]);
      return;
    }

    const fact = line.match(/^([^:]{2,36}):\s+(.+)$/);
    if (fact && !line.includes("http")) {
      flushParagraph();
      flushList();
      blocks.push({ type: "fact", label: fact[1], value: fact[2] });
      return;
    }

    flushList();
    paragraph.push(line);
  });

  flushParagraph();
  flushList();

  return (
    <div className="chat-response">
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          return <h3 key={index}>{renderInline(block.text)}</h3>;
        }
        if (block.type === "paragraph") {
          return <p key={index}>{renderInline(block.text)}</p>;
        }
        if (block.type === "bullets") {
          return <ul key={index}>{block.items.map((item, itemIndex) => <li key={itemIndex}>{renderInline(item)}</li>)}</ul>;
        }
        if (block.type === "numbers") {
          return <ol key={index}>{block.items.map((item, itemIndex) => <li key={itemIndex}>{renderInline(item)}</li>)}</ol>;
        }
        return (
          <div className="chat-fact" key={index}>
            <span>{renderInline(block.label)}</span>
            <strong>{renderInline(block.value)}</strong>
          </div>
        );
      })}
    </div>
  );
}

export default function Chat() {
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const scrollerRef = useRef(null);

  const mutation = useMutation({
    mutationFn: (message) => sendChat({ message, conversationId }),
    onSuccess: (data) => {
      setConversationId(data.conversationId);
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply, blocks: data.blocks, toolsUsed: data.toolsUsed }]);
    },
    onError: (err) => {
      const detail = err?.response?.data?.detail || err?.message || "Something went wrong.";
      setMessages((prev) => [...prev, { role: "assistant", content: `⚠️ ${detail}`, error: true }]);
    },
  });

  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, mutation.isPending]);

  // Pre-fill from the Cmd+K palette's "Ask assistant: …" action.
  useEffect(() => {
    const prefill = sessionStorage.getItem("xbi_chat_prefill");
    if (prefill) { setInput(prefill); sessionStorage.removeItem("xbi_chat_prefill"); }
  }, []);

  function ask(text) {
    const message = (text ?? input).trim();
    if (!message || mutation.isPending) return;
    setMessages((prev) => [...prev, { role: "user", content: message }]);
    setInput("");
    mutation.mutate(message);
  }

  function newChat() {
    setConversationId(null);
    setMessages([]);
  }

  return (
    <div className="chat-page">
      <div className="chat-head">
        <div>
          <p className="eyebrow"><Sparkles size={14} /> XBI Assistant</p>
          <h1>Ask anything about your academy</h1>
        </div>
        <button className="ghost-button" onClick={newChat} disabled={!messages.length}>New chat</button>
      </div>

      <div className="chat-scroller" ref={scrollerRef}>
        {!messages.length && (
          <div className="chat-empty">
            <Sparkles size={28} />
            <p>Answers respect your access — you only ever see your own venues, batches and students.</p>
            <div className="chat-suggestions">
              {SUGGESTIONS.map((s) => <button key={s} onClick={() => ask(s)}>{s}</button>)}
            </div>
          </div>
        )}
        {messages.map((m, i) => {
          const blocks = Array.isArray(m.blocks) ? m.blocks : null;
          const textBlocks = blocks?.filter((b) => b.type === "text") || [];
          const chartBlocks = blocks?.filter((b) => b.type === "chart") || [];
          const followups = blocks?.find((b) => b.type === "followups")?.items || [];
          return (
            <div key={i} className={`chat-bubble ${m.role} ${m.error ? "error" : ""}`}>
              {m.role === "assistant" && !m.error ? (
                <>
                  {blocks
                    ? textBlocks.map((b, bi) => <FormattedAssistantMessage key={bi} content={b.text} />)
                    : <FormattedAssistantMessage content={m.content} />}
                  {chartBlocks.map((b, bi) => <ChatChart key={bi} spec={b.spec} />)}
                  {followups.length > 0 && (
                    <div className="chat-followups">
                      {followups.map((f) => <button key={f} onClick={() => ask(f)} disabled={mutation.isPending}>{f}</button>)}
                    </div>
                  )}
                </>
              ) : (
                <div className="chat-bubble-body">{m.content}</div>
              )}
              {m.toolsUsed?.length > 0 && (
                <div className="chat-tools"><Wrench size={11} /> {m.toolsUsed.join(", ")}</div>
              )}
            </div>
          );
        })}
        {mutation.isPending && (
          <div className="chat-bubble assistant">
            <div className="chat-typing"><span /><span /><span /></div>
          </div>
        )}
      </div>

      <form className="chat-input" onSubmit={(e) => { e.preventDefault(); ask(); }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about attendance, fees, performance, or who's at risk…"
          disabled={mutation.isPending}
        />
        <button className="button primary-button" type="submit" disabled={mutation.isPending || !input.trim()}>
          <Send size={16} /> Send
        </button>
      </form>
    </div>
  );
}
