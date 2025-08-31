const translations = {
  en: {
    sections: {
      dashboard: 'Dashboard',
      workspace: 'Workspace'
    },
    routes: {
      home: 'Home',
      executive_overview: 'Executive Overview',
      deal_intelligence: 'Deal Intelligence',
      operations_center: 'Operations Center',
      compliance_security: 'Compliance & Security',
      data_rooms: 'Data Rooms',
      q_a_center: 'Q&A Center',
      document_console: 'Document Console',
      users: 'Users',
      roles_permissions: 'Roles & Permissions',
      audit_logs: 'Audit Logs',
      settings: 'Settings'
    },
    header: {
      toggle_theme: 'Toggle theme',
      toggle_language: 'Toggle language',
      updated: 'Updated'
    },
      user: {
        profile_settings: 'Profile Settings',
        dashboard_preferences: 'Dashboard Preferences',
        notification_settings: 'Notification Settings',
        help_support: 'Help & Support',
        sign_out: 'Sign Out'
      },
    misc: {
      just_now: 'Just now'
    }
  },
  ar: {
    sections: {
      dashboard: 'لوحة القيادة',
      workspace: 'المساحة'
    },
    routes: {
      home: 'الرئيسية',
      executive_overview: 'نظرة عامة تنفيذية',
      deal_intelligence: 'ذكاء الصفقات',
      operations_center: 'مركز العمليات',
      compliance_security: 'الامتثال والأمن',
      data_rooms: 'غرف البيانات',
      q_a_center: 'مركز الأسئلة',
      document_console: 'وحدة إدارة المستندات',
      users: 'المستخدمون',
      roles_permissions: 'الأدوار والصلاحيات',
      audit_logs: 'سجلات التدقيق',
      settings: 'الإعدادات'
    },
    header: {
      toggle_theme: 'تبديل النمط',
      toggle_language: 'تبديل اللغة',
      updated: 'تم التحديث'
    },
      user: {
        profile_settings: 'إعدادات الملف الشخصي',
        dashboard_preferences: 'تفضيلات لوحة القيادة',
        notification_settings: 'إعدادات الإشعارات',
        help_support: 'المساعدة والدعم',
        sign_out: 'تسجيل الخروج'
      },
    misc: {
      just_now: 'الآن'
    }
  }
};

function getLang() {
  try {
  // Only use Arabic translations when the document direction is explicitly RTL.
  const docDir = document?.documentElement?.dir;
  if (docDir === 'rtl') return 'ar';
  // Otherwise use English by default (ignore stored "lang" to prevent LTR pages showing Arabic)
  return 'en';
  } catch (e) {
    // ignore
  }
  return 'en';
}

export default function t(path, vars) {
  const lang = getLang();
  const parts = path.split('.');
  let cur = translations[lang];
  for (const p of parts) {
    if (!cur) break;
    cur = cur[p];
  }
  if (cur == null) {
    // fallback to english
    cur = translations.en;
    for (const p of parts) {
      if (!cur) break;
      cur = cur[p];
    }
  }
  if (typeof cur === 'string' && vars) {
    return cur.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');
  }
  return cur ?? path;
}
