import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { 
  useUsers, 
  useDeleteUser, 
  useEnableUser, 
  useDisableUser 
} from '@/hooks/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import Icon from '@/components/AppIcon';

/**
 * Users Table Component
 * Displays and manages the list of users
 */
const UsersTable = () => {
  const { t } = useTranslation('users-management');
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, userId: null });
  
  // Fetch users
  const { 
    data: usersData, 
    isLoading, 
    error, 
    refetch 
  } = useUsers({ 
    search: searchTerm || undefined 
  });

  
  // Mutations
  const deleteUserMutation = useDeleteUser({
    onSuccess: (data, userId) => {
      setDeleteDialog({ open: false, userId: null });
      
      // Show success toast
      toast.success('User deleted successfully!', {
        description: `User "${userId}" has been permanently removed from the system.`,
      });
    },
    onError: (error) => {
      console.error('❌ Failed to delete user:', error.message);
      
      // Show error toast
      toast.error('Failed to delete user', {
        description: error.message,
      });
    }
  });
  
  const enableUserMutation = useEnableUser({
    onSuccess: (data, userId) => {
      // Show success toast
      toast.success('User enabled successfully!', {
        description: `User "${userId}" has been enabled and can now access the system.`,
      });
    },
    onError: (error) => {
      console.error('❌ Failed to enable user:', error.message);
      
      // Show error toast
      toast.error('Failed to enable user', {
        description: error.message,
      });
    }
  });
  
  const disableUserMutation = useDisableUser({
    onSuccess: (data, userId) => {
      // Show success toast
      toast.success('User disabled successfully!', {
        description: `User "${userId}" has been disabled and cannot access the system.`,
      });
    },
    onError: (error) => {
      console.error('❌ Failed to disable user:', error.message);
      
      // Show error toast
      toast.error('Failed to disable user', {
        description: error.message,
      });
    }
  });
  
  const handleDeleteUser = (userId) => {
    setDeleteDialog({ open: true, userId });
  };
  
  const confirmDeleteUser = () => {
    if (deleteDialog.userId) {
      deleteUserMutation.mutate(deleteDialog.userId);
    }
  };
  
  const handleToggleUserStatus = (userId, isEnabled) => {
    if (isEnabled) {
      disableUserMutation.mutate(userId);
    } else {
      enableUserMutation.mutate(userId);
    }
  };
  
  // Helper function to get user initials for avatar
  const getUserInitials = (user) => {
    const name = user.displayname || user.username;
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-6 w-16" />
          </div>
          <Skeleton className="h-10 w-full" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Alert variant="destructive">
        <Icon name="AlertCircle" size={16} />
        <AlertDescription className="flex items-center justify-between">
          <span>{t('table.error_loading')}: {error.message}</span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetch()}
            className="ml-4 gap-1"
          >
            <Icon name="RefreshCw" size={14} />
            {t('table.retry')}
          </Button>
        </AlertDescription>
      </Alert>
    );
  }
  
  const users = usersData?.users || [];
  
  return (
    <TooltipProvider>
      <Card>
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Icon name="Users" size={20} />
              {t('table.title')}
            </CardTitle>
            <Badge variant="secondary" className="px-3 py-1">
              {t(users.length === 1 ? 'table.users_count' : 'table.users_count_plural', { count: users.length })}
            </Badge>
          </div>
          
          <Separator />
          
          {/* Search and Actions */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Icon 
                name="Search" 
                size={16} 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" 
              />
              <Input
                placeholder={t('table.search_placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => refetch()}
                  disabled={isLoading}
                >
                  <Icon name="RefreshCw" size={16} className={isLoading ? "animate-spin" : ""} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('table.refresh_tooltip')}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </CardHeader>
      
        <CardContent>
          {users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted/20 p-4 mb-4">
                <Icon name="Users" size={32} className="text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{t('table.no_users_title')}</h3>
              <p className="text-muted-foreground text-sm max-w-sm">
                {searchTerm ? t('table.no_search_results') : t('table.no_users_description')}
              </p>
              {searchTerm && (
                <Button 
                  variant="outline" 
                  onClick={() => setSearchTerm('')}
                  className="mt-4 gap-2"
                >
                  <Icon name="X" size={14} />
                  {t('table.clear_search')}
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('table.user')}</TableHead>
                    <TableHead>{t('table.contact')}</TableHead>
                    <TableHead>{t('table.groups')}</TableHead>
                    <TableHead>{t('table.status')}</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} className="group">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-primary/10 text-primary font-medium">
                              {getUserInitials(user)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm">{user.displayname}</p>
                            <p className="text-muted-foreground text-xs">@{user.username}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="text-sm">{user.email || '-'}</p>
                          {user.isAdmin && (
                            <Badge variant="outline" className="text-xs">
                              <Icon name="Shield" size={10} className="mr-1" />
                              Admin
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-48">
                          {user.groups.length > 0 ? (
                            user.groups.slice(0, 2).map((group) => (
                              <Badge key={group} variant="outline" className="text-xs">
                                {group}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                          {user.groups.length > 2 && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge variant="outline" className="text-xs cursor-pointer">
                                  +{user.groups.length - 2}
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="space-y-1">
                                  {user.groups.slice(2).map(group => (
                                    <p key={group} className="text-xs">{group}</p>
                                  ))}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={user.enabled ? "default" : "secondary"}
                          className={user.enabled ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" : ""}
                        >
                          <Icon 
                            name={user.enabled ? "CheckCircle" : "XCircle"} 
                            size={12} 
                            className="mr-1" 
                          />
                          {user.enabled ? t('table.enabled') : t('table.disabled')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Icon name="MoreHorizontal" size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>{t('table.actions')}</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleToggleUserStatus(user.id, user.enabled)}
                              disabled={enableUserMutation.isPending || disableUserMutation.isPending}
                            >
                              <Icon 
                                name={user.enabled ? "UserX" : "UserCheck"} 
                                size={14} 
                                className="mr-2" 
                              />
                              {user.enabled ? t('table.disable_user') : t('table.enable_user')}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteUser(user.id)}
                              disabled={deleteUserMutation.isPending}
                              className="text-destructive focus:text-destructive"
                            >
                              <Icon name="Trash2" size={14} className="mr-2" />
                              {t('table.delete_user')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => !open && setDeleteDialog({ open: false, userId: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Icon name="AlertTriangle" size={20} className="text-destructive" />
              {t('table.confirm_delete_title')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('table.confirm_delete_description', { userId: deleteDialog.userId })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteUserMutation.isPending}>
              {t('table.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteUser}
              disabled={deleteUserMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteUserMutation.isPending ? (
                <Icon name="Loader2" size={14} className="animate-spin mr-2" />
              ) : (
                <Icon name="Trash2" size={14} className="mr-2" />
              )}
              {t('table.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
};

export default UsersTable;
