import React, { useState } from 'react';
import { Settings } from '../../appState/AppState';
import { Action } from '../../appState/Action';
import styles from './Settings.module.css';
import { Button } from '../Button/Button';
import { Controlled as CodeMirror } from 'react-codemirror2';
import 'codemirror/mode/css/css';
import 'codemirror/lib/codemirror.css';

interface Props {
  settings: Settings;
  dispatch: React.Dispatch<Action>;
  onClose: () => void;
}

type Category = 'Appearance' | 'Editor' | 'Global CSS';

export const SettingsModal: React.FC<Props> = ({ settings, dispatch, onClose }) => {
  const [activeCategory, setActiveCategory] = useState<Category>('Appearance');

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    dispatch({
      type: 'setSetting',
      payload: { key: name as keyof Settings, value: checked },
    });
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    const isNumber = (event.target as HTMLInputElement).type === 'number';
    dispatch({
      type: 'setSetting',
      payload: { key: name as keyof Settings, value: isNumber ? Number(value) : value },
    });
  };

  const renderCategory = (category: Category) => {
    switch (category) {
      case 'Appearance':
        return (
          <div>
            <h3>Appearance</h3>
            <label>
              <input
                type="checkbox"
                name="autoHideTitleBar"
                checked={settings.autoHideTitleBar}
                onChange={handleCheckboxChange}
              />
              Auto-hide title bar on macOS (requires restart)
            </label>
          </div>
        );
      case 'Editor': {
        const monospacedFonts = [
          'Fira Code',
          'Menlo',
          'Consolas',
          'Courier New',
          'monospace',
        ];

        const handleFontSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
          const font = event.target.value;
          if (font !== 'custom') {
            dispatch({
              type: 'setSetting',
              payload: { key: 'editorFont', value: font },
            });
          }
        };

        const isCustomFont = !monospacedFonts.includes(settings.editorFont);

        return (
          <div>
            <h3>Editor</h3>
            <div className={styles.formGroup}>
              <label htmlFor="editorFont">Font Family</label>
              <div className={styles.fontInputGroup}>
                <select
                  value={isCustomFont ? 'custom' : settings.editorFont}
                  onChange={handleFontSelectChange}
                >
                  {monospacedFonts.map(font => <option key={font} value={font}>{font}</option>)}
                  <option value="custom">Custom</option>
                </select>
                <input
                  type="text"
                  id="editorFont"
                  name="editorFont"
                  value={settings.editorFont}
                  onChange={handleInputChange}
                  placeholder="Enter custom font name"
                />
              </div>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="editorFontSize">Font Size</label>
              <input
                type="number"
                id="editorFontSize"
                name="editorFontSize"
                value={settings.editorFontSize}
                onChange={handleInputChange}
              />
            </div>
          </div>
        );
      }
      case 'Global CSS':
        return (
          <div className={styles.cssEditorContainer}>
            <h3>Global CSS</h3>
            <p className={styles.description}>This CSS will be applied to the preview of all documents, unless the document has its own CSS specified in its metadata.</p>
            <CodeMirror
              value={settings.globalCSS}
              options={{
                mode: 'css',
                theme: 'paper', // Using the same theme as the main editor
                lineNumbers: true,
                lineWrapping: true,
              }}
              onBeforeChange={(_editor, _data, value) => {
                dispatch({ type: 'setSetting', payload: { key: 'globalCSS', value } });
              }}
              className={styles.cssEditor}
            />
          </div>
        );
    }
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>Settings</h2>
        </div>
        <div className={styles.content}>
          <div className={styles.sidebar}>
            <button onClick={() => setActiveCategory('Appearance')} className={activeCategory === 'Appearance' ? styles.active : ''}>Appearance</button>
            <button onClick={() => setActiveCategory('Editor')} className={activeCategory === 'Editor' ? styles.active : ''}>Editor</button>
            <button onClick={() => setActiveCategory('Global CSS')} className={activeCategory === 'Global CSS' ? styles.active : ''}>Global CSS</button>
          </div>
          <div className={styles.main}>
            {renderCategory(activeCategory)}
          </div>
        </div>
        <div className={styles.actions}>
          <Button onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
