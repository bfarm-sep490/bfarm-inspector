import { InspectionListCard, InspectionListTable } from "@/components/inspection";
import { AppstoreOutlined, UnorderedListOutlined } from "@ant-design/icons";
import { List } from "@refinedev/antd";
import { useNavigation } from "@refinedev/core";
import { Segmented } from "antd";
import { type PropsWithChildren, useState } from "react";
import { Outlet, useLocation } from "react-router";

type View = "table" | "card";

export const InspectionsList = ({ children }: PropsWithChildren) => {
  const { replace } = useNavigation();
  const { pathname } = useLocation();

  const [view, setView] = useState<View>(
    (localStorage.getItem("inspector-view") as View) || "table",
  );

  const handleViewChange = (value: View) => {
    // remove query params (pagination, filters, etc.) when changing view
    replace("");
    setView(value);
    localStorage.setItem("inspector-view", value);
  };

  return (
    <List
      breadcrumb={false}
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
