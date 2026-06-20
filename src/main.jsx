import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowUpRight,
  BadgeCheck,
  Check,
  Clipboard,
  Gift,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Upload
} from 'lucide-react';
import './styles.css';

const fallbackReferrals = [
  {
    id: 'stream-blue',
    name: 'StreamBlue',
    category: 'Streaming',
    code: 'BLUE20',
    reward: '20% off your first 3 months',
    description: 'A polished live TV and sports streaming bundle with cloud DVR.',
    verified: true,
    featured: true,
    image: 'https://www.boxcast.com/hubfs/Whats%20a%20Streaming%20Site%20Header.png'
  },
  {
    id: 'cloudnest',
    name: 'CloudNest',
    category: 'Cloud',
    code: 'NEST50',
    reward: '$50 hosting credit',
    description: 'Fast app hosting for teams shipping sites, APIs, and dashboards.',
    verified: true,
    featured: true,
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'bytebank',
    name: 'ByteBank',
    category: 'Finance',
    code: 'BYTE100',
    reward: '$100 bonus after qualifying deposit',
    description: 'Modern digital banking with smart savings buckets and instant cards.',
    verified: true,
    featured: false,
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'fitline',
    name: 'FitLine',
    category: 'Fitness',
    code: 'MOVE30',
    reward: '30 free premium days',
    description: 'Training plans, nutrition tracking, and friendly progress rituals.',
    verified: true,
    featured: false,
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=80'
  }
];

const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8787';

function App() {
  const [referrals, setReferrals] = useState(fallbackReferrals);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [copied, setCopied] = useState('');
  const [form, setForm] = useState({
    name: '',
    category: 'Streaming',
    code: '',
    reward: '',
    description: '',
    image: ''
  });

  React.useEffect(() => {
    fetch(`${apiUrl}/api/referrals`)
      .then((response) => response.json())
      .then((items) => Array.isArray(items) && setReferrals(items))
      .catch(() => setReferrals(fallbackReferrals));
  }, []);

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(referrals.map((item) => item.category)))],
    [referrals]
  );

  const filtered = useMemo(() => {
    return referrals.filter((item) => {
      const haystack = `${item.name} ${item.category} ${item.code} ${item.reward}`.toLowerCase();
      return haystack.includes(query.toLowerCase()) && (category === 'All' || item.category === category);
    });
  }, [category, query, referrals]);

  const featured = referrals.find((item) => item.featured) || referrals[0];

  async function copyCode(code) {
    await navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(''), 1400);
  }

  async function submitReferral(event) {
    event.preventDefault();
    const response = await fetch(`${apiUrl}/api/referrals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });

    if (response.ok) {
      const item = await response.json();
      setReferrals((current) => [item, ...current]);
      setForm({ name: '', category: 'Streaming', code: '', reward: '', description: '', image: '' });
    }
  }

  return (
    <main>
      <nav className="nav">
        <a className="brand" href="#top" aria-label="Frienpon TV home">
          <span className="brand-mark">F</span>
          <span>FRIENPON</span>
        </a>
        <div className="nav-actions">
          <a href="#codes">Browse</a>
          <a href="#submit">Submit</a>
        </div>
      </nav>

      <section className="hero" id="top">
        <div className="hero-copy">
          <div className="eyebrow">
            <Sparkles size={16} />
            Referral codes, cleanly indexed
          </div>
          <h1>Find codes worth copying.</h1>
          <p>
            A minimal referral directory for streaming, cloud, finance, shopping, and everyday tools.
            Search offers, copy a code.
          </p>
          <div className="search-panel">
            <Search size={20} />
            <input
              aria-label="Search referral codes"
              placeholder="Search brand, category, reward, or code"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        </div>

        {featured && (
          <article className="featured-card">
            <img id='featured-img' src={featured.image} alt="" />
            <div className="featured-overlay">
              <div>
                <span className="pill">
                  <Star size={14} fill="currentColor" /> Featured
                </span>
                <h2>{featured.name}</h2>
                <p>{featured.reward}</p>
              </div>
              <button onClick={() => copyCode(featured.code)}>
                {copied === featured.code ? <Check size={18} /> : <Clipboard size={18} />}
                {copied === featured.code ? 'Copied' : featured.code}
              </button>
            </div>
          </article>
        )}
      </section>

      <section className="stats-strip" aria-label="Frienpon TV highlights">
        <div>
          <strong>{referrals.length}</strong>
          <span id='lc'>live codes</span>
        </div>
        <div>
          <strong>{categories.length - 1}</strong>
          <span>categories</span>
        </div>
        <div className="c3">
          <strong>Built by users</strong>
          <span>Growing daily</span>
        </div>
      </section>

      <section className="codes-section" id="codes">
        <div className="section-head">
          <div>
            <span className="eyebrow dark">
              <ShieldCheck size={16} />
              curated directory
            </span>
            <h2>Browse referral codes</h2>
          </div>
          <div className="tabs" role="tablist" aria-label="Filter categories">
            {categories.map((name) => (
              <button
                className={category === name ? 'active' : ''}
                key={name}
                onClick={() => setCategory(name)}
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        <div className="code-grid">
          {filtered.map((item) => (
            <article className="code-card" key={item.id}>
              <img src={item.image || fallbackReferrals[0].image} alt="" />
              <div className="card-body">
                <div className="card-topline">
                  <span>{item.category}</span>
                  {item.verified && (
                    <span className="verified">
                      <BadgeCheck size={15} />
                      Verified
                    </span>
                  )}
                </div>
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                <div className="reward">{item.reward}</div>
                <button className="copy-button" onClick={() => copyCode(item.code)}>
                  {copied === item.code ? <Check size={18} /> : <Clipboard size={18} />}
                  {copied === item.code ? 'Copied' : item.code}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="submit-section" id="submit">
        <div className="panel">
          <Gift size={24} />
          <h2>Turn your referral into someone's next reward</h2>
          <p>
          Whether it's a streaming service, banking app, fitness platform, or online store, your referral code could help someone save money, unlock bonuses, or discover something new.
          </p>
        </div>

        <form onSubmit={submitReferral}>
          <span className="eyebrow dark">
            <Upload size={16} />
            add a code
          </span>
          <h2>Submit a referral</h2>
          <div className="form-row">
            <input required placeholder="Brand name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            <input required placeholder="Referral code" value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value })} />
          </div>
          <div className="form-row">
            <select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>
              {['Streaming', 'Cloud', 'Finance', 'Fitness', 'Shopping', 'Education', 'Other'].map((name) => (
                <option key={name}>{name}</option>
              ))}
            </select>
            <input required placeholder="Reward" value={form.reward} onChange={(event) => setForm({ ...form, reward: event.target.value })} />
          </div>
          <input placeholder="Image URL" value={form.image} onChange={(event) => setForm({ ...form, image: event.target.value })} />
          <textarea placeholder="Short description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
          <button className="primary" type="submit">
            <Upload size={18} />
            Submit code
          </button>
        </form>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
