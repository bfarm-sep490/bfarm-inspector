/* eslint-disable prettier/prettier */
import React, { useState, useMemo } from "react";
import {
  type HttpError,
  useOne,
  useShow,
  useTranslate,
  useCustomMutation,
} from "@refinedev/core";
import {
  Button,
  Typography,
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
  Table,
  Tooltip,
  Tabs,
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
  CloseOutlined,
} from "@ant-design/icons";
import { IInspectingForm, IInspectingResult } from "@/interfaces";
import { InspectionModalForm } from "../drawer-form";
import { InspectionStatusTag } from "../status";
import { useNavigate, useParams } from "react-router";
import dayjs from "dayjs";
import {
  chemicalGroups,
  getChemicalData,
  UNITS,
  LIMITS,
  initialContaminants,
  mustBeZeroKeys,
} from "../chemical/ChemicalConstants";
import { InspectionResultTag } from "../result";
import { PageHeader } from "@refinedev/antd";
import { contaminantBasedVegetableType } from "@/utils/inspectingKind";
import { ContaminantCheckCard } from "../ContaminantCheckCard";

export const InspectionsShow: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isCriteriaModalVisible, setIsCriteriaModalVisible] = useState(false);
  const [selectedResult, setSelectedResult] = useState<IInspectingForm | null>(
    null
  );
  const { token } = theme.useToken();
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
  });

  const { mutate: updateInspectionStatus } = useCustomMutation();

  const inspection = useMemo(
    () =>
      (formQueryResult.data as { data: IInspectingForm[] } | undefined)
        ?.data?.[0],
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
      (resultQueryResult.data as { data: IInspectingResult[] } | undefined)
        ?.data?.[0],
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
    if (
      inspection &&
      inspection.status !== "Completed" &&
      inspection.status !== "Cancel"
    ) {
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
  const isBeforeStart = inspection?.start_date
    ? now.isBefore(dayjs(inspection.start_date))
    : false;
  const isAfterEnd = inspection?.end_date
    ? now.isAfter(dayjs(inspection.end_date))
    : false;
  const kimloaichecked =
    contaminantBasedVegetableType[
      plant?.type as keyof typeof contaminantBasedVegetableType
    ];
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
          <Typography.Title
            level={2}
            style={{ margin: 0, color: token.colorPrimary }}
          >
            #{inspection?.id} - {inspection?.task_name}
          </Typography.Title>
        }
      />

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24} md={16}>
          <Space direction="vertical" size={24} style={{ width: "100%" }}>
            {/* Plant Information Card */}
            <Card
              title={
                <Flex align="center" gap={12}>
                  <InfoCircleOutlined
                    style={{ color: token.colorPrimary, fontSize: 24 }}
                  />
                  <Typography.Title
                    level={4}
                    style={{ margin: 0, color: token.colorTextHeading }}
                  >
                    Thông tin giống cây kiểm nghiệm
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
                  <Space
                    direction="vertical"
                    size={16}
                    style={{ width: "100%" }}
                  >
                    <Flex justify="space-between" align="center">
                      <Typography.Text
                        strong
                        style={{
                          fontSize: 16,
                          color: token.colorTextHeading,
                        }}
                      >
                        Tên cây trồng
                      </Typography.Text>
                      <Typography.Text style={{ fontSize: 16 }}>
                        {plant?.plant_name || "N/A"}
                      </Typography.Text>
                    </Flex>
                    <Flex justify="space-between" align="center">
                      <Typography.Text
                        strong
                        style={{
                          fontSize: 16,
                          color: token.colorTextHeading,
                        }}
                      >
                        Loại cây trồng
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
                          Mô tả
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

            {/* Results Card */}
            <Card
              title={
                <Flex align="center" gap={12}>
                  <InfoCircleOutlined
                    style={{ color: token.colorPrimary, fontSize: 24 }}
                  />
                  <Typography.Title
                    level={4}
                    style={{ margin: 0, color: token.colorTextHeading }}
                  >
                    Kết quả
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
                    style={{
                      borderRadius: token.borderRadiusSM,
                    }}
                  >
                    Xem chi tiết
                  </Button>
                ) : (
                  (inspection?.status === "Ongoing" ||
                    inspection?.status === "Incomplete") && (
                    <Button
                      type="primary"
                      icon={<EditOutlined />}
                      onClick={handleCreate}
                      // disabled={
                      //   isBeforeStart ||
                      //   isAfterEnd ||
                      //   inspection?.status === "Incomplete"
                      // }
                      style={{
                        borderRadius: token.borderRadiusSM,
                        backgroundColor: token.colorPrimary,
                        borderColor: token.colorPrimary,
                      }}
                    >
                      Hoàn Thành
                    </Button>
                  )
                )
              }
            >
              {inspectionResult ? (
                <Space
                  direction="vertical"
                  size="middle"
                  style={{ width: "100%" }}
                >
                  <Flex justify="space-between">
                    <Typography.Text strong style={{ fontSize: 16 }}>
                      Đánh giá
                    </Typography.Text>
                    <InspectionResultTag
                      value={inspectionResult.evaluated_result}
                    />
                  </Flex>
                  <Flex justify="space-between">
                    <Typography.Text strong style={{ fontSize: 16 }}>
                      Nội dung
                    </Typography.Text>
                    <Typography.Text>
                      {inspectionResult.result_content}
                    </Typography.Text>
                  </Flex>
                </Space>
              ) : inspection?.status === "Ongoing" ? (
                isBeforeStart ? (
                  <Alert
                    type="warning"
                    message="Chưa đến ngày kiểm nghiệm"
                    showIcon
                  />
                ) : (
                  <Alert
                    type="info"
                    message="Chưa có kết quả kiểm nghiệm. Nhấn 'Hoàn Thành' để nhập kết quả."
                    showIcon
                  />
                )
              ) : inspection?.status === "Incomplete" ? (
                <Alert type="error" message="Đã quá hạn kiểm nghiệm" showIcon />
              ) : (
                <Alert
                  type="warning"
                  message="Không thể tạo kết quả trong trạng thái hiện tại"
                  showIcon
                />
              )}
            </Card>
            <Card
              title={
                <Flex align="center" gap={12}>
                  <InfoCircleOutlined
                    style={{ color: token.colorPrimary, fontSize: 24 }}
                  />
                  <Typography.Title
                    level={4}
                    style={{ margin: 0, color: token.colorTextHeading }}
                  >
                    Thông tin công việc
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
                        style={{
                          fontSize: 16,
                          color: token.colorTextHeading,
                        }}
                      >
                        Tên kế hoạch
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
                        style={{
                          fontSize: 16,
                          color: token.colorTextHeading,
                        }}
                      >
                        Trung tâm kiểm định
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
                        style={{
                          fontSize: 16,
                          color: token.colorTextHeading,
                        }}
                      >
                        Ngày bắt đầu
                      </Typography.Text>
                      <Typography.Text style={{ fontSize: 16 }}>
                        {dayjs(inspection?.start_date).format("DD/MM/YYYY")} lúc{" "}
                        <Tag color="red">
                          {dayjs(inspection?.start_date).format("HH:mm:ss")}
                        </Tag>
                      </Typography.Text>
                    </Flex>
                  </Col>
                  <Col xs={24} md={12}>
                    <Flex justify="space-between" align="center">
                      <Typography.Text
                        strong
                        style={{
                          fontSize: 16,
                          color: token.colorTextHeading,
                        }}
                      >
                        Ngày kết thúc
                      </Typography.Text>
                      <Typography.Text style={{ fontSize: 16 }}>
                        {dayjs(inspection?.end_date).format("DD/MM/YYYY")} lúc{" "}
                        <Tag color="red">
                          {dayjs(inspection?.end_date).format("HH:mm:ss")}
                        </Tag>
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
                        style={{
                          fontSize: 16,
                          color: token.colorTextHeading,
                        }}
                      >
                        Trạng thái
                      </Typography.Text>
                      <Flex align="center" gap={8}>
                        {getStatusIcon(inspection?.status || "")}
                        <InspectionStatusTag value={inspection?.status || ""} />
                      </Flex>
                    </Flex>
                  </Col>
                </Row>
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
              Xem tiêu chí kiểm định
            </Button>

            <Card
              title={
                <Flex align="center" gap={8}>
                  <InfoCircleOutlined
                    style={{ color: token.colorPrimary, fontSize: 20 }}
                  />
                  <Typography.Title
                    level={4}
                    style={{ margin: 0, color: token.colorTextHeading }}
                  >
                    Thời gian
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
              <Space
                direction="vertical"
                size="small"
                style={{ width: "100%" }}
              >
                <Flex justify="space-between">
                  <Typography.Text
                    strong
                    style={{ fontSize: 14, color: token.colorTextHeading }}
                  >
                    Hoàn thành
                  </Typography.Text>
                  <Typography.Text style={{ fontSize: 14 }}>
                    {inspection?.complete_date ? (
                      <>
                        {dayjs(inspection?.complete_date).format("DD/MM/YYYY")}{" "}
                        lúc{" "}
                        <Tag color="red">
                          {dayjs(inspection?.complete_date).format("HH:mm:ss")}
                        </Tag>
                      </>
                    ) : (
                      "N/A"
                    )}
                  </Typography.Text>
                </Flex>
                <Flex justify="space-between">
                  <Typography.Text
                    strong
                    style={{ fontSize: 14, color: token.colorTextHeading }}
                  >
                    Tạo lúc
                  </Typography.Text>
                  <Typography.Text style={{ fontSize: 14 }}>
                    {dayjs(inspection?.created_at).format("DD/MM/YYYY")} lúc{" "}
                    <Tag color="red">
                      {dayjs(inspection?.created_at).format("HH:mm:ss")}
                    </Tag>
                  </Typography.Text>
                </Flex>
                <Flex justify="space-between">
                  <Typography.Text
                    strong
                    style={{ fontSize: 14, color: token.colorTextHeading }}
                  >
                    Tạo bởi
                  </Typography.Text>
                  <Typography.Text style={{ fontSize: 14 }}>
                    {inspection?.created_by || "N/A"}
                  </Typography.Text>
                </Flex>
                {/* <Flex justify="space-between">
                  <Typography.Text
                    strong
                    style={{ fontSize: 14, color: token.colorTextHeading }}
                  >
                    Cập nhật
                  </Typography.Text>
                  <Typography.Text style={{ fontSize: 14 }}>
                    {inspection?.updated_at
                      ? dayjs(inspection?.updated_at).format("DD/MM/YYYY")
                      : "N/A"}
                  </Typography.Text>
                </Flex>
                <Flex justify="space-between">
                  <Typography.Text
                    strong
                    style={{ fontSize: 14, color: token.colorTextHeading }}
                  >
                    Cập nhật bởi
                  </Typography.Text>
                  <Typography.Text style={{ fontSize: 14 }}>
                    {inspection?.updated_by || "N/A"}
                  </Typography.Text>
                </Flex> */}
              </Space>
            </Card>
          </Space>
        </Col>
      </Row>

      <Modal
        open={isCriteriaModalVisible}
        onCancel={handleCloseCriteriaModal}
        footer={null}
        width={1000}
        mask={true}
        styles={{
          mask: {
            backgroundColor: "rgba(0, 0, 0, 0.45)",
            backdropFilter: "blur(4px)",
          },
          body: {
            padding: 24,
          },
        }}
        style={{
          top: 20,
        }}
        centered
        closeIcon={
          <CloseOutlined style={{ color: token.colorTextSecondary }} />
        }
      >
        <ContaminantCheckCard
          type={plant?.type}
          contaminants={initialContaminants}
        />
      </Modal>

      <Modal
        open={isModalVisible}
        onCancel={handleCloseModal}
        footer={null}
        width={1000}
        mask={true}
        styles={{
          mask: {
            backgroundColor: "rgba(0, 0, 0, 0.45)",
            backdropFilter: "blur(4px)",
          },
          body: {
            padding: 24,
          },
        }}
        title={
          <Flex align="center" gap={12}>
            <ExperimentOutlined
              style={{ color: token.colorPrimary, fontSize: 20 }}
            />
            <div>
              <Typography.Title level={4} style={{ margin: 0 }}>
                Chi tiết kết quả kiểm nghiệm
              </Typography.Title>
              <Typography.Text
                type="secondary"
                italic
                style={{
                  fontSize: 14,
                  display: "block",
                  marginTop: 4,
                  color: token.colorError,
                }}
              >
                (*) Các chất có dấu sao bắt buộc không được vượt mức an toàn
                (bắt buộc bằng 0).
              </Typography.Text>
            </div>
          </Flex>
        }
        style={{
          top: 20,
        }}
        centered
        closeIcon={
          <CloseOutlined style={{ color: token.colorTextSecondary }} />
        }
      >
        <Space direction="vertical" size={24} style={{ width: "100%" }}>
          {/* Summary Card */}
          <Card
            variant="borderless"
            style={{
              background: token.colorPrimaryBg,
              borderRadius: token.borderRadiusLG,
            }}
          >
            <Typography.Paragraph strong style={{ marginBottom: 8 }}>
              Kết luận kiểm nghiệm:
            </Typography.Paragraph>
            <Typography.Text>
              {inspectionResult?.result_content || "Không có nhận xét"}
            </Typography.Text>
          </Card>

          <Tabs
            type="card"
            items={chemicalGroups
              .filter((group) =>
                chemicalData.some((item) => group.keys?.includes(item.key))
              )
              .map((group) => ({
                key: group.title,
                label: (
                  <Flex align="center" gap={8}>
                    <div
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        backgroundColor: group.color,
                      }}
                    />
                    <span>{group.title}</span>
                  </Flex>
                ),
                children: (
                  <Table
                    rowKey="key"
                    dataSource={chemicalData.filter((item) => {
                      if (group?.title === "Kim loại nặng") {
                        const key = item.key;
                        return kimloaichecked?.includes(key);
                      } else {
                        return group.keys.includes(item.key);
                      }
                    })}
                    columns={[
                      {
                        title: "Tên chất",
                        dataIndex: "name",
                        key: "name",
                        render: (text, record) => {
                          const mustBeZero = mustBeZeroKeys.includes(
                            record.key
                          );
                          return (
                            <Flex align="center" gap={8}>
                              <Typography.Text strong>
                                {text}
                                {mustBeZero && (
                                  <Typography.Text
                                    type="danger"
                                    strong
                                    style={{ marginLeft: 4 }}
                                  >
                                    (*)
                                  </Typography.Text>
                                )}
                              </Typography.Text>
                              <Tooltip
                                title={`Giới hạn an toàn: ${
                                  LIMITS[record.key]
                                    ? mustBeZero
                                      ? "Bắt buộc = 0"
                                      : `≤ ${LIMITS[record.key]} ${
                                          UNITS[record.key] || ""
                                        }`
                                    : "Không có dữ liệu"
                                }`}
                              >
                                <InfoCircleOutlined
                                  style={{
                                    color: token.colorPrimary,
                                    cursor: "pointer",
                                    fontSize: 14,
                                  }}
                                />
                              </Tooltip>
                            </Flex>
                          );
                        },
                        width: "40%",
                      },
                      {
                        title: "Giá trị",
                        dataIndex: "value",
                        key: "value",
                        render: (value, record) => {
                          const limit = LIMITS[record.key];
                          const mustBeZero = mustBeZeroKeys.includes(
                            record.key
                          );
                          const numericValue =
                            typeof value === "string"
                              ? parseFloat(value)
                              : value;
                          const isPassed = mustBeZero
                            ? numericValue === 0
                            : limit
                              ? numericValue <= limit
                              : true;

                          return (
                            <Tag
                              color={isPassed ? "green" : "red"}
                              icon={
                                isPassed ? (
                                  <CheckCircleOutlined />
                                ) : (
                                  <CloseCircleOutlined />
                                )
                              }
                              style={{
                                width: 120,
                                textAlign: "center",
                                display: "inline-flex",
                                justifyContent: "center",
                                alignItems: "center",
                              }}
                            >
                              {value} {UNITS[record.key] || ""}
                            </Tag>
                          );
                        },
                        width: "30%",
                      },
                      {
                        title: "Tiêu chuẩn",
                        key: "standard",
                        render: (_, record) => {
                          const mustBeZero = mustBeZeroKeys.includes(
                            record.key
                          );
                          return (
                            <Flex align="center" gap={8}>
                              <Typography.Text strong>
                                {mustBeZero
                                  ? "Bắt buộc = 0"
                                  : `≤ ${LIMITS[record.key] || "N/A"} ${
                                      UNITS[record.key] || ""
                                    }`}
                              </Typography.Text>
                              <Tooltip
                                title={`Giới hạn an toàn cho ${record.name}: ${
                                  mustBeZero
                                    ? "Bắt buộc = 0"
                                    : LIMITS[record.key]
                                      ? `≤ ${LIMITS[record.key]} ${
                                          UNITS[record.key] || ""
                                        }`
                                      : "Không có dữ liệu"
                                }`}
                              >
                                <InfoCircleOutlined
                                  style={{
                                    color: token.colorPrimary,
                                    fontSize: 14,
                                  }}
                                />
                              </Tooltip>
                            </Flex>
                          );
                        },
                        width: "30%",
                      },
                    ]}
                    pagination={false}
                    bordered
                    size="middle"
                    style={{
                      marginTop: 12,
                      borderRadius: token.borderRadiusLG,
                    }}
                    rowClassName={(_, index) =>
                      index % 2 === 0 ? "table-row-light" : "table-row-dark"
                    }
                  />
                ),
              }))}
          />
        </Space>
      </Modal>
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
