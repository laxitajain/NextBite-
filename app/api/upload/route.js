import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { authError, getRequestUser } from "@/lib/auth";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);
const MAX_SIZE = 5 * 1024 * 1024;

export async function POST(request) {
  try {
    const sessionUser = await getRequestUser(request);
    if (!sessionUser) return authError();

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { success: false, message: "No file provided" },
        { status: 400 }
      );
    }

    if (!ALLOWED.has(file.type)) {
      return NextResponse.json(
        { success: false, message: "Unsupported file type" },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, message: "File too large (max 5MB)" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "nextbite",
            resource_type: "image",
            transformation: [
              { width: 800, height: 800, crop: "limit", quality: "auto" },
            ],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        )
        .end(buffer);
    });

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to upload file" },
      { status: 500 }
    );
  }
}
