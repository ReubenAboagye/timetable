import React, { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AppProvider } from './store'
import Layout from './components/Layout'

// Lazy load page components
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Timetable = lazy(() => import('./pages/Timetable'))
const Courses = lazy(() => import('./pages/Courses'))
const Sessions = lazy(() => import('./pages/Sessions'))
const Departments = lazy(() => import('./pages/Departments'))
const Programs = lazy(() => import('./pages/Programs'))
const Classes = lazy(() => import('./pages/Classes'))
const Lecturers = lazy(() => import('./pages/Lecturers'))
const Rooms = lazy(() => import('./pages/Rooms'))
const AcademicYears = lazy(() => import('./pages/AcademicYears'))
const Reports = lazy(() => import('./pages/Reports'))

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
  </div>
)

// Create a client
const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <Router>
          <Layout>
            <Suspense fallback={<PageLoader />}>
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
            </Suspense>
          </Layout>
        </Router>
      </AppProvider>
    </QueryClientProvider>
  )
}

export default App
