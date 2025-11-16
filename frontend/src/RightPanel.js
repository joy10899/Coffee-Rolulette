// src/RightPanel.js (FIXED VERSION 2)
import React, { useState, useEffect, useRef } from 'react';
import './RightPanel.css'; 

function RightPanel({ messages, isLoading, onSendMessage }) {
  const [input, setInput] = useState('');
  const historyEndRef = useRef(null); 

  // Auto-scroll to latest message
  useEffect(() => {
    historyEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <div className="right-panel">
      {/* 1. CHAT HISTORY */}
      <div className="chat-history">
        {messages.map((msg, index) => (
          // Use msg.role to determine the CSS class ('user' or 'assistant')
          <div key={index} className={`chat-message ${msg.role}`}>
            {/* Use msg.content to display the text */}
            <p>{msg.content}</p> 
          </div>
        ))}
        
        {/* Loading Indicator */}
        {isLoading && (
          <div className="chat-message assistant">
            <p><i>Searching for you...</i></p>
          </div>
        )}
        
        <div ref={historyEndRef} /> 
      </div>
      
      {/* 2. INPUT FORM */}
      <form onSubmit={handleSubmit} className="chat-input-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Find me a coffee shop..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>Send</button>
      </form>
    </div>
  );
}

export default RightPanel;