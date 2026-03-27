"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X, ImageIcon, Loader2 } from "lucide-react";
import { uploadProductImage, deleteProductImage } from "@/lib/actions/product";

interface ImageUploadProps {
  productId: string;
  productName: string;
  currentImageUrl?: string | null;
  onUploadSuccess?: () => void;
}

export function ImageUpload({ 
  productId, 
  productName, 
  currentImageUrl,
  onUploadSuccess 
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    setError(null);
    
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      setError("Format file tidak didukung. Gunakan: JPG, PNG, WEBP, GIF");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Ukuran file terlalu besar. Maksimal 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleUpload = async () => {
    if (!preview) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      const response = await fetch(preview);
      const blob = await response.blob();
      const file = new File([blob], "image.png", { type: blob.type });
      formData.append("image", file);

      const result = await uploadProductImage(productId, formData);

      if (result.success) {
        setPreview(null);
        onUploadSuccess?.();
      } else {
        setError(result.error || "Gagal mengupload gambar");
      }
    } catch (err) {
      setError("Terjadi kesalahan saat upload");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Apakah Anda yakin ingin menghapus gambar ini?")) return;

    setDeleting(true);
    setError(null);

    const result = await deleteProductImage(productId);

    if (result.success) {
      onUploadSuccess?.();
    } else {
      setError(result.error || "Gagal menghapus gambar");
    }

    setDeleting(false);
  };

  const displayImage = preview || currentImageUrl;

  return (
    <div className="space-y-3">
      <div className="text-xs font-medium text-slate-400">
        Upload Gambar untuk: <span className="text-white font-bold">{productName}</span>
      </div>

      {/* Drop Zone / Preview */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={() => setDragOver(false)}
        className={`
          relative border-2 border-dashed rounded-2xl p-6 text-center transition-all
          ${dragOver ? "border-blue-500 bg-blue-500/10" : "border-slate-700 bg-slate-800/50"}
          ${displayImage ? "border-solid" : ""}
        `}
      >
        {displayImage ? (
          <>
            <div className="relative w-full h-40 mb-3">
              <Image
                src={displayImage}
                alt={productName}
                fill
                className="object-contain rounded-xl"
              />
            </div>
            {!preview && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="absolute top-2 right-2 p-2 bg-red-500/80 hover:bg-red-500 text-white rounded-full transition-colors disabled:opacity-50"
              >
                {deleting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <X size={14} />
                )}
              </button>
            )}
          </>
        ) : (
          <div className="py-4">
            <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
              {dragOver ? (
                <Upload size={24} className="text-blue-400" />
              ) : (
                <ImageIcon size={24} className="text-slate-500" />
              )}
            </div>
            <p className="text-sm text-slate-400 mb-1">
              {dragOver ? "Lepaskan file di sini" : "Seret gambar ke sini atau"}
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-blue-400 hover:text-blue-300 text-sm font-medium underline"
            >
              pilih dari komputer
            </button>
            <p className="text-xs text-slate-500 mt-2">JPG, PNG, WEBP, GIF - Maksimal 5MB</p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleInputChange}
          className="hidden"
        />
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-xs text-red-400 bg-red-500/10 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}

      {/* Upload Button (only show when preview exists) */}
      {preview && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleUpload}
            disabled={uploading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-colors"
          >
            {uploading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Mengupload...
              </>
            ) : (
              <>
                <Upload size={14} />
                Upload Gambar
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => setPreview(null)}
            className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Batal
          </button>
        </div>
      )}
    </div>
  );
}
