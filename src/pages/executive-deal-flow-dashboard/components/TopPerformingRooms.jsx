import React from 'react';
import Icon from '../../../components/AppIcon';

const TopPerformingRooms = ({ rooms }) => {
  const getRankIcon = (rank) => {
    if (rank === 1) return { icon: 'Trophy', color: 'text-yellow-500' };
    if (rank === 2) return { icon: 'Award', color: 'text-gray-400' };
    if (rank === 3) return { icon: 'Medal', color: 'text-amber-600' };
    return { icon: 'Circle', color: 'text-muted-foreground' };
  };

  const getPerformanceColor = (score) => {
    if (score >= 90) return 'text-success';
    if (score >= 75) return 'text-warning';
    return 'text-error';
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Top Performing Rooms</h3>
          <p className="text-sm text-muted-foreground">Based on engagement & conversion</p>
        </div>
        <button className="text-sm text-primary hover:text-primary/80 transition-colors">
          View All →
        </button>
      </div>
      <div className="space-y-4">
        {rooms?.map((room, index) => {
          const rankInfo = getRankIcon(index + 1);
          return (
            <div key={room?.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-muted/30 transition-colors">
              <div className="flex items-center justify-center w-8 h-8">
                <Icon name={rankInfo?.icon} size={16} className={rankInfo?.color} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-foreground truncate">{room?.name}</h4>
                  <span className={`text-sm font-medium ${getPerformanceColor(room?.score)}`}>
                    {room?.score}%
                  </span>
                </div>
                <div className="flex items-center space-x-4 mt-1">
                  <span className="text-xs text-muted-foreground">{room?.dealValue}</span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">{room?.participants} participants</span>
                </div>
              </div>
              <div className="flex flex-col items-end space-y-1">
                <div className="flex items-center space-x-1">
                  <Icon name="Users" size={12} className="text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{room?.activeUsers}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Icon name="Clock" size={12} className="text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{room?.avgTime}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-6 pt-4 border-t border-border">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-foreground">94.2%</div>
            <div className="text-xs text-muted-foreground">Avg Success Rate</div>
          </div>
          <div>
            <div className="text-lg font-bold text-foreground">12.5d</div>
            <div className="text-xs text-muted-foreground">Avg Close Time</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopPerformingRooms;