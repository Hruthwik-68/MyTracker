export interface Plan {
  id: string
  user_id: string
  type: 'CP' | 'DIET' | 'GYM'
  title: string | null
  content: string | null
  created_at: string
  updated_at: string
}

export interface ChecklistItem {
  id: string
  user_id: string
  name: string
  category: 'ROUTINE' | 'SUPPLEMENT' | 'DIET'
  is_persistent: boolean
  order_index: number
  metadata: Record<string, any> | null
  created_at: string
}

export interface DailyChecklist {
  id: string
  user_id: string
  checklist_item_id: string
  date: string
  is_done: boolean
  value: string | null
  created_at: string
}

export interface FoodEntry {
  id: string
  user_id: string
  date: string
  food_name: string
  calories: number
  protein: number
  fat: number
  carbs: number
  fibre: number
  created_at: string
}

export interface WaterEntry {
  id: string
  user_id: string
  date: string
  litres: number
  created_at: string
}

export interface DailyTodo {
  id: string
  user_id: string
  date: string
  category: 'COMMON' | 'DSA'
  task: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  is_done: boolean
  created_at: string
}

export interface Streak {
  id: string
  user_id: string
  date: string
  is_success: boolean
  created_at?: string
}

export interface DailyStat {
  id: string
  user_id: string
  date: string
  calories_intake: number
  calories_burned: number
  protein: number
  carbs: number
  fibre: number
  water_litres: number
  sleep_hours: number
  energy_level: number | null
  focus_level: number | null
  consistency: boolean | null
  created_at: string
}