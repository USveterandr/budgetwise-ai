"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  TrashIcon, 
  PencilIcon, 
  ArrowDownTrayIcon,
  EllipsisVerticalIcon
} from "@heroicons/react/24/outline";

interface BulkUpdateData {
  category?: string;
  type?: "income" | "expense";
}

interface TransactionBulkActionsProps {
  selectedTransactions: string[];
  onBulkDelete: (transactionIds: string[]) => void;
  onBulkUpdate: (transactionIds: string[], updates: BulkUpdateData) => void;
  onExport: (transactionIds: string[]) => void;
}

export default function TransactionBulkActions({ 
  selectedTransactions, 
  onBulkDelete, 
  onBulkUpdate,
  onExport
}: TransactionBulkActionsProps) {
  const [isBulkActionOpen, setIsBulkActionOpen] = useState(false);
  const [bulkActionType, setBulkActionType] = useState<"delete" | "update" | "export">("delete");
  const [updateCategory, setUpdateCategory] = useState("");
  const [updateType, setUpdateType] = useState<"income" | "expense">("expense");

  const handleBulkAction = () => {
    switch (bulkActionType) {
      case "delete":
        onBulkDelete(selectedTransactions);
        break;
      case "update":
        onBulkUpdate(selectedTransactions, {
          category: updateCategory || undefined,
          type: updateType || undefined
        });
        break;
      case "export":
        onExport(selectedTransactions);
        break;
    }
    setIsBulkActionOpen(false);
  };

  const handleActionSelect = (action: "delete" | "update" | "export") => {
    setBulkActionType(action);
    setIsBulkActionOpen(false);
    
    // For delete and export, execute immediately
    if (action === "delete") {
      onBulkDelete(selectedTransactions);
    } else if (action === "export") {
      onExport(selectedTransactions);
    }
    // For update, we'll show the update form
  };

  if (selectedTransactions.length === 0) {
    return null;
  }

  return (
    <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="text-sm text-blue-800">
          <span className="font-medium">{selectedTransactions.length}</span> transaction(s) selected
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => handleActionSelect("delete")}
            variant="destructive"
            size="sm"
            className="flex items-center"
          >
            <TrashIcon className="h-4 w-4 mr-1" />
            Delete
          </Button>
          
          <div className="relative">
            <Button
              onClick={() => setIsBulkActionOpen(!isBulkActionOpen)}
              variant="outline"
              size="sm"
              className="flex items-center"
            >
              <EllipsisVerticalIcon className="h-4 w-4" />
            </Button>
            
            {isBulkActionOpen && (
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                <div className="py-1">
                  <button
                    onClick={() => handleActionSelect("update")}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <PencilIcon className="h-4 w-4 inline mr-2" />
                    Update Category/Type
                  </button>
                  <button
                    onClick={() => handleActionSelect("export")}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4 inline mr-2" />
                    Export
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {bulkActionType === "update" && (
        <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg">
          <h4 className="text-md font-medium mb-3">Update Selected Transactions</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <input
                type="text"
                value={updateCategory}
                onChange={(e) => setUpdateCategory(e.target.value)}
                placeholder="e.g., Food, Utilities"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={updateType}
                onChange={(e) => setUpdateType(e.target.value as "income" | "expense")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                aria-label="Transaction type"
              >
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end gap-2">
            <Button
              onClick={() => setBulkActionType("delete")}
              variant="outline"
              size="sm"
            >
              Cancel
            </Button>
            <Button
              onClick={handleBulkAction}
              size="sm"
            >
              Apply Updates
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}