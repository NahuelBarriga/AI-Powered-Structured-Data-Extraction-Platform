"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getSessionResults, submitOrder } from "@/src/lib/helpers/orderHelper";
import { useNavigation } from "@/src/lib/hooks/useNavigation";
import ExtractionDisplay from "@/src/components/session/ExtractionDisplay";
import ExtractionNavigation from "@/src/components/session/ExtractionNavigation";
import SessionInfo from "@/src/components/session/SessionInfo";
import ActionButtons from "@/src/components/session/ActionButtons";
import RefineSection from "@/src/components/session/RefineSection";
import ErrorBox from "@/src/components/ErrorBox";
import { SessionData } from "@/src/types/session.type";



export default function ResultsPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const { push } = useNavigation();
  
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [status, setStatus] = useState<"idle" | "loading" | "refining" | "done" | "error">(
    "loading"
  );
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Load session data on mount
  useEffect(() => {
    loadSessionData();
  }, [sessionId]);

  async function loadSessionData() {
    setStatus("loading");
    setError(null);
    try {
      const data = await getSessionResults(sessionId);
      setSessionData(data);
      setStatus("done");  
      if (data.extractions.length > 0) {
        setCurrentIndex(data.extractions.length - 1); // Start with last extraction
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load session data"
      );
      setStatus("error");
    }
  }

  async function handleRefine(text: string) {
    setStatus("refining");
    setError(null);

    try {
      await submitOrder(text, sessionId, 'refine');
      // Reload session data to get new extraction
      await loadSessionData();
      setStatus("idle");
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : "Failed to refine the extraction. Please try again.";
      setError(errorMessage);
      setStatus("error");
    }
  }

  async function handleRetry() {
    if (!currentExtraction) return;
    
    setStatus("refining");
    setError(null);

    try {
      await submitOrder(currentExtraction.inputText, sessionId, 'retry');
      // Reload session data
      await loadSessionData();
      setStatus("idle");
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : "Failed to retry extraction. Please try again.";
      setError(errorMessage);
      setStatus("error");
    }
  }

  function copyToClipboard() {
    if (!currentExtraction) return;
    
    const jsonString = JSON.stringify(currentExtraction.extractedData, null, 2);
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const currentExtraction =
    sessionData && sessionData.extractions.length > 0
      ? sessionData.extractions[currentIndex]
      : null;

  if (status === "loading") {
    return (
      <main className="max-w-4xl mx-auto p-6">
        <p className="text-gray-500">Loading session...</p>
      </main>
    );
  }

  if (status === "error" || !sessionData) {
    return (
      <main className="max-w-4xl mx-auto p-6">
        <p className="text-red-500 mb-4">{error || "Failed to load session"}</p>
        <button
          onClick={() => push("/")}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Back to Home
        </button>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto p-6">
      {error && (
        <ErrorBox 
          message={error}
          onDismiss={() => setError(null)}
        />
      )}

      <h1 className="text-3xl font-bold mb-6 text-white">Extraction Results</h1>

      {/* Session Information */}
      <SessionInfo 
        sessionId={sessionData.session.id}
        createdAt={sessionData.session.createdAt}
      />

      {/* Navigation between extractions */}
      <ExtractionNavigation
        currentIndex={currentIndex}
        totalExtractions={sessionData.totalExtractions}
        version={currentExtraction?.version || 0}
        onPrevious={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
        onNext={() =>
          setCurrentIndex(
            Math.min(sessionData.extractions.length - 1, currentIndex + 1)
          )
        }
      />

      {/* Current Extraction Display */}
      {currentExtraction && (
        <ExtractionDisplay
          extraction={currentExtraction}
          onCopy={copyToClipboard}
          copied={copied}
        />
      )}

      {/* Error message - displayed prominently */}
      {error && <ErrorBox message={error} onDismiss={() => setError(null)} />}

      {/* Action Buttons */}
      <ActionButtons
        onRetry={handleRetry}
        onNewExtraction={() => push("/")}
        loading={status === "refining"}
        disabled={!currentExtraction}
      />

      {/* Refine Section */}
      <RefineSection
        onSubmit={handleRefine}
        loading={status === "refining"}
      />
    </main>
  );
}
