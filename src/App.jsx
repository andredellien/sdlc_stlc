import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import SDLC from './pages/SDLC';
import STLC from './pages/STLC';
import Integracion from './pages/Integracion';
import { AppProvider } from './store/AppContext';
import 'reactflow/dist/style.css';

const LinkBtn = ({to, children}) => (
    <NavLink to={to} className={({isActive})=>`px-3 py-2 rounded-xl ${isActive?'bg-black text-white':'bg-white text-black border hover:bg-slate-100'}`}>
        {children}
    </NavLink>
);

export default function App(){
    return (
        <AppProvider>
            <Router>
                <div className="min-h-screen">
                    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b">
                        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
                            <div className="font-bold">SDLC × STLC</div>
                            <div className="flex gap-2">
                                <LinkBtn to="/">SDLC</LinkBtn>
                                <LinkBtn to="/stlc">STLC</LinkBtn>
                                <LinkBtn to="/integracion">Integración</LinkBtn>
                            </div>
                        </div>
                    </nav>
                    <main className="max-w-6xl mx-auto p-4 md:p-6">
                        <Routes>
                            <Route path="/" element={<SDLC/>} />
                            <Route path="/stlc" element={<STLC/>} />
                            <Route path="/integracion" element={<Integracion/>} />
                        </Routes>
                    </main>
                </div>
            </Router>
        </AppProvider>
    );
}

