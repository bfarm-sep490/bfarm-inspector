import React, { useMemo, useState } from "react";
import {
  Modal,
  Typography,
  Flex,
  Space,
  Card,
  Tag,
  Table,
  Tooltip,
  Tabs,
  theme,
  Image,
  Alert,
  Button,
} from "antd";
import {
  CloseOutlined,
  ExperimentOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { ContaminantCheckCard } from "../ContaminantCheckCard";
import { chemicalGroups, UNITS, mustBeZeroKeys } from "../chemical/ChemicalConstants";
import { IInspectingResult } from "@/interfaces";
import { contaminantBasedVegetableType } from "@/utils/inspectingKind";
import { getContaminantsByType } from "../getContaminantsByType";
import { useTranslate } from "@refinedev/core";

interface InspectionModalsProps {
  isModalVisible: boolean;
  onCloseModal: () => void;
  inspectionResult?: IInspectingResult;
  chemicalData: any[];
  plantType?: string;
  isCriteriaModalVisible: boolean;
  onCloseCriteriaModal: () => void;
}

export const InspectionModals: React.FC<InspectionModalsProps> = ({
  isModalVisible,
  onCloseModal,
  inspectionResult,
  chemicalData,
  plantType,
  isCriteriaModalVisible,
  onCloseCriteriaModal,
}) => {
  const { token } = theme.useToken();
  const t = useTranslate();
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");

  const kimloaichecked =
    contaminantBasedVegetableType[plantType as keyof typeof contaminantBasedVegetableType];

  const thresholdList = useMemo(() => getContaminantsByType(plantType), [plantType]);

  const validImageExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".bmp",
    ".webp",
    ".pdf",
    ".rar",
    ".zip",
    ".doc",
    ".docx",
  ];

  const allDocuments = Array.isArray(inspectionResult?.inspect_images)
    ? inspectionResult.inspect_images
        .map((img) => {
          const image = img as { url?: string };
          return typeof image.url === "string" ? image.url : "";
        })
        .filter((url) => validImageExtensions.some((ext) => url.toLowerCase().endsWith(ext)))
    : [];

  return (
    <>
      <Modal
        open={isCriteriaModalVisible}
        onCancel={onCloseCriteriaModal}
        footer={null}
        width={1000}
        centered
        closeIcon={<CloseOutlined style={{ color: token.colorTextSecondary }} />}
        styles={{
          mask: {
            backgroundColor: "rgba(0, 0, 0, 0.45)",
            backdropFilter: "blur(4px)",
          },
          body: { padding: 24 },
        }}
        style={{ top: 20 }}
      >
        <ContaminantCheckCard type={plantType} />
      </Modal>

      <Modal
        open={isModalVisible}
        onCancel={onCloseModal}
        footer={null}
        width={1000}
        centered
        closeIcon={<CloseOutlined style={{ color: token.colorTextSecondary }} />}
        styles={{
          mask: {
            backgroundColor: "rgba(0, 0, 0, 0.45)",
            backdropFilter: "blur(4px)",
          },
          body: { padding: 24 },
        }}
        title={
          <Flex align="center" gap={12}>
            <ExperimentOutlined style={{ color: token.colorPrimary, fontSize: 20 }} />
            <div>
              <Typography.Title level={4} style={{ margin: 0 }}>
                {t("inspection.modal.title")}
              </Typography.Title>
              <Typography.Text
                type="secondary"
                italic
                style={{ fontSize: 14, display: "block", marginTop: 4, color: token.colorError }}
              >
                {t("inspection.modal.note")}
              </Typography.Text>
            </div>
          </Flex>
        }
        style={{ top: 20 }}
      >
        <Space direction="vertical" size={24} style={{ width: "100%" }}>
          <Card
            variant="borderless"
            style={{
              background: token.colorPrimaryBg,
              borderRadius: token.borderRadiusLG,
            }}
          >
            <Typography.Paragraph strong style={{ marginBottom: 8 }}>
              {t("inspection.modal.conclusion")}
            </Typography.Paragraph>
            <Typography.Text>
              {inspectionResult?.result_content || t("inspection.modal.noComment")}
            </Typography.Text>
          </Card>

          <div>
            <Typography.Title level={5}>Tài liệu kiểm định</Typography.Title>

            {allDocuments.length === 0 ? (
              <Alert
                type="error"
                showIcon
                message="Không có tài liệu kiểm định nào được đính kèm."
              />
            ) : (
              <Flex wrap="wrap" gap={16}>
                {allDocuments.map((url, index) => {
                  const fileName = url.split("/").pop() || `Tài liệu ${index + 1}`;
                  const ext = fileName.split(".").pop()?.toLowerCase() || "";

                  const isImage = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"].some((e) =>
                    url.toLowerCase().endsWith(e),
                  );

                  const iconMap: Record<string, string> = {
                    pdf: "📄",
                    doc: "📄",
                    docx: "📄",
                    zip: "🗜️",
                    rar: "🗜️",
                  };

                  if (isImage) {
                    return (
                      <div
                        key={index}
                        style={{
                          width: 140,
                          textAlign: "center",
                          boxShadow: token.boxShadow,
                          borderRadius: 8,
                          padding: 8,
                          background: "#fff",
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          setPreviewUrl(url);
                          setPreviewVisible(true);
                        }}
                      >
                        <Image
                          src={url}
                          alt={fileName}
                          width={120}
                          height={100}
                          style={{
                            objectFit: "cover",
                            borderRadius: 6,
                            transition: "transform 0.3s ease",
                          }}
                          preview={false}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "scale(1.05)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "scale(1)";
                          }}
                          onError={(e) => {
                            console.error("Image failed to load:", url);
                            e.currentTarget.style.display = "none";
                          }}
                        />
                        <Typography.Text ellipsis style={{ fontSize: 12 }}>
                          {fileName}
                        </Typography.Text>
                      </div>
                    );
                  }

                  return (
                    <Card
                      key={index}
                      size="small"
                      style={{ width: 160, textAlign: "center", borderRadius: 8 }}
                    >
                      <div style={{ fontSize: 32 }}>{iconMap[ext] || "📁"}</div>
                      <Typography.Text style={{ fontSize: 13 }} ellipsis>
                        {fileName}
                      </Typography.Text>
                      <br />
                      <Typography.Link href={url} target="_blank" rel="noopener noreferrer">
                        Tải về
                      </Typography.Link>
                    </Card>
                  );
                })}
              </Flex>
            )}

            <Modal
              open={previewVisible}
              onCancel={() => setPreviewVisible(false)}
              footer={null}
              centered
              width={1000}
              closeIcon={false}
              style={{ backgroundColor: "rgba(0, 0, 0, 0.92)" }}
              styles={{
                body: {
                  padding: 0,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "90vh",
                  position: "relative",
                  backdropFilter: "blur(6px)",
                },
              }}
            >
              <Button
                icon={<CloseOutlined />}
                shape="circle"
                size="large"
                onClick={() => setPreviewVisible(false)}
                style={{
                  position: "absolute",
                  top: 20,
                  right: 20,
                  zIndex: 10,
                  backgroundColor: "rgba(255,255,255,0.85)",
                  border: "2px solid #ddd",
                  transition: "all 0.3s ease",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                }}
              />
              <img
                src={previewUrl}
                alt="preview"
                style={{
                  maxWidth: "90%",
                  maxHeight: "80vh",
                  borderRadius: 20,
                  boxShadow: "0 0 30px rgba(255,255,255,0.2)",
                  border: "4px solid white",
                  transition: "transform 0.3s ease",
                }}
              />
            </Modal>
          </div>

          <Tabs
            type="card"
            items={chemicalGroups
              .filter((group) => chemicalData.some((item) => group.keys?.includes(item.key)))
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
                    <span>{t(group.title)}</span>
                  </Flex>
                ),
                children: (
                  <Table
                    rowKey="key"
                    dataSource={chemicalData.filter((item) => {
                      if (group.title === "chemicalGroups.heavyMetals") {
                        return kimloaichecked?.includes(item.key);
                      }
                      return group.keys.includes(item.key);
                    })}
                    columns={[
                      {
                        title: t("inspection.table.chemicalName"),
                        dataIndex: "name",
                        key: "name",
                        render: (text, record) => {
                          const mustBeZero = mustBeZeroKeys.includes(record.key);
                          return (
                            <Typography.Text strong>
                              {text}
                              {mustBeZero && (
                                <Typography.Text type="danger" strong style={{ marginLeft: 4 }}>
                                  (*)
                                </Typography.Text>
                              )}
                            </Typography.Text>
                          );
                        },
                        width: "40%",
                      },
                      {
                        title: t("inspection.table.value"),
                        dataIndex: "value",
                        key: "value",
                        render: (value, record) => {
                          const mustBeZero = mustBeZeroKeys.includes(record.key);
                          const numericValue =
                            typeof value === "string" ? parseFloat(value) : value;

                          const threshold = thresholdList.find((item) => item.key === record.key);
                          const warningLimit = parseFloat(threshold?.warning || "0");
                          const dangerLimit = parseFloat(threshold?.danger || "0");
                          const unit = UNITS[record.key] || "";

                          let tagColor = "green";
                          let tooltipText: React.ReactNode = "Giá trị an toàn";

                          if (mustBeZero) {
                            if (numericValue === 0) {
                              tagColor = "green";
                              tooltipText = "Giá trị an toàn (bằng 0)";
                            } else {
                              tagColor = "red";
                              tooltipText = "Vượt ngưỡng – phải bằng 0";
                            }
                          } else if (numericValue > dangerLimit) {
                            tagColor = "red";
                            tooltipText = (
                              <>
                                Vượt ngưỡng nguy hiểm <br />({`> ${dangerLimit} ${unit}`})
                              </>
                            );
                          } else if (numericValue > warningLimit) {
                            tagColor = "gold";
                            tooltipText = (
                              <>
                                Vượt ngưỡng cảnh báo <br />({`> ${warningLimit} ${unit}`})
                              </>
                            );
                          }

                          const isPassed = tagColor === "green";

                          return (
                            <Flex align="center" gap={6}>
                              <Tag
                                color={tagColor}
                                icon={isPassed ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                                style={{
                                  width: 120,
                                  textAlign: "center",
                                  display: "inline-flex",
                                  justifyContent: "center",
                                  alignItems: "center",
                                }}
                              >
                                {value} {unit}
                              </Tag>
                              <Tooltip title={tooltipText}>
                                <InfoCircleOutlined
                                  style={{
                                    fontSize: 16,
                                    color: token.colorPrimary,
                                    cursor: "pointer",
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
    </>
  );
};
