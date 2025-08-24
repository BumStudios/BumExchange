// src/MarketplaceUpload.js
import React, { useState } from "react";
import supabase from "./supabaseClient";

export default function MarketplaceUpload({ player }) {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [wallet, setWallet] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [log, setLog] = useState("");
  const [error, setError] = useState(null);

  const handleUpload = async () => {
    if (!player) {
      setError("❌ Player not loaded. Cannot upload item.");
      return;
    }

    if (!title || !price || !file || !wallet) {
      setError("❌ Fill all fields, select an image, and enter your Pi wallet address!");
      return;
    }

    setUploading(true);
    setLog("⏳ Starting upload...");
    setError(null);

    try {
      // Generate file path
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `public/${fileName}`;

      setLog(`📤 Uploading file to Supabase Storage bucket [marketplace-images]...`);

      // Upload to storage bucket
      const { data: storageData, error: storageError } = await supabase.storage
        .from("marketplace-images")
        .upload(filePath, file, { cacheControl: "3600", upsert: false });

      if (storageError) throw storageError;

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from("marketplace-images")
        .getPublicUrl(filePath);

      const image_url = publicUrlData?.publicUrl;
      if (!image_url) throw new Error("Failed to get public URL from Supabase");

      setLog("💾 Inserting item into marketplace_items table...");

      // Insert item using player.id as seller
      const { error: dbError } = await supabase.from("marketplace_items").insert([
        {
          seller: player.id,
          title,
          price,
          description,
          wallet_address: wallet,
          image_url,
        },
      ]);

      if (dbError) throw dbError;

      setLog("✅ Item uploaded successfully!");
      setTitle("");
      setPrice("");
      setDescription("");
      setWallet("");
      setFile(null);
    } catch (err) {
      console.error("Upload failed:", err);
      setError(err.message || "Unknown upload error");
      setLog("❌ Upload failed. See error above.");
    } finally {
      setUploading(false);
    }
  };

  if (!player) {
    return <div style={{ color: "red" }}>❌ Player data not loaded. Cannot show upload form.</div>;
  }

  return (
    <div className="marketplace-upload" style={{ maxWidth: "500px", margin: "0 auto" }}>
      <h3>🛒 Upload Item</h3>

      <div style={{ border: "1px solid #ccc", padding: "10px", borderRadius: "8px", marginBottom: "10px" }}>
        <pre>{log}</pre>
        {error && <div style={{ color: "red" }}>{error}</div>}
      </div>

      <input
        type="text"
        placeholder="Item Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        type="number"
        placeholder="Price in Pi"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />
      <input
        type="text"
        placeholder="Your Pi Wallet Address"
        value={wallet}
        onChange={(e) => setWallet(e.target.value)}
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />

      <button className="btn" onClick={handleUpload} disabled={uploading}>
        {uploading ? "Uploading..." : "Upload Item"}
      </button>
    </div>
  );
}
