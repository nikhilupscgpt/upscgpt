'use client';

import React, { useState } from 'react';
import PyqPresenterClient from '../../pyq/present/PyqPresenterClient';
import BroadsheetPyqPresenter from '../../pyq/present/BroadsheetPyqPresenter';

export default function StudioPresentSwitcher({
  questions = [],
  initialRecordingSession = null,
  defaultView = 'broadsheet',
}) {
  const isPurePyqDeck =
    questions.length > 0 && questions.every((q) => !q.type || q.type === 'pyq');

  const [viewMode, setViewMode] = useState(
    isPurePyqDeck && defaultView !== 'slides' ? 'broadsheet' : 'slides'
  );

  if (viewMode === 'broadsheet' && isPurePyqDeck) {
    return (
      <BroadsheetPyqPresenter
        questions={questions}
        onSwitchToClassic={() => setViewMode('slides')}
      />
    );
  }

  return (
    <PyqPresenterClient
      questions={questions}
      initialRecordingSession={initialRecordingSession}
    />
  );
}
