// src/App.jsx
import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";

export default function App() {
  const [name, setName] = useState("");
  const [protocol, setProtocol] = useState("");
  const [pin, setPin] = useState("");
  const [whatHappened, setWhatHappened] = useState("");
  const [signature, setSignature] = useState("");
  const [reports, setReports] = useState([]);

  const fetchReports = async () => {
    const snapshot = await getDocs(collection(db, "reports"));
    const data = snapshot.docs.map(doc => doc.data());
    setReports(data);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleSubmit = async () => {
    const allowedPins = {
      YSG: "9696",
      Azuz: "6969"
    };

    if (!name || !protocol || !pin) return alert("Please fill everything");
    if (pin !== allowedPins[name]) return alert("Wrong pin");

    const newEntry = {
      name,
      protocol,
      whatHappened,
      date: new Date().toLocaleString(),
      pin,
      signature
    };

    await addDoc(collection(db, "reports"), newEntry);
    setName("");
    setProtocol("");
    setPin("");
    setWhatHappened("");
    setSignature("");
    fetchReports();
  };

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h1>🛡️ Protocol Agreement Tracker</h1>

      <label>Violator:</label>
      <select value={name} onChange={e => setName(e.target.value)}>
        <option value="">Select</option>
        <option value="YSG">YSG</option>
        <option value="Azuz">Azuz</option>
      </select>

      <br />
      <label>Protocol Broken:</label>
      <select value={protocol} onChange={e => setProtocol(e.target.value)}>
        <option value="">Select</option>
        <option value="No Screenshot">No Screenshot</option>
        <option value="No Cursing">No Cursing</option>
        <option value="No Spamming">No Spamming</option>
      </select>

      <br />
      <label>What happened:</label>
      <textarea
        value={whatHappened}
        onChange={e => setWhatHappened(e.target.value)}
        placeholder="Explain the situation"
      />

      <br />
      <label>PIN:</label>
      <input
        type="password"
        value={pin}
        onChange={e => setPin(e.target.value)}
      />

      <br />
      <label>✍️ Signature:</label>
      <input
        type="text"
        value={signature}
        onChange={e => setSignature(e.target.value)}
      />

      <br />
      <button onClick={handleSubmit}>Submit Report</button>

      <hr />
      <h2>📋 Report Log</h2>
      {reports.map((r, i) => (
        <div key={i} style={{ marginBottom: 10 }}>
          <b>{r.name}</b> broke <i>{r.protocol}</i> — <small>{r.date}</small>
          <div>Reason: {r.whatHappened}</div>
          <div>Signed: {r.signature}</div>
        </div>
      ))}
    </div>
  );
}
