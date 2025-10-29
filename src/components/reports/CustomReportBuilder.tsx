"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  PlusIcon, 
  TrashIcon,
  ChartBarIcon,
  TableCellsIcon
} from "@heroicons/react/24/outline";

interface ReportField {
  id: string;
  name: string;
  type: "transaction" | "budget" | "investment" | "category";
  field: string;
  aggregation: "sum" | "count" | "average" | "min" | "max";
}

interface CustomReportTemplate {
  id: string;
  name: string;
  description: string;
  fields: ReportField[];
  filters: {
    dateRange?: { start: string; end: string };
    categories?: string[];
    accounts?: string[];
  };
  visualization: "table" | "bar" | "line" | "pie";
}

type FieldType = "transaction" | "budget" | "investment" | "category";
type AggregationType = "sum" | "count" | "average" | "min" | "max";

export default function CustomReportBuilder() {
  const [reportName, setReportName] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [fields, setFields] = useState<ReportField[]>([
    {
      id: "field-1",
      name: "Amount",
      type: "transaction",
      field: "amount",
      aggregation: "sum"
    }
  ]);
  const [visualization, setVisualization] = useState<"table" | "bar" | "line" | "pie">("table");
  const [filters, setFilters] = useState({
    dateRange: { start: "", end: "" },
    categories: [] as string[],
    accounts: [] as string[]
  });

  const availableFields = [
    { type: "transaction", field: "amount", name: "Transaction Amount" },
    { type: "transaction", field: "date", name: "Transaction Date" },
    { type: "transaction", field: "category", name: "Transaction Category" },
    { type: "transaction", field: "description", name: "Transaction Description" },
    { type: "budget", field: "allocated", name: "Budget Allocated" },
    { type: "budget", field: "spent", name: "Budget Spent" },
    { type: "investment", field: "value", name: "Investment Value" },
    { type: "investment", field: "profit_loss", name: "Investment Profit/Loss" },
    { type: "category", field: "name", name: "Category Name" }
  ];

  const aggregationOptions = [
    { value: "sum", label: "Sum" },
    { value: "count", label: "Count" },
    { value: "average", label: "Average" },
    { value: "min", label: "Minimum" },
    { value: "max", label: "Maximum" }
  ];

  const addField = () => {
    const newField: ReportField = {
      id: `field-${Date.now()}`,
      name: "",
      type: "transaction",
      field: "amount",
      aggregation: "sum"
    };
    setFields([...fields, newField]);
  };

  const updateField = (id: string, updates: Partial<ReportField>) => {
    setFields(fields.map(field => 
      field.id === id ? { ...field, ...updates } : field
    ));
  };

  const removeField = (id: string) => {
    if (fields.length > 1) {
      setFields(fields.filter(field => field.id !== id));
    }
  };

  const saveTemplate = () => {
    if (!reportName.trim()) {
      alert("Please enter a report name");
      return;
    }

    const template: CustomReportTemplate = {
      id: `template-${Date.now()}`,
      name: reportName,
      description: reportDescription,
      fields,
      filters,
      visualization
    };

    // In a real implementation, this would save to the database
    localStorage.setItem(`custom-report-${template.id}`, JSON.stringify(template));
    alert("Report template saved successfully!");
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center">
          <ChartBarIcon className="h-5 w-5 mr-2" />
          Custom Report Builder
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Report Name and Description */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="reportName" className="block text-sm font-medium text-gray-700 mb-1">
              Report Name
            </label>
            <input
              type="text"
              id="reportName"
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
              placeholder="e.g., Monthly Spending Analysis"
            />
          </div>
          <div>
            <label htmlFor="reportDescription" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <input
              type="text"
              id="reportDescription"
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
              placeholder="Brief description of this report"
            />
          </div>
        </div>

        {/* Fields Configuration */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-medium">Report Fields</h3>
            <Button 
              onClick={addField}
              variant="outline"
              size="sm"
              className="flex items-center"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Add Field
            </Button>
          </div>
          
          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 p-3 border border-gray-200 rounded-md">
                <div className="md:col-span-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Field Name
                  </label>
                  <input
                    type="text"
                    value={field.name}
                    onChange={(e) => updateField(field.id, { name: e.target.value })}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    placeholder="Display name"
                    aria-label={`Field name for field ${index + 1}`}
                  />
                </div>
                
                <div className="md:col-span-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Data Source
                  </label>
                  <select
                    value={field.type}
                    onChange={(e) => updateField(field.id, { type: e.target.value as FieldType })}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    aria-label={`Data source for field ${index + 1}`}
                  >
                    <option value="transaction">Transactions</option>
                    <option value="budget">Budgets</option>
                    <option value="investment">Investments</option>
                    <option value="category">Categories</option>
                  </select>
                </div>
                
                <div className="md:col-span-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Field
                  </label>
                  <select
                    value={field.field}
                    onChange={(e) => updateField(field.id, { field: e.target.value })}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    aria-label={`Field for field ${index + 1}`}
                  >
                    {availableFields
                      .filter(f => f.type === field.type)
                      .map(f => (
                        <option key={f.field} value={f.field}>
                          {f.name}
                        </option>
                      ))}
                  </select>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Aggregation
                  </label>
                  <select
                    value={field.aggregation}
                    onChange={(e) => updateField(field.id, { aggregation: e.target.value as AggregationType })}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    aria-label={`Aggregation for field ${index + 1}`}
                  >
                    {aggregationOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="md:col-span-1 flex items-end">
                  <Button
                    onClick={() => removeField(field.id)}
                    variant="outline"
                    size="sm"
                    disabled={fields.length <= 1}
                    aria-label={`Remove field ${index + 1}`}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Visualization Type */}
        <div>
          <h3 className="text-lg font-medium mb-3">Visualization</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <button
              onClick={() => setVisualization("table")}
              className={`p-3 border rounded-md flex flex-col items-center ${
                visualization === "table" 
                  ? "border-blue-500 bg-blue-50" 
                  : "border-gray-200 hover:border-gray-300"
              }`}
              aria-label="Table visualization"
            >
              <TableCellsIcon className="h-6 w-6 mb-1" />
              <span className="text-sm">Table</span>
            </button>
            <button
              onClick={() => setVisualization("bar")}
              className={`p-3 border rounded-md flex flex-col items-center ${
                visualization === "bar" 
                  ? "border-blue-500 bg-blue-50" 
                  : "border-gray-200 hover:border-gray-300"
              }`}
              aria-label="Bar chart visualization"
            >
              <ChartBarIcon className="h-6 w-6 mb-1" />
              <span className="text-sm">Bar Chart</span>
            </button>
            <button
              onClick={() => setVisualization("line")}
              className={`p-3 border rounded-md flex flex-col items-center ${
                visualization === "line" 
                  ? "border-blue-500 bg-blue-50" 
                  : "border-gray-200 hover:border-gray-300"
              }`}
              aria-label="Line chart visualization"
            >
              <ChartBarIcon className="h-6 w-6 mb-1" />
              <span className="text-sm">Line Chart</span>
            </button>
            <button
              onClick={() => setVisualization("pie")}
              className={`p-3 border rounded-md flex flex-col items-center ${
                visualization === "pie" 
                  ? "border-blue-500 bg-blue-50" 
                  : "border-gray-200 hover:border-gray-300"
              }`}
              aria-label="Pie chart visualization"
            >
              <ChartBarIcon className="h-6 w-6 mb-1" />
              <span className="text-sm">Pie Chart</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div>
          <h3 className="text-lg font-medium mb-3">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Range
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={filters.dateRange.start}
                  onChange={(e) => setFilters({
                    ...filters,
                    dateRange: { ...filters.dateRange, start: e.target.value }
                  })}
                  className="px-2 py-1 border border-gray-300 rounded text-sm"
                  aria-label="Start date"
                />
                <input
                  type="date"
                  value={filters.dateRange.end}
                  onChange={(e) => setFilters({
                    ...filters,
                    dateRange: { ...filters.dateRange, end: e.target.value }
                  })}
                  className="px-2 py-1 border border-gray-300 rounded text-sm"
                  aria-label="End date"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categories
              </label>
              <input
                type="text"
                placeholder="Comma-separated categories"
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                aria-label="Categories filter"
                onChange={(e) => setFilters({
                  ...filters,
                  categories: e.target.value.split(",").map(c => c.trim()).filter(c => c)
                })}
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button 
            onClick={saveTemplate}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Save Report Template
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}