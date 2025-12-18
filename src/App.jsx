import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Lenis from 'lenis';
import Navbar from './components/Navbar';
import ThreeBackground from './components/ThreeBackground';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import TournamentDetails from './pages/TournamentDetails';
import Teams from './pages/Teams';
import About from './pages/About';
import CreateTournament from './pages/CreateTournament';

function App() {

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      // cleanup
    };
  }, []);

  return (
    <Router>
      <div className="text-white selection:bg-brand-primary selection:text-black">
        <ThreeBackground />
        <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tournaments" element={<Dashboard />} />
          <Route path="/tournaments/:id" element={<TournamentDetails />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/about" element={<About />} />
          <Route path="/create" element={<CreateTournament />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
