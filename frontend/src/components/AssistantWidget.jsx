import React, { useState, useEffect, useRef } from 'react';
import { useCarbonContext } from '../context/CarbonContext';
import { 
  calcTransportEmissions, 
  calcHomeEmissions, 
  calcFoodEmissions, 
  calcShoppingEmissions 
} from '../utils/calculations';
import { COUNTRY_AVERAGES, TIPS_DATA } from '../utils/constants';
import { MessageSquare, X, Send, Leaf, BrainCircuit, Check } from 'lucide-react';
import './AssistantWidget.css';

export default function AssistantWidget() {
  const { userProfile, emissionsData, totalAnnual, actions } = useCarbonContext();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Initialize chatbot messages when widget is opened
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome-widget',
          sender: 'bot',
          text: `Hey! I'm EcoBot. 🌍 How can I help you save carbon today?`
        }
      ]);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Clean NLP logic
  const parseNLP = (text) => {
    const input = text.toLowerCase().trim();

    // 1. Drove car/flight
    const transRegex = /(?:log|add|drove|flew|travelled|rode)\s+(\d+(?:\.\d+)?)\s*(?:km|kilometers)?\s*(?:in|on|by|a)?\s*(car|flight|plane|bus|train|bike)/i;
    const transMatch = input.match(transRegex);
    if (transMatch) {
      const km = parseFloat(transMatch[1]);
      const type = transMatch[2].toLowerCase().replace('plane', 'flight');
      return { type: 'log_transport', params: { km, vehicleType: type } };
    }

    // 2. Spent shopping
    const shopRegex = /(?:log|add|spent|spend)\s*(?:rs\.?|inr|₹)?\s*(\d+)\s*(?:rupees|inr)?\s*(?:on)?\s*shopping/i;
    const shopMatch = input.match(shopRegex);
    if (shopMatch) {
      return { type: 'log_shopping', params: { amount: parseInt(shopMatch[1]) } };
    }

    // 3. Diet
    const foodRegex = /(?:log|add|ate|diet|meal)\s*(?:a)?\s*(meat_heavy|omnivore|vegetarian|vegan)(?:\s*diet|\s*meal|\s*food)?/i;
    const foodMatch = input.match(foodRegex);
    if (foodMatch) {
      return { type: 'log_food', params: { dietType: foodMatch[1].toLowerCase() } };
    }

    if (input.includes('analyze') || input.includes('breakdown') || input.includes('highest') || input.includes('summary') || input.includes('biggest')) {
      return { type: 'query_analysis' };
    }
    if (input.includes('compare') || input.includes('average') || input.includes('benchmark') || input.includes('india') || input.includes('us')) {
      return { type: 'query_comparison' };
    }
    if (input.includes('target') || input.includes('paris') || input.includes('limit')) {
      return { type: 'query_target' };
    }
    if (input.includes('tip') || input.includes('save') || input.includes('reduce') || input.includes('advice')) {
      return { type: 'query_tips' };
    }

    return { type: 'chitchat' };
  };

  const getBotResponse = (intent) => {
    const currentMonth = 'July';

    switch (intent.type) {
      case 'log_transport': {
        const { km, vehicleType } = intent.params;
        const tonnes = calcTransportEmissions(km, vehicleType);
        const kg = Math.round(tonnes * 1000);
        return {
          text: `Found: **${km} km ${vehicleType}**. This releases **${kg} kg CO₂**. Do you want to log it?`,
          action: {
            label: `Confirm & Log`,
            onExecute: () => {
              actions.addEmissionsEntry({
                month: currentMonth,
                transport: tonnes,
                home: 0, food: 0, shopping: 0
              });
            }
          }
        };
      }
      case 'log_shopping': {
        const { amount } = intent.params;
        const usd = amount / 83;
        const tonnes = calcShoppingEmissions(usd);
        const kg = Math.round(tonnes * 1000);
        return {
          text: `Calculated shopping spend **₹${amount}**: **${kg} kg CO₂**. Log it?`,
          action: {
            label: 'Confirm Log',
            onExecute: () => {
              actions.addEmissionsEntry({
                month: currentMonth,
                transport: 0, home: 0, food: 0,
                shopping: tonnes
              });
            }
          }
        };
      }
      case 'log_food': {
        const { dietType } = intent.params;
        const tonnes = calcFoodEmissions(dietType, 30);
        const kg = Math.round(tonnes * 1000);
        return {
          text: `Calculated monthly **${dietType}** food diet: **${kg} kg CO₂**. Log it?`,
          action: {
            label: 'Confirm Log',
            onExecute: () => {
              actions.addEmissionsEntry({
                month: currentMonth,
                transport: 0, home: 0,
                food: tonnes, shopping: 0
              });
            }
          }
        };
      }
      case 'query_analysis': {
        if (emissionsData.length === 0) return { text: "No logs yet. Type: *'log 100km car'* to test." };
        const totals = emissionsData.reduce(
          (acc, curr) => {
            acc.transport += curr.transport || 0;
            acc.home += curr.home || 0;
            acc.food += curr.food || 0;
            acc.shopping += curr.shopping || 0;
            return acc;
          },
          { transport: 0, home: 0, food: 0, shopping: 0 }
        );
        const total = totals.transport + totals.home + totals.food + totals.shopping;
        return {
          text: `📊 **Overview:**
• Total: **${total.toFixed(2)} tonnes**
• Transport: ${totals.transport.toFixed(2)} t
• Home Energy: ${totals.home.toFixed(2)} t
• Food & Diet: ${totals.food.toFixed(2)} t
• Shopping: ${totals.shopping.toFixed(2)} t`
        };
      }
      case 'query_comparison': {
        const benchmark = COUNTRY_AVERAGES[userProfile.location] || 1.9;
        const diff = totalAnnual - benchmark;
        return {
          text: `⚖️ **Benchmarks:**
• Yours: **${totalAnnual.toFixed(2)} t**
• ${userProfile.location} avg: **${benchmark.toFixed(2)} t**
• Global avg: **4.70 t**
${diff > 0 ? `🔴 You are **+${diff.toFixed(2)} t** above average.` : `🟢 You are **${diff.toFixed(2)} t** below average.`}`
        };
      }
      case 'query_target': {
        const target = userProfile.annualTarget || 2.0;
        const diff = totalAnnual - target;
        return {
          text: `🎯 **Limit target:** **${target.toFixed(1)} t/yr**
• Your annual sum: **${totalAnnual.toFixed(2)} t**
${diff > 0 ? `🔴 Over target by **${diff.toFixed(2)} t**.` : `🟢 Within your limit.`}`
        };
      }
      case 'query_tips': {
        const tips = TIPS_DATA.slice(0, 2);
        return {
          text: `💡 **Eco suggestions:**
1. **${tips[0].title}** (-${tips[0].savingKg}kg/yr)
2. **${tips[1].title}** (-${tips[1].savingKg}kg/yr)`
        };
      }
      default: {
        return {
          text: `Ask me to log activities (*'log 50km car'*), run analysis (*'analyze footprint'*), check benchmarks (*'compare'*), or get ideas (*'tips'*).`
        };
      }
    }
  };

  const handleSend = (textOverride) => {
    const text = textOverride || inputVal;
    if (!text.trim()) return;

    setMessages((prev) => [...prev, { id: Date.now().toString(), sender: 'user', text }]);
    setInputVal('');
    setIsTyping(true);

    setTimeout(() => {
      const intent = parseNLP(text);
      const reply = getBotResponse(intent);
      
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: reply.text,
        action: reply.action
      }]);
      setIsTyping(false);
    }, 800);
  };

  const triggerBubbleAction = (action, msgId) => {
    action.onExecute();
    setMessages((prev) => 
      prev.map((msg) => {
        if (msg.id === msgId) {
          return {
            ...msg,
            text: msg.text + "\n\n✅ **Added to logs!**",
            action: null
          };
        }
        return msg;
      })
    );
  };

  return (
    <div className="assistant-widget-container">
      {/* Floating Toggle Icon */}
      <button 
        className={`assistant-widget-toggle ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle Assistant"
      >
        {isOpen ? <X size={20} /> : <MessageSquare size={20} />}
      </button>

      {/* Floating Chat Box Overlay */}
      {isOpen && (
        <div className="widget-chat-box card">
          {/* Header */}
          <div className="widget-chat-header">
            <div className="flex align-center gap-xs">
              <Leaf size={14} className="logo-color" />
              <span>EcoBot Lite</span>
            </div>
            <div className="status-dot"></div>
          </div>

          {/* Messages Viewport */}
          <div className="widget-messages-container">
            {messages.map((msg) => (
              <div key={msg.id} className={`widget-bubble-wrapper ${msg.sender === 'user' ? 'user' : 'bot'}`}>
                <div className="widget-bubble-content">
                  {msg.text.split('\n').map((line, idx) => {
                    let boldLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                    boldLine = boldLine.replace(/_(.*?)_/g, '<em>$1</em>');
                    if (boldLine.startsWith('•') || boldLine.startsWith('-')) {
                      return <li key={idx} dangerouslySetInnerHTML={{ __html: boldLine.replace(/^[•-]\s*/, '') }} style={{ fontSize: '0.82rem', marginLeft: '0.5rem', listStyleType: 'disc' }} />;
                    }
                    return <p key={idx} dangerouslySetInnerHTML={{ __html: boldLine }} style={{ margin: '0.2rem 0', fontSize: '0.85rem' }} />;
                  })}

                  {msg.action && (
                    <button 
                      className="widget-bubble-action"
                      onClick={() => triggerBubbleAction(msg.action, msg.id)}
                    >
                      <Check size={12} /> {msg.action.label}
                    </button>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="widget-bubble-wrapper bot typing-widget">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Queries */}
          <div className="widget-quick-queries">
            <button onClick={() => handleSend('Show analysis')}>📊 Status</button>
            <button onClick={() => handleSend('Compare me')}>⚖️ Compare</button>
            <button onClick={() => handleSend('Suggest tips')}>💡 Tips</button>
          </div>

          {/* Input form */}
          <form 
            className="widget-input-bar"
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
          >
            <input
              type="text"
              placeholder="Type command..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
            />
            <button type="submit" disabled={!inputVal.trim()}>
              <Send size={12} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
