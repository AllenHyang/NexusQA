// Application version configuration
export const APP_VERSION = "0.1.0";

// GitHub repository info for update checks
export const GITHUB_REPO = "AllenHyang/NexusQA";
export const GITHUB_API_URL = `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`;

export interface VersionInfo {
  current: string;
  latest: string | null;
  hasUpdate: boolean;
  releaseUrl: string | null;
  releaseName: string | null;
  publishedAt: string | null;
}

// Compare semantic versions
export function compareVersions(current: string, latest: string): number {
  const currentParts = current.replace(/^v/, "").split(".").map(Number);
  const latestParts = latest.replace(/^v/, "").split(".").map(Number);

  for (let i = 0; i < Math.max(currentParts.length, latestParts.length); i++) {
    const a = currentParts[i] || 0;
    const b = latestParts[i] || 0;
    if (a < b) return -1;
    if (a > b) return 1;
  }
  return 0;
}
