import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDataRoomDetails } from '@/hooks/api';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/AppIcon';

/**
 * Data Room Details Modal Component
 * Shows comprehensive data room information fetched on-demand
 */
const DataRoomDetailsModal = ({ isOpen, onClose, roomId }) => {
  const { t } = useTranslation('data-rooms-management');
  
  // Fetch data room details only when modal is open and roomId is provided
  const { 
    data: room, 
    isLoading, 
    error, 
    refetch 
  } = useDataRoomDetails(roomId, { 
    enabled: isOpen && !!roomId 
  });


  // Helper function to calculate storage usage percentage
  const getStorageUsagePercentage = () => {
    if (!room?.storageQuota || room.storageQuota === -3 || room.storageQuota <= 0) return 0;
    if (!room?.currentSize) return 0;
    return Math.min(Math.round((room.currentSize / room.storageQuota) * 100), 100);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg rtl:[&>button]:left-4 rtl:[&>button]:right-auto rtl:[&>button]:top-4">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Icon name="FolderOpen" size={16} />
              <div>
                <DialogTitle className="rtl:text-right">
                  {room ? room.roomName : t('details_modal.loading_title')}
                </DialogTitle>
                {room && (
                  <DialogDescription className="rtl:text-right mt-0">
                    @{room.mountPoint} • {room.formattedSize}
                  </DialogDescription>
                )}
              </div>
            </div>
            {room && (
              <div className="flex gap-1 mt-5">
                <Badge 
                  variant={room.aclEnabled ? "default" : "secondary"}
                  className="text-xs"
                >
                  <Icon 
                    name={room.aclEnabled ? "Shield" : "ShieldOff"} 
                    size={10} 
                    className="mr-1 rtl:ml-1 rtl:mr-0" 
                  />
                  {room.aclEnabled ? t('details_modal.acl_enabled') : t('details_modal.acl_disabled')}
                </Badge>
                {room.hasManagers && (
                  <Badge variant="outline" className="text-xs border-amber-200 text-amber-700">
                    <Icon name="Crown" size={10} className="mr-1 rtl:ml-1 rtl:mr-0" />
                    {t('details_modal.has_managers')}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-3">
            {/* Loading State */}
            {isLoading && (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded" />
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="space-y-1">
                      <Skeleton className="h-2 w-12" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <Alert variant="destructive">
                <Icon name="AlertCircle" size={16} />
                <AlertDescription className="flex items-center justify-between">
                  <span>{t('details_modal.error_loading')}: {error.message}</span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => refetch()}
                    className="ml-2 rtl:mr-2 rtl:ml-0 gap-1 rtl:flex-row-reverse"
                  >
                    <Icon name="RefreshCw" size={12} />
                    {t('details_modal.retry')}
                  </Button>
                </AlertDescription>
              </Alert>
            )}

             {/* Data Room Details Content */}
             {room && (
               <>
                 {/* Storage Information */}
                <Card className="rtl:text-right">
                  <CardHeader className="pb-1">
                    <CardTitle className="text-sm flex items-center gap-2 rtl:flex-row-reverse rtl:text-right">
                      <Icon name="HardDrive" size={14} />
                      {t('details_modal.storage_info')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-2 space-y-2">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <p className="text-muted-foreground mb-0.5">{t('details_modal.current_size')}</p>
                        <p className="font-medium">{room.formattedSize}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-0.5">{t('details_modal.storage_quota')}</p>
                        <p className="font-medium">{room.formattedQuota}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-0.5">{t('details_modal.room_id')}</p>
                        <p className="font-mono">{room.roomId}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-0.5">{t('details_modal.groups_count')}</p>
                        <p className="font-medium">{room.groupsCount || 0}</p>
                      </div>
                    </div>
                    
                    {!room.isUnlimitedQuota && room.storageQuota > 0 && (
                      <div className="pt-2 border-t space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">{t('details_modal.storage_usage')}</span>
                          <span className="font-medium">{getStorageUsagePercentage()}%</span>
                        </div>
                        <Progress value={getStorageUsagePercentage()} className="h-1" />
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Access Control */}
                {(room.hasGroups || room.hasManagers) && (
                  <Card className="rtl:text-right">
                    <CardHeader className="pb-1">
                      <CardTitle className="text-sm flex items-center gap-2 rtl:flex-row-reverse rtl:text-right">
                        <Icon name="Users" size={14} />
                        {t('details_modal.groups_permissions')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-2 space-y-2">
                      {room.hasGroups && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">{t('details_modal.assigned_groups')}</p>
                          <div className="flex flex-wrap gap-1">
                            {room.groupsList && room.groupsList.length > 0 ? (
                              room.groupsList.map((group) => (
                                <Badge key={group} variant="outline" className="text-xs h-5 px-2">
                                  {group}
                                </Badge>
                              ))
                            ) : (
                              <p className="text-xs text-muted-foreground">
                                {t('details_modal.no_groups')}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {room.hasManagers && (
                        <div className={room.hasGroups ? "pt-1 border-t" : ""}>
                          <p className="text-xs text-muted-foreground mb-1">{t('details_modal.managers')}</p>
                          <div className="flex flex-wrap gap-1">
                            {room.managers.map((manager) => (
                              <Badge key={manager.id || manager.displayname} variant="outline" className="text-xs h-5 px-2 border-amber-200 text-amber-700">
                                <Icon name="Crown" size={8} className="mr-1 rtl:ml-1 rtl:mr-0" />
                                {manager.displayname || manager.id || manager}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="pt-1 rtl:flex-row-reverse rtl:justify-end">
          <Button variant="outline" onClick={onClose} size="sm" className="w-full">
            {t('details_modal.close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DataRoomDetailsModal;
