import React from 'react';

/**
 * Displays a user avatar with intelligent fallback:
 * 1. Remote imageUrl if available and valid
 * 2. Initials avatar if name is provided
 * 3. Generic user icon as last resort
 */
const UserAvatar = ({ imageUrl, name, size = 'md', className = '' }) => {
    const sizes = {
        sm: 'w-7 h-7 text-xs',
        md: 'w-9 h-9 text-sm',
        lg: 'w-12 h-12 text-base',
    };
    const sizeClass = sizes[size] || sizes.md;

    const initial = name ? name.trim()[0].toUpperCase() : '?';
    const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=6366f1&color=fff&bold=true&size=128`;

    if (imageUrl) {
        return (
            <img
                src={imageUrl}
                alt={name || 'User'}
                onError={e => { e.target.onerror = null; e.target.src = defaultAvatar; }}
                className={`${sizeClass} rounded-full object-cover ring-2 ring-white shadow flex-shrink-0 ${className}`}
            />
        );
    }

    return (
        <img
            src={defaultAvatar}
            alt={initial}
            className={`${sizeClass} rounded-full object-cover ring-2 ring-white shadow flex-shrink-0 ${className}`}
        />
    );
};

export default UserAvatar;
