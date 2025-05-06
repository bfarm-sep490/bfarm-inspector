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
  Upload,
  Col,
  Row,
} from "antd";
import { CloseOutlined, DeleteOutlined, UploadOutlined } from "@ant-design/icons";
import { BaseKey, useCustomMutation, useTranslate } from "@refinedev/core";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { chemicalGroups } from "../chemical/ChemicalConstants";
import { getContaminantsByType } from "../getContaminantsByType";
import { getContaminantLimitsByVegetableType } from "@/utils/inspectingKind";
import { UploadProps } from "antd/lib";
import { axiosInstance } from "@/rest-data-provider/utils";

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
  const [imageList, setImageList] = useState<{ url: string; name: string }[]>([]);

  const { token } = theme.useToken();
  const { mutate, isLoading } = useCustomMutation();
  const [missingMessage, setMissingMessage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const t = useTranslate();

  const thresholds = getContaminantsByType(props.type);
  const thresholdMap = Object.fromEntries(thresholds.map((item) => [item.key, item]));

  const filteredChemicalGroups = chemicalGroups
    .map((group: any) => {
      if (group.title === "Kim loại nặng" && props?.type) {
        const allowedKeys = getContaminantLimitsByVegetableType(
          props.type as keyof typeof getContaminantLimitsByVegetableType,
        );
        return {
          title: group.title,
          keys: group.keys.filter((k: string) => allowedKeys.includes(k.toLowerCase())),
          color: group.color,
        };
      }

      const validKeys = group.keys.filter((k: string) => thresholdMap[k]);
      return {
        title: group.title,
        keys: validKeys,
        color: group.color,
      };
    })
    .filter((group) => group.keys.length > 0);

  const checkThresholdStatus = (key: string, value: number): "ok" | "warning" | "danger" => {
    const threshold = thresholdMap[key];
    if (!threshold || value === null || value === undefined || isNaN(value)) return "ok";
    const warning = parseFloat(threshold.warning);
    const danger = parseFloat(threshold.danger);
    if (!isNaN(danger) && value >= danger) return "danger";
    if (!isNaN(warning) && value >= warning && value < danger) return "warning";
    if (!isNaN(warning) && value < warning) return "ok";
    return "ok";
  };

  const [fieldWarnings, setFieldWarnings] = useState<Record<string, string | undefined>>({});

  useEffect(() => {
    if (props.open && props.initialValues) {
      const formattedData = {
        ...props.initialValues,
        start_date: props.initialValues.start_date ? dayjs(props.initialValues.start_date) : null,
        end_date: props.initialValues.end_date ? dayjs(props.initialValues.end_date) : null,
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

  const onFinish = async (values: Record<string, number | string | undefined>) => {
    setFormLoading(true);
    const payload = {
      ...values,
      inspect_images: imageList.map((item) => item.url),
    };

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
            : ""),
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
          setFormLoading(false);
        },
      },
    );
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setMissingMessage(null);
      await onFinish(values);
    } catch (errorInfo: unknown) {
      if (typeof errorInfo === "object" && errorInfo !== null && "errorFields" in errorInfo) {
        setMissingMessage(t("inspectionForm.missing"));
      }
    }
  };
  const handleUpload: UploadProps["customRequest"] = async ({ file, onSuccess, onError }) => {
    setUploading(true);

    const formData = new FormData();
    formData.append("image", file as Blob);

    try {
      const res = await axiosInstance.post(
        "https://api.outfit4rent.online/api/inspecting-results/documents/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      const data = res.data;

      if (data.status === 200 && data.data) {
        const fileName = (file as File).name;
        const uploadedUrls = data.data.map((url: string) => ({
          url,
          name: fileName,
        }));

        setImageList((prev) => [...prev, ...uploadedUrls]);
        message.success("Tải file lên thành công!");
        onSuccess?.(data, new XMLHttpRequest());
      } else {
        throw new Error(data.message || "Upload failed");
      }
    } catch (err: any) {
      message.error("Tải file lên thất bại!");
      onError?.(err);
    } finally {
      setUploading(false);
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
      maskClosable={false}
      closeIcon={<CloseOutlined style={{ color: token.colorTextSecondary }} />}
    >
      <Spin spinning={formLoading || isLoading}>
        <Form form={form} layout="vertical">
          <Space direction="vertical" size={24} style={{ width: "100%" }}>
            <Tabs
              type="card"
              destroyInactiveTabPane={false}
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
                      <span>{t(group.title)}</span>
                    </Flex>
                  ),
                  forceRender: true,
                  children: (
                    <Flex vertical gap={16}>
                      {group.keys.map((key: string) => {
                        const label = `${thresholdMap[key]?.name || key} (${(thresholdMap[key]?.unit || "").replace("/", "⁄")})`;
                        const value = form.getFieldValue(key);
                        const status = checkThresholdStatus(key, value);
                        const hasValue =
                          value !== null && value !== undefined && value !== "" && !isNaN(value);

                        return (
                          <Form.Item
                            key={key}
                            name={key}
                            label={<Typography.Text strong>{label}</Typography.Text>}
                            help={status === "ok" ? undefined : fieldWarnings[key]}
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
                                borderColor: hasValue && status === "ok" ? "#52c41a" : undefined,
                                boxShadow:
                                  hasValue && status === "ok"
                                    ? "0 0 0 2px rgba(82, 196, 26, 0.2)"
                                    : undefined,
                                borderRadius: 6,
                                borderWidth: hasValue && status === "ok" ? 1 : undefined,
                                borderStyle: hasValue && status === "ok" ? "solid" : undefined,
                              }}
                              addonAfter={thresholdMap[key]?.unit || ""}
                              onChange={(value) => {
                                const threshold = thresholdMap[key];
                                if (!threshold) return;
                                if (value === null || value === undefined || isNaN(Number(value)))
                                  return;

                                const status = checkThresholdStatus(key, Number(value));
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
                  forceRender: true,
                  children: (
                    <>
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
                      <Form.Item
                        label={
                          <Typography.Text strong>
                            <span style={{ color: token.colorError }}> </span>
                            {t("inspectionForm.field.imageProof")}
                          </Typography.Text>
                        }
                        required
                      >
                        <Upload
                          multiple
                          customRequest={handleUpload}
                          showUploadList={false}
                          accept="image/*,.pdf,.rar,.zip,.doc,.docx"
                        >
                          <Button
                            icon={<UploadOutlined style={{ fontSize: 18 }} />}
                            loading={uploading}
                            type="default"
                            size="large"
                            style={{
                              backgroundColor: "#ffffff",
                              border: "1px solid #d9d9d9",
                              borderRadius: "10px",
                              fontWeight: 500,
                              color: "#141414",
                              padding: "8px 20px",
                              boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                            }}
                          >
                            Tải file lên
                          </Button>
                        </Upload>

                        <Row gutter={[16, 16]} style={{ marginTop: 12 }}>
                          {imageList.map((item, idx) => {
                            const isImage = /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(item.url);
                            const ext = item.name.split(".").pop()?.toUpperCase() || "";

                            const handleRemove = () => {
                              setImageList((prev) => prev.filter((_, i) => i !== idx));
                            };

                            return (
                              <Col key={idx} xs={24} sm={12} md={8} lg={6} xl={4}>
                                <div
                                  style={{
                                    borderRadius: 12,
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                                    background: "#fff",
                                    padding: 12,
                                    textAlign: "center",
                                    position: "relative",
                                    height: 160,
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "space-between",
                                  }}
                                >
                                  <CloseOutlined
                                    onClick={handleRemove}
                                    style={{
                                      position: "absolute",
                                      top: 6,
                                      right: 6,
                                      fontSize: 16,
                                      color: "#f5222d",
                                      cursor: "pointer",
                                      backgroundColor: "rgba(255, 77, 79, 0.1)",
                                      borderRadius: "50%",
                                      padding: 4,
                                    }}
                                  />

                                  {isImage ? (
                                    <img
                                      src={item.url}
                                      alt={item.name}
                                      style={{
                                        width: "100%",
                                        height: 100,
                                        objectFit: "cover",
                                        borderRadius: 8,
                                      }}
                                    />
                                  ) : (
                                    <div
                                      style={{
                                        height: 100,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexDirection: "column",
                                        border: "1px dashed #d9d9d9",
                                        borderRadius: 8,
                                      }}
                                    >
                                      <div style={{ fontSize: 28, fontWeight: "bold" }}>{ext}</div>
                                      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                                        File
                                      </Typography.Text>
                                    </div>
                                  )}

                                  <Typography.Text
                                    ellipsis
                                    style={{
                                      display: "block",
                                      marginTop: 8,
                                      fontSize: 13,
                                      fontWeight: 500,
                                    }}
                                    title={item.name}
                                  >
                                    {item.name}
                                  </Typography.Text>
                                </div>
                              </Col>
                            );
                          })}
                        </Row>

                        <Button
                          onClick={() => setImageList([])}
                          icon={<DeleteOutlined />}
                          style={{
                            marginTop: 12,
                            backgroundColor: "#ff4d4f",
                            color: "#fff",
                            fontWeight: 500,
                            borderRadius: 20,
                            padding: "4px 12px",
                            fontSize: 13,
                            border: "none",
                            boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                          }}
                        >
                          Xóa tất cả file đã tải
                        </Button>
                      </Form.Item>
                    </>
                  ),
                },
              ]}
            />

            <Flex justify="space-between" align="center" vertical>
              <Flex style={{ width: "100%" }} justify="space-between">
                <Button onClick={onModalClose}>{t("inspectionForm.button.cancel")}</Button>
                <Button onClick={handleSubmit} loading={formLoading} type="primary">
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
