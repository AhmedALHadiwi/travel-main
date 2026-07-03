import { useCompany } from '@/contexts/CompanyContext';

const ShiftSettings = () => {
  const { company, updateCompanySettings } = useCompany();

  const shiftSettings = company?.settings?.shiftSettings || {};

  const handleChange = (field, value) => {
    updateCompanySettings({
      ...shiftSettings,
      [field]: value,
    });
  };

  return (
    <div>
      <input
        type="number"
        value={shiftSettings.defaultShiftHours || ''}
        onChange={(e) => handleChange("defaultShiftHours", parseInt(e.target.value, 10))}
      />
      <input
        type="number"
        value={shiftSettings.defaultBreakMinutes || ''}
        onChange={(e) => handleChange("defaultBreakMinutes", parseInt(e.target.value, 10))}
      />
      <input
        type="number"
        value={shiftSettings.shiftsPerDay || ''}
        onChange={(e) => handleChange("shiftsPerDay", parseInt(e.target.value, 10))}
      />
      <label>
        Auto End Shift
        <input
          type="checkbox"
          checked={shiftSettings.autoEndShift || false}
          onChange={(e) => handleChange("autoEndShift", e.target.checked)}
        />
      </label>
    </div>
  );
};
export default ShiftSettings;