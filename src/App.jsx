// src/App.jsx
import React, { useEffect, useState, useRef } from "react";
import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy
} from "firebase/firestore";

export default function App() {
  const [name, setName] = useState("");
  const [protocol, setProtocol] = useState("");
  const [pin, setPin] = useState("");
  const [whatHappened, setWhatHappened] = useState("");
  const [signature, setSignature] = useState("");
  const [reports, setReports] = useState([]);

  const protocols = [
    "Protocol 001 - Gaming Laws",
    "Protocol 002 - Roast Protection Acts",
    "Protocol 003 - Tech & Code Protocols",
    "Protocol 004 - The ISEF Pact",
    "Protocol 005 - Console Shaming Act",
    "Protocol 006 - Final Shaming Page"
  ];

  useEffect(() => {
    const q = query(collection(db, "violations"), orderBy("date", "desc"));
    const unsubscribe = onSnapshot(q, snapshot => {
      setReports(snapshot.docs.map(doc => doc.data()));
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const allowedPins = {
      YSG: "9696",
      ZAZUZ: "6969"
    };

    if (pin !== allowedPins[name]) {
      alert("Wrong PIN");
      return;
    }

    await addDoc(collection(db, "violations"), {
      name,
      protocol,
      whatHappened,
      signature,
      pin,
      date: new Date().toLocaleString()
    });

    setName("");
    setProtocol("");
    setPin("");
    setWhatHappened("");
    setSignature("");
  };

  return (
    <div style={{ padding: 30, fontFamily: "Arial" }}>
      <h1>⚔️ Protocol Agreement Tracker</h1>
      <form onSubmit={handleSubmit}>
        <select value={name} onChange={(e) => setName(e.target.value)} required>
          <option value="">Select Violator</option>
          <option value="YSG">YSG</option>
          <option value="ZAZUZ">ZAZUZ</option>
        </select>

        <select value={protocol} onChange={(e) => setProtocol(e.target.value)} required>
          <option value="">Select Protocol</option>
          {protocols.map((p, i) => (
            <option key={i} value={p}>{p}</option>
          ))}
        </select>

        <textarea placeholder="What happened?" value={whatHappened} onChange={(e) => setWhatHappened(e.target.value)} required />
        <input placeholder="PIN" value={pin} onChange={(e) => setPin(e.target.value)} required />
        <input placeholder="Signature" value={signature} onChange={(e) => setSignature(e.target.value)} required />

        <button type="submit">Submit Report</button>
      </form>

      <hr />

      <h2>📊 Reports</h2>
      {reports.length === 0 && <p>No reports yet.</p>}
      <ul>
        {reports.map((r, i) => (
          <li key={i}>
            <strong>{r.name}</strong> violated <strong>{r.protocol}</strong> at <em>{r.date}</em>
            <br />
            Reason: {r.whatHappened}
            <br />
            Signed: {r.signature}
          </li>
        ))}
      </ul>
    </div>
  );
}