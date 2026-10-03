import React, { useState } from "react";
import {
  Lightbulb,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Plus,
  Send,
  Sparkles,
  Bot,
  CheckCircle2,
  Users,
  Compass,
  Loader2
} from "lucide-react";
import { CommunityIdea } from "../types";

interface TrafficPreventionForumProps {
  ideas: CommunityIdea[];
  onVote: (id: string, delta: number) => void;
  onAddComment: (ideaId: string, author: string, text: string) => void;
  onAddIdea: (newIdea: Partial<CommunityIdea>) => void;
}

export const TrafficPreventionForum: React.FC<TrafficPreventionForumProps> = ({
  ideas,
  onVote,
  onAddComment,
  onAddIdea,
}) => {
  const [activeIdeaId, setActiveIdeaId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [showNewIdeaModal, setShowNewIdeaModal] = useState(false);

  // New idea form
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");
  const [badge, setBadge] = useState("Urban Commuter");
  const [category, setCategory] = useState<any>("Infrastructure");

  // AI Consultant
  const [aiTopic, setAiTopic] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);

  const handleAskAIConsultant = async () => {
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/prevent-traffic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: aiTopic || "How to prevent chronic gridlocks on Seke Road and CBD Kombi Ranks?",
        }),
      });
      const data = await res.json();
      setAiAnalysis(data.analysis);
    } catch (err) {
      console.error(err);
      setAiAnalysis(
        "1. Solar Induction Traffic Signals: Transition CBD lights off the electrical grid to solar battery packs to avoid amber flash during power cuts.\n2. Ring Terminal Holding Bays: Keep long-distance commuter buses outside downtown with dedicated express shuttles.\n3. Peak Carpooling Incentives: Reward 3+ passenger vehicles with express lane priority."
      );
    } finally {
      setAiLoading(false);
    }
  };

  const handleCommentSubmit = (ideaId: string) => {
    if (!commentText.trim()) return;
    onAddComment(ideaId, "Harare Commuter", commentText);
    setCommentText("");
  };

  const handleCreateIdea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    onAddIdea({
      title,
      content,
      author: author || "Harare Citizen",
      badge: badge || "Commuter",
      category,
    });

    setTitle("");
    setContent("");
    setShowNewIdeaModal(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800 p-4 shadow-xl space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-400" />
            Harare Traffic Prevention & Solutions Hub
            <span className="text-[10px] bg-amber-500/20 text-amber-400 font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
              Community Think-Tank
            </span>
          </h3>
          <p className="text-xs text-slate-400">
            Citizen proposals, kombi decongestion strategies, and AI urban planning for Harare
          </p>
        </div>

        <button
          onClick={() => setShowNewIdeaModal(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition transform active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Post Traffic Prevention Idea</span>
        </button>
      </div>

      {/* AI Decongestion Consultant Bar */}
      <div className="bg-gradient-to-r from-amber-950/40 via-slate-950 to-indigo-950/40 border border-amber-500/30 rounded-xl p-3.5 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
              Gemini AI Traffic Decongestion Consultant
            </h4>
          </div>
          <span className="text-[10px] text-slate-400">Harare Urban Planning Model</span>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Ask AI: e.g. How to prevent traffic during peak rain on Bulawayo Road & Seke Flyover?"
            value={aiTopic}
            onChange={(e) => setAiTopic(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAskAIConsultant()}
            className="flex-1 px-3 py-2 bg-slate-950 border border-amber-500/40 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
          <button
            onClick={handleAskAIConsultant}
            disabled={aiLoading}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
          >
            {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bot className="w-3.5 h-3.5" />}
            <span>Analyze Solutions</span>
          </button>
        </div>

        {aiAnalysis && (
          <div className="bg-slate-900/90 border border-amber-500/30 rounded-lg p-3 text-xs text-slate-200 leading-relaxed max-h-60 overflow-y-auto space-y-1">
            <div className="font-bold text-amber-400 flex items-center gap-1 text-[11px] mb-1">
              <Sparkles className="w-3 h-3" /> AI Urban Transit Recommendations:
            </div>
            <div className="whitespace-pre-line text-slate-300 text-[11px]">{aiAnalysis}</div>
          </div>
        )}
      </div>

      {/* Ideas List */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {ideas.map((idea) => {
          const isExpanded = activeIdeaId === idea.id;

          return (
            <div
              key={idea.id}
              className="bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 rounded-xl p-4 transition shadow-sm space-y-3"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      {idea.category}
                    </span>
                    <span className="text-[11px] text-slate-500">{idea.postedAt}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white leading-snug">{idea.title}</h4>
                  <p className="text-xs text-slate-400">
                    Proposed by <strong className="text-slate-300">{idea.author}</strong> ({idea.badge})
                  </p>
                </div>

                {/* Vote Buttons */}
                <div className="flex items-center gap-1.5 bg-slate-900 px-2 py-1 rounded-xl border border-slate-800 shrink-0">
                  <button
                    onClick={() => onVote(idea.id, 1)}
                    className="p-1 text-slate-400 hover:text-emerald-400 transition cursor-pointer"
                    title="Upvote idea"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-bold text-emerald-400 px-1">
                    {idea.upvotes - (idea.downvotes || 0)}
                  </span>
                  <button
                    onClick={() => onVote(idea.id, -1)}
                    className="p-1 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                    title="Downvote"
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Proposal Content */}
              <p className="text-xs text-slate-300 leading-relaxed">{idea.content}</p>

              {/* Comments Section Toggle */}
              <div className="pt-2 border-t border-slate-800/80">
                <div className="flex items-center justify-between text-xs">
                  <button
                    onClick={() => setActiveIdeaId(isExpanded ? null : idea.id)}
                    className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{idea.comments.length} Community Comments</span>
                  </button>
                  <span className="text-[11px] text-slate-500">
                    {isExpanded ? "Click to collapse" : "Click to view & comment"}
                  </span>
                </div>

                {isExpanded && (
                  <div className="mt-3 space-y-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                    {/* Comments List */}
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {idea.comments.length === 0 ? (
                        <p className="text-[11px] text-slate-500 italic">
                          No comments yet. Start the conversation!
                        </p>
                      ) : (
                        idea.comments.map((c) => (
                          <div
                            key={c.id}
                            className="bg-slate-950/80 p-2 rounded-lg border border-slate-800 text-xs"
                          >
                            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                              <span className="font-bold text-slate-300">{c.author}</span>
                              <span>{c.time}</span>
                            </div>
                            <p className="text-slate-300 text-[11px]">{c.text}</p>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Add Comment Input */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        placeholder="Add your comment / feedback..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleCommentSubmit(idea.id)}
                        className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:border-amber-500"
                      />
                      <button
                        onClick={() => handleCommentSubmit(idea.id)}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition cursor-pointer"
                      >
                        <Send className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* New Idea Modal */}
      {showNewIdeaModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl p-5 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Share a Traffic Prevention Solution</h3>
                  <p className="text-xs text-slate-400">Propose how to decongest Harare roads & kombi hubs</p>
                </div>
              </div>
              <button
                onClick={() => setShowNewIdeaModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateIdea} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Proposal Headline</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Reverse one-way flow on Leopold Takawira during morning rush"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tendai M."
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-amber-500"
                  >
                    <option value="Infrastructure">Infrastructure (Robots / Roads)</option>
                    <option value="Commuter Transit">Commuter Transit & Kombi Ranks</option>
                    <option value="Traffic Management">Traffic Management & One-Ways</option>
                    <option value="Policy & Enforcement">Policy & Enforcement</option>
                    <option value="General">General Decongestion</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Your Title / Badge</label>
                <input
                  type="text"
                  placeholder="e.g. Daily Commuter, Civil Engineer, Kombi Conductor"
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  How does this prevent traffic? Detailed Solution
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Explain why current congestion occurs and the specific steps city planners, motorists, and kombis can take..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewIdeaModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg shadow cursor-pointer transition"
                >
                  Publish Proposal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
