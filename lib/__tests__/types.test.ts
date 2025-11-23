import { ReviewStatus } from "../types";

describe('ReviewStatus Type', () => {
  it('should define PENDING, APPROVED, and CHANGES_REQUESTED', () => {
    const allReviewStatuses: ReviewStatus[] = ["PENDING", "APPROVED", "CHANGES_REQUESTED"];
    
    allReviewStatuses.forEach(status => {
      expect(["PENDING", "APPROVED", "CHANGES_REQUESTED"]).toContain(status);
    });
  });
});