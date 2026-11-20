import React from 'react'
import logo from '../assets/image-plus.svg'
import sponIcon from '../../spon/spon.svg'

interface HeaderProps {
  onExport: () => void
  onReset: () => void
  onSponsor: () => void
  onQuit: () => void
  onMinimize?: () => void
  hasImages: boolean
}

type AppRegionStyle = React.CSSProperties & {
  WebkitAppRegion?: 'drag' | 'no-drag'
}

const Header: React.FC<HeaderProps> = ({
  onExport,
  onReset,
  onSponsor,
  onQuit,
  onMinimize,
  hasImages,
}) => {
  const isMac = window.electronAPI?.platform === 'darwin'

  return (
    <header style={styles.header}>
      <div
        style={{
          ...styles.content,
          paddingLeft: isMac ? '84px' : '14px',
        }}
      >
        <div style={styles.titleContainer}>
          <img src={logo} alt="로고" style={styles.logo} />
          <span style={styles.title}>이어담아 - 이미지 이어 붙이기</span>
        </div>
        <div style={styles.buttonGroup}>
          <button
            type="button"
            style={{ ...styles.button, ...styles.resetButton }}
            onClick={onReset}
            disabled={!hasImages}
          >
            <ResetIcon />
            <span>새로시작</span>
          </button>
          <button
            type="button"
            style={{ ...styles.button, ...styles.exportButton }}
            onClick={onExport}
            disabled={!hasImages}
          >
            <ExportIcon />
            <span>내보내기</span>
          </button>
          {!isMac && onMinimize && (
            <button
              type="button"
              style={styles.iconButton}
              onClick={onMinimize}
              title="최소화"
              aria-label="최소화"
            >
              <MinimizeIcon />
            </button>
          )}
          <button
            type="button"
            style={styles.sponsorButton}
            onClick={onSponsor}
            title="개발자 후원하기"
            aria-label="개발자 후원하기"
          >
            <img src={sponIcon} alt="후원" style={styles.sponsorIcon} />
          </button>
          <button type="button" style={styles.button} onClick={onQuit}>
            <CloseIcon />
            <span>종료</span>
          </button>
        </div>
      </div>
    </header>
  )
}

const ResetIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="21 3 21 8 16 8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="3 21 3 16 8 16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const ExportIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="7 10 12 15 17 10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="12" y1="15" x2="12" y2="3" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

const MinimizeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <line x1="5" y1="12" x2="19" y2="12" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <line x1="18" y1="6" x2="6" y2="18" strokeWidth="2" strokeLinecap="round"/>
    <line x1="6" y1="6" x2="18" y2="18" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

const styles: { [key: string]: AppRegionStyle } = {
  header: {
    height: '42px',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e9ecef',
    display: 'flex',
    alignItems: 'center',
    WebkitAppRegion: 'drag',
  },
  content: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: '12px',
    minWidth: 0,
  },
  titleContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    minWidth: 0,
  },
  logo: {
    width: '20px',
    height: '20px',
    flexShrink: 0,
  },
  title: {
    fontSize: '14px',
    color: '#343a40',
    fontWeight: '700',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  buttonGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    flexShrink: 0,
    WebkitAppRegion: 'no-drag',
  },
  button: {
    padding: '4px 10px',
    backgroundColor: '#f1f3f5',
    border: '1px solid #dee2e6',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    color: '#212529',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  iconButton: {
    padding: '4px 7px',
    backgroundColor: '#f1f3f5',
    border: '1px solid #dee2e6',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#212529',
    cursor: 'pointer',
  },
  sponsorButton: {
    padding: '4px 7px',
    backgroundColor: '#fff9db',
    border: '1px solid #ffd43b',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  sponsorIcon: {
    width: '16px',
    height: '16px',
    display: 'block',
    filter: 'brightness(0.25)',
  },
  exportButton: {
    backgroundColor: '#4a90e2',
    color: '#ffffff',
    border: '1px solid #4a90e2',
  },
  resetButton: {
    backgroundColor: '#ffffff',
    color: '#495057',
    border: '1px solid #dee2e6',
  },
}

export default Header
