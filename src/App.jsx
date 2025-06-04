import { useState, useEffect, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import { jsPDF } from "jspdf";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCqB5VdFRdi--JmkvL322dHIpyMH1jTzg0",
  authDomain: "ysgs-a1e40.firebaseapp.com",
  projectId: "ysgs-a1e40",
  storageBucket: "ysgs-a1e40.firebasestorage.app",
  messagingSenderId: "373671553111",
  appId: "1:373671553111:web:9df9b58434cbcd25981b12"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const userPins = {
  Abdulaziz: "1111",
  Yousif: "2222",
};

const punishments = {
  "Protocol 001 — Gaming Laws": "Forced to stream gameplay for 1 hour while being roasted",
  "Protocol 002 — Roast Protection Acts": "Post a meme apology in the group chat",
  "Protocol 003 — Tech & Code Protocols": "Treat the other to ice cream 🍦",
  "Protocol 004 — The ISEF Pact": "Write a motivational message to the other",
  "Protocol 005 — Console Shaming Act": "Wear a ‘Console Gamer’ sign for 5 mins",
  "Protocol 006 — No-Screenshot Agreement": "Pay 10,000 IQD fine or equivalent respect tax 💸"
};

export default function App() {
  const [agreements, setAgreements] = useState([]);
  const [name, setName] = useState("");
  const [protocol, setProtocol] = useState("");
  const [details, setDetails] = useState("");
  const [pin, setPin] = useState("");
  const [sigError, setSigError] = useState("");
  const sigCanvasRef = useRef();

  useEffect(() => {
    const q = query(collection(db, "reports"), orderBy("timestamp", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const all = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setAgreements(all);
    });
    return () => unsub();
  }, []);

  const handleSubmit = async () => {
    if (!name || !protocol || !pin || pin !== userPins[name]) {
      alert("Missing or incorrect PIN");
      return;
    }
    if (sigCanvasRef.current.isEmpty()) {
      setSigError("Signature required");
      return;
    }

    const signatureURL = sigCanvasRef.current.getTrimmedCanvas().toDataURL("image/png");

    try {
      await addDoc(collection(db, "reports"), {
        name,
        violation: protocol,
        details,
        signatureURL,
        timestamp: serverTimestamp()
      });
      setName("");
      setProtocol("");
      setDetails("");
      setPin("");
      sigCanvasRef.current.clear();
      setSigError("");
    } catch (err) {
      alert("Firebase error: " + err.message);
    }
  };

  const generatePDF = (entry) => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("🚨 Protocol Violation Report", 20, 20);
    doc.text(`Name: ${entry.name}`, 20, 40);
    doc.text(`Protocol: ${entry.violation}`, 20, 50);
    if (entry.details) doc.text(`Details: ${entry.details}`, 20, 60);
    doc.text(`Punishment: ${punishments[entry.violation]}`, 20, 70);
    doc.addImage(entry.signatureURL, 'PNG', 20, 80, 100, 40);
    doc.save(`protocol-${entry.name}.pdf`);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>🛡️ Protocol Agreement Tracker</h1>

      <form>
        <select value={name} onChange={(e) => setName(e.target.value)}>
          <option value="">Select Violator</option>
          <option value="Abdulaziz">Abdulaziz</option>
          <option value="Yousif">Yousif</option>
        </select>

        <select value={protocol} onChange={(e) => setProtocol(e.target.value)}>
          <option value="">Select Protocol</option>
          {Object.keys(punishments).map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        <textarea placeholder="What happened?" value={details} onChange={(e) => setDetails(e.target.value)} />
        <input type="password" placeholder="PIN" value={pin} onChange={(e) => setPin(e.target.value)} />

        <label>✍️ Signature:</label>
        <SignatureCanvas ref={sigCanvasRef} penColor="black" canvasProps={{ width: 300, height: 100 }} />
        {sigError && <p style={{ color: "red" }}>{sigError}</p>}

        <button type="button" onClick={handleSubmit}>Submit Report</button>
      </form>

      <hr />
      <h3>📜 Reported Violations:</h3>
      {agreements.map((entry, idx) => (
        <div key={entry.id || idx} style={{ marginBottom: 20, padding: 10, border: "1px solid #ccc", borderRadius: 6 }}>
          <p><strong>{entry.name}</strong> broke <em>{entry.violation}</em></p>
          <p>{entry.details}</p>
          <img src={entry.signatureURL} width={180} alt="Signature" />
          <button onClick={() => generatePDF(entry)}>📄 PDF</button>
        </div>
      ))}
    </div>
  );
}
