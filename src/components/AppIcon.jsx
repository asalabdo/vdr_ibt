import React from 'react';
import * as LucideIcons from 'lucide-react';
import { HelpCircle } from 'lucide-react';

function Icon({
    name,
    size = 24,
    color = "currentColor",
    className = "",
    strokeWidth = 2,
    ...props
}) {
    // Direct lookup
    let IconComponent = LucideIcons?.[name];

    // Fallback: normalize common variants like 'menu', 'lucide-menu', 'bar-chart-3' -> 'BarChart3'
    if (!IconComponent && typeof name === 'string') {
        const cleaned = name.replace(/^lucide[-:_]?/i, '');
        const parts = cleaned.split(/[^a-zA-Z0-9]+/).filter(Boolean);
        const pascal = parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('');
        IconComponent = LucideIcons?.[pascal];
    }

    if (!IconComponent) {
        return <HelpCircle size={size} color="gray" strokeWidth={strokeWidth} className={className} {...props} />;
    }

    return (
        <IconComponent
            size={size}
            color={color}
            strokeWidth={strokeWidth}
            className={className}
            {...props}
        />
    );
}
export default Icon;