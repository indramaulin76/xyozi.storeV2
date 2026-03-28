"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { 
  Zap,
  Info,
  Loader2,
  Search,
  CheckCircle2,
  ChevronRight,
  Shield,
  Clock,
  Gem,
  User,
  Server,
  CreditCard,
  Phone
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { createOrder } from "@/lib/actions/order";
import { PaymentMethodSelector } from "./PaymentMethodSelector";
import { getPaymentMethod } from "@/lib/payment-methods";

interface Product {
  id: string;
  name: string;
  sellPrice: number;
  skuCode: string;
  imageUrl?: string | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  menuSection?: string;
  field1Label?: string;
  field2Label?: string | null;
  products: Product[];
}

interface OrderFormProps {
  category: Category;
}

export default function OrderForm({ category }: OrderFormProps) {
  const [loading, setLoading] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedPaymentId, setSelectedPaymentId] = useState("QRIS");
  const [userGameId, setUserGameId] = useState("");
  const [zoneId, setZoneId] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [totalPayment, setTotalPayment] = useState(0);
  const [totalFee, setTotalFee] = useState(0);

  const isGame = category.menuSection === "topup";

  const selectedProduct = category.products.find(p => p.id === selectedProductId);
  const selectedPayment = getPaymentMethod(selectedPaymentId);

  const filteredProducts = useMemo(() => {
    let products = category.products;
    
    if (isGame && activeTab !== "all") {
      if (activeTab === "diamonds") {
        products = products.filter(p => 
          p.name.toLowerCase().includes("diamond") || 
          p.name.toLowerCase().includes("dm")
        );
      } else if (activeTab === "pass") {
        products = products.filter(p => 
          p.name.toLowerCase().includes("pass") ||
          p.name.toLowerCase().includes("weekly") ||
          p.name.toLowerCase().includes("monthly")
        );
      } else if (activeTab === "item") {
        products = products.filter(p => 
          !p.name.toLowerCase().includes("diamond") &&
          !p.name.toLowerCase().includes("dm") &&
          !p.name.toLowerCase().includes("pass")
        );
      }
    }
    
    if (searchQuery) {
      products = products.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return products;
  }, [category.products, activeTab, searchQuery, isGame]);

  const handleMethodChange = (method: string, total: number, fee: number) => {
    setSelectedPaymentId(method);
    setTotalPayment(total);
    setTotalFee(fee);
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProductId(product.id);
    if (selectedPaymentId) {
      const { calculateFee } = require("@/lib/payment-methods");
      try {
        const feeCalc = calculateFee(selectedPaymentId, product.sellPrice);
        setTotalPayment(feeCalc.totalPayment);
        setTotalFee(feeCalc.totalFee);
      } catch (e) {
        setTotalPayment(product.sellPrice);
        setTotalFee(0);
      }
    }
  };

  const handleSubmit = async () => {
    if (!selectedProductId || !selectedPaymentId || !userGameId) {
      alert("Harap lengkapi semua data pesanan!");
      return;
    }

    if (!customerPhone) {
      alert("Harap masukkan nomor WhatsApp untuk notifikasi pesanan!");
      return;
    }

    setLoading(true);
    const result = await createOrder({
      userGameId,
      zoneId,
      productId: selectedProductId,
      paymentMethod: selectedPaymentId,
      customerPhone,
    });
    setLoading(false);

    if (result?.error) {
      alert(result.error);
    }
  };

  const displayTotal = totalPayment > 0 ? totalPayment : (selectedProduct?.sellPrice || 0);
  const displayFee = totalFee;

  const gameTabs = [
    { id: "all", label: "Semua" },
    { id: "diamonds", label: "Diamonds" },
    { id: "pass", label: "Pass" },
    { id: "item", label: "Items" },
  ];

  // Dynamic labels from category
  const field1Label = category.field1Label || "User ID";
  const field2Label = category.field2Label || null;
  const hasField2 = !!field2Label && field2Label.trim() !== "";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Left Column - 70% */}
      <div className="lg:col-span-3 space-y-6">
        
        {/* Step Progress Bar */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            {[
              { step: 1, label: "Masukkan ID", icon: User },
              { step: 2, label: "Pilih Item", icon: Gem },
              { step: 3, label: "Pembayaran", icon: CreditCard },
            ].map((item, index) => (
              <React.Fragment key={item.step}>
                <div className="flex items-center gap-3">
                  <div className={`
                    w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm transition-all
                    ${selectedProductId && item.step <= 3
                      ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/30' 
                      : 'bg-slate-700 text-slate-400'
                    }
                  `}>
                    {item.step === 1 && <User className="w-5 h-5" />}
                    {item.step === 2 && <Gem className="w-5 h-5" />}
                    {item.step === 3 && <CreditCard className="w-5 h-5" />}
                  </div>
                  <span className={`hidden md:block text-sm font-bold ${selectedProductId ? 'text-white' : 'text-slate-400'}`}>
                    {item.label}
                  </span>
                </div>
                {index < 2 && (
                  <div className={`flex-1 h-1 mx-2 rounded-full ${selectedProductId ? 'bg-yellow-500' : 'bg-slate-700'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Card 1: Masukkan ID */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-yellow-500/10 to-transparent px-6 py-4 border-b border-slate-700 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-yellow-500 text-black flex items-center justify-center font-black text-sm">1</div>
            <h3 className="font-bold text-white">Masukkan Data</h3>
          </div>
          <div className="p-6 space-y-6">
            <div className={`grid grid-cols-1 ${hasField2 ? 'md:grid-cols-2' : ''} gap-4`}>
              {/* Main ID Input - Dynamic Label from Category */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {field1Label} *
                </label>
                <Input 
                  placeholder={`Contoh: 12345678`}
                  className="bg-slate-900 border-slate-700 h-12 rounded-xl text-white font-mono focus:ring-yellow-500 focus:border-yellow-500" 
                  value={userGameId}
                  onChange={(e) => setUserGameId(e.target.value)}
                  disabled={loading}
                />
              </div>
              
              {/* Secondary Input - Only if field2Label exists */}
              {hasField2 && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Server className="w-4 h-4" />
                    {field2Label} (Opsional)
                  </label>
                  <Input 
                    placeholder="Contoh: 1234" 
                    className="bg-slate-900 border-slate-700 h-12 rounded-xl text-white font-mono focus:ring-yellow-500 focus:border-yellow-500" 
                    value={zoneId}
                    onChange={(e) => setZoneId(e.target.value)}
                    disabled={loading}
                  />
                </div>
              )}

              {/* WhatsApp Number Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Nomor WhatsApp *
                </label>
                <Input 
                  placeholder="Contoh: 081234567890"
                  className="bg-slate-900 border-slate-700 h-12 rounded-xl text-white font-mono focus:ring-yellow-500 focus:border-yellow-500"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  disabled={loading}
                />
                <p className="text-[10px] text-slate-500">
                  Needed untuk mengirim notifikasi pesanan
                </p>
              </div>
            </div>
            
            <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4 flex items-start gap-3">
              <Info className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
              <p className="text-sm text-slate-300 leading-relaxed">
                Pastikan{" "}
                <span className="text-yellow-500 font-bold">{field1Label}</span>
                {hasField2 && (
                  <>
                    {" dan "}
                    <span className="text-yellow-500 font-bold">{field2Label}</span>
                  </>
                )}{" "}
                sudah benar. Kesalahan input bukan tanggung jawab kami.
              </p>
            </div>
          </div>
        </div>

        {/* Card 2: Pilih Item */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-yellow-500/10 to-transparent px-6 py-4 border-b border-slate-700 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-yellow-500 text-black flex items-center justify-center font-black text-sm">2</div>
            <h3 className="font-bold text-white">
              Pilih Nominal
            </h3>
          </div>
          <div className="p-6 space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <Input 
                placeholder="Cari item..." 
                className="bg-slate-900 border-slate-700 h-12 pl-12 rounded-xl text-white focus:ring-yellow-500 focus:border-yellow-500" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Tabs - Only for Games */}
            {isGame && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {gameTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all
                      ${activeTab === tab.id 
                        ? 'bg-yellow-500 text-black' 
                        : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                      }
                    `}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}

            {/* Product List - Horizontal Rectangular Cards */}
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <Gem className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Tidak ada item ditemukan</p>
                </div>
              ) : (
                filteredProducts.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectProduct(item)}
                    className={`
                      w-full p-4 rounded-xl flex items-center gap-4 cursor-pointer border-2 transition-all text-left
                      ${selectedProductId === item.id 
                        ? 'bg-yellow-500/10 border-yellow-500' 
                        : 'bg-slate-900 border-slate-700 hover:border-yellow-500'
                      }
                    `}
                  >
                    {/* Small Image/Icon on Left */}
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-slate-800 overflow-hidden flex items-center justify-center border border-slate-700">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <Gem className="w-6 h-6 text-slate-600" />
                      )}
                    </div>
                    
                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold truncate ${selectedProductId === item.id ? 'text-yellow-500' : 'text-white'}`}>
                        {item.name}
                      </p>
                      {item.skuCode && (
                        <p className="text-xs text-slate-500 mt-0.5">{item.skuCode}</p>
                      )}
                    </div>
                    
                    {/* Price & Check */}
                    <div className="flex items-center gap-3 shrink-0">
                      <p className={`text-base font-black ${selectedProductId === item.id ? 'text-yellow-400' : 'text-slate-300'}`}>
                        Rp {item.sellPrice.toLocaleString("id-ID")}
                      </p>
                      {selectedProductId === item.id && (
                        <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 text-black" />
                        </div>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Card 3: Pilih Pembayaran */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-yellow-500/10 to-transparent px-6 py-4 border-b border-slate-700 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-yellow-500 text-black flex items-center justify-center font-black text-sm">3</div>
            <h3 className="font-bold text-white">Pilih Pembayaran</h3>
          </div>
          <div className="p-6">
            {selectedProduct ? (
              <PaymentMethodSelector
                amount={selectedProduct.sellPrice}
                selectedMethod={selectedPaymentId}
                onMethodChange={handleMethodChange}
              />
            ) : (
              <div className="text-center py-8 text-slate-500">
                <p className="text-sm">Pilih nominal layanan terlebih dahulu</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Column - 30% Sticky Sidebar */}
      <div className="lg:col-span-2">
        <div className="sticky top-48 space-y-4">
          
          {/* Order Summary Card */}
          <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-yellow-500 to-amber-500 px-6 py-4">
              <h3 className="font-black text-black uppercase tracking-wider flex items-center gap-2">
                <Zap className="w-5 h-5 fill-black" />
                Ringkasan Pesanan
              </h3>
            </div>
            <div className="p-6 space-y-4">
              
              {/* Game Info */}
              <div className="flex items-center gap-3 pb-4 border-b border-slate-700">
                <div className="w-12 h-12 rounded-xl bg-slate-700 flex items-center justify-center overflow-hidden">
                  <span className="text-lg font-black text-yellow-500">{category.name.substring(0, 2).toUpperCase()}</span>
                </div>
                <div>
                  <p className="font-bold text-white">{category.name}</p>
                  <p className="text-xs text-slate-400">Top Up</p>
                </div>
              </div>

              {/* Order Details */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400 uppercase tracking-wider">{field1Label}</span>
                  <span className="font-mono font-bold text-white">{userGameId || '-'}</span>
                </div>
                {zoneId && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400 uppercase tracking-wider">Zone ID</span>
                    <span className="font-mono font-bold text-white">{zoneId}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400 uppercase tracking-wider">Item</span>
                  <span className="font-bold text-white text-right max-w-[150px] truncate">
                    {selectedProduct?.name || '-'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400 uppercase tracking-wider">Pembayaran</span>
                  <span className="text-xs font-bold text-yellow-500">{selectedPayment?.name || '-'}</span>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="pt-4 border-t border-slate-700 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">Harga Item</span>
                  <span className="text-sm text-white">Rp {(selectedProduct?.sellPrice || 0).toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">Biaya Admin</span>
                  <span className="text-sm text-white">Rp {displayFee.toLocaleString("id-ID")}</span>
                </div>
              </div>

              {/* Total */}
              <div className="pt-4 border-t-2 border-dashed border-yellow-500/30">
                <div className="flex justify-between items-center">
                  <span className="text-base font-bold text-white uppercase tracking-wider">Total</span>
                  <span className="text-2xl font-black text-yellow-500">
                    Rp {displayTotal.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="px-6 pb-6">
              <button 
                onClick={handleSubmit}
                disabled={!selectedProductId || !selectedPaymentId || !userGameId || !customerPhone || loading}
                className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:bg-slate-700 disabled:text-slate-500 text-black font-black py-4 rounded-xl transition-all shadow-lg shadow-yellow-500/30 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Bayar Sekarang
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: Zap, label: "Instant", color: "text-yellow-500" },
              { icon: Shield, label: "Secure", color: "text-emerald-500" },
              { icon: Clock, label: "24/7", color: "text-blue-500" },
            ].map((badge, i) => (
              <div key={i} className="bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-center">
                <badge.icon className={`w-5 h-5 mx-auto mb-1 ${badge.color}`} />
                <p className="text-[10px] font-bold text-slate-400 uppercase">{badge.label}</p>
              </div>
            ))}
          </div>

          {/* Info */}
          <p className="text-[10px] text-center text-slate-500">
            Dengan membeli, Anda menyetujui{" "}
            <Link href="/tos" className="text-yellow-500 hover:underline">
              Syarat & Ketentuan
            </Link>{" "}
            kami.
          </p>
        </div>
      </div>
    </div>
  );
}
