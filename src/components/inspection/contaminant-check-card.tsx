"use client";

import { Card, Tag, Typography } from "antd";
import {
  getChemicalData,
  chemicalGroups,
  LIMITS,
} from "@/components/inspection/chemical/ChemicalConstants";

import { IInspectingResult } from "@/interfaces";

type Props = {
  result?: IInspectingResult;
};

export const ContaminantCheckCard = ({ result }: Props) => {
  const data = getChemicalData(result);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {chemicalGroups.map((group) => (
        <Card key={group.title} title={group.title} variant="outlined">
          {group.keys.map((key) => {
            const item = data.find((d) => d.key === key);
            if (!item) return null;

            const isExceed = LIMITS[key] !== undefined && item.value > LIMITS[key];

            return (
              <div key={key} className="flex justify-between py-1">
                <Typography.Text>{item.label}</Typography.Text>
                <Tag color={isExceed ? "red" : "green"}>{item.value}</Tag>
              </div>
            );
          })}
        </Card>
      ))}
    </div>
  );
};
