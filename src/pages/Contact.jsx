import { useEffect, useState } from 'react'
import { loadContactFromSheets, sheetsConfigured } from '../data/loadFromSheets'

export default function Contact() {
  const [contact, setContact] = useState({ email: 'hello@example.com', instagram: '@yourhandle' })

  useEffect(() => {
    let cancelled = false
    if (sheetsConfigured()) {
      loadContactFromSheets().then((c) => { if (!cancelled && c) setContact((prev) => ({ ...prev, ...c })) }).catch(() => {})
    }
    return () => { cancelled = true }
  }, [])

  const email = contact.email || 'hello@example.com'
  const instagram = contact.instagram || '@yourhandle'
  const instagramUrl = instagram.startsWith('http') ? instagram : `https://instagram.com/${instagram.replace(/^@/, '')}`

  return (
    <div>
      <p>email: <a href={`mailto:${email}`}>{email}</a></p>
      <p>instagram: <a href={instagramUrl} target="_blank" rel="noreferrer">{instagram}</a></p>
    </div>
  )
}


