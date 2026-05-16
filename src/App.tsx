import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Pickaxe, 
  Sword, 
  Hammer, 
  MessageSquare, 
  Compass, 
  Send, 
  User, 
  Settings,
  X,
  Plus
} from 'lucide-react';

interface Message {
  role: 'steve' | 'user';
  text: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'chat' | 'build' | 'craft'>('chat');
  const [chatHistory, setChatHistory] = useState<Message[]>([
    { role: 'steve', text: "Hello adventurer! I'm Steve. What can I help you with today? Mining, building, or escaping creepers?" }
  ]);
  const [userInput, setUserInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [buildTheme, setBuildTheme] = useState("");
  const [buildIdea, setBuildIdea] = useState<string | null>(null);
  const [isGeneratingIdea, setIsGeneratingIdea] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const newMsg: Message = { role: 'user', text: userInput };
    setChatHistory(prev => [...prev, newMsg]);
    setUserInput("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userInput })
      });
      const data = await res.json();
      setChatHistory(prev => [...prev, { role: 'steve', text: data.text }]);
    } catch (error) {
      setChatHistory(prev => [...prev, { role: 'steve', text: "Oof! Something went wrong. Maybe a creeper blew up the server?" }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleGenerateBuild = async () => {
    if (!buildTheme.trim()) return;
    setIsGeneratingIdea(true);
    setBuildIdea(null);

    try {
      const res = await fetch("/api/build-idea", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: buildTheme })
      });
      const data = await res.json();
      setBuildIdea(data.idea);
    } catch (error) {
      setBuildIdea("I couldn't think of anything... maybe just build a dirt hut?");
    } finally {
      setIsGeneratingIdea(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 bg-mc-stone bg-opacity-20 overflow-hidden relative">
      <div className="absolute inset-0 z-[-1] opacity-20" style={{
        backgroundImage: "url('https://www.transparenttextures.com/patterns/minecraft.png')",
      }}></div>

      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-4xl mc-panel flex flex-col h-[85vh] relative"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-4 border-black bg-mc-green shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-mc-brown border-2 border-black flex items-center justify-center overflow-hidden">
               <img 
                src="https://api.dicebear.com/7.x/pixel-art/svg?seed=Steve" 
                alt="Steve" 
                className="w-full h-full scale-110"
                referrerPolicy="no-referrer"
               />
            </div>
            <div>
              <h1 className="pixel-text text-2xl tracking-wide uppercase text-white drop-shadow-md">Minecraft AI</h1>
              <p className="pixel-text text-xs text-mc-grass">Steve's Wisdom v1.0</p>
            </div>
          </div>
          <div className="flex gap-2">
             <button onClick={() => setActiveTab('chat')} className={`mc-button !p-2 ${activeTab === 'chat' ? 'brightness-125' : 'brightness-75'}`}>
                <MessageSquare size={18} />
             </button>
             <button onClick={() => setActiveTab('build')} className={`mc-button !p-2 ${activeTab === 'build' ? 'brightness-125' : 'brightness-75'}`}>
                <Pickaxe size={18} />
             </button>
             <button onClick={() => setActiveTab('craft')} className={`mc-button !p-2 ${activeTab === 'craft' ? 'brightness-125' : 'brightness-75'}`}>
                <Sword size={18} />
             </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden relative flex flex-col">
          <AnimatePresence mode="wait">
            {activeTab === 'chat' && (
              <motion.div 
                key="chat"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex-1 flex flex-col p-4 overflow-y-auto"
                ref={scrollRef}
              >
                <div className="space-y-4">
                  {chatHistory.map((msg, i) => (
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      key={i} 
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] p-3 border-2 border-black relative ${
                        msg.role === 'steve' ? 'bg-[#555555]' : 'bg-mc-green'
                      }`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="pixel-text text-[10px] uppercase opacity-70">
                            {msg.role === 'steve' ? 'Steve' : 'Adventurer'}
                          </span>
                        </div>
                        <p className="text-sm sm:text-base leading-relaxed">{msg.text}</p>
                      </div>
                    </motion.div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-[#555555] p-3 border-2 border-black animate-pulse">
                        <p className="pixel-text text-sm">Steve is thinking...</p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'build' && (
              <motion.div 
                key="build"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto"
              >
                <div className="text-center">
                  <h2 className="pixel-text text-3xl mb-2 text-yellow-400 drop-shadow-md">Build Ideas</h2>
                  <p className="text-sm opacity-80">Describe a theme and Steve will blueprint it for you!</p>
                </div>

                <div className="flex gap-2">
                  <input 
                    className="flex-1 bg-black/40 border-2 border-black p-3 focus:outline-none focus:border-mc-green transition-colors"
                    placeholder="e.g. Modern Mansion, Dwarven Bridge, Space Ship..."
                    value={buildTheme}
                    onChange={(e) => setBuildTheme(e.target.value)}
                  />
                  <button 
                    onClick={handleGenerateBuild}
                    disabled={isGeneratingIdea}
                    className="mc-button"
                  >
                    Generate
                  </button>
                </div>

                {isGeneratingIdea && (
                  <div className="flex flex-col items-center justify-center py-10 gap-3">
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Pickaxe size={48} className="text-mc-green" />
                    </motion.div>
                    <p className="pixel-text">Mining for ideas...</p>
                  </div>
                )}

                {buildIdea && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-black/50 border-2 border-black p-4 rounded-sm"
                  >
                     <div className="flex items-center gap-2 mb-3 border-b border-white/20 pb-2">
                        <Compass className="text-yellow-400" size={20} />
                        <h3 className="pixel-text text-xl">The Blueprint</h3>
                     </div>
                     <div className="prose prose-invert max-w-none text-sm sm:text-base whitespace-pre-wrap">
                        {buildIdea}
                     </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {activeTab === 'craft' && (
              <motion.div 
                key="craft"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 p-6 flex flex-col overflow-y-auto"
              >
                <h2 className="pixel-text text-3xl mb-6 text-mc-grass text-center">Crafting Guide</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { name: 'Diamond Sword', ingredients: '1 Stick, 2 Diamonds', icon: Sword },
                    { name: 'Iron Pickaxe', ingredients: '2 Sticks, 3 Iron Ingots', icon: Pickaxe },
                    { name: 'Crafting Table', ingredients: '4 Wood Planks', icon: Hammer },
                    { name: 'Enchanting Table', ingredients: '1 Book, 2 Diamonds, 4 Obsidian', icon: Settings },
                    { name: 'Compass', ingredients: '4 Iron Ingots, 1 Redstone Dust', icon: Compass },
                    { name: 'Beacon', ingredients: '5 Glass, 3 Obsidian, 1 Nether Star', icon: Settings },
                  ].map((item, id) => (
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      key={id} 
                      className="bg-black/40 border-2 border-black p-3 flex items-center gap-4 group cursor-help"
                    >
                      <div className="w-12 h-12 bg-mc-brown/50 border-2 border-black flex items-center justify-center group-hover:bg-mc-green/50 transition-colors">
                        <item.icon className="text-white" size={24} />
                      </div>
                      <div>
                        <h3 className="pixel-text text-lg text-yellow-400">{item.name}</h3>
                        <p className="text-xs opacity-70">{item.ingredients}</p>
                      </div>
                    </motion.div>
                  ))}
                  <div className="col-span-full mt-4 p-3 bg-mc-brown/30 border border-dashed border-white/20 text-center">
                    <p className="text-xs opacity-60">Need something else? Ask Steve in the Chat tab!</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Chat Input Area (Only for chat tab) */}
        {activeTab === 'chat' && (
          <div className="p-4 border-t-4 border-black bg-black/40 flex gap-2">
            <input 
              className="flex-1 bg-black/40 border-2 border-white/10 p-3 focus:outline-none focus:border-mc-green transition-colors"
              placeholder="What's on your mind?..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button 
              onClick={handleSendMessage}
              className="mc-button flex items-center justify-center gap-2"
            >
              <Send size={18} />
              <span className="hidden sm:inline">Send</span>
            </button>
          </div>
        )}
      </motion.div>

      {/* Background Ambience */}
      <div className="fixed bottom-4 left-4 flex flex-col items-start gap-2 pointer-events-none opacity-40">
        <div className="flex items-center gap-2">
           <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
           <p className="pixel-text text-sm">Server Status: Online</p>
        </div>
        <div className="flex items-center gap-2">
           <div className="w-3 h-3 bg-mc-grass rounded-full"></div>
           <p className="pixel-text text-sm">Steve is resting</p>
        </div>
      </div>
    </div>
  );
}
