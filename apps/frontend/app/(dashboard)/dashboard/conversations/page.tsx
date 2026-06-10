// apps/frontend/app/(dashboard)/dashboard/conversations/page.tsx
"use client";

import { useAuth } from "../../../../context/AuthContext";
import { useEffect, useState } from "react";

interface Message {
  sender: "client" | "producer";
  text: string;
  time: string;
}

interface Conversation {
  id: string;
  clientName: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: Message[];
}

export default function ConversationsPage() {
  const { session, loading: authLoading } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [chatInput, setChatInput] = useState("");

  useEffect(() => {
    if (authLoading) return;

    async function fetchConversations() {
      try {
        const token = session?.access_token;
        const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

        const res = await fetch(`${apiUrl}/api/producer/conversations`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (res.ok) {
          const data = await res.json();
          const list = data.conversations || [];
          setConversations(list);
          if (list.length > 0) {
            setSelectedChatId(list[0].id);
          }
        } else {
          throw new Error("Failed to load conversations API");
        }
      } catch (err) {
        console.error("[Conversations View] API load error, falling back to mocks:", err);
        const mocks: Conversation[] = [
          {
            id: "chat-1",
            clientName: "Sarah Jenkins",
            lastMessage: "I uploaded my current dec page. Did you receive it?",
            lastMessageTime: "11:00 AM",
            unreadCount: 1,
            messages: [
              { sender: "producer", text: "Hi Sarah, I'm working on your Auto/Home bundle quotes. Could you send your current policy declaration pages?", time: "10:15 AM" },
              { sender: "client", text: "Sure, let me find them. I'll text them over shortly.", time: "10:20 AM" },
              { sender: "client", text: "I uploaded my current dec page. Did you receive it?", time: "11:00 AM" }
            ]
          },
          {
            id: "chat-2",
            clientName: "Sophia Loren",
            lastMessage: "Okay, please call me at 2:00 PM to talk about the Progressive rate.",
            lastMessageTime: "9:30 AM",
            unreadCount: 0,
            messages: [
              { sender: "producer", text: "Hi Sophia, I noticed your policy lapsed yesterday. I did a review and found a package with Progressive that saves you $120/year.", time: "8:30 AM" },
              { sender: "client", text: "Oh, thank you! Yes, my card expired so the auto-pay failed.", time: "9:15 AM" },
              { sender: "client", text: "Okay, please call me at 2:00 PM to talk about the Progressive rate.", time: "9:30 AM" }
            ]
          },
          {
            id: "chat-3",
            clientName: "Elena Rostova",
            lastMessage: "Perfect, looking forward to the underwriting review.",
            lastMessageTime: "Yesterday",
            unreadCount: 0,
            messages: [
              { sender: "client", text: "Did underwriting approve the extra driver?", time: "Yesterday" },
              { sender: "producer", text: "Yes Elena, I submitted the MVR check and they cleared Marcus. The binder is updated.", time: "Yesterday" },
              { sender: "client", text: "Perfect, looking forward to the underwriting review.", time: "Yesterday" }
            ]
          }
        ];
        setConversations(mocks);
        if (mocks.length > 0) {
          setSelectedChatId(mocks[0].id);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchConversations();
  }, [session, authLoading]);

  // Selected active conversation details
  const activeChat = conversations.find(c => c.id === selectedChatId);

  // Send message locally
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !selectedChatId) return;

    const newMsg: Message = {
      sender: "producer",
      text: chatInput.trim(),
      time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
    };

    setConversations(prev =>
      prev.map(c => {
        if (c.id === selectedChatId) {
          return {
            ...c,
            lastMessage: newMsg.text,
            lastMessageTime: newMsg.time,
            unreadCount: 0,
            messages: [...c.messages, newMsg]
          };
        }
        return c;
      })
    );

    setChatInput("");
  };

  // Mark active chat as read
  const handleSelectChat = (id: string) => {
    setSelectedChatId(id);
    setConversations(prev =>
      prev.map(c => (c.id === id ? { ...c, unreadCount: 0 } : c))
    );
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 text-zinc-300 h-[85vh] flex flex-col">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-4 shrink-0">
        <h1 className="text-2xl font-bold text-white">Client Conversations</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Chat with contacts, review SMS history, and log email responses.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-zinc-500 font-medium flex-1">Loading chats...</div>
      ) : (
        /* Workspace layout split */
        <div className="flex flex-1 rounded-xl border border-zinc-800/80 bg-zinc-900/10 overflow-hidden backdrop-blur-md min-h-0">
          
          {/* Left Panel: Chats List */}
          <div className="w-80 border-r border-zinc-850 flex flex-col bg-zinc-900/30 overflow-y-auto shrink-0">
            <div className="divide-y divide-zinc-850/50">
              {conversations.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => handleSelectChat(chat.id)}
                  className={`w-full p-4 flex flex-col gap-1.5 text-left border-l-2 transition-all duration-150 ${
                    selectedChatId === chat.id
                      ? "bg-zinc-850/35 border-indigo-500 text-white"
                      : "border-transparent hover:bg-zinc-850/10 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="text-xs font-bold">{chat.clientName}</span>
                    <span className="text-[10px] text-zinc-500 font-mono">{chat.lastMessageTime}</span>
                  </div>
                  <div className="flex justify-between items-center w-full gap-2">
                    <p className="text-xs text-zinc-500 truncate flex-1">{chat.lastMessage}</p>
                    {chat.unreadCount > 0 && (
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0 inline-block"></span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right Panel: Chat Thread */}
          <div className="flex-1 flex flex-col bg-zinc-950/20 min-h-0">
            {activeChat ? (
              <>
                {/* Chat title bar */}
                <div className="px-6 py-4.5 border-b border-zinc-850/60 flex justify-between items-center shrink-0">
                  <div>
                    <h3 className="text-sm font-extrabold text-zinc-100">{activeChat.clientName}</h3>
                    <p className="text-[10px] text-zinc-550 font-medium">Policyholder • SMS Line active</p>
                  </div>
                </div>

                {/* Messages Feed */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {activeChat.messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.sender === "producer" ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`max-w-[70%] rounded-2xl p-4.5 space-y-1.5 text-xs shadow-sm ${
                        msg.sender === "producer"
                          ? "bg-indigo-600 text-white rounded-br-none"
                          : "bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-bl-none"
                      }`}>
                        <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                        <p className={`text-[9px] font-mono text-right ${
                          msg.sender === "producer" ? "text-indigo-200" : "text-zinc-550"
                        }`}>
                          {msg.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input box form */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-4 border-t border-zinc-850/60 bg-zinc-900/25 flex gap-3 items-center shrink-0"
                >
                  <input
                    type="text"
                    placeholder="Type your message here..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-xs text-zinc-200 placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <button
                    type="submit"
                    className="rounded-lg bg-indigo-600 hover:bg-indigo-500 border border-indigo-500 text-white px-5 py-2.5 text-xs font-semibold hover:-translate-y-0.5 transition-all duration-150 shadow-md shrink-0"
                  >
                    Send
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-zinc-500 italic">
                Select a conversation thread to begin messaging.
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
