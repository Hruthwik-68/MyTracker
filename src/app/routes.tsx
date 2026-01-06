import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import PlansPage from '../pages/Plans/PlansPage'
import DailyTodoPage from '../pages/DailyTodo/DailyTodoPage'
import DailyChecklistPage from '../pages/DailyChecklist/DailyChecklistPage'

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/plans" />} />
        <Route path="/plans" element={<PlansPage />} />
        <Route path="/daily-todo" element={<DailyTodoPage />} />
        <Route path="/daily-checklist" element={<DailyChecklistPage />} />
      </Routes>
    </BrowserRouter>
  )
}
