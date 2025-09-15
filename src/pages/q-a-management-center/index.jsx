import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Header from '../../components/ui/Header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

import Icon from '../../components/AppIcon';
import StatusCard from './components/StatusCard';
import TalkQAPanel from './components/TalkQAPanel';
import CreateRoomModal from './components/CreateRoomModal';
import { useRooms } from '../../hooks/api';

const QAManagementCenter = () => {
  const { t } = useTranslation('q-a-management-center');
  const [selectedRoomToken, setSelectedRoomToken] = useState('');
  const [isCreateRoomModalOpen, setIsCreateRoomModalOpen] = useState(false);

  // Talk Q&A integration - get ALL rooms from API (not just Q&A tagged ones)
  const roomsQuery = useRooms();
  const rooms = roomsQuery.data?.rooms || [];

  // Simple stats from real room data
  const stats = {
    totalRooms: rooms.length,
    unreadMessages: rooms.reduce((total, room) => total + room.unreadMessages, 0),
    activeRooms: rooms.filter(room => room.unreadMessages > 0).length,
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-4">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {t('title', { defaultValue: 'Talk Message Center' })}
              </h1>
              <p className="text-muted-foreground">
                {t('subtitle', { defaultValue: 'Real-time messaging powered by Nextcloud Talk' })}
              </p>
            </div>
            
            {!selectedRoomToken && (
              <div className="flex items-center gap-3">
                <Button 
                  onClick={() => setIsCreateRoomModalOpen(true)}
                  className="gap-2"
                >
                  <Icon name="Plus" size={16} />
                  {t('actions.create_room', { defaultValue: 'Create Room' })}
                </Button>
              </div>
            )}
          </div>

          {/* Simple Stats Cards - Real API Data Only */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <StatusCard
              title={t('stats.talk_rooms.title', { defaultValue: 'Talk Rooms' })}
              value={stats.totalRooms}
              icon="MessageCircle"
              color="info"
              description={t('stats.talk_rooms.description', { defaultValue: 'Connected Talk rooms' })}
            />
            <StatusCard
              title={t('stats.active_rooms.title', { defaultValue: 'Active Rooms' })}
              value={stats.activeRooms}
              icon="Users"
              color="success"
              description={t('stats.active_rooms.description', { defaultValue: 'Rooms with new messages' })}
            />
            <StatusCard
              title={t('stats.unread_messages.title', { defaultValue: 'Unread Messages' })}
              value={stats.unreadMessages}
              icon="Bell"
              color="warning"
              description={t('stats.unread_messages.description', { defaultValue: 'Total unread messages' })}
            />
          </div>

          {/* Back Button - Appears between stats and room content when in a room */}
          {selectedRoomToken && (
            <div className="mb-6 flex justify-start rtl:justify-end">
              <Button variant="outline" onClick={() => setSelectedRoomToken('')} className="gap-2">
                <Icon name="ArrowLeft" size={16} className="rtl:rotate-180" />
                {t('page.back_to_rooms', { defaultValue: 'Back to Rooms' })}
              </Button>
            </div>
          )}

          {/* Main Q&A Interface */}
          <Card className="p-4">
            <TalkQAPanel
              selectedRoomToken={selectedRoomToken}
              onSelectRoom={setSelectedRoomToken}
            />
          </Card>
          
          {/* Create Room Modal */}
          <CreateRoomModal 
            isOpen={isCreateRoomModalOpen}
            onClose={() => setIsCreateRoomModalOpen(false)}
            t={t}
          />
        </div>
      </main>
    </div>
  );
};

export default QAManagementCenter;

