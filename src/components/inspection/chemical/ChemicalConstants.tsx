import { IInspectingResult } from "@/interfaces";
import { Typography, Tag, Space, Divider, Flex } from "antd";

export const LIMITS: Record<string, number> = {
  arsen: 1,
  plumbum: 0.3,
  cadmi: 0.05,
  hydragyrum: 0.01,
  glyphosate_glufosinate: 0.01,
  sulfur_dioxide: 10,
  methyl_bromide: 0.01,
  hydrogen_phosphide: 0.05,
  dithiocarbamate: 1.0,
  nitrat: 9,
  nano3_kno3: 15,
  chlorate: 0.01,
  perchlorate: 0.01,
  salmonella: 0,
  ecoli: 100,
  coliforms: 10,
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

export const chemicalGroups: ChemicalCategory[] = [
  {
    title: "Kim loại nặng",
    keys: ["arsen", "plumbum", "cadmi", "hydragyrum"],
    color: "#722ed1 ",
  },
  {
    title: "Vi sinh vật gây bệnh",
    keys: ["salmonella", "coliforms", "ecoli"],
    color: "#1890ff",
  },
  {
    title: "Thuốc trừ sâu & tồn dư BVTV",
    keys: ["glyphosate_glufosinate", "dithiocarbamate", "chlorate", "perchlorate"],
    color: "#52c41a",
  },
  {
    title: "Chất xông hơi & bảo quản",
    keys: ["sulfur_dioxide", "methyl_bromide", "hydrogen_phosphide"],
    color: "#fa8c16",
  },
  {
    title: "Hóa chất nông nghiệp",
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
      value: inspectionResult.arsen,
      limit: LIMITS["arsen"],
    },
    {
      key: "plumbum",
      label: `Plumbum`,
      unit: UNITS["plumbum"],
      value: inspectionResult.plumbum,
      limit: LIMITS["plumbum"],
    },
    {
      key: "cadmi",
      label: `Cadmium`,
      unit: UNITS["cadmi"],
      value: inspectionResult.cadmi,
      limit: LIMITS["cadmi"],
    },
    {
      key: "hydragyrum",
      label: `Thủy ngân`,
      unit: UNITS["hydragyrum"],
      value: inspectionResult.hydrargyrum,
      limit: LIMITS["hydragyrum"],
    },
    {
      key: "salmonella",
      label: `Salmonella`,
      unit: UNITS["salmonella"],
      value: inspectionResult.salmonella,
      limit: LIMITS["salmonella"],
    },
    {
      key: "coliforms",
      label: `Coliforms`,
      unit: UNITS["coliforms"],
      value: inspectionResult.coliforms,
      limit: LIMITS["coliforms"],
    },
    {
      key: "ecoli",
      label: `E. Coli`,
      unit: UNITS["ecoli"],
      value: inspectionResult.ecoli,
      limit: LIMITS["ecoli"],
    },
    {
      key: "glyphosate_glufosinate",
      label: `Glyphosate/Glufosinate`,
      unit: UNITS["glyphosate_glufosinate"],
      value: inspectionResult.glyphosate_glufosinate,
      limit: LIMITS["glyphosate_glufosinate"],
    },
    {
      key: "sulfur_dioxide",
      label: `Sulfur Dioxide`,
      unit: UNITS["sulfur_dioxide"],
      value: inspectionResult.sulfur_dioxide,
      limit: LIMITS["sulfur_dioxide"],
    },
    {
      key: "methyl_bromide",
      label: `Methyl Bromide`,
      unit: UNITS["methyl_bromide"],
      value: inspectionResult.methyl_bromide,
      limit: LIMITS["methyl_bromide"],
    },
    {
      key: "hydrogen_phosphide",
      label: `Hydrogen Phosphide`,
      unit: UNITS["hydrogen_phosphide"],
      value: inspectionResult.hydrogen_phosphide,
      limit: LIMITS["hydrogen_phosphide"],
    },
    {
      key: "dithiocarbamate",
      label: `Dithiocarbamate`,
      unit: UNITS["dithiocarbamate"],
      value: inspectionResult.dithiocarbamate,
      limit: LIMITS["dithiocarbamate"],
    },
    {
      key: "nitrat",
      label: `Nitrat`,
      unit: UNITS["nitrat"],
      value: inspectionResult.nitrat,
      limit: LIMITS["nitrat"],
    },
    {
      key: "nano3_kno3",
      label: `NaNO3/KNO3`,
      unit: UNITS["nano3_kno3"],
      value: inspectionResult.nano3_kno3,
      limit: LIMITS["nano3_kno3"],
    },
    {
      key: "chlorate",
      label: `Chlorate`,
      unit: UNITS["chlorate"],
      value: inspectionResult.chlorate,
      limit: LIMITS["chlorate"],
    },
    {
      key: "perchlorate",
      label: `Perchlorate`,
      unit: UNITS["perchlorate"],
      value: inspectionResult.perchlorate,
      limit: LIMITS["perchlorate"],
    },
  ];

  return chemicalData;
};

export const ChemicalDataDisplay: React.FC<{ inspectionResult?: IInspectingResult }> = ({
  inspectionResult,
}) => {
  const chemicalData = getChemicalData(inspectionResult);

  return (
    <Space direction="vertical" size="middle" style={{ width: "100%" }}>
      {chemicalGroups.map((group) => {
        const groupData = chemicalData.filter((item) => group.keys.includes(item.key));
        if (groupData.length === 0) return null;

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
                      {item.value} {item.unit}
                    </Typography.Text>
                    <Tag color={isExceed ? "red" : "green"}>{isExceed ? "Vượt mức" : "Đạt"}</Tag>
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
