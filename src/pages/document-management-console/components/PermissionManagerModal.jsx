import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useShares, useCreateShare, useCreatePublicLink, useCreateGroupShare, useGroups } from '@/hooks/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/Checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { shareTypes } from '../../../api/endpoints';
import Icon from '../../../components/AppIcon';

const PermissionManagerModal = ({ isOpen, onClose, file }) => {
  const { t } = useTranslation('document-management-console');
  const [activeTab, setActiveTab] = useState('shares');
  const [emailShare, setEmailShare] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  
  // Fetch existing shares for the file
  const { 
    data: sharesData, 
    isLoading: isLoadingShares,
    error: sharesError 
  } = useShares({ path: file?.path }, { 
    enabled: isOpen && !!file?.path 
  });

  const shares = sharesData?.shares || [];

  // Create public link mutation
  const createPublicLinkMutation = useCreatePublicLink({
    onSuccess: (data) => {
      toast.success(t('permissions_modal.public_link_created', { defaultValue: 'Public link created successfully!' }));
    },
    onError: (error) => {
      toast.error(t('permissions_modal.public_link_error', { defaultValue: 'Failed to create public link' }), {
        description: error.message,
      });
    }
  });

  // Create email share mutation
  const createEmailShareMutation = useCreateShare({
    onSuccess: (data) => {
      toast.success(t('permissions_modal.email_share_created', { defaultValue: 'Email share created successfully!' }));
      setEmailShare('');
    },
    onError: (error) => {
      toast.error(t('permissions_modal.email_share_error', { defaultValue: 'Failed to create email share' }), {
        description: error.message,
      });
    }
  });
  
  // Fetch groups for group sharing
  const { data: groupsData, isLoading: isLoadingGroups } = useGroups({
    enabled: isOpen && activeTab === 'create'
  });
  const groups = groupsData?.groups || [];
  
  // Create group share mutation
  const createGroupShareMutation = useCreateGroupShare({
    onSuccess: (data) => {
      toast.success(t('permissions_modal.group_share_created', { defaultValue: 'Group share created successfully!' }));
      setSelectedGroup('');
    },
    onError: (error) => {
      toast.error(t('permissions_modal.group_share_error', { defaultValue: 'Failed to create group share' }), {
        description: error.message,
      });
    }
  });

  if (!isOpen || !file) return null;

  const handleCreatePublicLink = () => {
    createPublicLinkMutation.mutate({
      path: file.path,
      permissions: 1, // Read permission
      expireDate: null // No expiration
    });
  };

  const handleCreateEmailShare = () => {
    if (!emailShare.trim()) return;
    
    createEmailShareMutation.mutate({
      path: file.path,
      shareType: 0, // User share
      shareWith: emailShare.trim(),
      permissions: 1 // Read permission
    });
  };
  
  const handleCreateGroupShare = () => {
    if (!selectedGroup) return;
    
    createGroupShareMutation.mutate({
      path: file.path,
      shareType: shareTypes.GROUP, // Group share (shareType: 1)
      shareWith: selectedGroup,
      permissions: ['read', 'update', 'create', 'delete', 'share'] // Full permissions
    });
  };

  const getShareTypeName = (shareType) => {
    switch (shareType) {
      case 0: return 'User';
      case 1: return 'Group';
      case 3: return 'Public Link';
      case 4: return 'Email';
      default: return 'Unknown';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-card rounded-xl shadow-lg border border-border max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              {t('permissions_modal.title', { defaultValue: 'Share & Permissions' })}
            </h3>
            <p className="text-sm text-muted-foreground">{file?.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <Icon name="X" size={20} className="text-muted-foreground" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Tab Navigation */}
          <div className="flex border-b border-border px-6">
            <button
              onClick={() => setActiveTab('shares')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'shares' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('permissions_modal.existing_shares', { defaultValue: 'Current Shares' })}
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'create' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('permissions_modal.create_share', { defaultValue: 'Create Share' })}
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'shares' && (
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-foreground">
                  {t('permissions_modal.existing_shares', { defaultValue: 'Existing Shares' })}
                </h4>
                
                {isLoadingShares && (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Skeleton className="w-8 h-8 rounded" />
                          <div className="space-y-1">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                        </div>
                        <Skeleton className="h-6 w-16" />
                      </div>
                    ))}
                  </div>
                )}

                {sharesError && (
                  <Alert variant="destructive">
                    <Icon name="AlertCircle" size={16} />
                    <AlertDescription>
                      {t('permissions_modal.error_loading_shares', { defaultValue: 'Failed to load shares' })}: {sharesError.message}
                    </AlertDescription>
                  </Alert>
                )}

                {!isLoadingShares && !sharesError && shares.length > 0 && (
                  <div className="space-y-3">
                    {shares.map((share) => (
                      <div key={share.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Icon name="Share" size={20} className="text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{share.share_with || 'Public Link'}</p>
                            <p className="text-xs text-muted-foreground">
                              {getShareTypeName(share.share_type)} • Created {new Date(share.stime * 1000).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline">{share.permissions}</Badge>
                      </div>
                    ))}
                  </div>
                )}

                {!isLoadingShares && !sharesError && shares.length === 0 && (
                  <div className="text-center py-8">
                    <Icon name="Share" size={32} className="mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {t('permissions_modal.no_shares', { defaultValue: 'This file is not shared yet' })}
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'create' && (
              <div className="space-y-6">
                {/* Public Link */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Icon name="Link" size={16} />
                      {t('permissions_modal.public_link_title', { defaultValue: 'Public Link' })}
                    </CardTitle>
                    <CardDescription>
                      {t('permissions_modal.public_link_description', { defaultValue: 'Create a public link that anyone with the URL can access' })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      onClick={handleCreatePublicLink}
                      disabled={createPublicLinkMutation.isPending}
                      className="gap-2"
                      variant="outline"
                    >
                      {createPublicLinkMutation.isPending ? (
                        <Icon name="Loader2" size={14} className="animate-spin" />
                      ) : (
                        <Icon name="Link" size={14} />
                      )}
                      {createPublicLinkMutation.isPending 
                        ? t('permissions_modal.creating_link', { defaultValue: 'Creating...' })
                        : t('permissions_modal.create_public_link', { defaultValue: 'Create Public Link' })
                      }
                    </Button>
                  </CardContent>
                </Card>

                {/* Email Share */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Icon name="Mail" size={16} />
                      {t('permissions_modal.email_share_title', { defaultValue: 'Share with User' })}
                    </CardTitle>
                    <CardDescription>
                      {t('permissions_modal.email_share_description', { defaultValue: 'Share with a specific user by email or username' })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        type="email"
                        placeholder={t('permissions_modal.email_placeholder', { defaultValue: 'Enter email or username' })}
                        value={emailShare}
                        onChange={(e) => setEmailShare(e.target.value)}
                        disabled={createEmailShareMutation.isPending}
                      />
                      <Button 
                        onClick={handleCreateEmailShare}
                        disabled={createEmailShareMutation.isPending || !emailShare.trim()}
                        className="gap-2"
                      >
                        {createEmailShareMutation.isPending ? (
                          <Icon name="Loader2" size={14} className="animate-spin" />
                        ) : (
                          <Icon name="Mail" size={14} />
                        )}
                        {t('permissions_modal.share', { defaultValue: 'Share' })}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Group Share */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Icon name="Users" size={16} />
                      {t('permissions_modal.group_share_title', { defaultValue: 'Share with Group' })}
                    </CardTitle>
                    <CardDescription>
                      {t('permissions_modal.group_share_description', { defaultValue: 'Share with an entire group of users' })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex gap-2">
                      <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder={t('permissions_modal.select_group', { defaultValue: 'Select a group...' })} />
                        </SelectTrigger>
                        <SelectContent>
                          {groups.map(group => (
                            <SelectItem key={group.id} value={group.id}>
                              <div className="flex items-center justify-between w-full">
                                <span>{group.displayName}</span>
                                <Badge variant="outline" className="ml-2 text-xs">
                                  {group.memberCount || 0} members
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button 
                        onClick={handleCreateGroupShare}
                        disabled={!selectedGroup || createGroupShareMutation.isPending}
                        className="gap-2"
                        variant="outline"
                      >
                        {createGroupShareMutation.isPending ? (
                          <Icon name="Loader2" size={14} className="animate-spin" />
                        ) : (
                          <Icon name="Users" size={14} />
                        )}
                        {createGroupShareMutation.isPending 
                          ? t('permissions_modal.sharing', { defaultValue: 'Sharing...' })
                          : t('permissions_modal.share_with_group', { defaultValue: 'Share' })
                        }
                      </Button>
                    </div>
                    
                    {groups.length === 0 && (
                      <div className="text-sm text-muted-foreground">
                        {t('permissions_modal.no_groups_available', { defaultValue: 'No groups available for sharing.' })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 rtl:space-x-reverse p-6 border-t border-border">
          <Button onClick={onClose} variant="outline">
            {t('actions.close', { defaultValue: 'Close' })}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PermissionManagerModal;
