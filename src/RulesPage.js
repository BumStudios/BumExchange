// src/RulesPage.js
import React from "react";
import "./RulesPage.css"; // We'll put background CSS here

export default function RulesPage({ onAccept }) {
  return (
    <div className="rules-page">
      <div className="rules-overlay">
        <h1>📜 BumExchange Rules</h1>
        <div className="rules-content">
          <p>Welcome to BumExchange! Before using the marketplace, please read and agree to the rules below:</p>
          <ul>
            <li>💰 All purchases are made directly between users.</li>
            <li>⚠️ We do not handle payments or shipping.</li>
            <li>🛒 Only list items you own and are legally allowed to sell.</li>
            <li>⭐ Treat other users respectfully and honestly.</li>
            <li>❌ No fraudulent or prohibited items allowed.</li>
            <li>⏳ Items may be removed automatically after a set period.</li>
          </ul>
          <p>By clicking "Accept Rules", you agree to follow these rules while using BumExchange.</p>
          <button className="btn" onClick={onAccept}>✅ Accept Rules</button>
        </div>
      </div>
    </div>
  );
}
