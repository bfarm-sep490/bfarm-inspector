/* eslint-disable prettier/prettier */
import React, { useState, useMemo } from "react";
import { type HttpError, useOne, useShow, useTranslate } from "@refinedev/core";
import {
  Button,
  Typography,
  Spin,
  Alert,
  Modal,
  theme,
  Divider,
  Grid,
  Flex,
  Card,
  Image,
  Space,
  Tag,
  Row,
  Col,
} from "antd";
import {
  EditOutlined,
  EyeOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  ExperimentOutlined,
} from "@ant-design/icons";
import { IInspectingForm, IInspectingResult } from "@/interfaces";
import { InspectionModalForm } from "../drawer-form";
import { InspectionStatusTag } from "../status";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import {
  chemicalGroups,
  getChemicalData,
  ChemicalDataDisplay,
} from "../chemical/ChemicalConstants";
import { InspectionResultTag } from "../result";
import { PageHeader } from "@refinedev/antd";

interface Contaminant {
  key: string;
  name: string;
  value: string;
  standard?: string;
}

interface ContaminantCheckCardProps {
  type: string;
  style?: React.CSSProperties;
  contaminants: Contaminant[];
}

const ContaminantCheckCard: React.FC<ContaminantCheckCardProps> = ({
  type,
  style,
  contaminants,
}) => {
  const { token } = theme.useToken();

  return (
    <Card
      title={
        <Flex align="center" gap={8}>
          <ExperimentOutlined style={{ color: token.colorError }} />
          <span>Tiêu chí kiểm định</span>
        </Flex>
      }
      headStyle={{
        borderBottom: `2px solid ${token.colorError}`,
        backgroundColor: token.colorErrorBg,
      }}
      style={{
        ...style,
        border: `1px solid ${token.colorBorderSecondary}`,
        borderRadius: token.borderRadiusLG,
      }}
    >
      <Space direction="vertical" style={{ width: "100%" }}>
        {chemicalGroups.map((group) => {
          const groupContaminants = contaminants.filter((item) =>
            group.keys.includes(item.key)
          );
          if (groupContaminants.length === 0) return null;

          return (
            <div key={group.title}>
              <Flex align="center" gap={8} style={{ marginBottom: 12 }}>
                <div style={{
                  width: 4,
                  height: 16,
                  backgroundColor: group.color,
                  borderRadius: 2,
                }} />
                <Typography.Text strong style={{ color: group.color, fontSize: 15 }}>
                  {group.title}
                </Typography.Text>
              </Flex>

              {groupContaminants.map((contaminant) => (
                <Flex
                  key={contaminant.key}
                  justify="space-between"
                  style={{
                    marginBottom: 8,
                    padding: "6px 8px",
                    backgroundColor: token.colorFillAlter,
                    borderRadius: token.borderRadiusSM,
                  }}
                >
                  <Typography.Text>{contaminant.name}</Typography.Text>
                  <Flex gap={8} align="center">
                    {contaminant.standard && (
                      <Tag color="default" style={{ margin: 0 }}>
                        {contaminant.standard}
                      </Tag>
                    )}
                    <Typography.Text strong>{contaminant.value}</Typography.Text>
                  </Flex>
                </Flex>
              ))}
            </div>
          );
        })}
      </Space>
    </Card>
  );
};

export const InspectionsShow: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const { token } = theme.useToken();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedResult, setSelectedResult] = useState<IInspectingForm | null>(null);
  const breakpoints = Grid.useBreakpoint();
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

  const inspection = useMemo(
    () =>
      (formQueryResult.data as { data: IInspectingForm[] } | undefined)?.data?.[0],
    [formQueryResult.data]
  );

  const {
    data: planData,
    isLoading: isPlanLoading,
    isFetching: isPlanFetching,
  } = useOne({
    resource: "plans",
    id: inspection?.plan_id,
  });
  const plan = planData?.data;

  const {
    data: plantData,
    isLoading: isPlantLoading,
    isFetching: isPlantFetching,
  } = useOne({
    resource: "plants",
    id: plan?.plant_information?.plant_id,
  });
  const plant = plantData?.data;

  const inspectionResult = useMemo(
    () =>
      (resultQueryResult.data as { data: IInspectingResult[] } | undefined)?.data?.[0],
    [resultQueryResult.data]
  );

  const isLoading =
    formQueryResult?.isLoading ||
    resultQueryResult?.isLoading ||
    formQueryResult?.isFetching ||
    resultQueryResult?.isFetching ||
    isPlanFetching ||
    isPlanLoading ||
    isPlantLoading ||
    isPlantFetching;

  const chemicalData = getChemicalData(inspectionResult);

  const initialContaminants: Contaminant[] = [
    { key: "cadmi", name: "Cadmium", value: "< 0.05 mg/kg", standard: "Max" },
    { key: "plumbum", name: "Plumbum", value: "< 0.3 mg/kg", standard: "Max" },
    { key: "salmonella", name: "Salmonella", value: "< 0 CFU/25g", standard: "Max" },
    { key: "coliforms", name: "Coliforms", value: "< 10 CFU/g", standard: "Max" },
    { key: "ecoli", name: "E.coli", value: "100 - 1000 CFU/g", standard: "Range" },
    { key: "sulfur_dioxide", name: "Sulfur Dioxide", value: "< 10 mg/kg", standard: "Max" },
    { key: "glyphosate_glufosinate", name: "Glyphosate, Glufosinate", value: "< 0.01 mg/kg", standard: "Max" },
    { key: "methyl_bromide", name: "Methyl Bromide", value: "< 0.01 mg/kg", standard: "Max" },
    { key: "dithiocarbamate", name: "Dithiocarbamate", value: "< 1.0 mg/kg", standard: "Max" },
    { key: "chlorate", name: "Chlorate", value: "< 0.01 mg/kg", standard: "Max" },
    { key: "perchlorate", name: "Perchlorate", value: "< 0.01 mg/kg", standard: "Max" },
  ];

  const handleBack = () => navigate("/inspection-forms");
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed":
        return <CheckCircleOutlined style={{ color: token.colorSuccess }} />;
      case "Ongoing":
        return <ClockCircleOutlined style={{ color: token.colorWarning }} />;
      case "Cancel":
        return <CloseCircleOutlined style={{ color: token.colorError }} />;
      default:
        return <InfoCircleOutlined style={{ color: token.colorInfo }} />;
    }
  };
  return (
    <div style={{
      padding: "16px",
      background: token.colorBgContainer,
      maxWidth: 1200,
      margin: "0 auto",
    }}>
      {/* Header */}
      <PageHeader
        onBack={handleBack}
        title={
          <Typography.Title level={4} style={{ margin: 0 }}>
            #{inspection.id} - {inspection.task_name}
          </Typography.Title>
        }
        extra={
          <Button
            type="primary"
            onClick={handleCreate}
            disabled={inspection.status === "Cancel"}
          >
            Hoàn Thành
          </Button>
        }
        style={{
          padding: "0 0 16px 0",
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
        }}
      />

      <Row gutter={[24, 24]} style={{ marginTop: 16 }}>

        <Col xs={24} md={16}>
          <Space direction="vertical" size={24} style={{ width: "100%" }}>
     
            <Card
              title={
                <Flex align="center" gap={8}>
                  <InfoCircleOutlined style={{ color: token.colorPrimary }} />
                  <span>Thông tin giống cây kiểm nghiệm</span>
                </Flex>
              }
              headStyle={{
                borderBottom: `1px solid ${token.colorBorderSecondary}`,
                padding: "12px 16px",
              }}
              bodyStyle={{ padding: "16px" }}
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} md={8}>
                  <Image
                    width="100%"
                    style={{
                      borderRadius: token.borderRadiusLG,
                      border: `1px solid ${token.colorBorder}`,
                      aspectRatio: "1/1",
                      objectFit: "cover",
                    }}
                    src={plant?.image_url}
                    fallback="https://via.placeholder.com/300x300?text=No+Image"
                  />
                </Col>
                <Col xs={24} md={16}>
                  <Space direction="vertical" size={16} style={{ width: "100%" }}>
                    <Flex justify="space-between" align="center">
                      <Typography.Text strong>Tên cây trồng</Typography.Text>
                      <Typography.Text>{plant?.plant_name || "N/A"}</Typography.Text>
                    </Flex>
                    <Flex justify="space-between" align="center">
                      <Typography.Text strong>Loại cây trồng</Typography.Text>
                      <Typography.Text>{plant?.type || "N/A"}</Typography.Text>
                    </Flex>
                    {plant?.description && (
                      <div>
                        <Typography.Text strong>Mô tả</Typography.Text>
                        <Typography.Paragraph
                          ellipsis={{ rows: 3, expandable: true }}
                          style={{ marginBottom: 0 }}
                        >
                          {plant.description}
                        </Typography.Paragraph>
                      </div>
                    )}
                  </Space>
                </Col>
              </Row>
            </Card>

            <Card
              title={
                <Flex align="center" gap={8}>
                  <InfoCircleOutlined style={{ color: token.colorPrimary }} />
                  <span>Thông tin công việc</span>
                </Flex>
              }
              headStyle={{
                borderBottom: `1px solid ${token.colorBorderSecondary}`,
                padding: "12px 16px",
              }}
              bodyStyle={{ padding: "16px" }}
            >
              
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Space direction="vertical" size={12} style={{ width: "100%" }}>
                    <Row gutter={[16, 16]}>
                      <Col xs={24} md={12}>
                        <Flex justify="space-between" align="center">
                          <Typography.Text strong>Tên kế hoạch</Typography.Text>
                          <Typography.Text>{inspection.plan_name || "N/A"}</Typography.Text>
                        </Flex>
                      </Col>
                      <Col xs={24} md={12}>
                        <Flex justify="space-between" align="center">
                          <Typography.Text strong>Trung tâm kiểm định</Typography.Text>
                          <Typography.Text>{inspection.inspector_name || "N/A"}</Typography.Text>
                        </Flex>
                      </Col>
                    </Row>

                    <Divider style={{ margin: "8px 0" }} />

                    <Row gutter={[16, 16]}>
                      <Col xs={24} md={12}>
                        <Flex justify="space-between" align="center">
                          <Typography.Text strong>Ngày bắt đầu</Typography.Text>
                          <Typography.Text>
                            {dayjs(inspection.start_date).format("DD/MM/YYYY")} lúc{" "}
                            <Tag color="red" style={{ marginLeft: 4 }}>
                              {dayjs(inspection.start_date).format("HH:mm:ss")}
                            </Tag>
                          </Typography.Text>
                        </Flex>
                      </Col>
                      <Col xs={24} md={12}>
                        <Flex justify="space-between" align="center">
                          <Typography.Text strong>Ngày kết thúc</Typography.Text>
                          <Typography.Text>
                            {dayjs(inspection.end_date).format("DD/MM/YYYY")} lúc{" "}
                            <Tag color="red" style={{ marginLeft: 4 }}>
                              {dayjs(inspection.end_date).format("HH:mm:ss")}
                            </Tag>
                          </Typography.Text>
                        </Flex>
                      </Col>
                    </Row>

                    <Divider style={{ margin: "8px 0" }} />

                    <Row gutter={[16, 16]}>
                      <Col xs={24} md={12}>
                        <Flex justify="space-between" align="center">
                          <Typography.Text strong>Trạng thái</Typography.Text>
                          <Flex align="center" gap={8}>
                            {getStatusIcon(inspection.status)}
                            <InspectionStatusTag value={inspection.status} />
                          </Flex>
                        </Flex>
                      </Col>
                    </Row>

               
                  </Space>
                </Col>
              </Row>
            </Card>

            <Card
              title={
                <Flex align="center" gap={8}>
                  <InfoCircleOutlined style={{ color: token.colorPrimary }} />
                  <span>Kết quả</span>
                </Flex>
              }
              headStyle={{
                borderBottom: `1px solid ${token.colorBorderSecondary}`,
              }}
              extra={
                inspectionResult ? (
                  <Button
                    type="primary"
                    icon={<EyeOutlined />}
                    onClick={handleOpenModal}
                  >
                    Xem chi tiết
                  </Button>
                ) : (
                  !inspectionResult &&
                  (inspection.status === "Pending" || inspection.status === "Ongoing") && (
                    <Button
                      type="primary"
                      icon={<EditOutlined />}
                      onClick={handleCreate}
                    >
                      Hoàn Thành
                    </Button>
                  )
                )
              }
            >
              {inspectionResult ? (
                <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                  <Flex justify="space-between">
                    <Typography.Text strong>Đánh giá</Typography.Text>
                    <InspectionResultTag value={inspectionResult.evaluated_result} />
                  </Flex>
                  <Flex justify="space-between">
                    <Typography.Text strong>Nội dung</Typography.Text>
                    <Typography.Text>{inspectionResult.result_content || "N/A"}</Typography.Text>
                  </Flex>
                </Space>
              ) : inspection.status === "Cancel" ? (
                <Alert
                  type="error"
                  message="Đợt kiểm nghiệm đã bị hủy. Không thể tạo kết quả."
                  showIcon
                />
              ) : (
                <Alert
                  type="info"
                  message="Chưa có kết quả kiểm nghiệm."
                  showIcon
                />
              )}
            </Card>
          </Space>
        </Col>

        <Col xs={24} md={8}>
          <Space direction="vertical" size={24} style={{ width: "100%" }}>
            <ContaminantCheckCard
              type={plant?.type}
              contaminants={initialContaminants}
              style={{ height: "100%" }}
            />

            <Card
              title={
                <Flex align="center" gap={8}>
                  <InfoCircleOutlined style={{ color: token.colorPrimary }} />
                  <span>Thời gian</span>
                </Flex>
              }
              headStyle={{
                borderBottom: `1px solid ${token.colorBorderSecondary}`,
              }}
            >
              <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                <Flex justify="space-between">
                  <Typography.Text strong>Hoàn thành</Typography.Text>
                  <Typography.Text>
                    {inspection.complete_date ? (
                      <>
                        {dayjs(inspection.complete_date).format("DD/MM/YYYY")} lúc{" "}
                        <Tag color="red">
                          {dayjs(inspection.complete_date).format("HH:mm:ss")}
                        </Tag>
                      </>
                    ) : (
                      "N/A"
                    )}
                  </Typography.Text>
                </Flex>
                <Flex justify="space-between">
                  <Typography.Text strong>Tạo lúc</Typography.Text>
                  <Typography.Text>
                    {dayjs(inspection.created_at).format("DD/MM/YYYY")} lúc{" "}
                    <Tag color="red">
                      {dayjs(inspection.created_at).format("HH:mm:ss")}
                    </Tag>
                  </Typography.Text>
                </Flex>
                <Flex justify="space-between">
                  <Typography.Text strong>Tạo bởi</Typography.Text>
                  <Typography.Text>{inspection.created_by || "N/A"}</Typography.Text>
                </Flex>
                <Flex justify="space-between">
                  <Typography.Text strong>Cập nhật</Typography.Text>
                  <Typography.Text>
                    {inspection.updated_at
                      ? dayjs(inspection.updated_at).format("DD/MM/YYYY")
                      : "N/A"}
                  </Typography.Text>
                </Flex>
                <Flex justify="space-between">
                  <Typography.Text strong>Cập nhật bởi</Typography.Text>
                  <Typography.Text>{inspection.updated_by || "N/A"}</Typography.Text>
                </Flex>
              </Space>
            </Card>
          </Space>
        </Col>
      </Row>

      <Modal
        open={isModalVisible}
        onCancel={handleCloseModal}
        footer={null}
        width={750}
        title={
          <Typography.Title level={3} style={{ margin: 0 }}>
            Chi tiết kết quả kiểm nghiệm
          </Typography.Title>
        }
      >
        <ChemicalDataDisplay inspectionResult={inspectionResult} />
      </Modal>

      {isEditing && selectedResult && (
        <InspectionModalForm
          type={plant?.type}
          id={selectedResult.id}
          action="create"
          open={isEditing}
          initialValues={selectedResult}
          onClose={handleCloseDrawer}
          onMutationSuccess={() => {
            formQueryResult.refetch();
            resultQueryResult.refetch();
            handleCloseDrawer();
          }}
        />
      )}
    </div>
  );
};