import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import yaml from "js-yaml";
import { Conference } from "../types/api";

export function readYamlFile(filename: string): Conference[] {
  try {
    const filePath = join(process.cwd(), "data", "conferences", filename);
    const fileContents = readFileSync(filePath, "utf8");
    const data = yaml.load(fileContents) as Conference[];
    return data;
  } catch (error) {
    console.error(`Error reading YAML file ${filename}:`, error);
    return [];
  }
}

export async function readAllYamlFiles(): Promise<Conference[]> {
  try {
    const conferencesDir = join(process.cwd(), "data", "conferences");
    const files = readdirSync(conferencesDir, { recursive: true }).filter(
      (file) => typeof file === "string" && (file.endsWith(".yml") || file.endsWith(".yaml"))
    );

    const allConferences: Conference[] = [];
    for (const file of files) {
      const conferences = readYamlFile(file as string);
      allConferences.push(...conferences);
    }

    return allConferences;
  } catch (error) {
    console.error("Error reading YAML files:", error);
    return [];
  }
}
