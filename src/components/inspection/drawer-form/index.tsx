/* eslint-disable prettier/prettier */
import { BaseKey, useCustomMutation, useTranslate } from "@refinedev/core";
import {
  Form,
  InputNumber,
  Modal,
  Spin,
  Button,
  Flex,
  message,
  Input,
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

const { TabPane } = Tabs;

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
  const [missingMessage, setMissingMessage] = useState<string | null>(null);
  const t = useTranslate();

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
    setMissingMessage(null);
    props?.onClose?.();
  };

  const onFinish = async (
    values: Record<string, number | string | undefined>
  ) => {
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
        t("inspectionForm.warning.title") +
          (dangerKeys.length
            ? "\n" +
              t("inspectionForm.warning.danger", {
                keys: dangerKeys.join(", "),
              })
            : "") +
          (warningKeys.length
            ? "\n" +
              t("inspectionForm.warning.warning", {
                keys: warningKeys.join(", "),
              })
            : "")
      );
    }

    mutate(
      {
        url: `https://api.outfit4rent.online/api/inspecting-results/${props.id}/result-report`,
        method: "post",
        values: payload,
        meta: {},
      },
      {
        onSuccess: () => {
          message.success(t("inspectionForm.success"));
          setFormLoading(false);
          form.resetFields();
          onModalClose();
          props.onMutationSuccess?.();
        },
        onError: (error: unknown) => {
          const err = error as { message?: string };
          message.error(err?.message || t("inspectionForm.error"));
        },
      }
    );
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setMissingMessage(null);
      await onFinish(values);
    } catch (errorInfo: unknown) {
      if (
        typeof errorInfo === "object" &&
        errorInfo !== null &&
        "errorFields" in errorInfo
      ) {
        setMissingMessage(t("inspectionForm.missing"));
      }
    }
  };

  const overviewTab = {
    title: t("inspectionForm.tab.overview"),
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
            <Tabs type="card" destroyInactiveTabPane={false}>
              {chemicalGroups.map((group) => (
                <TabPane
                  forceRender
                  key={group.title}
                  tab={
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
                  }
                >
                  <Flex vertical gap={16}>
                    {group.keys.map((key) => {
                      const label = `${thresholdMap[key]?.name || key} (${thresholdMap[key]?.unit || ""})`;
                      const value = form.getFieldValue(key);
                      const status = checkThresholdStatus(key, value);
                      const hasValue =
                        value !== null &&
                        value !== undefined &&
                        value !== "" &&
                        !isNaN(value);

                      return (
                        <Form.Item
                          key={key}
                          name={key}
                          label={
                            <Typography.Text strong>{label}</Typography.Text>
                          }
                          help={
                            status === "ok" ? undefined : fieldWarnings[key]
                          }
                          validateStatus={
                            hasValue
                              ? status === "danger"
                                ? "error"
                                : status === "warning"
                                  ? "warning"
                                  : undefined
                              : undefined
                          }
                          rules={[
                            {
                              required: true,
                              message: t("inspectionForm.field.inputRequired", {
                                label,
                              }),
                            },
                          ]}
                        >
                          <InputNumber
                            style={{
                              width: "100%",
                              borderColor:
                                hasValue && status === "ok"
                                  ? "#52c41a"
                                  : undefined,
                              boxShadow:
                                hasValue && status === "ok"
                                  ? "0 0 0 2px rgba(82, 196, 26, 0.2)"
                                  : undefined,
                              borderRadius: 6,
                              borderWidth:
                                hasValue && status === "ok" ? 1 : undefined,
                              borderStyle:
                                hasValue && status === "ok"
                                  ? "solid"
                                  : undefined,
                            }}
                            addonAfter={thresholdMap[key]?.unit || ""}
                            onChange={(value) => {
                              const threshold = thresholdMap[key];
                              if (!threshold) return;
                              if (
                                value === null ||
                                value === undefined ||
                                isNaN(Number(value))
                              )
                                return;

                              const status = checkThresholdStatus(
                                key,
                                Number(value)
                              );
                              const warningMessage =
                                status === "danger"
                                  ? t("inspectionForm.warning.fieldDanger", {
                                      name: threshold.name,
                                    })
                                  : status === "warning"
                                    ? t("inspectionForm.warning.fieldWarning", {
                                        name: threshold.name,
                                      })
                                    : undefined;

                              setFieldWarnings((prev) => ({
                                ...prev,
                                [key]: warningMessage,
                              }));
                            }}
                          />
                        </Form.Item>
                      );
                    })}
                  </Flex>
                </TabPane>
              ))}
              <TabPane
                forceRender
                key={overviewTab.key}
                tab={
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
                }
              >
                <Form.Item
                  label={
                    <Typography.Text strong>
                      {t("inspectionForm.field.resultContent")}
                    </Typography.Text>
                  }
                  name="result_content"
                  rules={[
                    {
                      required: true,
                      message: t("inspectionForm.field.resultRequired"),
                    },
                  ]}
                >
                  <Input.TextArea rows={4} />
                </Form.Item>
              </TabPane>
            </Tabs>

            <Flex justify="space-between" align="center" vertical>
              <Flex style={{ width: "100%" }} justify="space-between">
                <Button onClick={onModalClose}>
                  {t("inspectionForm.button.cancel")}
                </Button>
                <Button
                  onClick={handleSubmit}
                  loading={formLoading}
                  type="primary"
                >
                  {t("inspectionForm.button.submit")}
                </Button>
              </Flex>
              {missingMessage && (
                <Typography.Text type="danger" style={{ marginTop: 8 }}>
                  {missingMessage}
                </Typography.Text>
              )}
            </Flex>
          </Space>
        </Form>
      </Spin>
    </Modal>
  );
};
