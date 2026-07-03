import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import * as Icons from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';


const timezones = [
  { value: 'UTC-12:00', label: '(UTC-12:00) International Date Line West' },
  { value: 'UTC-11:00', label: '(UTC-11:00) Coordinated Universal Time-11' },
  { value: 'UTC-10:00', label: '(UTC-10:00) Hawaii (USA)' },
  { value: 'UTC-09:00', label: '(UTC-09:00) Alaska (USA)' },
  { value: 'UTC-08:00', label: '(UTC-08:00) Pacific Time (USA & Canada)' },
  { value: 'UTC-07:00', label: '(UTC-07:00) Mountain Time (USA & Canada)' },
  { value: 'UTC-06:00', label: '(UTC-06:00) Central Time (USA & Canada)' },
  { value: 'UTC-05:00', label: '(UTC-05:00) Eastern Time (USA & Canada)' },
  { value: 'UTC-04:00', label: '(UTC-04:00) Atlantic Time (Canada)' },
  { value: 'UTC-03:00', label: '(UTC-03:00) Buenos Aires (Argentina)' },
  { value: 'UTC-02:00', label: '(UTC-02:00) Mid-Atlantic' },
  { value: 'UTC-01:00', label: '(UTC-01:00) Azores (Portugal)' },
  { value: 'UTC+00:00', label: '(UTC+00:00) London, Dublin, Lisbon (UK, Ireland, Portugal)' },
  { value: 'UTC+01:00', label: '(UTC+01:00) Amsterdam, Berlin, Rome, Paris (Europe)' },
  { value: 'UTC+02:00', label: '(UTC+02:00) Cairo, Athens, Istanbul (Egypt, Greece, Turkey)' },
  { value: 'UTC+03:00', label: '(UTC+03:00) Moscow, Riyadh, Baghdad (Russia, Saudi Arabia, Iraq)' },
  { value: 'UTC+04:00', label: '(UTC+04:00) Dubai, Abu Dhabi (UAE)' },
  { value: 'UTC+05:00', label: '(UTC+05:00) Islamabad, Karachi (Pakistan)' },
  { value: 'UTC+06:00', label: '(UTC+06:00) Almaty, Dhaka (Kazakhstan, Bangladesh)' },
  { value: 'UTC+07:00', label: '(UTC+07:00) Bangkok, Hanoi, Jakarta (Thailand, Vietnam, Indonesia)' },
  { value: 'UTC+08:00', label: '(UTC+08:00) Beijing, Singapore, Hong Kong (China, Singapore, Hong Kong)' },
  { value: 'UTC+09:00', label: '(UTC+09:00) Tokyo, Seoul (Japan, South Korea)' },
  { value: 'UTC+10:00', label: '(UTC+10:00) Sydney, Guam (Australia, Guam)' },
  { value: 'UTC+11:00', label: '(UTC+11:00) Magadan, Solomon Is.' },
  { value: 'UTC+12:00', label: '(UTC+12:00) Auckland, Fiji (New Zealand, Fiji)' }
];

const currencies = [
  { code: 'EGP', name: 'Egyptian Pound' },
  { code: 'USD', name: 'US Dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'KWD', name: 'Kuwaiti Dinar' },
  { code: 'AED', name: 'UAE Dirham' },
  { code: 'SAR', name: 'Saudi Riyal' },
];

const GeneralSettings = ({ settings, setSettings }) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [openTimezone, setOpenTimezone] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Icons.Wrench className="h-5 w-5" />
          <span>{t('generalSettings')}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {user.role.name === 'admin' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="timezone">{t('timezone')}</Label>
              <Popover open={openTimezone} onOpenChange={setOpenTimezone}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openTimezone}
                    className="w-full justify-between"
                  >
                    <span className="truncate">
                      {settings.general.timezone
                        ? timezones.find(tz => tz.value === settings.general.timezone)?.label
                        : "Select timezone..."}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <Command>
                    <CommandInput placeholder="Search timezone..." />
                    <CommandEmpty>No timezone found.</CommandEmpty>
                    <CommandGroup className="max-h-60 overflow-y-auto">
                      {timezones.map((tz) => (
                        <CommandItem
                          key={tz.value}
                          value={tz.label}
                          onSelect={() => {
                            setSettings({
                              general: { ...settings.general, timezone: tz.value },
                            });
                            setOpenTimezone(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              settings.general.timezone === tz.value ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {tz.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label htmlFor="currency">{t('currency')}</Label>
              <Select
                value={settings.general.currency}
                onValueChange={(val) =>
                  setSettings({
                    general: { ...settings.general, currency: val },
                  })
                }
              >
                <SelectTrigger id="currency">
                  <SelectValue placeholder="Select a currency" />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map(c => (
                    <SelectItem key={c.code} value={c.code}>
                      {t(c.code)} ({c.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GeneralSettings;
