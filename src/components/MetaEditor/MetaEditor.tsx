import { Fragment, useState } from 'react'
import { AppState, Settings } from '../../appState/AppState'
import { Action } from '../../appState/Action'
import { defaultVars, stripSurroundingStyleTags } from '../../renderPreview/templates/getCss'
import { ColorPicker } from '../ColorPicker/ColorPicker'

import back from './back.svg'
import './MetaEditor.css'

type Kv = StringKv | TextareaKv | NumberKv | SelectKv | ColorKv;

interface BaseKv {
  name: string;
  label: string;
  placeholder?: string;
  onLoad?: (v: string) => string;
  onDone?: (v: string) => string;
}

interface StringKv extends BaseKv {
  type: 'string';
}
interface TextareaKv extends BaseKv {
  type: 'textarea';
}
interface NumberKv extends BaseKv {
  type: 'number';
  step: number;
}
interface SelectKv extends BaseKv {
  type: 'select';
  options: string[];
}
interface ColorKv extends BaseKv {
  type: 'color';
}

interface Props {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  initialTab?: 'metadata' | 'layout' | 'settings';
}

export const MetaEditor = (props: Props) => {
  const { state, dispatch, initialTab = 'metadata' } = props
  const { doc, settings } = state
  const [activeTab, setActiveTab] = useState(initialTab)

  const renderKv = (kv: Kv) =>
    <Fragment key={kv.name}>
      <label htmlFor={kv.name}>
        {kv.label}
      </label>
      {renderInput(kv)}
    </Fragment>

  const renderInput = (kv: Kv): JSX.Element => {
    const { onLoad, onDone, placeholder } = kv
    const key = kv.name
    const val = doc.meta[key]?.toString() || defaultVars[key] || ''
    const value = onLoad ? onLoad(val) : val
    const onChange = (
      e: string | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
      const v = typeof e === 'string' ? e : e.target.value
      dispatch({ type: 'setMetaAndRender', key, value: onDone ? onDone(v) : v })
    }
    const common = { id: kv.name, placeholder, value, onChange }
    switch (kv.type) {
      case 'string': return <input    {...common} type='text' />
      case 'textarea': return <textarea {...common} />
      case 'number': return <input    {...common} type='number' step={kv.step} />
      case 'select': return <select   {...common}>{kv.options.map(renderOption)}</select>
      case 'color': return <ColorPicker {...common} />
    }
  }

  const handleSettingChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    dispatch({
      type: 'setSetting',
      payload: { key: name as keyof Settings, value: checked },
    });
  };

  return (
    <div className='metaeditor'>
      <div className='sidebar'>
        <button
          className='backbtn'
          onClick={() => {
            dispatch({ type: 'closeMetaEditorAndSetMd' })
            dispatch({ type: 'toggleMetaEditorOpen' })
          }}
          title="Back to Editor"
        >
          <img alt='back' src={back} draggable={false} />
        </button>
        <nav>
          <button
            className={activeTab === 'metadata' ? 'active' : ''}
            onClick={() => setActiveTab('metadata')}
          >
            Metadata
          </button>
          <button
            className={activeTab === 'layout' ? 'active' : ''}
            onClick={() => setActiveTab('layout')}
          >
            Layout
          </button>
          <button
            className={activeTab === 'settings' ? 'active' : ''}
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </button>
        </nav>
      </div>

      <div className='inspector-content'>
        {activeTab === 'metadata' && (
          <div className='tab-pane'>
            <h2>Document Metadata</h2>
            <p className='description'>Define the title, author, and other document properties.</p>
            <div className='form-grid'>
              {metaKvs.map(renderKv)}
            </div>
          </div>
        )}

        {activeTab === 'layout' && (
          <div className='tab-pane'>
            <h2>Layout & Style</h2>
            <p className='description'>Customize the appearance of the document preview.</p>
            {state.paginated && (
              <p className='warning'>
                Custom colors might not be visible in paginated mode.
              </p>
            )}
            <div className='form-grid'>
              <label htmlFor="mainfont">Base Font</label>
              {renderInput(layoutKvs.find(k => k.name === 'mainfont') as Kv)}

              <label htmlFor="monofont">Code Font</label>
              {renderInput(layoutKvs.find(k => k.name === 'monofont') as Kv)}

              <label>Base Size / Height</label>
              <div className='input-row'>
                <div className='input-with-unit'>
                  {renderInput(layoutKvs.find(k => k.name === 'fontsize') as Kv)}
                  <span className='unit'>px</span>
                </div>
                <div className='input-with-unit'>
                  {renderInput(layoutKvs.find(k => k.name === 'linestretch') as Kv)}
                  <span className='unit'>lh</span>
                </div>
              </div>

              <h3>Heading Sizes</h3>
              <div className='form-grid full-width'>
                <label>H1 / H2</label>
                <div className='input-row'>
                  <div className='input-with-unit'>
                    {renderInput(layoutKvs.find(k => k.name === 'h1size') as Kv)}
                    <span className='unit'>em</span>
                  </div>
                  <div className='input-with-unit'>
                    {renderInput(layoutKvs.find(k => k.name === 'h2size') as Kv)}
                    <span className='unit'>em</span>
                  </div>
                </div>
                <label>H3 / H4</label>
                <div className='input-row'>
                  <div className='input-with-unit'>
                    {renderInput(layoutKvs.find(k => k.name === 'h3size') as Kv)}
                    <span className='unit'>em</span>
                  </div>
                  <div className='input-with-unit'>
                    {renderInput(layoutKvs.find(k => k.name === 'h4size') as Kv)}
                    <span className='unit'>em</span>
                  </div>
                </div>
                <label>H5 / H6</label>
                <div className='input-row'>
                  <div className='input-with-unit'>
                    {renderInput(layoutKvs.find(k => k.name === 'h5size') as Kv)}
                    <span className='unit'>em</span>
                  </div>
                  <div className='input-with-unit'>
                    {renderInput(layoutKvs.find(k => k.name === 'h6size') as Kv)}
                    <span className='unit'>em</span>
                  </div>
                </div>
              </div>

              {layoutKvs.filter(k => !['mainfont', 'monofont', 'fontsize', 'linestretch', 'h1size', 'h2size', 'h3size', 'h4size', 'h5size', 'h6size'].includes(k.name)).map(renderKv)}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className='tab-pane'>
            <h2>App Settings</h2>
            <p className='description'>Global preferences for PanWriter.</p>
            <div className='settings-list'>
              <label className='checkbox-container'>
                <input
                  type="checkbox"
                  name="autoHideTitleBar"
                  checked={settings.autoHideTitleBar}
                  onChange={handleSettingChange}
                />
                <span className='checkbox-label'>Auto-hide title bar on macOS</span>
              </label>
              <label className='checkbox-container'>
                <input
                  type="checkbox"
                  name="autoUpdateApp"
                  checked={settings.autoUpdateApp}
                  onChange={handleSettingChange}
                />
                <span className='checkbox-label'>Enable automatic updates</span>
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const renderOption = (o: string) =>
  <option key={o} value={o || 'System font, sans-serif'}>{o}</option>

const metaKvs: Kv[] = [{
  name: 'title'
  , label: 'Title'
  , type: 'string'
}, {
  name: 'author'
  , label: 'Author'
  , type: 'string'
}, {
  name: 'date'
  , label: 'Date'
  , type: 'string'
}, {
  name: 'lang'
  , label: 'Language'
  , type: 'string'
  , placeholder: 'en'
}]

const layoutKvs: Kv[] = [{
  name: 'mainfont'
  , label: 'Font'
  , type: 'string'
  , placeholder: 'e.g. Georgia, serif or Inter'
}, {
  name: 'monofont'
  , label: 'Code Font'
  , type: 'string'
  , placeholder: 'e.g. Menlo, Monaco, monospace'
}, {
  name: 'fontsize'
  , label: 'Font size'
  , type: 'number'
  , step: 1
  , onLoad: s => s ? parseInt(s, 10).toString() : ''
  , onDone: s => s + 'px'
}, {
  name: 'linestretch'
  , label: 'Line height'
  , type: 'number'
  , step: 0.1
}, {
  name: 'h1size'
  , label: 'H1 size'
  , type: 'string'
  , placeholder: '2em'
}, {
  name: 'h2size'
  , label: 'H2 size'
  , type: 'string'
  , placeholder: '1.5em'
}, {
  name: 'h3size'
  , label: 'H3 size'
  , type: 'string'
  , placeholder: '1.25em'
}, {
  name: 'h4size'
  , label: 'H4 size'
  , type: 'string'
  , placeholder: '1.1em'
}, {
  name: 'h5size'
  , label: 'H5 size'
  , type: 'string'
  , placeholder: '1em'
}, {
  name: 'h6size'
  , label: 'H6 size'
  , type: 'string'
  , placeholder: '1em'
}, {
  name: 'fontcolor'
  , label: 'Font color'
  , type: 'color'
}, {
  name: 'linkcolor'
  , label: 'Link color'
  , type: 'color'
}, {
  name: 'monobackgroundcolor'
  , label: 'Code bg'
  , type: 'color'
}, {
  name: 'backgroundcolor'
  , label: 'Background'
  , type: 'color'
}, {
  name: 'header-includes'
  , label: 'Include CSS'
  , type: 'textarea'
  , onLoad: stripSurroundingStyleTags
  , onDone: s => `<style>\n${s}\n</style>`
  , placeholder: `blockquote {
  font-style: italic;
}`
}]

