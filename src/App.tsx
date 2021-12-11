import React, { ReactElement } from 'react';
import { Route, Routes } from 'react-router-dom';
import LoginPage from './components/LoginPage';

export default function App(): ReactElement {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />}></Route>
    </Routes>
  );
}
