import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AppProvider } from './store'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Timetable from './pages/Timetable'
import Courses from './pages/Courses'

import Sessions from './pages/Sessions'
import Departments from './pages/Departments'
import Programs from './pages/Programs'
import Classes from './pages/Classes'
import Lecturers from './pages/Lecturers'
import Rooms from './pages/Rooms'
import AcademicYears from './pages/AcademicYears'
import Reports from './pages/Reports'

// Create a client
const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/sessions" element={<Sessions />} />
              <Route path="/departments" element={<Departments />} />
              <Route path="/programs" element={<Programs />} />
              <Route path="/classes" element={<Classes />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/lecturers" element={<Lecturers />} />
              <Route path="/rooms" element={<Rooms />} />
              <Route path="/timetable" element={<Timetable />} />
              <Route path="/academic-years" element={<AcademicYears />} />
              <Route path="/reports" element={<Reports />} />

            </Routes>
          </Layout>
        </Router>
      </AppProvider>
    </QueryClientProvider>
  )
}

export default App
