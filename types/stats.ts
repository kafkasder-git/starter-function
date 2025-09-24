// Stats types for frontend
export interface SafeStats {
  beneficiaries: {
    total: number;
    active: number;
    passive: number;
    suspended: number;
    underEvaluation: number;
    totalAidAmount: number;
    averageAidAmount: number;
    byCity: Record<string, number>;
    byPriority: Record<string, number>;
  };
  members: {
    total: number;
    active: number;
    inactive: number;
    suspended: number;
    byMembershipType: Record<string, number>;
    byCity: Record<string, number>;
    recentJoins: number;
    averageAge?: number;
  };
  donations: {
    total: number;
    count: number;
    totalAmount: number;
    averageAmount: number;
    byStatus: Record<string, number>;
    byCategory: Record<string, number>;
    byPaymentMethod: Record<string, number>;
    byType: Record<string, number>;
    monthlyTrend: { month: string; amount: number; count: number }[];
    topDonors: { name: string; amount: number; count: number }[];
  };
  aidRequests: {
    total: number;
    pending: number;
    underReview: number;
    approved: number;
    rejected: number;
    completed: number;
    totalRequestedAmount: number;
    totalApprovedAmount: number;
    byAidType: Record<string, number>;
    byUrgency: Record<string, number>;
    avgProcessingDays?: number;
  };
  campaigns: {
    total: number;
    active: number;
    completed: number;
    draft: number;
    paused: number;
    cancelled: number;
    totalGoalAmount: number;
    totalCurrentAmount: number;
    averageProgress: number;
    byCategory: Record<string, number>;
    mostSuccessful: {
      id: string;
      name: string;
      goalAmount: number;
      currentAmount: number;
      progress: number;
      category: string;
    }[];
  };
}
