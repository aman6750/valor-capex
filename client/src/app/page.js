"use client";

import { useState, useEffect } from "react";

// The empty form template — matches your Excel input fields
const emptyForm = {
  clientName: "",
  category: "Capex",
  subCategory: "",
  typeOfExpense: "",
  billing: "",
  warehouseCode: "",
  billingMethod: "Standard",
  glName: "SLM",
  assetLife: "",
  startDate: "",
  endDate: "",
  intOnCapexAnnual: "",
  uom: "",
  unitCost: "",
  qty: "",
  contingentPct: "",
  managementFeePct: "",
  maintenanceRate: "",
  billingMonth: "",
};

export default function Home() {
  const [form, setForm] = useState(emptyForm);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load all saved items when the page opens
  useEffect(() => {
    loadItems();
  }, []);

  async function loadItems() {
    try {
      const res = await fetch("/api/capex");
      const json = await res.json();
      if (json.success) setItems(json.data);
    } catch (e) {
      console.error(e);
    }
  }

  // Update form state as the user types
  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  // Submit the form to the API
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
        setForm(emptyForm);   // clear the form
        loadItems();          // refresh the table
      } else {
        setError(json.error || "Something went wrong");
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  // Helper to format numbers as currency
  const money = (n) =>
    Number(n).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  // The input fields config — label + name + type
  const fields = [
    { label: "Client Name", name: "clientName", type: "text" },
    { label: "Category", name: "category", type: "text" },
    { label: "Sub Category", name: "subCategory", type: "text" },
    { label: "Type of Expense", name: "typeOfExpense", type: "text" },
    { label: "Billing", name: "billing", type: "text" },
    { label: "Warehouse Code", name: "warehouseCode", type: "text" },
    { label: "Asset Life (months)", name: "assetLife", type: "number" },
    { label: "Start Date", name: "startDate", type: "date" },
    { label: "End Date", name: "endDate", type: "date" },
    { label: "Billing Month", name: "billingMonth", type: "date" },
    { label: "Int on Capex (Annual, e.g. 0.24)", name: "intOnCapexAnnual", type: "number" },
    { label: "UOM", name: "uom", type: "text" },
    { label: "Unit Cost", name: "unitCost", type: "number" },
    { label: "Qty", name: "qty", type: "number" },
    { label: "Maintenance Rate (e.g. 0.005)", name: "maintenanceRate", type: "number" },
    { label: "Contingent % (e.g. 0.05)", name: "contingentPct", type: "number" },
    { label: "Management Fee % (e.g. 0.085)", name: "managementFeePct", type: "number" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">
          Valor Capex — Billing Calculator
        </h1>
        <p className="text-slate-500 mb-6 text-sm">
          Add a capital asset to calculate its monthly billing.
        </p>

        {/* ---- FORM ---- */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {fields.map((f) => (
              <div key={f.name} className="flex flex-col">
                <label className="text-xs font-medium text-slate-600 mb-1">
                  {f.label}
                </label>
                <input
                  name={f.name}
                  type={f.type}
                  step="any"
                  value={form[f.name]}
                  onChange={handleChange}
                  className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}

            {/* Dropdowns */}
            <div className="flex flex-col">
              <label className="text-xs font-medium text-slate-600 mb-1">
                Billing Method
              </label>
              <select
                name="billingMethod"
                value={form.billingMethod}
                onChange={handleChange}
                className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>Standard</option>
                <option>Reducing</option>
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-medium text-slate-600 mb-1">
                GL Name
              </label>
              <select
                name="glName"
                value={form.glName}
                onChange={handleChange}
                className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>SLM</option>
                <option>WDV</option>
              </select>
            </div>
          </div>

          {error && (
            <p className="text-red-600 text-sm mt-4">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-md text-sm disabled:opacity-50"
          >
            {loading ? "Saving..." : "Add Capex Item"}
          </button>
        </form>

        {/* ---- TABLE ---- */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="font-semibold text-slate-800">
              Saved Capex Items ({items.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 text-slate-600 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Client</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-right">Unit Cost</th>
                  <th className="px-4 py-3 text-right">Qty</th>
                  <th className="px-4 py-3 text-right">Investment</th>
                  <th className="px-4 py-3 text-right">Amort/Month</th>
                  <th className="px-4 py-3 text-right">Std Billing</th>
                  <th className="px-4 py-3 text-right">Mgmt Fee</th>
                  <th className="px-4 py-3 text-right font-bold">Total Bill</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-slate-400">
                      No items yet. Add one above.
                    </td>
                  </tr>
                ) : (
                  items.map((it) => (
                    <tr key={it.id} className="border-t border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3">{it.clientName}</td>
                      <td className="px-4 py-3">{it.typeOfExpense}</td>
                      <td className="px-4 py-3 text-right">{money(it.unitCost)}</td>
                      <td className="px-4 py-3 text-right">{Number(it.qty)}</td>
                      <td className="px-4 py-3 text-right">{money(it.investmentValue)}</td>
                      <td className="px-4 py-3 text-right">{money(it.amortPerMonth)}</td>
                      <td className="px-4 py-3 text-right">{money(it.capexBillingStd)}</td>
                      <td className="px-4 py-3 text-right">{money(it.managementFeeInr)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-blue-700">
                        {money(it.totalBill)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}