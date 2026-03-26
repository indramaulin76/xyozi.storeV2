"use client";

import React, { useState } from "react";
import { PAYMENT_METHODS, calculateFee, getPaymentMethodsByCategory, type PaymentMethod } from "@/lib/payment-methods";
import { ChevronDown, ChevronUp } from "lucide-react";

interface PaymentMethodSelectorProps {
  amount: number;
  selectedMethod: string;
  onMethodChange: (method: string, totalPayment: number, fee: number) => void;
}

export function PaymentMethodSelector({ amount, selectedMethod, onMethodChange }: PaymentMethodSelectorProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>("QRIS");
  const groupedMethods = getPaymentMethodsByCategory();

  const categories = [
    { key: "QRIS", label: "QRIS", icon: "📱" },
    { key: "EWALLET", label: "E-Wallet", icon: "💳" },
    { key: "VIRTUAL_ACCOUNT", label: "Virtual Account", icon: "🏦" },
    { key: "MINIMARKET", label: "Minimarket", icon: "🏪" },
  ];

  const handleSelect = (method: PaymentMethod) => {
    try {
      const feeInfo = calculateFee(method.code, amount);
      onMethodChange(method.code, feeInfo.totalPayment, feeInfo.totalFee);
    } catch (error) {
      console.error(error);
    }
  };

  const selectedPayment = PAYMENT_METHODS.find(m => m.code === selectedMethod);

  return (
    <div className="space-y-3">
      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
        Metode Pembayaran
      </label>

      {categories.map((category) => (
        <div key={category.key} className="border border-slate-800 rounded-2xl overflow-hidden">
          <button
            type="button"
            onClick={() => setExpandedCategory(expandedCategory === category.key ? null : category.key)}
            className="w-full px-4 py-3 flex items-center justify-between bg-slate-800/50 hover:bg-slate-800 transition-colors"
          >
            <span className="flex items-center gap-2">
              <span>{category.icon}</span>
              <span className="text-xs font-black text-white uppercase tracking-tight">{category.label}</span>
            </span>
            <span className="text-slate-400">
              {expandedCategory === category.key ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </span>
          </button>

          {expandedCategory === category.key && (
            <div className="divide-y divide-slate-800">
              {groupedMethods[category.key as keyof typeof groupedMethods]?.map((method) => {
                let feeInfo;
                try {
                  feeInfo = calculateFee(method.code, amount);
                } catch {
                  return null;
                }

                const isSelected = selectedMethod === method.code;

                return (
                  <button
                    key={method.code}
                    type="button"
                    onClick={() => handleSelect(method)}
                    className={`w-full px-4 py-3 flex items-center gap-3 text-left transition-colors ${
                      isSelected 
                        ? 'bg-blue-600/10' 
                        : 'bg-slate-950 hover:bg-slate-900'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      isSelected ? 'border-blue-500 bg-blue-500' : 'border-slate-600'
                    }`}>
                      {isSelected && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>

                    <div className="w-12 h-7 bg-white rounded-lg p-1 flex items-center justify-center shrink-0 overflow-hidden border border-slate-200">
                      <img src={method.logo} alt={method.name} className="max-h-full max-w-full object-contain" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-black text-white uppercase tracking-tight truncate">
                        {method.name}
                      </div>
                      <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                        {method.type === 'DIRECT' ? 'Transfer Langsung' : 'Buka Aplikasi'}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-black text-blue-400">
                        + Rp {feeInfo.totalFee.toLocaleString("id-ID")}
                      </div>
                      <div className="text-[9px] text-slate-500 font-bold">
                        Total: Rp {feeInfo.totalPayment.toLocaleString("id-ID")}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default PaymentMethodSelector;
