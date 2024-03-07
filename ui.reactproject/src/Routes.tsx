import React from 'react';
import HomeComponent from './components/HomeComponent/Home';
import {Route, Routes } from "react-router-dom"

const ROUTES: React.FC = () => {
    return (
        <>
           <Routes>
            <Route path="/" Component={HomeComponent} />
            </Routes>
            
        </>
    );
};

export default ROUTES;