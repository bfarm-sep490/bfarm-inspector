// NotificationComponent.tsx

import React, { useState } from "react";

import { Modal, List, Avatar, Typography, Button, Tabs, Badge, Space, Spin } from "antd";
import { NotificationOutlined, CloseOutlined, ReloadOutlined } from "@ant-design/icons";

import { useTranslate } from "@refinedev/core";

const { Text } = Typography;
const { TabPane } = Tabs;

interface INotification {
  id: string;
  title: string;
  message: string;
  time: string;
  avatar?: string;
  read: boolean;
  type: "message" | "alert" | "system";
}

interface NotificationProps {
  isLoading?: boolean;
  refetch?: () => void;
  notifications: INotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}

export const NotificationPopup: React.FC<NotificationProps> = ({
  isLoading,
  refetch,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
}) => {
  const [visible, setVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("1");
  const t = useTranslate();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const showModal = () => {
    setVisible(true);
  };

  const handleCancel = () => {
    setVisible(false);
  };

  const filteredNotifications =
    activeTab === "1" ? notifications : notifications.filter((n) => !n.read);

  return (
    <>
      <Badge count={unreadCount}>
        <Avatar
          onClick={showModal}
          shape="circle"
          size="default"
          style={{ cursor: "pointer" }}
          icon={<NotificationOutlined />}
        />
      </Badge>

      <Modal
        title={
          <div
            style={{
              display: "flex",
              justifyContent: "start",
              alignItems: "center",
              gap: 10,
            }}
          >
            <Text strong>{t("notifications.title", "Thông báo")}</Text>
            {isLoading ? <Spin></Spin> : <ReloadOutlined onClick={refetch} />}
          </div>
        }
        loading={isLoading}
        open={visible}
        onCancel={handleCancel}
        footer={null}
        width={400}
        height={800}
        style={{ borderRadius: 0, left: "20%", bottom: "10%" }}
        styles={{
          body: {
            padding: "0px0px",
            overflow: "auto", // Nếu bạn muốn giữ cả hai kiểu
          },
        }}
      >
        <Tabs activeKey={activeTab} onChange={setActiveTab} style={{ marginBottom: 0 }}>
          <TabPane tab={t("notifications.all", "Tất cả")} key="1" />
          <TabPane tab={t("notifications.unread", "Chưa đọc")} key="2" />
        </Tabs>

        <List
          dataSource={filteredNotifications}
          renderItem={(item) => (
            <List.Item
              style={{
                padding: "12px 24px",
                backgroundColor: item.read ? "transparent" : "rgba(0, 114, 229, 0.05)",
                cursor: "pointer",
              }}
              onClick={() => onMarkAsRead(item.id)}
            >
              <List.Item.Meta
                avatar={
                  item.avatar ? (
                    <Avatar src={item.avatar} />
                  ) : (
                    <Avatar
                      icon={<NotificationOutlined />}
                      style={{ backgroundColor: "#1890ff" }}
                    />
                  )
                }
                title={<Text strong>{item.title}</Text>}
                description={
                  <Space direction="vertical" size={4} style={{ width: "100%" }}>
                    <Text>{item.message}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {item.time}
                    </Text>
                  </Space>
                }
              />
            </List.Item>
          )}
          locale={{
            emptyText: t("notifications.noNotifications", "Không có thông báo nào"),
          }}
          footer={
            <div style={{ padding: "12px 24px", borderTop: "1px solid #f0f0f0" }}>
              {unreadCount > 0 ? (
                <Button type="link" block onClick={onMarkAllAsRead}>
                  {t("notifications.markAllAsRead", "Đánh dấu đã đọc tất cả")}
                </Button>
              ) : (
                <Button type="text" block disabled>
                  {t("notifications.allRead", "Bạn đã đọc tất cả thông báo")}
                </Button>
              )}
            </div>
          }
        />
      </Modal>
    </>
  );
};
