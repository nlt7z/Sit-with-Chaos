"use client";

import { DiagnosisSummaryCard } from "@/components/prototype/DiagnosisSummaryCard";
import { motion } from "framer-motion";

export function StructuredContextCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-3"
    >
      <DiagnosisSummaryCard />
    </motion.div>
  );
}
