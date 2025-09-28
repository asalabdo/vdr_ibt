import React from 'react';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/AppIcon';
import { useUserRole } from '@/hooks/api/useUserRoles';

/**
 * UserRoleDisplay Component
 * Displays user role with consistent styling and icons
 * 
 * @param {Object} props
 * @param {Object} props.user - User data
 * @param {string} [props.userId] - User ID for subadmin groups lookup
 * @param {string} [props.size="sm"] - Size variant: "xs", "sm", "md", "lg"
 * @param {boolean} [props.showIcon=true] - Whether to show role icon
 * @param {string} [props.variant="auto"] - Badge variant override
 */
const UserRoleDisplay = ({ 
  user, 
  userId = null, 
  size = "sm", 
  showIcon = true, 
  variant = "auto",
  ...props 
}) => {
  const { display, role } = useUserRole(user, userId);
  
  if (!display) {
    return (
      <Badge variant="outline" className={`text-${size}`}>
        <Icon name="User" size={size === "xs" ? 8 : size === "sm" ? 10 : 12} className="mr-1" />
        User
      </Badge>
    );
  }
  
  const badgeVariant = variant === "auto" ? display.variant : variant;
  
  const sizeClasses = {
    xs: "text-xs py-0 px-1",
    sm: "text-xs py-0 px-2", 
    md: "text-sm py-1 px-3",
    lg: "text-base py-1 px-4"
  };
  
  const iconSizes = {
    xs: 8,
    sm: 10,
    md: 12,
    lg: 14
  };
  
  const colorClasses = {
    amber: "border-amber-200 text-amber-800 bg-amber-50 dark:border-amber-800 dark:text-amber-300 dark:bg-amber-950",
    blue: "border-blue-200 text-blue-800 bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:bg-blue-950",
    gray: ""
  };
  
  return (
    <Badge 
      variant={badgeVariant}
      className={`
        ${sizeClasses[size]} 
        ${badgeVariant === 'default' ? colorClasses[display.color] : ''}
        ${badgeVariant === 'secondary' && display.color === 'blue' ? colorClasses.blue : ''}
      `}
      {...props}
    >
      {showIcon && (
        <Icon 
          name={display.icon} 
          size={iconSizes[size]} 
          className="mr-1" 
        />
      )}
      {display.label}
    </Badge>
  );
};

export default UserRoleDisplay;
