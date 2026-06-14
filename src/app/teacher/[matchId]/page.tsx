"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, onSnapshot, updateDoc, collection, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { questions } from "@/lib/questions";

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

  useEffect(() => {
    if (!matchId) return;

    // Listen to match status (current question)
    const matchRef = doc(db, "matches", matchId as string);
    const unsubMatch = onSnapshot(matchRef, (docSnap) => {
      if (docSnap.exists()) {
        setCurrentQuestionIndex(docSnap.data().currentQuestionIndex || 0);
      } else {
        setError("Match not found!");
      }
      setLoading(false);
    }, (err) => {
      console.error(err);
      setError("Failed to sync match data. Is Firebase configured?");
      setLoading(false);
    });

    // Listen to responses
    const responsesRef = collection(db, "matches", matchId as string, "responses");
    const q = query(responsesRef);
    const unsubResponses = onSnapshot(q, (snapshot) => {
      const respData: ResponseData[] = [];
      snapshot.forEach((doc) => {
        respData.push(doc.data() as ResponseData);
      });
      // Sort by latest first
      respData.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setResponses(respData);
    });

    return () => {
      unsubMatch();
      unsubResponses();
    };
  }, [matchId]);

  const handleNextQuestion = async () => {
    if (currentQuestionIndex < questions.length - 1) {
      await updateDoc(doc(db, "matches", matchId as string), {
        currentQuestionIndex: currentQuestionIndex + 1
      });
    }
  };

  const handlePrevQuestion = async () => {
    if (currentQuestionIndex > 0) {
      await updateDoc(doc(db, "matches", matchId as string), {
        currentQuestionIndex: currentQuestionIndex - 1
      });
    }
  };

  if (loading) return <div className="animate-pulse">Loading dashboard...</div>;
  if (error) return <div style={{ color: 'var(--error-color)' }}>{error}</div>;

  const currentQuestion = questions[currentQuestionIndex];
  
  // Filter responses to show only those for the current question
  const currentResponses = responses.filter(r => r.questionIndex === currentQuestionIndex);

  return (
    <div style={{ width: '100%', maxWidth: '1200px', display: 'flex', flexDirection: 'column', gap: '2rem' }} className="animate-fade-in">
      
      <div className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>Match Code</h2>
          <div style={{ fontSize: '3rem', fontWeight: 800, letterSpacing: '4px' }} className="title-gradient">{matchId}</div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Instruct students to enter this code to join.</p>
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
