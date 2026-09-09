import { ParsedFinancialData } from './dataParser.js';

export interface ScoreFactor {
  name: string;
  impact: 'positive' | 'negative' | 'neutral';
  description: string;
}

export interface CreditScoreResult {
  score: number; // 300 - 850
  scoreBand: 'ELIGIBLE' | 'NEEDS_REVIEW' | 'INELIGIBLE';
  confidence: number; // 0.0 - 1.0
  policyVersion: string;
  minEligibilityThreshold: number;
  isEligible: boolean;
  factors: ScoreFactor[];
  summary: {
    monthlyIncomeEstimate: number;
    monthlySavingsEstimate: number;
    debtToIncomeRatioPercent: number;
    dataQualityPercent: number;
  };
}

export class ScoringEngine {
  private static POLICY_VERSION = 'ZK-SENTINEL-v1.0';
  private static DEFAULT_THRESHOLD = 700;

  /**
   * Deterministic financial scoring model.
   */
  public static calculateScore(
    financialData: ParsedFinancialData,
    minThreshold: number = this.DEFAULT_THRESHOLD
  ): CreditScoreResult {
    let baseScore = 550; // Dynamic baseline
    const factors: ScoreFactor[] = [];

    // Factor 1: Income Stream & Depth (0 to +78 pts)
    const income = financialData.totalIncome || 0;
    let incomePoints = 0;
    if (income > 0) {
      incomePoints = Math.min(78, Math.round(Math.log10(income + 1) * 16));
      factors.push({
        name: 'Verified Income Stream',
        impact: 'positive',
        description: `Positive income pattern detected ($${income.toLocaleString()} total verified income).`,
      });
    } else {
      incomePoints = -40;
      factors.push({
        name: 'Unverified Income Signal',
        impact: 'negative',
        description: 'No explicit income transactions detected in uploaded records.',
      });
    }

    // Factor 2: Net Cashflow & Savings Margin (-50 to +80 pts)
    const netCashflow = financialData.netCashflow || 0;
    let cashflowPoints = 0;
    if (netCashflow > 0 && income > 0) {
      const savingsRate = netCashflow / income;
      cashflowPoints = Math.min(80, Math.round(savingsRate * 90));
      factors.push({
        name: 'Positive Savings Rate',
        impact: 'positive',
        description: `Net positive cashflow ($${netCashflow.toLocaleString()} net savings, ${Math.round(savingsRate * 100)}% savings rate).`,
      });
    } else if (netCashflow < 0) {
      cashflowPoints = -50;
      factors.push({
        name: 'Negative Cashflow Rate',
        impact: 'negative',
        description: `Expenses exceed income by $${Math.abs(netCashflow).toLocaleString()}.`,
      });
    }

    // Factor 3: Transaction Volume & Activity History (0 to +50 pts)
    const recordCount = financialData.recordCount || 0;
    const activityPoints = Math.min(50, Math.round(Math.sqrt(recordCount) * 5.5));
    if (recordCount >= 10) {
      factors.push({
        name: 'Consistent Financial Activity',
        impact: 'positive',
        description: `Substantial history with ${recordCount} verified transaction records.`,
      });
    } else {
      factors.push({
        name: 'Short Activity History',
        impact: 'neutral',
        description: `Initial assessment based on ${recordCount} records.`,
      });
    }

    // Factor 4: Data Quality & Completeness (0 to +45 pts)
    const qualityScore = financialData.dataQualityScore || 80;
    const qualityPoints = Math.round((qualityScore / 100) * 45);
    factors.push({
      name: 'Data Quality Rating',
      impact: qualityScore >= 80 ? 'positive' : 'negative',
      description: `Dataset contains verified records with ${qualityScore}% data completeness.`,
    });

    // Fine-tune Granular Hash Adjustment (-8 to +8 pts)
    const fineTune = ((income + Math.abs(netCashflow) * 3 + recordCount * 7) % 17) - 8;

    const rawTotal = baseScore + incomePoints + cashflowPoints + activityPoints + qualityPoints + fineTune;
    const finalScore = Math.min(850, Math.max(300, rawTotal));
    const isEligible = finalScore >= minThreshold;

    let scoreBand: 'ELIGIBLE' | 'NEEDS_REVIEW' | 'INELIGIBLE' = 'INELIGIBLE';
    if (finalScore >= minThreshold) {
      scoreBand = 'ELIGIBLE';
    } else if (finalScore >= minThreshold - 50) {
      scoreBand = 'NEEDS_REVIEW';
    }

    const confidence = Math.min(0.98, Math.max(0.70, (financialData.dataQualityScore / 100) * 0.95));

    return {
      score: finalScore,
      scoreBand,
      confidence: parseFloat(confidence.toFixed(2)),
      policyVersion: this.POLICY_VERSION,
      minEligibilityThreshold: minThreshold,
      isEligible,
      factors,
      summary: {
        monthlyIncomeEstimate: financialData.totalIncome,
        monthlySavingsEstimate: financialData.averageMonthlySavings,
        debtToIncomeRatioPercent: financialData.totalIncome > 0
          ? Math.round((financialData.totalExpenses / financialData.totalIncome) * 100)
          : 0,
        dataQualityPercent: financialData.dataQualityScore,
      },
    };
  }
}
