// src/App.js
import React, { useState, useEffect } from "react";
import supabase from "./supabaseClient";
import "./App.css";
import MarketplaceUpload from "./MarketplaceUpload";
import MarketplaceBrowse from "./MarketplaceBrowse";
import RulesPage from "./RulesPage";

function App() {
  const [user, setUser] = useState(null);      // Pi user info
  const [player, setPlayer] = useState(null);  // Supabase player row
  const [sdkReady, setSdkReady] = useState(false);
  const [view, setView] = useState("browse");
  const [log, setLog] = useState("Initializing...");
  const [error, setError] = useState(null);
  const [acceptedRules, setAcceptedRules] = useState(false);

  // ---------------- Pi SDK Detection ----------------
  useEffect(() => {
    const checkPi = () => {
      if (window.Pi) {
        setSdkReady(true);
        setLog("✅ Pi SDK detected!");
      } else {
        setLog("⚠️ Pi SDK not found. Retrying...");
        setTimeout(checkPi, 500);
      }
    };
    checkPi();
  }, []);

  // ---------------- Login ----------------
  const handleLogin = async () => {
    if (!window.Pi) {
      setError("Pi SDK not loaded. Open in Pi Browser.");
      return;
    }

    try {
      setLog("🔑 Initializing Pi SDK...");
      await window.Pi.init({
        version: "2.0",
        appId: "BumExchange",
        devApiKey:
          "brhkudws69iqcs15tggzyethl9wekuqm64cq0f1hguobcvsdzuximr6as5vnnltr",
      });

      setLog("🟢 Pi SDK initialized. Authenticating...");
      const scopes = ["username"];
      const authResult = await window.Pi.authenticate(scopes);

      if (!authResult?.user) {
        throw new Error("Login succeeded but no user info returned.");
      }

      setUser(authResult.user);
      setLog(`👋 Pi user: ${authResult.user.username}`);

      // ---------------- Supabase Mapping ----------------
      setLog("⏳ Fetching player from Supabase...");
      const { data: playerData, error: fetchError } = await supabase
        .from("players")
        .select("*")
        .eq("pi_username", authResult.user.username)
        .maybeSingle();

      if (fetchError) throw fetchError;

      let currentPlayer = playerData;

      if (!playerData) {
        setLog("➕ Creating new player in Supabase...");
        const { data: newPlayer, error: insertError } = await supabase
          .from("players")
          .insert([{ pi_username: authResult.user.username, seller_rating: 0, prelim_seller_rating: 0 }])
          .select()
          .maybeSingle();

        if (insertError) throw insertError;

        currentPlayer = newPlayer;
        setLog(`✅ Created new player: ${newPlayer.id}`);
      } else {
        setLog(`✅ Fetched existing player: ${playerData.id}`);
      }

      setPlayer(currentPlayer);
      setLog("🎉 Login & Supabase mapping complete!");
    } catch (err) {
      console.error("Login failed:", err);
      setError(err.message || "Unknown error during login");
      setLog("❌ Login failed. See error below.");
    }
  };

  const isLinking = !!user && !player;

  // ---------------- UI ----------------
  if (!acceptedRules) {
    return <RulesPage onAccept={() => setAcceptedRules(true)} />;
  }

  return (
    <div className="App">
      <div className="overlay">
        <h1 className="title">💱 BumExchange</h1>

        {/* Debug / Error Box */}
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

        {!sdkReady ? (
          <p>Loading Pi SDK… please open in Pi Browser.</p>
        ) : !user ? (
          <>
            <p className="instruction">🔐 Log in with Pi to access BumExchange</p>
            <button className="btn" onClick={handleLogin}>
              Log in with Pi
            </button>
          </>
        ) : isLinking ? (
          <p>⏳ Linking Pi account to Supabase… please wait.</p>
        ) : (
          <>
            <h2 className="welcome">👋 Welcome, {user.username || "User"}!</h2>

            <div
              className="marketplace-nav"
              style={{ display: "flex", gap: "10px", marginBottom: "20px" }}
            >
              <button
                className={`btn ${view === "upload" ? "active" : ""}`}
                onClick={() => setView("upload")}
              >
                🛒 Upload Item
              </button>
              <button
                className={`btn ${view === "browse" ? "active" : ""}`}
                onClick={() => setView("browse")}
              >
                🔍 Browse Marketplace
              </button>
            </div>

            <div
              className="marketplace-content"
              style={{ padding: view === "upload" ? "20px" : "0px" }}
            >
              {view === "upload" ? (
                <MarketplaceUpload player={player} />
              ) : (
                <MarketplaceBrowse />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
