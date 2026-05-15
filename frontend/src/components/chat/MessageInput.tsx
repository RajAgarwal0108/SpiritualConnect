"use client";

import { useState, useCallback, KeyboardEvent } from "react";
import { Send } from "lucide-react";

interface MessageInputProps {
  onSend: (content: string) => void;
  onStartTyping?: () => void;
  onStopTyping?: () => void;
  placeholder?: string;
  disabled?: boolean;
  disabledReason?: string;
  layout?: "sidebar" | "page";
}

export default function MessageInput({
  onSend,
  onStartTyping,
  onStopTyping,
  placeholder = "Write with intention...",
  disabled = false,
  disabledReason,
  layout = "sidebar",
}: MessageInputProps) {
  const [value, setValue] = useState("");

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
    onStopTyping?.();
  }, [value, disabled, onSend, onStopTyping]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    if (e.target.value) {
      onStartTyping?.();
    } else {
      onStopTyping?.();
    }
  };

  if (layout === "page") {
    return (
      <div className="p-3 md:p-8 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-white/60 backdrop-blur-md border-t border-sacred-gold/10">
        <div className="flex items-center gap-2 md:gap-4 bg-sacred-beige/30 border border-sacred-gold/10 rounded-2xl md:rounded-3xl p-1.5 md:p-2 pl-3 md:pl-6 focus-within:ring-2 ring-sacred-gold/20 transition-all">
          <input
            type="text"
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className="flex-1 bg-transparent border-none focus:outline-none text-sm py-2 placeholder:text-sacred-muted/40 text-sacred-text disabled:opacity-40"
          />
          <button
            onClick={handleSend}
            disabled={!value.trim() || disabled}
            className="rounded-xl md:rounded-2xl p-2 md:p-3 bg-sacred-gold text-white disabled:opacity-40 hover:opacity-90 transition-all active:scale-90"
          >
            <Send size={16} />
          </button>
        </div>
        {disabled && disabledReason && (
          <p className="text-xs text-sacred-muted/60 mt-2 italic">{disabledReason}</p>
        )}
      </div>
    );
  }

  return (
    <div className={layout === "sidebar" ? "p-8 shrink-0" : ""}>
      <form
        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
        className="flex items-center gap-3 bg-white px-5 py-3 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-sacred-gold/5 group focus-within:ring-2 focus-within:ring-sacred-gold/5 transition-all"
      >
        <input
          type="text"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 bg-transparent border-none outline-none py-1.5 text-sm text-sacred-text placeholder:text-sacred-muted/30 italic disabled:opacity-40"
        />
        <button
          type="submit"
          disabled={!value.trim() || disabled}
          className="rounded-full p-2.5 text-sacred-gold hover:bg-sacred-gold hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-sacred-gold transition-all active:scale-90"
        >
          <Send size={20} />
        </button>
      </form>
      {disabled && disabledReason && (
        <p className="text-xs text-sacred-muted/60 mt-2 italic text-center">{disabledReason}</p>
      )}
    </div>
  );
}
