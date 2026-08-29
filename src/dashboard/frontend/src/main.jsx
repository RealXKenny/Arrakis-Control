import React from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

function App() {
  return <main className="landing"><p className="eyebrow">CRIMSON SKIES</p><h1>Walk without rhythm.</h1><p className="subtitle">A Dune: Awakening community server for explorers, builders, fighters, and traders of Arrakis.</p><section className="status"><span className="dot" /><div><b>Server online</b><small>Population: 0 / 60 • North America • Public</small></div></section><div className="features"><span>✦ PvE community</span><span>✦ Guilds & alliances</span><span>✦ Trading & economy</span></div><a className="button" href="/auth/login">Owner sign in →</a></main>;
}

createRoot(document.getElementById("root")).render(<App />);
