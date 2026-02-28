import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './Chat.css';
import Siri from './SiriSphere.js'

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const WELCOME_MESSAGES = {
  english: "Hello! I'm ManoRakshak, your mental health companion. How are you feeling today? 🌿",
  hindi: "नमस्ते! मैं ManoRakshak हूँ, आपका मानसिक स्वास्थ्य साथी। आज आप कैसा महसूस कर रहे हैं? 🌿",
};

export default function Chat() {
  const { user, isIncognito, connectionSpeed } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [stressScore, setStressScore] = useState(user?.stressLevel || 0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [speechOutput, setSpeechOutput] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [faceResult, setFaceResult] = useState(null);
  const [analyzingFace, setAnalyzingFace] = useState(false);
  const [recognitionSupported, setRecognitionSupported] = useState(false);
  const [transcriptText, setTranscriptText] = useState('');
  const [isRecognitionActive, setIsRecognitionActive] = useState(false);

  // Disable heavy features for slow connections
  const isSlowConnection = connectionSpeed === 'slow' || connectionSpeed === 'very-slow';
  const showConnectionWarning = isSlowConnection;

  // Log connection status on mount and when it changes
  useEffect(() => {
    console.log(`🎯 Chat.js - Connection Speed: ${connectionSpeed}, Is Slow: ${isSlowConnection}`);
  }, [connectionSpeed, isSlowConnection]);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const transcriptTextRef = useRef('');
  const sendMessageRef = useRef(null);

  // Define speak first (used by sendMessage)
  const speak = useCallback((text) => {
    // Don't speak on slow connections
    if (isSlowConnection) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const langMap = {
      english: 'en-US',
      hindi: 'hi-IN'
    };
    utterance.lang = langMap[user?.languagePreference] || 'en-US';

    // Optimize voice settings for natural Indian accent
    if (user?.languagePreference === 'hindi') {
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
    } else {
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
    }

    // Get all available voices and select the best match
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      const langCode = langMap[user?.languagePreference] || 'en-US';

      // First, try to find exact language match (prioritize native speakers)
      let selectedVoice = voices.find(voice =>
        voice.lang === langCode && voice.name.toLowerCase().includes('india')
      );

      // If not found, try language family match
      if (!selectedVoice) {
        selectedVoice = voices.find(voice => voice.lang.startsWith(langCode.split('-')[0]));
      }

      // Last resort: try any voice that supports the language
      if (!selectedVoice) {
        selectedVoice = voices.find(voice => voice.lang.includes(langCode.split('-')[0]));
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
        console.log('✅ Using voice:', selectedVoice.name, 'Language:', selectedVoice.lang);
      } else {
        console.warn('⚠️ No optimal voice found for', langCode, '. Using system default.');
      }
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event.error);
      setIsSpeaking(false);
    };
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, [user?.languagePreference, isSlowConnection]);

  // Define sendMessage (uses speak)
  const sendMessage = useCallback(async (text) => {
    if (!text.trim()) return;
    const userMsg = { role: 'user', content: text, time: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const history = messages.map(m => ({ role: m.role, content: m.content }));

    try {
      const res = await axios.post(`${API}/chat/message`, {
        content: text,
        isIncognito,
        conversationHistory: history,
      });
      const aiMsg = { role: 'assistant', content: res.data.response, time: new Date() };
      setMessages(prev => [...prev, aiMsg]);
      setStressScore(res.data.stressScore || 0);
      if (speechOutput) speak(res.data.response);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'I\'m having trouble connecting. Please try again.', time: new Date() }]);
    } finally {
      setLoading(false);
    }
  }, [isIncognito, messages, speechOutput, speak]);

  // Keep sendMessage ref in sync for use in recognition handler
  useEffect(() => {
    sendMessageRef.current = sendMessage;
  }, [sendMessage]);

  // Load history on mount
  useEffect(() => {
    const welcome = WELCOME_MESSAGES[user?.languagePreference] || WELCOME_MESSAGES.english;
    setMessages([{ role: 'assistant', content: welcome, time: new Date() }]);

    if (!isIncognito) {
      axios.get(`${API}/chat/history`).then(res => {
        if (res.data.length > 0) {
          const formatted = res.data.map(m => ({ role: m.role, content: m.content, time: new Date(m.createdAt) }));
          setMessages(prev => [...prev, ...formatted]);
        }
      }).catch(() => { });
    }

    // Ensure voices are loaded for speech synthesis
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, [isIncognito, user?.languagePreference]);

  // Initialize Web Speech API - only once on mount
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Speech Recognition not supported');
      return;
    }

    setRecognitionSupported(true);
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = user?.languagePreference === 'hindi' ? 'hi-IN' : 'en-US';

    recognition.onstart = () => {
      console.log('🎙️ Recognition started');
      setIsRecording(true);
      setIsRecognitionActive(true);
      setTranscriptText('');
      transcriptTextRef.current = '';
    };

    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const isFinal = event.results[i].isFinal;
        transcript += event.results[i][0].transcript;
        if (isFinal) {
          transcript += ' ';
        }
      }
      const trimmedTranscript = transcript.trim();
      transcriptTextRef.current = trimmedTranscript;
      setTranscriptText(trimmedTranscript);
      console.log('📝 Transcript:', trimmedTranscript);
    };

    recognition.onerror = (event) => {
      console.error('🔴 Speech recognition error:', event.error);
      setTranscriptText(`Error: ${event.error}`);
      setIsRecognitionActive(false);
    };

    recognition.onend = () => {
      console.log('⏹️ Recognition ended');
      setIsRecording(false);
      setIsRecognitionActive(false);
      const finalTranscript = transcriptTextRef.current;
      console.log('Final transcript:', finalTranscript);
      if (finalTranscript && !finalTranscript.startsWith('Error:')) {
        // Auto-send the transcribed message
        console.log('📤 Auto-sending transcript...');
        if (sendMessageRef.current) {
          sendMessageRef.current(finalTranscript);
        }
        transcriptTextRef.current = '';
        setTranscriptText('');
      }
    };

    recognitionRef.current = recognition;

    // Only create instance once, update language separately
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          console.error('Error aborting recognition:', e);
        }
      }
    };
  }, [user?.languagePreference]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Camera setup
  useEffect(() => {
    if (isSlowConnection) {
      setShowCamera(false);
      return; // Don't initialize camera on slow connections
    }

    if (showCamera) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          streamRef.current = stream;
          if (videoRef.current) videoRef.current.srcObject = stream;
        })
        .catch(() => setShowCamera(false));
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
    }
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    };
  }, [showCamera, isSlowConnection]);

  const startRecording = useCallback(() => {
    if (!recognitionSupported) {
      return alert('Speech recognition not supported in your browser. Please use Chrome, Firefox, Safari, or Edge.');
    }

    if (isRecognitionActive) {
      console.warn('⚠️ Speech recognition already active');
      return;
    }

    try {
      if (recognitionRef.current) {
        console.log('🎤 Starting recognition...');
        recognitionRef.current.start();
      }
    } catch (error) {
      console.error('❌ Error starting recognition:', error.message);
      setIsRecognitionActive(false);
    }
  }, [recognitionSupported, isRecognitionActive]);

  const stopRecording = useCallback(() => {
    if (!isRecognitionActive) {
      console.warn('⚠️ Recognition not active');
      return;
    }

    try {
      if (recognitionRef.current) {
        console.log('🛑 Stopping recognition...');
        recognitionRef.current.stop();
      }
    } catch (error) {
      console.error('❌ Error stopping recognition:', error.message);
      setIsRecognitionActive(false);
    }
  }, [isRecognitionActive]);

  const captureAndAnalyzeFace = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    setAnalyzingFace(true);
    const canvas = canvasRef.current;
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
    const imageBase64 = canvas.toDataURL('image/jpeg').split(',')[1];

    try {
      const res = await axios.post(`${API}/chat/analyze-image`, { imageBase64 });
      setFaceResult(res.data);
      // Auto-send a message based on detected emotion
      if (res.data.emotion) {
        sendMessage(`[Face detected: ${res.data.emotion}] I seem to be feeling ${res.data.emotion} right now.`);
      }
    } catch {
      setFaceResult({ emotion: 'Unable to analyze', stressLevel: 0, description: 'Could not connect to image analysis.' });
    } finally {
      setAnalyzingFace(false);
    }
  };

  const getStressLabel = (score) => {
    if (score <= 2) return { label: 'Calm', cls: '' };
    if (score <= 5) return { label: 'Moderate stress', cls: 'medium' };
    return { label: 'High stress', cls: 'high' };
  };

  const stressInfo = getStressLabel(stressScore);

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <>
      <div className={`chat-page ${isIncognito ? 'incognito' : ''}`}>
        {showConnectionWarning && (
          <div style={{
            background: '#fff3cd',
            border: '2px solid #ff6b6b',
            padding: '1rem',
            marginBottom: '1.5rem',
            borderRadius: '0.5rem',
            color: '#856404',
            fontSize: '0.95rem',
            display: 'flex',
            gap: '0.75rem',
            alignItems: 'flex-start'
          }}>
            <span style={{ fontSize: '1.2rem' }}>📶</span>
            <div>
              <strong>📊 Data Saver Mode Active</strong>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>
                Slow connection detected ({connectionSpeed}). Voice and camera features are disabled to save data. 💬 Text chat works great!
              </p>
              <p style={{ margin: '0.3rem 0 0 0', fontSize: '0.85rem', opacity: 0.8 }}>
                Tip: Go to sidebar and toggle "Data Saver Mode" to manually control features.
              </p>
            </div>
          </div>
        )}

        <div className="chat-header">
          <Siri isSpeaking={isSpeaking} />
          <div className="chat-header-right">
            <span className={`stress-indicator ${stressInfo.cls}`}>
              {stressInfo.label} ({stressScore}/10)
            </span>
            <button
              className={`header-action-btn ${speechOutput ? 'active' : ''}`}
              onClick={() => setSpeechOutput(p => !p)}
              disabled={isSlowConnection}
              title={isSlowConnection ? 'Disabled on slow connections' : ''}
            >
              🔊 Voice Output
            </button>
            <button
              className={`header-action-btn ${showCamera ? 'active' : ''}`}
              onClick={() => setShowCamera(p => !p)}
              disabled={isSlowConnection}
              title={isSlowConnection ? 'Disabled on slow connections' : ''}
            >
              📷 Face Detection
            </button>
          </div>
        </div>

        {showCamera && (
          <div className="face-detection-panel">
            <video ref={videoRef} autoPlay muted playsInline />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            <div className="face-result">
              {faceResult ? (
                <>
                  <strong>{faceResult.emotion} {faceResult.stressLevel !== undefined ? `(stress: ${faceResult.stressLevel}/10)` : ''}</strong>
                  <span>{faceResult.description}</span>
                </>
              ) : <span>Press "Analyze" to detect your expression</span>}
            </div>
            <button className="header-action-btn" onClick={captureAndAnalyzeFace} disabled={analyzingFace}>
              {analyzingFace ? 'Analyzing...' : '🔍 Analyze Expression'}
            </button>
          </div>
        )}

        <div className="messages-area">
          {messages.map((msg, i) => (
            <div key={i} className={`message-bubble ${msg.role}`}>
              <div className="bubble-content">{msg.content}</div>
              <span className="bubble-time">
                {msg.time?.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
          {loading && (
            <div className="typing-indicator">
              <div className="typing-dot" />
              <div className="typing-dot" />
              <div className="typing-dot" />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-area">
          <div className="input-toolbar">
            <button
              className={`toolbar-btn ${isRecording ? 'recording-pulse' : ''}`}
              onClick={() => isRecording ? stopRecording() : startRecording()}
              disabled={isSlowConnection}
              title={isSlowConnection ? 'Disabled on slow connections' : isRecording ? 'Click to stop recording' : 'Click to start speaking'}
            >
              🎙️ {isRecording ? '⏹️ Stop Speaking' : '🎤 Click to Speak'}
            </button>
            {transcriptText && isRecording && (
              <div className="transcript-display">
                <span>🎤 Recording... {transcriptText}</span>
              </div>
            )}
            {isSpeaking && (
              <button className="toolbar-btn active" onClick={() => window.speechSynthesis.cancel()}>
                🔇 Stop Speaking
              </button>
            )}
          </div>

          {isIncognito && (
            <div className="incognito-chat-notice">
              🕵️ Incognito mode — this conversation will not be saved
            </div>
          )}

          <div className="input-row">
            <textarea
              className="chat-input-row-textarea"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Type your message... (Enter to send)"
              rows={1}
            />
            <button className="send-btn" onClick={() => sendMessage(input)} disabled={loading || !input.trim()}>
              ➤
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
