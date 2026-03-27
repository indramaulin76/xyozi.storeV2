import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Tentukan folder penyimpanan: public/uploads
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    
    // Buat folder jika belum ada
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (e) {}

    // Beri nama file unik agar tidak bentrok
    const fileName = `${Date.now()}-${file.name.replace(/\s/g, "-")}`;
    const filePath = path.join(uploadDir, fileName);

    await writeFile(filePath, buffer);

    // Kembalikan URL yang bisa diakses publik
    const publicUrl = `/uploads/${fileName}`;
    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
