import React from "react";
import { useTable } from "@refinedev/antd";
import { getDefaultFilter, type HttpError, useGetIdentity, useGo, useList } from "@refinedev/core";
import { Table, Button, InputNumber, Typography, Space } from "antd";
import {
  EyeOutlined,
  SearchOutlined,
  CalendarOutlined,
  BankOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  HourglassOutlined,
  PictureOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { PaginationTotal } from "@/components/paginationTotal";
import { IIdentity, IInspectingForm } from "@/interfaces";
import { InspectionStatusTag } from "../status";
import dayjs from "dayjs";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";

export const InspectionListTable: React.FC = () => {
  const navigate = useNavigate();
  const { data: user } = useGetIdentity<IIdentity>();
  const { data, isLoading } = useList<IInspectingForm, HttpError>({
    resource: "inspecting-forms",
    filters: [{ field: "inspector_id", operator: "eq", value: user?.id }],
  });

  const handleView = (id?: number) => {
    if (id) {
      navigate(`/inspection-forms/${id}`);
    }
  };

  return (
    <Table
      loading={isLoading}
      dataSource={data?.data?.filter((x) => x.status !== "Draft")}
      pagination={{ pageSize: 10 }}
      rowKey="id"
      scroll={{ x: true }}
    >
      <Table.Column
        title="ID"
        dataIndex="id"
        key="id"
        width={80}
        filterIcon={(filtered) => (
          <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
        )}
      />

      <Table.Column title="📋 Tên kế hoạch" dataIndex="plan_name" key="plan_name" />
      <Table.Column
        title="✏️ Nhiệm vụ"
        dataIndex="task_name"
        key="task_name"
        render={(value) => <span>{value.charAt(0).toUpperCase() + value.slice(1)}</span>}
      />

      <Table.Column
        title="📅 Ngày bắt đầu"
        dataIndex="start_date"
        key="start_date"
        render={(value: string) => {
          const formattedDate = dayjs(value);
          const date = formattedDate.format("DD/MM/YYYY");
          const time = formattedDate.format("HH:mm");

          return (
            <span>
              <CalendarOutlined style={{ color: "#52c41a", marginRight: 5 }} />
              <span>{date}</span>
              <span style={{ color: "#ff4d4f", marginLeft: 5 }}>{time}</span>{" "}
            </span>
          );
        }}
      />

      <Table.Column
        title="⏰ Ngày kết thúc"
        dataIndex="end_date"
        key="end_date"
        render={(value: string) => {
          const formattedDate = dayjs(value);
          const date = formattedDate.format("DD/MM/YYYY");
          const time = formattedDate.format("HH:mm");

          return (
            <span>
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                style={{ display: "inline-block" }}
              >
                <HourglassOutlined style={{ color: "#faad14", marginRight: 5 }} />
              </motion.span>
              <span>{date}</span>
              <span style={{ color: "#ff4d4f", marginLeft: 5 }}>{time}</span>{" "}
            </span>
          );
        }}
      />

      <Table.Column
        title="🔄 Trạng thái"
        dataIndex="status"
        key="status"
        render={(status) => {
          let icon;
          let color;
          if (status === "Complete") {
            icon = <CheckCircleOutlined style={{ color: "#52c41a", marginRight: 5 }} />;
            color = "green";
          } else if (status === "Pending") {
            icon = <HourglassOutlined style={{ color: "#faad14", marginRight: 5 }} />;
            color = "orange";
          } else if (status === "Ongoing") {
            icon = <SettingOutlined style={{ color: "blue", marginRight: 5 }} />;
            color = "blue";
          } else {
            icon = <CloseCircleOutlined style={{ color: "#f5222d", marginRight: 5 }} />;
            color = "red";
          }
          return (
            <span style={{ color }}>
              {icon}
              <InspectionStatusTag value={status} />
            </span>
          );
        }}
      />

      <Table.Column
        title="Chi tiết"
        key="actions"
        fixed="right"
        align="center"
        render={(_, record: IInspectingForm) => (
          <Space>
            {record.id ? (
              <Button icon={<EyeOutlined />} onClick={() => handleView(record.id)} />
            ) : (
              <Typography.Text type="secondary">Không có</Typography.Text>
            )}
          </Space>
        )}
      />
    </Table>
  );
};
