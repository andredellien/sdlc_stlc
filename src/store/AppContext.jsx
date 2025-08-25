import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';

const AppCtx = createContext(null);

export function AppProvider({ children }) {
    const [users, setUsers] = useState(() => {
        try { return JSON.parse(localStorage.getItem('users')||'[]'); } catch { return []; }
    });
    const [sessionUserId, setSessionUserId] = useState(null);

    const [completed, setCompleted] = useState(() => {
        try { return JSON.parse(localStorage.getItem('completed')||'{"sdlc":[],"stlc":[]}'); } catch { return { sdlc:[], stlc:[] }; }
    });

    const [edgesIntegracion, setEdgesIntegracion] = useState(() => {
        try { return JSON.parse(localStorage.getItem('edgesIntegracion')||'[]'); } catch { return []; }
    });

    useEffect(()=>localStorage.setItem('users', JSON.stringify(users)), [users]);
    useEffect(()=>localStorage.setItem('completed', JSON.stringify(completed)), [completed]);
    useEffect(()=>localStorage.setItem('edgesIntegracion', JSON.stringify(edgesIntegracion)), [edgesIntegracion]);

    const addUser = (u) => setUsers(prev => [...prev, { id: crypto.randomUUID(), ...u }]);
    const removeUser = (id) => setUsers(prev => prev.filter(u=>u.id!==id));

    const login = (id, pass) => {
        const usr = users.find(u=>u.id===id);
        if(!usr) return { ok:false, error:'Usuario no encontrado' };
        if(usr.password !== pass) return { ok:false, error:'Contraseña inválida' };
        setSessionUserId(id);
        return { ok:true };
    };
    const logout = () => setSessionUserId(null);

    const markCompleted = (flow, ids) => setCompleted(prev => ({
        ...prev,
        [flow]: Array.from(new Set([...prev[flow], ...ids]))
    }));
    const resetCompleted = (flow) => setCompleted(prev => ({ ...prev, [flow]: [] }));

    const value = useMemo(()=>({
        users, addUser, removeUser,
        sessionUserId, login, logout,
        completed, markCompleted, resetCompleted,
        edgesIntegracion, setEdgesIntegracion
    }), [users, sessionUserId, completed, edgesIntegracion]);

    return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export const useApp = ()=> useContext(AppCtx);
