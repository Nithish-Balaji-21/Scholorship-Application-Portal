import React from 'react';
import { Edit3, Target, Award, Heart } from 'lucide-react';

// Essays & Statement of Purpose Step Component
export const EssaysStep = ({ data, onChange }) => {
  const getWordCount = (text) => {
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  };

  const essays = [
    {
      key: 'statementOfPurpose',
      title: 'Statement of Purpose',
      icon: Target,
      prompt: 'Describe your academic and career goals. Explain how this scholarship will help you achieve them.',
      maxWords: 500,
      required: true
    },
    {
      key: 'whyDeserveScholarship',
      title: 'Why You Deserve This Scholarship',
      icon: Award,
      prompt: 'Explain why you should be selected for this scholarship. Highlight your achievements, skills, and unique qualities.',
      maxWords: 400,
      required: true
    },
    {
      key: 'careerGoals',
      title: 'Career Goals and Aspirations',
      icon: Target,
      prompt: 'Describe your long-term career goals and how you plan to contribute to society in your chosen field.',
      maxWords: 400,
      required: true
    },
    {
      key: 'challenges',
      title: 'Overcoming Challenges',
      icon: Heart,
      prompt: 'Describe any significant challenges or obstacles you have faced in your educational journey and how you overcame them.',
      maxWords: 300,
      required: false
    }
  ];

  const renderEssayField = (essay) => {
    const wordCount = getWordCount(data[essay.key] || '');
    const isOverLimit = wordCount > essay.maxWords;
    const Icon = essay.icon;

    return (
      <div key={essay.key} className="border border-gray-200 rounded-lg p-6">
        <div className="flex items-start mb-4">
          <Icon className="h-6 w-6 text-blue-600 mr-3 mt-1 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              {essay.title}
              {essay.required && <span className="text-red-500 ml-2">*</span>}
            </h3>
            <p className="text-sm text-gray-600 mt-1 mb-4">{essay.prompt}</p>
            
            <div className="mb-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">
                  Word limit: {essay.maxWords} words
                </span>
                <span className={`font-medium ${
                  isOverLimit ? 'text-red-600' : 
                  wordCount > essay.maxWords * 0.9 ? 'text-orange-600' : 'text-green-600'
                }`}>
                  {wordCount}/{essay.maxWords} words
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    isOverLimit ? 'bg-red-500' :
                    wordCount > essay.maxWords * 0.9 ? 'bg-orange-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min((wordCount / essay.maxWords) * 100, 100)}%` }}
                />
              </div>
            </div>

            <textarea
              value={data[essay.key] || ''}
              onChange={(e) => onChange(essay.key, e.target.value)}
              placeholder={`Start writing your ${essay.title.toLowerCase()}...`}
              className={`w-full p-4 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-48 ${
                isOverLimit ? 'border-red-300' : 'border-gray-300'
              }`}
              rows={8}
            />
            
            {isOverLimit && (
              <p className="text-sm text-red-600 mt-2">
                ⚠️ You have exceeded the word limit. Please reduce your essay to {essay.maxWords} words or less.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 flex items-center">
        <Edit3 className="h-6 w-6 mr-2 text-blue-600" />
        Essays & Statement of Purpose
      </h2>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <Edit3 className="h-5 w-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
          <div className="text-sm text-amber-800">
            <h4 className="font-medium mb-1">Writing Guidelines:</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Be authentic and write in your own voice</li>
              <li>Use specific examples and experiences</li>
              <li>Stay within the word limits for each essay</li>
              <li>Proofread your essays for grammar and spelling</li>
              <li>Be honest about your goals and motivations</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {essays.map(renderEssayField)}
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Award className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <h4 className="font-medium mb-1">Pro Tips for Strong Essays:</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Start with a compelling opening that grabs attention</li>
              <li>Show, don't just tell - use concrete examples</li>
              <li>Demonstrate your passion and commitment</li>
              <li>Explain how the scholarship aligns with your goals</li>
              <li>End with a strong conclusion that reinforces your main points</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};