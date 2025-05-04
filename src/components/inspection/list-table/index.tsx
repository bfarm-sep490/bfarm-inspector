import React from "react";
import { useTable } from "@refinedev/antd";
import { getDefaultFilter, type HttpError, useGetIdentity, useGo } from "@refinedev/core";
import { Table, Button, InputNumber, Typography, Space, theme } from "antd";
import {
  EyeOutlined,
  SearchOutlined,
  CalendarOutlined,
  HourglassOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { PaginationTotal } from "@/components/paginationTotal";
import { IIdentity, IInspectingForm } from "@/interfaces";
import { InspectionStatusTag } from "../status";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

export const InspectionListTable: React.FC = () => {
  const { token } = theme.useToken();
  const { t } = useTranslation();
  const go = useGo();
  const { data: user } = useGetIdentity<IIdentity>();
  const { tableProps, filters, setFilters } = useTable<IInspectingForm, HttpError>({
    resource: "inspecting-forms",
    filters: {
      initial: [
        { field: "id", operator: "eq", value: "" },
        { field: "task_type", operator: "contains", value: "" },
        { field: "inspector_id", operator: "eq", value: user?.id },
      ],
    },
  });

  const handleView = (id?: number) => {
    if (id) {
      go({
        to: `/inspection-forms/${id}`,
        type: "push",
      });
    }
  };

  return (
    <Table
      {...tableProps}
      dataSource={tableProps.dataSource?.filter(
        (item) => item.status !== "Draft" && item.status !== "Pending",
      )}
      rowKey="id"
      scroll={{ x: true }}
      pagination={{
        ...tableProps.pagination,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total) => <PaginationTotal total={total} entityName="inspections" />,
      }}
    >
      <Table.Column
        title="ID"
        dataIndex="id"
        key="id"
        width={80}
        filterIcon={(filtered) => (
          <SearchOutlined style={{ color: filtered ? token.colorPrimary : undefined }} />
        )}
        defaultFilteredValue={getDefaultFilter("id", filters, "eq")}
        filterDropdown={(props) => (
          <InputNumber
            style={{ width: "100%" }}
            placeholder={t("inspections.search_id")}
            onChange={(value) => setFilters([{ field: "id", operator: "eq", value }])}
          />
        )}
      />

      <Table.Column title={t("inspections.plan_name")} dataIndex="plan_name" key="plan_name" />

      <Table.Column
        title={t("inspections.task_name")}
        dataIndex="task_name"
        key="task_name"
        render={(value: string) => value.charAt(0).toUpperCase() + value.slice(1)}
      />
      <Table.Column
        title={t("inspections.start_date")}
        dataIndex="start_date"
        key="start_date"
        render={(value: string) => {
          const now = dayjs();
          const startDate = dayjs(value);
          const isStarted = now.isAfter(startDate) || now.isSame(startDate);
          const date = startDate.format("DD/MM/YYYY");
          const time = startDate.format("HH:mm");

          return (
            <span>
              <CalendarOutlined
                style={{
                  color: isStarted ? "#52c41a" : "#d9d9d9",
                  marginRight: 5,
                }}
              />
              <span
                style={{
                  color: isStarted ? "#52c41a" : "#d9d9d9",
                }}
              >
                {date}
              </span>
              <span
                style={{
                  color: isStarted ? "#ff4d4f" : "#8c8c8c",
                  marginLeft: 5,
                }}
              >
                {time}
              </span>
            </span>
          );
        }}
      />

      <Table.Column
        title={t("inspections.end_date")}
        dataIndex="end_date"
        key="end_date"
        render={(value: string) => {
          const date = dayjs(value).format("DD/MM/YYYY");
          const time = dayjs(value).format("HH:mm");
          return (
            <span>
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                style={{ display: "inline-block" }}
              >
                <HourglassOutlined style={{ color: "#faad14", marginRight: 5 }} />
              </motion.span>
              {date}
              <span style={{ color: "#ff4d4f", marginLeft: 5 }}>{time}</span>
            </span>
          );
        }}
      />

      <Table.Column
        title={t("inspections.status")}
        dataIndex="status"
        key="status"
        render={(status: string) => {
          let icon = null;
          let color = "";
          switch (status) {
            case "Complete":
              icon = <CheckCircleOutlined style={{ color: "#52c41a", fontSize: 18 }} />;
              color = "green";
              break;
            case "Pending":
              icon = <HourglassOutlined style={{ color: "#faad14", fontSize: 18 }} />;
              color = "orange";
              break;
            case "Ongoing":
              icon = <SettingOutlined style={{ color: "blue", fontSize: 18 }} />;
              color = "blue";
              break;
            default:
              icon = <CloseCircleOutlined style={{ color: "#f5222d", fontSize: 18 }} />;
              color = "red";
          }
          return (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {icon}
              <InspectionStatusTag value={status} />
            </div>
          );
        }}
      />

      <Table.Column
        title={t("inspections.actions")}
        key="actions"
        fixed="right"
        align="center"
        render={(_, record: IInspectingForm) => (
          <Space>
            {record.id ? (
              <Button icon={<EyeOutlined />} onClick={() => handleView(record.id)} />
            ) : (
              <Typography.Text type="secondary">N/A</Typography.Text>
            )}
          </Space>
        )}
      />
    </Table>
  );
};
