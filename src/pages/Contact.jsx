import { useEffect, useState } from 'react'
import { loadContactFromSheets, sheetsConfigured } from '../data/loadFromSheets'

export default function Contact() {
  const [contact, setContact] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      if (sheetsConfigured()) {
        try {
          const c = await loadContactFromSheets()
          if (!cancelled && c) setContact(c)
        } catch (err) {
          // ignore
        }
      }
      if (!cancelled) setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  if (loading) return null
  if (!contact) return null

  const email = contact.email
  const instagram = contact.instagram
  const instagramUrl = instagram && instagram.startsWith('http') ? instagram : `https://instagram.com/${(instagram||'').replace(/^@/, '')}`

  return (
    <div>
      <p>email: <a href={`mailto:${email}`}>{email}</a></p>
      <p>instagram: <a href={instagramUrl} target="_blank" rel="noreferrer">{instagram}</a></p>
    </div>
  )
}


