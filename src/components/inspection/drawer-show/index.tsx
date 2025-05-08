import React, { useState, useMemo } from "react";
import { type HttpError, useOne, useShow } from "@refinedev/core";
import {
  Button,
  Typography,
  Alert,
  theme,
  Divider,
  Flex,
  Card,
  Image,
  Space,
  Tag,
  Row,
  Col,
  message,
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
import { useNavigate, useParams } from "react-router";
import dayjs from "dayjs";
import { getChemicalData } from "../chemical/ChemicalConstants";
import { InspectionResultTag } from "../result";
import { PageHeader } from "@refinedev/antd";
import { InspectionModals } from "../inspectionModals";
import { useTranslation } from "react-i18next";

export const InspectionsShow: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isCriteriaModalVisible, setIsCriteriaModalVisible] = useState(false);
  const [selectedResult, setSelectedResult] = useState<IInspectingForm | null>(null);
  const { token } = theme.useToken();
  const { id } = useParams();
  const navigate = useNavigate();

  const { queryResult: formQueryResult } = useShow<{ data: IInspectingForm[] }, HttpError>({
    resource: "inspecting-forms",
    id,
    queryOptions: { enabled: !!id },
  });

  const { queryResult: resultQueryResult } = useShow<{ data: IInspectingResult[] }, HttpError>({
    resource: "inspecting-results",
    id,
    errorNotification: false,
  });

  const inspection = useMemo(
    () => (formQueryResult.data as { data: IInspectingForm[] } | undefined)?.data?.[0],
    [formQueryResult.data],
  );

  const { data: planData } = useOne({
    resource: "plans",
    id: inspection?.plan_id,
  });
  const plan = planData?.data;

  const { data: plantData } = useOne({
    resource: "plants",
    id: plan?.plant_information?.plant_id,
  });
  const plant = plantData?.data;

  const inspectionResult = useMemo(
    () => (resultQueryResult.data as { data: IInspectingResult[] } | undefined)?.data?.[0],
    [resultQueryResult.data],
  );

  const chemicalData = useMemo(() => {
    const data = getChemicalData(inspectionResult);
    return data.map((item) => ({
      ...item,
      key: item.key,
      name: item.label,
      value: item.value !== undefined ? item.value.toString() : "N/A",
    }));
  }, [inspectionResult]);

  const handleBack = () => navigate("/inspection-forms");

  const handleCreate = () => {
    if (inspection && inspection.status !== "Completed" && inspection.status !== "Cancel") {
      const { id, ...rest } = inspection;
      const newInspection = {
        ...rest,
        start_date: inspection.start_date ? dayjs(inspection.start_date).toISOString() : "",
        end_date: inspection.end_date ? dayjs(inspection.end_date).toISOString() : "",
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
  const handleOpenCriteriaModal = () => setIsCriteriaModalVisible(true);
  const handleCloseCriteriaModal = () => setIsCriteriaModalVisible(false);

  const handleMutationSuccess = () => {
    message.success("Đã lưu kết quả kiểm nghiệm");
    formQueryResult.refetch();
    resultQueryResult.refetch();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed":
        return <CheckCircleOutlined style={{ color: token.colorSuccess }} />;
      case "Ongoing":
        return <ClockCircleOutlined style={{ color: token.colorWarning }} />;
      case "Cancel":
        return <CloseCircleOutlined style={{ color: token.colorError }} />;
      case "Pending":
        return <ClockCircleOutlined style={{ color: token.colorInfo }} />;
      case "Incomplete":
        return <ClockCircleOutlined style={{ color: token.colorInfo }} />;
      default:
        return <InfoCircleOutlined style={{ color: token.colorInfo }} />;
    }
  };

  const now = dayjs();
  const isBeforeStart = inspection?.start_date ? now.isBefore(dayjs(inspection.start_date)) : false;
  const isAfterEnd = inspection?.end_date ? now.isAfter(dayjs(inspection.end_date)) : false;
  const { t } = useTranslation();

  return (
    <div
      style={{
        padding: "24px",
        background: token.colorBgContainer,
        maxWidth: 1200,
        margin: "0 auto",
      }}
    >
      <PageHeader
        onBack={handleBack}
        title={
          <Typography.Title level={2} style={{ margin: 0, color: token.colorPrimary }}>
            #{inspection?.id} - {inspection?.task_name}
          </Typography.Title>
        }
      />

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24} md={16}>
          <Space direction="vertical" size={24} style={{ width: "100%" }}>
            <Card
              title={
                <Flex align="center" justify="space-between">
                  <Flex align="center" gap={12}>
                    <InfoCircleOutlined style={{ color: token.colorPrimary, fontSize: 24 }} />
                    <Typography.Title
                      level={4}
                      style={{ margin: 0, color: token.colorTextHeading }}
                    >
                      {t("inspection.title")}
                    </Typography.Title>
                  </Flex>

                  <Flex align="center" gap={8}>
                    {getStatusIcon(inspection?.status || "")}
                    <InspectionStatusTag value={inspection?.status || ""} />
                  </Flex>
                </Flex>
              }
              styles={{
                header: {
                  borderBottom: `2px solid ${token.colorPrimary}`,
                  padding: "16px 24px",
                  backgroundColor: token.colorBgElevated,
                },
                body: {
                  padding: "24px",
                },
              }}
              style={{
                borderRadius: token.borderRadiusLG,
                boxShadow: token.boxShadow,
                backgroundColor: token.colorBgElevated,
              }}
            >
              <Row gutter={[24, 24]}>
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
                    fallback="https://placehold.co/300x300?text=No+Image"
                  />
                </Col>
                <Col xs={24} md={16}>
                  <Space direction="vertical" size={16} style={{ width: "100%" }}>
                    <Flex justify="space-between" align="center">
                      <Typography.Text
                        strong
                        style={{ fontSize: 16, color: token.colorTextHeading }}
                      >
                        {t("inspection.cropName")}
                      </Typography.Text>
                      <Typography.Text style={{ fontSize: 16 }}>
                        {plant?.plant_name || "N/A"}
                      </Typography.Text>
                    </Flex>
                    <Flex justify="space-between" align="center">
                      <Typography.Text
                        strong
                        style={{ fontSize: 16, color: token.colorTextHeading }}
                      >
                        {t("inspection.cropType")}
                      </Typography.Text>
                      <Typography.Text style={{ fontSize: 16 }}>
                        {plant?.type || "N/A"}
                      </Typography.Text>
                    </Flex>
                    {plant?.description && (
                      <div>
                        <Typography.Text
                          strong
                          style={{
                            fontSize: 16,
                            color: token.colorTextHeading,
                          }}
                        >
                          {t("inspection.description")}
                        </Typography.Text>
                        <Typography.Paragraph
                          ellipsis={{ rows: 3, expandable: true }}
                          style={{
                            marginBottom: 0,
                            fontSize: 14,
                            color: token.colorTextDescription,
                          }}
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
                <Flex align="center" gap={12}>
                  <InfoCircleOutlined style={{ color: token.colorPrimary, fontSize: 24 }} />
                  <Typography.Title level={4} style={{ margin: 0, color: token.colorTextHeading }}>
                    {t("inspection.result")}
                  </Typography.Title>
                </Flex>
              }
              styles={{
                header: {
                  borderBottom: `2px solid ${token.colorPrimary}`,
                  padding: "16px 24px",
                  backgroundColor: token.colorBgElevated,
                },
                body: {
                  padding: "24px",
                },
              }}
              style={{
                borderRadius: token.borderRadiusLG,
                boxShadow: token.boxShadow,
                backgroundColor: token.colorBgElevated,
              }}
              extra={
                inspectionResult ? (
                  <Button
                    type="primary"
                    icon={<EyeOutlined />}
                    onClick={handleOpenModal}
                    style={{ borderRadius: token.borderRadiusSM }}
                  >
                    {t("inspection.viewDetail")}
                  </Button>
                ) : (
                  (inspection?.status === "Ongoing" || inspection?.status === "Incomplete") && (
                    <Button
                      type="primary"
                      icon={<EditOutlined />}
                      onClick={handleCreate}
                      disabled={isBeforeStart || isAfterEnd || inspection?.status === "Incomplete"}
                      style={{
                        borderRadius: token.borderRadiusSM,
                        backgroundColor: token.colorPrimary,
                        borderColor: token.colorPrimary,
                      }}
                    >
                      {t("inspection.complete")}
                    </Button>
                  )
                )
              }
            >
              {inspectionResult ? (
                <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                  <Flex justify="space-between">
                    <Typography.Text strong style={{ fontSize: 16 }}>
                      {t("inspection.evaluation")}
                    </Typography.Text>
                    <InspectionResultTag value={inspectionResult.evaluated_result} />
                  </Flex>
                  <Flex justify="space-between">
                    <Typography.Text strong style={{ fontSize: 16 }}>
                      {t("inspection.resultContent")}
                    </Typography.Text>
                    <Typography.Text>{inspectionResult.result_content}</Typography.Text>
                  </Flex>
                </Space>
              ) : inspection?.status === "Ongoing" ? (
                isBeforeStart ? (
                  <Alert type="warning" message={t("inspection.beforeStart")} showIcon />
                ) : (
                  <Alert type="info" message={t("inspection.noResult")} showIcon />
                )
              ) : inspection?.status === "Incomplete" ? (
                <Alert type="error" message={t("inspection.late")} showIcon />
              ) : (
                <Alert type="warning" message={t("inspection.invalid")} showIcon />
              )}
            </Card>

            <Card
              title={
                <Flex align="center" gap={12}>
                  <InfoCircleOutlined style={{ color: token.colorPrimary, fontSize: 24 }} />
                  <Typography.Title level={4} style={{ margin: 0, color: token.colorTextHeading }}>
                    {t("inspection.jobTitle")}
                  </Typography.Title>
                </Flex>
              }
              styles={{
                header: {
                  borderBottom: `2px solid ${token.colorPrimary}`,
                  padding: "16px 24px",
                  backgroundColor: token.colorBgElevated,
                },
                body: {
                  padding: "24px",
                },
              }}
              style={{
                borderRadius: token.borderRadiusLG,
                boxShadow: token.boxShadow,
                backgroundColor: token.colorBgElevated,
              }}
            >
              <Space direction="vertical" size={16} style={{ width: "100%" }}>
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                    <Flex justify="space-between" align="center">
                      <Typography.Text
                        strong
                        style={{ fontSize: 16, color: token.colorTextHeading }}
                      >
                        {t("inspection.planName")}
                      </Typography.Text>
                      <Typography.Text style={{ fontSize: 16 }}>
                        {inspection?.plan_name || "N/A"}
                      </Typography.Text>
                    </Flex>
                  </Col>
                  <Col xs={24} md={12}>
                    <Flex justify="space-between" align="center">
                      <Typography.Text
                        strong
                        style={{ fontSize: 16, color: token.colorTextHeading }}
                      >
                        {t("inspection.center")}
                      </Typography.Text>
                      <Typography.Text style={{ fontSize: 16 }}>
                        {inspection?.inspector_name || "N/A"}
                      </Typography.Text>
                    </Flex>
                  </Col>
                </Row>

                <Divider style={{ margin: "12px 0" }} />

                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                    <Flex justify="space-between" align="center">
                      <Typography.Text
                        strong
                        style={{ fontSize: 16, color: token.colorTextHeading }}
                      >
                        {t("inspection.startDate")}
                      </Typography.Text>
                      <Typography.Text style={{ fontSize: 16 }}>
                        {dayjs(inspection?.start_date).format("DD/MM/YYYY")} {t("common.at")}{" "}
                        <Tag color="red">{dayjs(inspection?.start_date).format("HH:mm:ss")}</Tag>
                      </Typography.Text>
                    </Flex>
                  </Col>
                  <Col xs={24} md={12}>
                    <Flex justify="space-between" align="center">
                      <Typography.Text
                        strong
                        style={{ fontSize: 16, color: token.colorTextHeading }}
                      >
                        {t("inspection.endDate")}
                      </Typography.Text>
                      <Typography.Text style={{ fontSize: 16 }}>
                        {dayjs(inspection?.end_date).format("DD/MM/YYYY")} {t("common.at")}{" "}
                        <Tag color="red">{dayjs(inspection?.end_date).format("HH:mm:ss")}</Tag>
                      </Typography.Text>
                    </Flex>
                  </Col>
                </Row>

                <Divider style={{ margin: "12px 0" }} />
              </Space>
            </Card>
          </Space>
        </Col>

        <Col xs={24} md={8}>
          <Space direction="vertical" size={24} style={{ width: "100%" }}>
            <Button
              type="primary"
              icon={<ExperimentOutlined />}
              onClick={handleOpenCriteriaModal}
              style={{
                width: "100%",
                borderRadius: token.borderRadiusSM,
                backgroundColor: token.colorPrimary,
                borderColor: token.colorPrimary,
                padding: "8px 16px",
                fontSize: 16,
              }}
            >
              {t("inspection.criteria")}
            </Button>

            <Card
              title={
                <Flex align="center" gap={8}>
                  <InfoCircleOutlined style={{ color: token.colorPrimary, fontSize: 20 }} />
                  <Typography.Title level={4} style={{ margin: 0, color: token.colorTextHeading }}>
                    {t("inspection.time")}
                  </Typography.Title>
                </Flex>
              }
              styles={{
                header: {
                  borderBottom: `1px solid ${token.colorBorderSecondary}`,
                  padding: "12px 16px",
                  backgroundColor: token.colorBgElevated,
                },
                body: {
                  padding: "16px",
                },
              }}
              style={{
                borderRadius: token.borderRadiusLG,
                boxShadow: token.boxShadow,
                backgroundColor: token.colorBgElevated,
              }}
            >
              <Space direction="vertical" size="small" style={{ width: "100%" }}>
                <Flex justify="space-between">
                  <Typography.Text strong style={{ fontSize: 14, color: token.colorTextHeading }}>
                    {t("inspection.completedAt")}
                  </Typography.Text>
                  <Typography.Text style={{ fontSize: 14 }}>
                    {inspection?.complete_date ? (
                      <>
                        {dayjs(inspection?.complete_date).format("DD/MM/YYYY")} {t("common.at")}{" "}
                        <Tag color="red">{dayjs(inspection?.complete_date).format("HH:mm:ss")}</Tag>
                      </>
                    ) : (
                      "N/A"
                    )}
                  </Typography.Text>
                </Flex>

                <Flex justify="space-between">
                  <Typography.Text strong style={{ fontSize: 14, color: token.colorTextHeading }}>
                    {t("inspection.createdAt")}
                  </Typography.Text>
                  <Typography.Text style={{ fontSize: 14 }}>
                    {dayjs(inspection?.created_at).format("DD/MM/YYYY")} {t("common.at")}{" "}
                    <Tag color="red">{dayjs(inspection?.created_at).format("HH:mm:ss")}</Tag>
                  </Typography.Text>
                </Flex>

                <Flex justify="space-between">
                  <Typography.Text strong style={{ fontSize: 14, color: token.colorTextHeading }}>
                    {t("inspection.createdBy")}
                  </Typography.Text>
                  <Typography.Text style={{ fontSize: 14 }}>
                    {inspection?.created_by || "N/A"}
                  </Typography.Text>
                </Flex>
              </Space>
            </Card>
          </Space>
        </Col>
      </Row>

      <InspectionModals
        isModalVisible={isModalVisible}
        onCloseModal={handleCloseModal}
        inspectionResult={inspectionResult}
        chemicalData={chemicalData}
        plantType={plant?.type}
        isCriteriaModalVisible={isCriteriaModalVisible}
        onCloseCriteriaModal={handleCloseCriteriaModal}
      />

      {isEditing &&
        selectedResult &&
        inspection?.status !== "Completed" &&
        inspection?.status !== "Cancel" &&
        inspection?.status !== "Pending" && (
          <InspectionModalForm
            type={plant?.type}
            id={selectedResult.id}
            action="create"
            open={isEditing}
            initialValues={selectedResult}
            onClose={handleCloseDrawer}
            onMutationSuccess={handleMutationSuccess}
          />
        )}
    </div>
  );
};
