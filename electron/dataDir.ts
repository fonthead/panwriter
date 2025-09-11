import { readFile, writeFile, mkdir } from 'fs/promises'
import * as jsYaml from 'js-yaml'
import { app } from 'electron'
import { basename, sep } from 'path'
import { Meta } from '../src/appState/AppState'

export const dataDir = [app.getPath('appData'), 'PanWriter', ''].join(sep)

/**
 * reads the right default yaml file
 *
 * make sure this function is safe to expose in `preload.ts`
 */
export const readDataDirFile = async (fileName: string): Promise<[Meta | undefined, string]> => {
  try {
    // make sure only PanWriterUserData directory can be accessed
    fileName = dataDir + basename(fileName)

    const str = await readFile(fileName, 'utf8')
    const yaml = jsYaml.load(str)
    return [
      typeof yaml === 'object' ? (yaml as Meta) : {},
      fileName
    ]
  } catch(e) {
    const error = e as NodeJS.ErrnoException
    
    // If file doesn't exist, return empty object silently (this is expected on first run)
    if (error.code === 'ENOENT') {
      return [ {}, fileName ]
    }
    
    // For other errors (like parsing errors), still log the warning
    console.warn("Error loading or parsing YAML file: " + error.message)
    return [ undefined, fileName ]
  }
}

export const writeDataDirFile = async (fileName: string, data: any): Promise<void> => {
  try {
    // make sure only PanWriterUserData directory can be accessed
    fileName = dataDir + basename(fileName)
    
    // Ensure the data directory exists
    await mkdir(dataDir, { recursive: true })
    
    const str = jsYaml.dump(data)
    await writeFile(fileName, str, 'utf8')
  } catch (e) {
    console.warn("Error writing YAML file." + (e as Error).message)
  }
}
