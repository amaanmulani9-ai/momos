'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send, ChefHat, ShoppingCart, Mic } from 'lucide-react';
import { PRODUCTS, SHOP_INFO } from '@/lib/data';

// Web Speech API interface
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface Message {
  id: string;
  role: 'bot' | 'user';
  text: string;
  time: string;
  quickReplies?: string[];
}

interface OrderItem { name: string; qty: number; price: number }

type BotStep = 'greeting' | 'browse' | 'adding' | 'qty' | 'more' | 'details' | 'name' | 'address' | 'payment' | 'confirm';

const GREETINGS = [
  "Hi! 👋 Welcome to *Meghna's Kitchen*! I'm your AI order assistant.",
  "I can help you order from our menu of 60+ dishes — Momos, Pizza, Chinese, Pasta, Burgers, Healthy & Luxury food! 🎉",
];

function botMsg(text: string, quickReplies?: string[]): Message {
  return { id: Date.now() + Math.random() + '', role: 'bot', text, time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }), quickReplies };
}

function getTime() { return new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }); }

const CATEGORY_MAP: Record<string, string> = {
  momo: 'momos', steam: 'steam', fried: 'fried', kurkure: 'kurkure', pizza: 'pizza',
  chinese: 'chinese', noodle: 'chinese', pasta: 'pasta', burger: 'fastfood', fast: 'fastfood',
  healthy: 'healthy', salad: 'healthy', luxury: 'luxury', premium: 'luxury', drink: 'drinks',
  indian: 'indian', asian: 'asian', combo: 'combo',
};

export default function AIChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [step, setStep] = useState<BotStep>('greeting');
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [pendingItem, setPendingItem] = useState<{ name: string; price: number } | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  const [isListening, setIsListening] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  useEffect(() => {
    if (open && messages.length === 0) {
      setTimeout(() => addBotMessages([
        botMsg(GREETINGS[0]),
        botMsg(GREETINGS[1]),
        botMsg('What would you like to order? You can say:\n• "Show momos"\n• "Show pizza"\n• "Show chinese"\n• "Show healthy food"\n• Or just type any dish name!', [
          '🥟 Momos', '🍕 Pizza', '🍜 Chinese', '🥗 Healthy', '👑 Luxury', '🍔 Burgers'
        ]),
      ], 0));
      setStep('browse');
    }
  }, [open]);

  function addBotMessages(msgs: Message[], delayStart = 300) {
    msgs.forEach((m, i) => {
      setTimeout(() => setMessages(prev => [...prev, m]), delayStart + i * 600);
    });
  }

  function findProduct(query: string) {
    const q = query.toLowerCase();
    return PRODUCTS.find(p =>
      p.name.toLowerCase().includes(q) ||
      p.slug.includes(q.replace(/\s/g, '-'))
    );
  }

  function getCategory(query: string) {
    const q = query.toLowerCase();
    for (const [key, cat] of Object.entries(CATEGORY_MAP)) {
      if (q.includes(key)) return cat;
    }
    return null;
  }

  function getProductsForCategory(cat: string) {
    return PRODUCTS.filter(p =>
      cat === 'momos'
        ? ['steam', 'fried', 'kurkure', 'indian', 'asian'].includes(p.category)
        : p.category === cat
    ).slice(0, 6);
  }

  function orderTotal() { return orderItems.reduce((s, i) => s + i.qty * i.price, 0); }

  async function sendToWhatsApp() {
    const subtotal = orderTotal();
    const delivery = subtotal >= SHOP_INFO.freeDeliveryAbove ? 0 : SHOP_INFO.deliveryFee;
    const total = subtotal + delivery;
    
    let n8nUsed = false;
    try {
      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customerName,
          phone: "Unknown", // from bot
          address: customerAddress,
          payment_method: paymentMethod,
          notes: "Ordered via AI Chatbot",
          total_amount: total,
          items: orderItems.map(i => {
             const prod = PRODUCTS.find(p => p.name === i.name);
             return { product_id: prod ? prod.id : '0', product_name: i.name, quantity: i.qty, item_price: i.price };
          }),
        }),
      });
      const data = await res.json();
      if (data?.n8nSuccess) n8nUsed = true;
    } catch {}

    if (!n8nUsed) {
      const itemsList = orderItems.map(i => `• ${i.name} x${i.qty} = ₹${i.qty * i.price}`).join('\n');
      const msg = encodeURIComponent(
        `🍽️ *New Order — Meghna's Kitchen*\n\n` +
        `*Customer:* ${customerName}\n` +
        `*Address:* ${customerAddress}\n` +
        `*Payment:* ${paymentMethod}\n\n` +
        `*Items:*\n${itemsList}\n\n` +
        `Subtotal: ₹${subtotal}\nDelivery: ${delivery === 0 ? 'FREE 🎉' : '₹' + delivery}\n` +
        `*TOTAL: ₹${total}*\n\n` +
        `_Order placed via AI Chat Bot_ ✅`
      );
      window.open(`https://wa.me/${SHOP_INFO.whatsapp}?text=${msg}`, '_blank');
    }
  }

  function handleSend(text?: string) {
    const msg = (text || input).trim();
    if (!msg) return;
    setInput('');
    const userMsg: Message = { id: Date.now() + '', role: 'user', text: msg, time: getTime() };
    setMessages(prev => [...prev, userMsg]);

    setTimeout(() => processInput(msg), 500);
  }

  function startListening() {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in your browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setTimeout(() => handleSend(transcript), 200);
    };

    recognition.start();
  }

  function processInput(msg: string) {
    const lower = msg.toLowerCase();

    // Step: Quantity input
    if (step === 'qty' && pendingItem) {
      const qty = parseInt(msg);
      if (!isNaN(qty) && qty > 0 && qty <= 20) {
        const item = { name: pendingItem.name, qty, price: pendingItem.price };
        setOrderItems(prev => {
          const existing = prev.find(i => i.name === item.name);
          if (existing) return prev.map(i => i.name === item.name ? { ...i, qty: i.qty + qty } : i);
          return [...prev, item];
        });
        setPendingItem(null);
        setStep('more');
        addBotMessages([
          botMsg(`✅ Added *${qty}x ${item.name}* (₹${item.price * qty}) to your order!`),
          botMsg(`🛒 *Your order so far:*\n${[...orderItems, item].map(i => `• ${i.qty}x ${i.name} = ₹${i.qty * i.price}`).join('\n')}\n\n*Subtotal: ₹${orderItems.reduce((s, i) => s + i.qty * i.price, 0) + item.price * qty}*`, [
            '✅ Looks good! Place order', '➕ Add more items', '🗑️ Start over'
          ]),
        ]);
        return;
      } else {
        addBotMessages([botMsg('Please enter a valid quantity (1–20) 🙏')]);
        return;
      }
    }

    // Step: Name
    if (step === 'name') {
      setCustomerName(msg);
      setStep('address');
      addBotMessages([botMsg(`Nice to meet you, *${msg}*! 😊\n\nWhat's your delivery address? (Include area, sector, or landmark)`)]);
      return;
    }

    // Step: Address
    if (step === 'address') {
      setCustomerAddress(msg);
      setStep('payment');
      addBotMessages([botMsg('How would you like to pay?', ['💵 Cash on Delivery', '📱 UPI (GPay/PhonePe)', '💳 Card on Delivery'])]);
      return;
    }

    // Step: Payment
    if (step === 'payment') {
      const pm = lower.includes('upi') || lower.includes('gpay') || lower.includes('phonepe') ? 'UPI' :
        lower.includes('card') ? 'Card on Delivery' : 'Cash on Delivery';
      setPaymentMethod(pm);
      setStep('confirm');
      const subtotal = orderTotal();
      const delivery = subtotal >= SHOP_INFO.freeDeliveryAbove ? 0 : SHOP_INFO.deliveryFee;
      addBotMessages([
        botMsg(
          `📋 *Order Summary:*\n\n` +
          orderItems.map(i => `• ${i.qty}x ${i.name} = ₹${i.qty * i.price}`).join('\n') +
          `\n\n👤 *Name:* ${customerName}\n📍 *Address:* ${customerAddress}\n💳 *Payment:* ${pm}` +
          `\n\nSubtotal: ₹${subtotal}\nDelivery: ${delivery === 0 ? 'FREE 🎉' : '₹' + delivery}\n*Total: ₹${subtotal + delivery}*`,
          ['✅ Confirm & Send to WhatsApp', '✏️ Edit order']
        ),
      ]);
      return;
    }

    // Step: Confirm
    if (step === 'confirm') {
      if (lower.includes('confirm') || lower.includes('send') || lower.includes('yes') || lower.includes('whatsapp')) {
        sendToWhatsApp();
        addBotMessages([
          botMsg('🎉 *Order sent to WhatsApp!*\nWe\'ll confirm your order shortly. Expected delivery: *30–45 mins* 🛵\n\nThank you for ordering from *Meghna\'s Kitchen!* 💙'),
        ]);
        setTimeout(() => {
          setMessages([]);
          setOrderItems([]);
          setCustomerName('');
          setCustomerAddress('');
          setStep('browse');
        }, 5000);
        return;
      }
      if (lower.includes('edit') || lower.includes('change')) {
        setStep('more');
        addBotMessages([botMsg('Sure! What would you like to change?', ['➕ Add more items', '🧾 View order', '🗑️ Start over'])]);
        return;
      }
    }

    // Quick reply / button
    if (lower.includes('place order') || lower.includes('looks good') || lower.includes('checkout')) {
      if (orderItems.length === 0) {
        addBotMessages([botMsg('Your cart is empty! Please add some items first 😊', ['🥟 Momos', '🍕 Pizza', '🍜 Chinese'])]);
        return;
      }
      setStep('name');
      addBotMessages([botMsg('Great! Let me take your details. What\'s your name? 😊')]);
      return;
    }

    if (lower.includes('view order') || lower.includes('my order') || lower.includes('cart')) {
      if (orderItems.length === 0) {
        addBotMessages([botMsg('Your cart is empty. Start by telling me what you\'d like to eat!', ['🥟 Momos', '🍕 Pizza', '🍔 Burgers'])]);
      } else {
        const subtotal = orderTotal();
        addBotMessages([
          botMsg(`🛒 *Your Cart:*\n${orderItems.map(i => `• ${i.qty}x ${i.name} = ₹${i.qty * i.price}`).join('\n')}\n\n*Subtotal: ₹${subtotal}*`, [
            '✅ Looks good! Place order', '➕ Add more items', '🗑️ Start over'
          ]),
        ]);
      }
      return;
    }

    if (lower.includes('start over') || lower.includes('clear') || lower.includes('reset')) {
      setOrderItems([]);
      setStep('browse');
      addBotMessages([botMsg('Cart cleared! What would you like to order?', ['🥟 Momos', '🍕 Pizza', '🍜 Chinese', '🥗 Healthy'])]);
      return;
    }

    if (lower.includes('add more') || lower.includes('something else')) {
      setStep('browse');
      addBotMessages([botMsg('Sure! What else would you like to add?', ['🥟 Momos', '🍕 Pizza', '🍜 Chinese', '🍔 Burgers', '🥗 Healthy', '👑 Luxury'])]);
      return;
    }

    // Category browsing
    const cat = getCategory(lower);
    if (cat || lower.includes('show') || lower.includes('menu')) {
      const resolvedCat = cat || 'momos';
      const products = getProductsForCategory(resolvedCat);
      if (products.length > 0) {
        const list = products.map(p => `• *${p.name}* — ₹${p.price} (${p.servings})`).join('\n');
        addBotMessages([
          botMsg(`Here are our ${resolvedCat === 'momos' ? 'momos' : resolvedCat} options:\n\n${list}\n\nJust type the name of what you'd like to order! 👆`),
        ]);
        return;
      }
    }

    // Product search
    const product = findProduct(lower);
    if (product) {
      setPendingItem({ name: product.name, price: product.price });
      setStep('qty');
      addBotMessages([
        botMsg(`Great choice! 🎉\n\n*${product.name}*\n₹${product.price} per ${product.servings}\n${product.description}\n\nHow many would you like?`, ['1', '2', '3', '4', '6']),
      ]);
      return;
    }

    // Help / fallback
    addBotMessages([
      botMsg(`I didn't quite catch that. You can:\n• Type a dish name (e.g. "chicken momo", "margherita pizza")\n• Say "show pizza" to browse a category\n• Say "view order" to see your cart`, [
        '🥟 Show Momos', '🍕 Show Pizza', '🍜 Show Chinese', '📋 View Order'
      ]),
    ]);
  }

  return (
    <>
      {/* Floating trigger */}
      <motion.button
        id="ai-chatbot-btn"
        onClick={() => setOpen(true)}
        className="fixed bottom-36 right-4 z-40 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl"
        style={{ background: 'linear-gradient(135deg, #25D366, #128C7E)' }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        aria-label="Open AI order chatbot"
      >
        <ChefHat className="w-7 h-7 text-white" />
        <motion.div
          className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
          style={{ background: '#c0392b' }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >AI</motion.div>
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="chatbot"
            initial={{ opacity: 0, scale: 0.8, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 40 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-20 right-4 z-50 w-[340px] max-h-[580px] flex flex-col rounded-3xl shadow-2xl overflow-hidden"
            style={{ background: '#111' }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3" style={{ background: '#128C7E' }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#25D366' }}>
                <ChefHat className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-white text-sm">Meghna's Kitchen Bot</p>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-300 animate-pulse" />
                  <p className="text-white/80 text-xs">Online — AI Order Assistant</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {orderItems.length > 0 && (
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold text-white" style={{ background: 'rgba(255,255,255,0.2)' }}>
                    <ShoppingCart className="w-3 h-3" />
                    {orderItems.reduce((s, i) => s + i.qty, 0)}
                  </div>
                )}
                <button onClick={() => setOpen(false)} className="p-1 rounded-full hover:bg-white/20 transition-colors">
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* Chat wallpaper background */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2" style={{ background: '#0d1117', backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,0.01) 35px, rgba(255,255,255,0.01) 70px)' }}>
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className="max-w-[82%]">
                    <div
                      className="px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap"
                      style={{
                        background: m.role === 'user' ? '#005c4b' : '#1f2c34',
                        color: '#e9edef',
                        borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      }}
                      dangerouslySetInnerHTML={{
                        __html: m.text.replace(/\*(.*?)\*/g, '<strong>$1</strong>'),
                      }}
                    />
                    <p className={`text-xs mt-0.5 text-gray-500 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>{m.time}</p>
                    {m.quickReplies && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {m.quickReplies.map(qr => (
                          <button
                            key={qr}
                            onClick={() => handleSend(qr)}
                            className="text-xs px-3 py-1.5 rounded-full font-medium transition-all hover:scale-105"
                            style={{ background: '#00a884', color: '#fff' }}
                          >{qr}</button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="flex items-center gap-2 px-3 py-2" style={{ background: '#1f2c34' }}>
              <input
                id="chatbot-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={isListening ? "Listening..." : "Type or speak a dish..."}
                className="flex-1 px-3 py-2 rounded-full text-sm outline-none text-white placeholder-gray-500 transition-all"
                style={{ background: isListening ? '#103020' : '#2a3942', border: isListening ? '1px solid #00a884' : '1px solid transparent' }}
              />
              <button
                onClick={startListening}
                className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all ${isListening ? 'animate-pulse' : 'hover:scale-110'}`}
                style={{ background: isListening ? '#ff4d4d' : '#2a3942' }}
              >
                <Mic className="w-4 h-4 text-white" />
              </button>
              <button
                id="chatbot-send-btn"
                onClick={() => handleSend()}
                className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all hover:scale-110"
                style={{ background: '#00a884' }}
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
