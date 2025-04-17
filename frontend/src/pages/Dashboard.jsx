import React from 'react';
import { useUser } from '../context/UserContext.jsx';

function Activities() {
    const { user, loading } = useUser();
    if (loading) return <p>Chargement...</p>;
    if (!user) return <p>Non connecté</p>;
    return (
        <>
            <h1>Bienvenue, {user.prenom}</h1>
        </>
    );
}

export default Activities;