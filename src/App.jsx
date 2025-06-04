import { useState, useEffect, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import { jsPDF } from "jspdf";

const validUsers = {
  Abdulaziz: "zaza12345678910",
  Yousif: "ysg"918273645",
};

const userPins = {
  Abdulaziz: "6969",
  Yousif: "9696",
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
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [agreements, setAgreements] = useState([]);
  const [name, setName] = useState("");
  const [protocol, setProtocol] = useState("");
  const [details, setDetails] = useState("");
  const [pin, setPin] = useState("");
  const [sigError, setSigError] = useState("");
  const sigCanvasRef = useRef();

  useEffect(() => {
    const saved = localStorage.getItem("protocolReports");
    if (saved) setAgreements(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("protocolReports", JSON.stringify(agreements));
  }, [agreements]);

  const handleSubmit = () => {
    if (!name || !protocol || !pin || pin !== userPins[name]) {
      alert("Missing or incorrect PIN");
      return;
    }
    if (sigCanvasRef.current.isEmpty()) {
      setSigError("Signature required");
      return;
    }

    const signatureURL = sigCanvasRef.current.getTrimmedCanvas().toDataURL("image/png");
    const newEntry = {
      name,
      violation: protocol,
      details,
      signatureURL,
      date: new Date().toLocaleString(),
    };

    setAgreements([newEntry, ...agreements]);
    setName("");
    setProtocol("");
    setDetails("");
    setPin("");
    sigCanvasRef.current.clear();
    setSigError("");
  };

  const generatePDF = (entry) => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("🚨 Protocol Violation Report", 20, 20);
    doc.text(`Name: ${entry.name}`, 20, 40);
    doc.text(`Protocol: ${entry.violation}`, 20, 50);
    if (entry.details) doc.text(`Details: ${entry.details}`, 20, 60);
    doc.text(`Date: ${entry.date}`, 20, 70);
    doc.text(`Punishment: ${punishments[entry.violation]}`, 20, 80);
    doc.addImage(entry.signatureURL, 'PNG', 20, 90, 100, 40);
    doc.save(`protocol-violation-${entry.name}.pdf`);
  };

  const LoginPage = ({ onLogin }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const handleLogin = () => {
      if (validUsers[username] === password) onLogin(username);
      else alert("Invalid credentials");
    };
    return (
      <form>
        <h1>🔐 Protocol Login</h1>
        <input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="button" onClick={handleLogin}>Login</button>
      </form>
    );
  };

  if (!loggedInUser) return <LoginPage onLogin={setLoggedInUser} />;

  return (
    <div>
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
        <SignatureCanvas ref={sigCanvasRef} penColor="black" canvasProps={{ width: 300, height: 100, className: "sigCanvas" }} />
        {sigError && <p style={{ color: "red" }}>{sigError}</p>}

        <button type="button" onClick={handleSubmit}>Submit Report</button>
      </form>

      {agreements.map((entry, idx) => (
        <div className="report-card" key={idx}>
          <p><strong>🚨 {entry.name} broke:</strong> {entry.violation}</p>
          <p><em>{entry.date}</em></p>
          {entry.details && <p>“{entry.details}”</p>}
          <p><strong>Punishment:</strong> {punishments[entry.violation]}</p>
          <img className="signature-img" src={entry.signatureURL} alt="Signature" />
          <button onClick={() => generatePDF(entry)}>📄 Download PDF</button>
        </div>
      ))}
    </div>
  );
}
