export interface TrackerInterface {
  validateId(id: string): boolean;
  generateUrl(id: string): string;
  getTrackerName(): string;
}

export class JiraAdapter implements TrackerInterface {
  private baseUrl: string;
  private projectKeyPattern: RegExp;

  constructor(baseUrl: string, projectKeyPattern: RegExp = /^[A-Z]+-\d+$/) {
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    this.projectKeyPattern = projectKeyPattern;
  }

  validateId(id: string): boolean {
    return this.projectKeyPattern.test(id);
  }

  generateUrl(id: string): string {
    return `${this.baseUrl}/browse/${id}`;
  }

  getTrackerName(): string {
    return "Jira";
  }
}

export class GenericAdapter implements TrackerInterface {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  }

  validateId(id: string): boolean {
    return id.length > 0;
  }

  generateUrl(id: string): string {
    // Assumes generic tracker uses /issues/id pattern, can be customized
    return `${this.baseUrl}/issues/${id}`;
  }

  getTrackerName(): string {
    return "Generic";
  }
}
