import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Card
} from '../ui';
import {
  Plus,
  Trash2,
  ShieldAlert,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import type { SecurityQuestion, OwnershipVerification } from '@/types/forms';

interface SecurityQuestionsSectionProps {
  value: OwnershipVerification | undefined;
  onChange: (value: OwnershipVerification) => void;
  disabled?: boolean;
}

const SUGGESTED_QUESTIONS = [
  "What color is the item?",
  "What brand/manufacturer is it?",
  "What is a distinctive mark or serial number?",
  "Where did you originally purchase it?",
  "What is the item's specific model or version?",
  "What accessory came with the item?",
  "How much did you pay for it?",
  "When did you purchase it?",
  "What is unique about this item compared to similar ones?",
  "What is the item's condition?"
];

export const SecurityQuestionsSection: React.FC<SecurityQuestionsSectionProps> = ({
  value,
  onChange,
  disabled = false
}) => {
  const { t } = useTranslation();
  const [showNewQuestion, setShowNewQuestion] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [newIdentifier, setNewIdentifier] = useState('');
  const [showAnswers, setShowAnswers] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<Record<string, string>>({});

  const questions = value?.securityQuestions || [];
  const identifiers = value?.uniqueIdentifiers || [];

  const handleAddQuestion = () => {
    const newErrors: Record<string, string> = {};

    if (!newQuestion.trim()) {
      newErrors.question = 'Question is required';
    }
    if (!newAnswer.trim()) {
      newErrors.answer = 'Answer is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const updatedQuestions = [
      ...questions,
      {
        id: `q-${Date.now()}`,
        question: newQuestion.trim(),
        answer: newAnswer.trim().toLowerCase()
      }
    ];

    onChange({
      ...value,
      securityQuestions: updatedQuestions
    });

    setNewQuestion('');
    setNewAnswer('');
    setShowNewQuestion(false);
    setErrors({});
  };

  const handleRemoveQuestion = (id: string) => {
    const updatedQuestions = questions.filter(q => q.id !== id);
    onChange({
      ...value,
      securityQuestions: updatedQuestions
    });
  };

  const handleAddIdentifier = () => {
    if (!newIdentifier.trim()) {
      setErrors({ ...errors, identifier: 'Identifier is required' });
      return;
    }

    const updatedIdentifiers = [...identifiers, newIdentifier.trim()];
    onChange({
      ...value,
      uniqueIdentifiers: updatedIdentifiers
    });

    setNewIdentifier('');
    setErrors({ ...errors, identifier: '' });
  };

  const handleRemoveIdentifier = (index: number) => {
    const updatedIdentifiers = identifiers.filter((_, i) => i !== index);
    onChange({
      ...value,
      uniqueIdentifiers: updatedIdentifiers
    });
  };

  const toggleAnswerVisibility = (id: string) => {
    const newShowAnswers = new Set(showAnswers);
    if (newShowAnswers.has(id)) {
      newShowAnswers.delete(id);
    } else {
      newShowAnswers.add(id);
    }
    setShowAnswers(newShowAnswers);
  };

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl border-2 border-indigo-200">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 shrink-0">
          <ShieldAlert size={24} />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-black text-slate-900">
            {t('common.ownership_verification') || 'Ownership Verification'}
          </h3>
          <p className="text-sm text-slate-600 font-medium mt-1">
            {t('common.verify_ownership_hint') || 'Add security questions and unique identifiers to verify you own this item when potential matches occur.'}
          </p>
          <p className="text-xs text-indigo-700 font-bold mt-2 flex items-center gap-1">
            <Lock size={12} />
            {t('common.answers_private') || 'Your answers are private and never shared publicly'}
          </p>
        </div>
      </div>

      {/* Security Questions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-black text-slate-700 uppercase tracking-widest">
            {t('common.security_questions') || 'Security Questions'} ({questions.length})
          </p>
          <p className="text-xs text-slate-500 font-medium">
            Recommended: 2-3 questions
          </p>
        </div>

        <div className="space-y-3 mb-4">
          {questions.map((q) => (
            <Card
              key={q.id}
              className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 break-words">{q.question}</p>
                  <div className="mt-2 flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-600">
                        {showAnswers.has(q.id) ? q.answer : '••••••••'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleAnswerVisibility(q.id)}
                      className="p-1 hover:bg-slate-200 rounded-lg transition-colors"
                      title={showAnswers.has(q.id) ? 'Hide answer' : 'Show answer'}
                    >
                      {showAnswers.has(q.id) ? (
                        <EyeOff size={14} className="text-slate-500" />
                      ) : (
                        <Eye size={14} className="text-slate-500" />
                      )}
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveQuestion(q.id)}
                  disabled={disabled}
                  className="p-2 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 shrink-0"
                >
                  <Trash2 size={16} className="text-red-600" />
                </button>
              </div>
            </Card>
          ))}
        </div>

        {/* Add Question Form */}
        {showNewQuestion ? (
          <Card className="p-4 bg-white rounded-2xl border-2 border-indigo-300">
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">
                  Question
                </label>
                <select
                  value={newQuestion}
                  onChange={(e) => {
                    setNewQuestion(e.target.value);
                    setErrors({ ...errors, question: '' });
                  }}
                  className="w-full p-3 border-2 border-slate-200 rounded-xl font-medium text-slate-700 focus:border-indigo-400 focus:outline-none"
                >
                  <option value="">Select or type a question...</option>
                  {SUGGESTED_QUESTIONS.map((q, i) => (
                    <option key={i} value={q}>
                      {q}
                    </option>
                  ))}
                </select>
                {!newQuestion && (
                  <input
                    type="text"
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    placeholder="Or type your custom question..."
                    className="w-full p-3 border-2 border-slate-200 rounded-xl font-medium text-slate-700 focus:border-indigo-400 focus:outline-none mt-2"
                  />
                )}
                {errors.question && <p className="text-xs text-red-600 font-bold mt-1">{errors.question}</p>}
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">
                  Answer
                </label>
                <input
                  type="text"
                  value={newAnswer}
                  onChange={(e) => {
                    setNewAnswer(e.target.value);
                    setErrors({ ...errors, answer: '' });
                  }}
                  placeholder="Enter the answer..."
                  className="w-full p-3 border-2 border-slate-200 rounded-xl font-medium text-slate-700 focus:border-indigo-400 focus:outline-none"
                />
                {errors.answer && <p className="text-xs text-red-600 font-bold mt -1">{errors.answer}</p>}
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 px-3 py-2 rounded-xl border-2 border-slate-200 hover:bg-slate-50 text-slate-600 font-black text-sm"
                  onClick={() => {
                    setShowNewQuestion(false);
                    setNewQuestion('');
                    setNewAnswer('');
                    setErrors({});
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  className="flex-1 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm"
                  onClick={handleAddQuestion}
                >
                  Add Question
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <Button
            type="button"
            disabled={disabled || questions.length >= 5}
            className="w-full px-4 py-3 rounded-xl border-2 border-indigo-300 hover:bg-indigo-50 text-indigo-600 font-black flex items-center justify-center gap-2 disabled:opacity-50"
            onClick={() => setShowNewQuestion(true)}
          >
            <Plus size={18} />
            Add Security Question
          </Button>
        )}
      </div>

      {/* Unique Identifiers */}
      <div className="pt-4 border-t-2 border-indigo-100">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-black text-slate-700 uppercase tracking-widest">
            {t('common.unique_identifiers') || 'Unique Identifiers'} ({identifiers.length})
          </p>
          <p className="text-xs text-slate-500 font-medium">
            Optional: Serial number, brand, distinctive marks
          </p>
        </div>

        <div className="space-y-2 mb-4">
          {identifiers.map((identifier, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 hover:border-indigo-300 transition-all"
            >
              <p className="text-sm font-bold text-slate-800">{identifier}</p>
              <button
                type="button"
                onClick={() => handleRemoveIdentifier(idx)}
                disabled={disabled}
                className="p-2 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
              >
                <Trash2 size={16} className="text-red-600" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={newIdentifier}
            onChange={(e) => {
              setNewIdentifier(e.target.value);
              setErrors({ ...errors, identifier: '' });
            }}
            placeholder="E.g., Brand XYZ, Serial #12345, Blue case"
            disabled={disabled}
            className="flex-1 p-3 border-2 border-slate-200 rounded-xl font-medium text-slate-700 placeholder-slate-400 focus:border-indigo-400 focus:outline-none disabled:bg-slate-100"
          />
          <Button
            type="button"
            disabled={disabled || identifiers.length >= 5}
            className="px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black"
            onClick={handleAddIdentifier}
          >
            <Plus size={18} />
          </Button>
        </div>
        {errors.identifier && <p className="text-xs text-red-600 font-bold mt-2">{errors.identifier}</p>}
      </div>

      {/* Info Box */}
      <div className="p-4 bg-white rounded-2xl border border-indigo-200">
        <p className="text-xs text-slate-600 font-medium leading-relaxed">
          <strong className="text-slate-800">💡 Tips:</strong> Use specific details that only you would know. Answers are case-insensitive and trimmed of whitespace. You'll have up to 3 attempts to answer correctly if someone claims to have found your item.
        </p>
      </div>
    </div>
  );
};

export default SecurityQuestionsSection;
