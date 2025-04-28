/* eslint-disable prettier/prettier */
import { SaveButton } from "@refinedev/antd";
import {
  BaseKey,
  useCustomMutation,
  useGetToPath,
  useGo,
} from "@refinedev/core";
import {
  Form,
  InputNumber,
  Modal,
  Spin,
  Button,
  Flex,
  message,
  Upload,
  Input,
  Table,
  Tabs,
  Typography,
  Tooltip,
  Tag,
  theme,
  Space,
} from "antd";
import {
  UploadOutlined,
  CloseOutlined,
  InfoCircleOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import dayjs from "dayjs";
import { chemicalGroups, UNITS, LIMITS, mustBeZeroKeys } from "../chemical/ChemicalConstants";
import { getContaminantLimitsByVegetableType } from "@/utils/inspectingKind";

type Props = {
  type?: string;
  id?: BaseKey;
  action: "edit" | "create";
  open?: boolean;
  onClose?: () => void;
  onMutationSuccess?: () => void;
  initialValues?: any;
  refetch?: () => void;
};

export const InspectionModalForm: React.FC<Props> = (props) => {
  const [formLoading, setFormLoading] = useState(false);
  const getToPath = useGetToPath();
  const [searchParams] = useSearchParams();
  const go = useGo();
  const [form] = Form.useForm();
  const [imageList, setImageList] = useState<string[]>([]);
  const { token } = theme.useToken();

  const { mutate, isLoading } = useCustomMutation();

  useEffect(() => {
    if (props.open && props.initialValues) {
      const formattedData = {
        ...props.initialValues,
        start_date: props.initialValues.start_date
          ? dayjs(props.initialValues.start_date)
          : null,
        end_date: props.initialValues.end_date
          ? dayjs(props.initialValues.end_date)
          : null,
      };
      form.setFieldsValue(formattedData);
    }
  }, [props.open, props.initialValues]);

  const onModalClose = () => {
    form.resetFields();
    setImageList([]);
    if (props?.onClose) {
      props.onClose();
      return;
    }
    go({
      to: searchParams.get("to") ?? getToPath({ action: "list" }) ?? "",
      query: { to: undefined },
      options: { keepQuery: true },
      type: "replace",
    });
  };

  const onFinish = async (values: any) => {
    setFormLoading(true);
    const payload = { ...values, inspect_images: imageList };

    const exceedingLimits = Object.keys(values).filter((key) => {
      if (key === "result_content") return false;
      const value = parseFloat(values[key]);
      const limit = key === "salmonella" ? 0 : LIMITS[key];
      return limit !== undefined && !isNaN(value) && value > limit;
    });

    if (exceedingLimits.length > 0) {
      message.warning(
        `Cảnh báo: Các chất (${exceedingLimits.join(", ")}) có giá trị vượt quá giới hạn cho phép. Bạn vẫn có thể lưu kết quả.`
      );
    }

    mutate(
      {
        url: `https://api.outfit4rent.online/api/inspecting-results/${props.id}/result-report`,
        method: "post",
        values: payload,
      },
      {
        onSuccess: () => {
          message.success("Tạo kết quả kiểm nghiệm thành công");
          setFormLoading(false);
          form.resetFields();
          onModalClose();
          props.onMutationSuccess?.();
        },
        onError: () => {
          message.error("Tạo thất bại, vui lòng thử lại");
          setFormLoading(false);
        },
      }
    );
  };

  const handleImageUpload = (info: any) => {
    if (info.file.status === "done") {
      setImageList([...imageList, info.file.response.url]);
    }
  };

  const filteredChemicalGroups = chemicalGroups
    .map((x: any) => {
      if (x?.title === "Kim loại nặng") {
        const types = props?.type
          ? getContaminantLimitsByVegetableType(
            props.type as
            | "Rau họ thập tự"
            | "Hành"
            | "Rau ăn lá"
            | "Rau ăn quả"
            | "Rau ăn củ"
            | "Nấm"
            | "Rau củ quả"
            | "Rau khô"
          )
          : [];
        return {
          title: x?.title,
          keys: types,
          color: x?.color,
        };
      }
      return {
        title: x?.title,
        keys: x?.keys,
        color: x?.color,
      };
    })
    .filter((group) => group.keys.length > 0);

  const overviewTab = {
    title: "Tổng quan",
    key: "overview",
    color: token.colorPrimary,
  };

  return (
    <Modal
      open={props.open}
      onCancel={onModalClose}
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
          <UploadOutlined style={{ color: token.colorPrimary, fontSize: 20 }} />
          <div>
            <Typography.Title level={4} style={{ margin: 0 }}>
              Tạo kết quả kiểm nghiệm
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
              (*) Các chất có dấu sao bắt buộc không được vượt mức an toàn (bắt buộc bằng 0).
            </Typography.Text>
          </div>
        </Flex>
      }
      style={{
        top: 20,
      }}
      centered
      closeIcon={<CloseOutlined style={{ color: token.colorTextSecondary }} />}
    >
      <Spin spinning={formLoading || isLoading}>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Space direction="vertical" size={24} style={{ width: "100%" }}>
            <Tabs
              type="card"
              items={[
                ...filteredChemicalGroups.map((group) => ({
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
                      dataSource={group.keys.map((key: any) => ({
                        key,
                        label: `${key} (${UNITS[key] || "N/A"})`,
                      }))}
                      columns={[
                        {
                          title: "Tên chất",
                          dataIndex: "label",
                          key: "label",
                          width: "40%",
                          render: (text: string, record: any) => {
                            const mustBeZero = mustBeZeroKeys.includes(record.key);
                            return (
                              <Flex align="center" gap={8}>
                                <Typography.Text
                                  strong
                                  style={{ textTransform: "capitalize" }}
                                >
                                  {text.split(" (")[0]}
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
                                  title={`Giới hạn an toàn: ${mustBeZero
                                      ? "Bắt buộc = 0"
                                      : LIMITS[record.key]
                                        ? `≤ ${LIMITS[record.key]} ${UNITS[record.key] || ""}`
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
                        },
                        {
                          title: "Giá trị",
                          dataIndex: "value",
                          key: "value",
                          width: "30%",
                          render: (_, record: any) => (
                            <Form.Item
                              name={record.key}
                              style={{ marginBottom: 0 }}
                              validateTrigger={["onChange"]}
                              rules={[
                                {
                                  validator: async (_, value) => {
                                    if (value === undefined || value === null)
                                      return;
                                    const mustBeZero = mustBeZeroKeys.includes(record.key);
                                    const limit = mustBeZero ? 0 : LIMITS[record.key];
                                    if (limit !== undefined && value > limit) {
                                      return Promise.reject(
                                        <Tag
                                          color="red"
                                          icon={<WarningOutlined />}
                                        >
                                          Vượt quá giới hạn: {mustBeZero ? "Bắt buộc = 0" : `≤ ${limit} ${UNITS[record.key] || ""}`}
                                        </Tag>
                                      );
                                    }
                                    return Promise.resolve();
                                  },
                                },
                              ]}
                            >
                              <InputNumber
                                style={{ width: "100%" }}
                                addonAfter={UNITS[record.key] || ""}
                              />
                            </Form.Item>
                          ),
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
                })),
                {
                  key: overviewTab.key,
                  label: (
                    <Flex align="center" gap={8}>
                      <div
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          backgroundColor: overviewTab.color,
                        }}
                      />
                      <span>{overviewTab.title}</span>
                    </Flex>
                  ),
                  children: (
                    <Space
                      direction="vertical"
                      size="middle"
                      style={{ width: "100%", padding: 16 }}
                    >
                      <Form.Item
                        label={
                          <Typography.Text strong>
                            Nội dung kết quả
                          </Typography.Text>
                        }
                        name="result_content"
                      >
                        <Input.TextArea rows={4} />
                      </Form.Item>
                    </Space>
                  ),
                },
              ]}
            />
            <Flex justify="space-between" style={{ paddingTop: 16 }}>
              <Button
                onClick={onModalClose}
                style={{
                  borderRadius: token.borderRadiusSM,
                }}
              >
                Hủy
              </Button>
              <SaveButton
                htmlType="submit"
                type="primary"
                loading={formLoading}
                style={{
                  borderRadius: token.borderRadiusSM,
                  backgroundColor: token.colorPrimary,
                  borderColor: token.colorPrimary,
                }}
              >
                Xác nhận
              </SaveButton>
            </Flex>
          </Space>
        </Form>
      </Spin>
    </Modal>
  );
};