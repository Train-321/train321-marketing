"use client";

import { useEffect, useId, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { SUPPORT_TOPICS } from "@/lib/support-topics";
import "./ChatWidget.css";

type ChatRole = "user" | "assistant";
type ChatMessage = { role: ChatRole; content: string };

const STORAGE_KEY = "t321-chat-history-v1";
const MAX_STORED_MESSAGES = 20;
const AGENT_NAME = "Christina";
const AGENT_INITIAL = "C";

const WELCOME: ChatMessage = {
  role: "assistant",
  content: `Hey there 👋 I'm ${AGENT_NAME} from the Train321 team. What can I help you with today?`
};

const QUICK_REPLIES: Array<{ label: string; prompt: string }> = [
  {
    label: "How fast can we get certified?",
    prompt: "How quickly can we get our whole team trained and certified?"
  },
  {
    label: "Is it accepted in my state?",
    prompt: "Are your courses accepted by health departments and regulators in every US state?"
  },
  {
    label: "What's pricing for my team?",
    prompt: "How does pricing work? I'm looking at training around 10–20 employees."
  },
  {
    label: "Which course do I need?",
    prompt: "I'm not sure which course is right for me — can you help me figure it out?"
  }
];

type Props = { aiEnabled: boolean };

export default function ChatWidget({ aiEnabled }: Props) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [aiBlocked, setAiBlocked] = useState(!aiEnabled);
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);

  const labelId = useId();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as ChatMessage[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        setMessages(parsed);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(messages.slice(-MAX_STORED_MESSAGES))
      );
    } catch {
      /* ignore */
    }
  }, [messages]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);

    // Lock body scroll on mobile (panel takes the full viewport)
    const isMobile = window.matchMedia("(max-width: 600px)").matches;
    let prevOverflow = "";
    if (isMobile) {
      prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener("keydown", onKey);
      if (isMobile) document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, streaming, aiBlocked]);

  useEffect(() => {
    if (open && !aiBlocked && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open, aiBlocked]);

  useEffect(() => {
    const ta = inputRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    const next = Math.min(ta.scrollHeight, 120);
    ta.style.height = next + "px";
  }, [input]);

  function resetChat() {
    abortRef.current?.abort();
    setMessages([WELCOME]);
    setStreaming(false);
    setExpandedTopic(null);
    setInput("");
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || streaming) return;

    const next: ChatMessage[] = [
      ...messages,
      { role: "user", content: trimmed },
      { role: "assistant", content: "" }
    ];
    setMessages(next);
    setInput("");
    setStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          messages: next.slice(0, -1).map((m) => ({
            role: m.role,
            content: m.content
          }))
        })
      });

      if (!res.ok || !res.body) {
        if (res.status === 503) setAiBlocked(true);
        throw new Error(`HTTP ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const copy = prev.slice();
          copy[copy.length - 1] = { role: "assistant", content: acc };
          return copy;
        });
      }

      if (!acc.trim()) {
        throw new Error("empty response");
      }
    } catch (err) {
      const aborted = err instanceof DOMException && err.name === "AbortError";
      if (!aborted) {
        setMessages((prev) => {
          const copy = prev.slice();
          copy[copy.length - 1] = {
            role: "assistant",
            content:
              "Hmm, I'm having trouble connecting right now. Browse the common questions below, or shoot us a note at [support@train321.com](mailto:support@train321.com) and a teammate will follow up."
          };
          return copy;
        });
        setAiBlocked(true);
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  return (
    <>
      <button
        type="button"
        className={`t321-chat-fab ${open ? "is-open" : ""}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="t321-chat-panel"
        aria-label={open ? "Close support chat" : `Chat with ${AGENT_NAME} from Train321`}
      >
        {open ? (
          <i className="fas fa-chevron-down" aria-hidden="true" />
        ) : (
          <>
            <span className="t321-chat-fab__avatar" aria-hidden="true">
              {AGENT_INITIAL}
            </span>
            <span className="t321-chat-fab__label">
              <span className="t321-chat-fab__title">Got questions?</span>
              <span className="t321-chat-fab__online">We&rsquo;re online now</span>
            </span>
          </>
        )}
      </button>

      {open && (
        <div
          id="t321-chat-panel"
          className="t321-chat-panel"
          role="dialog"
          aria-modal="false"
          aria-labelledby={labelId}
        >
          <header className="t321-chat-panel__header">
            <div className="t321-chat-panel__avatar" aria-hidden="true">
              <span>{AGENT_INITIAL}</span>
            </div>
            <div className="t321-chat-panel__heading">
              <h2 id={labelId} className="t321-chat-panel__title">
                {AGENT_NAME}
              </h2>
              <p className="t321-chat-panel__subtitle">
                {streaming ? "typing…" : "usually replies in seconds"}
              </p>
            </div>
            <button
              type="button"
              className="t321-chat-panel__close"
              onClick={() => setOpen(false)}
              aria-label="Close"
            >
              <i className="fas fa-times" aria-hidden="true" />
            </button>
          </header>

          <div className="t321-chat-body" ref={scrollRef}>
            {!aiBlocked ? (
              <>
              <ul className="t321-chat-messages">
                {messages.map((m, i) => (
                  <li
                    key={i}
                    className={`t321-chat-msg t321-chat-msg--${m.role}`}
                  >
                    {m.role === "assistant" && (
                      <div className="t321-chat-msg__avatar" aria-hidden="true">
                        {AGENT_INITIAL}
                      </div>
                    )}
                    <div className="t321-chat-msg__bubble">
                      {m.content ? (
                        <ReactMarkdown
                          components={{
                            a: (props) => (
                              <a
                                {...props}
                                target={
                                  props.href?.startsWith("http") ? "_blank" : undefined
                                }
                                rel={
                                  props.href?.startsWith("http")
                                    ? "noopener noreferrer"
                                    : undefined
                                }
                              />
                            )
                          }}
                        >
                          {m.content}
                        </ReactMarkdown>
                      ) : streaming && i === messages.length - 1 ? (
                        <span className="t321-chat-typing" aria-label="Typing">
                          <span /> <span /> <span />
                        </span>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
              {messages.length === 1 && !streaming && (
                <div className="t321-chat-suggestions" aria-label="Suggested questions">
                  {QUICK_REPLIES.map((q) => (
                    <button
                      key={q.label}
                      type="button"
                      className="t321-chat-suggestions__chip"
                      onClick={() => sendMessage(q.prompt)}
                    >
                      {q.label}
                    </button>
                  ))}
                </div>
              )}
              </>
            ) : (
              <ul className="t321-chat-menu">
                {SUPPORT_TOPICS.map((topic) => {
                  const expanded = expandedTopic === topic.id;
                  return (
                    <li
                      key={topic.id}
                      className={`t321-chat-menu__item ${expanded ? "is-open" : ""}`}
                    >
                      <button
                        type="button"
                        className="t321-chat-menu__trigger"
                        onClick={() =>
                          setExpandedTopic(expanded ? null : topic.id)
                        }
                        aria-expanded={expanded}
                      >
                        <span>{topic.label}</span>
                        <i
                          className={`fas ${expanded ? "fa-chevron-up" : "fa-chevron-down"}`}
                          aria-hidden="true"
                        />
                      </button>
                      {expanded && (
                        <div className="t321-chat-menu__body">
                          <ReactMarkdown
                            components={{
                              a: (props) => (
                                <a
                                  {...props}
                                  target={
                                    props.href?.startsWith("http")
                                      ? "_blank"
                                      : undefined
                                  }
                                  rel={
                                    props.href?.startsWith("http")
                                      ? "noopener noreferrer"
                                      : undefined
                                  }
                                />
                              )
                            }}
                          >
                            {topic.body}
                          </ReactMarkdown>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {!aiBlocked ? (
            <form className="t321-chat-form" onSubmit={onSubmit}>
              <div className="t321-chat-form__row">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder={`Message ${AGENT_NAME}…`}
                  rows={1}
                  disabled={streaming}
                  aria-label="Your message"
                />
                <button
                  type="submit"
                  className="t321-chat-form__send"
                  disabled={streaming || !input.trim()}
                  aria-label="Send"
                >
                  {streaming ? (
                    <i className="fas fa-circle-notch fa-spin" aria-hidden="true" />
                  ) : (
                    <i className="fas fa-paper-plane" aria-hidden="true" />
                  )}
                </button>
              </div>
              <div className="t321-chat-form__meta">
                <button
                  type="button"
                  className="t321-chat-form__reset"
                  onClick={resetChat}
                  disabled={streaming || messages.length <= 1}
                >
                  <i className="fas fa-rotate-left" aria-hidden="true" /> New chat
                </button>
                <span className="t321-chat-form__hint">
                  Powered by{" "}
                  <a
                    href="http://appsians.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Appsians
                  </a>
                </span>
              </div>
            </form>
          ) : (
            <footer className="t321-chat-foot">
              Need a human?{" "}
              <a href="mailto:support@train321.com">support@train321.com</a>
            </footer>
          )}
        </div>
      )}
    </>
  );
}
