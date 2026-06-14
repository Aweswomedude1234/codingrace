"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { questions } from "@/lib/questions";
import type Peer from "peerjs";
import type { DataConnection } from "peerjs";

type ResponseData = {
  studentName: string;
  code: string;
  timestamp: string;
  questionIndex: number;
};

export default function TeacherDashboard() {
  const { matchId } = useParams();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [responses, setResponses] = useState<ResponseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Keep references for use inside PeerJS callbacks
  const currentQuestionIndexRef = useRef(0);
  const [connections, setConnections] = useState<DataConnection[]>([]);

  useEffect(() => {
    currentQuestionIndexRef.current = currentQuestionIndex;
  }, [currentQuestionIndex]);

  useEffect(() => {
    if (!matchId) return;

    let peerInstance: Peer | null = null;

    const initPeer = async () => {
      try {
        const PeerClass = (await import("peerjs")).default;
        // Use a unique prefix so it's less likely to collide on the public server
        peerInstance = new PeerClass(`codingrace-v1-${matchId}`);

        peerInstance.on("open", (id: string) => {
          console.log("Teacher ready with ID:", id);
          setLoading(false);
        });

        peerInstance.on("connection", (conn: DataConnection) => {
          console.log("Student connected:", conn.peer);
          
          setConnections((prev) => [...prev, conn]);

          conn.on("open", () => {
            // Send current question index when a new student connects
            conn.send({ type: "QUESTION_UPDATE", index: currentQuestionIndexRef.current });
          });

          conn.on("data", (data: unknown) => {
            const msg = data as { type: string; name: string; code: string; index: number };
            if (msg.type === "SUBMIT") {
              setResponses((prev) => {
                const newResponses = [...prev, {
                  studentName: msg.name,
                  code: msg.code,
                  questionIndex: msg.index,
                  timestamp: new Date().toISOString()
                }];
                // Sort by latest first
                return newResponses.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
              });
            }
          });

          conn.on("close", () => {
            setConnections((prev) => prev.filter((c) => c.peer !== conn.peer));
          });
        });

        peerInstance.on("error", (err: unknown) => {
          console.error(err);
          // Only show error if we haven't loaded, otherwise it might just be a student disconnecting randomly
          if (loading) {
            setError("Failed to create match. The code might be in use or the network is blocked.");
            setLoading(false);
          }
        });
      } catch (err) {
        console.error("Failed to load PeerJS", err);
        setError("Error initializing PeerJS.");
        setLoading(false);
      }
    };

    initPeer();

    return () => {
      if (peerInstance) {
        peerInstance.destroy();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId]);

  const broadcastQuestionUpdate = (newIndex: number) => {
    connections.forEach((conn) => {
      if (conn.open) {
        conn.send({ type: "QUESTION_UPDATE", index: newIndex });
      }
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      const newIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(newIndex);
      broadcastQuestionUpdate(newIndex);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      const newIndex = currentQuestionIndex - 1;
      setCurrentQuestionIndex(newIndex);
      broadcastQuestionUpdate(newIndex);
    }
  };

  if (loading) return <div className="animate-pulse">Starting Host Server...</div>;
  if (error) return <div style={{ color: 'var(--error-color)' }}>{error}</div>;

  const currentQuestion = questions[currentQuestionIndex];
  const currentResponses = responses.filter((r) => r.questionIndex === currentQuestionIndex);

  return (
    <div style={{ width: '100%', maxWidth: '1200px', display: 'flex', flexDirection: 'column', gap: '2rem' }} className="animate-fade-in">
      
      <div className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>Match Code</h2>
          <div style={{ fontSize: '3rem', fontWeight: 800, letterSpacing: '4px' }} className="title-gradient">{matchId}</div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Instruct students to enter this code to join.</p>
          <p style={{ fontSize: '0.8rem', color: 'var(--success-color)', marginTop: '0.5rem' }}>● {connections.length} student(s) connected</p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button className="btn-secondary" onClick={handlePrevQuestion} disabled={currentQuestionIndex === 0}>
            Previous
          </button>
          <div style={{ textAlign: 'center', minWidth: '100px' }}>
            <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>LEVEL</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 600 }}>{currentQuestion.level} / {questions.length}</span>
          </div>
          <button className="btn-primary" onClick={handleNextQuestion} disabled={currentQuestionIndex === questions.length - 1}>
            Next Level
          </button>
        </div>
      </div>

      <div className="glass-panel" style={{ background: 'rgba(22, 27, 34, 0.4)' }}>
        <h3 style={{ color: 'var(--accent-color)', marginBottom: '0.5rem' }}>{currentQuestion.title}</h3>
        <p style={{ whiteSpace: 'pre-wrap', marginBottom: '1rem' }}>{currentQuestion.problem}</p>
        {currentQuestion.expectedOutput && (
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.5rem 1rem', borderRadius: '4px', borderLeft: '3px solid var(--success-color)', fontFamily: 'monospace', fontSize: '0.9rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Expected Output:</span> {currentQuestion.expectedOutput}
          </div>
        )}
      </div>

      <div>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
          Student Submissions ({currentResponses.length})
        </h3>
        
        {currentResponses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)', background: 'rgba(22,27,34,0.3)', borderRadius: '8px', border: '1px dashed var(--glass-border)' }}>
            Waiting for students to submit code for this level...
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1rem' }}>
            {currentResponses.map((resp, idx) => (
              <div key={idx} className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, color: 'var(--accent-color)' }}>{resp.studentName}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{new Date(resp.timestamp).toLocaleTimeString()}</span>
                </div>
                <div style={{ background: '#0d1117', padding: '1rem', borderRadius: '6px', overflowX: 'auto', border: '1px solid var(--glass-border)' }}>
                  <pre style={{ margin: 0, fontSize: '0.9rem', fontFamily: 'monospace', color: '#e6edf3' }}>
                    {resp.code}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
