"use client";

import { motion } from "framer-motion";
import type { Message, MerchantQuote } from "@/lib/chatStore";
import { TimestampDivider } from "./TimestampDivider";
import { ExpertBubble } from "./ExpertBubble";
import { UserBubble } from "./UserBubble";
import { SystemBubble } from "./SystemBubble";
import { MasterIntroCard } from "./MasterIntroCard";
import { MediaInBubble } from "./MediaInBubble";
import { RepairOrderCard } from "./RepairOrderCard";
import { MerchantQuoteListCard } from "./MerchantQuoteListCard";

const fadeUp = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] as const },
};

export function MessageRenderer({
  message,
  onSuggestionTap,
  onFindMerchants,
  onPickTime,
  onEditAddress,
  onViewPhotos,
  onViewDetail,
  onHowToChoose,
}: {
  message: Message;
  onSuggestionTap?: (text: string) => void;
  onFindMerchants?: () => void;
  onPickTime?: () => void;
  onEditAddress?: () => void;
  onViewPhotos?: () => void;
  onViewDetail?: (quote: MerchantQuote) => void;
  onHowToChoose?: () => void;
}) {
  switch (message.type) {
    case "timestamp":
      return (
        <motion.div key={message.id} {...fadeUp}>
          <TimestampDivider time={message.time} subtitle={message.subtitle} />
        </motion.div>
      );

    case "expert-text":
      return (
        <motion.div key={message.id} {...fadeUp}>
          <ExpertBubble
            text={message.text}
            suggestedQuestions={message.suggestedQuestions}
            expertVariant={message.expertVariant}
            onSuggestionTap={onSuggestionTap}
          />
        </motion.div>
      );

    case "user-text":
      return (
        <motion.div key={message.id} {...fadeUp}>
          <UserBubble text={message.text} />
        </motion.div>
      );

    case "user-media":
      return (
        <motion.div key={message.id} {...fadeUp}>
          <UserBubble isMedia>
            <MediaInBubble
              mediaKind={message.mediaKind}
              label={message.label}
              duration={message.duration}
            />
          </UserBubble>
        </motion.div>
      );

    case "system":
      return (
        <motion.div key={message.id} {...fadeUp}>
          <SystemBubble text={message.text} highlight={message.highlight} />
        </motion.div>
      );

    case "master-intro":
      return (
        <motion.div key={message.id} {...fadeUp}>
          <MasterIntroCard name={message.name} meta={message.meta} />
        </motion.div>
      );

    case "repair-order":
      return (
        <motion.div key={message.id} {...fadeUp}>
          <RepairOrderCard
            data={message.data}
            onFindMerchants={onFindMerchants}
            onPickTime={onPickTime}
            onEditAddress={onEditAddress}
            onViewPhotos={onViewPhotos}
          />
        </motion.div>
      );

    case "merchant-quotes":
      return (
        <motion.div key={message.id} {...fadeUp}>
          <MerchantQuoteListCard
            data={message.data}
            isLive={message.isLive}
            onViewDetail={onViewDetail}
            onHowToChoose={onHowToChoose}
          />
        </motion.div>
      );

    default:
      return null;
  }
}
