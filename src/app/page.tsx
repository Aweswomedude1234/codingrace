"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [joinCode, setJoinCode] = useState("");
  const [studentName, setStudentName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState("");

  const handleCreateMatch = () => {
    setIsCreating(true);
    setError("");
    // Generate a simple 6-character code
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    router.push(`/teacher/${code}`);
  };

  const handleJoinMatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode || !studentName) {
      setError("Please enter both your name and a match code.");
      return;
    }
    
    setIsJoining(true);
    setError("");
    const code = joinCode.toUpperCase();
    
    // We just route them to the match page. The connection will be handled there.
    router.push(`/match/${code}?name=${encodeURIComponent(studentName)}`);
  };

  return (
    <div style={{ width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: '2rem' }} className="animate-fade-in">
      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Welcome to <span className="title-gradient">Coding Race</span></h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>A real-time Python programming competition.</p>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>No database required! Powered by P2P WebRTC.</p>
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
