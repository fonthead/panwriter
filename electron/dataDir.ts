import { readFile, writeFile } from 'fs/promises'
import * as jsYaml from 'js-yaml'
import { app } from 'electron'
import { basename, sep } from 'path'
import { Meta } from '../src/appState/AppState'

export const dataDir = [app.getPath('appData'), 'PanWriterUserData', ''].join(sep)

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
    console.warn("Error loading or parsing YAML file." + (e as Error).message)
    return [ undefined, fileName ]
  }
}

export const writeDataDirFile = async (fileName: string, data: any): Promise<void> => {
  try {
    // make sure only PanWriterUserData directory can be accessed
    fileName = dataDir + basename(fileName)
    const str = jsYaml.dump(data)
    await writeFile(fileName, str, 'utf8')
  } catch (e) {
    console.warn("Error writing YAML file." + (e as Error).message)
  }
}
