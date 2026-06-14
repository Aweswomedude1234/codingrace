"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { questions } from "@/lib/questions";
import Editor from "@monaco-editor/react";
import type Peer from "peerjs";
import type { DataConnection } from "peerjs";

export default function StudentMatch() {
  const { matchId } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const studentName = searchParams.get("name");
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedForIndex, setSubmittedForIndex] = useState<number>(-1);

  // Store the active connection so we can submit code
  const connectionRef = useRef<DataConnection | null>(null);

  useEffect(() => {
    if (!studentName) {
      router.push("/");
      return;
    }

    if (!matchId) return;

    let peerInstance: Peer | null = null;

    const initPeer = async () => {
      try {
        const PeerClass = (await import("peerjs")).default;
        peerInstance = new PeerClass(); // Random ID for student

        peerInstance.on("open", () => {
          if (!peerInstance) return;
          // Connect to the teacher's fixed ID
          const hostId = `codingrace-v1-${matchId}`;
          const conn = peerInstance.connect(hostId);

          conn.on("open", () => {
            console.log("Connected to teacher!");
            connectionRef.current = conn;
            setLoading(false);
          });

          conn.on("data", (data: unknown) => {
            const msg = data as { type: string; index: number };
            if (msg.type === "QUESTION_UPDATE") {
              const newIndex = msg.index;
              setCurrentQuestionIndex(newIndex);
              
              // Reset code and submission state if teacher moves to a new question
              setSubmittedForIndex((prevIndex) => {
                if (prevIndex !== newIndex) {
                  setCode(""); // Clear editor for new question
                }
                return prevIndex;
              });
            }
          });

          conn.on("close", () => {
            console.log("Connection closed by teacher");
            setError("Host disconnected. The match may have ended.");
          });
        });

        peerInstance.on("error", (err: unknown) => {
          console.error(err);
          setError("Failed to connect. Make sure the match code is correct and the teacher is online.");
          setLoading(false);
        });

      } catch (err) {
        console.error("Failed to load PeerJS", err);
        setError("Error initializing connection.");
        setLoading(false);
      }
    };

    initPeer();

    return () => {
      if (peerInstance) {
        peerInstance.destroy();
      }
    };
  }, [matchId, studentName, router]);

  const handleSubmit = () => {
    if (!code.trim() || !connectionRef.current || !connectionRef.current.open) {
      alert("Not connected to the host or empty code.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      connectionRef.current.send({
        type: "SUBMIT",
        name: studentName,
        code,
        index: currentQuestionIndex
      });
      setSubmittedForIndex(currentQuestionIndex);
    } catch (err) {
      console.error(err);
      alert("Failed to submit. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="animate-pulse">Connecting to Teacher...</div>;
  if (error) return <div style={{ color: 'var(--error-color)' }}>{error}</div>;

  const currentQuestion = questions[currentQuestionIndex];
  const hasSubmitted = submittedForIndex === currentQuestionIndex;

  return (
    <div style={{ width: '100%', maxWidth: '1000px', display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }} className="animate-fade-in">
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Racer: </span>
          <span style={{ fontWeight: 600, color: 'var(--accent-color)' }}>{studentName}</span>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.9rem' }}>
          Level {currentQuestion.level}
        </div>
      </div>

      <div className="glass-panel" style={{ background: 'rgba(22, 27, 34, 0.4)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ color: '#fff', marginBottom: '0.5rem', fontSize: '1.4rem' }}>{currentQuestion.title}</h2>
            <p style={{ color: 'var(--accent-color)', fontSize: '0.9rem', marginBottom: '1rem', fontWeight: 600 }}>Concept: {currentQuestion.concept}</p>
          </div>
        </div>
        <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', fontSize: '1.1rem' }}>{currentQuestion.problem}</p>
        
        {currentQuestion.expectedOutput && (
          <div style={{ marginTop: '1rem', background: 'rgba(0,0,0,0.3)', padding: '0.75rem 1rem', borderRadius: '6px', borderLeft: '3px solid var(--success-color)', fontFamily: 'monospace' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Expected Output:</span> {currentQuestion.expectedOutput}
          </div>
        )}
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '400px', position: 'relative' }}>
        {hasSubmitted && (
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10,
            background: 'rgba(13, 17, 23, 0.8)', backdropFilter: 'blur(4px)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            borderRadius: '12px', border: '1px solid var(--success-color)'
          }} className="animate-fade-in">
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚀</div>
            <h2 style={{ color: 'var(--success-color)', marginBottom: '0.5rem' }}>Submitted Successfully!</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Waiting for the teacher to start the next level...</p>
          </div>
        )}

        <div style={{ border: '1px solid var(--glass-border)', borderRadius: '12px', overflow: 'hidden', flex: 1 }}>
          <Editor
            height="100%"
            defaultLanguage="python"
            theme="vs-dark"
            value={code}
            onChange={(val) => setCode(val || "")}
            options={{
              minimap: { enabled: false },
              fontSize: 16,
              padding: { top: 16 },
              scrollBeyondLastLine: false,
              readOnly: hasSubmitted
            }}
          />
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <button 
            className="btn-primary" 
            style={{ padding: '1rem 3rem', fontSize: '1.1rem' }}
            onClick={handleSubmit}
            disabled={isSubmitting || hasSubmitted || !code.trim()}
          >
            {isSubmitting ? "Submitting..." : hasSubmitted ? "Sent" : "Submit Code"}
          </button>
        </div>
      </div>

    </div>
  );
}
