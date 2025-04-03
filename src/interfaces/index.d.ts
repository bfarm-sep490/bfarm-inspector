/* eslint-disable prettier/prettier */
import type { Dayjs } from "dayjs";

export interface IIdentity {
  id: number;
  name: string;
  avatar: string;
}

export interface IQuickStatsEntry {
  key: number;
  stat_name: string;
  value: number;
  description: string;
}

export interface ISeasonProgressEntry {
  key: number;
  timestamp: string;
  progress: number;
}
export interface IFarmerPermission {
  id: number;
  farmer_id: number;
  plan_id: number;
  is_active: boolean;
}
export interface IInspectingForm {
  id: number;
  plan_id: number;
  plan_name: string;
  inspector_id: number;
  inspector_name: string;
  task_name: string;
  task_type: string;
  description: string;
  start_date: string;
  end_date: string;
  result_content?: string;
  number_of_sample?: number | null;
  sample_weight?: number | null;
  can_harvest: boolean;
  complete_date?: string;
  status: "Draft" | "Pending" | "Ongoing" | "Completed" | "Cancel";
  created_at: string;
  created_by: string;
  updated_at?: string | null;
  updated_by?: string | null;
  evaluated_result: "Pass" | "Fail";
  inspecting_results: InspectingResult;
}
export interface IInspectingResult {
  id: number;
  arsen: number;
  plumbum: number;
  cadmi: number;
  hydrargyrum: number;
  salmonella: number;
  coliforms: number;
  ecoli: number;
  glyphosate_glufosinate: number;
  sulfur_dioxide: number;
  methyl_bromide: number;
  hydrogen_phosphide: number;
  dithiocarbamate: number;
  nitrat: number;
  nano3_kno3: number;
  chlorate: number;
  perchlorate: number;
  evaluated_result: "Pass" | "Fail";
  inspect_images: string[];
  result_content: string;
}

export interface IPlan {
  id: number;
  plant_id: number;
  plant_name: string;
  yield_id: number;
  yield_name: string;
  expert_id: number;
  expert_name: string;
  plan_name: string;
  description: string;
  start_date: string;
  end_date: string;
  complete_date?: string;
  status: "Draft" | "Pending" | "Ongoing" | "Completed" | "Cancelled";
  estimated_product: number;
  estimated_unit: string;
  qr_code: string;
  seed_quantity: number;
  created_by: string;
  created_at: string;
  updated_by?: string;
  updated_at?: string;
  plant_information?: {
    plant_id: number;
  };
  yield_information?: {
    yield_id: number;
  };
  is_approved: boolean;
}

export interface IHarvestingTask {
  id: number;
  plan_id: number;
  task_name: string;
  description: string;
  start_date: string;
  end_date: string;
  result_content?: string;
  complete_date?: string;
  quantity_harvested?: number;
  unit_harvested?: string;
  status: "Draft" | "Pending" | "Ongoing" | "Completed";
  farmer_id: number;
  created_at: string;
  updated_at: string;
  priority?: number;
}

export interface IIssue {
  id: number;
  name_issue: string;
  description: string;
  is_actived: boolean;
}

export interface ICaringTask {
  id: number;
  plan_id: number;
  problem_id?: number;
  task_name: string;
  result_content?: string;
  task_type:
    | "Planting"
    | "Nurturing"
    | "Watering"
    | "Fertilizing"
    | "PestControl";
  start_date: string;
  end_date: string;
  complete_date?: string;
  farmer_id: number;
  status: "Draft" | "Pending" | "Ongoing" | "Completed";
  created_at: string;
  updated_at: string;
  priority?: number;
}

export interface IItem {
  id: number;
  name: string;
  description: string;
  image: string;
  quantity: number;
  status: "UnActived" | "InStock" | "OutStock";
  type: "Uncountable" | "Countable";
}

export interface IAccount {
  id: number;
  email: string;
  role: "Owner" | "Farmer" | "Expert" | "Driver" | "Retailer";
  created_at: string;
  password: string;
  is_active: boolean;
}

export interface IInspector {
  id: number;
  account_id: number;
  address: string;
  name: string;
  image_url: string;
  description: string;
  status: string;
}

export interface IOrder {
  id: number;
  retailer_id: number;
  retailer_name: string;
  plant_id: number;
  plant_name: string;
  plan_id: number | null;
  plan_name: string | null;
  packaging_type_id: number;
  packaging_type_name: string;
  deposit_price: number;
  total_price: number | null;
  status: "Deposit" | "Pending" | "Ongoing" | "Completed" | "Cancelled";
  address: string;
  phone: string;
  preorder_quantity: number;
  estimate_pick_up_date: string;
  created_at: string;
  transactions: any[];
}

export interface IYield {
  id: number;
  yield_name: string;
  area_unit: string;
  area: number;
  type: string;
  description: string;
  size: string;
  status: string;
}

export interface IDevice {
  id: number;
  yield_id: number;
  device_name: string;
  device_type: string;
  location: string;
  status: "Active" | "InActive" | "Error";
  device_code: string;
  installation_date: string;
  created_at: string;
  created_by: string;
  updated_at?: string;
  updated_by?: string;
}

export interface IPlant {
  id: number;
  plant_name: string;
  quantity: number;
  description: string;
  base_price: number;
  type: string;
  image_url: string;
  delta_one: number;
  delta_two: number;
  delta_three: number;
  preservation_day: number;
  estimated_per_one: number;
  status: string;
}

export interface IOrderPlan {
  url: string;
  quantity: number;
  order_id: number;
  plan_id: number;
  unit: string;
}

export interface IProductionImage {
  image_id: number;
  task_id: number;
  url: string;
}

export interface IInspectingForm {
  id: number;
  plan_id: number;
  task_name: string;
  task_type: string;
  description: string;
  start_date: string;
  end_date: string;
  result_content?: string;
  brix_point?: number;
  temperature?: number;
  humidity?: number;
  moisture?: number;
  shell_color?: string;
  test_gt_kit_color?: string;
  inspecting_quantity: number;
  unit: string;
  priority?: number;
  issue_percent?: number;
  can_harvest: boolean;
  completed_date?: string;
  inspector_id: number;
  status: "Draft" | "Pending" | "Ongoing" | "Completed" | "Cancelled";
  created_at: string;
  updated_at: string;
}

export interface IPackagingTask {
  id: number;
  plan_id: number;
  task_name: string;
  complete_date?: string;
  packed_unit: string;
  packed_quantity: number;
  description: string;
  result_content: string;
  farmer_id: number;
  start_date: string;
  end_date: string;
  status: string;
  created_at: string;
  updated_at: string;
  priority?: number;
}

export interface IPackagingItem {
  id: number;
  task_id: number;
  item_id: number;
  quantity: number;
  unit: string;
}

export interface IProblem {
  id: number;
  issue_id?: number;
  name: string;
  description: string;
  date: string;
  type_problem: string;
  status: "Pending" | "Approved" | "Cancelled";
  result: string;
}

export interface IPesticide {
  id: number;
  name: string;
  description: string;
  image: string;
  unit: string;
  available_quantity: number;
  total_quantity: number;
  status: "UnActived" | "InStock" | "OutStock";
  type: "Insecticide" | "Fungicide" | "Herbicide" | "Other";
}

export interface IFertilizer {
  id: number;
  name: string;
  description: string;
  image: string;
  unit: string;
  available_quantity: number;
  total_quantity: number;
  status: "UnActived" | "InStock" | "OutStock";
  type: "Organic" | "Chemical" | "Mixed";
}
