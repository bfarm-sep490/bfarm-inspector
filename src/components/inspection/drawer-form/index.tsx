import { SaveButton } from "@refinedev/antd";
import { BaseKey, useCustomMutation, useGetToPath, useGo } from "@refinedev/core";
import { Form, InputNumber, Modal, Spin, Button, Flex, message, Upload, Input, Table } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import dayjs from "dayjs";
import { chemicalGroups, UNITS } from "../chemical/ChemicalConstants";
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

  const { mutate, isLoading } = useCustomMutation();

  useEffect(() => {
    if (props.open && props.initialValues) {
      const formattedData = {
        ...props.initialValues,
        start_date: props.initialValues.start_date ? dayjs(props.initialValues.start_date) : null,
        end_date: props.initialValues.end_date ? dayjs(props.initialValues.end_date) : null,
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
      },
    );
  };

  const handleImageUpload = (info: any) => {
    if (info.file.status === "done") {
      setImageList([...imageList, info.file.response.url]);
    }
  };

  const handleImageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageList([...imageList, e.target.value]);
  };

  return (
    <Modal
      open={props.open}
      title={
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "24px", fontWeight: "bold" }}>Tạo kết quả kiểm nghiệm</div>
          <hr
            style={{
              marginTop: "8px",
              marginBottom: "30px",
              border: "1px solid #ddd",
            }}
          />
        </div>
      }
      width={900}
      onCancel={onModalClose}
      footer={null}
    >
      <Spin spinning={formLoading || isLoading}>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          {chemicalGroups
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
                        | "Rau khô",
                    )
                  : [];
                return {
                  title: x?.title,
                  keys: types,
                };
              }
              return {
                title: x?.title,
                keys: x?.keys,
              };
            })
            .map((group) => (
              <div key={group.title} style={{ marginBottom: "32px" }}>
                <h3
                  style={{
                    fontSize: "18px",
                    fontWeight: "bold",
                    marginBottom: "16px",
                  }}
                >
                  {group.title}
                </h3>
                <Table
                  columns={[
                    {
                      title: "Chất hóa học",
                      dataIndex: "label",
                      key: "label",
                      width: 230,
                      ellipsis: true,
                      render: (text: string) => (
                        <span
                          style={{
                            fontWeight: "bolder",
                            textTransform: "capitalize",
                          }}
                        >
                          {text}
                        </span>
                      ),
                    },
                    {
                      title: "Giá trị",
                      dataIndex: "value",
                      key: "value",
                      width: 120,
                      render: (_, record: any) => (
                        <Form.Item name={record?.key} style={{ marginBottom: 0 }}>
                          <InputNumber style={{ width: "100%" }} />
                        </Form.Item>
                      ),
                    },
                  ]}
                  dataSource={group.keys.map((key: any) => ({
                    key,
                    label: `${key} (${UNITS[key] || "N/A"})`,
                  }))}
                  pagination={false}
                  bordered
                  style={{ tableLayout: "fixed" }}
                />
              </div>
            ))}
          <Form.Item label="Nội dung kết quả" name="result_content">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item label="Chọn ảnh từ máy">
            <Upload name="file" action="/upload" listType="picture" onChange={handleImageUpload}>
              <Button icon={<UploadOutlined />}>Tải ảnh lên</Button>
            </Upload>
          </Form.Item>
          <Flex justify="space-between" style={{ paddingTop: 16 }}>
            <Button onClick={onModalClose}>Cancel</Button>
            <SaveButton htmlType="submit" type="primary" loading={formLoading}>
              Xác nhận
            </SaveButton>
          </Flex>
        </Form>
      </Spin>
    </Modal>
  );
};
