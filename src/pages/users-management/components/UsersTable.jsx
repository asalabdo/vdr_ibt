import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  useUsers,
  useDeleteUser,
  useEnableUser,
  useDisableUser,
} from '@/hooks/api';
import {
  useMakeUserAdmin,
  useRemoveAdminPrivileges,
} from '@/hooks/api/useUserRoles';
import { usePermissions } from '@/hooks/api/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination';
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
import UserRoleDisplay from '@/components/UserRoleDisplay';
import { UsersTableSkeleton, StatsGridSkeleton } from '@/components/ui/skeleton-variants';
import { getUserInitials } from '@/lib/userFormatters';
import UserDetailsModal from './UserDetailsModal';
import EditUserModal from './EditUserModal';

/**
 * Users Table Component
 * Displays and manages the list of users
 */
const UsersTable = () => {
  const { t, i18n } = useTranslation('users-management');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, userId: null });
  const [userDetailsModal, setUserDetailsModal] = useState({ open: false, userId: null });
  const [editUserModal, setEditUserModal] = useState({ open: false, userId: null });
  
  // Get user permissions to control what actions are available
  const { isAdmin, canManageAllGroups } = usePermissions();
  
  // Pagination constants
  const USERS_PER_PAGE = 10;
  
  // Fetch users (no search parameter since we filter locally)
  const { 
    data: usersData, 
    isLoading, 
    error, 
    refetch 
  } = useUsers();

  // Get users data - already formatted by the API
  const users = usersData?.users || [];
  
  // Filter based on search if needed
  const filteredUsers = searchTerm
    ? users.filter(user => 
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : users;
  
  // Pagination calculations
  const totalUsers = filteredUsers.length;
  const totalPages = Math.ceil(totalUsers / USERS_PER_PAGE);
  const startIndex = (currentPage - 1) * USERS_PER_PAGE;
  const endIndex = startIndex + USERS_PER_PAGE;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
  
  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);
  
  // Handle page changes
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  
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
      console.error('Failed to delete user:', error.message);
      
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
      console.error('Failed to enable user:', error.message);
      
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
      console.error('Failed to disable user:', error.message);
      
      // Show error toast
      toast.error('Failed to disable user', {
        description: error.message,
      });
    }
  });

  // Role management mutations
  const makeAdminMutation = useMakeUserAdmin({
    onSuccess: (data, userId) => {
      toast.success('User promoted to administrator!', {
        description: `User "${userId}" now has administrator privileges.`,
      });
    },
    onError: (error) => {
      console.error('Failed to make user admin:', error.message);
      toast.error('Failed to promote user to administrator', {
        description: error.message,
      });
    }
  });

  const removeAdminMutation = useRemoveAdminPrivileges({
    onSuccess: (data, userId) => {
      toast.success('Administrator privileges removed!', {
        description: `User "${userId}" is no longer an administrator.`,
      });
    },
    onError: (error) => {
      console.error('Failed to remove admin privileges:', error.message);
      toast.error('Failed to remove administrator privileges', {
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

  const handleViewUserDetails = (userId) => {
    setUserDetailsModal({ open: true, userId });
  };

  const handleCloseUserDetails = () => {
    setUserDetailsModal({ open: false, userId: null });
  };

  const handleEditUser = (userId) => {
    setEditUserModal({ open: true, userId });
  };

  const handleCloseEditUser = () => {
    setEditUserModal({ open: false, userId: null });
  };

  // Role management handlers
  const handleMakeAdmin = (userId) => {
    makeAdminMutation.mutate(userId);
  };

  const handleRemoveAdmin = (userId) => {
    removeAdminMutation.mutate(userId);
  };
  
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-4 space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-12" />
          </div>
          <Skeleton className="h-9 w-64" />
        </CardHeader>
        <CardContent>
          <UsersTableSkeleton rows={10} />
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
  
  return (
    <TooltipProvider>
      <Card>
        <CardHeader className="pb-4 space-y-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Icon name="Users" size={18} />
              {t('table.title')}
            </CardTitle>
            <Badge variant="secondary" className="px-2 py-1 text-xs">
              {t(totalUsers === 1 ? 'table.users_count' : 'table.users_count_plural', { count: totalUsers })}
            </Badge>
          </div>
          
          {/* Search and Actions */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Icon 
                name="Search" 
                size={14} 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" 
              />
              <Input
                placeholder={t('table.search_placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => refetch()}
                  disabled={isLoading}
                  className="h-9 w-9 p-0"
                >
                  <Icon name="RefreshCw" size={14} className={isLoading ? "animate-spin" : ""} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('table.refresh_tooltip')}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </CardHeader>
      
        <CardContent>
          {totalUsers === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="rounded-full bg-muted/20 p-3 mb-3">
                <Icon name="Users" size={24} className="text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-base mb-1">{t('table.no_users_title')}</h3>
              <p className="text-muted-foreground text-xs max-w-sm">
                {searchTerm ? t('table.no_search_results') : t('table.no_users_description')}
              </p>
              {searchTerm && (
                <Button 
                  variant="outline" 
                  onClick={() => setSearchTerm('')}
                  size="sm"
                  className="mt-3 gap-1"
                >
                  <Icon name="X" size={12} />
                  {t('table.clear_search')}
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-xs font-medium text-muted-foreground">{t('table.user')}</TableHead>
                      <TableHead className="text-xs font-medium text-muted-foreground w-[120px]">{t('table.role', 'Role')}</TableHead>
                      <TableHead className="text-xs font-medium text-muted-foreground w-[320px]">{t('table.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedUsers.map((user) => (
                      <TableRow key={user.id} className="group hover:bg-muted/30">
                        <TableCell className="py-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs">
                                {getUserInitials(user)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-sm">{user.username}</p>
                              <p className="text-muted-foreground text-xs">{t('table.click_to_view_details')}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-3">
                          <UserRoleDisplay user={user} />
                        </TableCell>
                        <TableCell className="py-3">
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditUser(user.id)}
                              className="gap-1 h-8 px-3"
                            >
                              <Icon name="Edit" size={12} />
                              {t('table.edit_user')}
                            </Button>
                            
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewUserDetails(user.id)}
                              className="gap-1 h-8 px-3"
                            >
                              <Icon name="Eye" size={12} />
                              {t('table.view_details')}
                            </Button>
                            
                            {/* Delete User - Only admins can delete users */}
                            {isAdmin && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleDeleteUser(user.id)}
                                disabled={deleteUserMutation.isPending}
                                className="gap-1 h-8 px-3 text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                              >
                                {deleteUserMutation.isPending ? (
                                  <Icon name="Loader2" size={12} className="animate-spin" />
                                ) : (
                                  <Icon name="Trash2" size={12} />
                                )}
                                {t('table.delete_user')}
                              </Button>
                            )}

                            {/* Role Management Dropdown */}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="gap-1 h-8 px-3"
                                >
                                  <Icon name="Shield" size={12} />
                                  {t('table.manage_role', 'Role')}
                                  <Icon name="ChevronDown" size={10} />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel className="text-xs">
                                  {t('table.role_management', 'Role Management')}
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                
                                {/* Admin Actions - Only for Admins */}
                                {isAdmin ? (
                                  <>
                                    {!user.groups?.includes('admin') ? (
                                      <DropdownMenuItem 
                                        className="gap-2 text-xs text-green-600"
                                        onClick={() => handleMakeAdmin(user.id)}
                                        disabled={makeAdminMutation.isPending}
                                      >
                                        {makeAdminMutation.isPending ? (
                                          <Icon name="Loader2" size={12} className="animate-spin" />
                                        ) : (
                                          <Icon name="ShieldCheck" size={12} />
                                        )}
                                        {t('table.make_admin', 'Make Administrator')}
                                      </DropdownMenuItem>
                                    ) : (
                                      <DropdownMenuItem 
                                        className="gap-2 text-xs text-orange-600"
                                        onClick={() => handleRemoveAdmin(user.id)}
                                        disabled={removeAdminMutation.isPending}
                                      >
                                        {removeAdminMutation.isPending ? (
                                          <Icon name="Loader2" size={12} className="animate-spin" />
                                        ) : (
                                          <Icon name="ShieldOff" size={12} />
                                        )}
                                        {t('table.remove_admin', 'Remove Admin')}
                                      </DropdownMenuItem>
                                    )}
                                  </>
                                ) : (
                                  <DropdownMenuItem disabled className="text-xs text-muted-foreground">
                                    <Icon name="Info" size={12} className="mr-2" />
                                    Admin role management requires full administrator privileges
                                  </DropdownMenuItem>
                                )}
                                
                                <DropdownMenuSeparator />
                                
                                {/* Status Actions */}
                                {user.enabled ? (
                                  <DropdownMenuItem 
                                    className="gap-2 text-xs text-red-600"
                                    onClick={() => handleToggleUserStatus(user.id, true)}
                                  >
                                    <Icon name="UserX" size={12} />
                                    {t('table.disable_user', 'Disable User')}
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem 
                                    className="gap-2 text-xs text-green-600"
                                    onClick={() => handleToggleUserStatus(user.id, false)}
                                  >
                                    <Icon name="UserCheck" size={12} />
                                    {t('table.enable_user', 'Enable User')}
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {t('table.showing_results', { 
                      start: startIndex + 1, 
                      end: Math.min(endIndex, totalUsers), 
                      total: totalUsers 
                    })}
                  </div>
                  <Pagination className="mx-0 w-auto justify-end">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationLink
                          onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                          className={`gap-1 pl-2.5 cursor-pointer [&>svg]:rtl:rotate-180 ${
                            currentPage <= 1 ? "pointer-events-none opacity-50" : ""
                          }`}
                          size="default"
                        >
                          <Icon name="ChevronLeft" className="h-4 w-4" />
                          <span>{t('table.previous')}</span>
                        </PaginationLink>
                      </PaginationItem>
                      
                      {[...Array(totalPages)].map((_, index) => {
                        const pageNumber = index + 1;
                        // Show first page, last page, current page, and pages around current page
                        const showPage = pageNumber === 1 || 
                                        pageNumber === totalPages || 
                                        (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1);
                        
                        if (!showPage) {
                          // Show ellipsis for gaps
                          if (pageNumber === currentPage - 2 || pageNumber === currentPage + 2) {
                            return (
                              <PaginationItem key={pageNumber}>
                                <PaginationEllipsis />
                              </PaginationItem>
                            );
                          }
                          return null;
                        }
                        
                        return (
                          <PaginationItem key={pageNumber}>
                            <PaginationLink
                              onClick={() => handlePageChange(pageNumber)}
                              isActive={currentPage === pageNumber}
                              className="cursor-pointer"
                            >
                              {pageNumber}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      
                      <PaginationItem>
                        <PaginationLink
                          onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                          className={`gap-1 pr-2.5 cursor-pointer [&>svg]:rtl:rotate-180 ${
                            currentPage >= totalPages ? "pointer-events-none opacity-50" : ""
                          }`}
                          size="default"
                        >
                          <span>{t('table.next')}</span>
                          <Icon name="ChevronRight" className="h-4 w-4" />
                        </PaginationLink>
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => !open && setDeleteDialog({ open: false, userId: null })}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader className="pb-3">
            <AlertDialogTitle className="flex items-center gap-2 text-base">
              <Icon name="AlertTriangle" size={18} className="text-destructive" />
              {t('table.confirm_delete_title')}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              {t('table.confirm_delete_description', { userId: deleteDialog.userId })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel disabled={deleteUserMutation.isPending} size="sm">
              {t('table.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteUser}
              disabled={deleteUserMutation.isPending}
              size="sm"
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-1"
            >
              {deleteUserMutation.isPending ? (
                <Icon name="Loader2" size={12} className="animate-spin" />
              ) : (
                <Icon name="Trash2" size={12} />
              )}
              {t('table.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* User Details Modal */}
      <UserDetailsModal 
        isOpen={userDetailsModal.open}
        onClose={handleCloseUserDetails}
        userId={userDetailsModal.userId}
      />

      {/* Edit User Modal */}
      <EditUserModal 
        isOpen={editUserModal.open}
        onClose={handleCloseEditUser}
        userId={editUserModal.userId}
      />
    </TooltipProvider>
  );
};

export default UsersTable;
