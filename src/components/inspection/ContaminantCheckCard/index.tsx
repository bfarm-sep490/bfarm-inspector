/* eslint-disable prettier/prettier */
import React, { useMemo } from "react";
import {
  Card,
  Flex,
  Typography,
  Space,
  Table,
  Tag,
  Tooltip,
  theme,
} from "antd";
import { ExperimentOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { chemicalGroups, mustBeZeroKeys } from "../chemical/ChemicalConstants";
import { getContaminantsByType } from "../getContaminantsByType";

interface ContaminantCheckCardProps {
  type: string | undefined;
  style?: React.CSSProperties;
}

export const ContaminantCheckCard: React.FC<ContaminantCheckCardProps> = ({
  style,
  type,
}) => {
  const { token } = theme.useToken();
  const mustBeZero = mustBeZeroKeys;

  const contaminants = useMemo(() => getContaminantsByType(type), [type]);

  return (
    <Card
      variant="borderless"
      style={{
        borderRadius: token.borderRadiusLG,
        boxShadow: token.boxShadow,
        background: token.colorBgContainer,
        ...style,
      }}
    >
      <ExperimentOutlined style={{ color: token.colorPrimary, fontSize: 28 }} />
      <Flex vertical style={{ gap: 4 }}>
        <Typography.Title
          level={3}
          style={{ margin: 0, color: token.colorPrimary }}
        >
          Tiêu chí kiểm định
        </Typography.Title>
        {type && (
          <Tag
            color="blue"
            style={{
              fontSize: 16,
              padding: "4px 12px",
              borderRadius: token.borderRadiusLG,
              fontWeight: "bold",
              width: "fit-content",
            }}
          >
            Loại cây: {type}
          </Tag>
        )}
      </Flex>

      <Typography.Text
        type="secondary"
        italic
        style={{
          fontSize: 14,
          display: "block",
          marginBottom: 8,
          color: token.colorError,
        }}
      >
        (*) Các chất có dấu sao bắt buộc không được vượt mức an toàn (bắt buộc
        bằng 0).
      </Typography.Text>

      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {chemicalGroups.map((group) => {
          const groupContaminants = contaminants.filter((item) =>
            group.keys.includes(item.key)
          );
          if (groupContaminants.length === 0) return null;

          return (
            <Card
              key={group.title}
              title={
                <Flex align="center" gap={8}>
                  <div
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: "50%",
                      backgroundColor: group.color,
                    }}
                  />
                  <Typography.Title
                    level={4}
                    style={{ margin: 0, color: group.color, fontSize: 18 }}
                  >
                    {group.title}
                  </Typography.Title>
                </Flex>
              }
              styles={{
                header: {
                  borderBottom: `2px solid ${group.color}`,
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
              <Table
                rowKey="key"
                dataSource={groupContaminants}
                columns={[
                  {
                    title: "Tên chất",
                    dataIndex: "name",
                    key: "name",
                    render: (text, record) => {
                      const isZero = mustBeZero.includes(record.key);
                      return (
                        <Flex align="center" gap={8}>
                          <Typography.Text strong>
                            {text}
                            {isZero && (
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
                            title={`Ngưỡng kiểm định: ${
                              isZero
                                ? "Bắt buộc = 0"
                                : `Nhẹ ≤ ${record.warning}, Nặng ≥ ${record.danger}`
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
                    title: "Ngưỡng nhẹ",
                    dataIndex: "warning",
                    key: "warning",
                    render: (value: string, record) => (
                      <Tag
                        color="blue"
                        style={{
                          fontSize: 14,
                          padding: "4px 8px",
                          borderRadius: token.borderRadiusSM,
                        }}
                      >
                        {value.includes(">") || value.includes("<")
                          ? value
                          : `> ${value}`}{" "}
                        {record.unit}
                      </Tag>
                    ),
                    width: "25%",
                  },

                  {
                    title: "Ngưỡng nặng",
                    dataIndex: "danger",
                    key: "danger",
                    render: (value: string, record) => (
                      <Tag
                        color="red"
                        style={{
                          fontSize: 14,
                          padding: "4px 8px",
                          borderRadius: token.borderRadiusSM,
                        }}
                      >
                        {value.includes(">") || value.includes("<")
                          ? value
                          : `≥ ${value}`}{" "}
                        {record.unit}
                      </Tag>
                    ),
                    width: "25%",
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
            </Card>
          );
        })}
      </Space>
    </Card>
  );
};
