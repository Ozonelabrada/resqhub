import React, { useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Dropdown } from 'primereact/dropdown';
import { ColorPicker } from 'primereact/colorpicker';
import { InputText } from 'primereact/inputtext';
import { Divider } from 'primereact/divider';
import { TabView, TabPanel } from 'primereact/tabview';
import { Badge } from 'primereact/badge';
import { useTheme } from '@emotion/react';
// TODO: Replace with actual theme config import if available

type Theme = {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    danger: string;
    info: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    primaryDark: string;
    primaryLight: string;
    secondaryDark: string;
    secondaryLight: string;
  };
  gradients: {
    hero: string;
  };
};

const themeConfig: {
  themes: {
    [key: string]: Theme;
  };
} = {
  themes: {
    default: {
      name: 'Default',
      colors: {
        primary: '#3b82f6',
        secondary: '#64748b',
        success: '#22c55e',
        warning: '#f59e42',
        danger: '#ef4444',
        info: '#0ea5e9',
        background: '#f8fafc',
        surface: '#ffffff',
        text: '#1e293b',
        textSecondary: '#64748b',
        primaryDark: '#1d4ed8',
        primaryLight: '#93c5fd',
        secondaryDark: '#334155',
        secondaryLight: '#cbd5e1'
      },
      gradients: {
        hero: 'linear-gradient(90deg, #3b82f6 0%, #64748b 100%)'
      }
    }
    // Add more themes as needed
  }
};

interface ThemeCustomizerProps {
  visible: boolean;
  onHide: () => void;
}

const ThemeCustomizer: React.FC<ThemeCustomizerProps> = ({ visible, onHide }) => {
  // Replace this with your actual theme context or props if available
  // Example: const { currentTheme, setTheme, availableThemes, customizeTheme, resetTheme } = useThemeContext();
  const theme = useTheme() as Theme;
  const currentTheme = theme;
  // You need to provide implementations for setTheme, availableThemes, customizeTheme, resetTheme
  // For now, use placeholders or pass them as props/context

  // Placeholder implementations (replace with real ones)
  const setTheme = (_themeName: string) => {};
  const availableThemes = Object.keys(themeConfig.themes);
  const customizeTheme = (_custom: Partial<Theme>) => {};
  const resetTheme = () => {};

  const [activeTab, setActiveTab] = useState(0);
  const [previewColors, setPreviewColors] = useState(currentTheme.colors);

  const handleThemeChange = (themeName: string) => {
    setTheme(themeName);
    setPreviewColors(currentTheme.colors);
  };

  const handleColorChange = (colorKey: string, value: string) => {
    const newColors = {
      ...previewColors,
      [colorKey]: value.startsWith('#') ? value : `#${value}`
    };
    setPreviewColors(newColors);
  };

  const applyCustomization = () => {
    customizeTheme({
      colors: previewColors
    });
  };

  const handleReset = () => {
    resetTheme();
    setPreviewColors(currentTheme.colors);
  };

  const themeOptions = availableThemes.map((theme: string) => ({
    label: theme.charAt(0).toUpperCase() + theme.slice(1),
    value: theme
  }));

  const ColorControl = ({ label, colorKey, value }: { label: string; colorKey: string; value: string }) => (
    <div className="flex align-items-center justify-content-between mb-3">
      <label className="font-medium text-sm">{label}</label>
      <div className="flex align-items-center gap-2">
        <ColorPicker
          value={value.replace('#', '')}
          onChange={(e) => handleColorChange(colorKey, e.value as string)}
          format="hex"
        />
        <InputText
          value={value}
          onChange={(e) => handleColorChange(colorKey, e.target.value)}
          className="w-6rem text-xs"
        />
      </div>
    </div>
  );

  const PreviewCard = () => (
    <Card className="mb-4" style={{ backgroundColor: previewColors.surface }}>
      <div className="p-3">
        <h3 style={{ color: previewColors.text, margin: '0 0 1rem 0' }}>Theme Preview</h3>
        <div className="grid">
          <div className="col-6">
            <Button 
              label="Primary" 
              className="w-full mb-2" 
              style={{ backgroundColor: previewColors.primary, borderColor: previewColors.primary }}
            />
            <Button 
              label="Secondary" 
              className="w-full p-button-outlined" 
              style={{ borderColor: previewColors.secondary, color: previewColors.secondary }}
            />
          </div>
          <div className="col-6">
            <div className="flex flex-column gap-2">
              <Badge value="Success" severity="success" style={{ backgroundColor: previewColors.success }} />
              <Badge value="Warning" severity="warning" style={{ backgroundColor: previewColors.warning }} />
              <Badge value="Danger" severity="danger" style={{ backgroundColor: previewColors.danger }} />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <Dialog
      header="Theme Customizer"
      visible={visible}
      onHide={onHide}
      style={{ width: '50vw', minWidth: '400px' }}
      modal
      maximizable
    >
      <div className="flex flex-column h-full">
        {/* Current Theme Info */}
        <div className="mb-4 p-3 border-round" style={{ backgroundColor: '#f8fafc' }}>
          <div className="flex align-items-center justify-content-between">
            <div>
              <h4 className="m-0 mb-1">Current Theme</h4>
              <p className="m-0 text-sm text-gray-600">{currentTheme.name}</p>
            </div>
            <Badge value="Active" severity="success" />
          </div>
        </div>

        <TabView activeIndex={activeTab} onTabChange={(e) => setActiveTab(e.index)}>
          {/* Predefined Themes Tab */}
          <TabPanel header="Themes" leftIcon="pi pi-palette">
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Select Theme</label>
              <Dropdown
                value={availableThemes.find((t: string) => currentTheme.name === (t.charAt(0).toUpperCase() + t.slice(1))) || 'default'}
                options={themeOptions}
                onChange={(e) => handleThemeChange(e.value)}
                className="w-full"
                placeholder="Choose a theme"
              />
            </div>

            <PreviewCard />

            <div className="grid">
              {availableThemes.map((themeName: React.Key | null | undefined) => {
                const theme = themeConfig.themes[themeName as string];
                return (
                  <div key={themeName} className="col-6 mb-3">
                    <Card 
                      className="cursor-pointer hover:shadow-3 transition-all transition-duration-200"
                      onClick={() => typeof themeName === 'string' && handleThemeChange(themeName)}
                      style={{ 
                        border: currentTheme.name === theme.name ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                        background: theme.gradients.hero
                      }}
                    >
                      <div className="p-2 text-center">
                        <h5 className="m-0 text-white font-bold">{theme.name}</h5>
                        <div className="flex justify-content-center gap-1 mt-2">
                          <div 
                            className="w-1rem h-1rem border-round" 
                            style={{ backgroundColor: theme.colors.primary }}
                          ></div>
                          <div 
                            className="w-1rem h-1rem border-round" 
                            style={{ backgroundColor: theme.colors.secondary }}
                          ></div>
                          <div 
                            className="w-1rem h-1rem border-round" 
                            style={{ backgroundColor: theme.colors.success }}
                          ></div>
                        </div>
                      </div>
                    </Card>
                  </div>
                );
              })}
            </div>
          </TabPanel>

          {/* Color Customization Tab */}
          <TabPanel header="Colors" leftIcon="pi pi-brush">
            <PreviewCard />

            <div className="grid">
              <div className="col-12 md:col-6">
                <h5>Primary Colors</h5>
                <ColorControl label="Primary" colorKey="primary" value={previewColors.primary} />
                <ColorControl label="Primary Dark" colorKey="primaryDark" value={previewColors.primaryDark} />
                <ColorControl label="Primary Light" colorKey="primaryLight" value={previewColors.primaryLight} />
                
                <Divider />
                
                <h5>Secondary Colors</h5>
                <ColorControl label="Secondary" colorKey="secondary" value={previewColors.secondary} />
                <ColorControl label="Secondary Dark" colorKey="secondaryDark" value={previewColors.secondaryDark} />
                <ColorControl label="Secondary Light" colorKey="secondaryLight" value={previewColors.secondaryLight} />
              </div>
              
              <div className="col-12 md:col-6">
                <h5>Status Colors</h5>
                <ColorControl label="Success" colorKey="success" value={previewColors.success} />
                <ColorControl label="Warning" colorKey="warning" value={previewColors.warning} />
                <ColorControl label="Danger" colorKey="danger" value={previewColors.danger} />
                <ColorControl label="Info" colorKey="info" value={previewColors.info} />
                
                <Divider />
                
                <h5>Surface Colors</h5>
                <ColorControl label="Background" colorKey="background" value={previewColors.background} />
                <ColorControl label="Surface" colorKey="surface" value={previewColors.surface} />
                <ColorControl label="Text" colorKey="text" value={previewColors.text} />
                <ColorControl label="Text Secondary" colorKey="textSecondary" value={previewColors.textSecondary} />
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <Button 
                label="Apply Changes" 
                icon="pi pi-check" 
                onClick={applyCustomization}
                className="flex-1"
              />
              <Button 
                label="Reset" 
                icon="pi pi-refresh" 
                onClick={handleReset}
                outlined
                className="flex-1"
              />
            </div>
          </TabPanel>

          {/* Advanced Tab */}
          <TabPanel header="Advanced" leftIcon="pi pi-cog">
            <div className="mb-4">
              <h5>Theme Export/Import</h5>
              <div className="flex gap-2 mb-3">
                <Button 
                  label="Export Theme" 
                  icon="pi pi-download"
                  onClick={() => {
                    const dataStr = JSON.stringify(currentTheme, null, 2);
                    const dataBlob = new Blob([dataStr], {type: 'application/json'});
                    const url = URL.createObjectURL(dataBlob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `${currentTheme.name.toLowerCase().replace(/\s+/g, '-')}-theme.json`;
                    link.click();
                  }}
                  outlined
                />
                <Button 
                  label="Import Theme" 
                  icon="pi pi-upload"
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = '.json';
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                          try {
                            const theme = JSON.parse(e.target?.result as string);
                            customizeTheme(theme);
                          } catch (error) {
                            console.error('Invalid theme file:', error);
                          }
                        };
                        reader.readAsText(file);
                      }
                    };
                    input.click();
                  }}
                  outlined
                />
              </div>
            </div>

            <div className="mb-4">
              <h5>Theme Information</h5>
              <div className="grid text-sm">
                <div className="col-6"><strong>Name:</strong> {currentTheme.name}</div>
                <div className="col-6"><strong>Type:</strong> {currentTheme.name === 'Custom Theme' ? 'Custom' : 'Predefined'}</div>
              </div>
            </div>

            <div className="mb-4">
              <h5>Reset Options</h5>
              <div className="flex gap-2">
                <Button 
                  label="Reset to Default" 
                  icon="pi pi-replay"
                  onClick={handleReset}
                  severity="secondary"
                />
                <Button 
                  label="Clear All Customizations" 
                  icon="pi pi-trash"
                  onClick={() => {
                    localStorage.removeItem('resqhub-theme');
                    localStorage.removeItem('resqhub-custom-theme');
                    window.location.reload();
                  }}
                  severity="danger"
                  outlined
                />
              </div>
            </div>
          </TabPanel>
        </TabView>
      </div>
    </Dialog>
  );
};

export default ThemeCustomizer;