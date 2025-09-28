/**
 * Reusable Skeleton Components for Loading States
 * Industry standard approach with configurable components
 */

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

/**
 * User Avatar + Info Skeleton (reusable pattern)
 */
export const UserInfoSkeleton = ({ showEmail = true, showBadges = false }) => (
  <div className="flex items-center gap-3">
    <Skeleton className="h-12 w-12 rounded-full" />
    <div className="space-y-1 flex-1">
      <Skeleton className="h-4 w-32" />
      {showEmail && <Skeleton className="h-3 w-24" />}
      {showBadges && (
        <div className="flex gap-1">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-12" />
        </div>
      )}
    </div>
  </div>
);

/**
 * Table Row Skeleton (configurable columns)
 */
export const TableRowSkeleton = ({ columns = [] }) => (
  <div className="flex items-center gap-4 p-3">
    {columns.map((column, index) => (
      <Skeleton 
        key={index} 
        className={`h-4 ${column.width || 'flex-1'}`} 
      />
    ))}
  </div>
);

/**
 * Form Field Skeleton
 */
export const FormFieldSkeleton = ({ label = true, wide = false }) => (
  <div className="space-y-1">
    {label && <Skeleton className="h-3 w-16" />}
    <Skeleton className={`h-8 ${wide ? 'w-full' : 'w-32'}`} />
  </div>
);

/**
 * Card Content Skeleton
 */
export const CardSkeleton = ({ hasHeader = true, lines = 3 }) => (
  <Card>
    {hasHeader && (
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-24" />
      </CardHeader>
    )}
    <CardContent className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className="h-4 w-full" />
      ))}
    </CardContent>
  </Card>
);

/**
 * Modal Content Skeleton
 */
export const ModalSkeleton = ({ title = true, fields = 4 }) => (
  <div className="space-y-4">
    {title && (
      <div className="space-y-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
    )}
    
    <div className="space-y-3">
      {Array.from({ length: fields }).map((_, i) => (
        <FormFieldSkeleton key={i} wide />
      ))}
    </div>
  </div>
);

/**
 * Stats Grid Skeleton
 */
export const StatsGridSkeleton = ({ count = 4 }) => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <Card key={i}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <Skeleton className="w-10 h-10 rounded-lg" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-6 w-8" />
            </div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

/**
 * Users Table Skeleton (specific use case)
 */
export const UsersTableSkeleton = ({ rows = 5 }) => (
  <div className="space-y-2">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-3 border rounded">
        <UserInfoSkeleton showEmail showBadges />
        <Skeleton className="h-8 w-20" /> {/* Role column */}
        <div className="flex gap-2">
          <Skeleton className="h-8 w-16" /> {/* Action button */}
          <Skeleton className="h-8 w-16" /> {/* Action button */}
          <Skeleton className="h-8 w-12" /> {/* Menu button */}
        </div>
      </div>
    ))}
  </div>
);

/**
 * Groups Grid Skeleton
 */
export const GroupsGridSkeleton = ({ count = 6 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <Card key={i}>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Skeleton className="w-12 h-12 rounded-lg" />
              <div className="space-y-1">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <Skeleton className="h-16 w-full" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-16" />
            </div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);
