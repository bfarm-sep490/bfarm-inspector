import React from "react";
import { Tag } from "antd";

interface InspectionResultTagProps {
  value?: "Pass" | "Fail" | string;
}

export const InspectionResultTag: React.FC<InspectionResultTagProps> = ({ value }) => {
  let color = "default";
  let text = value || "Unknown";

  switch (value) {
    case "Pass":
      color = "green";
      text = "Pass";
      break;
    case "Fail":
      color = "red";
      text = "Fail";
      break;
    default:
      color = "gray";
      text = "Unknown";
  }

  return <Tag color={color}>{text}</Tag>;
};
