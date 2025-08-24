// src/MarketplaceBrowse.js
import React, { useEffect, useState } from "react";
import supabase from "./supabaseClient";

export default function MarketplaceBrowse({ newItem }) {
  const [items, setItems] = useState([]);
  const [log, setLog] = useState("⏳ Loading marketplace items...");
  const [error, setError] = useState(null);

  useEffect(() => {
    let channel;

    const fetchItems = async () => {
      try {
        setLog("⏳ Fetching items from Supabase...");
        const { data, error: fetchError } = await supabase
          .from("marketplace_items")
          .select(
            `id, title, price, wallet_address, image_url, description, created_at, seller:players(pi_username, seller_rating)`
          )
          .order("created_at", { ascending: false });

        if (fetchError) throw fetchError;

        setItems(data || []);
        setLog(`✅ Loaded ${data?.length || 0} items`);
      } catch (err) {
        console.error("Error fetching items:", err);
        setError(err.message || "Failed to load items");
        setLog("❌ Error fetching items. See error above.");
      }
    };

    fetchItems();

    // Real-time subscription
    try {
      channel = supabase
        .channel("marketplace_items_changes")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "marketplace_items" },
          (payload) => {
            setItems((current) => [payload.new, ...current]);
            setLog("🆕 New item added!");
          }
        )
        .subscribe();
    } catch (subErr) {
      console.error("Subscription error:", subErr);
      setError(subErr.message || "Failed to subscribe to real-time updates");
    }

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  // Update items immediately after a new upload
  useEffect(() => {
    if (newItem) {
      setItems((current) => [newItem, ...current]);
      setLog("🆕 Your new item was added!");
    }
  }, [newItem]);

  return (
    <div className="marketplace-browse">
      <h3>🔍 Browse Marketplace</h3>

      <div
        style={{
          border: "2px solid #333",
          borderRadius: "10px",
          padding: "10px",
          marginBottom: "15px",
          background: "#f9f9f9",
          minHeight: "40px",
        }}
      >
        <pre>{log}</pre>
        {error && <div style={{ color: "red" }}>❌ {error}</div>}
      </div>

      {items.length === 0 ? (
        <p>No items yet!</p>
      ) : (
        <div
          className="items-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: "10px",
          }}
        >
          {items.map((item) => (
            <div
              key={item.id}
              className="item-card"
              style={{
                border: "1px solid #ccc",
                padding: "10px",
                borderRadius: "8px",
              }}
            >
              <img
                src={item.image_url || "/placeholder.png"}
                alt={item.title}
                style={{
                  maxWidth: "100%",
                  maxHeight: "200px",
                  objectFit: "cover",
                }}
              />
              <h4>{item.title}</h4>
              <p>💰 {item.price} Pi</p>
              <p>👤 {item.seller?.pi_username ?? "Unknown Seller"} (Rating: {item.seller?.seller_rating ?? "N/A"})</p>
              <p>🏦 Wallet: {item.wallet_address ?? "Not provided"}</p>
              {item.description && <p>{item.description}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
