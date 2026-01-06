import { defaultSettings, Meta, Settings } from '../src/appState/AppState'
import { readDataDirFile, writeDataDirFile } from './dataDir'

export const saveSettings = async (settings: Settings) => {
  await writeDataDirFile('settings.yaml', settings)
}

export const loadSettings = async (): Promise<Settings> => {
  const [data] = await readDataDirFile('settings.yaml')
  return parseSettings(data)
}

const parseSettings = (data: Record<string, unknown> = {}): Settings => {
  const { autoUpdateApp, autoHideTitleBar, previewStyles } = data
  return {
    autoUpdateApp: autoUpdateApp === undefined ? defaultSettings.autoUpdateApp : !!autoUpdateApp,
    autoHideTitleBar: autoHideTitleBar === undefined ? defaultSettings.autoHideTitleBar : !!autoHideTitleBar,
    previewStyles: (previewStyles as Meta) || defaultSettings.previewStyles
  }
}
