import React, { useState, useRef, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { useTranslation } from '../../i18n';

interface MenuItem {
  label?: string;
  icon?: React.ReactNode;
  shortcut?: string;
  action?: () => void;
  divider?: boolean;
  danger?: boolean;
}

const useClickOutside = (ref: React.RefObject<HTMLElement>, handler: () => void) => {
  useEffect(() => {
    const listener = (event: MouseEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) return;
      handler();
    };
    document.addEventListener('mousedown', listener);
    return () => document.removeEventListener('mousedown', listener);
  }, [ref, handler]);
};

const DropdownMenu: React.FC<{
  trigger: React.ReactNode;
  items: MenuItem[];
  align?: 'left' | 'right';
  width?: string;
}> = ({ trigger, items, align = 'left', width = '160px' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useClickOutside(menuRef, () => setIsOpen(false));

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      triggerRef.current?.focus();
    }
  };

  return (
    <div className="relative" style={{ display: 'inline-flex' }}>
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 'var(--spacing-1)',
          padding: 'var(--spacing-1-5) var(--spacing-2-5)',
          fontSize: 'var(--text-sm)',
          fontWeight: 'var(--font-medium)',
          color: isOpen ? 'var(--surface-text-primary)' : 'var(--surface-text-secondary)',
          backgroundColor: isOpen ? 'var(--surface-hover)' : 'transparent',
          border: 'none',
          borderRadius: 'var(--radius-default)',
          cursor: 'pointer',
          transition: 'all var(--transition-fast)',
        }}
        onMouseEnter={(e) => { if (!isOpen) e.currentTarget.style.backgroundColor = 'var(--surface-hover)'; }}
        onMouseLeave={(e) => { if (!isOpen) e.currentTarget.style.backgroundColor = 'transparent'; }}
      >
        {trigger}
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          style={{
            position: 'absolute',
            top: '100%',
            [align]: 0,
            marginTop: 'var(--spacing-1)',
            minWidth: width,
            backgroundColor: 'var(--surface-raised)',
            border: '1px solid var(--surface-border)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-lg)',
            padding: 'var(--spacing-1)',
            zIndex: 'var(--z-dropdown)',
            animation: 'fadeIn 150ms ease',
          }}
          role="menu"
        >
          {items.map((item, index) => (
            <React.Fragment key={index}>
              {item.divider && (
                <div
                  style={{
                    height: '1px',
                    backgroundColor: 'var(--surface-border)',
                    margin: 'var(--spacing-1) 0',
                  }}
                />
              )}
              <button
                onClick={() => { item.action(); setIsOpen(false); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: 'var(--spacing-2) var(--spacing-3)',
                  fontSize: 'var(--text-sm)',
                  color: item.danger ? 'var(--color-error)' : 'var(--surface-text-primary)',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: 'var(--radius-default)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all var(--transition-fast)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--surface-hover)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                role="menuitem"
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
                  {item.icon && <span style={{ display: 'flex', width: '18px' }}>{item.icon}</span>}
                  {item.label}
                </span>
                {item.shortcut && (
                  <kbd style={{
                    fontSize: '10px',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--surface-text-muted)',
                    backgroundColor: 'var(--surface-sunken)',
                    padding: '1px 6px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--surface-border)',
                  }}>
                    {item.shortcut}
                  </kbd>
                )}
              </button>
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage, t } = useTranslation();

  const menuItems: MenuItem[] = [
    {
      label: t('header.vietnamese'),
      icon: <span style={{ display: 'flex' }}>🇻🇳</span>,
      action: () => setLanguage('vi'),
      divider: false
    },
    {
      label: t('header.english'),
      icon: <span style={{ display: 'flex' }}>🇺🇸</span>,
      action: () => setLanguage('en'),
      divider: false
    }
  ];

  return (
    <DropdownMenu
      trigger={
        <button
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--spacing-1-5)',
            padding: 'var(--spacing-1-5) var(--spacing-2-5)',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-medium)',
            color: 'var(--surface-text-secondary)',
            backgroundColor: 'transparent',
            border: '1px solid var(--surface-border)',
            borderRadius: 'var(--radius-default)',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--surface-hover)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          aria-label={t('header.language')}
        >
          <Globe className="w-4 h-4" />
          <span>{language === 'vi' ? '🇻🇳 VI' : '🇺🇸 EN'}</span>
        </button>
      }
      items={menuItems}
      align="right"
      width="160px"
    />
  );
};