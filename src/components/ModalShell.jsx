export default function ModalShell({ children, onClose, wide }) {
  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 50, padding: 20,
      }}
    >
      <div style={{
        background: '#FFFFFF', borderRadius: 16,
        width: wide ? 660 : 440, maxWidth: '100%',
        maxHeight: '90vh', overflowY: 'auto',
        padding: '24px 24px 20px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      }}>
        {children}
      </div>
    </div>
  )
}
