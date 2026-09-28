import { Link, Route, Routes, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import TutorialPage from './pages/TutorialPage';
import ShowcasePage from './pages/ShowcasePage';
import LabPage from './pages/LabPage';
import styles from './App.module.css';

const NAV = [
  { to: '/', label: 'home', match: (p: string) => p === '/' || p.startsWith('/tutorial') },
  { to: '/showcase', label: 'showcase', match: (p: string) => p.startsWith('/showcase') },
  { to: '/lab', label: 'lab', match: (p: string) => p.startsWith('/lab') },
];

function Nav() {
  const { pathname } = useLocation();
  const activeIndex = NAV.findIndex((item) => item.match(pathname));

  return (
    <nav className={styles.nav}>
      {NAV.map((item, i) => (
        <span key={item.to}>
          {i > 0 && <span className={styles.sep}>· </span>}
          <Link
            to={item.to}
            className={i === activeIndex ? `${styles.link} ${styles.current}` : styles.link}
          >
            {item.label}
          </Link>
        </span>
      ))}
    </nav>
  );
}

export default function App() {
  return (
    <div className={styles.shell}>
      <Nav />
      <main className={styles.main}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/tutorial/:weekSeg/:stepSeg" element={<TutorialPage />} />
          <Route path="/showcase" element={<ShowcasePage />} />
          <Route path="/showcase/:feature" element={<ShowcasePage />} />
          <Route path="/lab" element={<LabPage />} />
          <Route path="/lab/:feature" element={<LabPage />} />
          <Route path="*" element={<p>404 — no such page.</p>} />
        </Routes>
      </main>
    </div>
  );
}
