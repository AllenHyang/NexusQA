import { NextResponse } from "next/server";
import { APP_VERSION, GITHUB_API_URL, compareVersions, VersionInfo } from "@/lib/version";

export async function GET() {
  try {
    // Fetch latest release from GitHub
    const response = await fetch(GITHUB_API_URL, {
      headers: {
        Accept: "application/vnd.github.v3+json",
        // Add User-Agent header as required by GitHub API
        "User-Agent": "NexusQA-App",
      },
      // Cache for 1 hour
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      // If no releases found or API error, return current version only
      const versionInfo: VersionInfo = {
        current: APP_VERSION,
        latest: null,
        hasUpdate: false,
        releaseUrl: null,
        releaseName: null,
        publishedAt: null,
      };
      return NextResponse.json(versionInfo);
    }

    const release = await response.json();
    const latestVersion = release.tag_name?.replace(/^v/, "") || null;
    const hasUpdate = latestVersion ? compareVersions(APP_VERSION, latestVersion) < 0 : false;

    const versionInfo: VersionInfo = {
      current: APP_VERSION,
      latest: latestVersion,
      hasUpdate,
      releaseUrl: release.html_url || null,
      releaseName: release.name || null,
      publishedAt: release.published_at || null,
    };

    return NextResponse.json(versionInfo);
  } catch (error) {
    console.error("Failed to check version:", error);
    // Return current version on error
    const versionInfo: VersionInfo = {
      current: APP_VERSION,
      latest: null,
      hasUpdate: false,
      releaseUrl: null,
      releaseName: null,
      publishedAt: null,
    };
    return NextResponse.json(versionInfo);
  }
}
