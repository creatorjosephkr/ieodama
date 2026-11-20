import React from 'react'

const Footer: React.FC = () => {
  return (
    <footer style={styles.footer}>
      <p style={styles.copyright}>
        Copyright © 2026 CREATOR JOSEPH (creatorjoseph@kakao.com)
      </p>
    </footer>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  footer: {
    height: '30px',
    backgroundColor: '#f8f9fa',
    borderTop: '1px solid #e9ecef',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  copyright: {
    fontSize: '10px',
    color: '#6c757d',
  },
}

export default Footer
