import { useGo, useList } from "@refinedev/core";
import { Button, Card, Divider, List, Tag, Typography } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { useLocation } from "react-router";
import { IInspectingForm } from "@/interfaces";
import { PaginationTotal } from "@/components/paginationTotal";

const getStatusColor = (status?: string) => {
  const colorMap: Record<string, string> = {
    completed: "green",
    ongoing: "blue",
    pending: "gold",
    cancel: "red",
  };
  return colorMap[status || ""] || "gray";
};

export interface IInspectorWithTask extends IInspectingForm {
  task?: IInspectingForm;
}

export const InspectionListCard = () => {
  const go = useGo();
  const { pathname } = useLocation();

  const { data: inspectorData } = useList<IInspectingForm>({
    resource: "inspector",
  });

  const { data: taskData } = useList<IInspectingForm>({
    resource: "inspectingTask",
  });

  const combinedData: IInspectorWithTask[] =
    inspectorData?.data.map((inspector) => {
      const task = taskData?.data.find((t) => t.inspector_id === 1);
      return { ...inspector, task };
    }) || [];

  return (
    <>
      <Divider style={{ margin: "16px 0px" }} />
      <List
        dataSource={combinedData}
        pagination={{
          showTotal: (total) => <PaginationTotal total={total} entityName="inspector" />,
        }}
        grid={{
          gutter: [16, 16],
          column: 4,
        }}
        renderItem={(inspector) => (
          <List.Item>
            <Card hoverable variant="borderless">
              <Tag color={getStatusColor(inspector.task?.status)}>
                {inspector.task?.status?.toUpperCase()}
              </Tag>
              <Typography.Title level={5}>BFARm</Typography.Title>
              <Typography.Text>{inspector.task?.task_name}</Typography.Text>
              <Button
                icon={<EyeOutlined />}
                onClick={() =>
                  go({
                    to: `/inspector/show/1`,
                    query: { to: pathname },
                    type: "replace",
                  })
                }
              >
                View
              </Button>
            </Card>
          </List.Item>
        )}
      />
    </>
  );
};
