import React from "react";
import { Tag } from "antd";
import { useTranslate } from "@refinedev/core";

interface InspectionStatusTagProps {
  value?: string;
}

export const InspectionStatusTag: React.FC<InspectionStatusTagProps> = ({ value }) => {
  const t = useTranslate();

  const normalizedValue = value === "Complete" ? "Completed" : value;

  const statusKey = normalizedValue?.toLowerCase() || "unknown";

  const statusMap: Record<string, { textKey: string; color: string }> = {
    draft: { textKey: "status.draft", color: "gray" },
    pending: { textKey: "status.pending", color: "orange" },
    incomplete: { textKey: "status.incomplete", color: "yellow" },
    ongoing: { textKey: "status.ongoing", color: "blue" },
    completed: { textKey: "status.completed", color: "green" },
    cancel: { textKey: "status.cancel", color: "red" },
    unknown: { textKey: "status.unknown", color: "gray" },
  };

  const { textKey, color } = statusMap[statusKey] || statusMap["unknown"];

  return <Tag color={color}>{t(textKey)}</Tag>;
};
