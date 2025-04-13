// import { Link } from "react-router";
import { SearchOutlined, DownOutlined, NotificationOutlined } from "@ant-design/icons";
import { RefineThemedLayoutV2HeaderProps } from "@refinedev/antd";
import {
  useGetLocale,
  useSetLocale,
  useGetIdentity,
  useTranslate,
  pickNotDeprecated,
  useList,
} from "@refinedev/core";
import {
  Dropdown,
  Input,
  Avatar,
  Typography,
  Space,
  Grid,
  Row,
  Col,
  AutoComplete,
  Layout as AntdLayout,
  Button,
  theme,
  type MenuProps,
  Badge,
  notification,
} from "antd";
import debounce from "lodash/debounce";
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

import { IconMoon, IconSun } from "../../components/icons";
import { useConfigProvider } from "../../context";

import { useStyles } from "./styled";

import type { IIdentity } from "../../interfaces";
import { NotificationPopup } from "./notification";
import { onMessageListener } from "@/utils/firebase";

const { Header: AntdHeader } = AntdLayout;
const { useToken } = theme;
const { Text } = Typography;
const { useBreakpoint } = Grid;

interface IOptionGroup {
  value: string;
  label: string | React.ReactNode;
}

interface IOptions {
  label: string | React.ReactNode;
  options: IOptionGroup[];
}

export const Header: React.FC<RefineThemedLayoutV2HeaderProps> = ({ isSticky, sticky }) => {
  const [viewNotification, setViewNotification] = useState(false);
  const { token } = useToken();
  const { styles } = useStyles();
  const { mode, setMode } = useConfigProvider();
  const { i18n } = useTranslation();
  const locale = useGetLocale();
  const changeLanguage = useSetLocale();
  const { data: user } = useGetIdentity<IIdentity>();
  const screens = useBreakpoint();
  const t = useTranslate();

  const currentLocale = locale();

  // const renderTitle = (title: string) => (
  //   <div className={styles.headerTitle}>
  //     <Text style={{ fontSize: "16px" }}>{title}</Text>
  //     <Link to={`/${title.toLowerCase()}`}>{t("search.more")}</Link>
  //   </div>
  // );

  // const renderItem = (title: string, imageUrl: string, link: string) => ({
  //   value: title,
  //   label: (
  //     <Link to={link} style={{ display: "flex", alignItems: "center" }}>
  //       {imageUrl && (
  //         <Avatar
  //           size={32}
  //           src={imageUrl}
  //           style={{ minWidth: "32px", marginRight: "16px" }}
  //         />
  //       )}
  //       <Text>{title}</Text>
  //     </Link>
  //   ),
  // });

  interface Notification {
    id: string;
    title: string;
    message: string;
    time: string;
    read: boolean;
    type: "message" | "alert" | "system";
  }
  const {
    data: notificationData,
    isLoading: notificationLoading,
    refetch: notificationRefetch,
  } = useList({
    resource: `inspectors/${user?.id}/notifications`,
  });
  useEffect(() => {
    if (!notificationLoading && notificationData) {
      setNotifications((prev) =>
        [
          ...notificationData?.data?.map((item: any) => ({
            id: item.id,
            title: item.title,
            message: item.body,
            time: new Date(item.createdAt).toLocaleTimeString(),
            read: item.read,
            type: "message" as const,
          })),
        ]?.sort((a, b) => {
          return new Date(b.time).getTime() - new Date(a.time).getTime();
        }),
      );
    }
  }, [notificationData]);
  const [api, contextHolder] = notification.useNotification();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification,
      ),
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })));
  };
  onMessageListener()
    .then((payload: any) => {
      setNotifications((prev) =>
        [
          ...prev,
          {
            id: payload?.data?.id,
            title: payload?.notification?.title,
            message: payload?.notification?.body,
            time: new Date().toLocaleTimeString(),
            read: false,
            type: "message" as const,
          },
        ]?.sort((a, b) => {
          return new Date(b.time).getTime() - new Date(a.time).getTime();
        }),
      );
      api.info({
        message: payload?.notification?.title,
        description: payload?.notification?.body,
        placement: "top",
        duration: 3,
      });
    })
    .catch((err) => console.log("failed: ", err));
  const [value, setValue] = useState<string>("");
  const [options, setOptions] = useState<IOptions[]>([]);

  useEffect(() => {
    setOptions([]);
  }, [value]);

  const menuItems: MenuProps["items"] = [...(i18n.languages || [])].sort().map((lang: string) => ({
    key: lang,
    onClick: () => changeLanguage(lang),
    icon: (
      <span style={{ marginRight: 8 }}>
        <Avatar size={16} src={`/images/flags/${lang}.svg`} />
      </span>
    ),
    label: lang === "en" ? "English" : "Tiếng Việt",
  }));
  const headerStyles: React.CSSProperties = {
    backgroundColor: token.colorBgElevated,
    padding: "0px 24px",
  };

  if (pickNotDeprecated(sticky, isSticky)) {
    headerStyles.position = "sticky";
    headerStyles.top = 0;
    headerStyles.zIndex = 1000;
  }
  return (
    <AntdHeader style={headerStyles}>
      <Row
        align="middle"
        style={{
          justifyContent: screens.sm ? "space-between" : "end",
        }}
      >
        {contextHolder}
        <Col xs={0} sm={8} md={12}>
          <AutoComplete
            style={{
              width: "100%",
              maxWidth: "550px",
            }}
            options={options}
            filterOption={false}
            onSearch={debounce((value: string) => setValue(value), 300)}
          >
            <Input
              size="large"
              placeholder={t("search.placeholder")}
              suffix={<div className={styles.inputSuffix}>/</div>}
              prefix={<SearchOutlined className={styles.inputPrefix} />}
            />
          </AutoComplete>
        </Col>
        <Col>
          <Space size={screens.md ? 32 : 16} align="center">
            <Dropdown
              menu={{
                items: menuItems,
                selectedKeys: currentLocale ? [currentLocale] : [],
              }}
            >
              <Button onClick={(e) => e.preventDefault()}>
                <Space>
                  <Text className={styles.languageSwitchText}>
                    {currentLocale === "en" ? "English" : "Tiếng Việt"}
                  </Text>
                  <DownOutlined className={styles.languageSwitchIcon} />
                </Space>
              </Button>
            </Dropdown>

            <Button
              className={styles.themeSwitch}
              type="text"
              icon={mode === "light" ? <IconMoon /> : <IconSun />}
              onClick={() => {
                setMode(mode === "light" ? "dark" : "light");
              }}
            />

            <NotificationPopup
              refetch={notificationRefetch}
              isLoading={notificationLoading}
              notifications={notifications}
              onMarkAsRead={handleMarkAsRead}
              onMarkAllAsRead={handleMarkAllAsRead}
            />
            <Space size={screens.md ? 16 : 8} align="center">
              <Text ellipsis className={styles.userName}>
                {user?.name}
              </Text>
              <Avatar size="large" src={user?.avatar} alt={user?.name} />
            </Space>
          </Space>
        </Col>
      </Row>
    </AntdHeader>
  );
};
