'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface Member {
  name: string; matric: string;
}
interface Department {
  id: string; department: string; number_of_groups: number;
  rep_name: string; rep_email: string; rep_phone: string; created_at: string;
}
interface GroupInfo {
  id: string; group_number: number; leader_name: string; leader_email: string;
  leader_phone: string; project_name: string; submitted: boolean; created_at: string;
}
interface Submission {
  id: string; group_number: number; project_name: string;
  leader_name: string; leader_email: string; leader_phone: string;
  github_link: string; members: Member[]; notes: string;
  submitted_at: string; department: string;
}

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'cos102admin'

const fmtMembers = (members: any[]): string => {
  return members.map(m => {
    if (typeof m === 'string') return m
    return `${m.name || ''}${m.matric ? ` (${m.matric})` : ''}`
  }).filter(Boolean).join(', ')
}

const fmtMemberChips = (members: any[], render: (name: string, matric: string) => JSX.Element) => {
  return members.map((m, i) => {
    if (typeof m === 'string') return render(m, '')
    return render(m.name || '', m.matric || '')
  })
}

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
  const [expandedDept, setExpandedDept] = useState<string | null>(null)
  const [deptGroups, setDeptGroups] = useState<Record<string, GroupInfo[]>>({})
  const [loadingGroups, setLoadingGroups] = useState(false)
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table')

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

  const loadDeptGroups = async (deptId: string) => {
    if (deptGroups[deptId]) return
    setLoadingGroups(true)
    try {
      const res = await fetch(`/api/register-group?departmentId=${deptId}`)
      const data = await res.json()
      setDeptGroups(prev => ({ ...prev, [deptId]: data.groups || [] }))
    } catch {
      toast.error('Failed to load groups')
    } finally {
      setLoadingGroups(false)
    }
  }

  const toggleDeptExpand = (deptId: string) => {
    if (expandedDept === deptId) {
      setExpandedDept(null)
    } else {
      setExpandedDept(deptId)
      loadDeptGroups(deptId)
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
      setDeptGroups(prev => { const n = { ...prev }; delete n[id]; return n })
      toast.success('Deleted')
    } catch { toast.error('Failed') }
  }

  const exportPDF = () => {
    if (submissions.length === 0) {
      toast.error('No submissions to export')
      return
    }

    const doc = new jsPDF('landscape', 'mm', 'a4')
    const pw = doc.internal.pageSize.getWidth()
    const ph = doc.internal.pageSize.getHeight()

    // ==================== THEME COLORS ====================
    const PURPLE_DARK: [number, number, number] = [40, 20, 80]
    const PURPLE_MID: [number, number, number] = [90, 50, 200]
    const PURPLE_LIGHT: [number, number, number] = [130, 90, 230]
    const CYAN: [number, number, number] = [0, 190, 220]
    const DARK_BG: [number, number, number] = [22, 22, 32]
    const CARD_BG: [number, number, number] = [245, 243, 255]
    const TEXT_MUTED: [number, number, number] = [140, 140, 160]
    const TEXT_DARK: [number, number, number] = [50, 50, 60]

    // ==================== TITLE PAGE ====================
    // Gradient-like background (solid dark purple)
    doc.setFillColor(PURPLE_DARK[0], PURPLE_DARK[1], PURPLE_DARK[2])
    doc.rect(0, 0, pw, ph, 'F')
    // Decorative accent bar
    doc.setFillColor(CYAN[0], CYAN[1], CYAN[2])
    doc.rect(0, ph / 2 - 55, pw, 2, 'F')
    doc.rect(0, ph / 2 + 45, pw, 1, 'F')
    // Title
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(34)
    doc.text('COS-102 Project Hub', pw / 2, ph / 2 - 28, { align: 'center' })
    doc.setFontSize(20)
    doc.setTextColor(CYAN[0], CYAN[1], CYAN[2])
    doc.text('Submissions Report', pw / 2, ph / 2, { align: 'center' })
    doc.setFontSize(12)
    doc.setTextColor(TEXT_MUTED[0], TEXT_MUTED[1], TEXT_MUTED[2])
    doc.text(`Generated: ${new Date().toLocaleString()}`, pw / 2, ph / 2 + 30, { align: 'center' })
    doc.text('Confidential \u2014 Lecturer/Admin Use Only', pw / 2, ph / 2 + 44, { align: 'center' })
    doc.setFontSize(9)
    doc.text('COS 102 \u2014 Computer Science Course Project', pw / 2, ph - 20, { align: 'center' })

    // ==================== EXECUTIVE SUMMARY ====================
    doc.addPage()
    doc.setFillColor(PURPLE_DARK[0], PURPLE_DARK[1], PURPLE_DARK[2])
    doc.rect(0, 0, pw, 28, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(18)
    doc.text('Executive Summary', 16, 19)

    const totalStudents = submissions.reduce((a, s) => a + s.members.length, 0)
    const uniqueProjects = new Set(submissions.map(s => s.project_name)).size
    const grouped = submissions.reduce<Record<string, Submission[]>>((acc, s) => {
      if (!acc[s.department]) acc[s.department] = []
      acc[s.department].push(s)
      return acc
    }, {})
    const deptNames = Object.keys(grouped).sort()

    // Metric cards visual
    const metrics: [string, string, [number, number, number]][] = [
      ['Departments', `${deptNames.length}`, PURPLE_MID],
      ['Submissions', `${submissions.length}`, PURPLE_LIGHT],
      ['Students', `${totalStudents}`, CYAN],
      ['Projects', `${uniqueProjects}`, [240, 180, 50]],
    ]
    const cardW = (pw - 48) / 4
    metrics.forEach(([label, value, color], i) => {
      const x = 16 + i * (cardW + 6)
      doc.setFillColor(CARD_BG[0], CARD_BG[1], CARD_BG[2])
      doc.setDrawColor(color[0], color[1], color[2])
      doc.roundedRect(x, 36, cardW, 32, 3, 3, 'FD')
      doc.setTextColor(color[0], color[1], color[2])
      doc.setFontSize(18)
      doc.text(value as string, x + cardW / 2, 52, { align: 'center' })
      doc.setFontSize(9)
      doc.setTextColor(TEXT_DARK[0], TEXT_DARK[1], TEXT_DARK[2])
      doc.text(label as string, x + cardW / 2, 64, { align: 'center' })
    })

    // Key stats table
    const stats = [
      ['Total Departments Registered', `${departments.length}`],
      ['Departments that Submitted', `${deptNames.length}`],
      ['Total Submissions Received', `${submissions.length}`],
      ['Total Students Enrolled', `${totalStudents}`],
      ['Unique Project Titles', `${uniqueProjects}`],
      ['Average Students / Submission', `${(totalStudents / submissions.length).toFixed(1)}`],
    ]
    autoTable(doc, {
      startY: 80,
      head: [['Key Performance Indicators', 'Value']],
      body: stats,
      theme: 'striped',
      headStyles: { fillColor: PURPLE_MID, fontSize: 12, halign: 'center' },
      bodyStyles: { fontSize: 11 },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 160 }, 1: { halign: 'center', cellWidth: 60 } },
      margin: { left: 16, right: 16 },
      tableLineColor: PURPLE_LIGHT,
      tableLineWidth: 0.5,
    })

    // ==================== STUDENT ROSTER BY DEPARTMENT ====================
    doc.addPage()
    doc.setFillColor(PURPLE_DARK[0], PURPLE_DARK[1], PURPLE_DARK[2])
    doc.rect(0, 0, pw, 28, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(18)
    doc.text('Student Roster by Department', 16, 19)

    let yPos = 36
    let globalCounter = 0

    deptNames.forEach((dept) => {
      const deptSubs = grouped[dept]
      const deptInfo = departments.find(d => d.department === dept)

      // Check if we need a new page (leave room for header + table)
      if (yPos > ph - 60) {
        // Page footer
        doc.setFontSize(8)
        doc.setTextColor(TEXT_MUTED[0], TEXT_MUTED[1], TEXT_MUTED[2])
        doc.text(`COS-102 Project Hub Report \u2014 Page ${(doc as any).getNumberOfPages()}`, pw / 2, ph - 10, { align: 'center' })
        doc.addPage()
        yPos = 16
      }

      // Department section header
      doc.setFillColor(PURPLE_MID[0], PURPLE_MID[1], PURPLE_MID[2])
      doc.roundedRect(12, yPos, pw - 24, 14, 3, 3, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(14)
      doc.text(dept, 20, yPos + 10)
      yPos += 22

      if (deptInfo) {
        doc.setTextColor(TEXT_DARK[0], TEXT_DARK[1], TEXT_DARK[2])
        doc.setFontSize(10)
        doc.text(`Class Rep: ${deptInfo.rep_name}  |  ${deptInfo.rep_email}  |  ${deptInfo.rep_phone || '\u2014'}`, 20, yPos)
        yPos += 10
      }

      // Build expanded student rows for this department
      const studentRows: any[][] = []
      deptSubs.forEach((s) => {
        const members = Array.isArray(s.members) ? s.members : []
        members.forEach((m: any) => {
          globalCounter++
          const name = typeof m === 'string' ? m : (m.name || '')
          const matric = typeof m === 'string' ? '' : (m.matric || '')
          studentRows.push([
            globalCounter,
            name,
            matric,
            `Group ${s.group_number}`,
            s.project_name,
            s.leader_name,
            s.github_link,
            new Date(s.submitted_at).toLocaleDateString(),
          ])
        })
      })

      if (studentRows.length > 0) {
        autoTable(doc, {
          startY: yPos,
          head: [['#', 'Student Name', 'Matric No.', 'Group', 'Project Title', 'Leader', 'GitHub Link', 'Submitted']],
          body: studentRows,
          theme: 'striped',
          headStyles: { fillColor: PURPLE_DARK, fontSize: 10, halign: 'center' },
          bodyStyles: { fontSize: 9 },
          columnStyles: {
            0: { cellWidth: 12, halign: 'center' },
            1: { cellWidth: 48 },
            2: { cellWidth: 32, halign: 'center' },
            3: { cellWidth: 20, halign: 'center' },
            4: { cellWidth: 58 },
            5: { cellWidth: 32 },
            6: { cellWidth: 52 },
            7: { cellWidth: 22, halign: 'center' },
          },
          margin: { left: 16, right: 16 },
          alternateRowStyles: { fillColor: [248, 245, 255] },
          tableLineColor: [200, 190, 220],
          tableLineWidth: 0.3,
        })
        yPos = (doc as any).lastAutoTable.finalY + 16
      } else {
        doc.setTextColor(TEXT_MUTED[0], TEXT_MUTED[1], TEXT_MUTED[2])
        doc.setFontSize(10)
        doc.text('No student data available for this department.', 20, yPos + 8)
        yPos += 16
      }
    })

    // ==================== PAGE FOOTER (all pages) ====================
    const pageCount = (doc as any).getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      (doc as any).setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(TEXT_MUTED[0], TEXT_MUTED[1], TEXT_MUTED[2])
      doc.text(
        `COS-102 Project Hub Report \u2014 Page ${i} of ${pageCount}`,
        pw / 2,
        ph - 10,
        { align: 'center' }
      )
    }

    doc.save(`COS102-Project-Hub-Report-${Date.now()}.pdf`)
    toast.success('PDF exported!')
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
            <div className="emoji-lg">{'\uD83D\uDD10'}</div>
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
    { id: 'overview', icon: '\uD83D\uDCCA', label: 'Overview' },
    { id: 'departments', icon: '\uD83C\uDFDB\uFE0F', label: 'Departments' },
    { id: 'submissions', icon: '\uD83D\uDCE6', label: 'Submissions' },
  ]

  return (
    <div className="page">
      <nav className="nav">
        <div className="nav-inner">
          <Link href="/" className="nav-logo">
            <div className="nav-logo-icon">{'\uD83C\uDF93'}</div>
            <span className="nav-logo-text gradient-text">COS 102</span>
          </Link>
          <div className="nav-links">
            <span className="badge badge-violet">Admin Panel</span>
            <button onClick={loadData} className="btn btn-secondary" style={{ fontSize: 12, padding: '6px 12px' }}>
              {loading ? <span className="spinner" /> : '\u21BB'} Refresh
            </button>
            <button onClick={exportPDF} className="btn btn-cyan" style={{ fontSize: 12, padding: '6px 12px' }}>
              {'\u2B07'} Export PDF Report
            </button>
          </div>
        </div>
      </nav>

      <div className="admin-layout">
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

        <main style={{ padding: '32px 24px', minWidth: 0 }}>
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

          {tab === 'overview' && (
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: -0.5, marginBottom: 24 }}>Overview</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
                {[
                  { label: 'Registered Depts', value: departments.length, icon: '\uD83C\uDFDB\uFE0F', color: 'var(--violet)' },
                  { label: 'Project Submissions', value: submissions.length, icon: '\uD83D\uDCE6', color: 'var(--cyan)' },
                  { label: 'Total Students', value: submissions.reduce((a, s) => a + s.members.length, 0), icon: '\uD83D\uDC65', color: '#10b981' },
                  { label: 'Unique Projects', value: new Set(submissions.map(s => s.project_name)).size, icon: '\uD83D\uDCA1', color: '#f59e0b' },
                ].map(s => (
                  <div key={s.label} className="stat-card">
                    <div style={{ fontSize: 28, marginBottom: 4 }}>{s.icon}</div>
                    <div className="stat-number" style={{ color: s.color }}>{s.value}</div>
                    <div className="stat-label">{s.label}</div>
                  </div>
                ))}
              </div>

              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Submissions by Department</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 32 }}>
                {Object.entries(
                  submissions.reduce<Record<string, number>>((acc, s) => {
                    acc[s.department] = (acc[s.department] || 0) + 1
                    return acc
                  }, {})
                ).sort((a, b) => b[1] - a[1]).map(([dept, count]) => (
                  <div key={dept} className="card" style={{ padding: '12px 16px', flex: '1 1 180px' }}>
                    <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{dept}</p>
                    <p style={{ fontSize: 24, fontFamily: 'Syne, sans-serif', fontWeight: 800, color: 'var(--cyan)' }}>
                      {count} <span style={{ fontSize: 12, color: 'var(--text-3)' }}>submission{count !== 1 ? 's' : ''}</span>
                    </p>
                  </div>
                ))}
                {submissions.length === 0 && (
                  <p style={{ color: 'var(--text-3)', fontSize: 13 }}>No submissions yet</p>
                )}
              </div>

              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>All Submissions</h3>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Dept</th>
                      <th>Group</th>
                      <th>Project</th>
                      <th>Leader</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Members</th>
                      <th>Submitted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map(s => (
                      <tr key={s.id}>
                        <td><span className="badge badge-violet">{s.department}</span></td>
                        <td>Group {s.group_number}</td>
                        <td style={{ color: 'var(--text)', fontWeight: 500 }}>{s.project_name}</td>
                        <td>{s.leader_name}</td>
                        <td><span className="mono" style={{ fontSize: 12 }}>{s.leader_email}</span></td>
                        <td style={{ fontSize: 12 }}>{s.leader_phone || '\u2014'}</td>
                        <td><span className="badge badge-cyan">{s.members.length} members</span></td>
                        <td style={{ whiteSpace: 'nowrap', fontSize: 12, color: 'var(--text-3)' }}>
                          {new Date(s.submitted_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                    {submissions.length === 0 && (
                      <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--text-3)' }}>No submissions yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

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
                      <th>Rep Phone</th>
                      <th>Groups</th>
                      <th>Registered</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departments.map(d => (
                      <>
                        <tr key={d.id} style={{ cursor: 'pointer' }} onClick={() => toggleDeptExpand(d.id)}>
                          <td style={{ color: 'var(--text)', fontWeight: 500 }}>
                            {expandedDept === d.id ? '\u25BC' : '\u25B6'} {d.department}
                          </td>
                          <td>{d.rep_name}</td>
                          <td><span className="mono">{d.rep_email}</span></td>
                          <td style={{ fontSize: 12 }}>{d.rep_phone || '\u2014'}</td>
                          <td><span className="badge badge-violet">{d.number_of_groups} groups</span></td>
                          <td style={{ fontSize: 12, color: 'var(--text-3)', whiteSpace: 'nowrap' }}>
                            {new Date(d.created_at).toLocaleDateString()}
                          </td>
                          <td>
                            <button
                              onClick={(e) => { e.stopPropagation(); deleteDepartment(d.id) }}
                              className="btn btn-danger"
                              style={{ fontSize: 11, padding: '4px 10px' }}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                        {expandedDept === d.id && (
                          <tr key={`${d.id}-groups`}>
                            <td colSpan={7} style={{ padding: '0 16px 16px 40px', background: 'rgba(100,60,210,0.03)' }}>
                              {loadingGroups && !deptGroups[d.id] ? (
                                <p style={{ padding: 16, color: 'var(--text-3)', fontSize: 13 }}>
                                  <span className="spinner" /> Loading groups...
                                </p>
                              ) : (deptGroups[d.id]?.length || 0) > 0 ? (
                                <div style={{ marginTop: 12 }}>
                                  <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                                    Registered Groups
                                  </p>
                                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                                    <thead>
                                      <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                        <th style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--text-3)', fontWeight: 600, fontSize: 11 }}>Group</th>
                                        <th style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--text-3)', fontWeight: 600, fontSize: 11 }}>Project</th>
                                        <th style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--text-3)', fontWeight: 600, fontSize: 11 }}>Leader</th>
                                        <th style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--text-3)', fontWeight: 600, fontSize: 11 }}>Status</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {deptGroups[d.id]!.map(g => (
                                        <tr key={g.id} style={{ borderBottom: '1px solid rgba(100,60,210,0.06)' }}>
                                          <td style={{ padding: '6px 8px', fontWeight: 500 }}>Group {g.group_number}</td>
                                          <td style={{ padding: '6px 8px' }}>{g.project_name}</td>
                                          <td style={{ padding: '6px 8px' }}>{g.leader_name}</td>
                                          <td style={{ padding: '6px 8px' }}>
                                            <span className={`badge ${g.submitted ? 'badge-green' : 'badge-violet'}`}>
                                              {g.submitted ? '\u2713 Submitted' : 'Pending'}
                                            </span>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              ) : (
                                <p style={{ padding: 16, color: 'var(--text-3)', fontSize: 13 }}>
                                  No groups registered yet
                                </p>
                              )}
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                    {departments.length === 0 && (
                      <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--text-3)' }}>No departments registered yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'submissions' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: -0.5 }}>
                  Submissions <span style={{ color: 'var(--text-3)', fontSize: 16, fontWeight: 400 }}>({filteredSubmissions.length})</span>
                </h2>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`btn ${viewMode === 'table' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ fontSize: 11, padding: '6px 12px' }}
                  >
                    {'\uD83D\uDCCB'} Table
                  </button>
                  <button
                    onClick={() => setViewMode('cards')}
                    className={`btn ${viewMode === 'cards' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ fontSize: 11, padding: '6px 12px' }}
                  >
                    {'\uD83D\uDCC3'} Cards
                  </button>
                  <button onClick={exportPDF} className="btn btn-cyan" style={{ fontSize: 12 }}>
                    {'\u2B07'} Export PDF
                  </button>
                </div>
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

              {viewMode === 'table' ? (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Dept</th>
                        <th>Group</th>
                        <th>Project</th>
                        <th>Leader</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Members (Name & Matric)</th>
                        <th>GitHub</th>
                        <th>Notes</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSubmissions.map(s => (
                        <tr key={s.id}>
                          <td><span className="badge badge-violet" style={{ fontSize: 10 }}>{s.department}</span></td>
                          <td>Group {s.group_number}</td>
                          <td style={{ fontWeight: 500, fontSize: 12 }}>{s.project_name}</td>
                          <td style={{ fontSize: 12 }}>{s.leader_name}</td>
                          <td><span className="mono" style={{ fontSize: 11 }}>{s.leader_email}</span></td>
                          <td style={{ fontSize: 11 }}>{s.leader_phone || '\u2014'}</td>
                          <td style={{ fontSize: 11 }}>
                            {fmtMembers(s.members)}
                          </td>
                          <td style={{ fontSize: 11 }}>
                            <a href={s.github_link} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--cyan-light)' }}>
                              {s.github_link.replace('https://github.com/', '')}
                            </a>
                          </td>
                          <td style={{ fontSize: 11, fontStyle: 'italic', color: 'var(--text-3)' }}>
                            {s.notes || '\u2014'}
                          </td>
                          <td style={{ fontSize: 11, whiteSpace: 'nowrap', color: 'var(--text-3)' }}>
                            {new Date(s.submitted_at).toLocaleDateString()}
                          </td>
                          <td>
                            <button
                              onClick={() => deleteSubmission(s.id)}
                              className="btn btn-danger"
                              style={{ fontSize: 10, padding: '3px 8px' }}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredSubmissions.length === 0 && (
                        <tr><td colSpan={11} style={{ textAlign: 'center', padding: 40, color: 'var(--text-3)' }}>No submissions match your search.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {filteredSubmissions.map(s => (
                    <div key={s.id} className="card" style={{ position: 'relative' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
                        <div>
                          <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                            <span className="badge badge-violet">{s.department}</span>
                            <span className="badge badge-cyan">Group {s.group_number}</span>
                            <span className="badge badge-green">{'\u2713'} Submitted</span>
                          </div>
                          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{s.project_name}</h3>
                          <p style={{ fontSize: 13, color: 'var(--text-3)' }}>
                            Led by <strong style={{ color: 'var(--text-2)' }}>{s.leader_name}</strong>
                            <span style={{ margin: '0 6px' }}>·</span>
                            <span className="mono">{s.leader_email}</span>
                          </p>
                          <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>
                            Phone: {s.leader_phone || '\u2014'}
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

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 12 }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 1 }}>
                          Members ({s.members.length})
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {s.members.map((m, idx) => {
                            const n = typeof m === 'string' ? m : (m.name || '')
                            const mat = typeof m === 'string' ? '' : (m.matric || '')
                            return (
                              <span key={n + mat || idx} style={{
                                display: 'inline-flex', alignItems: 'center', gap: 6,
                                background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.15)',
                                padding: '3px 10px', borderRadius: 8, fontSize: 12,
                              }}>
                                <span style={{ color: 'var(--text)' }}>{n}</span>
                                {mat && <span className="mono" style={{ fontSize: 10 }}>{mat}</span>}
                              </span>
                            )
                          })}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                        <a
                          href={s.github_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-secondary"
                          style={{ fontSize: 12, padding: '6px 14px' }}
                        >
                          {'\uD83D\uDD17'} GitHub →
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
                      <p style={{ fontSize: 32, marginBottom: 12 }}>{'\uD83D\uDCED'}</p>
                      <p>No submissions match your search.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
