import React from "react";
import { Tag } from "antd";

interface InspectionStatusTagProps {
  value?: string;
}

export const InspectionStatusTag: React.FC<InspectionStatusTagProps> = ({
  value,
}) => {
  const normalizedValue = value === "Complete" ? "Completed" : value;

  let color = "default";
  let text = normalizedValue || "Unknown";

  switch (normalizedValue) {
    case "Draft":
      text = "Nháp";
      color = "gray";
      break;
    case "Pending":
      text = "Chờ duyệt";
      color = "orange";
      break;
    case "Ongoing":
      text = "Đang thực hiện";
      color = "blue";
      break;
    case "Completed":
      text = "Hoàn thành";
      color = "green";
      break;
    case "Cancel":
      text = "Đã hủy";
      color = "red";
      break;
    default:
      color = "gray";
      text = "Không xác định";
  }

  return <Tag color={color}>{text}</Tag>;
};
