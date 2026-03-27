"use client";

import React, { useState } from "react";
import { PAYMENT_METHODS, calculateFee, getPaymentMethodsByCategory, type PaymentMethod } from "@/lib/payment-methods";
import { ChevronDown, ChevronUp, CheckCircle2 } from "lucide-react";

interface PaymentMethodSelectorProps {
  amount: number;
  selectedMethod: string;
  onMethodChange: (method: string, totalPayment: number, fee: number) => void;
}

export function PaymentMethodSelector({ amount, selectedMethod, onMethodChange }: PaymentMethodSelectorProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>("QRIS");
  const groupedMethods = getPaymentMethodsByCategory();

  const categories = [
    { key: "QRIS", label: "QRIS", icon: "💳" },
    { key: "EWALLET", label: "E-Wallet", icon: "📱" },
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

  return (
    <div className="space-y-3">
      {categories.map((category) => (
        <div key={category.key} className="border border-slate-700 rounded-xl overflow-hidden bg-slate-900/50">
          <button
            type="button"
            onClick={() => setExpandedCategory(expandedCategory === category.key ? null : category.key)}
            className={`
              w-full px-4 py-3 flex items-center justify-between transition-colors
              ${expandedCategory === category.key 
                ? 'bg-yellow-500/10 border-b border-yellow-500/20' 
                : 'bg-slate-800/80 hover:bg-slate-800'
              }
            `}
          >
            <span className="flex items-center gap-3">
              <span className="text-lg">{category.icon}</span>
              <span className={`text-sm font-bold uppercase tracking-wider ${expandedCategory === category.key ? 'text-yellow-500' : 'text-white'}`}>
                {category.label}
              </span>
            </span>
            <span className={expandedCategory === category.key ? 'text-yellow-500' : 'text-slate-400'}>
              {expandedCategory === category.key ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </span>
          </button>

          {expandedCategory === category.key && (
            <div className="divide-y divide-slate-700/50">
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
                    className={`
                      w-full px-4 py-3 flex items-center gap-3 text-left transition-all
                      ${isSelected 
                        ? 'bg-yellow-500/5' 
                        : 'bg-slate-900 hover:bg-slate-800/80'
                      }
                    `}
                  >
                    <div className={`
                      w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0
                      ${isSelected ? 'border-yellow-500 bg-yellow-500' : 'border-slate-600'}
                    `}>
                      {isSelected ? (
                        <CheckCircle2 className="w-4 h-4 text-black" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-slate-600" />
                      )}
                    </div>

                    <div className="w-12 h-8 bg-white rounded-lg p-1 flex items-center justify-center shrink-0 overflow-hidden border border-slate-200">
                      <img src={method.logo} alt={method.name} className="max-h-full max-w-full object-contain" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-bold truncate ${isSelected ? 'text-yellow-500' : 'text-white'}`}>
                        {method.name}
                      </div>
                      <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                        {method.type === 'DIRECT' ? 'Transfer Langsung' : 'Buka Aplikasi'}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className={`text-sm font-bold ${isSelected ? 'text-yellow-400' : 'text-slate-300'}`}>
                        + Rp {feeInfo.totalFee.toLocaleString("id-ID")}
                      </div>
                      <div className="text-[10px] text-slate-500 font-medium">
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
