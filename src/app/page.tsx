"use client";
import { useEffect, useState } from "react";
import "@/styles/styles.css"; // Import file CSS

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pdfLink, setPdfLink] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const generatePDF = async () => {
    setLoading(true);
    setError("");
    setPdfLink(null);

    try {
      const res = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Something went wrong");
      }

      const blob = await res.blob();
      const link = URL.createObjectURL(blob);
      setPdfLink(link);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      <h1>Generate PDF from URL</h1>
      <div>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter URL here"
        />
        <button onClick={generatePDF} disabled={loading}>
          {loading ? "Generating..." : "Generate PDF"}
        </button>
        {error && <p className="error">{error}</p>}
        {pdfLink && (
          <a href={pdfLink} download="generated.pdf" className="link">
            Download PDF
          </a>
        )}
      </div>
    </main>
  );
}

