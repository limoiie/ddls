import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import yaml from "js-yaml";
import { Conference, ConferenceType, CustomConferenceType } from "../types/api";

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

export async function readAllConferenceYamlFiles(): Promise<Conference[]> {
  try {
    const conferencesDir = join(process.cwd(), "data", "conferences");
    const files = readdirSync(conferencesDir, { recursive: true }).filter(
      (file) =>
        typeof file === "string" &&
        file !== "types.yml" &&
        file !== "custom-types.yml" &&
        (file.endsWith(".yml") || file.endsWith(".yaml"))
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

export async function readTypesYamlFile(): Promise<ConferenceType[]> {
  try {
    const filePath = join(process.cwd(), "data", "conferences", "types.yml");
    const fileContents = readFileSync(filePath, "utf8");
    const data = yaml.load(fileContents) as ConferenceType[];
    return data;
  } catch (error) {
    console.error("Error reading YAML file types.yml:", error);
    return [];
  }
}

export async function readCustomTypesYamlFile(): Promise<
  CustomConferenceType[]
> {
  try {
    const filePath = join(
      process.cwd(),
      "data",
      "conferences",
      "custom-types.yml"
    );
    const fileContents = readFileSync(filePath, "utf8");
    const data = yaml.load(fileContents) as CustomConferenceType[];
    return data;
  } catch (error) {
    console.error("Error reading YAML file custom-types.yml:", error);
    return [];
  }
}
