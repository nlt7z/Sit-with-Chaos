"use client";

import { motion } from "framer-motion";

type Props = {
  role: "user" | "assistant";
  children: React.ReactNode;
};

export function ChatBubble({ role, children }: Props) {
  const isUser = role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex items-end gap-2 mb-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-meituan-yellow flex items-center justify-center text-[11px] font-semibold text-meituan-text-primary shrink-0 mb-0.5">
          美
        </div>
      )}
      <div
        className={`max-w-[72%] px-3 py-2 rounded-2xl text-[14px] leading-relaxed
          ${isUser
            ? "bg-meituan-yellow-soft text-meituan-text-primary rounded-br-sm"
            : "bg-white text-meituan-text-primary rounded-bl-sm shadow-sm border border-meituan-border"
          }`}
      >
        {children}
      </div>
    </motion.div>
  );
}
