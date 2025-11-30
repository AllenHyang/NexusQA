import React from "react";
import { User } from "../types";
import { User as UserIcon, Settings, Link2, Globe, Sun, Moon, Monitor } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme, Theme } from "../contexts/ThemeContext";

interface SettingsViewProps {
    currentUser: User;
    jiraUrl: string;
    setJiraUrl: (url: string) => void;
}

export function SettingsView({ currentUser, jiraUrl, setJiraUrl }: SettingsViewProps) {
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tAny = t as (key: string) => string;
  const themeOptions: { value: Theme; label: string; icon: React.ReactNode }[] = [
    { value: 'light', label: tAny("settings.theme_light"), icon: <Sun className="w-4 h-4" /> },
    { value: 'dark', label: tAny("settings.theme_dark"), icon: <Moon className="w-4 h-4" /> },
    { value: 'system', label: tAny("settings.theme_system"), icon: <Monitor className="w-4 h-4" /> },
  ];

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{t("settings.title")}</h2>
          <p className="text-gray-500 mt-2">{t("settings.subtitle")}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
            <UserIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{t("settings.profile")}</h3>
            <p className="text-xs text-gray-500">{t("settings.profile_desc")}</p>
          </div>
        </div>
        <div className="p-8">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex flex-col items-center space-y-3">
              <img src={currentUser.avatar} className="w-24 h-24 rounded-full ring-4 ring-gray-50 shadow-sm" alt="Avatar" />
              <button className="text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:underline">{t("settings.change_avatar")}</button>
            </div>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">{t("settings.full_name")}</label>
                <input type="text" defaultValue={currentUser.name} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">{t("settings.email")}</label>
                <input type="email" defaultValue="user@nexusqa.com" disabled className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">{t("settings.role")}</label>
                <div className="px-4 py-2.5 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-xl font-medium text-sm inline-flex items-center">
                  {tAny(`role.${currentUser.role}`)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Integration Settings */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <Link2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{t("settings.integrations")}</h3>
            <p className="text-xs text-gray-500">{t("settings.integrations_desc")}</p>
          </div>
        </div>
        <div className="p-8">
            <div className="max-w-xl">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">{t("settings.defect_tracker_url")}</label>
                <input 
                    type="text" 
                    value={jiraUrl}
                    onChange={(e) => setJiraUrl(e.target.value)}
                    placeholder="https://your-company.atlassian.net/browse/" 
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all" 
                />
                <p className="text-xs text-gray-400 mt-2">
                    {t("settings.defect_tracker_hint")}
                    <br/>
                    Example: <em>https://jira.com/browse/</em> + <em>PROJ-123</em>
                </p>
            </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{t("settings.preferences")}</h3>
            <p className="text-xs text-gray-500">{t("settings.preferences_desc")}</p>
          </div>
        </div>
        <div className="divide-y divide-gray-100">
          {/* Language Selection */}
          <div className="p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 dark:bg-zinc-700 rounded-lg text-gray-600 dark:text-gray-300">
                    <Globe className="w-4 h-4" />
                </div>
                <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t("settings.language")}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t("settings.language_desc")}</p>
                </div>
            </div>
            <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'en' | 'zh')}
                className="px-3 py-2 bg-white dark:bg-zinc-700 border border-gray-200 dark:border-zinc-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
                <option value="en">English</option>
                <option value="zh">中文 (Chinese)</option>
            </select>
          </div>

          {/* Theme Selection */}
          <div className="p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 dark:bg-zinc-700 rounded-lg text-gray-600 dark:text-gray-300">
                    <Sun className="w-4 h-4" />
                </div>
                <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{tAny("settings.theme")}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{tAny("settings.theme_desc")}</p>
                </div>
            </div>
            <div className="flex gap-1 p-1 bg-gray-100 dark:bg-zinc-700 rounded-lg">
                {themeOptions.map((option) => (
                    <button
                        key={option.value}
                        onClick={() => setTheme(option.value)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                            theme === option.value
                                ? 'bg-white dark:bg-zinc-600 text-gray-900 dark:text-gray-100 shadow-sm'
                                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                        }`}
                    >
                        {option.icon}
                        <span className="hidden sm:inline">{option.label}</span>
                    </button>
                ))}
            </div>
          </div>

          <div className="p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors">
            <div>
              <h4 className="text-sm font-semibold text-gray-900">{t("settings.email_notifications")}</h4>
              <p className="text-xs text-gray-500 mt-1">{t("settings.email_notifications_desc")}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}