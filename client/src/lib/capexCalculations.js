// src/lib/capexCalculations.js
//
// The heart of the app: takes the user's input fields and returns
// all the computed billing fields, matching the Valor Capex Excel.

/**
 * @param {Object} input - the fields the user enters
 * @returns {Object} the computed fields
 */
export function calculateCapex(input) {
  // --- Read inputs, forcing them to numbers so math is safe ---
  const unitCost         = Number(input.unitCost);
  const qty              = Number(input.qty);
  const assetLife        = Number(input.assetLife);        // months
  const intOnCapexAnnual = Number(input.intOnCapexAnnual); // e.g. 0.24
  const contingentPct    = Number(input.contingentPct || 0);
  const managementFeePct = Number(input.managementFeePct || 0);
  const maintenanceRate  = Number(input.maintenanceRate || 0); // 0.005 or 0.01, or 0

  const startDate    = new Date(input.startDate);
  const billingMonth = new Date(input.billingMonth);

  // --- 1. Monthly interest = annual / 12 ---
  const intOnCapexMonthly = intOnCapexAnnual / 12;

  // --- 2. Investment value = unit cost * qty ---
  const investmentValue = unitCost * qty;

  // --- 3. Used life = (billingMonth - startDate) in days / 30.5 -> months ---
  const millisPerDay = 1000 * 60 * 60 * 24;
  const daysDiff = (billingMonth - startDate) / millisPerDay;
  const usedLife = daysDiff / 30.5;

  // --- 4. Amortisation per month = investment / asset life ---
  //     guard against divide-by-zero
  const amortPerMonth = assetLife > 0 ? investmentValue / assetLife : 0;

  // --- 5. Standard billing = amort + (investment * monthly interest) ---
  const capexBillingStd = amortPerMonth + (investmentValue * intOnCapexMonthly);

  // --- 6. Reducing billing = amort + ((investment - amort*usedLife) * monthly interest) ---
  const capexBillingRed =
    amortPerMonth + ((investmentValue - amortPerMonth * usedLife) * intOnCapexMonthly);

  // --- 7. Maintenance = investment * rate (0.5% or 1%) ---
  const maintenance = investmentValue * maintenanceRate;

  // --- 8. Aggregate cost = amort + maintenance ---
  const aggregateCost = amortPerMonth + maintenance;

  // --- 9. Contingency cost = aggregate * contingent % ---
  const contingencyCost = aggregateCost * contingentPct;

  // --- 10. Management fee INR = standard billing * management fee % ---
  const managementFeeInr = capexBillingStd * managementFeePct;

  // --- 11. Total bill = standard billing + management fee INR ---
  const totalBill = capexBillingStd + managementFeeInr;

  // Return everything, rounded to 4 decimals to keep it clean
  const round = (n) => Math.round(n * 10000) / 10000;

  return {
    intOnCapexMonthly: round(intOnCapexMonthly),
    investmentValue:   round(investmentValue),
    usedLife:          round(usedLife),
    amortPerMonth:     round(amortPerMonth),
    capexBillingStd:   round(capexBillingStd),
    capexBillingRed:   round(capexBillingRed),
    maintenance:       round(maintenance),
    aggregateCost:     round(aggregateCost),
    contingencyCost:   round(contingencyCost),
    managementFeeInr:  round(managementFeeInr),
    totalBill:         round(totalBill),
  };
}