"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { BookOpen } from "lucide-react";
import NotesSidebar from "./NotesSidebar";

export default function NotesTrigger({
  entityType,
  entityId,
  entityTitle,
  entitySubject,
  entityTopic,
  questions = [],
  initialTab = "notes",
  className = ""
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mounting, setMounting] = useState(false);

  useEffect(() => {
    setMounting(true);
  }, []);

  if (!mounting) return null;

  return (
    <>
      <button
        className={`study-workspace-trigger-btn ${className}`}
        onClick={() => setIsSidebarOpen(true)}
        title="Open Study Workspace"
      >
        <BookOpen size={16} />
        <span>Study Workspace</span>
      </button>

      <NotesSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        entityType={entityType}
        entityId={entityId}
        entityTitle={entityTitle}
        entitySubject={entitySubject}
        entityTopic={entityTopic}
        questions={questions}
        initialTab={initialTab}
      />

      <style jsx>{`
        .study-workspace-trigger-btn {
          position: fixed;
          bottom: 24px;
          right: 24px;
          display: flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          color: white;
          border: none;
          border-radius: 30px;
          padding: 12px 24px;
          font-family: inherit;
          font-weight: 800;
          font-size: 0.85rem;
          cursor: pointer;
          z-index: 1000;
          box-shadow: 0 10px 30px rgba(59, 130, 246, 0.3);
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .study-workspace-trigger-btn:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 12px 35px rgba(59, 130, 246, 0.45);
        }

        .study-workspace-trigger-btn:active {
          transform: translateY(0) scale(1);
        }

        @media (max-width: 640px) {
          .study-workspace-trigger-btn {
            bottom: 20px;
            right: 20px;
            padding: 10px 16px;
            font-size: 0.75rem;
          }
        }
      `}</style>
    </>
  );
}
