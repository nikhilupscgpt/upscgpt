import React from 'react';
import Link from 'next/link';
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import PrelimsNodeWorkspace from '@/components/PrelimsNodeWorkspace';
import WorkspaceLayout from '@/components/WorkspaceLayout';
import NewsBriefsSidebar from '@/components/NewsBriefsSidebar';
import '../../prelims.css';
import { 
  ChevronRight, 
  BookOpen, 
  BrainCircuit, 
  History, 
  Newspaper,
  Target,
  Clock,
  ArrowRight,
  Sparkles,
  Info
} from 'lucide-react';

export default async function NodePreparePage(props) {
  const params = await props.params;
  const issueId = params?.issueId;
  
  if (typeof issueId !== 'string' || !issueId || issueId === 'undefined' || issueId === 'null') {
    return (
      <div className="mt-page">
        <div className="mt-container">
          <h2 style={{ color: 'white' }}>Invalid Topic ID</h2>
          <p style={{ color: '#64748b' }}>The requested syllabus node could not be identified.</p>
          <Link href="/prelims/prepare" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 700 }}>Return to Study Vault</Link>
        </div>
      </div>
    );
  }

  const session = await getServerSession(authOptions);

  const issue = await prisma.issue.findFirst({
    where: {
      AND: [
        { id: { equals: issueId } }
      ]
    },
    include: {
      
      articles: {
        where: { status: 'DONE' },
        orderBy: { publishedAt: 'desc' },
        take: 5
      },
      testPacks: {
        where: { type: 'PRACTICE' },
        include: {
          questions: true
        }
      },
      nodeContent: true,
      questions: true
    }
  });

  if (!issue) {
    return <div className="mt-page"><div className="mt-container">Node not found.</div></div>;
  }

  // Only show articles directly associated with this issue
  const articles = issue.articles || [];

  // Safe serialization
  const serializedIssue = JSON.parse(JSON.stringify(issue));
  const serializedArticles = JSON.parse(JSON.stringify(articles));

  return (
    <PrelimsNodeWorkspace 
      issue={serializedIssue} 
      articles={serializedArticles}
      sessionExists={!!session} 
    />
  );
}
