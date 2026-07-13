// src/app/api/capex/route.js
// This is your backend. It runs on the server (Node.js), never in the browser.

import { prisma } from "@/lib/prisma";
import { calculateCapex } from "@/lib/capexCalculations";

// ---- POST /api/capex : create a new capex item ----
export async function POST(request) {
  try {
    // 1. Read the JSON the frontend sent (the form inputs)
    const body = await request.json();

    // 2. Run the calculation engine on those inputs
    const computed = calculateCapex(body);

    // 3. Save BOTH the inputs and the computed results to the database
    const saved = await prisma.capexItem.create({
      data: {
        // --- input fields ---
        clientName:       body.clientName,
        category:         body.category,
        subCategory:      body.subCategory,
        typeOfExpense:    body.typeOfExpense,
        billing:          body.billing || null,
        warehouseCode:    body.warehouseCode || null,
        billingMethod:    body.billingMethod,
        glName:           body.glName || null,
        assetLife:        Number(body.assetLife),
        startDate:        new Date(body.startDate),
        endDate:          body.endDate ? new Date(body.endDate) : null,
        intOnCapexAnnual: body.intOnCapexAnnual,
        uom:              body.uom || null,
        unitCost:         body.unitCost,
        qty:              body.qty,
        contingentPct:    body.contingentPct || null,
        managementFeePct: body.managementFeePct || null,
        billingMonth:     new Date(body.billingMonth),

        // --- computed fields (from calculateCapex) ---
        intOnCapexMonthly: computed.intOnCapexMonthly,
        investmentValue:   computed.investmentValue,
        usedLife:          computed.usedLife,
        amortPerMonth:     computed.amortPerMonth,
        capexBillingStd:   computed.capexBillingStd,
        capexBillingRed:   computed.capexBillingRed,
        maintenance:       computed.maintenance,
        aggregateCost:     computed.aggregateCost,
        contingencyCost:   computed.contingencyCost,
        managementFeeInr:  computed.managementFeeInr,
        totalBill:         computed.totalBill,
      },
    });

    // 4. Send the saved row back to the frontend as JSON
    return Response.json({ success: true, data: saved }, { status: 201 });
  } catch (error) {
    console.error("POST /api/capex error:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// ---- GET /api/capex : list all capex items ----
export async function GET() {
  try {
    const items = await prisma.capexItem.findMany({
      orderBy: { createdAt: "desc" }, // newest first
    });
    return Response.json({ success: true, data: items });
  } catch (error) {
    console.error("GET /api/capex error:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}