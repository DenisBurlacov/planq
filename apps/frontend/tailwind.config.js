/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        accent: 'var(--accent)',
        'accent-hover': 'var(--accent-hover)',
      },
      backgroundColor: {
        page: 'var(--bg-page)',
        card: 'var(--bg-card)',
        sidebar: 'var(--bg-sidebar)',
        'admin-sidebar': 'var(--bg-admin-sidebar)',
        'admin-sidebar-active': 'var(--bg-admin-sidebar-active)',
        'table-header': 'var(--table-header-bg)',
        'table-row-hover': 'var(--table-row-hover)',
        'table-stripe': 'var(--table-stripe)',
      },
      textColor: {
        primary: 'var(--text-primary)',
        secondary: 'var(--text-secondary)',
        'stat-positive': 'var(--stat-positive)',
        'stat-negative': 'var(--stat-negative)',
        'stat-neutral': 'var(--stat-neutral)',
      },
      width: {
        'admin-sidebar': 'var(--admin-sidebar-width)',
      },
      borderColor: {
        DEFAULT: 'var(--border)',
      },
      borderRadius: {
        card: '12px',
        button: '8px',
        badge: '4px',
        modal: '16px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
