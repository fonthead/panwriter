import { AppState, viewSplits } from '../../appState/AppState'
import { Action } from '../../appState/Action'
import { Button } from '../Button/Button'

import macCloseIcon from './macOS_window_close.svg'
import macMaximizeIcon from './macOS_window_maximize.svg'
import macMinimizeIcon from './macOS_window_minimize.svg'
// icons are based on https://material.io/tools/icons/
import notes from './notes.svg'
import page from './page.svg'
import verticalSplit from './vertical_split.svg'
import visibility from './visibility.svg'
import settingsIcon from './settings.svg'
import './Toolbar.css'

interface Props {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  onSettingsClick: () => void;
  onAction?: () => void;
}

export const Toolbar = (props: Props) => {
  const { state, dispatch, onSettingsClick, onAction } = props
  const { doc, split, paginated } = state
  const { fileName, fileDirty } = doc
  return (
    <div className='toolbar'>
      <div className='toolbararea'>
        <div className='windowbuttons'>
          {(['close', 'minimize', 'maximize'] as const).map(action =>
            <div key={action} onClick={() => window.ipcApi?.send[action]()}>
              <img alt={action} src={macIcons[action]} />
            </div>)}
        </div>
        <div className='leftbtns'>
        </div>
        <div className='filename'>
          <span>{fileName}</span>
          {fileDirty
            ? <span className='edited'> — Edited</span>
            : null}
        </div>
        <div className='btns'>
          <div>
            <Button onClick={onSettingsClick}>
              <img alt='Settings' src={settingsIcon} />
            </Button>
          </div>
          <div>
            {split !== 'onlyEditor'
              ? <Button
                active={paginated}
                onClick={() => { dispatch({ type: 'togglePaginated' }); if (onAction) onAction(); }}
              >
                <img alt='Paginated' src={page} />
              </Button>
              : null}
          </div>
          <div className='btngroup'>
            {viewSplits.map(s =>
              <Button
                key={s}
                active={s === split}
                onClick={() => { dispatch({ type: 'setSplitAndRender', split: s }); if (onAction) onAction(); }}
              >
                <img alt={s} src={splitIcons[s]} />
              </Button>)}
          </div>
        </div>
      </div>
    </div>
  )
}

const macIcons = {
  close: macCloseIcon
  , maximize: macMaximizeIcon
  , minimize: macMinimizeIcon
}

const splitIcons = {
  onlyEditor: notes
  , split: verticalSplit
  , onlyPreview: visibility
}
