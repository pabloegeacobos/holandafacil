'use client'
import { useState, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import MissionsPanel from '@/components/MissionsPanel'

type Profile = {
  name: string | null
  city: string | null
  nationality: string | null
  created_at: string | null
  avatar_url: string | null
  bio: string | null
  whatsapp: string | null
  years_in_nl: string | null
  job_sector: string | null
  lives_in_nl: string | null
  ett_names: string | null
  working_with_ett: string | null
  bsn: string | null
} | null

function isValidBsn(bsn: string): boolean {
  if (!/^\d{9}$/.test(bsn)) return false
  const d = bsn.split('').map(Number)
  const sum = 9*d[0] + 8*d[1] + 7*d[2] + 6*d[3] + 5*d[4] + 4*d[5] + 3*d[6] + 2*d[7] - d[8]
  return sum > 0 && sum % 11 === 0
}

const SECTORS: Record<string, string> = {
  logistics: 'Logística / almacén',
  food: 'Alimentación',
  cleaning: 'Limpieza',
  construction: 'Construcción',
  services: 'Servicios',
  office: 'Oficina / administración',
  other: 'Otro',
}

const YEARS: Record<string, string> = {
  menos1: 'Menos de 1 año',
  '1a2': '1 a 2 años',
  '2a5': '2 a 5 años',
  mas5: 'Más de 5 años',
}

export default function DashboardClient({
  locale,
  userId,
  email,
  profile,
  isAdmin,
}: {
  locale: string
  userId: string
  email: string
  profile: Profile
  isAdmin?: boolean
}) {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle')

  const [name, setName] = useState(profile?.name ?? '')
  const [city, setCity] = useState(profile?.city ?? '')
  const [nationality, setNationality] = useState(profile?.nationality ?? '')
  const [bio, setBio] = useState(profile?.bio ?? '')
  const [whatsapp, setWhatsapp] = useState(profile?.whatsapp ?? '')
  const [livesInNl, setLivesInNl] = useState(profile?.lives_in_nl ?? '')
  const [yearsInNl, setYearsInNl] = useState(profile?.years_in_nl ?? '')
  const [jobSector, setJobSector] = useState(profile?.job_sector ?? '')
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? '')
  const [avatarTs, setAvatarTs] = useState(() => Date.now())
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [ettNames, setEttNames] = useState(profile?.ett_names ?? '')
  const [workingWithEtt, setWorkingWithEtt] = useState(profile?.working_with_ett ?? '')
  const [bsn, setBsn] = useState('')
  const [bsnSaving, setBsnSaving] = useState(false)
  const [bsnStatus, setBsnStatus] = useState<'idle' | 'saved' | 'error' | 'invalid'>('idle')
  const hasBsn = !!profile?.bsn

  const fileInputRef = useRef<HTMLInputElement>(null)

  const displayName = name || email.split('@')[0]
  const initials = displayName.slice(0, 2).toUpperCase()

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setSaveStatus('error')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setSaveStatus('error')
      return
    }
    setAvatarUploading(true)
    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop()
      const path = `${userId}/avatar.${ext}`
      const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
      if (error) throw error
      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      setAvatarUrl(data.publicUrl)
      setAvatarTs(Date.now())
    } catch {
      setSaveStatus('error')
    } finally {
      setAvatarUploading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    setSaveStatus('idle')
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: name,
          city,
          country_origin: nationality,
          bio,
          whatsapp,
          lives_in_nl: livesInNl || null,
          years_in_nl: livesInNl === 'yes' ? yearsInNl : null,
          job_sector: jobSector,
          avatar_url: avatarUrl,
          ett_names: ettNames || null,
          working_with_ett: workingWithEtt || null,
        }),
      })
      if (!res.ok) throw new Error()
      setSaveStatus('saved')
      setEditing(false)
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch {
      setSaveStatus('error')
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveBsn() {
    const clean = bsn.replace(/\s/g, '')
    if (!isValidBsn(clean)) {
      setBsnStatus('invalid')
      return
    }
    setBsnSaving(true)
    setBsnStatus('idle')
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bsn: clean }),
      })
      if (!res.ok) throw new Error()
      setBsnStatus('saved')
      setBsn('')
      setTimeout(() => setBsnStatus('idle'), 4000)
    } catch {
      setBsnStatus('error')
    } finally {
      setBsnSaving(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'var(--bg-input)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 8,
    padding: '10px 14px',
    color: 'var(--text)',
    fontSize: '0.88rem',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  }

  const selectStyle: React.CSSProperties = { ...inputStyle, cursor: 'pointer' }

  const labelStyle: React.CSSProperties = {
    color: 'var(--text-subtle)',
    fontSize: '0.72rem',
    fontWeight: 700,
    display: 'block',
    marginBottom: 5,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  }

  const valueStyle: React.CSSProperties = {
    color: 'var(--text)',
    fontSize: '0.9rem',
    padding: '6px 0 10px',
    borderBottom: '1px solid var(--border)',
    minHeight: 34,
  }

  const emptyStyle: React.CSSProperties = {
    ...valueStyle,
    color: 'var(--text-dim)',
    fontStyle: 'italic',
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', padding: '40px 24px 80px' }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32 }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div
              onClick={() => editing && fileInputRef.current?.click()}
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: avatarUrl ? 'transparent' : 'linear-gradient(135deg, #2dd4bf, #f97316)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                cursor: editing ? 'pointer' : 'default',
                border: editing ? '2px dashed #2dd4bf' : '2px solid var(--border)',
                flexShrink: 0,
              }}
            >
              {avatarUploading ? (
                <span style={{ color: '#fff', fontSize: '0.7rem' }}>...</span>
              ) : avatarUrl ? (
                <img
                  src={`${avatarUrl}?t=${avatarTs}`}
                  alt="Avatar"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <span style={{ color: '#fff', fontWeight: 900, fontSize: '1.2rem' }}>{initials}</span>
              )}
            </div>
            {editing && (
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: 22,
                  height: 22,
                  background: '#f97316',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '0.7rem',
                }}
              >
                +
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              style={{ display: 'none' }}
            />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ color: '#f97316', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0, marginBottom: 4 }}>
              HolandaFácil
            </p>
            <h1 style={{ color: '#2dd4bf', fontSize: '1.5rem', fontWeight: 900, margin: 0, lineHeight: 1.2 }}>
              Hola, {displayName}
            </h1>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.78rem', marginTop: 4, marginBottom: 0 }}>
              {email}
              {profile?.created_at && (
                <span style={{ marginLeft: 10, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, padding: '2px 8px', fontSize: '0.68rem' }}>
                  Miembro desde {new Date(profile.created_at).toLocaleDateString(locale, { month: 'long', year: 'numeric' })}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Profile card */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 24, marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h2 style={{ color: 'var(--text)', fontSize: '1rem', fontWeight: 700, margin: 0 }}>Mi perfil</h2>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                style={{ background: 'none', border: '1px solid var(--border-subtle)', color: '#2dd4bf', borderRadius: 8, padding: '6px 14px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Editar perfil
              </button>
            ) : (
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => { setEditing(false); setSaveStatus('idle') }}
                  style={{ background: 'none', border: '1px solid var(--border-subtle)', color: 'var(--text-subtle)', borderRadius: 8, padding: '6px 14px', fontSize: '0.78rem', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    background: saving ? 'var(--border-subtle)' : '#f97316',
                    color: saving ? 'var(--text-subtle)' : '#0a0a0f',
                    border: 'none',
                    borderRadius: 8,
                    padding: '6px 18px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: saving ? 'not-allowed' : 'pointer',
                  }}
                >
                  {saving ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            )}
          </div>

          {saveStatus === 'saved' && (
            <p style={{ color: '#22c55e', fontSize: '0.82rem', marginBottom: 16, marginTop: -8 }}>✓ Cambios guardados</p>
          )}
          {saveStatus === 'error' && (
            <p style={{ color: '#ef4444', fontSize: '0.82rem', marginBottom: 16, marginTop: -8 }}>Error al guardar. Inténtalo de nuevo.</p>
          )}

          {editing && (
            <div style={{ background: '#2dd4bf10', border: '1px solid #2dd4bf30', borderRadius: 8, padding: '8px 12px', marginBottom: 20, fontSize: '0.78rem', color: 'var(--text-dim)' }}>
              Haz clic en tu foto para cambiarla · máx. 2MB
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Nombre completo</label>
              {editing ? (
                <input type="text" value={name} onChange={e => setName(e.target.value)} style={inputStyle} placeholder="Tu nombre..." />
              ) : (
                <p style={name ? valueStyle : emptyStyle}>{name || 'Sin rellenar'}</p>
              )}
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Sobre mí</label>
              {editing ? (
                <div>
                  <textarea
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    maxLength={200}
                    rows={3}
                    placeholder="Cuéntanos un poco sobre ti, de dónde vienes, a qué te dedicas..."
                    style={{ ...inputStyle, resize: 'vertical' }}
                  />
                  <p style={{ color: 'var(--text-dim)', fontSize: '0.72rem', textAlign: 'right', marginTop: 4 }}>{bio.length}/200</p>
                </div>
              ) : (
                <p style={bio ? valueStyle : emptyStyle}>{bio || 'Sin rellenar'}</p>
              )}
            </div>

            <div>
              <label style={labelStyle}>País de origen</label>
              {editing ? (
                <input type="text" value={nationality} onChange={e => setNationality(e.target.value)} placeholder="España, México, Perú..." style={inputStyle} />
              ) : (
                <p style={nationality ? valueStyle : emptyStyle}>{nationality || 'Sin rellenar'}</p>
              )}
            </div>

            <div>
              <label style={labelStyle}>¿Vives en Países Bajos?</label>
              {editing ? (
                <select value={livesInNl} onChange={e => { setLivesInNl(e.target.value); if (e.target.value !== 'yes') { setYearsInNl(''); setCity('') } }} style={selectStyle}>
                  <option value="">Seleccionar...</option>
                  <option value="yes">Sí, vivo allí</option>
                  <option value="no">No, todavía no</option>
                  <option value="soon">Voy a mudarme pronto</option>
                </select>
              ) : (
                <p style={livesInNl ? valueStyle : emptyStyle}>
                  {livesInNl === 'yes' ? 'Sí' : livesInNl === 'no' ? 'No' : livesInNl === 'soon' ? 'Pronto' : 'Sin rellenar'}
                </p>
              )}
            </div>

            {livesInNl === 'yes' && (
              <div>
                <label style={labelStyle}>Ciudad en Países Bajos</label>
                {editing ? (
                  <input type="text" value={city} onChange={e => setCity(e.target.value)} placeholder="Amsterdam, Rotterdam..." style={inputStyle} />
                ) : (
                  <p style={city ? valueStyle : emptyStyle}>{city || 'Sin rellenar'}</p>
                )}
              </div>
            )}

            {livesInNl === 'yes' && (
              <div>
                <label style={labelStyle}>Tiempo viviendo allí</label>
                {editing ? (
                  <select value={yearsInNl} onChange={e => setYearsInNl(e.target.value)} style={selectStyle}>
                    <option value="">Seleccionar...</option>
                    {Object.entries(YEARS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                ) : (
                  <p style={yearsInNl ? valueStyle : emptyStyle}>{yearsInNl ? YEARS[yearsInNl] : 'Sin rellenar'}</p>
                )}
              </div>
            )}

            <div>
              <label style={labelStyle}>Sector laboral</label>
              {editing ? (
                <select value={jobSector} onChange={e => setJobSector(e.target.value)} style={selectStyle}>
                  <option value="">Seleccionar...</option>
                  {Object.entries(SECTORS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              ) : (
                <p style={jobSector ? valueStyle : emptyStyle}>{jobSector ? SECTORS[jobSector] : 'Sin rellenar'}</p>
              )}
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>ETTs con las que has trabajado</label>
              {editing ? (
                <div>
                  <input
                    type="text"
                    value={ettNames}
                    onChange={e => setEttNames(e.target.value)}
                    placeholder="Randstad, Tempo-Team, Manpower..."
                    style={inputStyle}
                    maxLength={300}
                  />
                  <p style={{ color: 'var(--text-dim)', fontSize: '0.72rem', marginTop: 4 }}>Separa los nombres con comas</p>
                </div>
              ) : (
                <p style={ettNames ? valueStyle : emptyStyle}>{ettNames || 'Sin rellenar'}</p>
              )}
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>¿Sigues trabajando con una ETT?</label>
              {editing ? (
                <select value={workingWithEtt} onChange={e => setWorkingWithEtt(e.target.value)} style={selectStyle}>
                  <option value="">Seleccionar...</option>
                  <option value="yes">Sí, actualmente trabajo con una ETT</option>
                  <option value="no">No, ya no trabajo con ninguna ETT</option>
                  <option value="never">Nunca he trabajado con una ETT</option>
                </select>
              ) : (
                <p style={workingWithEtt ? valueStyle : emptyStyle}>
                  {workingWithEtt === 'yes' ? 'Sí, actualmente trabajo con una ETT'
                    : workingWithEtt === 'no' ? 'No, ya no trabajo con ninguna ETT'
                    : workingWithEtt === 'never' ? 'Nunca he trabajado con una ETT'
                    : 'Sin rellenar'}
                </p>
              )}
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>WhatsApp <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(opcional)</span></label>
              {editing ? (
                <input type="tel" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="+31 6 12 34 56 78" style={inputStyle} />
              ) : (
                <p style={whatsapp ? valueStyle : emptyStyle}>{whatsapp || 'Sin rellenar'}</p>
              )}
            </div>

          </div>
        </div>

        {/* BSN */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 24, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
            <div style={{ fontSize: '1.4rem', lineHeight: 1, paddingTop: 2 }}>🔒</div>
            <div>
              <h2 style={{ color: 'var(--text)', fontSize: '1rem', fontWeight: 700, margin: 0, marginBottom: 4 }}>
                Verificación BSN <span style={{ fontWeight: 400, fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>· opcional</span>
              </h2>
              <p style={{ color: 'var(--text-subtle)', fontSize: '0.8rem', margin: 0, lineHeight: 1.5 }}>
                Añadir tu BSN ayuda a garantizar que las reviews vienen de personas reales.<br />
                <strong style={{ color: 'var(--text-dim)' }}>Tu número nunca se compartirá con ninguna ETT ni tercero.</strong> Solo nosotros lo vemos, y únicamente para evitar cuentas falsas.
              </p>
            </div>
          </div>

          {(hasBsn && bsnStatus !== 'saved') ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#22c55e12', border: '1px solid #22c55e30', borderRadius: 8 }}>
              <span style={{ color: '#22c55e', fontSize: '0.85rem', fontWeight: 700 }}>✓ BSN registrado</span>
              <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>— tu identidad está verificada</span>
            </div>
          ) : bsnStatus === 'saved' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#22c55e12', border: '1px solid #22c55e30', borderRadius: 8 }}>
              <span style={{ color: '#22c55e', fontSize: '0.85rem', fontWeight: 700 }}>✓ BSN registrado correctamente</span>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  inputMode="numeric"
                  value={bsn}
                  onChange={e => { setBsn(e.target.value.replace(/\D/g, '').slice(0, 9)); setBsnStatus('idle') }}
                  placeholder="9 dígitos"
                  maxLength={9}
                  style={{
                    flex: 1,
                    background: 'var(--bg-input)',
                    border: `1px solid ${bsnStatus === 'invalid' ? '#ef4444' : 'var(--border-subtle)'}`,
                    borderRadius: 8,
                    padding: '10px 14px',
                    color: 'var(--text)',
                    fontSize: '1rem',
                    letterSpacing: '0.15em',
                    outline: 'none',
                    fontFamily: 'monospace',
                  }}
                />
                <button
                  onClick={handleSaveBsn}
                  disabled={bsnSaving || bsn.length !== 9}
                  style={{
                    background: (bsnSaving || bsn.length !== 9) ? 'var(--border-subtle)' : '#2dd4bf',
                    color: (bsnSaving || bsn.length !== 9) ? 'var(--text-subtle)' : '#0a0a0f',
                    border: 'none',
                    borderRadius: 8,
                    padding: '10px 18px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: (bsnSaving || bsn.length !== 9) ? 'not-allowed' : 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {bsnSaving ? 'Guardando...' : 'Verificar'}
                </button>
              </div>
              {bsnStatus === 'invalid' && (
                <p style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: 6, marginBottom: 0 }}>El número no es válido. Comprueba que sean 9 dígitos correctos.</p>
              )}
              {bsnStatus === 'error' && (
                <p style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: 6, marginBottom: 0 }}>Error al guardar. Inténtalo de nuevo.</p>
              )}
              <p style={{ color: 'var(--text-dim)', fontSize: '0.72rem', marginTop: 8, marginBottom: 0 }}>
                El BSN lo encuentras en tu permiso de residencia, contrato de trabajo o carta del municipio.
              </p>
            </div>
          )}
        </div>

        {/* Missions */}
        <MissionsPanel locale={locale} />

        {/* Quick links */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 24, marginBottom: 24 }}>
          <h2 style={{ color: 'var(--text)', fontSize: '1rem', fontWeight: 700, marginBottom: 16, marginTop: 0 }}>Accesos rápidos</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Link
              href={`/${locale}/guias`}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)', textDecoration: 'none', color: 'var(--text-secondary)', fontSize: '0.9rem' }}
            >
              <span>📖 Ver guías prácticas</span>
              <span style={{ color: '#2dd4bf' }}>→</span>
            </Link>
            <Link
              href={`/${locale}/ett`}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)', textDecoration: 'none', color: 'var(--text-secondary)', fontSize: '0.9rem' }}
            >
              <span>⭐ Ver directorio de ETTs</span>
              <span style={{ color: '#2dd4bf' }}>→</span>
            </Link>
            <Link
              href={`/${locale}/tablon`}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: isAdmin ? '1px solid var(--border)' : 'none', textDecoration: 'none', color: 'var(--text-secondary)', fontSize: '0.9rem' }}
            >
              <span>📋 Tablón de anuncios</span>
              <span style={{ color: '#2dd4bf' }}>→</span>
            </Link>
            {isAdmin && (
              <Link
                href={`/${locale}/admin`}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', textDecoration: 'none', fontSize: '0.9rem', color: '#f97316' }}
              >
                <span>⚙️ Panel de administración</span>
                <span style={{ color: '#f97316' }}>→</span>
              </Link>
            )}
          </div>
        </div>

      </div>
    </main>
  )
}
