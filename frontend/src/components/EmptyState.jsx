// EmptyState — shown when no opportunities exist

function DocumentIcon() {
  return (
    <svg width="44" height="54" viewBox="0 0 44 54" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Main document */}
      <rect x="2" y="2" width="36" height="46" rx="3" stroke="#DDD6C7" strokeWidth="1.5" fill="#FFFDF8"/>
      {/* Folded corner */}
      <path d="M28 2L38 12H28V2Z" fill="#F7F3EC" stroke="#DDD6C7" strokeWidth="1.5" strokeLinejoin="round"/>
      {/* Lines (highlight yellow) */}
      <rect x="8" y="20" width="22" height="2.5" rx="1.2" fill="#F4E3A1"/>
      <rect x="8" y="26" width="16" height="2" rx="1" fill="#DDD6C7"/>
      <rect x="8" y="31" width="19" height="2" rx="1" fill="#DDD6C7"/>
    </svg>
  );
}

export default function EmptyState({ onAdd, onLoadDemo, loadingDemo }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <DocumentIcon />
      </div>

      <h2 className="empty-state-heading">
        Your career search <em>starts here.</em>
      </h2>

      <p className="empty-state-sub">
        Save your <em>first</em> opportunity and keep your{' '}
        <span className="es-highlight">application journey</span> organised.
      </p>

      <div className="empty-state-cta">
        <button className="btn btn-primary" onClick={onAdd} style={{ padding: '10px 22px', fontSize: '14px' }}>
          Add your first opportunity
        </button>
        <span className="empty-state-reassurance">
          Takes under a minute.{' '}
          <em>You can edit</em>{' '}
          <span className="es-highlight">everything</span> later.
        </span>
      </div>

      <div className="empty-state-workflow">
        <span className="empty-state-workflow-step">01 Save</span>
        <span className="empty-state-workflow-sep" />
        <span className="empty-state-workflow-step">02 Apply</span>
        <span className="empty-state-workflow-sep" />
        <span className="empty-state-workflow-step">03 Track</span>
      </div>

      <button
        className="empty-state-demo"
        onClick={onLoadDemo}
        disabled={loadingDemo}
      >
        {loadingDemo ? 'Loading demo records…' : 'Load demo records'}
      </button>
    </div>
  );
}
