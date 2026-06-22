'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import ThemeToggle from './components/ThemeToggle'
import { GraduationCap, Users, Rocket, Building2, ChevronRight, Lock, Unlock, ArrowRight } from 'lucide-react'

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [portalOpen, setPortalOpen] = useState(true)
  const [registeredDepts, setRegisteredDepts] = useState<string[]>([])

  useEffect(() => {
    setMounted(true)
    fetch('/api/portal-settings')
      .then(r => r.json())
      .then(data => {
        if (data.closes_at) {
          setPortalOpen(new Date(data.closes_at).getTime() > Date.now())
        }
      })
      .catch(() => {})
    fetch('/api/register-department')
      .then(r => r.json())
      .then(data => {
        if (data.departments) {
          setRegisteredDepts(data.departments.map((d: any) => d.department))
        }
      })
      .catch(() => {})
  }, [])

  return (
    <div className="page" style={{ position: 'relative', zIndex: 1 }}>
      <nav className="nav">
        <div className="nav-inner">
          <div className="nav-logo">
            <div className="nav-logo-icon"><GraduationCap size={20} /></div>
            <span className="nav-logo-text gradient-text">AcademiHub</span>
          </div>
          <div className="nav-links">
            <Link href="/dashboard/student" className="nav-link">Students</Link>
            <Link href="/register-department" className="nav-link">Class Reps</Link>
            <Link href="/register-group" className="nav-link">Groups</Link>
            <Link href="/submit" className="nav-link">Submit</Link>
            <ThemeToggle />
            <Link href="/login" className="nav-link">Sign In</Link>
            <Link href="/admin" className="btn btn-secondary" style={{ fontSize: 13, padding: '7px 14px' }}>
              Admin <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </nav>

      {!portalOpen && (
        <div style={{
          background: 'linear-gradient(135deg, #dc2626, #ea580c)',
          padding: '10px 16px',
          textAlign: 'center',
        }}>
          <span style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>
            <Lock size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
            Submissions are now closed. The portal is no longer accepting projects.
          </span>
        </div>
      )}

      <section style={{ padding: '120px 24px 80px', textAlign: 'center', position: 'relative' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: portalOpen ? 'rgba(5,150,105,0.12)' : 'rgba(220,38,38,0.12)',
          border: `1px solid ${portalOpen ? 'rgba(5,150,105,0.3)' : 'rgba(220,38,38,0.3)'}`,
          borderRadius: 20, padding: '6px 16px', marginBottom: 24,
          animation: mounted ? 'fade-up 0.5s ease forwards' : 'none'
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: portalOpen ? '#10b981' : '#ef4444',
            display: 'inline-block',
            boxShadow: `0 0 8px ${portalOpen ? '#10b981' : '#ef4444'}`
          }} />
          <span style={{ fontSize: 12, color: portalOpen ? 'var(--primary-light)' : '#fca5a5', fontWeight: 600, letterSpacing: 1 }}>
            {portalOpen ? 'SUBMISSIONS OPEN' : 'SUBMISSIONS CLOSED'}
          </span>
        </div>

        <h1 style={{
          fontSize: 'clamp(36px, 7vw, 72px)', fontWeight: 800, letterSpacing: '-2px',
          lineHeight: 1.1, maxWidth: 800, margin: '0 auto 24px',
          animation: mounted ? 'fade-up 0.6s 0.1s ease both' : 'none',
          opacity: 0
        }}>
          Academic Project<br />
          <span className="shimmer-text">Submission Hub</span>
        </h1>

        <p style={{
          fontSize: 18, color: 'var(--text-2)', maxWidth: 520, margin: '0 auto 48px',
          lineHeight: 1.7,
          animation: mounted ? 'fade-up 0.6s 0.2s ease both' : 'none', opacity: 0
        }}>
          One place for every department, every group. Register, collaborate, and submit your projects — all in one streamlined system.
        </p>

        <div style={{
          display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap',
          animation: mounted ? 'fade-up 0.6s 0.3s ease both' : 'none', opacity: 0
        }}>
          <Link href="/register-department" className="btn btn-primary" style={{ fontSize: 15, padding: '14px 28px' }}>
            <Building2 size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />
            Class Rep Access
          </Link>
          <Link href="/register-group" className="btn btn-secondary" style={{ fontSize: 15, padding: '14px 28px' }}>
            <Users size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />
            Register Group
          </Link>
          <Link href="/submit" className="btn btn-cyan" style={{ fontSize: 15, padding: '14px 28px' }}>
            <Rocket size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />
            Submit Project
          </Link>
        </div>
      </section>

      <section style={{ padding: '40px 24px 80px' }}>
        <div className="container">
          <p className="section-eyebrow" style={{ textAlign: 'center' }}>How it works</p>
          <h2 style={{ textAlign: 'center', fontSize: 32, fontWeight: 800, marginBottom: 48, letterSpacing: -1 }}>
            Three simple steps
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {[
              {
                step: '01', icon: Building2, title: 'Class Rep Registers',
                desc: 'Class rep registers the department and specifies how many groups are in the class.',
                color: 'var(--primary)', link: '/register-department', cta: 'Register Department'
              },
              {
                step: '02', icon: Users, title: 'Groups Sign Up',
                desc: 'Group leaders select their department, pick their group number, and list all members.',
                color: 'var(--secondary)', link: '/register-group', cta: 'Register Group'
              },
              {
                step: '03', icon: Rocket, title: 'Submit Project',
                desc: 'Leaders submit the project name, GitHub repo link, and final details. Everyone gets a confirmation.',
                color: '#10b981', link: '/submit', cta: 'Submit Now'
              },
            ].map((item, i) => (
              <div key={i} className="card" style={{ position: 'relative', overflow: 'hidden' }}>
                <div style={{
                  position: 'absolute', top: -20, right: -10,
                  fontSize: 80, fontWeight: 800,
                  color: item.color, opacity: 0.06, lineHeight: 1, pointerEvents: 'none'
                }}>{item.step}</div>
                <div style={{ marginBottom: 16 }}>
                  <item.icon size={36} color={item.color} />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>{item.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.7, marginBottom: 20 }}>{item.desc}</p>
                <Link href={item.link} style={{
                  fontSize: 13, fontWeight: 600,
                  color: item.color, display: 'inline-flex', alignItems: 'center', gap: 6
                }}>
                  {item.cta} <ChevronRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '40px 0 80px', overflow: 'hidden' }}>
        <p style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: 'var(--text-3)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 24 }}>
          Registered Departments
        </p>
        {registeredDepts.length > 0 ? (
          <div style={{
            display: 'flex', gap: 12, width: 'max-content',
            animation: 'marquee 20s linear infinite'
          }}>
            <style>{`@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
            {[...registeredDepts, ...registeredDepts].map((dep, i) => (
              <span key={i} className="badge badge-violet" style={{ fontSize: 12, padding: '6px 16px', whiteSpace: 'nowrap' }}>
                {dep}
              </span>
            ))}
          </div>
        ) : (
          <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-3)' }}>
            No departments registered yet. Be the first!
          </p>
        )}
      </section>
    </div>
  )
}
