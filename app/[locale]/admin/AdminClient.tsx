'use client'
import { useEffect, useState, useCallback } from 'react'

type Review = {
  id: string
  agency_name: string
  rating: number
  comment: string | null
  flags: string[]
  nationality: string | null
  sector: string | null
  created_at: string
  submitted_by: string | null
}
type Suggestion = {
  id: string
  content: string
  user_id: string
  created_at: string
}
type WaitlistEntry = {
  id: string
  email: string
  fuente: string | null
  created_at: string
}
type B2BLead = {
  id: string
  nombre: string
  empresa: string
  email: string
  tipo_interes: string | null
  estado: string
  created_at: string
}
type Referral = {
  id: string
  referrer_id: string
  referred_id: string
  created_at: string
}
type UserProfile = {
  id: string
  email: string | null
  name: string | null
  city: string | null
  nationality: string | null
  created_at: string
  last_ett: string | null
  ett_names: string | null
  working_with_ett: string | null
}
type AdminData = {
  reviews: Review[]
  suggestions: Suggestion[]
  waitlist: WaitlistEntry[]
  b2b_leads: B2BLead[]
  referrals: Referral[]
  users: UserProfile[]
}

const TABS = ['Usuarios', 'Reviews', 'Sugerencias', 'Waitlist', 'B2B Leads', 'Referrals'] as const
type Tab = typeof TABS[number]

const B2B_ESTADOS = ['nuevo', 'contactado', 'descartado', 'cliente']

function fmt(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}

function Stars({ n }: { n: number }) {
  return (
    <span style={{ color: '#f59e0b', fontSize: '0.85rem' }}>
      {'★'.repeat(n)}{'☆'.repeat(5 - n)}
    </span>
  )
}

function Badge({ n }: { n: number }) {
  if (!n) return null
  return (
    <span style={{
      background: '#f97316',
      color: '#fff',
      borderRadius: 10,
      padding: '1px 7px',
      fontSize: '0.72rem',
      fontWeight: 700,
      marginLeft: 6,
    }}>{n}</span>
  )
}

function DeleteBtn({ onDelete }: { onDelete: () => Promise<void> }) {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  async function handle() {
    if (!confirm('¿Eliminar este elemento?')) return
    setLoading(true)
    await onDelete()
    setDone(true)
    setLoading(false)
  }
  if (done) return <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>eliminado</span>
  return (
    <button
      onClick={handle}
      disabled={loading}
      style={{
        background: 'none',
        border: '1px solid #ef4444',
        color: '#ef4444',
        borderRadius: 6,
        padding: '3px 10px',
        fontSize: '0.75rem',
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.5 : 1,
      }}
    >
      {loading ? '...' : 'Eliminar'}
    </button>
  )
}

export default function AdminClient({ locale, adminName }: { locale: string; adminName: string }) {
  const [activeTab, setActiveTab] = useState<Tab>('Usuarios')
  const [data, setData] = useState<AdminData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [reviewFilter, setReviewFilter] = useState<'all' | 'platform' | 'external'>('all')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin')
      if (!res.ok) throw new Error('No autorizado')
      setData(await res.json())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error cargando datos')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function deleteItem(resource: string, id: string) {
    const res = await fetch(`/api/admin/${resource}/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Error al eliminar')
    await load()
  }

  async function updateB2B(id: string, estado: string) {
    await fetch(`/api/admin/b2b_leads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado }),
    })
    await load()
  }

  function copyWaitlistEmails() {
    if (!data) return
    const emails = data.waitlist.map(w => w.email).join('\n')
    navigator.clipboard.writeText(emails).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const cell: React.CSSProperties = {
    padding: '10px 12px',
    borderBottom: '1px solid var(--border-subtle)',
    fontSize: '0.82rem',
    color: 'var(--text)',
    verticalAlign: 'top',
  }
  const th: React.CSSProperties = {
    ...cell,
    color: 'var(--text-muted)',
    fontWeight: 600,
    fontSize: '0.75rem',
    background: 'var(--bg-input)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', padding: '32px 20px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <div>
            <h1 style={{ color: 'var(--text)', fontWeight: 800, fontSize: '1.4rem', margin: 0 }}>
              Panel Admin
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: '4px 0 0' }}>
              {adminName}
            </p>
          </div>
          <a
            href={`/${locale}/dashboard`}
            style={{ color: '#2dd4bf', fontSize: '0.82rem', textDecoration: 'none', fontWeight: 600 }}
          >
            ← Dashboard
          </a>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20, flexWrap: 'wrap' }}>
          {TABS.map(tab => {
            const counts: Record<Tab, number> = {
              'Usuarios': data?.users.length ?? 0,
              'Reviews': data?.reviews.length ?? 0,
              'Sugerencias': data?.suggestions.length ?? 0,
              'Waitlist': data?.waitlist.length ?? 0,
              'B2B Leads': data?.b2b_leads.length ?? 0,
              'Referrals': data?.referrals.length ?? 0,
            }
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  background: activeTab === tab ? '#f97316' : 'var(--bg-card)',
                  color: activeTab === tab ? '#fff' : 'var(--text-muted)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  padding: '7px 14px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {tab}
                <Badge n={counts[tab]} />
              </button>
            )
          })}
        </div>

        {/* Content */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
          {loading && (
            <p style={{ color: 'var(--text-muted)', padding: 24, textAlign: 'center' }}>Cargando...</p>
          )}
          {error && (
            <p style={{ color: '#ef4444', padding: 24, textAlign: 'center' }}>{error}</p>
          )}

          {!loading && !error && data && (
            <>
              {/* USUARIOS */}
              {activeTab === 'Usuarios' && (
                <div style={{ overflowX: 'auto' }}>
                  {data.users.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', padding: 24 }}>Sin usuarios.</p>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr>
                          {['Nombre', 'Email', 'ETTs declaradas', '¿Trabaja con ETT?', 'Última reseñada', 'Ciudad', 'Origen', 'Registro'].map(h => (
                            <th key={h} style={th}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {data.users.map(u => {
                          const ettStatus: Record<string, { label: string; bg: string; color: string }> = {
                            yes:   { label: 'Sí, actualmente', bg: '#0d2d1a', color: '#22c55e' },
                            no:    { label: 'Ya no',           bg: '#2d1a0d', color: '#f97316' },
                            never: { label: 'Nunca',           bg: '#1a1a2d', color: '#818cf8' },
                          }
                          const st = u.working_with_ett ? ettStatus[u.working_with_ett] : null
                          return (
                            <tr key={u.id}>
                              <td style={{ ...cell, fontWeight: 600 }}>{u.name ?? <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Sin nombre</span>}</td>
                              <td style={cell}>{u.email ?? '—'}</td>
                              <td style={{ ...cell, maxWidth: 180 }}>
                                {u.ett_names ? (
                                  <span style={{ fontSize: '0.8rem' }}>{u.ett_names}</span>
                                ) : (
                                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>—</span>
                                )}
                              </td>
                              <td style={cell}>
                                {st ? (
                                  <span style={{ background: st.bg, color: st.color, borderRadius: 5, padding: '2px 8px', fontSize: '0.72rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
                                    {st.label}
                                  </span>
                                ) : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                              </td>
                              <td style={cell}>
                                {u.last_ett ? (
                                  <span style={{ background: '#0d2d1a', color: '#22c55e', borderRadius: 5, padding: '2px 9px', fontSize: '0.72rem', fontWeight: 600 }}>
                                    {u.last_ett}
                                  </span>
                                ) : (
                                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Sin reseñas</span>
                                )}
                              </td>
                              <td style={cell}>{u.city ?? '—'}</td>
                              <td style={cell}>{u.nationality ?? '—'}</td>
                              <td style={{ ...cell, whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>{fmt(u.created_at)}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {/* REVIEWS */}
              {activeTab === 'Reviews' && (
                <div>
                  {/* Filtro origen */}
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginRight: 4 }}>Origen:</span>
                    {(['all', 'platform', 'external'] as const).map(f => {
                      const labels = { all: 'Todas', platform: '✦ Plataforma', external: '↓ Importadas' }
                      const counts = {
                        all: data.reviews.length,
                        platform: data.reviews.filter(r => r.submitted_by).length,
                        external: data.reviews.filter(r => !r.submitted_by).length,
                      }
                      return (
                        <button
                          key={f}
                          onClick={() => setReviewFilter(f)}
                          style={{
                            background: reviewFilter === f ? (f === 'platform' ? '#0d2d1a' : f === 'external' ? '#1a1a2d' : 'var(--bg-input)') : 'transparent',
                            color: reviewFilter === f ? (f === 'platform' ? '#22c55e' : f === 'external' ? '#818cf8' : 'var(--text)') : 'var(--text-muted)',
                            border: `1px solid ${reviewFilter === f ? (f === 'platform' ? '#22c55e40' : f === 'external' ? '#818cf840' : 'var(--border)') : 'var(--border-subtle)'}`,
                            borderRadius: 6,
                            padding: '4px 10px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          {labels[f]} ({counts[f]})
                        </button>
                      )
                    })}
                  </div>
                  {/* Tabla */}
                  <div style={{ overflowX: 'auto' }}>
                    {data.reviews.length === 0 ? (
                      <p style={{ color: 'var(--text-muted)', padding: 24 }}>Sin reviews.</p>
                    ) : (
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr>
                            {['Origen', 'ETT', 'Rating', 'Comentario', 'Flags', 'Nac.', 'Sector', 'Fecha', ''].map(h => (
                              <th key={h} style={th}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {data.reviews
                            .filter(r => reviewFilter === 'all' || (reviewFilter === 'platform' ? !!r.submitted_by : !r.submitted_by))
                            .map(r => (
                              <tr key={r.id}>
                                <td style={cell}>
                                  {r.submitted_by ? (
                                    <span style={{ background: '#0d2d1a', color: '#22c55e', borderRadius: 5, padding: '2px 8px', fontSize: '0.68rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
                                      ✦ Plataforma
                                    </span>
                                  ) : (
                                    <span style={{ background: '#1a1a2d', color: '#818cf8', borderRadius: 5, padding: '2px 8px', fontSize: '0.68rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
                                      ↓ Importada
                                    </span>
                                  )}
                                </td>
                                <td style={{ ...cell, fontWeight: 600, maxWidth: 140 }}>{r.agency_name}</td>
                                <td style={cell}><Stars n={r.rating} /></td>
                                <td style={{ ...cell, maxWidth: 240 }}>
                                  <span title={r.comment ?? ''} style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                    {r.comment ?? <span style={{ color: 'var(--text-muted)' }}>—</span>}
                                  </span>
                                </td>
                                <td style={{ ...cell, maxWidth: 120 }}>
                                  {r.flags?.length ? (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                                      {r.flags.map((f: string) => (
                                        <span key={f} style={{ background: '#fef3c7', color: '#92400e', borderRadius: 4, padding: '1px 5px', fontSize: '0.7rem' }}>{f}</span>
                                      ))}
                                    </div>
                                  ) : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                                </td>
                                <td style={cell}>{r.nationality ?? '—'}</td>
                                <td style={cell}>{r.sector ?? '—'}</td>
                                <td style={{ ...cell, whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>{fmt(r.created_at)}</td>
                                <td style={cell}>
                                  <DeleteBtn onDelete={() => deleteItem('reviews', r.id)} />
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}

              {/* SUGGESTIONS */}
              {activeTab === 'Sugerencias' && (
                <div style={{ overflowX: 'auto' }}>
                  {data.suggestions.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', padding: 24 }}>Sin sugerencias.</p>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr>
                          {['Contenido', 'Fecha', ''].map(h => (
                            <th key={h} style={th}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {data.suggestions.map(s => (
                          <tr key={s.id}>
                            <td style={{ ...cell, maxWidth: 600 }}>{s.content}</td>
                            <td style={{ ...cell, whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>{fmt(s.created_at)}</td>
                            <td style={cell}>
                              <DeleteBtn onDelete={() => deleteItem('suggestions', s.id)} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {/* WAITLIST */}
              {activeTab === 'Waitlist' && (
                <div>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                      {data.waitlist.length} emails registrados
                    </span>
                    <button
                      onClick={copyWaitlistEmails}
                      style={{
                        background: copied ? '#22c55e' : 'var(--bg-input)',
                        color: copied ? '#fff' : 'var(--text)',
                        border: '1px solid var(--border)',
                        borderRadius: 7,
                        padding: '5px 12px',
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        fontWeight: 600,
                      }}
                    >
                      {copied ? '✓ Copiado' : 'Copiar todos los emails'}
                    </button>
                  </div>
                  {data.waitlist.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', padding: 24 }}>Sin entradas.</p>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr>
                            {['Email', 'Fuente', 'Fecha', ''].map(h => (
                              <th key={h} style={th}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {data.waitlist.map(w => (
                            <tr key={w.id}>
                              <td style={{ ...cell, fontWeight: 500 }}>{w.email}</td>
                              <td style={cell}>{w.fuente ?? '—'}</td>
                              <td style={{ ...cell, whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>{fmt(w.created_at)}</td>
                              <td style={cell}>
                                <DeleteBtn onDelete={() => deleteItem('waitlist', w.id)} />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* B2B LEADS */}
              {activeTab === 'B2B Leads' && (
                <div style={{ overflowX: 'auto' }}>
                  {data.b2b_leads.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', padding: 24 }}>Sin leads.</p>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr>
                          {['Nombre', 'Empresa', 'Email', 'Interés', 'Estado', 'Fecha', ''].map(h => (
                            <th key={h} style={th}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {data.b2b_leads.map(l => (
                          <tr key={l.id}>
                            <td style={{ ...cell, fontWeight: 500 }}>{l.nombre}</td>
                            <td style={cell}>{l.empresa}</td>
                            <td style={cell}>
                              <a href={`mailto:${l.email}`} style={{ color: '#2dd4bf', textDecoration: 'none' }}>{l.email}</a>
                            </td>
                            <td style={cell}>{l.tipo_interes ?? '—'}</td>
                            <td style={cell}>
                              <select
                                value={l.estado}
                                onChange={e => updateB2B(l.id, e.target.value)}
                                style={{
                                  background: 'var(--bg-input)',
                                  color: 'var(--text)',
                                  border: '1px solid var(--border-subtle)',
                                  borderRadius: 6,
                                  padding: '3px 6px',
                                  fontSize: '0.78rem',
                                  cursor: 'pointer',
                                }}
                              >
                                {B2B_ESTADOS.map(e => (
                                  <option key={e} value={e}>{e}</option>
                                ))}
                              </select>
                            </td>
                            <td style={{ ...cell, whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>{fmt(l.created_at)}</td>
                            <td style={cell}>
                              <DeleteBtn onDelete={() => deleteItem('b2b_leads', l.id)} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {/* REFERRALS */}
              {activeTab === 'Referrals' && (
                <div style={{ overflowX: 'auto' }}>
                  {data.referrals.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', padding: 24 }}>Sin referrals.</p>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr>
                          {['Referrer ID', 'Referred ID', 'Fecha'].map(h => (
                            <th key={h} style={th}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {data.referrals.map(r => (
                          <tr key={r.id}>
                            <td style={{ ...cell, fontFamily: 'monospace', fontSize: '0.75rem' }}>{r.referrer_id}</td>
                            <td style={{ ...cell, fontFamily: 'monospace', fontSize: '0.75rem' }}>{r.referred_id}</td>
                            <td style={{ ...cell, whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>{fmt(r.created_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  )
}
