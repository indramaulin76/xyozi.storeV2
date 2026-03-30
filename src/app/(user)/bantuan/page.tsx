"use client";

import React, { useState, useEffect } from "react";
import { LifeBuoy, Mail, MessageCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { getWebsiteSettings } from "@/lib/actions/settings";
import { Loader2 } from "lucide-react";

interface WebsiteSettings {
  contactWhatsApp: string;
  contactEmail: string;
}

const FAQS = [
  {
    question: "Berapa lama proses top up?",
    answer: "Sebagian besar proses top up kami berjalan otomatis dan akan masuk ke akun Anda dalam hitungan detik (1-3 menit). Namun, untuk beberapa game mungkin membutuhkan waktu hingga 15 menit."
  },
  {
    question: "Metode pembayaran apa saja yang tersedia?",
    answer: "Kami menerima berbagai metode pembayaran termasuk QRIS (semua E-Wallet & M-Banking), DANA, GoPay, ShopeePay, LinkAja, OVO, dan Virtual Account (BCA, BNI, Mandiri, BRI)."
  },
  {
    question: "Bagaimana jika pesanan saya belum masuk?",
    answer: "Pertama, pastikan User ID yang Anda masukkan sudah benar. Jika sudah benar namun belum masuk lebih dari 30 menit, silakan hubungi tim CS kami melalui WhatsApp dengan menyertakan Nomor Invoice Anda."
  },
  {
    question: "Apakah bisa refund (pengembalian dana)?",
    answer: "Refund hanya bisa dilakukan jika transaksi gagal karena kesalahan sistem kami atau produk sedang kosong. Kesalahan pengisian User ID dari pihak pembeli tidak dapat di-refund."
  }
];

export default function BantuanPage() {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<WebsiteSettings>({
    contactWhatsApp: "",
    contactEmail: ""
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await getWebsiteSettings();
      setSettings({
        contactWhatsApp: data.contactWhatsApp || "",
        contactEmail: data.contactEmail || ""
      });
    } catch (error) {
      console.error("Failed to load settings:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 pb-20 pt-8 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 pb-20 pt-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center space-y-4 mb-12">
          <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <LifeBuoy className="w-8 h-8 text-yellow-500" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter">
            Pusat Bantuan
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto">
            Temukan jawaban atas pertanyaan Anda atau hubungi tim Customer Service kami yang siap membantu 24/7.
          </p>
        </div>

        {(settings.contactWhatsApp || settings.contactEmail) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 max-w-md mx-auto gap-6 mb-12">
            {settings.contactWhatsApp && (
              <ContactCard 
                icon={<MessageCircle className="w-6 h-6 text-green-500" />} 
                title="WhatsApp" 
                value={settings.contactWhatsApp} 
                link={`https://wa.me/${settings.contactWhatsApp.replace(/[^0-9]/g, '')}`} 
              />
            )}
            {settings.contactEmail && (
              <ContactCard 
                icon={<Mail className="w-6 h-6 text-red-500" />} 
                title="Email" 
                value={settings.contactEmail} 
                link={`mailto:${settings.contactEmail}`} 
              />
            )}
          </div>
        )}

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-6 uppercase">Tanya Jawab (FAQ)</h2>
          <Accordion className="w-full">
            {FAQS.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-slate-800">
                <AccordionTrigger className="text-left font-bold text-slate-200 hover:text-yellow-400">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-slate-400 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
}

function ContactCard({ icon, title, value, link }: { icon: React.ReactNode, title: string, value: string, link: string }) {
  return (
    <a href={link} target="_blank" rel="noopener noreferrer" className="block outline-none">
      <Card className="bg-slate-900 border-slate-800 rounded-2xl hover:border-yellow-500 transition-all shadow-xl hover:-translate-y-1">
        <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
          <div className="bg-slate-950 p-3 rounded-full border border-slate-800">
            {icon}
          </div>
          <div>
            <h4 className="font-bold text-white">{title}</h4>
            <p className="text-sm text-slate-400 mt-1">{value}</p>
          </div>
        </CardContent>
      </Card>
    </a>
  );
}
