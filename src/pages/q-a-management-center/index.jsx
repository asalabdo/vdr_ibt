import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

import Icon from '../../components/AppIcon';
import StatusCard from './components/StatusCard';
import QuestionCard from './components/QuestionCard';
import QuestionDetailPanel from './components/QuestionDetailPanel';

const QAManagementCenter = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  // Mock data for Q&A
  const [questions] = useState([
    {
      id: 1,
      question: 'What is the timeline for project completion?',
      askedBy: 'Q&A Observer Full',
      askedByRole: 'Observer',
      room: 'Project Alpha',
      priority: 'high',
      status: 'pending',
      createdAt: '2025-08-31T10:30:00Z',
      updatedAt: '2025-08-31T10:30:00Z',
      responses: [],
      attachments: []
    },
    {
      id: 2,
      question: 'Are there any regulatory requirements?',
      askedBy: 'Q&A Observer Full',
      askedByRole: 'Observer',
      room: 'Project Alpha',
      priority: 'medium',
      status: 'pending',
      createdAt: '2025-08-31T09:15:00Z',
      updatedAt: '2025-08-31T09:15:00Z',
      responses: [],
      attachments: []
    },
    {
      id: 3,
      question: 'When will the contract be finalized?',
      askedBy: 'Q&A Observer Full',
      askedByRole: 'Observer',
      room: 'Legal Documents',
      priority: 'high',
      status: 'pending',
      createdAt: '2025-08-31T08:45:00Z',
      updatedAt: '2025-08-31T08:45:00Z',
      responses: [],
      attachments: []
    },
    {
      id: 4,
      question: 'What are the financial projections for next quarter?',
      askedBy: 'Financial Analyst',
      askedByRole: 'Analyst',
      room: 'Financial Reports',
      priority: 'medium',
      status: 'answered',
      createdAt: '2025-08-30T16:20:00Z',
      updatedAt: '2025-08-31T11:00:00Z',
      responses: [
        {
          id: 1,
          answer: 'The financial projections show a 15% growth in revenue for Q1 2026.',
          respondedBy: 'CFO',
          respondedAt: '2025-08-31T11:00:00Z',
          status: 'approved'
        }
      ],
      attachments: []
    },
    {
      id: 5,
      question: 'Are there any pending compliance issues?',
      askedBy: 'Compliance Officer',
      askedByRole: 'Officer',
      room: 'Legal Documents',
      priority: 'low',
      status: 'approved',
      createdAt: '2025-08-30T14:30:00Z',
      updatedAt: '2025-08-31T09:30:00Z',
      responses: [
        {
          id: 1,
          answer: 'All compliance requirements are currently met. No pending issues identified.',
          respondedBy: 'Legal Advisor',
          respondedAt: '2025-08-30T15:45:00Z',
          status: 'approved'
        }
      ],
      attachments: []
    }
  ]);

  const filteredQuestions = questions?.filter(question => {
    const matchesSearch = question?.question?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
                         question?.room?.toLowerCase()?.includes(searchQuery?.toLowerCase());
    const matchesStatus = statusFilter === 'all' || question?.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || question?.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const stats = {
    pending: questions?.filter(q => q?.status === 'pending')?.length || 0,
    answered: questions?.filter(q => q?.status === 'answered')?.length || 0,
    approved: questions?.filter(q => q?.status === 'approved')?.length || 0,
    highPriority: questions?.filter(q => q?.priority === 'high')?.length || 0
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-4">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-3xl font-bold text-foreground mb-2">Q&A Management</h1>
              <p className="text-muted-foreground">
                Manage questions and answers across all data rooms
              </p>
            </div>
            
            <Button iconName="Plus" variant="default">
              Ask Question
            </Button>
          </div>

          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <StatusCard
              title="Pending"
              value={stats?.pending}
              icon="Clock"
              color="warning"
              description="Questions awaiting response"
            />
            <StatusCard
              title="Answered"
              value={stats?.answered}
              icon="MessageSquare"
              color="info"
              description="Questions with responses"
            />
            <StatusCard
              title="Approved"
              value={stats?.approved}
              icon="CheckCircle"
              color="success"
              description="Approved answers"
            />
            <StatusCard
              title="High Priority"
              value={stats?.highPriority}
              icon="AlertCircle"
              color="error"
              description="Urgent questions"
            />
          </div>

          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Icon name="Search" size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search questions and answers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e?.target?.value || '')}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2">
                <Icon name="Filter" size={16} className="text-muted-foreground" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e?.target?.value)}
                  className="border border-input rounded-lg px-3 py-2 bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="answered">Answered</option>
                  <option value="approved">Approved</option>
                </select>
                
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e?.target?.value)}
                  className="border border-input rounded-lg px-3 py-2 bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
                >
                  <option value="all">All Priority</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              
              <Button variant="outline" iconName="Download">
                Export Q&A
              </Button>
            </div>
          </div>

          {/* Q&A List */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Questions List */}
            <div className="lg:col-span-8 space-y-4">
              {filteredQuestions?.map((question) => (
                <QuestionCard
                  key={question?.id}
                  question={question}
                  onSelect={setSelectedQuestion}
                  isSelected={selectedQuestion?.id === question?.id}
                  formatTimeAgo={formatTimeAgo}
                />
              ))}
              
              {/* Empty State */}
              {filteredQuestions?.length === 0 && (
                <div className="text-center py-12 bg-card rounded-xl border border-border">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon name="MessageSquare" size={32} className="text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">No questions found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all' ?'Try adjusting your search criteria' :'No questions have been asked yet'
                    }
                  </p>
                  <Button iconName="Plus" variant="default">
                    Ask Question
                  </Button>
                </div>
              )}
            </div>

            {/* Question Detail Panel */}
            <div className="lg:col-span-4">
              <QuestionDetailPanel
                question={selectedQuestion}
                onClose={() => setSelectedQuestion(null)}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default QAManagementCenter;