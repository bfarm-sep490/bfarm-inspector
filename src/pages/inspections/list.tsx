/* eslint-disable prettier/prettier */
import {
  InspectionListCard,
  InspectionListTable,
} from "@/components/inspection";
import { AppstoreOutlined, UnorderedListOutlined } from "@ant-design/icons";
import { List } from "@refinedev/antd";
import { useNavigation, useTranslate } from "@refinedev/core";
import { Segmented } from "antd";
import { type PropsWithChildren, useState } from "react";
import { Outlet, useLocation } from "react-router";

type View = "table" | "card";

export const InspectionsList = ({ children }: PropsWithChildren) => {
  const { replace } = useNavigation();
  const { pathname } = useLocation();

  const [view, setView] = useState<View>(
    (localStorage.getItem("inspector-view") as View) || "table"
  );

  const handleViewChange = (value: View) => {
    replace("");
    setView(value);
    localStorage.setItem("inspector-view", value);
  };
  const t = useTranslate();

  return (
    <List
      breadcrumb={false}
      title={t("inspections.name")}
      headerButtons={() => [
        <Segmented<View>
          key="view"
          size="large"
          value={view}
          style={{ marginRight: 24 }}
          options={[
            {
              label: "",
              value: "table",
              icon: <UnorderedListOutlined />,
            },
            {
              label: "",
              value: "card",
              icon: <AppstoreOutlined />,
            },
          ]}
          onChange={handleViewChange}
        />,
      ]}
    >
      {view === "table" && <InspectionListTable />}
      {view === "card" && <InspectionListCard />}
      {children}
      <Outlet />
    </List>
  );
};
