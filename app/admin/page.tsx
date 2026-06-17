'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface Department {
  id: string; department: string; number_of_groups: number;
  rep_name: string; rep_email: string; rep_phone: string; created_at: string;
}
interface Submission {
  id: string; group_number: number; project_name: string;
  leader_name: string; leader_email: string; leader_phone: string;
  github_link: string; members: string[]; notes: string;
  submitted_at: string; department: string;
}

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'cos102admin'

type Tab = 'overview' | 'departments' | 'submissions'

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [pw, setPw] = useState('')
  const [tab, setTab] = useState<Tab>('overview')
  const [departments, setDepartments] = useState<Department[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [filterDept, setFilterDept] = useState('')

  const login = () => {
    if (pw === ADMIN_PASSWORD) { setAuthed(true); loadData() }
    else toast.error('Incorrect password')
  }

  const loadData = async () => {
    setLoading(true)
    try {
      const [dRes, sRes] = await Promise.all([
        fetch('/api/admin?type=departments'),
        fetch('/api/admin?type=submissions'),
      ])
      const dData = await dRes.json()
      const sData = await sRes.json()
      setDepartments(dData.departments || [])
      setSubmissions(sData.submissions || [])
    } catch {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const deleteSubmission = async (id: string) => {
    if (!confirm('Delete this submission?')) return
    try {
      await fetch(`/api/admin?type=submission&id=${id}`, { method: 'DELETE' })
      setSubmissions(prev => prev.filter(s => s.id !== id))
      toast.success('Deleted')
    } catch { toast.error('Failed') }
  }

  const deleteDepartment = async (id: string) => {
    if (!confirm('Delete this department and all its groups/submissions?')) return
    try {
      await fetch(`/api/admin?type=department&id=${id}`, { method: 'DELETE' })
      setDepartments(prev => prev.filter(d => d.id !== id))
      toast.success('Deleted')
    } catch { toast.error('Failed') }
  }

  const exportCSV = () => {
    const rows = [
      ['Department', 'Group', 'Project Name', 'Leader', 'Leader Email', 'Members', 'GitHub', 'Notes', 'Submitted At'],
      ...filteredSubmissions.map(s => [
        s.department, `Group ${s.group_number}`, s.project_name,
        s.leader_name, s.leader_email, s.members.join(' | '),
        s.github_link, s.notes || '', new Date(s.submitted_at).toLocaleString()
      ])
    ]
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `cos102-submissions-${Date.now()}.csv`
    a.click(); URL.revokeObjectURL(url)
    toast.success('CSV exported!')
  }

  const filteredSubmissions = submissions.filter(s => {
    const q = search.toLowerCase()
    const matchSearch = !q || s.department.toLowerCase().includes(q) || s.project_name.toLowerCase().includes(q) || s.leader_name.toLowerCase().includes(q)
    const matchDept = !filterDept || s.department === filterDept
    return matchSearch && matchDept
  })

  const uniqueDepts = Array.from(new Set(submissions.map(s => s.department)))

  if (!authed) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ width: '100%', maxWidth: 400, padding: 24 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔐</div>
            <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: -1, marginBottom: 8 }}>Admin Access</h1>
            <p style={{ color: 'var(--text-2)', fontSize: 14 }}>COS 102 Project Hub — Lecturer/Admin Only</p>
          </div>
          <div className="card">
            <label className="label">Admin Password</label>
            <input
              className="input"
              type="password"
              value={pw}
              onChange={e => setPw(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && login()}
              placeholder="Enter admin password..."
              style={{ marginBottom: 16 }}
            />
            <button onClick={login} className="btn btn-primary" style={{ width: '100%' }}>
              Enter Admin Panel →
            </button>
          </div>
          <p style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: 'var(--text-3)' }}>
            <Link href="/" style={{ color: 'var(--violet-light)' }}>← Back to Home</Link>
          </p>
        </div>
      </div>
    )
  }

  const tabs: { id: Tab; icon: string; label: string }[] = [
    { id: 'overview', icon: '📊', label: 'Overview' },
    { id: 'departments', icon: '🏛️', label: 'Departments' },
    { id: 'submissions', icon: '📦', label: 'Submissions' },
  ]

  return (
    <div className="page">
      <nav className="nav">
        <div className="nav-inner">
          <Link href="/" className="nav-logo">
            <div className="nav-logo-icon">🎓</div>
            <span className="nav-logo-text gradient-text">COS 102</span>
          </Link>
          <div className="nav-links">
            <span className="badge badge-violet">Admin Panel</span>
            <button onClick={loadData} className="btn btn-secondary" style={{ fontSize: 12, padding: '6px 12px' }}>
              {loading ? <span className="spinner" /> : '↻'} Refresh
            </button>
            <button onClick={exportCSV} className="btn btn-cyan" style={{ fontSize: 12, padding: '6px 12px' }}>
              ⬇ Export CSV
            </button>
          </div>
        </div>
      </nav>

      <div className="admin-layout">
        {/* Sidebar */}
        <aside className="sidebar">
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 10, fontFamily: 'Syne, sans-serif', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
              Navigation
            </p>
            {tabs.map(t => (
              <div
                key={t.id}
                className={`sidebar-item ${tab === t.id ? 'active' : ''}`}
                onClick={() => setTab(t.id)}
              >
                <span>{t.icon}</span> {t.label}
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20 }}>
            <p style={{ fontSize: 10, fontFamily: 'Syne, sans-serif', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
              Stats
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'Departments', value: departments.length, color: 'var(--violet-light)' },
                { label: 'Submissions', value: submissions.length, color: 'var(--cyan-light)' },
                { label: 'Total Students', value: submissions.reduce((a, s) => a + s.members.length, 0), color: '#6ee7b7' },
              ].map(stat => (
                <div key={stat.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                  <span style={{ color: 'var(--text-3)' }}>{stat.label}</span>
                  <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, color: stat.color }}>{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main style={{ padding: '32px 24px', minWidth: 0 }}>
          {/* Tab nav mobile */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 28, overflowX: 'auto' }}>
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`btn ${tab === t.id ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: 13, padding: '8px 16px', flexShrink: 0 }}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {/* Overview */}
          {tab === 'overview' && (
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: -0.5, marginBottom: 24 }}>Overview</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
                {[
                  { label: 'Registered Depts', value: departments.length, icon: '🏛️', color: 'var(--violet)' },
                  { label: 'Project Submissions', value: submissions.length, icon: '📦', color: 'var(--cyan)' },
                  { label: 'Total Students', value: submissions.reduce((a, s) => a + s.members.length, 0), icon: '👥', color: '#10b981' },
                  { label: 'Unique Projects', value: new Set(submissions.map(s => s.project_name)).size, icon: '💡', color: '#f59e0b' },
                ].map(s => (
                  <div key={s.label} className="stat-card">
                    <div style={{ fontSize: 28, marginBottom: 4 }}>{s.icon}</div>
                    <div className="stat-number" style={{ color: s.color }}>{s.value}</div>
                    <div className="stat-label">{s.label}</div>
                  </div>
                ))}
              </div>

              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Recent Submissions</h3>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Department</th>
                      <th>Group</th>
                      <th>Project</th>
                      <th>Leader</th>
                      <th>Members</th>
                      <th>Submitted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.slice(0, 5).map(s => (
                      <tr key={s.id}>
                        <td><span className="badge badge-violet">{s.department}</span></td>
                        <td>Group {s.group_number}</td>
                        <td style={{ color: 'var(--text)', fontWeight: 500 }}>{s.project_name}</td>
                        <td>{s.leader_name}</td>
                        <td><span className="badge badge-cyan">{s.members.length} members</span></td>
                        <td style={{ whiteSpace: 'nowrap', fontSize: 12, color: 'var(--text-3)' }}>
                          {new Date(s.submitted_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                    {submissions.length === 0 && (
                      <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text-3)' }}>No submissions yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Departments */}
          {tab === 'departments' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: -0.5 }}>Departments</h2>
                <Link href="/register-department" className="btn btn-primary" style={{ fontSize: 13 }}>+ Add Department</Link>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Department</th>
                      <th>Class Rep</th>
                      <th>Rep Email</th>
                      <th>Groups</th>
                      <th>Registered</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departments.map(d => (
                      <tr key={d.id}>
                        <td style={{ color: 'var(--text)', fontWeight: 500 }}>{d.department}</td>
                        <td>{d.rep_name}</td>
                        <td><span className="mono">{d.rep_email}</span></td>
                        <td><span className="badge badge-violet">{d.number_of_groups} groups</span></td>
                        <td style={{ fontSize: 12, color: 'var(--text-3)', whiteSpace: 'nowrap' }}>
                          {new Date(d.created_at).toLocaleDateString()}
                        </td>
                        <td>
                          <button
                            onClick={() => deleteDepartment(d.id)}
                            className="btn btn-danger"
                            style={{ fontSize: 11, padding: '4px 10px' }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    {departments.length === 0 && (
                      <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text-3)' }}>No departments registered yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Submissions */}
          {tab === 'submissions' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: -0.5 }}>
                  Submissions <span style={{ color: 'var(--text-3)', fontSize: 16, fontWeight: 400 }}>({filteredSubmissions.length})</span>
                </h2>
                <button onClick={exportCSV} className="btn btn-cyan" style={{ fontSize: 13 }}>
                  ⬇ Export All as CSV
                </button>
              </div>

              <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
                <input
                  className="input"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search by department, project, leader..."
                  style={{ flex: 1, minWidth: 200 }}
                />
                <select
                  className="input select"
                  value={filterDept}
                  onChange={e => setFilterDept(e.target.value)}
                  style={{ width: 200 }}
                >
                  <option value="">All departments</option>
                  {uniqueDepts.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {filteredSubmissions.map(s => (
                  <div key={s.id} className="card" style={{ position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
                      <div>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                          <span className="badge badge-violet">{s.department}</span>
                          <span className="badge badge-cyan">Group {s.group_number}</span>
                          <span className="badge badge-green">✓ Submitted</span>
                        </div>
                        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{s.project_name}</h3>
                        <p style={{ fontSize: 13, color: 'var(--text-3)' }}>
                          Led by <strong style={{ color: 'var(--text-2)' }}>{s.leader_name}</strong>
                          <span style={{ margin: '0 6px' }}>·</span>
                          <span className="mono">{s.leader_email}</span>
                        </p>
                      </div>
                      <button
                        onClick={() => deleteSubmission(s.id)}
                        className="btn btn-danger"
                        style={{ fontSize: 11, padding: '5px 12px', flexShrink: 0 }}
                      >
                        Delete
                      </button>
                    </div>

                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                      {s.members.map(m => (
                        <span key={m} className="member-tag" style={{ fontSize: 11, padding: '3px 10px' }}>{m}</span>
                      ))}
                    </div>

                    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                      <a
                        href={s.github_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary"
                        style={{ fontSize: 12, padding: '6px 14px' }}
                      >
                        🔗 GitHub →
                      </a>
                      {s.notes && (
                        <p style={{ fontSize: 12, color: 'var(--text-3)', fontStyle: 'italic' }}>
                          Note: {s.notes}
                        </p>
                      )}
                      <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-3)' }}>
                        {new Date(s.submitted_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
                {filteredSubmissions.length === 0 && (
                  <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-3)' }}>
                    <p style={{ fontSize: 32, marginBottom: 12 }}>📭</p>
                    <p>No submissions match your search.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
