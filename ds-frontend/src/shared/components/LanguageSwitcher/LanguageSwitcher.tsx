import { Button, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { useTranslation } from 'react-i18next';

interface LanguageOption {
  code: 'vi' | 'en';
  label: string;
  flag: string;
}

const LANGUAGES: LanguageOption[] = [
  { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
];

interface LanguageSwitcherProps {
  className?: string;
}

/** F.1.2 — Dropdown chọn ngôn ngữ (cờ), đặt cạnh ThemeToggle trên Header. */
const LanguageSwitcher = ({ className = '' }: LanguageSwitcherProps) => {
  const { i18n, t } = useTranslation();
  const current = LANGUAGES.find((lang) => lang.code === i18n.language) ?? LANGUAGES[0];

  const items: MenuProps['items'] = LANGUAGES.map((lang) => ({
    key: lang.code,
    label: (
      <span className="flex items-center gap-2">
        <span>{lang.flag}</span>
        <span>{lang.label}</span>
      </span>
    ),
  }));

  const handleClick: MenuProps['onClick'] = ({ key }) => {
    void i18n.changeLanguage(key);
  };

  return (
    <Dropdown
      menu={{ items, selectedKeys: [current.code], onClick: handleClick }}
      trigger={['click']}
      placement="bottomRight"
    >
      <Button
        type="text"
        shape="circle"
        aria-label={t('language.switch')}
        className={`!w-11 !h-11 !text-lg ${className}`}
      >
        {current.flag}
      </Button>
    </Dropdown>
  );
};

export default LanguageSwitcher;
