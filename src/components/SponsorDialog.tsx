import React, { useEffect, useRef } from 'react'
import sponIcon from '../../spon/spon.svg'
import kakaoBankImg from '../../spon/kakaobank.png'
import paypalImg from '../../spon/paypal.png'

interface SponsorDialogProps {
  onClose: () => void
}

const SponsorDialog: React.FC<SponsorDialogProps> = ({ onClose }) => {
  const isOverlayMouseDownRef = useRef(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const handleMouseDown = (e: React.MouseEvent) => {
    isOverlayMouseDownRef.current = e.target === e.currentTarget
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && isOverlayMouseDownRef.current) {
      onClose()
    }
    isOverlayMouseDownRef.current = false
  }

  return (
    <div style={styles.overlay} onMouseDown={handleMouseDown} onMouseUp={handleMouseUp}>
      <div
        style={styles.dialog}
        onMouseDown={(e) => e.stopPropagation()}
        onMouseUp={(e) => e.stopPropagation()}
      >
        <div style={styles.headerRow}>
          <img src={sponIcon} alt="" style={styles.headerIcon} />
          <h2 style={styles.title}>개발자 후원하기</h2>
        </div>

        <p style={styles.subtitle}>
          이어담아가 도움이 되셨다면 따뜻한 커피 한 잔으로 응원해 주세요.
        </p>

        <div style={styles.cardGrid}>
          <div style={styles.card}>
            <span style={{ ...styles.badge, ...styles.kakaoBadge }}>카카오뱅크 후원</span>
            <div style={styles.imageFrame}>
              <img
                src={kakaoBankImg}
                alt="카카오뱅크 후원 QR"
                style={styles.kakaoImage}
                draggable={false}
              />
            </div>
            <p style={styles.cardDesc}>QR 코드를 스캔해 후원할 수 있습니다.</p>
          </div>

          <div style={styles.card}>
            <span style={{ ...styles.badge, ...styles.paypalBadge }}>PayPal 후원</span>
            <div style={styles.imageFrame}>
              <img
                src={paypalImg}
                alt="PayPal 후원"
                style={styles.paypalImage}
                draggable={false}
              />
            </div>
            <p style={styles.cardDesc}>PayPal을 통해 후원할 수 있습니다.</p>
          </div>
        </div>

        <div style={styles.buttonGroup}>
          <button type="button" style={styles.closeButton} onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    userSelect: 'none',
  },
  dialog: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '24px',
    width: '90%',
    maxWidth: '460px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    overflow: 'hidden',
  },
  headerRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px',
  },
  headerIcon: {
    width: '22px',
    height: '22px',
    display: 'block',
    filter: 'brightness(0.25)',
  },
  title: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#212529',
  },
  subtitle: {
    fontSize: '13px',
    color: '#6c757d',
    marginBottom: '18px',
    lineHeight: 1.5,
  },
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '14px',
  },
  card: {
    backgroundColor: '#f8f9fa',
    border: '1px solid #e9ecef',
    borderRadius: '10px',
    padding: '14px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
  badge: {
    fontSize: '12px',
    fontWeight: '600',
    padding: '4px 10px',
    borderRadius: '999px',
    marginBottom: '12px',
  },
  kakaoBadge: {
    backgroundColor: '#fee500',
    color: '#3c1e1e',
  },
  paypalBadge: {
    backgroundColor: '#e7f5ff',
    color: '#003087',
  },
  imageFrame: {
    width: '156px',
    height: '156px',
    backgroundColor: '#ffffff',
    border: '1px solid #dee2e6',
    borderRadius: '8px',
    padding: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kakaoImage: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    display: 'block',
  },
  paypalImage: {
    width: '96px',
    height: '96px',
    objectFit: 'contain',
    display: 'block',
  },
  cardDesc: {
    marginTop: '10px',
    fontSize: '12px',
    color: '#495057',
    lineHeight: 1.4,
  },
  buttonGroup: {
    display: 'flex',
    marginTop: '20px',
  },
  closeButton: {
    flex: 1,
    padding: '10px',
    backgroundColor: '#4a90e2',
    border: '1px solid #4a90e2',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#ffffff',
  },
}

export default SponsorDialog
