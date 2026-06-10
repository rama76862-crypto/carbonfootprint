import React, { useState, useEffect, useRef } from 'react';
import { useCarbonContext } from '../context/CarbonContext';
import { 
  calcTransportEmissions, 
  calcHomeEmissions, 
  calcFoodEmissions, 
  calcShoppingEmissions 
} from '../utils/calculations';
import { COUNTRY_AVERAGES, TIPS_DATA, MONTHS } from '../utils/constants';
import { Send, Leaf, Sparkles, User, BrainCircuit, BarChart3, HelpCircle, Check, ArrowRight, MessageSquareCode } from 'lucide-react';
import './Assistant.css';

export default function Assistant() {
  const { userProfile, emissionsData, totalAnnual, actions } = useCarbonContext();
  const [messages, setMessages] = useState([]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  // Initialize chatbot conversation
  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        sender: 'bot',
        text: `Hello ${userProfile.name}! 🌍 I'm EcoBot, your smart carbon assistant. I can analyze your footprint, suggest reduction tips, or help you log activities instantly. Try typing something like:`,
        suggestions: [
          'Analyze my carbon footprint',
          'Log a 50 km car trip',
          'How do I compare to benchmarks?',
          'Suggest tips to save carbon'
        ]
      }
    ]);
  }, [userProfile.name]);

  // Scroll to bottom whenever messages list grows
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Client-Side Intent Parser
  const parseNLP = (text) => {
    const input = text.toLowerCase().trim();

    // 1. Transport Log Regex: "log 100km car", "add 50 km flight", "log car 80 km"
    const transRegex = /(?:log|add|drove|flew|travelled|rode)\s+(\d+(?:\.\d+)?)\s*(?:km|kilometers)?\s*(?:in|on|by|a)?\s*(car|flight|plane|bus|train|bike)/i;
    const transMatch = input.match(transRegex);
    if (transMatch) {
      const km = parseFloat(transMatch[1]);
      const type = transMatch[2].toLowerCase().replace('plane', 'flight');
      return {
        type: 'log_transport',
        params: { km, vehicleType: type }
      };
    }

    // 2. Shopping Log Regex: "log 4000 shopping", "spent ₹2500 on shopping"
    const shopRegex = /(?:log|add|spent|spend)\s*(?:rs\.?|inr|₹)?\s*(\d+)\s*(?:rupees|inr)?\s*(?:on)?\s*shopping/i;
    const shopMatch = input.match(shopRegex);
    if (shopMatch) {
      const amount = parseInt(shopMatch[1]);
      return {
        type: 'log_shopping',
        params: { amount }
      };
    }

    // 3. Diet Log Regex: "log vegan meal", "log vegetarian diet"
    const foodRegex = /(?:log|add|ate|diet|meal)\s*(?:a)?\s*(meat_heavy|omnivore|vegetarian|vegan)(?:\s*diet|\s*meal|\s*food)?/i;
    const foodMatch = input.match(foodRegex);
    if (foodMatch) {
      const diet = foodMatch[1].toLowerCase();
      return {
        type: 'log_food',
        params: { dietType: diet }
      };
    }

    // 4. Electricity Log: "log 300 kwh electricity"
    const elecRegex = /(?:log|add|electricity|kwh)\s+(\d+(?:\.\d+)?)\s*(?:kwh|units)?(?:\s*electricity)?/i;
    const elecMatch = input.match(elecRegex);
    if (elecMatch) {
      const kwh = parseFloat(elecMatch[1]);
      return {
        type: 'log_electricity',
        params: { kwh }
      };
    }

    // 5. Gas Log: "log 80 units gas"
    const gasRegex = /(?:log|add|gas|units)\s+(\d+(?:\.\d+)?)\s*(?:gas|units)?(?:\s*gas)?/i;
    const gasMatch = input.match(gasRegex);
    if (gasMatch) {
      const gas = parseFloat(gasMatch[1]);
      return {
        type: 'log_gas',
        params: { gas }
      };
    }

    // 6. Analytics queries
    if (input.includes('analyze') || input.includes('breakdown') || input.includes('highest') || input.includes('summary') || input.includes('biggest') || input.includes('report')) {
      return { type: 'query_analysis' };
    }

    // 7. Comparison benchmarks
    if (input.includes('compare') || input.includes('average') || input.includes('benchmark') || input.includes('india') || input.includes('us') || input.includes('world')) {
      return { type: 'query_comparison' };
    }

    // 8. Paris Targets
    if (input.includes('target') || input.includes('paris') || input.includes('agreement') || input.includes('limit') || input.includes('goal')) {
      return { type: 'query_target' };
    }

    // 9. Eco Advice
    if (input.includes('tip') || input.includes('save') || input.includes('reduce') || input.includes('help planet') || input.includes('mitigate') || input.includes('advice')) {
      return { type: 'query_tips' };
    }

    return { type: 'chitchat' };
  };

  // Bot response generator based on parsed intent
  const getBotResponse = (intent, text) => {
    // Current logging month helper (uses July as default mock tracker month)
    const currentMonth = 'July';

    switch (intent.type) {
      case 'log_transport': {
        const { km, vehicleType } = intent.params;
        const tonnes = calcTransportEmissions(km, vehicleType);
        const kg = Math.round(tonnes * 1000);
        
        return {
          text: `I've calculated the footprint for your **${km} km ${vehicleType}** trip. 
          
🚗 Emission factor: **${(kg / km).toFixed(3)} kg CO₂/km**
📉 Total CO₂: **${kg} kg**
          
Would you like to log this activity to your **${currentMonth}** logs?`,
          action: {
            label: `Confirm & Log ${kg} kg CO₂`,
            onExecute: () => {
              // Add to tracker list (reusing context values)
              actions.addEmissionsEntry({
                month: currentMonth,
                transport: tonnes,
                home: 0,
                food: 0,
                shopping: 0
              });
            }
          }
        };
      }

      case 'log_shopping': {
        const { amount } = intent.params;
        // Convert to USD (approx 83 INR)
        const usd = amount / 83;
        const tonnes = calcShoppingEmissions(usd);
        const kg = Math.round(tonnes * 1000);

        return {
          text: `Shopping spend of **₹${amount.toLocaleString()}** (~$${Math.round(usd)} USD) calculated:
          
💳 Sector footprint: **${kg} kg CO₂**
          
Would you like to log this shopping entry to **${currentMonth}**?`,
          action: {
            label: `Log ₹${amount.toLocaleString()} Spend`,
            onExecute: () => {
              actions.addEmissionsEntry({
                month: currentMonth,
                transport: 0,
                home: 0,
                food: 0,
                shopping: tonnes
              });
            }
          }
        };
      }

      case 'log_food': {
        const { dietType } = intent.params;
        const tonnes = calcFoodEmissions(dietType, 30); // 30 days total
        const kg = Math.round(tonnes * 1000);
        
        const dietLabels = {
          vegan: 'Vegan',
          vegetarian: 'Vegetarian',
          omnivore: 'Omnivore',
          meat_heavy: 'Meat-heavy'
        };

        return {
          text: `I've calculated your **${dietLabels[dietType]}** monthly food footprint.
          
🍲 Monthly total: **${kg} kg CO₂**
          
Would you like to log this diet profile for **${currentMonth}**?`,
          action: {
            label: `Save ${dietLabels[dietType]} Diet`,
            onExecute: () => {
              actions.addEmissionsEntry({
                month: currentMonth,
                transport: 0,
                home: 0,
                food: tonnes,
                shopping: 0
              });
            }
          }
        };
      }

      case 'log_electricity': {
        const { kwh } = intent.params;
        const tonnes = calcHomeEmissions(kwh, 0);
        const kg = Math.round(tonnes * 1000);

        return {
          text: `Electricity usage of **${kwh} kWh** calculated.
          
💡 Emissions share: **${kg} kg CO₂** (before household sharing divider)
          
Would you like to save this to **${currentMonth}** energy logs?`,
          action: {
            label: `Save ${kwh} kWh Energy`,
            onExecute: () => {
              actions.addEmissionsEntry({
                month: currentMonth,
                transport: 0,
                home: tonnes / userProfile.householdSize,
                food: 0,
                shopping: 0
              });
            }
          }
        };
      }

      case 'log_gas': {
        const { gas } = intent.params;
        const tonnes = calcHomeEmissions(0, gas);
        const kg = Math.round(tonnes * 1000);

        return {
          text: `Gas utility consumption of **${gas} units** calculated.
          
🔥 Emissions share: **${kg} kg CO₂**
          
Would you like to log this energy data for **${currentMonth}**?`,
          action: {
            label: `Log ${gas} Units Gas`,
            onExecute: () => {
              actions.addEmissionsEntry({
                month: currentMonth,
                transport: 0,
                home: tonnes / userProfile.householdSize,
                food: 0,
                shopping: 0
              });
            }
          }
        };
      }

      case 'query_analysis': {
        if (emissionsData.length === 0) {
          return { text: "You don't have any emissions logged yet. Head to the **Tracker** page to log some activities, or tell me to log them here (e.g. *'log 100 km car'*)." };
        }

        // Aggregate sector totals
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

        const grandTotal = totals.transport + totals.home + totals.food + totals.shopping;
        
        // Find highest
        const sorted = Object.keys(totals).map(k => ({ name: k, value: totals[k] })).sort((a,b) => b.value - a.value);
        const highest = sorted[0];

        const catNames = { transport: 'Transport', home: 'Home Energy', food: 'Food & Diet', shopping: 'Shopping' };

        return {
          text: `📊 **Here is your Carbon Footprint Analysis:**
          
• **Total emissions:** **${grandTotal.toFixed(2)} tonnes CO₂e**
• **Transport:** ${totals.transport.toFixed(2)} t (${Math.round((totals.transport/grandTotal)*100)}%)
• **Home Energy:** ${totals.home.toFixed(2)} t (${Math.round((totals.home/grandTotal)*100)}%)
• **Food & Diet:** ${totals.food.toFixed(2)} t (${Math.round((totals.food/grandTotal)*100)}%)
• **Shopping:** ${totals.shopping.toFixed(2)} t (${Math.round((totals.shopping/grandTotal)*100)}%)
          
⚠️ Your highest emitting sector is **${catNames[highest.name]}** with **${highest.value.toFixed(2)} tonnes**, representing **${Math.round((highest.value/grandTotal)*100)}%** of your footprint. Focus on this category first for reduction.`
        };
      }

      case 'query_comparison': {
        const benchmark = COUNTRY_AVERAGES[userProfile.location] || 1.9;
        const diffCountry = totalAnnual - benchmark;
        const diffGlobal = totalAnnual - 4.7;

        return {
          text: `⚖️ **Carbon Benchmarks Comparison:**
          
• Your footprint: **${totalAnnual.toFixed(2)} tonnes CO₂/yr**
• **${userProfile.location}** average: **${benchmark.toFixed(2)} tonnes/yr**
• **Global** average: **4.70 tonnes/yr**
          
${diffCountry > 0 
  ? `🔴 You are **${diffCountry.toFixed(2)} tonnes ABOVE** the standard average in your country (${userProfile.location}).`
  : `🟢 Kudos! You are **${Math.abs(diffCountry).toFixed(2)} tonnes BELOW** the average in ${userProfile.location}.`
}
${diffGlobal > 0
  ? `🔴 You are **${diffGlobal.toFixed(2)} tonnes ABOVE** the global average per person.`
  : `🟢 Excellent! You are **${Math.abs(diffGlobal).toFixed(2)} tonnes BELOW** the global average.`
}`
        };
      }

      case 'query_target': {
        const target = userProfile.annualTarget || 2.0;
        const diff = totalAnnual - target;

        return {
          text: `🎯 **Paris Climate Target Check:**
          
To prevent global temperatures from warming more than 1.5°C, the Paris Climate Agreement targets a carbon limit of **${target.toFixed(1)} tonnes** per person annually by 2050.
          
• Your current level: **${totalAnnual.toFixed(2)} tonnes/yr**
• Your annual target: **${target.toFixed(2)} tonnes/yr**
          
${diff > 0 
  ? `🔴 You are currently exceeding your target by **${diff.toFixed(2)} tonnes**. You need a **${Math.round((diff/totalAnnual)*100)}% reduction** to align with the Paris goal.`
  : `🟢 Superb! Your current emissions are **within your target limit**. Keep maintaining this sustainable lifestyle!`
}`
        };
      }

      case 'query_tips': {
        // Aggregate totals to recommend tips for highest sector
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

        const highestSector = Object.keys(totals).reduce((a, b) => totals[a] > totals[b] ? a : b, 'transport');
        
        // Filter tips matching highest sector
        const matchedTips = TIPS_DATA.filter(t => t.category === highestSector).slice(0, 3);
        const textIntro = `💡 Since **${highestSector.toUpperCase()}** is your highest emitting category, here are 3 recommended actions:`;
        
        const tipBullets = matchedTips.map((t, idx) => {
          const difficultyBadge = t.difficulty === 'easy' ? '🟢' : t.difficulty === 'medium' ? '🟡' : '🔴';
          return `\n${idx + 1}. **${t.title}** (${difficultyBadge} ${t.difficulty})\n   _${t.description}_\n   Saving: **-${t.savingKg} kg CO₂ / yr**`;
        }).join('\n');

        return {
          text: `${textIntro}\n${tipBullets}\n\nFor more tips, visit the **Tips** page on the sidebar.`
        };
      }

      default: {
        return {
          text: `I'm not sure I understood that logging format or question. 
          
💡 **Here is what I can do:**
• **Calculations:** Try *"log 120 km flight"*, *"spent ₹4000 on shopping"*, or *"log vegan meal"*.
• **Footprint Analysis:** Try *"analyze footprint"* or *"show my breakdown"*.
• **Comparisons:** Ask *"compare to India average"* or *"what is the global average?"*.
• **Paris Agreement:** Ask *"what is my target?"*.`
        };
      }
    }
  };

  const handleSendMessage = (textToSend) => {
    const text = textToSend || inputVal;
    if (!text.trim()) return;

    // Add user message
    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: text
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    
    // Trigger typing simulation
    setIsTyping(true);
    setTimeout(() => {
      const intent = parseNLP(text);
      const botReply = getBotResponse(intent, text);
      
      const newBotMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: botReply.text,
        action: botReply.action
      };

      setMessages((prev) => [...prev, newBotMsg]);
      setIsTyping(false);
    }, 1000);
  };

  const executeBubbleAction = (action, msgId) => {
    // Execute context operation
    action.onExecute();

    // Update message bubble state to show action executed successfully
    setMessages((prev) => 
      prev.map((msg) => {
        if (msg.id === msgId) {
          return {
            ...msg,
            text: msg.text + "\n\n✅ **Success! This activity has been recorded in your tracking logs.**",
            action: null // remove button
          };
        }
        return msg;
      })
    );
  };

  return (
    <div className="inner-page assistant-page">
      <div className="page-header flex align-center justify-between">
        <div>
          <h1 className="page-title flex align-center gap-sm">
            <BrainCircuit size={28} className="text-accent pulsating-icon" />
            AI Eco Assistant
          </h1>
          <p className="page-description">Ask questions, compare benchmarks, or log activities using natural language.</p>
        </div>
        <div className="assistant-status-badge">
          <span className="status-dot"></span>
          <span>EcoBot Agent Online</span>
        </div>
      </div>

      <div className="assistant-chat-container card">
        <div className="chat-messages-viewport">
          {messages.map((msg) => (
            <div key={msg.id} className={`message-bubble-wrapper ${msg.sender === 'user' ? 'user-aligned' : 'bot-aligned'}`}>
              <div className="avatar-circle">
                {msg.sender === 'user' ? <User size={14} /> : <Leaf size={14} className="logo-color" />}
              </div>
              <div className="message-content-box">
                {/* Parse simple markdown bold and lists */}
                <div className="message-text">
                  {msg.text.split('\n').map((line, idx) => {
                    // Bold replacer
                    let cleanLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                    cleanLine = cleanLine.replace(/_(.*?)_/g, '<em>$1</em>');
                    // Lists checker
                    if (cleanLine.trim().startsWith('•') || cleanLine.trim().startsWith('-')) {
                      return <li key={idx} dangerouslySetInnerHTML={{ __html: cleanLine.replace(/^[•-]\s*/, '') }} style={{ marginLeft: '1rem', listStyleType: 'disc' }} />;
                    }
                    return <p key={idx} dangerouslySetInnerHTML={{ __html: cleanLine }} style={{ margin: '0.25rem 0' }} />;
                  })}
                </div>

                {/* Confirmable Logging Buttons inside bubbles */}
                {msg.action && (
                  <button 
                    className="bubble-action-btn flex align-center gap-xs"
                    onClick={() => executeBubbleAction(msg.action, msg.id)}
                  >
                    <Check size={14} /> {msg.action.label}
                  </button>
                )}

                {/* Suggestions chips for welcome screen */}
                {msg.suggestions && (
                  <div className="chips-container">
                    {msg.suggestions.map((sug, i) => (
                      <button
                        key={i}
                        className="suggestion-chip"
                        onClick={() => handleSendMessage(sug)}
                      >
                        {sug} <ArrowRight size={12} className="chip-arrow" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="message-bubble-wrapper bot-aligned">
              <div className="avatar-circle">
                <Leaf size={14} className="logo-color pulsating-icon" />
              </div>
              <div className="message-content-box typing-indicator-bubble">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        {/* Input Bar */}
        <form 
          className="chat-input-bar" 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
        >
          <input
            type="text"
            placeholder="Type 'log 120 km car' or ask 'Compare me to benchmarks'..."
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            className="chat-text-input"
          />
          <button type="submit" className="chat-send-btn" disabled={!inputVal.trim()}>
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
