/* eslint-disable prettier/prettier */
import { SaveButton } from "@refinedev/antd";
import { BaseKey, useCustomMutation } from "@refinedev/core";
import {
  Form,
  InputNumber,
  Modal,
  Spin,
  Button,
  Flex,
  message,
  Input,
  Table,
  Tabs,
  Typography,
  theme,
  Space,
} from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { chemicalGroups } from "../chemical/ChemicalConstants";
import { getContaminantsByType } from "../getContaminantsByType";

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
  const [form] = Form.useForm();
  const [imageList, setImageList] = useState<string[]>([]);
  const { token } = theme.useToken();
  const { mutate, isLoading } = useCustomMutation();

  const thresholds = getContaminantsByType(props.type);
  const thresholdMap = Object.fromEntries(
    thresholds.map((item) => [item.key, item])
  );

  const checkThresholdStatus = (
    key: string,
    value: number
  ): "ok" | "warning" | "danger" => {
    const threshold = thresholdMap[key];
    if (!threshold || value === null || value === undefined || isNaN(value))
      return "ok";

    const warning = parseFloat(threshold.warning);
    const danger = parseFloat(threshold.danger);

    if (!isNaN(danger) && value >= danger) return "danger";
    if (!isNaN(warning) && value >= warning && value < danger) return "warning";
    if (!isNaN(warning) && value < warning) return "ok";

    return "ok";
  };

  const getValidateStatus = (status: "ok" | "warning" | "danger") => {
    if (status === "danger") return "error";
    if (status === "warning") return "warning";
    if (status === "ok") return "success";
    return undefined;
  };

  const [fieldWarnings, setFieldWarnings] = useState<
    Record<string, string | undefined>
  >({});

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
  }, [props.open, props.initialValues, form]);

  const onModalClose = () => {
    form.resetFields();
    setImageList([]);
    props?.onClose?.();
  };

  const onFinish = async (values: any) => {
    setFormLoading(true);
    const payload = { ...values, inspect_images: imageList };

    const dangerKeys: string[] = [];
    const warningKeys: string[] = [];

    Object.entries(values).forEach(([key, val]) => {
      const valueNum = typeof val === "number" ? val : parseFloat(String(val));
      const status = checkThresholdStatus(key, valueNum);
      if (status === "danger") dangerKeys.push(key);
      else if (status === "warning") warningKeys.push(key);
    });

    if (dangerKeys.length || warningKeys.length) {
      message.warning(
        `Cảnh báo vượt ngưỡng:\n` +
          (dangerKeys.length
            ? `🚨 Nguy hiểm: ${dangerKeys.join(", ")}\n`
            : "") +
          (warningKeys.length ? `⚠️ Cảnh báo: ${warningKeys.join(", ")}` : "")
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

  const handleSubmit = async () => {
    try {
      const allKeys = Object.keys(form.getFieldsValue(true));
      const values = await form.validateFields(allKeys);
      await onFinish(values);
    } catch (error) {
      const errorInfo = error as any;
      const errorFields = errorInfo?.errorFields || [];

      if (errorFields.length > 0) {
        message.error("Vui lòng hoàn thành tất cả trường bắt buộc ở các tab.");
      }
    }
  };

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
      centered
      closeIcon={<CloseOutlined style={{ color: token.colorTextSecondary }} />}
    >
      <Spin spinning={formLoading || isLoading}>
        <Form form={form} layout="vertical">
          <Space direction="vertical" size={24} style={{ width: "100%" }}>
            <Tabs
              type="card"
              items={[
                ...chemicalGroups.map((group) => ({
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
                      dataSource={group.keys.map((key) => ({
                        key,
                        label: `${thresholdMap[key]?.name || key} (${thresholdMap[key]?.unit || ""})`,
                      }))}
                      columns={[
                        {
                          title: "Tên chất",
                          dataIndex: "label",
                          render: (text) => (
                            <Typography.Text strong>{text}</Typography.Text>
                          ),
                        },
                        {
                          title: "Giá trị",
                          dataIndex: "value",
                          render: (_, record) => (
                            <Form.Item
                              name={record.key}
                              help={fieldWarnings[record.key]}
                              validateStatus={getValidateStatus(
                                checkThresholdStatus(
                                  record.key,
                                  form.getFieldValue(record.key)
                                )
                              )}
                              rules={[
                                {
                                  required: true,
                                  message: `Vui lòng nhập giá trị cho ${record.label}`,
                                },
                              ]}
                            >
                              <InputNumber
                                style={{ width: "100%" }}
                                addonAfter={
                                  thresholdMap[record.key]?.unit || ""
                                }
                                onChange={(value) => {
                                  const threshold = thresholdMap[record.key];
                                  if (!threshold) return;

                                  if (
                                    value === null ||
                                    value === undefined ||
                                    isNaN(Number(value))
                                  )
                                    return;

                                  const status = checkThresholdStatus(
                                    record.key,
                                    Number(value)
                                  );
                                  const warningMessage =
                                    status === "danger"
                                      ? `🚨 NGUY HIỂM: ${threshold.name} vượt quá ngưỡng nguy hiểm`
                                      : status === "warning"
                                        ? `⚠️ CẢNH BÁO: ${threshold.name} vượt quá ngưỡng cảnh báo`
                                        : `✅ OK: ${threshold.name} nằm trong giới hạn an toàn`;

                                  setFieldWarnings((prev) => ({
                                    ...prev,
                                    [record.key]: warningMessage,
                                  }));
                                }}
                                onBlur={() => {
                                  form
                                    .validateFields([record.key])
                                    .catch(() => {});
                                }}
                              />
                            </Form.Item>
                          ),
                        },
                      ]}
                      pagination={false}
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
                    <Form.Item
                      label={
                        <Typography.Text strong>
                          Nội dung kết quả
                        </Typography.Text>
                      }
                      name="result_content"
                      rules={[
                        {
                          required: true,
                          message: "Nội dung không được để trống",
                        },
                      ]}
                    >
                      <Input.TextArea rows={4} />
                    </Form.Item>
                  ),
                },
              ]}
            />

            <Flex justify="space-between">
              <Button onClick={onModalClose}>Hủy</Button>
              <SaveButton
                onClick={handleSubmit}
                loading={formLoading}
                type="primary"
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
