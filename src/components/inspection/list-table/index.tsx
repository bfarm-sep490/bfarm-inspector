/* eslint-disable prettier/prettier */
import React from "react";
import { useTable } from "@refinedev/antd";
import { getDefaultFilter, type HttpError, useGo } from "@refinedev/core";
import { Table, Button, Input, InputNumber, Typography, theme, Space } from "antd";
import { EyeOutlined, SearchOutlined } from "@ant-design/icons";
import { PaginationTotal } from "@/components/paginationTotal";
import { IInspectingForm } from "@/interfaces";
import { InspectionStatusTag } from "../status";

export const InspectionListTable: React.FC = () => {
  const { token } = theme.useToken();
  const go = useGo();


  const { tableProps, filters, setFilters } = useTable<IInspectingForm, HttpError>({
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
      go({
        to: `/inspection-forms/${id}`,
        type: "push",
      });
    }
  };

  return (
    <Table
      {...tableProps}
      rowKey="id"
      scroll={{ x: true }}
      pagination={{
        ...tableProps.pagination,
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
            placeholder="Search ID"
            onChange={(value) => setFilters([{ field: "id", operator: "eq", value }])}
          />
        )}
      />

      <Table.Column title="Plant Name" dataIndex="plan_name" key="plan_name" />
      <Table.Column title="Task Name" dataIndex="task_name" key="task_name" />
      <Table.Column
        title="Task Type"
        dataIndex="task_type"
        key="task_type"
        filterIcon={(filtered) => (
          <SearchOutlined style={{ color: filtered ? token.colorPrimary : undefined }} />
        )}
        defaultFilteredValue={getDefaultFilter("task_type", filters, "contains")}
        filterDropdown={(props) => (
          <Input
            style={{ width: "100%" }}
            placeholder="Search Task Type"
            onChange={(e) =>

              setFilters([{ field: "task_type", operator: "contains", value: e.target.value }])

            }
          />
        )}
      />

      <Table.Column title="Inspector Name" dataIndex="inspector_name" key="inspector_name" />
      <Table.Column title="Start Date" dataIndex="start_date" key="start_date" />
      <Table.Column title="End Date" dataIndex="end_date" key="end_date" />
      <Table.Column
        title="Status"
        dataIndex="status"
        key="status"
        render={(status) => <InspectionStatusTag value={status} />}
      />

      <Table.Column
        title="Actions"
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
