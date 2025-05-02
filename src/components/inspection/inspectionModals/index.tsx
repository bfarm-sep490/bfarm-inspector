/* eslint-disable prettier/prettier */
import React, { useMemo } from "react";
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
} from "antd";
import {
  CloseOutlined,
  ExperimentOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { ContaminantCheckCard } from "../ContaminantCheckCard";
import {
  chemicalGroups,
  UNITS,
  mustBeZeroKeys,
} from "../chemical/ChemicalConstants";
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
    contaminantBasedVegetableType[
      plantType as keyof typeof contaminantBasedVegetableType
    ];

  const thresholdList = useMemo(
    () => getContaminantsByType(plantType),
    [plantType]
  );
  const t = useTranslate();

  return (
    <>
      <Modal
        open={isCriteriaModalVisible}
        onCancel={onCloseCriteriaModal}
        footer={null}
        width={1000}
        centered
        closeIcon={
          <CloseOutlined style={{ color: token.colorTextSecondary }} />
        }
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
        closeIcon={
          <CloseOutlined style={{ color: token.colorTextSecondary }} />
        }
        styles={{
          mask: {
            backgroundColor: "rgba(0, 0, 0, 0.45)",
            backdropFilter: "blur(4px)",
          },
          body: { padding: 24 },
        }}
        title={
          <Flex align="center" gap={12}>
            <ExperimentOutlined
              style={{ color: token.colorPrimary, fontSize: 20 }}
            />
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
              {inspectionResult?.result_content ||
                t("inspection.modal.noComment")}
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
                                title={t("inspection.table.safetyLimit", {
                                  value: mustBeZero
                                    ? t("inspection.table.limitZero")
                                    : t("inspection.table.limitByCrop"),
                                })}
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
                        title: t("inspection.table.value"),
                        dataIndex: "value",
                        key: "value",
                        render: (value, record) => {
                          const mustBeZero = mustBeZeroKeys.includes(
                            record.key
                          );
                          const numericValue =
                            typeof value === "string"
                              ? parseFloat(value)
                              : value;

                          const threshold = thresholdList.find(
                            (item) => item.key === record.key
                          );

                          const warningLimit = parseFloat(
                            threshold?.warning || "0"
                          );
                          const isPassed = mustBeZero
                            ? numericValue === 0
                            : numericValue <= warningLimit;

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
                        title: t("inspection.table.standard"),
                        key: "standard",
                        render: (_, record) => {
                          const mustBeZero = mustBeZeroKeys.includes(
                            record.key
                          );
                          const threshold = thresholdList.find(
                            (item) => item.key === record.key
                          );

                          return (
                            <Flex align="center" gap={8}>
                              <Typography.Text strong>
                                {mustBeZero
                                  ? t("inspection.table.limitZero")
                                  : threshold
                                    ? `≤ ${threshold.warning} ${threshold.unit}`
                                    : t("inspection.table.noData")}
                              </Typography.Text>
                              <Tooltip
                                title={
                                  mustBeZero
                                    ? t("inspection.table.limitZero")
                                    : threshold
                                      ? t("inspection.table.tooltipThreshold", {
                                          warning: threshold.warning,
                                          danger: threshold.danger,
                                        })
                                      : t("inspection.table.noData")
                                }
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
    </>
  );
};
