import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCompany } from '@/contexts/CompanyContext';
import { Button } from '@/components/ui/button';

/* ===================================================
  ✅ دوال مساعدة للتحقق من العناصر
=================================================== */
const validateNavigationItem = (item) => {
  return item && typeof item.id === 'string'
    && typeof item.type === 'string' &&
    typeof item.label === 'string';

};

const Sidebar = ({ onClose }) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { company } = useCompany();
  const location = useLocation();

  const menuItems = company?.settings?.navigation || [];

  const filteredNav = menuItems
    .filter(item => {
      if (!user) return false;

      const userRoleName = user.role?.name;
      const userPermissions = user.role?.permissions || [];

      if (!item.roles || item.roles.length === 0) return true;

      const hasRoleAccess = item.roles.includes(userRoleName);
      const hasPermissionAccess = userPermissions.some(permission =>
        item.roles.includes(permission)
      );

      return hasRoleAccess || hasPermissionAccess;
    })
    .filter(validateNavigationItem)
    .sort((a, b) => a.order - b.order);

  const buildTree = (items) => {
    const tree = [];
    const map = {};

    items.forEach(item => {
      map[item.id] = { ...item, items: [] };
    });

    items.forEach(item => {
      if (item.groupId && map[item.groupId]) {
        map[item.groupId].items.push(map[item.id]);
      } else {
        tree.push(map[item.id]);
      }
    });

    return tree;
  };

  const structuredNav = buildTree(filteredNav);

  /* ===================================================
    ✅ مكون NavItem (العنصر الواحد في القائمة)
  ==================================================== */
  const NavItem = ({ item, isSubItem = false }) => {
    const Icon = Icons[item.icon] || Icons.HelpCircle;
    const [isOpen, setIsOpen] = useState(false);
    const hasSubItems = item.items && item.items.length > 0;

    const isActive =
      location.pathname === item.path ||
      (hasSubItems && item.items.some(sub => location.pathname === sub.path));

    useEffect(() => {
      if (hasSubItems && item.items.some(sub => location.pathname.startsWith(sub.path))) {
        setIsOpen(true);
      }
    }, [location.pathname, item, hasSubItems]);

    const navLinkClass = `
      flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 w-full text-left
      ${isSubItem ? 'pl-8' : ''}
      ${isActive
        ? 'bg-primary text-primary-foreground shadow-lg'
        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
      }
    `;

    // Divider
    if (item.type === 'group' && item.divider) {
      return (
        <div
          key={item.id}
          className="p-3 border rounded-lg flex items-center justify-between bg-muted/30"
        >
          <div className="flex items-center space-x-4">
            <Icons.Minus className="h-5 w-5 text-muted-foreground" />
            <p className="font-medium text-muted-foreground italic">
              {item.label || 'Divider'}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={() => moveItem(item.id, -1)}>
              <Icons.ChevronUp className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => moveItem(item.id, 1)}>
              <Icons.ChevronDown className="h-4 w-4" />
            </Button>
            <Button variant="destructive" size="icon" onClick={() => handleDelete(item.id)}>
              <Icons.Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      );
    }

    // Group header
    if (item.type === 'group' && item.divider) {
      return (
        <div key={item.id} className="py-2 px-3 bg-muted/20 rounded flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            {item.label || 'Divider'}
          </span>
        </div>
      );
    }

    // External link
    if (item.type === 'external') {
      return (
        <a
          href={item.path}
          target={item.openInNewTab ? '_blank' : '_self'}
          rel="noopener noreferrer"
          className={navLinkClass}
        >
          <Icon className="h-5 w-5 flex-shrink-0" />
          <span className="font-medium text-sm flex-1">
            {t(item.label.toLowerCase().replace(/ /g, '')) || item.label}
          </span>
          <Icons.ExternalLink className="h-4 w-4 text-muted-foreground" />
        </a>
      );
    }

    // Link with sub-items (dropdown)
    if (hasSubItems) {
      return (
        <div key={item.id}>
          <button onClick={() => setIsOpen(!isOpen)} className={navLinkClass}>
            <Icon className="h-5 w-5 flex-shrink-0" />
            <span className="font-medium text-sm flex-1">
              {t(item.label.toLowerCase().replace(/ /g, '')) || item.label}
            </span>
            <Icons.ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden pl-4"
              >
                <div className="space-y-1 py-1">
                  {item.items.map(subItem => <NavItem key={subItem.id} item={subItem} isSubItem />)}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    // Regular link
    return (
      <NavLink
        key={item.id}
        to={item.path}
        className={navLinkClass}
        onClick={() => { if (window.innerWidth < 1024 && onClose) onClose(); }}
      >
        <Icon className="h-5 w-5 flex-shrink-0" />
        <span className="font-medium text-sm flex-1">
          {t(item.label) || item.label}
        </span>
      </NavLink>
    );
  };

  /* ===================================================
    ✅ Render Sidebar
  ==================================================== */
  return (
    <motion.div
      className="h-full bg-card border-r border-border sidebar-gradient flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-4 border-b border-border flex-shrink-0">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-lg relative overflow-hidden flex items-center justify-center">
              {company?.settings?.logo ? (
                <img
                  src={`${company.settings.logo}`}
                  alt="logo"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <span className="text-primary-foreground font-bold text-lg">
                  {company?.name?.charAt(0) || 'C'}
                </span>
              )}
            </div>
            <h2 className="font-semibold text-md text-foreground">
              {company?.settings?.siteName || t('tabTitle')}
            </h2>
          </Link>
          <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden">
            <Icons.X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
        {structuredNav.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <Icons.Lock className="h-8 w-8 mx-auto mb-2" />
            <p className="text-sm">No navigation items available</p>
            <p className="text-xs">for role: <strong>{user?.role?.name}</strong></p>
          </div>
        ) : (
          structuredNav.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <NavItem item={item} />
            </motion.div>
          ))
        )}
      </nav>
    </motion.div>
  );
};

export default Sidebar;
