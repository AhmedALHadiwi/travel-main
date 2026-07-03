import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import * as Icons from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const SmtpSettings = ({ settings, setSettings }) => {
  const { t } = useLanguage();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Icons.Mail className="h-5 w-5" />
          <span>{t('smtpSettings')}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Default Mail Provider</Label>
          <Select
            value={settings.smtp.defaultProvider || 'Google Workspace'}
            onValueChange={(val) =>
              setSettings({
                smtp: { ...settings.smtp, defaultProvider: val },
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Google Workspace">Google Workspace</SelectItem>
              <SelectItem value="Microsoft 365">Microsoft 365</SelectItem>
              <SelectItem value="Hostinger Mail">Hostinger Mail</SelectItem>
              <SelectItem value="Zoho Mail">Zoho Mail</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">
            This will be the default option for new employees.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="smtpServer">{t('smtpServer')}</Label>
            <Input
              id="smtpServer"
              value={settings.smtp.server || ''}
              onChange={(e) =>
                setSettings({
                  smtp: { ...settings.smtp, server: e.target.value },
                })
              }
              placeholder="e.g., smtp.hostinger.com"
            />
          </div>

          <div>
            <Label htmlFor="smtpPort">{t('smtpPort')}</Label>
            <Input
              id="smtpPort"
              value={settings.smtp.port || ''}
              onChange={(e) =>
                setSettings({
                  smtp: { ...settings.smtp, port: e.target.value },
                })
              }
              placeholder="e.g., 465"
            />
          </div>

          <div>
            <Label htmlFor="smtpEmail">{t('smtpEmail')}</Label>
            <Input
              id="smtpEmail"
              type="email"
              value={settings.smtp.email || ''}
              onChange={(e) =>
                setSettings({
                  smtp: { ...settings.smtp, email: e.target.value },
                })
              }
              placeholder="Your email"
            />
          </div>

          <div>
            <Label htmlFor="smtpPassword">{t('smtpPassword')}</Label>
            <Input
              id="smtpPassword"
              type="password"
              value={settings.smtp.password || ''}
              onChange={(e) =>
                setSettings({
                  smtp: { ...settings.smtp, password: e.target.value },
                })
              }
              placeholder="Your password"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SmtpSettings;
