"use client";

import React, { useState, useEffect, useRef } from "react";
import { Save, Monitor, Globe, Share2, Phone, FileText, Copyright, Upload, Loader2, Image as ImageIcon, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getWebsiteSettings, updateWebsiteSettings } from "@/lib/actions/settings";

interface WebsiteSettings {
  siteName: string;
  siteLogo: string | null;
  siteLogoText: string;
  siteTagline: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  socialFacebook: string;
  socialInstagram: string;
  socialTikTok: string;
  socialYouTube: string;
  contactEmail: string;
  contactWhatsApp: string;
  contactAddress: string;
  contactHotline: string;
  pageAboutUs: string;
  pageTermsOfService: string;
  pagePrivacyPolicy: string;
  footerCopyright: string;
}

export default function AdminPengaturanPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [activeTab, setActiveTab] = useState("toko");
  const [showPreview, setShowPreview] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  
  const currentYear = new Date().getFullYear();
  const [settings, setSettings] = useState<WebsiteSettings>({
    siteName: "",
    siteLogo: null,
    siteLogoText: "Tokomu",
    siteTagline: "Top Up Game Terpercaya",
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
    socialFacebook: "",
    socialInstagram: "",
    socialTikTok: "",
    socialYouTube: "",
    contactEmail: "",
    contactWhatsApp: "",
    contactAddress: "",
    contactHotline: "",
    pageAboutUs: "",
    pageTermsOfService: "",
    pagePrivacyPolicy: "",
    footerCopyright: "© " + currentYear + " Xyozi Store. All rights reserved.",
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    const data = await getWebsiteSettings();
    setSettings(data);
    setLoading(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      
      if (data.url) {
        setSettings(prev => ({ ...prev, siteLogo: data.url }));
      }
    } catch (error) {
      alert("Gagal upload logo!");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const result = await updateWebsiteSettings(settings);
    setSaving(false);

    if (result.success) {
      alert("Pengaturan berhasil disimpan!");
    } else {
      alert(result.error || "Gagal menyimpan pengaturan");
    }
  };

  const updateField = (field: keyof WebsiteSettings, value: string) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight">Pengaturan Sistem</h1>
          <p className="text-sm text-slate-400 mt-1">Konfigurasikan semua pengaturan website Anda.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowPreview(!showPreview)}
            className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 transition-all"
          >
            <Eye size={16} /> {showPreview ? "Sembunyikan" : "Preview"}
          </button>
          <button 
            onClick={handleSave} 
            disabled={saving}
            className="bg-yellow-500 hover:bg-yellow-400 text-black px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-yellow-500/30 active:scale-95 transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={16} />} 
            Simpan
          </button>
        </div>
      </div>

      {showPreview && (
        <Card className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/10 border-yellow-500/30 rounded-2xl overflow-hidden">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex items-center gap-3">
              {settings.siteLogo ? (
                <img src={settings.siteLogo} alt="Logo" className="h-8 object-contain" />
              ) : (
                <span className="text-xl font-black text-yellow-500">{settings.siteLogoText}</span>
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-white">{settings.siteName}</h3>
              <p className="text-xs text-slate-400">{settings.siteTagline}</p>
            </div>
            {settings.contactWhatsApp && (
              <a 
                href={`https://wa.me/${settings.contactWhatsApp.replace(/D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-500 hover:bg-green-400 text-white px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2"
              >
                <Phone size={14} /> Hubungi Kami
              </a>
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col gap-0">
        <div className="bg-slate-900 border border-slate-800 rounded-t-xl overflow-x-auto">
          <div className="flex items-stretch">
            <button onClick={() => setActiveTab("toko")} className={`px-5 py-3 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 border-r border-slate-700 ${activeTab === "toko" ? "bg-yellow-500 text-black" : "text-slate-400 hover:text-white hover:bg-slate-800"}`}>
              <Monitor size={16} /> Toko
            </button>
            <button onClick={() => setActiveTab("seo")} className={`px-5 py-3 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 border-r border-slate-700 ${activeTab === "seo" ? "bg-yellow-500 text-black" : "text-slate-400 hover:text-white hover:bg-slate-800"}`}>
              <Globe size={16} /> SEO
            </button>
            <button onClick={() => setActiveTab("sosial")} className={`px-5 py-3 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 border-r border-slate-700 ${activeTab === "sosial" ? "bg-yellow-500 text-black" : "text-slate-400 hover:text-white hover:bg-slate-800"}`}>
              <Share2 size={16} /> Sosial
            </button>
            <button onClick={() => setActiveTab("kontak")} className={`px-5 py-3 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 border-r border-slate-700 ${activeTab === "kontak" ? "bg-yellow-500 text-black" : "text-slate-400 hover:text-white hover:bg-slate-800"}`}>
              <Phone size={16} /> Kontak
            </button>
            <button onClick={() => setActiveTab("halaman")} className={`px-5 py-3 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 border-r border-slate-700 ${activeTab === "halaman" ? "bg-yellow-500 text-black" : "text-slate-400 hover:text-white hover:bg-slate-800"}`}>
              <FileText size={16} /> Halaman
            </button>
            <button onClick={() => setActiveTab("footer")} className={`px-5 py-3 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${activeTab === "footer" ? "bg-yellow-500 text-black" : "text-slate-400 hover:text-white hover:bg-slate-800"}`}>
              <Copyright size={16} /> Footer
            </button>
          </div>
        </div>

        {activeTab === "toko" && (
          <div className="bg-slate-900 border border-slate-800 border-t-0 rounded-b-xl overflow-hidden">
            <div className="space-y-6">
              <Card className="bg-slate-900 border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="px-6 py-4 border-b border-slate-800 bg-slate-800/30 flex items-center gap-3">
                  <Monitor size={18} className="text-yellow-500" />
                  <h3 className="font-bold text-white text-sm uppercase">Logo & Identitas</h3>
                </div>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Logo Website</label>
                      <div onClick={() => logoInputRef.current?.click()} className="relative h-32 bg-slate-950 border-2 border-dashed border-slate-700 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-yellow-500 hover:bg-yellow-500/5 transition-all overflow-hidden group">
                        {uploadingLogo ? (
                          <Loader2 className="w-10 h-10 animate-spin text-yellow-500" />
                        ) : settings.siteLogo ? (
                          <div className="relative w-full h-full p-4 flex items-center justify-center">
                            <img src={settings.siteLogo} alt="Logo" className="max-w-full max-h-full object-contain" />
                            <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                              <Upload size={24} className="text-white" />
                            </div>
                          </div>
                        ) : (
                          <>
                            <ImageIcon size={32} className="text-slate-600 mb-2" />
                            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Klik untuk Upload</span>
                          </>
                        )}
                        <input type="file" ref={logoInputRef} hidden accept="image/*" onChange={handleFileUpload} />
                      </div>
                      <p className="text-xs text-slate-500">PNG, JPG, GIF. Ukuran: 440x100px</p>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nama Toko</label>
                        <Input className="bg-slate-950 border-slate-700 h-12 rounded-xl text-white" placeholder="Xyozi Store" value={settings.siteName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField("siteName", e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tagline</label>
                        <Input className="bg-slate-950 border-slate-700 h-12 rounded-xl text-white" placeholder="Top Up Game Terpercaya" value={settings.siteTagline} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField("siteTagline", e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Teks Logo Fallback</label>
                        <Input className="bg-slate-950 border-slate-700 h-12 rounded-xl text-white" placeholder="Tokomu" value={settings.siteLogoText} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField("siteLogoText", e.target.value)} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-slate-900 border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="px-6 py-4 border-b border-slate-800 bg-slate-800/30 flex items-center gap-3">
                  <Eye size={18} className="text-purple-500" />
                  <h3 className="font-bold text-white text-sm uppercase">Preview Navbar</h3>
                </div>
                <CardContent className="p-6">
                  <div className="bg-slate-950 rounded-xl p-5 border border-slate-700">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-3">
                        {settings.siteLogo ? (
                          <img src={settings.siteLogo} alt="Logo" className="h-10 object-contain" />
                        ) : (
                          <span className="text-xl font-black text-yellow-500">{settings.siteLogoText}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-6 text-sm text-slate-400">
                        <span>Beranda</span>
                        <span>Produk</span>
                        <span>Cek Transaksi</span>
                        <span>Bantuan</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-3 text-sm text-slate-500">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    {settings.siteTagline || "Tagline toko"}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "seo" && (
          <div className="bg-slate-900 border border-slate-800 border-t-0 rounded-b-xl overflow-hidden">
            <Card className="bg-slate-900 border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="px-6 py-4 border-b border-slate-800 bg-slate-800/30 flex items-center gap-3">
                <Globe size={18} className="text-yellow-500" />
                <h3 className="font-bold text-white text-sm uppercase">Pengaturan SEO</h3>
              </div>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Meta Title</label>
                    <span className="text-[10px] text-slate-500">{settings.seoTitle.length}/60</span>
                  </div>
                  <Input 
                    className="bg-slate-950 border-slate-800 rounded-xl" 
                    placeholder="Top Up Game Termurah | Xyozi Store" 
                    value={settings.seoTitle} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField("seoTitle", e.target.value)} 
                    maxLength={60} 
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Meta Description</label>
                    <span className="text-[10px] text-slate-500">{settings.seoDescription.length}/160</span>
                  </div>
                  <Textarea 
                    className="bg-slate-950 border-slate-800 rounded-xl min-h-[100px]" 
                    placeholder="Top up game termurah..." 
                    value={settings.seoDescription} 
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateField("seoDescription", e.target.value)} 
                    maxLength={160} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Keywords</label>
                  <Input 
                    className="bg-slate-950 border-slate-800 rounded-xl" 
                    placeholder="top up game, diamond ml" 
                    value={settings.seoKeywords} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField("seoKeywords", e.target.value)} 
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "sosial" && (
          <div className="bg-slate-900 border border-slate-800 border-t-0 rounded-b-xl overflow-hidden">
            <Card className="bg-slate-900 border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="px-6 py-4 border-b border-slate-800 bg-slate-800/30 flex items-center gap-3">
                <Share2 size={18} className="text-yellow-500" />
                <h3 className="font-bold text-white text-sm uppercase">Media Sosial</h3>
              </div>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Facebook</label>
                    <Input 
                      className="bg-slate-950 border-slate-800 rounded-xl" 
                      placeholder="https://facebook.com/xyozistore" 
                      value={settings.socialFacebook} 
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField("socialFacebook", e.target.value)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Instagram</label>
                    <Input 
                      className="bg-slate-950 border-slate-800 rounded-xl" 
                      placeholder="https://instagram.com/xyozistore" 
                      value={settings.socialInstagram} 
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField("socialInstagram", e.target.value)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">TikTok</label>
                    <Input 
                      className="bg-slate-950 border-slate-800 rounded-xl" 
                      placeholder="https://tiktok.com/@xyozistore" 
                      value={settings.socialTikTok} 
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField("socialTikTok", e.target.value)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">YouTube</label>
                    <Input 
                      className="bg-slate-950 border-slate-800 rounded-xl" 
                      placeholder="https://youtube.com/@xyozistore" 
                      value={settings.socialYouTube} 
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField("socialYouTube", e.target.value)} 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "kontak" && (
          <div className="bg-slate-900 border border-slate-800 border-t-0 rounded-b-xl overflow-hidden">
            <Card className="bg-slate-900 border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="px-6 py-4 border-b border-slate-800 bg-slate-800/30 flex items-center gap-3">
                <Phone size={18} className="text-yellow-500" />
                <h3 className="font-bold text-white text-sm uppercase">Informasi Kontak</h3>
              </div>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">WhatsApp</label>
                    <Input 
                      className="bg-slate-950 border-slate-800 rounded-xl" 
                      placeholder="6281234567890" 
                      value={settings.contactWhatsApp} 
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField("contactWhatsApp", e.target.value)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email</label>
                    <Input 
                      className="bg-slate-950 border-slate-800 rounded-xl" 
                      placeholder="support@xyozistore.com" 
                      value={settings.contactEmail} 
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField("contactEmail", e.target.value)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Hotline</label>
                    <Input 
                      className="bg-slate-950 border-slate-800 rounded-xl" 
                      placeholder="(021) 1234 5678" 
                      value={settings.contactHotline} 
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField("contactHotline", e.target.value)} 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Alamat</label>
                  <Textarea 
                    className="bg-slate-950 border-slate-800 rounded-xl min-h-[100px]" 
                    placeholder="Jl. Gaming No. 1, Jakarta" 
                    value={settings.contactAddress} 
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateField("contactAddress", e.target.value)} 
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "halaman" && (
          <div className="bg-slate-900 border border-slate-800 border-t-0 rounded-b-xl overflow-hidden">
            <div className="space-y-5 p-6">
              <Card className="bg-slate-900 border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                <div className="p-5 border-b border-slate-800 bg-slate-800/30 flex items-center gap-3">
                  <FileText size={18} className="text-yellow-500" />
                  <h3 className="font-bold text-white text-sm uppercase">Tentang Kami</h3>
                </div>
                <CardContent className="p-6">
                  <Textarea 
                    className="bg-slate-950 border-slate-800 rounded-xl min-h-[100px]" 
                    placeholder="Ceritakan tentang toko Anda..." 
                    value={settings.pageAboutUs} 
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateField("pageAboutUs", e.target.value)} 
                  />
                </CardContent>
              </Card>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <Card className="bg-slate-900 border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                  <div className="p-5 border-b border-slate-800 bg-slate-800/30 flex items-center gap-3">
                    <FileText size={18} className="text-blue-500" />
                    <h3 className="font-bold text-white text-sm uppercase">Syarat & Ketentuan</h3>
                  </div>
                  <CardContent className="p-6">
                    <Textarea 
                      className="bg-slate-950 border-slate-800 rounded-xl min-h-[100px]" 
                      placeholder="Ketentuan layanan..." 
                      value={settings.pageTermsOfService} 
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateField("pageTermsOfService", e.target.value)} 
                    />
                  </CardContent>
                </Card>
                <Card className="bg-slate-900 border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                  <div className="p-5 border-b border-slate-800 bg-slate-800/30 flex items-center gap-3">
                    <FileText size={18} className="text-green-500" />
                    <h3 className="font-bold text-white text-sm uppercase">Kebijakan Privasi</h3>
                  </div>
                  <CardContent className="p-6">
                    <Textarea 
                      className="bg-slate-950 border-slate-800 rounded-xl min-h-[100px]" 
                      placeholder="Kebijakan privasi..." 
                      value={settings.pagePrivacyPolicy} 
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateField("pagePrivacyPolicy", e.target.value)} 
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {activeTab === "footer" && (
          <div className="bg-slate-900 border border-slate-800 border-t-0 rounded-b-xl overflow-hidden">
            <Card className="bg-slate-900 border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="px-6 py-4 border-b border-slate-800 bg-slate-800/30 flex items-center gap-3">
                <Copyright size={18} className="text-yellow-500" />
                <h3 className="font-bold text-white text-sm uppercase">Pengaturan Footer</h3>
              </div>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Copyright Text</label>
                  <Input 
                    className="bg-slate-950 border-slate-700 h-12 rounded-xl text-white" 
                    placeholder="© 2026 Xyozi Store. All rights reserved." 
                    value={settings.footerCopyright} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField("footerCopyright", e.target.value)} 
                  />
                </div>
                <div className="bg-slate-950 rounded-xl p-4 border border-slate-800">
                  <p className="text-xs text-slate-500 mb-2">Preview Footer:</p>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>{settings.footerCopyright}</span>
                    <div className="flex items-center gap-4">
                      {settings.socialFacebook && <span>Facebook</span>}
                      {settings.socialInstagram && <span>Instagram</span>}
                      {settings.contactWhatsApp && <span>WhatsApp</span>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
