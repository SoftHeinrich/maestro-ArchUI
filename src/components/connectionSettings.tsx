import { getDatabaseURL } from "../routes/util";

export interface ConnectionSettings {
  databaseURL: string;
  dlManagerURL: string;
  searchEngineURL: string;
  archRagURL: string;
}

const defaultSettings: ConnectionSettings = {
  databaseURL: "https://maestro.localhost:4269/issues-db-api",
  dlManagerURL: "https://maestro.localhost:4269/dl-manager",
  searchEngineURL: "https://maestro.localhost:4269/search-engine",
  archRagURL: "https://maestro.localhost:4269/archrag",
};

export function initConnectionSettings() {
  let connectionSettings = localStorage.getItem("connectionSettings");
  if (connectionSettings === null) {
    localStorage.setItem("connectionSettings", JSON.stringify(defaultSettings));
  } else {
    try {
      let parsedSettings = JSON.parse(connectionSettings);
      let needsUpdate = false;
      for (const urlName of [
        "databaseURL",
        "dlManagerURL",
        "searchEngineURL",
        "archRagURL",
      ]) {
        if (
          !(urlName in parsedSettings) ||
          typeof parsedSettings[urlName] !== "string"
        ) {
          parsedSettings[urlName] = defaultSettings[urlName];
          needsUpdate = true;
        }
      }
      if (needsUpdate) {
        localStorage.setItem(
          "connectionSettings",
          JSON.stringify(parsedSettings)
        );
      }
    } catch (error) {
      localStorage.setItem(
        "connectionSettings",
        JSON.stringify(defaultSettings)
      );
    }
  }
}

export function getConnectionSettings(): ConnectionSettings {
  initConnectionSettings();
  let connectionSettings = localStorage.getItem("connectionSettings");
  if (connectionSettings === null) {
    return { ...defaultSettings };
  }
  return JSON.parse(connectionSettings);
}

export function getWebSocket() {
  if (getDatabaseURL().includes("https")) {
    return new WebSocket(`${getDatabaseURL().replace("https", "wss")}/ws`);
  }
  return new WebSocket(`${getDatabaseURL().replace("http", "ws")}/ws`);
}
