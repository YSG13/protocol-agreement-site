import React, { useState, useEffect, useRef } from "react";
import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";

export default function App() {
  const [name, setName] = useState("");
  const [protocol, setProtocol] = useState("");
  const [pin, setPin] = useState("");
  const [whatHappened, setWhatHappened] = useState("");
  const [signature, setSignature] = useState("");
  const [reports, setReports] = useState([]);
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const protocols = [
    "Protocol 001 — Gaming Laws",
    "Protocol 002 — Roast Protection Acts",
    "Protocol 003 — Tech & Code Protocols",
    "Protocol 004 — The ISEF Pact",
    "Protocol 005 — Console Shaming Act",
    "Protocol 006 — Final Signature Page"
  ];

  useEffect(() => {
    const q = query(collection(db, "violations"), orderBy("date", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setReports(snapshot.docs.map((doc) => doc.data()));
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async () => {
    const allowedPins = {
      YSG: "9696",
      Azuz: "6969",
    };

    if (!name || !protocol || !pin || !signature || !whatHappened) return alert("Fill all fields");
    if (pin !== allowedPins[name]) return alert("Wrong PIN");

    await addDoc(collection(db, "violations"), {
      name,
      protocol,
      pin,
      whatHappened,
      signature,
      date: new Date().toLocaleString(),
    });

    setName("");
    setProtocol("");
    setPin("");
    setWhatHappened("");
    setSignature("");
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  const startDraw = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    const ctx = canvasRef.current.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const draw = ({ nativeEvent }) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = nativeEvent;
    const ctx = canvasRef.current.getContext("2d");
    ctx.lineTo(offsetX, offsetY);
    ctx.stroke();
  };

  const endDraw = () => {
    setIsDrawing(false);
    const dataURL = canvasRef.current.toDataURL();
    setSignature(dataURL);
  };

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h1>🛡️ Protocol Agreement Tracker</h1>

      <label>
        Select Violator
        <select value={name} onChange={(e) => setName(e.target.value)}>
          <option value="">--</option>
          <option value="YSG">YSG</option>
          <option value="Azuz">Azuz</option>
        </select>
      </label>
      <br /><br />

      <label>
        Select Protocol
        <select value={protocol} onChange={(e) => setProtocol(e.target.value)}>
          <option value="">--</option>
          {protocols.map((p, i) => (
            <option key={i} value={p}>{p}</option>
          ))}
        </select>
      </label>
      <br /><br />

      <textarea
        placeholder="What happened?"
        value={whatHappened}
        onChange={(e) => setWhatHappened(e.target.value)}
      /><br /><br />

      <input
        type="password"
        placeholder="PIN"
        value={pin}
        onChange={(e) => setPin(e.target.value)}
      /><br /><br />

      <div>
        ✍️ Signature:
        <br />
        <canvas
          ref={canvasRef}
          width={300}
          height={100}
          style={{ border: "1px solid black" }}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
        />
      </div>
      <br />

      <button onClick={handleSubmit}>Submit Report</button>

      <hr />

      <h3>📋 Reports</h3>
      {reports.map((r, i) => (
        <div key={i} style={{ marginBottom: 10, padding: 10, border: "1px solid gray" }}>
          <b>{r.name}</b> broke <b>{r.protocol}</b><br />
          🕓 {r.date}<br />
          📄 {r.whatHappened}<br />
          ✍️ <img src={r.signature} alt="signature" style={{ width: 100 }} />
        </div>
      ))}
    </div>
  );
}