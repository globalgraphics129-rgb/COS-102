'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const DEPARTMENTS = [
  'Computer Science', 'Electrical Engineering', 'Mechanical Engineering',
  'Civil Engineering', 'Biochemistry', 'Physics', 'Mathematics',
  'Mass Communication', 'Business Administration', 'Accounting'
]

function AnimatedCounter({ target }: { target: number }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    const step = Math.ceil(target / 40)
    const interval = setInterval(() => {
      setCount(prev => {
        if (prev + step >= target) { clearInterval(interval); return target }
        return prev + step
      })
    }, 30)
    return () => clearInterval(interval)
  }, [target])
  return <span>{count}</span>
}

export default function Home() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <div className="page" style={{ position: 'relative', zIndex: 1 }}>
      {/* Nav */}
      <nav className="nav">
        <div className="nav-inner">
          <div className="nav-logo">
            <div className="nav-logo-icon">🎓</div>
            <span className="nav-logo-text gradient-text">COS 102</span>
          </div>
          <div className="nav-links">
            <Link href="/register-department" className="nav-link">Class Reps</Link>
            <Link href="/register-group" className="nav-link">Group Leaders</Link>
            <Link href="/submit" className="nav-link">Submit Project</Link>
            <Link href="/admin" className="btn btn-secondary" style={{ fontSize: 13, padding: '7px 14px' }}>
              Admin →
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding: '120px 24px 80px', textAlign: 'center', position: 'relative' }}>
        <div style={{ 
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.3)',
          borderRadius: 20, padding: '6px 16px', marginBottom: 24,
          animation: mounted ? 'fade-up 0.5s ease forwards' : 'none'
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 8px #10b981' }} />
          <span style={{ fontSize: 12, color: 'var(--violet-light)', fontWeight: 600, fontFamily: 'Syne, sans-serif', letterSpacing: 1 }}>
            SUBMISSIONS OPEN · COS 102
          </span>
        </div>

        <h1 style={{ 
          fontSize: 'clamp(40px, 8vw, 80px)', fontWeight: 800, letterSpacing: '-3px',
          lineHeight: 1.05, maxWidth: 800, margin: '0 auto 24px',
          animation: mounted ? 'fade-up 0.6s 0.1s ease both' : 'none',
          opacity: 0
        }}>
          Submit your<br />
          <span className="shimmer-text">COS 102 Project</span>
        </h1>

        <p style={{ 
          fontSize: 18, color: 'var(--text-2)', maxWidth: 520, margin: '0 auto 48px',
          lineHeight: 1.7, fontWeight: 300,
          animation: mounted ? 'fade-up 0.6s 0.2s ease both' : 'none', opacity: 0
        }}>
          One place for every group, every department. Register, collaborate, and submit your semester project — done.
        </p>

        <div style={{ 
          display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap',
          animation: mounted ? 'fade-up 0.6s 0.3s ease both' : 'none', opacity: 0
        }}>
          <Link href="/register-department" className="btn btn-primary" style={{ fontSize: 15, padding: '14px 28px' }}>
            🏛️ I&apos;m a Class Rep
          </Link>
          <Link href="/register-group" className="btn btn-secondary" style={{ fontSize: 15, padding: '14px 28px' }}>
            👥 Register My Group
          </Link>
          <Link href="/submit" className="btn btn-cyan" style={{ fontSize: 15, padding: '14px 28px' }}>
            🚀 Submit Project
          </Link>
        </div>
      </section>

      {/* Steps */}
      <section style={{ padding: '40px 24px 80px' }}>
        <div className="container">
          <p className="section-eyebrow" style={{ textAlign: 'center' }}>How it works</p>
          <h2 style={{ textAlign: 'center', fontSize: 32, fontWeight: 800, marginBottom: 48, letterSpacing: -1 }}>
            Three steps. That&apos;s it.
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {[
              {
                step: '01', icon: '🏛️', title: 'Class Reps Register',
                desc: 'Class rep registers the department and specifies how many groups are in the class. Takes 2 minutes.',
                color: 'var(--violet)', link: '/register-department', cta: 'Register Department'
              },
              {
                step: '02', icon: '👥', title: 'Groups Register',
                desc: 'Group leaders select their department, pick their group number, and list all members in the group.',
                color: 'var(--cyan)', link: '/register-group', cta: 'Register Group'
              },
              {
                step: '03', icon: '🚀', title: 'Submit Project',
                desc: 'Leaders submit the project name, GitHub repo link, and final details. Everyone gets a confirmation email.',
                color: '#10b981', link: '/submit', cta: 'Submit Now'
              },
            ].map((item, i) => (
              <div key={i} className="card" style={{ position: 'relative', overflow: 'hidden' }}>
                <div style={{
                  position: 'absolute', top: -20, right: -10,
                  fontSize: 80, fontWeight: 800, fontFamily: 'Syne, sans-serif',
                  color: item.color, opacity: 0.06, lineHeight: 1, pointerEvents: 'none'
                }}>{item.step}</div>
                <div style={{ fontSize: 36, marginBottom: 16 }}>{item.icon}</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>{item.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.7, marginBottom: 20 }}>{item.desc}</p>
                <Link href={item.link} style={{
                  fontSize: 13, fontFamily: 'Syne, sans-serif', fontWeight: 700,
                  color: item.color, display: 'inline-flex', alignItems: 'center', gap: 6
                }}>
                  {item.cta} →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Departments marquee */}
      <section style={{ padding: '40px 0 80px', overflow: 'hidden' }}>
        <p style={{ textAlign: 'center', fontSize: 11, fontFamily: 'Syne, sans-serif', fontWeight: 700, color: 'var(--text-3)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 24 }}>
          Participating Departments
        </p>
        <div style={{
          display: 'flex', gap: 12, width: 'max-content',
          animation: 'grid-move 0s linear 0s, marquee 20s linear infinite'
        }}>
          <style>{`@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
          {[...DEPARTMENTS, ...DEPARTMENTS].map((dep, i) => (
            <span key={i} className="badge badge-violet" style={{ fontSize: 12, padding: '6px 16px', whiteSpace: 'nowrap' }}>
              {dep}
            </span>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '32px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: 13, color: 'var(--text-3)' }}>
          COS 102 Project Hub · Computer Science Department
          <span style={{ margin: '0 12px', opacity: 0.3 }}>·</span>
          <Link href="/admin" style={{ color: 'var(--violet-light)' }}>Admin Access</Link>
        </p>
      </footer>
    </div>
  )
}
