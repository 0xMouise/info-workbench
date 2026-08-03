import path from "node:path";
import { fileURLToPath } from "node:url";

const moduleDir = path.dirname(fileURLToPath(import.meta.url));
export const projectDir = path.resolve(moduleDir, "..");
export const publicDir = path.join(projectDir, "public");
export const dataDir = process.env.INFO_WORKBENCH_DATA_DIR
  ? path.resolve(process.env.INFO_WORKBENCH_DATA_DIR)
  : path.join(projectDir, "data");
export const databaseFile = process.env.INFO_WORKBENCH_DB
  ? path.resolve(process.env.INFO_WORKBENCH_DB)
  : path.join(dataDir, "workbench.db");
