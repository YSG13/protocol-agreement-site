// App.jsx (complete working code)
import React, { useState, useRef, useEffect } from "react";
import { db } from "./firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  getDocs,
  orderBy,
  query,
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
    "Protocol 001 - Gaming Laws",
    "Protocol 002 - Roast Protection Acts",
    "Protocol 003 - Tech & Code Protocols",
    "Protocol 004 - The ISEF Pact",
    "Protocol 005 - Console Shaming Act",
    "Protocol 006 - Final Shaming Page",
  ];

  useEffect(() => {
    const q = query(collection(db, "violations"), orderBy("date", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setReports(snapshot.docs.map((doc) => doc.data()));
    });
    return () => unsubscribe();
  }, []);

  const handleMouseDown = (e) => {
    setIsDrawing(true);
    const ctx = canvasRef.current.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;
    const ctx = canvasRef.current.getContext("2d");
    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.stroke();
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    setSignature(canvasRef.current.toDataURL());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const allowedPins = {
      YSG: "9696",
      Azuz: "6969",
    };

    if (pin !== allowedPins[name]) {
      alert("Invalid PIN for this user");
      return;
    }

    try {
      await addDoc(collection(db, "violations"), {
        name,
        protocol,
        whatHappened,
        signature,
        date: new Date(),
      });
      setName("");
      setProtocol("");
      setPin("");
      setWhatHappened("");
      setSignature("");
      const ctx = canvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    } catch (error) {
      alert("Failed to save report: " + error.message);
    }
  };

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h1>🛡️ Protocol Agreement Tracker</h1>
      <form onSubmit={handleSubmit}>
        <select value={name} onChange={(e) => setName(e.target.value)} required>
          <option value="">Select Violator</option>
          <option value="YSG">YSG</option>
          <option value="Azuz">Azuz</option>
        </select>

        <select value={protocol} onChange={(e) => setProtocol(e.target.value)} required>
          <option value="">Select Protocol</option>
          {protocols.map((p, i) => (
            <option key={i} value={p}>{p}</option>
          ))}
        </select>

        <textarea
          placeholder="What happened?"
          value={whatHappened}
          onChange={(e) => setWhatHappened(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="PIN"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          required
        />

        <p>🖊️ Signature:</p>
        <canvas
          ref={canvasRef}
          width={300}
          height={100}
          style={{ border: "1px solid black" }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        />

        <button type="submit">Submit Report</button>
      </form>

      <hr />
      <h3>📄 Reports:</h3>
      {reports.map((r, i) => (
        <div key={i} style={{ marginBottom: 20 }}>
          <b>{r.name}</b> violated <b>{r.protocol}</b>
          <p>{r.whatHappened}</p>
          <img src={r.signature} alt="signature" width={150} />
          <hr />
        </div>
      ))}
    </div>
  );
}