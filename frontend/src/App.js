// src/App.js  — Clean tool-calling version (env-based)
// Requires .env (frontend):
//   REACT_APP_OLLAMA_URL   = http://127.0.0.1:11434/api/chat
//   REACT_APP_BACKEND_URL  = http://127.0.0.1:8000
//   REACT_APP_OLLAMA_MODEL = qwen2.5:7b   (or phi4 if you don't need tools)
// FastAPI must expose GET /api/place-details?query=...

import React, { useState } from 'react';
import axios from 'axios';
import LeftPanel from './LeftPanel';
import RightPanel from './RightPanel';
import './App.css';

/** ---------- Tool schema the LLM can call ---------- */
const GOOGLE_MAPS_TOOL = {
  type: 'function',
  function: {
    name: 'google_maps_lookup',
    description:
      'Search for address/rating/reviews and a Google Maps embed URL for a location.',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Full place name + area (e.g., "Starbucks San Jose").',
        },
      },
      required: ['query'],
    },
  },
};

/** ---------- Endpoints & config (from .env) ---------- */
const OLLAMA_CHAT_URL = process.env.REACT_APP_OLLAMA_URL; // e.g. http://127.0.0.1:11434/api/chat
const FASTAPI_API_BASE = `${process.env.REACT_APP_BACKEND_URL}/api/place-details`; // e.g. http://127.0.0.1:8000/api/place-details
const OLLAMA_MODEL = process.env.REACT_APP_OLLAMA_MODEL || 'qwen2.5:7b';
const MAX_AGENT_STEPS = 4;

function App() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        'Hello! I can search coffee shops and show the map. What place are you looking for?',
    },
  ]);
  const [mapUrl, setMapUrl] = useState('');
  const [placeDetails, setPlaceDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (userQuery) => {
    const systemGuide = {
      role: 'system',
      content:
        'When the user asks for a place, call google_maps_lookup with the full text as `query`. After the tool result, reply with <= 3 bullets: name, address, rating. Say "Map embedded below". Do NOT paste full reviews.',
    };

    const newUserMessage = { role: 'user', content: userQuery };
    setMessages((prev) => [...prev, newUserMessage]);
    setIsLoading(true);

    let conversationHistory = [...messages, systemGuide, newUserMessage];
    let finalBotResponse = null;

    for (let step = 0; step < MAX_AGENT_STEPS && !finalBotResponse; step++) {
      try {
        const historyToSend = conversationHistory.slice(-8);
        const body = {
          model: OLLAMA_MODEL,
          messages: historyToSend,
          tools: [GOOGLE_MAPS_TOOL],
          stream: false,
        };
        console.log('POST /api/chat model =', OLLAMA_MODEL);

        const ollamaRes = await axios.post(OLLAMA_CHAT_URL, body, {
          headers: { 'Content-Type': 'application/json' },
        });

        const responseMessage = ollamaRes?.data?.message;
        if (!responseMessage) {
          finalBotResponse = 'Ollama: empty response.';
          break;
        }

        conversationHistory = [...conversationHistory, responseMessage];

        // ---------- Tool-calling branch ----------
        if (responseMessage.tool_calls && responseMessage.tool_calls.length) {
          const toolCall = responseMessage.tool_calls[0];
          const fn = toolCall.function?.name;

          // Parse arguments from Ollama (stringified JSON)
          const rawArgs = toolCall.function?.arguments ?? '{}';
          let args = {};
          try {
            args = typeof rawArgs === 'string' ? JSON.parse(rawArgs) : rawArgs;
          } catch {
            args = {};
          }

          if (fn === 'google_maps_lookup') {
            // 1) Execute tool: call FastAPI
            const mapRes = await axios.get(FASTAPI_API_BASE, {
              params: { query: args.query },
            });

            // 2) Handle backend error
            if (mapRes.data?.error) {
              setPlaceDetails(mapRes.data);
              finalBotResponse = `Lookup failed: ${mapRes.data.error}`;
              break;
            }

            // 3) Update UI
            setMapUrl(mapRes.data?.embed_url || '');
            setPlaceDetails(mapRes.data);

            // 4) Summarize tool result to feed back to model
            const d = mapRes.data || {};
            const summary = {
              name: d.name,
              address: d.formatted_address,
              rating: d.rating,
              reviews_summary: d.reviews
                ? `${d.reviews.length} short reviews`
                : 'No reviews',
            };

            // 5) Append tool message (must include name + tool_call_id)
            conversationHistory = [
              ...conversationHistory,
              {
                role: 'tool',
                name: 'google_maps_lookup',
                tool_call_id: toolCall.id,
                content: JSON.stringify(summary),
              },
            ];

            // Loop so model can produce the final text
            continue;
          }

          // Unknown tool -> echo an error back to model
          conversationHistory = [
            ...conversationHistory,
            {
              role: 'tool',
              name: fn || 'unknown_tool',
              tool_call_id: toolCall.id,
              content: JSON.stringify({ error: 'Unknown tool' }),
            },
          ];
          continue;
        }

        // ---------- Final assistant message ----------
        if (responseMessage.content) {
          finalBotResponse = responseMessage.content;
          break;
        }

        finalBotResponse = 'No content returned from model.';
      } catch (err) {
        const data = err?.response?.data;
        console.error('Ollama/Tool Error:', data || err);
        const serverMsg =
          data?.error || data || err?.message || 'Unknown error';
        finalBotResponse = `Ollama error: ${serverMsg}`;
        break;
      }
    }

    if (finalBotResponse) {
      setMessages((prev) => [...prev, { role: 'assistant', content: finalBotResponse }]);
    }
    setIsLoading(false);
  };

  return (
    <div className="app-container">
      <div className="main-content">
        <LeftPanel mapUrl={mapUrl} details={placeDetails} />
        <RightPanel
          messages={messages}
          isLoading={isLoading}
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
}

export default App;
