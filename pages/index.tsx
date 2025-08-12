import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useRouter } from 'next/router'

export default function Home() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'signin'|'signup'>('signin')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const submit = async (e:any) => {
    e.preventDefault()
    setLoading(true)
    try {
      if(mode === 'signup'){
        const { error } = await supabase.auth.signUp({ email, password })
        if(error) throw error
        alert('Check your email to confirm.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if(error) throw error
        router.push('/app')
      }
    } catch (err:any) {
      alert(err.message || 'Auth error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <div className="card" style={{maxWidth: 420, margin: '80px auto'}}>
        <h1 className="title">MLB Picks</h1>
        <p className="subtitle">Sign {mode === 'signup' ? 'up' : 'in'} to continue</p>
        <form onSubmit={submit}>
          <div style={{marginBottom: 12}}>
            <input className="input" type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required />
          </div>
          <div style={{marginBottom: 12}}>
            <input className="input" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required />
          </div>
          <button className="btn" disabled={loading} type="submit">{loading ? 'Please wait...' : (mode==='signup'?'Create account':'Sign in')}</button>
        </form>
        <hr />
        <button className="btn" style={{background:'#334155'}} onClick={()=>setMode(mode==='signup'?'signin':'signup')}>
          {mode==='signup'?'Have an account? Sign in':'New here? Create an account'}
        </button>
      </div>
    </div>
  )
}
