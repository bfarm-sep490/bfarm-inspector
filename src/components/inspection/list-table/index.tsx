/* eslint-disable prettier/prettier */
import React from "react";
import { useTable } from "@refinedev/antd";
import { getDefaultFilter, type HttpError, useGo } from "@refinedev/core";
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
} from "@ant-design/icons";
import { PaginationTotal } from "@/components/paginationTotal";
import { IInspectingForm } from "@/interfaces";
import { InspectionStatusTag } from "../status";
import dayjs from "dayjs";
import { motion } from "framer-motion"; // Import framer-motion

export const InspectionListTable: React.FC = () => {
  const go = useGo();

  const { tableProps, filters, setFilters } = useTable<
    IInspectingForm,
    HttpError
  >({
    resource: "inspecting-forms",
    filters: {
      initial: [
        { field: "id", operator: "eq", value: "" },
        { field: "task_type", operator: "contains", value: "" },
      ],
    },
  });

  const handleView = (id?: number) => {
    if (id) {
      go({ to: `/inspection-forms/${id}`, type: "push" });
    }
  };

  return (
    <Table
      {...tableProps}
      rowKey="id"
      scroll={{ x: true }}
      pagination={{
        ...tableProps.pagination,
        showTotal: (total) => (
          <PaginationTotal total={total} entityName="inspections" />
        ),
      }}
    >
      <Table.Column
        title="ID"
        dataIndex="id"
        key="id"
        width={80}
        filterIcon={(filtered) => (
          <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
        )}
        defaultFilteredValue={getDefaultFilter("id", filters, "eq")}
        filterDropdown={(props) => (
          <InputNumber
            style={{ width: "100%" }}
            placeholder="Tìm ID"
            onChange={(value) =>
              setFilters([{ field: "id", operator: "eq", value }])
            }
          />
        )}
      />

      <Table.Column
        title="📋 Tên kế hoạch"
        dataIndex="plan_name"
        key="plan_name"
      />
      <Table.Column
        title="🏬 Trung tâm kiểm định"
        dataIndex="inspector_name"
        key="inspector_name"
        render={(value) => (
          <span style={{ textTransform: "capitalize" }}>
            <BankOutlined style={{ color: "#1890ff", marginRight: 5 }} />
            {value}
          </span>
        )}
      />
      <Table.Column
        title="✏️ Nhiệm vụ"
        dataIndex="task_name"
        key="task_name"
        render={(value) => (
          <span>{value.charAt(0).toUpperCase() + value.slice(1)}</span>
        )}
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
              <span style={{ color: "#ff4d4f", marginLeft: 5 }}>
                {time}
              </span>{" "}
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
                <HourglassOutlined
                  style={{ color: "#faad14", marginRight: 5 }}
                />
              </motion.span>
              <span>{date}</span>
              <span style={{ color: "#ff4d4f", marginLeft: 5 }}>
                {time}
              </span>{" "}
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
            icon = (
              <CheckCircleOutlined
                style={{ color: "#52c41a", marginRight: 5 }}
              />
            );
            color = "green";
          } else if (status === "In Progress") {
            icon = (
              <HourglassOutlined style={{ color: "#faad14", marginRight: 5 }} />
            );
            color = "orange";
          } else {
            icon = (
              <CloseCircleOutlined
                style={{ color: "#f5222d", marginRight: 5 }}
              />
            );
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
              <Button
                icon={<EyeOutlined />}
                onClick={() => handleView(record.id)}
              />
            ) : (
              <Typography.Text type="secondary">Không có</Typography.Text>
            )}
          </Space>
        )}
      />
    </Table>
  );
};
