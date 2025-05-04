import { BellOutlined } from "@ant-design/icons";
import {
  Badge,
  Popover,
  List,
  Space,
  Typography,
  Button,
  Tabs,
  Avatar,
  Skeleton,
  theme,
  Tooltip,
  Divider,
} from "antd";
import {
  useApiUrl,
  useCustomMutation,
  useGetIdentity,
  useList,
  useUpdate,
  useInvalidate,
  useTranslate,
} from "@refinedev/core";
import { useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";
import { useStyles } from "./styled";

dayjs.extend(relativeTime);
dayjs.locale("vi");

interface Notification {
  id: number;
  expert_id: number;
  message: string;
  title: string;
  image: string | null;
  is_read: boolean;
  created_date: string;
}

export const NotificationDropdown = () => {
  const { data: user } = useGetIdentity<{ id: number }>();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("unread");
  const apiUrl = useApiUrl();
  const invalidate = useInvalidate();
  const { styles } = useStyles();
  const { token } = theme.useToken();

  const { data: notificationsData, isLoading } = useList<Notification>({
    resource: `inspectors/${user?.id}/notifications`,
    queryOptions: {
      enabled: !!user?.id,
      refetchInterval: 30000,
    },
  });

  const { mutate: markAsRead } = useUpdate();
  const { mutate: markAllAsRead } = useCustomMutation();

  const notifications = notificationsData?.data || [];
  const unreadNotifications = notifications.filter((n) => !n.is_read);

  const handleMarkAsRead = (notificationId: number) => {
    markAsRead(
      {
        resource: `inspectors/notification-read`,
        id: notificationId,
        values: {},
        successNotification: false,
      },
      {
        onSuccess: () => {
          invalidate({
            resource: `inspectors/${user?.id}/notifications`,
            invalidates: ["list"],
          });
        },
      },
    );
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead(
      {
        url: `${apiUrl}/inspectors/${user?.id}/notifications-read`,
        method: "put",
        values: {},
        successNotification: false,
      },
      {
        onSuccess: () => {
          invalidate({
            resource: `inspectors/${user?.id}/notifications`,
            invalidates: ["list"],
          });
          setActiveTab("read");
        },
      },
    );
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
  };
  const t = useTranslate();

  const renderNotificationItem = (item: Notification) => (
    <List.Item
      key={item.id}
      style={{
        padding: "12px 16px",
        cursor: item.is_read ? "default" : "pointer",
        backgroundColor: !item.is_read ? token.colorPrimaryBg : "transparent",
        transition: "all 0.3s",
        borderBottom: `1px solid ${token.colorBorder}`,
      }}
      onClick={() => !item.is_read && handleMarkAsRead(item.id)}
    >
      <List.Item.Meta
        avatar={
          <div
            style={{
              width: { xs: 40, sm: 48 }[token.screenXS ? "xs" : "sm"],
              height: { xs: 40, sm: 48 }[token.screenXS ? "xs" : "sm"],
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Avatar
              src={item.image}
              icon={!item.image && <BellOutlined />}
              size={{ xs: 40, sm: 48 }[token.screenXS ? "xs" : "sm"]}
              style={{
                backgroundColor: !item.is_read ? token.colorPrimary : token.colorBgContainer,
                color: !item.is_read ? token.colorWhite : token.colorTextSecondary,
              }}
            />
          </div>
        }
        title={
          <Tooltip title={item.title}>
            <Typography.Text
              strong
              style={{
                color: token.colorText,
                maxWidth: { xs: 200, sm: 280 }[token.screenXS ? "xs" : "sm"],
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                display: "block",
              }}
            >
              {item.title}
            </Typography.Text>
          </Tooltip>
        }
        description={
          <Space direction="vertical" size={4}>
            <Typography.Paragraph
              type="secondary"
              ellipsis={{
                rows: 2,
                expandable: true,
                symbol: t("notification.seeMore"),
              }}
              style={{
                margin: 0,
                fontSize: { xs: "12px", sm: "13px" }[token.screenXS ? "xs" : "sm"],
                lineHeight: "1.4",
              }}
            >
              {item.message}
            </Typography.Paragraph>
            <Typography.Text
              type="secondary"
              style={{
                fontSize: { xs: "11px", sm: "12px" }[token.screenXS ? "xs" : "sm"],
                display: "block",
              }}
            >
              {dayjs(item.created_date).fromNow()}
            </Typography.Text>
          </Space>
        }
      />
    </List.Item>
  );

  const content = (
    <div
      style={{
        width: { xs: 360, sm: 500 }[token.screenXS ? "xs" : "sm"],
        maxWidth: "100vw",
      }}
    >
      <Space
        style={{
          width: "100%",
          justifyContent: "space-between",
          padding: "12px 0px",
          backgroundColor: token.colorBgElevated,
        }}
      >
        <Typography.Text style={{ fontSize: "20px" }} strong>
          {t("notification.title")}
        </Typography.Text>
        {unreadNotifications.length > 0 && (
          <Button type="link" onClick={handleMarkAllAsRead} style={{ padding: "0 8px" }}>
            {t("notification.markAll")}
          </Button>
        )}
      </Space>

      <Tabs
        activeKey={activeTab}
        size="middle"
        type="card"
        onChange={setActiveTab}
        items={[
          {
            key: "all",
            label: (
              <Space>
                <span>{t("notification.tabs.all")}</span>
              </Space>
            ),
            children: (
              <div
                id="all-notifications"
                className="notification-scroll"
                style={{
                  height: { xs: 400, sm: 500 }[token.screenXS ? "xs" : "sm"],
                  overflow: "auto",
                  backgroundColor: token.colorBgContainer,
                }}
              >
                {isLoading ? (
                  <div style={{ padding: "16px" }}>
                    <Skeleton avatar paragraph={{ rows: 2 }} active />
                    <Skeleton avatar paragraph={{ rows: 2 }} active />
                  </div>
                ) : notifications.length > 0 ? (
                  <List
                    dataSource={notifications}
                    renderItem={renderNotificationItem}
                    split={false}
                  />
                ) : (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "24px",
                      color: token.colorTextSecondary,
                    }}
                  >
                    <Divider plain>{t("notification.empty.all")}</Divider>
                  </div>
                )}
              </div>
            ),
          },
          {
            key: "unread",
            label: (
              <Space>
                <span>{t("notification.tabs.unread")}</span>
              </Space>
            ),
            children: (
              <div
                id="unread-notifications"
                className="notification-scroll"
                style={{
                  height: { xs: 400, sm: 500 }[token.screenXS ? "xs" : "sm"],
                  overflow: "auto",
                  backgroundColor: token.colorBgContainer,
                }}
              >
                {isLoading ? (
                  <div style={{ padding: "16px" }}>
                    <Skeleton avatar paragraph={{ rows: 2 }} active />
                    <Skeleton avatar paragraph={{ rows: 2 }} active />
                  </div>
                ) : unreadNotifications.length > 0 ? (
                  <List
                    dataSource={unreadNotifications}
                    renderItem={renderNotificationItem}
                    split={false}
                  />
                ) : (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "24px",
                      color: token.colorTextSecondary,
                    }}
                  >
                    <Divider plain>{t("notification.empty.unread")}</Divider>
                  </div>
                )}
              </div>
            ),
          },
        ]}
      />
    </div>
  );

  return (
    <Popover content={content} trigger="click" open={open} onOpenChange={handleOpenChange}>
      <Badge
        count={unreadNotifications.length}
        offset={[-2, 2]}
        style={{
          cursor: "pointer",
          transition: "all 0.3s",
        }}
        className="notification-badge"
      >
        <Button className={styles.themeSwitch} type="text" icon={<BellOutlined />} />
      </Badge>
    </Popover>
  );
};
