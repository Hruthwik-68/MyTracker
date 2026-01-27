export interface Plan {
  id: string
  user_id: string
  type: 'CP' | 'DIET' | 'GYM'
  title: string
  content: string
  created_at: string
  updated_at: string
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

export interface ChecklistItem {
  id: string
  user_id: string
  category: 'ROUTINE' | 'SUPPLEMENT' | 'DIET'
  name: string
  is_persistent: boolean
  order_index: number
  metadata?: {
    // For DIET items
    unit?: 'gram' | 'unit' | 'scoop' | 'litre'
    calories?: number
    protein?: number
    fats?: number
    carbs?: number
    fiber?: number
    // For ROUTINE items (exercises)
    calories_burn?: number
  } | null
  created_at: string
}

export interface DailyChecklist {
  id: string
  user_id: string
  date: string
  checklist_item_id: string
  is_done: boolean
  value?: string | null
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

export interface DailyStat {
  id: string
  user_id: string
  date: string
  calories_intake: number | null
  calories_burned: number | null
  protein: number | null
  carbs: number | null
  fibre: number | null
  water_litres: number | null
  sleep_hours: number | null
  energy_level: number | null
  focus_level: number | null
  consistency: boolean | null
  dsa_hours: number | null
  lld_hours: number | null
  problems_solved: number | null
  gym_hours: number | null
  created_at: string
  updated_at: string
}

export interface Streak {
  id: string
  user_id: string
  date: string
  is_success: boolean
  created_at: string
}

export interface Note {
  id: string
  user_id: string
  date: string
  content: string
  created_at: string
  updated_at: string
}


export interface ChecklistTodo {
  id: string
  user_id: string
  date: string
  task: string
  is_done: boolean
  tags: string[] // Array of tag names
  created_at: string
  original_date: string // Track when todo was first created
}

export interface TodoTag {
  id: string
  user_id: string
  name: string
  color: string // Hex color
  created_at: string
}
