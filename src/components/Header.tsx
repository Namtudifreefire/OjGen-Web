import React, { useState, useRef, useEffect } from 'react';
import {
  FileText,
  FolderOpen,
  Save,
  Package,
  Wrench,
  Sun,
  Moon,
  HelpCircle,
  Play,
  RotateCcw,
  CheckCircle2,
  Layers,
  Sparkles,
  Upload,
  GitCompare,
  FileCode,
  Terminal,
  Keyboard,
} from 'lucide-react';
import { useTranslation } from '../i18n';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { LanguageSwitcher } from './ui/LanguageSwitcher';

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

const MenuButton: React.FC<{
  label: string;
  icon?: React.ReactNode;
  isActive?: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--spacing-2)',
      padding: 'var(--spacing-2) var(--spacing-3)',
      fontSize: 'var(--text-sm)',
      fontWeight: isActive ? 'var(--font-semibold)' : 'var(--font-medium)',
      color: isActive ? 'var(--surface-text-primary)' : 'var(--surface-text-secondary)',
      backgroundColor: isActive ? 'var(--surface-hover)' : 'transparent',
      border: 'none',
      borderRadius: 'var(--radius-default)',
      cursor: 'pointer',
      transition: 'all var(--transition-fast)',
      width: '100%',
      textAlign: 'left',
    }}
    onMouseEnter={(e) => {
      if (!isActive) e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
    }}
    onMouseLeave={(e) => {
      if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
    }}
  >
    {icon && <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>}
    <span>{label}</span>
  </button>
);

const DropdownMenu: React.FC<{
  trigger: React.ReactNode;
  items: MenuItem[];
  align?: 'left' | 'right';
  width?: string;
}> = ({ trigger, items, align = 'left', width = '240px' }) => {
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

interface HeaderProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onSaveProject: () => void;
  onOpenProject: () => void;
  onOpenSetup: () => void;
  onOpenPlan: () => void;
  onOpenPackage: () => void;
  onOpenMatrix: () => void;
  onOpenQueue: () => void;
  onRunSelfTest: () => void;
  onOpenShortcuts: () => void;
  onOpenAbout: () => void;
  onOpenImport: () => void;
  onOpenCompare: () => void;
  onOpenContract: () => void;
  onOpenRunProfile: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onToggleTheme,
  onSaveProject,
  onOpenProject,
  onOpenSetup,
  onOpenPlan,
  onOpenPackage,
  onOpenMatrix,
  onOpenQueue,
  onRunSelfTest,
  onOpenShortcuts,
  onOpenAbout,
  onOpenImport,
  onOpenCompare,
  onOpenContract,
  onOpenRunProfile,
  activeTab,
  setActiveTab,
}) => {
  const { t } = useTranslation();

  const fileMenuItems: MenuItem[] = [
    { label: t('header.saveProject'), icon: <Save className="w-4 h-4" />, shortcut: 'Ctrl+S', action: onSaveProject },
    { label: t('header.openProject'), icon: <FolderOpen className="w-4 h-4" />, shortcut: 'Ctrl+O', action: onOpenProject },
    { divider: true },
    { label: t('header.problemContent'), icon: <FileText className="w-4 h-4" />, action: () => setActiveTab('statement') },
    { label: t('header.packageProblem'), icon: <Package className="w-4 h-4" />, shortcut: 'Ctrl+B', action: onOpenPackage },
  ];

  const toolsMenuItems: MenuItem[] = [
    { label: t('header.testPlan'), icon: <Layers className="w-4 h-4" />, shortcut: 'Ctrl+P', action: onOpenPlan },
    { label: t('header.differentialTesting'), icon: <RotateCcw className="w-4 h-4" />, shortcut: 'Ctrl+D', action: () => setActiveTab('differential') },
    { label: t('header.solutionMatrix'), icon: <Sparkles className="w-4 h-4" />, shortcut: 'Ctrl+M', action: onOpenMatrix },
    { label: t('header.queueManagement'), icon: <Play className="w-4 h-4" />, action: onOpenQueue },
    { divider: true },
    { label: t('header.validatorChecker'), icon: <Wrench className="w-4 h-4" />, action: () => setActiveTab('scaffolds') },
    { label: t('header.validatorContract'), icon: <FileCode className="w-4 h-4" />, shortcut: 'Ctrl+Shift+T', action: onOpenContract },
    { label: t('header.runProfile'), icon: <Terminal className="w-4 h-4" />, shortcut: 'Ctrl+Shift+R', action: onOpenRunProfile },
    { divider: true },
    { label: t('header.selftest'), icon: <CheckCircle2 className="w-4 h-4" />, action: onRunSelfTest, danger: false },
  ];

  const helpMenuItems: MenuItem[] = [
    { label: t('header.shortcuts'), icon: <Keyboard className="w-4 h-4" />, shortcut: '?', action: onOpenShortcuts },
    { label: t('header.guide'), icon: <HelpCircle className="w-4 h-4" />, action: () => setActiveTab('help') },
    { divider: true },
    { label: t('header.about'), action: onOpenAbout },
  ];

  return (
    <header
      style={{
        borderBottom: '1px solid var(--surface-border)',
        backgroundColor: 'var(--surface-base)',
        backdropFilter: 'blur(8px)',
        position: 'sticky',
        top: 0,
        zIndex: 'var(--z-sticky)',
        userSelect: 'none',
      }}
    >
      {/* Top Application Bar */}
      <div
        className="app-header-bar"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'var(--spacing-3) var(--spacing-4)',
          borderBottom: '1px solid var(--surface-border)',
          backgroundColor: 'var(--surface-raised)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)', minWidth: 0 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              flexShrink: 0,
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--color-primary-600)',
              boxShadow: '0 4px 14px 0 rgb(59 130 246 / 0.4)',
              color: 'white',
              fontWeight: 'var(--font-bold)',
              fontSize: 'var(--text-sm)',
              letterSpacing: '0.05em',
            }}
          >
            OJ
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
              <span style={{ fontWeight: 'var(--font-bold)', fontSize: 'var(--text-base)', color: 'var(--surface-text-primary)', letterSpacing: '0.02em' }}>
                OjGen
              </span>
              <Badge variant="primary" size="sm">v3.3.0</Badge>
            </div>
            <p style={{ margin: '0', fontSize: 'var(--text-xs)', color: 'var(--surface-text-muted)' }}>
              {t('app.subtitle')}
            </p>
          </div>
        </div>

        <div className="app-header-actions" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
          <Button variant="ghost" size="sm" leftIcon={<Wrench className="w-3.5 h-3.5" />} onClick={onOpenSetup}>
            {t('header.setup')}
          </Button>

          <Button variant="primary" size="sm" leftIcon={<Package className="w-3.5 h-3.5" />} onClick={onOpenPackage}>
            {t('header.package')}
          </Button>

          <Button variant="secondary" size="sm" leftIcon={<Upload className="w-3.5 h-3.5" />} onClick={onOpenImport}>
            {t('header.import')}
          </Button>

          <Button variant="secondary" size="sm" leftIcon={<GitCompare className="w-3.5 h-3.5" />} onClick={onOpenCompare}>
            {t('header.compare')}
          </Button>

          <Button variant="ghost" size="sm" leftIcon={<Keyboard className="w-3.5 h-3.5" />} onClick={onOpenShortcuts}>
            {t('header.keyboardShortcuts')}
          </Button>

          <LanguageSwitcher />

          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? t('header.themeLight') : t('header.themeDark')}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Menu Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--spacing-1)',
          padding: 'var(--spacing-1) var(--spacing-3)',
          fontSize: 'var(--text-xs)',
          color: 'var(--surface-text-secondary)',
          backgroundColor: 'var(--surface-base)',
        }}
      >
        <DropdownMenu
          trigger={<span>{t('header.file')}</span>}
          items={fileMenuItems}
          align="left"
          width="260px"
        />

        <DropdownMenu
          trigger={<span>{t('header.tools')}</span>}
          items={toolsMenuItems}
          align="left"
          width="320px"
        />

        <DropdownMenu
          trigger={<span>{t('header.help')}</span>}
          items={helpMenuItems}
          align="left"
          width="220px"
        />
      </div>
    </header>
  );
};