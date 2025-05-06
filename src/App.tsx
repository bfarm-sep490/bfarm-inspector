import { ScheduleOutlined } from "@ant-design/icons";
import "dayjs/locale/vi";

import { ThemedLayoutV2 } from "@refinedev/antd";
import "@refinedev/antd/dist/reset.css";
import { Authenticated, IResourceItem, Refine } from "@refinedev/core";
import { RefineKbarProvider, RefineKbar } from "@refinedev/kbar";
import routerProvider, {
  CatchAllNavigate,
  NavigateToResource,
  UnsavedChangesNotifier,
  DocumentTitleHandler,
} from "@refinedev/react-router";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { BrowserRouter, Routes, Route, Outlet } from "react-router";

import { authProvider } from "./authProvider";
import { Header, Title } from "./components";
import { ThemedSiderV2 } from "./components/layout/sider";
import { themeConfig } from "./components/theme";
import { ConfigProvider } from "./context";
import { App as AntdApp } from "antd";
import { AuthPage } from "./pages/auth";
import { dataProvider } from "./rest-data-provider";
import { InspectionEdit, InspectionShow, InspectionsList } from "./pages/inspections";
import { liveProvider } from "@refinedev/ably";
import { ablyClient } from "./utils/ablyClient";
import { notificationProvider } from "./providers/notification-provider";

interface TitleHandlerOptions {
  resource?: IResourceItem;
}

const customTitleHandler = ({ resource }: TitleHandlerOptions): string => {
  const baseTitle = "BFarmx Inspecting";
  const titleSegment = resource?.meta?.label;

  const title = titleSegment ? `${titleSegment} | ${baseTitle}` : baseTitle;
  return title;
};

const App: React.FC = () => {
  const API_URL = import.meta.env.VITE_API_URL || "https://api.outfit4rent.online/api";

  const appDataProvider = dataProvider(API_URL);

  const { t, i18n } = useTranslation();

  const i18nProvider = {
    translate: (key: string, params?: { [key: string]: string | number }) => t(key, params),
    changeLocale: (lang: string) => i18n.changeLanguage(lang),
    getLocale: () => i18n.language,
  };

  const resources: IResourceItem[] = useMemo(
    () => [
      {
        name: "inspection-forms",
        list: "/inspection-forms",
        edit: "/inspection-forms/edit/:id",
        show: "/inspection-forms/show/:id",
        meta: {
          label: t("inspection.menu"),
          icon: <ScheduleOutlined />,
        },
      },
    ],
    [t],
  );

  return (
    <BrowserRouter>
      <ConfigProvider theme={themeConfig}>
        <AntdApp>
          <RefineKbarProvider>
            <Refine
              routerProvider={routerProvider}
              dataProvider={appDataProvider}
              authProvider={authProvider}
              i18nProvider={i18nProvider}
              resources={resources}
              options={{
                syncWithLocation: true,
                warnWhenUnsavedChanges: true,
                liveMode: "auto",
              }}
              notificationProvider={notificationProvider}
              liveProvider={liveProvider(ablyClient)}
            >
              <Routes>
                <Route
                  element={
                    <Authenticated
                      key="authenticated-routes"
                      fallback={<CatchAllNavigate to="/login" />}
                    >
                      <ThemedLayoutV2
                        Sider={() => <ThemedSiderV2 Title={Title} fixed />}
                        Header={() => <Header sticky />}
                      >
                        <div
                          style={{
                            maxWidth: "1200px",
                            marginLeft: "auto",
                            marginRight: "auto",
                          }}
                        >
                          <Outlet />
                        </div>
                      </ThemedLayoutV2>
                    </Authenticated>
                  }
                >
                  <Route index element={<NavigateToResource resource="inspection-forms" />} />
                  <Route path="/inspection-forms" element={<InspectionsList />} />
                  <Route path="/inspection-forms/:id" element={<InspectionShow />} />
                  <Route path="/inspection-forms/edit/:id" element={<InspectionEdit />} />
                </Route>

                <Route
                  element={
                    <Authenticated key="auth-pages" fallback={<Outlet />}>
                      <NavigateToResource resource="inspection-forms" />
                    </Authenticated>
                  }
                >
                  <Route
                    path="/login"
                    element={
                      <AuthPage
                        type="login"
                        formProps={{
                          initialValues: {
                            email: "service.eurofins@gmail.com",
                            password: "Eurofin@123",
                          },
                        }}
                        registerLink={false}
                        forgotPasswordLink={false}
                      />
                    }
                  />

                  {/* <Route
                    path="/register"
                    element={
                      <AuthPage
                        type="register"
                        formProps={{
                          initialValues: {
                            email: "",
                            password: "",
                          },
                        }}
                      />
                    }
                  />
                  <Route path="/forgot-password" element={<AuthPage type="forgotPassword" />} />
                  <Route path="/update-password" element={<AuthPage type="updatePassword" />} /> */}
                </Route>
              </Routes>

              <UnsavedChangesNotifier />
              <DocumentTitleHandler handler={customTitleHandler} />
              <RefineKbar />
            </Refine>
          </RefineKbarProvider>
        </AntdApp>
      </ConfigProvider>
    </BrowserRouter>
  );
};

export default App;
