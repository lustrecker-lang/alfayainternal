'use client';

import React, { useState } from 'react';
import { FileText, Users, Calendar, GraduationCap } from 'lucide-react';

interface SeminarTabsProps {
    children: React.ReactNode[];
    defaultTab?: number;
}

const tabs = [
    { id: 'general', label: 'General Info', icon: FileText },
    { id: 'participants', label: 'Participants', icon: Users },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'academia', label: 'Academia', icon: GraduationCap },
];

export default function SeminarTabs({ children, defaultTab = 0 }: SeminarTabsProps) {
    const [activeTab, setActiveTab] = useState(defaultTab);

    return (
        <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200 dark:border-gray-700">
                <div className="flex space-x-8">
                    {tabs.map((tab, index) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === index;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(index)}
                                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                                    ${isActive
                                        ? 'border-imeda text-imeda'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Tab Content */}
            <div className="animate-in fade-in duration-200">
                {children[activeTab]}
            </div>
        </div>
    );
}
