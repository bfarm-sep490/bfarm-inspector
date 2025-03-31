/* eslint-disable prettier/prettier */
import React, { useState, useMemo } from "react";
import { type HttpError, useShow, useTranslate } from "@refinedev/core";
import { Button, List, Typography, Spin, Alert, Drawer, Modal } from "antd";
import { EditOutlined, EyeOutlined } from "@ant-design/icons";
import { IInspectingForm, IInspectingResult } from "@/interfaces";
import { InspectionModalForm } from "../drawer-form";
import { InspectionStatusTag } from "../status";
import { useNavigate, useParams } from "react-router";
import dayjs from "dayjs";
import { getChemicalData } from "../chemical/ChemicalConstants";

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

      setSelectedResult({ ...newInspection, id }); // 👈 giữ lại `id` để truyền xuống
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
        </div>

        {inspectionResult ? (
          <>
            <List
              dataSource={[
                {
                  label: "Nội dung",
                  value: inspectionResult.result_content || "N/A",
                },
                {
                  label: "Đánh giá",
                  value: inspectionResult.evaluated_result || "N/A",
                },
                {
                  label: "Ảnh kết quả",
                  value:
                    inspectionResult.inspect_images?.length > 0
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
            {
              label: "Loại công việc",
              value: inspection.task_type || "Không xác định",
            },
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
