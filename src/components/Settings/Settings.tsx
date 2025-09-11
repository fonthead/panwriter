import React from 'react';
import { Settings } from '../../appState/AppState';
import { Action } from '../../appState/Action';
import styles from './Settings.module.css';
import { Button } from '../Button/Button';

interface Props {
  settings: Settings;
  dispatch: React.Dispatch<Action>;
  onClose: () => void;
}

export const SettingsModal: React.FC<Props> = ({ settings, dispatch, onClose }) => {
  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    dispatch({
      type: 'setSetting',
      payload: { key: name as keyof Settings, value: checked },
    });
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>Settings</h2>
        <div>
          <label>
            <input
              type="checkbox"
              name="autoHideTitleBar"
              checked={settings.autoHideTitleBar}
              onChange={handleCheckboxChange}
            />
            Auto-hide title bar on macOS
          </label>
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
