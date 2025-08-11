import { readdirSync, readFileSync } from "fs";
import { join } from "path";
import yaml from "js-yaml";
import { Conference, ConferenceType, CustomConferenceType } from "../types/api";

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
    const uniqueConferenceNames = new Set<string>();
    const files =
      [
        // Read custom conference configurations from the local data directory
        join(process.cwd(), "data", "conferences"),
        // Borrow existing conference configurations from the ccf-deadlines repo
        join(process.cwd(), "data", "ccf-deadlines", "conference"),
      ].flatMap((dir) => {
          return readdirSync(dir, {recursive: true})
            .filter(
              (file) => {
                file = typeof file === "string" ? file : file.toString();

                // Exclude specific files that are not conference data
                if (file === "types.yml" || file === "custom-types.yml") {
                  return false; // Skip if the file is types.yml or custom-types.yml
                }

                // Skip if the file with identical filename has already been added, in which case,
                //   our customized conference data will override the one from ccf-deadlines repo
                const filename = file.split("/").pop() || "";
                if (uniqueConferenceNames.has(filename)) {
                  return false;
                }
                uniqueConferenceNames.add(filename);

                return (file.endsWith(".yml") || file.endsWith(".yaml"));
              }
            )
            .map((file) => join(dir, file.toString()));
        }
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
    const filePath = join(process.cwd(), "data", "ccf-deadlines", "conference", "types.yml");
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
    const filePath = join(process.cwd(), "data", "conferences", "types.yml");
    const fileContents = readFileSync(filePath, "utf8");
    return yaml.load(fileContents) as CustomConferenceType[];
  } catch (error) {
    console.error("Error reading YAML file custom-types.yml:", error);
    return [];
  }
}
