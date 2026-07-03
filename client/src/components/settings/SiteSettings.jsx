import React, { useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import * as Icons from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const SiteSettings = ({ settings, setSettings }) => {
  const { t } = useLanguage();
  const logoInputRef = useRef(null);
  const faviconInputRef = useRef(null);

  const handleFileChange = useCallback(
    (e, type) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setSettings({ [type]: reader.result });
        };
        reader.readAsDataURL(file);
      }
    },
    [setSettings]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Icons.Globe className="h-5 w-5" />
          <span>{t('siteSettings')}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="siteName">{t('tabTitle')}</Label>
          <Input
            id="siteName"
            value={settings.siteName || ""}
            onChange={(e) => setSettings({ siteName: e.target.value })}
          />
        </div>

        <div className="flex items-center space-x-4">
          {/* Logo */}
          <div>
            <Label>{t('logo')}</Label>
            <div className="mt-2 w-24 h-24 border-2 border-dashed rounded-lg flex items-center justify-center bg-muted">
              {settings.logo ? (
                <img
                  src={settings.logo}
                  alt="Logo Preview"
                  className="h-full w-full object-contain"
                />
              ) : (
                <Icons.Image className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => logoInputRef.current.click()}
            >
              {t('uploadLogo')}
            </Button>
            <Input
              type="file"
              ref={logoInputRef}
              className="hidden"
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'logo')}
            />
          </div>

          {/* Favicon */}
          <div>
            <Label>{t('favicon')}</Label>
            <div className="mt-2 w-16 h-16 border-2 border-dashed rounded-lg flex items-center justify-center bg-muted">
              {settings.favicon ? (
                <img
                  src={settings.favicon}
                  alt="Favicon Preview"
                  className="h-full w-full object-contain"
                />
              ) : (
                <Icons.Image className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => faviconInputRef.current.click()}
            >
              {t('uploadFavicon')}
            </Button>
            <Input
              type="file"
              ref={faviconInputRef}
              className="hidden"
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'favicon')}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SiteSettings;
