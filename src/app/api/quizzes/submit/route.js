import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { testPackId, answers, timeTakenSecs } = body;

    if (!testPackId || !answers) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const testPack = await prisma.testPack.findUnique({
      where: { id: testPackId },
      include: { questions: true }
    });

    if (!testPack) {
      return NextResponse.json({ error: 'Test pack not found' }, { status: 404 });
    }

    // Calculate Score
    let correctCount = 0;
    let incorrectCount = 0;
    const breakdown = testPack.questions.map(q => {
      const userAnswer = answers.find(a => a.questionId === q.id)?.selectedLabel;
      const isCorrect = userAnswer === q.correctLabel;
      
      if (userAnswer) {
        if (isCorrect) correctCount++;
        else incorrectCount++;
      }

      return {
        questionId: q.id,
        selected: userAnswer,
        correct: isCorrect,
        correctLabel: q.correctLabel,
        explanation: q.explanation
      };
    });

    const marksObtained = (correctCount * testPack.marksPerQuestion) - (incorrectCount * testPack.negativeMarking);
    const maxPossibleMarks = testPack.questions.length * testPack.marksPerQuestion;
    const percentage = Math.round((marksObtained / maxPossibleMarks) * 100);
    
    // We'll store absolute marks in the score field for MOCK tests, 
    // or keep percentage if that's the convention. 
    // For UPSC, marks out of 200 is common. Let's store marksObtained.
    const finalScore = Math.max(0, Math.round(marksObtained)); 
    const passed = percentage >= testPack.passingScore;

    // Save Attempt
    const attempt = await prisma.quizAttempt.create({
      data: {
        userId: session.user.id,
        testPackId,
        score: finalScore,
        timeTakenSecs,
        breakdown
      }
    });

    // If it's a PRACTICE test linked to an Issue, update IssueProgress
    if (testPack.type === 'PRACTICE' && testPack.issueId) {
      await prisma.issueProgress.upsert({
        where: {
          userId_issueId: {
            userId: session.user.id,
            issueId: testPack.issueId
          }
        },
        update: {
          solvedMCQs: true,
          status: passed ? 'MASTERED' : undefined
        },
        create: {
          userId: session.user.id,
          issueId: testPack.issueId,
          solvedMCQs: true,
          status: passed ? 'MASTERED' : 'READING'
        }
      });
    }

    return NextResponse.json({
      success: true,
      score: finalScore,
      maxMarks: maxPossibleMarks,
      percentage,
      passed,
      attemptId: attempt.id,
      breakdown
    });
  } catch (error) {
    console.error(`[Quiz Submit API] Error:`, error);
    return NextResponse.json({ error: 'Failed to submit quiz' }, { status: 500 });
  }
}
