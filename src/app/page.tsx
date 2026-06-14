"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { questions } from "@/lib/questions";

export default function Home() {
  const router = useRouter();
  const [joinCode, setJoinCode] = useState("");
  const [studentName, setStudentName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState("");

  const handleCreateMatch = async () => {
    setIsCreating(true);
    setError("");
    try {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      // Initialize the match in Firestore
      await setDoc(doc(db, "matches", code), {
        matchId: code,
        currentQuestionIndex: 0,
        status: "active",
        createdAt: new Date().toISOString()
      });

      router.push(`/teacher/${code}`);
    } catch (err: any) {
      console.error(err);
      setError("Failed to create match. Check your Firebase config.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode || !studentName) {
      setError("Please enter both your name and a match code.");
      return;
    }
    
    setIsJoining(true);
    setError("");
    try {
      const code = joinCode.toUpperCase();
      const matchDoc = await getDoc(doc(db, "matches", code));
      
      if (!matchDoc.exists()) {
        setError("Match not found! Please check the code.");
        setIsJoining(false);
        return;
      }

      router.push(`/match/${code}?name=${encodeURIComponent(studentName)}`);
    } catch (err: any) {
      console.error(err);
      setError("Failed to join match. Check your connection.");
      setIsJoining(false);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: '2rem' }} className="animate-fade-in">
      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Welcome to <span className="title-gradient">Coding Race</span></h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>A real-time Python programming competition.</p>
      </div>

      {error && (
        <div style={{ background: 'rgba(248, 81, 73, 0.1)', color: 'var(--error-color)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--error-color)', textAlign: 'center' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        
        {/* Join Match Card */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 style={{ fontSize: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>Join a Match</h3>
          <form onSubmit={handleJoinMatch} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Your Name</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="e.g. Alex" 
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Match Code</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="e.g. X7B9K2" 
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-primary" disabled={isJoining} style={{ marginTop: '0.5rem' }}>
              {isJoining ? "Joining..." : "Join Race"}
            </button>
          </form>
        </div>

        {/* Create Match Card (Teacher) */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 style={{ fontSize: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>Teacher Zone</h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            Create a new Coding Race match. You will get a code to share with your students, and you control the pace of the questions.
          </p>
          <div style={{ flex: 1 }}></div>
          <button onClick={handleCreateMatch} className="btn-secondary" disabled={isCreating}>
            {isCreating ? "Creating..." : "Create New Match"}
          </button>
        </div>

      </div>
    </div>
  );
}
