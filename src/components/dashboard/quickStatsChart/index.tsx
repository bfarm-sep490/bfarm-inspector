/* eslint-disable prettier/prettier */
import { Column, type ColumnConfig } from "@ant-design/plots";
import { useTranslate } from "@refinedev/core";
import dayjs from "dayjs";
import { Suspense } from "react";

import { useConfigProvider } from "../../../context";

type TooltipDatum = {
  state:
    | "activeSeasons"
    | "cultivatedArea"
    | "estimatedYield"
    | "qualityInspections"
    | string;
  value: number;
};

type Props = {
  data: ColumnConfig["data"];
  height: number;
};

export const QuickStatsChart = ({ data, height }: Props) => {
  const { mode } = useConfigProvider();
  const t = useTranslate();

  const config: ColumnConfig = {
    data,
    xField: "timeText",
    yField: "value",
    seriesField: "state",
    animation: true,
    legend: false,
    theme: mode,
    columnStyle: {
      radius: [4, 4, 0, 0],
      fill:
        mode === "dark"
          ? "l(270) 0:#122849 1:#3C88E5"
          : "l(270) 0:#BAE0FF 1:#1677FF",
    },
    tooltip: {
      formatter: (datum: TooltipDatum) => {
        let tooltipLabel = "";

        switch (datum.state) {
          case "activeSeasons":
            tooltipLabel = t("dashboard.quickStats.activeSeasons");
            break;
          case "cultivatedArea":
            tooltipLabel = t("dashboard.quickStats.cultivatedArea");
            break;
          case "estimatedYield":
            tooltipLabel = t("dashboard.quickStats.estimatedYield");
            break;
          case "qualityInspections":
            tooltipLabel = t("dashboard.quickStats.qualityInspections");
            break;
          default:
            tooltipLabel = t("dashboard.quickStats.value");
        }

        return {
          name: tooltipLabel,
          value: new Intl.NumberFormat().format(datum.value),
        };
      },
    },
    xAxis: {
      line: {
        style: {
          fill: mode === "dark" ? "#262626" : "#D9D9D9",
        },
      },
      label: {
        formatter: (v: string | number | dayjs.Dayjs | null | undefined) => {
          if (data.length > 7) {
            return dayjs(v).format("MM/DD");
          }

          return dayjs(v).format("ddd");
        },
      },
    },
    yAxis: {
      label: {
        formatter: (v: number | string) => {
          return new Intl.NumberFormat().format(Number(v));
        },
      },
    },
  };

  return (
    <Suspense>
      <Column {...config} height={height} />
    </Suspense>
  );
};
