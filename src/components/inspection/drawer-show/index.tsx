/* eslint-disable prettier/prettier */
import React, { useState, useMemo } from "react";
import { type HttpError, useShow, useTranslate } from "@refinedev/core";
import {
  Button,
  List,
  Typography,
  Spin,
  Alert,
  Drawer,
  Modal,
  Table,
} from "antd";
import { EditOutlined, EyeOutlined } from "@ant-design/icons";
import { IInspectingForm, IInspectingResult } from "@/interfaces";
import { InspectionModalForm } from "../drawer-form";
import { InspectionStatusTag } from "../status";
import { useNavigate, useParams } from "react-router";
import dayjs from "dayjs";
import {
  chemicalGroups,
  columns,
  getChemicalData,
} from "../chemical/ChemicalConstants";
import { InspectionResultTag } from "../result";

export const InspectionsShow: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedResult, setSelectedResult] = useState<IInspectingForm | null>(
    null
  );

  const { id } = useParams();
  const navigate = useNavigate();
  const t = useTranslate();

  const { queryResult: formQueryResult } = useShow<
    { data: IInspectingForm[] },
    HttpError
  >({
    resource: "inspecting-forms",
    id,
    queryOptions: { enabled: !!id },
  });

  const { queryResult: resultQueryResult } = useShow<
    { data: IInspectingResult[] },
    HttpError
  >({
    resource: "inspecting-results",
    id,
    queryOptions: { enabled: !!id },
  });

  const isLoading = formQueryResult.isLoading || resultQueryResult.isLoading;

  const inspection = useMemo(
    () =>
      (formQueryResult.data as { data: IInspectingForm[] } | undefined)
        ?.data?.[0],
    [formQueryResult.data]
  );

  const inspectionResult = useMemo(
    () =>
      (resultQueryResult.data as { data: IInspectingResult[] } | undefined)
        ?.data?.[0],
    [resultQueryResult.data]
  );

  const chemicalData = getChemicalData(inspectionResult);

  const handleBack = () => navigate(-1);
  const handleCreate = () => {
    if (inspection) {
      const { id, ...rest } = inspection;
      const newInspection = {
        ...rest,
        start_date: inspection.start_date
          ? dayjs(inspection.start_date).toISOString()
          : "",
        end_date: inspection.end_date
          ? dayjs(inspection.end_date).toISOString()
          : "",
      } as IInspectingForm;

      setSelectedResult({ ...newInspection, id });
      setIsEditing(true);
    }
  };

  const handleCloseDrawer = () => {
    setIsEditing(false);
    setSelectedResult(null);
  };

  const handleOpenModal = () => setIsModalVisible(true);
  const handleCloseModal = () => setIsModalVisible(false);

  if (!id) return <Alert type="error" message="No inspection ID provided" />;
  if (isLoading) return <Spin size="large" />;
  if (formQueryResult.error || resultQueryResult.error)
    return <Alert type="error" message="Failed to load inspection data" />;
  if (!inspection) return <Typography.Text>Không có dữ liệu.</Typography.Text>;

  return (
    <Drawer
      open={true}
      width={800}
      onClose={handleBack}
      bodyStyle={{ padding: "24px 32px" }}
      title={
        <Typography.Title level={3} style={{ margin: 0 }}>
          #{inspection.id} - {inspection.task_name}
        </Typography.Title>
      }
    >
      <div style={{ marginBottom: 40 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <Typography.Title level={3} style={{ margin: 0 }}>
            Kết quả
          </Typography.Title>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={handleOpenModal}
          >
            Xem chi tiết
          </Button>
        </div>

        {inspectionResult ? (
          <>
            <List
              dataSource={[
                {
                  label: "Đánh giá",
                  value: (
                    <InspectionResultTag
                      value={inspectionResult.evaluated_result}
                    />
                  ),
                },
                {
                  label: "Nội dung",
                  value: inspectionResult.result_content || "N/A",
                },
                {
                  label: "Ảnh kết quả",
                  value:
                    Array.isArray(inspectionResult.inspect_images) &&
                      inspectionResult.inspect_images.length > 0
                      ? "Có"
                      : "Không có",
                },
              ]}
              renderItem={(data) => (
                <List.Item>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      width: "100%",
                    }}
                  >
                    <Typography.Text strong>{data.label}</Typography.Text>
                    <Typography.Text>{data.value}</Typography.Text>
                  </div>
                </List.Item>
              )}
            />
          </>
        ) : (
          <Typography.Text type="secondary">Chưa có kết quả.</Typography.Text>
        )}
      </div>
      {/* Chi tiết công việc */}
      <div style={{ marginBottom: 40 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography.Title level={2} style={{ marginBottom: 8 }}>
            Chi tiết công việc
          </Typography.Title>
        </div>

        <List
          dataSource={[
            { label: "Tên kế hoạch", value: inspection.plan_name || "N/A" },
            { label: "Trung tâm kiểm định", value: inspection.inspector_name || "N/A" },
            { label: "Mô tả", value: inspection.description || "N/A" },
            {
              label: "Ngày bắt đầu",
              value: new Date(inspection.start_date).toLocaleDateString(),
            },
            {
              label: "Ngày kết thúc",
              value: new Date(inspection.end_date).toLocaleDateString(),
            },
            {
              label: "Trạng thái",
              value: <InspectionStatusTag value={inspection?.status} />,
            },
            {
              label: "Cho thu hoạch",
              value: inspection.can_harvest ? "Có" : "Không",
            },
          ]}
          renderItem={(data) => (
            <List.Item>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                <Typography.Text strong>{data.label}</Typography.Text>
                <Typography.Text>{data.value}</Typography.Text>
              </div>
            </List.Item>
          )}
        />
      </div>

      {/* Thời gian */}
      <div style={{ marginBottom: 40 }}>
        <Typography.Title level={2}>Thời gian</Typography.Title>
        <List
          dataSource={[
            {
              label: "Hoàn thành",
              value: inspection.complete_date
                ? new Date(inspection.complete_date).toLocaleDateString()
                : "N/A",
            },
            {
              label: "Tạo lúc",
              value: new Date(inspection.created_at).toLocaleDateString(),
            },
            { label: "Tạo bởi", value: inspection.created_by || "N/A" },
            {
              label: "Cập nhật",
              value: inspection.updated_at
                ? new Date(inspection.updated_at).toLocaleDateString()
                : "N/A",
            },
            { label: "Cập nhật bởi", value: inspection.updated_by || "N/A" },
          ]}
          renderItem={(data) => (
            <List.Item>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                <Typography.Text strong>{data.label}</Typography.Text>
                <Typography.Text>{data.value}</Typography.Text>
              </div>
            </List.Item>
          )}
        />
      </div>
      <Modal
        open={isModalVisible}
        onCancel={handleCloseModal}
        footer={null}
        width={750}
      >
        <Typography.Title level={3}>
          Chi tiết kết quả kiểm nghiệm
        </Typography.Title>
        {chemicalGroups.map((group) => {
          const groupData = chemicalData.filter((item) =>
            group.keys.includes(item.key)
          );
          if (groupData.length === 0) return null;

          return (
            <div key={group.title} style={{ marginBottom: 24 }}>
              <Typography.Text strong>{group.title}</Typography.Text>
              <Table
                rowKey="key"
                dataSource={groupData}
                columns={columns}
                pagination={false}
                bordered
                style={{ marginTop: 8 }}
              />
            </div>
          );
        })}
      </Modal>

      <Button
        type="primary"
        icon={<EditOutlined />}
        onClick={handleCreate}
        disabled={!!inspectionResult}
      >
        Hoàn Thành
      </Button>

      {isEditing && selectedResult && (
        <InspectionModalForm
          id={selectedResult.id}
          action="create"
          open={isEditing}
          initialValues={selectedResult}
          onClose={handleCloseDrawer}
          onMutationSuccess={handleCloseDrawer}
        />
      )}
    </Drawer>
  );
};
