import { createRef, useEffect, useReducer, useState } from 'react'

import { defaultSettings, AppState } from '../../appState/AppState'
import { appStateReducer } from '../../appState/appStateReducer'

import { Editor } from '../Editor/Editor'
import { MetaEditor } from '../MetaEditor/MetaEditor'
import { Preview } from '../Preview/Preview'
import { Toolbar } from '../Toolbar/Toolbar'
import { IpcApi } from '../../../electron/preload'
import { renderPreview } from '../../renderPreview/renderPreview'

// eslint-disable-next-line import/no-webpack-loader-syntax
import websiteText from '!!raw-loader!../../website.md'

import './App.css'

declare global {
  interface Window {
    ipcApi?: IpcApi; // optional in order to keep ability to run React app without Electron
  }
}

export const App = () => {
  const [state, dispatch] = useReducer(appStateReducer, initialState)
  const [metaEditorTab, setMetaEditorTab] = useState<'metadata' | 'layout' | 'settings'>('metadata')
  window.ipcApi?.setStateAndDispatch(state, dispatch)

  useEffect(() => {
    if (state.split !== 'onlyEditor') {
      renderPreview(state)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.doc, state.split, state.paginated])

  useEffect(() => {
    if (!window.ipcApi) {
      // website-mode
      dispatch({ type: 'setSplitAndRender', split: 'split' })
    }
  }, [])

  const openInspector = (tab: 'metadata' | 'layout' | 'settings') => {
    if (state.metaEditorOpen && metaEditorTab === tab) {
      dispatch({ type: 'toggleMetaEditorOpen' })
    } else {
      setMetaEditorTab(tab)
      if (!state.metaEditorOpen) {
        dispatch({ type: 'toggleMetaEditorOpen' })
      }
    }
  }

  const closeInspector = () => {
    if (state.metaEditorOpen) {
      dispatch({ type: 'toggleMetaEditorOpen' })
    }
  }

  return (
    <div className={`app ${state.split.toLowerCase()} ${state.settings.autoHideTitleBar ? '' : 'no-autohide-title-bar'}`}>
      <Toolbar
        state={state}
        dispatch={dispatch}
        onSettingsClick={() => openInspector('settings')}
        onAction={closeInspector}
      />
      <div className='editor'>
        {state.metaEditorOpen
          ? <MetaEditor state={state} dispatch={dispatch} initialTab={metaEditorTab} />
          : null}
        <Editor state={state} dispatch={dispatch} />
      </div>
      <Preview
        ref={state.previewDivRef}
        paginated={state.paginated}
      />
    </div>
  );
}

const initialState: AppState = {
  doc: {
    md: window.ipcApi ? '' : websiteText
    , yaml: ''
    , bodyMd: ''
    , meta: {}
    , html: ''
    , fileName: 'Untitled'
    , filePath: undefined
    , fileDirty: false
  }
  , metaEditorOpen: false
  , settings: defaultSettings
  , split: 'onlyEditor'
  , paginated: false
  , previewDivRef: createRef()
}
