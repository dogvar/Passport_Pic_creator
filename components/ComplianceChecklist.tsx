import React from 'react';

interface ChecklistItemProps {
  children: React.ReactNode;
}

const CheckListItem: React.FC<ChecklistItemProps> = ({ children }) => (
  <li className="flex items-start">
    <svg className="h-6 w-6 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
    <span className="text-gray-300">{children}</span>
  </li>
);

interface ComplianceChecklistProps {
    title: string;
    items: string[];
}

const ComplianceChecklist: React.FC<ComplianceChecklistProps> = ({ title, items }) => {
  return (
    <div className="w-full mb-6 p-4 bg-gray-700/50 border border-gray-600 rounded-lg">
      <h4 className="text-lg font-semibold text-white mb-2">{title}</h4>
      <ul className="space-y-2 text-sm">
        {items.map((item, index) => (
            <CheckListItem key={index}>{item}</CheckListItem>
        ))}
      </ul>
    </div>
  );
};

export default ComplianceChecklist;
