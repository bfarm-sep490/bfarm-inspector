/* eslint-disable prettier/prettier */
import React from "react";
import {
  Card,
  Typography,
  Table,
  Tag,
  Tooltip,
  Space,
  Flex,
  theme,
} from "antd";
import { ExperimentOutlined, InfoCircleOutlined } from "@ant-design/icons";
import {
  chemicalGroups,
  Contaminant,
  LIMITS,
  UNITS,
  getMustBeZeroKeys,
} from "../chemical/ChemicalConstants";

interface ContaminantCheckCardProps {
  type: string | undefined;
  style?: React.CSSProperties;
  contaminants: Contaminant[];
}

const ContaminantCheckCard: React.FC<ContaminantCheckCardProps> = ({
  style,
  contaminants,
}) => {
  const { token } = theme.useToken();
  const mustBeZeroKeys = getMustBeZeroKeys(); // Sử dụng hàm từ ChemicalConstants

  return (
    <Card
      variant="outlined"
      style={{
        borderRadius: token.borderRadiusLG,
        boxShadow: token.boxShadow,
        background: token.colorBgContainer,
        ...style,
      }}
    >
      <Flex align="center" gap={8} style={{ marginBottom: 16 }}>
        <ExperimentOutlined
          style={{ color: token.colorPrimary, fontSize: 24 }}
        />
        <Typography.Title
          level={3}
          style={{ margin: 0, color: token.colorPrimary }}
        >
          Tiêu chí kiểm định
        </Typography.Title>
      </Flex>
      <Typography.Text
        type="secondary"
        italic
        style={{ marginBottom: 16, display: "block" }}
      >
        Các chất hóa học được nhóm theo loại để dễ dàng theo dõi và đánh giá. (*)
        Các chất có dấu sao bắt buộc không được vượt mức an toàn (bắt buộc bằng 0).
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
                body: { padding: 16 },
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
                    render: (text: string, record: Contaminant) => {
                      const mustBeZero = mustBeZeroKeys.includes(record.key);
                      return (
                        <Flex align="center" gap={8}>
                          <Typography.Text strong style={{ fontSize: 16 }}>
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
                    width: "50%",
                  },
                  {
                    title: "Giới hạn",
                    dataIndex: "standard",
                    key: "standard",
                    render: (text: string, record: Contaminant) => {
                      const mustBeZero = mustBeZeroKeys.includes(record.key);
                      return (
                        <Flex align="center" gap={8}>
                          <Tag
                            color="blue"
                            style={{
                              fontSize: 14,
                              padding: "4px 8px",
                              borderRadius: token.borderRadiusSM,
                            }}
                          >
                            {mustBeZero
                              ? "Bắt buộc = 0"
                              : `≤ ${LIMITS[record.key] || "N/A"} ${
                                  UNITS[record.key] || ""
                                }`}
                          </Tag>
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
                    width: "50%",
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

export default ContaminantCheckCard;