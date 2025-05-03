import React, { useMemo } from "react";
import { Modal, Typography, Flex, Space, Card, Tag, Table, Tooltip, Tabs, theme } from "antd";
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

  const kimloaichecked =
    contaminantBasedVegetableType[plantType as keyof typeof contaminantBasedVegetableType];

  const thresholdList = useMemo(() => getContaminantsByType(plantType), [plantType]);
  let tooltipText: React.ReactNode;

  const t = useTranslate();

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
          body: {
            padding: 24,
          },
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
                style={{
                  fontSize: 14,
                  display: "block",
                  marginTop: 4,
                  color: token.colorError,
                }}
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
                      } else {
                        return group.keys.includes(item.key);
                      }
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
                                {value} {UNITS[record.key] || ""}
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
