// src/App.js (FIXED V9)
import React, { useState, useEffect } from 'react';
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
const OLLAMA_CHAT_URL =
  process.env.REACT_APP_OLLAMA_URL || 'http://127.0.0.1:11434/api/chat';

const FASTAPI_API_BASE = process.env.REACT_APP_BACKEND_URL
  ? `${process.env.REACT_APP_BACKEND_URL}/api/place-details`
  : 'http://127.0.0.1:8000/api/place-details';

const OLLAMA_MODEL = process.env.REACT_APP_OLLAMA_MODEL || 'qwen';
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

  // Chạy agent sau khi state messages cập nhật (fix stale state)
  useEffect(() => {
    const last = messages[messages.length - 1];
    if (last && last.role === 'user') {
      runAgentLoop(messages);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  // push message user + reset UI
  const handleSendMessage = (userQuery) => {
    setMapUrl('');
    setPlaceDetails(null);
    setMessages((prev) => [...prev, { role: 'user', content: userQuery }]);
    setIsLoading(true);
  };

  // Agent loop
  const runAgentLoop = async (currentMessages) => {
    const systemGuide = {
      role: 'system',
      content:
        'When the user asks for a place, you MUST call google_maps_lookup. ' +
        'After the tool result, reply with:\n' +
        'Name: <name>\nAddress: <address>\nRating: <rating>/5\n' +
        'Map: embedded on the left.\n',
    };

  
    let conversationHistory = [systemGuide, ...currentMessages];
    let finalBotResponse = null;

    for (let step = 0; step < MAX_AGENT_STEPS && !finalBotResponse; step++) {
      try {
        const historyToSend = conversationHistory.slice(-8);

        const body = {
          model: OLLAMA_MODEL,
          messages: historyToSend,
          tools: [GOOGLE_MAPS_TOOL],
          stream: false,
          options: { temperature: 0.1, top_p: 0.9 },
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

        // Tool-calling
        if (responseMessage.tool_calls && responseMessage.tool_calls.length) {
          const toolCall = responseMessage.tool_calls[0];
          const fn = toolCall.function?.name;

          const rawArgs = toolCall.function?.arguments ?? '{}';
          let args = {};
          try {
            args = typeof rawArgs === 'string' ? JSON.parse(rawArgs) : rawArgs;
          } catch {
            args = {};
          }

          if (fn === 'google_maps_lookup') {
            // Gọi FastAPI
            const mapRes = await axios.get(FASTAPI_API_BASE, {
              params: { query: args.query },
            });

            if (mapRes.data?.error) {
              console.warn('Map tool error:', mapRes.data);
              setPlaceDetails(mapRes.data);
              finalBotResponse = `Lookup failed: ${mapRes.data.error}`;
              break;
            }

            // Update UI
            setMapUrl(mapRes.data?.embed_url || '');
            setPlaceDetails(mapRes.data);

            // Feed-back tóm tắt cho model
            const d = mapRes.data || {};
            const summary = {
              name: d.name,
              address: d.formatted_address,
              rating: d.rating,
              reviews_summary: d.reviews
                ? `${d.reviews.length} short reviews`
                : 'No reviews',
            };

            conversationHistory = [
              ...conversationHistory,
              {
                role: 'tool',
                tool_call_id: toolCall.id,
                content: JSON.stringify(summary),
              },
            ];

            continue; 
          }

          // Tool lạ
          conversationHistory = [
            ...conversationHistory,
            {
              role: 'tool',
              tool_call_id: toolCall.id,
              content: JSON.stringify({ error: 'Unknown tool' }),
            },
          ];
          continue;
        }

        // Final assistant text
        if (responseMessage.content) {
          finalBotResponse = responseMessage.content;
          break;
        }

        finalBotResponse = 'No content returned from model.';
      } catch (err) {
        const data = err?.response?.data;
        const serverMsg =
          data?.detail ||
          data?.error ||
          (typeof data === 'string' ? data : JSON.stringify(data)) ||
          err?.message ||
          'Unknown error';
        finalBotResponse = `Backend/Ollama error: ${serverMsg}`;
        console.error('Ollama/Tool Error:', data || err);
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
