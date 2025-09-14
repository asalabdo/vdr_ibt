import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Header from '../../components/ui/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/Input';

import Icon from '../../components/AppIcon';
import StatusCard from './components/StatusCard';
import QuestionCard from './components/QuestionCard';
import QuestionDetailPanel from './components/QuestionDetailPanel';

const QAManagementCenter = () => {
  const { t } = useTranslation('q-a-management-center');
  const { t: tCommon } = useTranslation('common');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  // Mock data for Q&A using translation keys
  const [questionsData] = useState([
    {
      id: 1,
      questionKey: 'mock_data.questions.1',
      askedByKey: 'mock_data.users.qa_observer',
      askedByRole: 'Observer',
      roomKey: 'mock_data.rooms.project_alpha',
      priority: 'high',
      status: 'pending',
      createdAt: '2025-08-31T10:30:00Z',
      updatedAt: '2025-08-31T10:30:00Z',
      responses: [],
      attachments: []
    },
    {
      id: 2,
      questionKey: 'mock_data.questions.2',
      askedByKey: 'mock_data.users.qa_observer',
      askedByRole: 'Observer',
      roomKey: 'mock_data.rooms.project_alpha',
      priority: 'medium',
      status: 'pending',
      createdAt: '2025-08-31T09:15:00Z',
      updatedAt: '2025-08-31T09:15:00Z',
      responses: [],
      attachments: []
    },
    {
      id: 3,
      questionKey: 'mock_data.questions.3',
      askedByKey: 'mock_data.users.qa_observer',
      askedByRole: 'Observer',
      roomKey: 'mock_data.rooms.legal_documents',
      priority: 'high',
      status: 'pending',
      createdAt: '2025-08-31T08:45:00Z',
      updatedAt: '2025-08-31T08:45:00Z',
      responses: [],
      attachments: []
    },
    {
      id: 4,
      questionKey: 'mock_data.questions.4',
      askedByKey: 'mock_data.users.financial_analyst',
      askedByRole: 'Analyst',
      roomKey: 'mock_data.rooms.financial_reports',
      priority: 'medium',
      status: 'answered',
      createdAt: '2025-08-30T16:20:00Z',
      updatedAt: '2025-08-31T11:00:00Z',
      responses: [
        {
          id: 1,
          answerKey: 'mock_data.answers.1',
          respondedByKey: 'mock_data.users.cfo',
          respondedAt: '2025-08-31T11:00:00Z',
          status: 'approved'
        }
      ],
      attachments: []
    },
    {
      id: 5,
      questionKey: 'mock_data.questions.5',
      askedByKey: 'mock_data.users.compliance_officer',
      askedByRole: 'Officer',
      roomKey: 'mock_data.rooms.legal_documents',
      priority: 'low',
      status: 'approved',
      createdAt: '2025-08-30T14:30:00Z',
      updatedAt: '2025-08-31T09:30:00Z',
      responses: [
        {
          id: 1,
          answerKey: 'mock_data.answers.2',
          respondedByKey: 'mock_data.users.legal_advisor',
          respondedAt: '2025-08-30T15:45:00Z',
          status: 'approved'
        }
      ],
      attachments: []
    }
  ]);

  // Transform keys to actual translated text
  const questions = questionsData.map(questionData => ({
    ...questionData,
    question: t(questionData.questionKey),
    askedBy: t(questionData.askedByKey),
    room: t(questionData.roomKey),
    responses: questionData.responses?.map(response => ({
      ...response,
      answer: t(response.answerKey),
      respondedBy: t(response.respondedByKey)
    })) || []
  }));

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

    if (diff < 60) return t('time.just_now');
    if (diff < 3600) return t('time.minutes_ago', { count: Math.floor(diff / 60) });
    if (diff < 86400) return t('time.hours_ago', { count: Math.floor(diff / 3600) });
    return t('time.days_ago', { count: Math.floor(diff / 86400) });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-4">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {t('title')}
              </h1>
              <p className="text-muted-foreground">
                {t('subtitle')}
              </p>
            </div>
            
            <Button iconName="Plus" variant="default">
              {t('actions.ask_question')}
            </Button>
          </div>

          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <StatusCard
              title={t('status_cards.pending.title')}
              value={stats?.pending}
              icon="Clock"
              color="warning"
              description={t('status_cards.pending.description')}
            />
            <StatusCard
              title={t('status_cards.answered.title')}
              value={stats?.answered}
              icon="MessageSquare"
              color="info"
              description={t('status_cards.answered.description')}
            />
            <StatusCard
              title={t('status_cards.approved.title')}
              value={stats?.approved}
              icon="CheckCircle"
              color="success"
              description={t('status_cards.approved.description')}
            />
            <StatusCard
              title={t('status_cards.high_priority.title')}
              value={stats?.highPriority}
              icon="AlertCircle"
              color="error"
              description={t('status_cards.high_priority.description')}
            />
          </div>

          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Icon name="Search" size={20} className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t('search.placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e?.target?.value || '')}
                className="pl-10 rtl:pr-10 rtl:pl-3"
              />
            </div>
            
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Icon name="Filter" size={16} className="text-muted-foreground" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e?.target?.value)}
                  className="border border-input rounded-lg px-3 py-2 bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
                >
                  <option value="all">{t('filters.status.all')}</option>
                  <option value="pending">{t('filters.status.pending')}</option>
                  <option value="answered">{t('filters.status.answered')}</option>
                  <option value="approved">{t('filters.status.approved')}</option>
                </select>
                
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e?.target?.value)}
                  className="border border-input rounded-lg px-3 py-2 bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
                >
                  <option value="all">{t('filters.priority.all')}</option>
                  <option value="high">{t('filters.priority.high')}</option>
                  <option value="medium">{t('filters.priority.medium')}</option>
                  <option value="low">{t('filters.priority.low')}</option>
                </select>
              </div>
              
              <Button variant="outline" iconName="Download">
                {t('actions.export_qa')}
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
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    {t('empty_states.no_questions.title')}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all' 
                      ? t('empty_states.no_questions.description')
                      : t('empty_states.no_questions.empty_description')
                    }
                  </p>
                  <Button iconName="Plus" variant="default">
                    {t('empty_states.no_questions.action')}
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
