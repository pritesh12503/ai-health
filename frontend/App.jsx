import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'

// Pages
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import TriageInput from './pages/TriageInput'
import TriageResult from './pages/TriageResult'
import PrescriptionInput from './pages/PrescriptionInput'
import PrescriptionResult from './pages/PrescriptionResult'
import History from './pages/History'
import Profile from './pages/Profile'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/triage" element={<ProtectedRoute><TriageInput /></ProtectedRoute>} />
          <Route path="/triage/result/:id" element={<ProtectedRoute><TriageResult /></ProtectedRoute>} />
          <Route path="/prescription" element={<ProtectedRoute><PrescriptionInput /></ProtectedRoute>} />
          <Route path="/prescription/result/:id" element={<ProtectedRoute><PrescriptionResult /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
