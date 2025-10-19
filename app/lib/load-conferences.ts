import { readdirSync, readFileSync } from "fs";
import { join } from "path";
import yaml from "js-yaml";
import { Conference, ConferenceType, CustomConferenceType } from "../types/api";

const conferenceDataRoot = join(process.cwd(), "data");
// This data root is the ccfddl/ccf-deadlines repo,
// which we rely on for the most CCF conferences.
const ccfddlDataRoot = join(conferenceDataRoot, "ccf-deadlines/conference");
// This data root is the custom conference data directory,
// which we use to store our own conference data that are not in the ccf-deadlines repo.
const customDataRoot = join(conferenceDataRoot, "conferences");

export function readYamlFile(filepath: string): Conference[] {
  try {
    const fileContents = readFileSync(filepath, "utf8");
    return yaml.load(fileContents) as Conference[];
  } catch (error) {
    console.error(`Error reading YAML file ${filepath}:`, error);
    return [];
  }
}

export async function readAllConferenceYamlFiles(): Promise<Conference[]> {
  try {
    const files = [customDataRoot, ccfddlDataRoot].flatMap((dir) => {
      return readdirSync(dir, { recursive: true })
        .map((file) => file.toString())
        .filter((file) => {
          // Exclude specific files that are not conference data
          return (
            file !== "types.yml" &&
            (file.endsWith(".yml") || file.endsWith(".yaml"))
          );
        })
        .map((file) => join(dir, file.toString()));
    });

    const allConferences: Conference[] = [];
    const allConferenceNames = new Set<string>();
    for (const file of files) {
      // Skip if the file with identical filename has already been added, in which case,
      //   our customized conference data will override the one from ccf-deadlines repo
      const filename = file.split("/").pop() || "";
      if (allConferenceNames.has(filename)) {
        continue;
      }
      allConferenceNames.add(filename);

      const conferences = readYamlFile(file as string);
      const subpath = file.replace(conferenceDataRoot, "").substring(1);
      allConferences.push(
        ...conferences.map((conference) => ({
          ...conference,
          github_ccfddl_subpath: subpath,
        }))
      );
    }

    return allConferences;
  } catch (error) {
    console.error("Error reading YAML files:", error);
    return [];
  }
}

export async function readTypesYamlFile(): Promise<ConferenceType[]> {
  try {
    const filePath = join(ccfddlDataRoot, "types.yml");
    const fileContents = readFileSync(filePath, "utf8");
    return yaml.load(fileContents) as ConferenceType[];
  } catch (error) {
    console.error("Error reading YAML file types.yml:", error);
    return [];
  }
}

export async function readCustomTypesYamlFile(): Promise<
  CustomConferenceType[]
> {
  try {
    const filePath = join(customDataRoot, "types.yml");
    const fileContents = readFileSync(filePath, "utf8");
    return yaml.load(fileContents) as CustomConferenceType[];
  } catch (error) {
    console.error("Error reading YAML file custom-types.yml:", error);
    return [];
  }
}
