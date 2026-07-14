"use client";

import { useState, useEffect } from "react";

const emptyForm = {
  clientName: "", category: "Capex", subCategory: "", typeOfExpense: "",
  billing: "", warehouseCode: "", billingMethod: "Standard", glName: "SLM",
  assetLife: "", startDate: "", endDate: "", intOnCapexAnnual: "", uom: "",
  unitCost: "", qty: "", contingentPct: "", managementFeePct: "",
  maintenanceRate: "", billingMonth: "",
};

export default function Home() {
  const [form, setForm] = useState(emptyForm);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(true);

  useEffect(() => { loadItems(); }, []);

  async function loadItems() {
    try {
      const res = await fetch("/api/capex");
      const json = await res.json();
      if (json.success) setItems(json.data);
    } catch (e) { console.error(e); }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/capex", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) {
        setForm(emptyForm);
        loadItems();
      } else {
        setError(json.error || "Something went wrong");
      }
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  const money = (n) =>
    Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const totalMonthly = items.reduce((sum, it) => sum + Number(it.totalBill), 0);

  const fields = [
    { label: "Client name", name: "clientName", type: "text" },
    { label: "Category", name: "category", type: "text" },
    { label: "Sub category", name: "subCategory", type: "text" },
    { label: "Type of expense", name: "typeOfExpense", type: "text" },
    { label: "Billing", name: "billing", type: "text" },
    { label: "Warehouse code", name: "warehouseCode", type: "text" },
    { label: "Asset life (months)", name: "assetLife", type: "number" },
    { label: "Start date", name: "startDate", type: "date" },
    { label: "End date", name: "endDate", type: "date" },
    { label: "Billing month", name: "billingMonth", type: "date" },
    { label: "Interest annual (0.24 = 24%)", name: "intOnCapexAnnual", type: "number" },
    { label: "Unit of measure", name: "uom", type: "text" },
    { label: "Unit cost", name: "unitCost", type: "number" },
    { label: "Quantity", name: "qty", type: "number" },
    { label: "Maintenance rate (0.005)", name: "maintenanceRate", type: "number" },
    { label: "Contingent % (0.05)", name: "contingentPct", type: "number" },
    { label: "Management fee % (0.085)", name: "managementFeePct", type: "number" },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "#faf8f4",
      fontFamily: "var(--font-sans), system-ui, sans-serif",
      color: "#1a2332",
    }}>
      {/* Header */}
      <header style={{
        borderBottom: "1px solid #e5e0d8",
        background: "#1a2332",
        color: "#faf8f4",
      }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "28px 32px",
          display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <div style={{ fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase",
              color: "#0f766e", fontWeight: 600, marginBottom: "6px" }}>
              Valor · Capital Expenditure
            </div>
            <h1 style={{ fontSize: "26px", fontWeight: 700, margin: 0, letterSpacing: "-0.01em" }}>
              Billing Ledger
            </h1>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase",
              color: "#8b95a5", marginBottom: "4px" }}>
              Total monthly billing
            </div>
            <div style={{ fontFamily: "var(--font-mono), monospace", fontSize: "30px",
              fontWeight: 700, color: "#5eead4" }}>
              ₹{money(totalMonthly)}
            </div>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: "1280px", margin: "0 auto", padding: "32px" }}>
        {/* Toggle */}
        <div style={{ marginBottom: "20px" }}>
          <button onClick={() => setShowForm(!showForm)} style={{
            background: "transparent", border: "1px solid #cbd0d8", borderRadius: "6px",
            padding: "8px 16px", fontSize: "13px", cursor: "pointer", color: "#1a2332",
            fontWeight: 500,
          }}>
            {showForm ? "− Hide entry form" : "+ New capex entry"}
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <form onSubmit={handleSubmit} style={{
            background: "#ffffff", border: "1px solid #e5e0d8", borderRadius: "10px",
            padding: "28px", marginBottom: "32px",
            boxShadow: "0 1px 3px rgba(26,35,50,0.04)",
          }}>
            <div style={{ fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase",
              color: "#8b95a5", fontWeight: 600, marginBottom: "20px" }}>
              Asset details
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: "16px" }}>
              {fields.map((f) => (
                <div key={f.name} style={{ display: "flex", flexDirection: "column" }}>
                  <label style={{ fontSize: "11px", fontWeight: 500, color: "#5a6472",
                    marginBottom: "5px" }}>{f.label}</label>
                  <input name={f.name} type={f.type} step="any"
                    value={form[f.name]} onChange={handleChange}
                    style={{
                      border: "1px solid #d5d0c8", borderRadius: "6px", padding: "8px 10px",
                      fontSize: "13px", fontFamily: f.type === "number"
                        ? "var(--font-mono), monospace" : "inherit",
                      background: "#faf8f4", color: "#1a2332",
                    }} />
                </div>
              ))}
              <div style={{ display: "flex", flexDirection: "column" }}>
                <label style={{ fontSize: "11px", fontWeight: 500, color: "#5a6472",
                  marginBottom: "5px" }}>Billing method</label>
                <select name="billingMethod" value={form.billingMethod} onChange={handleChange}
                  style={{ border: "1px solid #d5d0c8", borderRadius: "6px", padding: "8px 10px",
                    fontSize: "13px", background: "#faf8f4", color: "#1a2332" }}>
                  <option>Standard</option><option>Reducing</option>
                </select>
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <label style={{ fontSize: "11px", fontWeight: 500, color: "#5a6472",
                  marginBottom: "5px" }}>GL name</label>
                <select name="glName" value={form.glName} onChange={handleChange}
                  style={{ border: "1px solid #d5d0c8", borderRadius: "6px", padding: "8px 10px",
                    fontSize: "13px", background: "#faf8f4", color: "#1a2332" }}>
                  <option>SLM</option><option>WDV</option>
                </select>
              </div>
            </div>

            {error && (
              <div style={{ marginTop: "16px", padding: "10px 14px", background: "#fef2f2",
                border: "1px solid #fecaca", borderRadius: "6px", color: "#b91c1c",
                fontSize: "13px" }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              marginTop: "24px", background: "#0f766e", color: "#ffffff", border: "none",
              borderRadius: "6px", padding: "11px 28px", fontSize: "14px", fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1,
            }}>
              {loading ? "Saving…" : "Add to ledger"}
            </button>
          </form>
        )}

        {/* Table */}
        <div style={{ background: "#ffffff", border: "1px solid #e5e0d8", borderRadius: "10px",
          overflow: "hidden", boxShadow: "0 1px 3px rgba(26,35,50,0.04)" }}>
          <div style={{ padding: "18px 24px", borderBottom: "1px solid #e5e0d8",
            display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase",
              color: "#8b95a5", fontWeight: 600 }}>
              Ledger entries
            </div>
            <div style={{ fontFamily: "var(--font-mono), monospace", fontSize: "13px",
              color: "#5a6472" }}>
              {items.length} {items.length === 1 ? "asset" : "assets"}
            </div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ background: "#f5f2ec", textAlign: "left" }}>
                  {["Client", "Type", "Unit cost", "Qty", "Investment", "Amort/mo",
                    "Std billing", "Mgmt fee", "Total bill"].map((h, i) => (
                    <th key={h} style={{ padding: "12px 16px", fontSize: "10px",
                      letterSpacing: "0.1em", textTransform: "uppercase", color: "#8b95a5",
                      fontWeight: 600, textAlign: i >= 2 ? "right" : "left",
                      whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr><td colSpan={9} style={{ padding: "48px", textAlign: "center",
                    color: "#a5adba", fontSize: "14px" }}>
                    No entries yet. Add a capital asset to begin the ledger.
                  </td></tr>
                ) : (
                  items.map((it) => {
                    const mono = { fontFamily: "var(--font-mono), monospace", textAlign: "right",
                      padding: "13px 16px", whiteSpace: "nowrap" };
                    return (
                      <tr key={it.id} style={{ borderTop: "1px solid #f0ece4" }}>
                        <td style={{ padding: "13px 16px", fontWeight: 500 }}>{it.clientName}</td>
                        <td style={{ padding: "13px 16px", color: "#5a6472" }}>{it.typeOfExpense}</td>
                        <td style={mono}>{money(it.unitCost)}</td>
                        <td style={mono}>{Number(it.qty)}</td>
                        <td style={mono}>{money(it.investmentValue)}</td>
                        <td style={mono}>{money(it.amortPerMonth)}</td>
                        <td style={mono}>{money(it.capexBillingStd)}</td>
                        <td style={mono}>{money(it.managementFeeInr)}</td>
                        <td style={{ ...mono, fontWeight: 700, color: "#0f766e" }}>
                          ₹{money(it.totalBill)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}