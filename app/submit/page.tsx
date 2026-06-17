'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface Department { id: string; department: string; number_of_groups: number }
interface Group { id: string; group_number: number; leader_name: string; project_name: string; submitted: boolean }

export default function SubmitProject() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [selectedDept, setSelectedDept] = useState('')
  const [selectedGroup, setSelectedGroup] = useState('')
  const [members, setMembers] = useState<string[]>([])
  const [memberInput, setMemberInput] = useState('')
  const [githubLink, setGithubLink] = useState('')
  const [notes, setNotes] = useState('')
  const [bulkMode, setBulkMode] = useState(false)
  const [bulkText, setBulkText] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [submittedData, setSubmittedData] = useState<any>(null)
  const memberRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/register-department')
      .then(r => r.json())
      .then(data => setDepartments(data.departments || []))
  }, [])

  useEffect(() => {
    if (!selectedDept) { setGroups([]); setSelectedGroup(''); return }
    fetch(`/api/register-group?departmentId=${selectedDept}`)
      .then(r => r.json())
      .then(data => setGroups(data.groups || []))
  }, [selectedDept])

  const addMember = () => {
    const name = memberInput.trim()
    if (!name) return
    if (members.includes(name)) { toast.error('Member already added'); return }
    setMembers(prev => [...prev, name])
    setMemberInput('')
    memberRef.current?.focus()
  }

  const removeMember = (name: string) => setMembers(prev => prev.filter(m => m !== name))

  const parseBulk = () => {
    const lines = bulkText.split('\n').map(l => l.trim()).filter(Boolean)
    const unique = Array.from(new Set([...members, ...lines]))
    setMembers(unique)
    setBulkText('')
    setBulkMode(false)
    toast.success(`${lines.length} members added`)
  }

  const selectedGroupData = groups.find(g => g.id === selectedGroup)
  const deptData = departments.find(d => d.id === selectedDept)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDept || !selectedGroup) { toast.error('Select department and group'); return }
    if (members.length === 0) { toast.error('Add at least one group member'); return }
    if (!githubLink.startsWith('https://github.com')) { toast.error('Please enter a valid GitHub link'); return }

    setLoading(true)
    try {
      const res = await fetch('/api/submit-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId: selectedGroup, members, githubLink, notes }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Submission failed')
      setSubmittedData(data)
      setDone(true)
      toast.success('Project submitted! 🎉')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (done && submittedData) {
    return (
      <div className="page">
        <nav className="nav">
          <div className="nav-inner">
            <Link href="/" className="nav-logo">
              <div className="nav-logo-icon">🎓</div>
              <span className="nav-logo-text gradient-text">COS 102</span>
            </Link>
          </div>
        </nav>
        <div className="form-container" style={{ textAlign: 'center', paddingTop: 60 }}>
          <div className="success-icon">🚀</div>
          <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8, letterSpacing: -1 }}>
            Project Submitted!
          </h2>
          <p style={{ color: 'var(--text-2)', fontSize: 15, lineHeight: 1.7, marginBottom: 32 }}>
            Confirmation emails have been sent. Your lecturer can view and download everything from the admin panel.
          </p>

          <div className="card" style={{ textAlign: 'left', marginBottom: 24 }}>
            <h3 style={{ fontSize: 11, fontWeight: 700, marginBottom: 16, color: 'var(--violet-light)', fontFamily: 'Syne, sans-serif', textTransform: 'uppercase', letterSpacing: 1 }}>
              Submission Summary
            </h3>
            {[
              ['Project', selectedGroupData?.project_name],
              ['Department', deptData?.department],
              ['Group', `Group ${selectedGroupData?.group_number}`],
              ['Leader', selectedGroupData?.leader_name],
              ['Members', `${members.length} students`],
              ['GitHub', githubLink],
            ].map(([label, value]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                <span style={{ color: 'var(--text-3)' }}>{label}</span>
                <span style={{ color: 'var(--text)', fontWeight: 500, textAlign: 'right', maxWidth: '60%', wordBreak: 'break-word' }}>
                  {label === 'GitHub' ? (
                    <a href={value as string} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--cyan-light)' }}>{value}</a>
                  ) : value}
                </span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/" className="btn btn-primary">Back to Home</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <nav className="nav">
        <div className="nav-inner">
          <Link href="/" className="nav-logo">
            <div className="nav-logo-icon">🎓</div>
            <span className="nav-logo-text gradient-text">COS 102</span>
          </Link>
          <div className="nav-links">
            <Link href="/" className="nav-link">← Home</Link>
          </div>
        </div>
      </nav>

      <div className="form-container">
        <div style={{ marginBottom: 36, animation: 'fade-up 0.5s ease both' }}>
          <p className="section-eyebrow">Step 3 of 3</p>
          <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: -1, marginBottom: 10 }}>
            Submit Your Project
          </h1>
          <p style={{ color: 'var(--text-2)', fontSize: 15, lineHeight: 1.6 }}>
            Final step! Upload your group members and GitHub project link.
          </p>
        </div>

        <div className="steps" style={{ animation: 'fade-up 0.5s 0.1s ease both', opacity: 0 }}>
          <div className="step">
            <div className="step-dot done">✓</div>
            <span className="step-label done">Department</span>
          </div>
          <div className="step-line done" />
          <div className="step">
            <div className="step-dot done">✓</div>
            <span className="step-label done">Groups</span>
          </div>
          <div className="step-line done" />
          <div className="step">
            <div className="step-dot active">3</div>
            <span className="step-label active">Submit</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ animation: 'fade-up 0.5s 0.2s ease both', opacity: 0 }}>
          {/* Department & Group Selection */}
          <div className="card" style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 11, fontWeight: 700, marginBottom: 20, color: 'var(--violet-light)', fontFamily: 'Syne, sans-serif', textTransform: 'uppercase', letterSpacing: 1 }}>
              Find Your Group
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label className="label">Department *</label>
                <select
                  className="input select"
                  value={selectedDept}
                  onChange={e => { setSelectedDept(e.target.value); setSelectedGroup('') }}
                  required
                >
                  <option value="">Select your department...</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.department}</option>)}
                </select>
              </div>
              {selectedDept && (
                <div>
                  <label className="label">Your Group *</label>
                  {groups.length === 0 ? (
                    <div style={{ padding: '12px 16px', border: '1px solid var(--border)', borderRadius: 10, fontSize: 14, color: 'var(--text-3)' }}>
                      No groups registered yet for this department. <Link href="/register-group" style={{ color: 'var(--violet-light)' }}>Register your group first →</Link>
                    </div>
                  ) : (
                    <select
                      className="input select"
                      value={selectedGroup}
                      onChange={e => setSelectedGroup(e.target.value)}
                      required
                    >
                      <option value="">Select your group...</option>
                      {groups.map(g => (
                        <option key={g.id} value={g.id} disabled={g.submitted}>
                          Group {g.group_number} — {g.project_name} — Leader: {g.leader_name}
                          {g.submitted ? ' (Already submitted)' : ''}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Members */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontSize: 11, fontWeight: 700, color: 'var(--violet-light)', fontFamily: 'Syne, sans-serif', textTransform: 'uppercase', letterSpacing: 1 }}>
                Group Members ({members.length})
              </h3>
              <button
                type="button"
                onClick={() => setBulkMode(!bulkMode)}
                className="btn btn-secondary"
                style={{ fontSize: 11, padding: '5px 12px' }}
              >
                {bulkMode ? '✏️ One by one' : '📋 Paste list'}
              </button>
            </div>

            {bulkMode ? (
              <div>
                <label className="label">Paste names (one per line)</label>
                <textarea
                  className="input textarea"
                  value={bulkText}
                  onChange={e => setBulkText(e.target.value)}
                  placeholder={"Chukwuemeka Obi\nAmina Lawal\nTunde Adebayo\n..."}
                  style={{ minHeight: 140, fontFamily: 'JetBrains Mono, monospace', fontSize: 13 }}
                />
                <button
                  type="button"
                  className="btn btn-cyan"
                  style={{ marginTop: 10, width: '100%' }}
                  onClick={parseBulk}
                  disabled={!bulkText.trim()}
                >
                  Add Members →
                </button>
              </div>
            ) : (
              <div>
                <label className="label">Add member</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    ref={memberRef}
                    className="input"
                    value={memberInput}
                    onChange={e => setMemberInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addMember() } }}
                    placeholder="Full name of group member..."
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={addMember}
                    style={{ padding: '12px 16px', flexShrink: 0 }}
                  >
                    Add
                  </button>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 6 }}>Press Enter to add quickly</p>
              </div>
            )}

            {members.length > 0 && (
              <div style={{ marginTop: 16, padding: '12px', background: 'rgba(6,182,212,0.05)', borderRadius: 10, border: '1px solid rgba(6,182,212,0.15)' }}>
                {members.map(m => (
                  <span key={m} className="member-tag">
                    {m}
                    <button type="button" onClick={() => removeMember(m)}>✕</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* GitHub */}
          <div className="card" style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 11, fontWeight: 700, marginBottom: 16, color: 'var(--violet-light)', fontFamily: 'Syne, sans-serif', textTransform: 'uppercase', letterSpacing: 1 }}>
              Project Repository
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label className="label">GitHub Repository Link *</label>
                <div style={{ position: 'relative' }}>
                  <span style={{
                    position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                    fontSize: 12, color: 'var(--text-3)', fontFamily: 'JetBrains Mono, monospace'
                  }}>
                    github.com/
                  </span>
                  <input
                    className="input"
                    type="url"
                    value={githubLink}
                    onChange={e => setGithubLink(e.target.value)}
                    placeholder="https://github.com/username/repo"
                    style={{ paddingLeft: 100 }}
                    required
                  />
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 6 }}>
                  Must be a valid public GitHub repository
                </p>
              </div>
              <div>
                <label className="label">Additional Notes (optional)</label>
                <textarea
                  className="input textarea"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Any extra info for the lecturer... tech stack, special features, etc."
                  style={{ minHeight: 80 }}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '16px', fontSize: 15 }}
            disabled={loading}
          >
            {loading ? <><span className="spinner" /> Submitting...</> : '🚀 Submit Project'}
          </button>

          <p style={{ fontSize: 12, color: 'var(--text-3)', textAlign: 'center', marginTop: 12 }}>
            A confirmation email will be sent to the group leader after submission.
          </p>
        </form>
      </div>
    </div>
  )
}
