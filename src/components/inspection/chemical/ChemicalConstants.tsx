import { IInspectingResult } from "@/interfaces";
import { Typography, Tag, Space, Divider, Flex } from "antd";
interface ChemicalData {
  key: string;
  label: string;
  unit: string;
  value: number;
  limit: number;
}
export const mustBeZeroKeys = ["hydrogen_phosphide", "salmonella", "sulfur_dioxide"];

export const getMustBeZeroKeys = (): string[] => mustBeZeroKeys;
export const LIMITS: Record<string, number> = {
  arsen: 1,
  plumbum: 0.3,
  cadmi: 0.05,
  hydrargyrum: 0.03,
  glyphosate_glufosinate: 0.01,
  sulfur_dioxide: 10,
  methyl_bromide: 0,
  hydrogen_phosphide: 0,
  dithiocarbamate: 2.0,
  nitrat: 9,
  nano3_kno3: 15,
  chlorate: 0.01,
  perchlorate: 0.01,
  salmonella: 0,
  ecoli: 100,
  coliforms: 100,
};

export const UNITS: Record<string, string> = {
  arsen: "mg/kg",
  plumbum: "mg/kg",
  cadmi: "mg/kg",
  hydragyrum: "mg/kg",
  glyphosate_glufosinate: "mg/kg",
  sulfur_dioxide: "mg/kg",
  methyl_bromide: "mg/kg",
  hydrogen_phosphide: "mg/kg",
  dithiocarbamate: "mg/kg",
  nitrat: "mg/kg",
  nano3_kno3: "mg/kg",
  chlorate: "mg/kg",
  perchlorate: "mg/kg",
  salmonella: "CFU/25g",
  ecoli: "CFU/g",
  coliforms: "CFU/g",
};

export type ChemicalCategory = {
  title: string;
  keys: string[];
  color: string;
};
export interface Contaminant {
  key: string;
  name: string;
  value: string;
  standard?: string;
}

export const initialContaminants: Contaminant[] = [
  { key: "arsen", name: "Arsen", value: "< 0.5 mg/kg", standard: "Max" },
  { key: "plumbum", name: "Plumbum", value: "< 0.3 mg/kg", standard: "Max" },
  { key: "cadmi", name: "Cadmium", value: "< 0.05 mg/kg", standard: "Max" },
  {
    key: "hydrargyrum",
    name: "Thủy ngân",
    value: "< 0.03 mg/kg",
    standard: "Max",
  },
  {
    key: "salmonella",
    name: "Salmonella",
    value: "< 0 CFU/25g",
    standard: "Max",
  },
  {
    key: "coliforms",
    name: "Coliforms",
    value: "< 100 CFU/g",
    standard: "Max",
  },
  {
    key: "ecoli",
    name: "E.coli",
    value: "< 100 CFU/g",
    standard: "Max",
  },
  {
    key: "glyphosate_glufosinate",
    name: "Glyphosate, Glufosinate",
    value: "< 0.01 mg/kg",
    standard: "Max",
  },
  {
    key: "sulfur_dioxide",
    name: "Sulfur Dioxide",
    value: "< 10 mg/kg",
    standard: "Max",
  },
  {
    key: "methyl_bromide",
    name: "Methyl Bromide",
    value: "< 0 mg/kg",
    standard: "Max",
  },
  {
    key: "hydrogen_phosphide",
    name: "Hydrogen Phosphide",
    value: "< 0 mg/kg",
    standard: "Max",
  },
  {
    key: "dithiocarbamate",
    name: "Dithiocarbamate",
    value: "< 2.0 mg/kg",
    standard: "Max",
  },
  { key: "nitrat", name: "Nitrat", value: "< 9 mg/kg", standard: "Max" },
  {
    key: "nano3_kno3",
    name: "NaNO3/KNO3",
    value: "< 15 mg/kg",
    standard: "Max",
  },
  { key: "chlorate", name: "Chlorate", value: "< 0.01 mg/kg", standard: "Max" },
  {
    key: "perchlorate",
    name: "Perchlorate",
    value: "< 0.01 mg/kg",
    standard: "Max",
  },
];

export const chemicalGroups: ChemicalCategory[] = [
  {
    title: "chemicalGroups.heavyMetals",
    keys: ["arsen", "plumbum", "cadmi", "hydrargyrum"],
    color: "#722ed1",
  },
  {
    title: "chemicalGroups.pathogens",
    keys: ["salmonella", "coliforms", "ecoli"],
    color: "#1890ff",
  },
  {
    title: "chemicalGroups.pesticides",
    keys: ["glyphosate_glufosinate", "dithiocarbamate", "chlorate", "perchlorate"],
    color: "#52c41a",
  },
  {
    title: "chemicalGroups.fumigants",
    keys: ["sulfur_dioxide", "methyl_bromide", "hydrogen_phosphide"],
    color: "#fa8c16",
  },
  {
    title: "chemicalGroups.agrochemicals",
    keys: ["nitrat", "nano3_kno3"],
    color: "#722ed1",
  },
];

export const getChemicalData = (inspectionResult?: IInspectingResult) => {
  if (!inspectionResult) return [];

  const chemicalData = [
    {
      key: "arsen",
      label: `Arsen`,
      unit: UNITS["arsen"],
      value: inspectionResult.arsen ?? 0,
      limit: LIMITS["arsen"],
    },
    {
      key: "plumbum",
      label: `Plumbum`,
      unit: UNITS["plumbum"],
      value: inspectionResult.plumbum ?? 0,
      limit: LIMITS["plumbum"],
    },
    {
      key: "cadmi",
      label: `Cadmium`,
      unit: UNITS["cadmi"],
      value: inspectionResult.cadmi ?? 0,
      limit: LIMITS["cadmi"],
    },
    {
      key: "hydrargyrum",
      label: `Thủy ngân`,
      unit: UNITS["hydrargyrum"],
      value: inspectionResult.hydrargyrum ?? 0,
      limit: LIMITS["hydrargyrum"],
    },
    {
      key: "salmonella",
      label: `Salmonella`,
      unit: UNITS["salmonella"],
      value: inspectionResult.salmonella ?? 0,
      limit: LIMITS["salmonella"],
    },
    {
      key: "coliforms",
      label: `Coliforms`,
      unit: UNITS["coliforms"],
      value: inspectionResult.coliforms ?? 0,
      limit: LIMITS["coliforms"],
    },
    {
      key: "ecoli",
      label: `E. Coli`,
      unit: UNITS["ecoli"],
      value: inspectionResult.ecoli ?? 0,
      limit: LIMITS["ecoli"],
    },
    {
      key: "glyphosate_glufosinate",
      label: `Glyphosate/Glufosinate`,
      unit: UNITS["glyphosate_glufosinate"],
      value: inspectionResult.glyphosate_glufosinate ?? 0,
      limit: LIMITS["glyphosate_glufosinate"],
    },
    {
      key: "sulfur_dioxide",
      label: `Sulfur Dioxide`,
      unit: UNITS["sulfur_dioxide"],
      value: inspectionResult.sulfur_dioxide ?? 0,
      limit: LIMITS["sulfur_dioxide"],
    },
    {
      key: "methyl_bromide",
      label: `Methyl Bromide`,
      unit: UNITS["methyl_bromide"],
      value: inspectionResult.methyl_bromide ?? 0,
      limit: LIMITS["methyl_bromide"],
    },
    {
      key: "hydrogen_phosphide",
      label: `Hydrogen Phosphide`,
      unit: UNITS["hydrogen_phosphide"],
      value: inspectionResult.hydrogen_phosphide ?? 0,
      limit: LIMITS["hydrogen_phosphide"],
    },
    {
      key: "dithiocarbamate",
      label: `Dithiocarbamate`,
      unit: UNITS["dithiocarbamate"],
      value: inspectionResult.dithiocarbamate ?? 0,
      limit: LIMITS["dithiocarbamate"],
    },
    {
      key: "nitrat",
      label: `Nitrat`,
      unit: UNITS["nitrat"],
      value: inspectionResult.nitrat ?? 0,
      limit: LIMITS["nitrat"],
    },
    {
      key: "nano3_kno3",
      label: `NaNO3/KNO3`,
      unit: UNITS["nano3_kno3"],
      value: inspectionResult.nano3_kno3 ?? 0,
      limit: LIMITS["nano3_kno3"],
    },
    {
      key: "chlorate",
      label: `Chlorate`,
      unit: UNITS["chlorate"],
      value: inspectionResult.chlorate ?? 0,
      limit: LIMITS["chlorate"],
    },
    {
      key: "perchlorate",
      label: `Perchlorate`,
      unit: UNITS["perchlorate"],
      value: inspectionResult.perchlorate ?? 0,
      limit: LIMITS["perchlorate"],
    },
  ];

  return chemicalData;
};

export const ChemicalDataDisplay: React.FC<{
  inspectionResult?: IInspectingResult;
}> = ({ inspectionResult }) => {
  const chemicalData = getChemicalData(inspectionResult);
  const chemicalDataMap = chemicalData.reduce(
    (map, item) => {
      map[item.key] = item;
      return map;
    },
    {} as Record<string, ChemicalData>,
  );

  return (
    <Space direction="vertical" size="middle" style={{ width: "100%" }}>
      {chemicalGroups.map((group) => {
        const groupData = group.keys.map((key) => {
          const data = chemicalDataMap[key];
          return (
            data || {
              key,
              label: key.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()),
              unit: UNITS[key] || "",
              value: 0,
              limit: LIMITS[key] || 0,
            }
          );
        });

        return (
          <div key={group.title}>
            <Typography.Text strong style={{ color: group.color, fontSize: 16 }}>
              {group.title}
            </Typography.Text>
            <Divider style={{ margin: "8px 0" }} />
            {groupData.map((item) => {
              const isExceed = item.limit !== undefined && item.value > item.limit;
              return (
                <Flex
                  key={item.key}
                  justify="space-between"
                  align="center"
                  style={{ padding: "8px 0" }}
                >
                  <Typography.Text>{item.label}</Typography.Text>
                  <Space>
                    <Typography.Text>
                      {item.value === 0 && !chemicalDataMap[item.key]
                        ? "N/A"
                        : `${item.value} ${item.unit}`}
                    </Typography.Text>
                    <Tag color={isExceed ? "red" : "green"}>
                      {item.value === 0 && !chemicalDataMap[item.key]
                        ? "Chưa có dữ liệu"
                        : isExceed
                          ? "Vượt mức"
                          : "Đạt"}
                    </Tag>
                  </Space>
                </Flex>
              );
            })}
          </div>
        );
      })}
    </Space>
  );
};
