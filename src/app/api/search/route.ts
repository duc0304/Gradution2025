import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import Papa from 'papaparse'

interface StudentRecord {
  id: string
  ky_hoc: string
  mssv: string
  ho_ten_dem: string
  ten: string
  ngay_sinh: string
  que_quan: string
  gioi_tinh: string
  hang_bang: string
  nganh: string
  lop: string
  cpa: string
  truong: string
  trinh_do: string
  ho_ten_day_du: string
}

// Cache data để tránh đọc file nhiều lần
let cachedData: StudentRecord[] | null = null
let lastLoadTime = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 phút

const loadStudentData = (): StudentRecord[] => {
  const now = Date.now()
  
  // Sử dụng cache nếu còn valid
  if (cachedData && (now - lastLoadTime) < CACHE_DURATION) {
    return cachedData
  }

  try {
    // Đọc file CSV từ thư mục student-data (không public)
    const csvPath = path.join(process.cwd(), 'student-data', 'data.csv')
    const csvText = fs.readFileSync(csvPath, 'utf-8')
    
    const parseResult = Papa.parse(csvText, { header: false })
    
    const cleanData = parseResult.data
      .filter((row: unknown): row is unknown[] => Array.isArray(row) && row.length >= 14)
      .map((row) => ({
        id: row[0],
        ky_hoc: row[1],
        mssv: row[2],
        ho_ten_dem: row[3],
        ten: row[4],
        ngay_sinh: row[5],
        que_quan: row[6],
        gioi_tinh: row[7],
        hang_bang: row[8],
        nganh: row[9],
        lop: row[10],
        cpa: row[11],
        truong: row[12],
        trinh_do: row[13],
        ho_ten_day_du: `${row[3]} ${row[4]}`,
      })) as StudentRecord[]

    // Update cache
    cachedData = cleanData
    lastLoadTime = now
    
    console.log(`📊 Loaded ${cleanData.length} student records from CSV`)
    return cleanData
    
  } catch (error) {
    console.error('❌ Error loading CSV:', error)
    throw new Error('Không thể tải dữ liệu sinh viên')
  }
}

const searchStudents = (data: StudentRecord[], query: string): StudentRecord[] => {
  if (!query.trim()) return []
  
  const term = query.toLowerCase().trim()
  console.log(`🔍 Searching for: "${term}"`)
  
  // Tìm kiếm theo MSSV trước
  const mssvResults = data.filter(record => {
    if (!record.mssv) return false
    const mssv = record.mssv.toLowerCase()
    return mssv === term || mssv.includes(term)
  })
  
  if (mssvResults.length > 0) {
    console.log(`✅ Found ${mssvResults.length} MSSV matches`)
    return mssvResults
  }
  
  // Nếu không tìm thấy MSSV, tìm theo tên
  const nameResults = data.filter(record => {
    if (!record.ho_ten_day_du) return false
    
    const hoTenDayDu = record.ho_ten_day_du.toLowerCase()
    const ho = record.ho_ten_dem?.toLowerCase() || ''
    const ten = record.ten?.toLowerCase() || ''
    
    return hoTenDayDu.includes(term) || ho.includes(term) || ten.includes(term)
  })
  
  console.log(`✅ Found ${nameResults.length} name matches`)
  return nameResults
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    
    // Validation
    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 })
    }
    
    if (query.length < 2) {
      return NextResponse.json({ error: 'Query must be at least 2 characters' }, { status: 400 })
    }
    
    if (query.length > 50) {
      return NextResponse.json({ error: 'Query too long' }, { status: 400 })
    }
    
    // Load và search
    const data = loadStudentData()
    const results = searchStudents(data, query)
    
    // Format response data (chỉ trả fields cần thiết)
    const formattedResults = results.map(record => ({
      mssv: record.mssv,
      ho_ten_day_du: record.ho_ten_day_du,
      ngay_sinh: record.ngay_sinh,
      que_quan: record.que_quan,
      gioi_tinh: record.gioi_tinh,
      hang_bang: record.hang_bang,
      nganh: record.nganh,
      lop: record.lop,
      cpa: record.cpa,
      truong: record.truong,
      trinh_do: record.trinh_do,
      ky_hoc: record.ky_hoc,
    }))
    
    // Response với metadata
    return NextResponse.json({
      success: true,
      query,
      results: formattedResults,
      total: results.length,
      total_students: data.length,
    })
    
  } catch (error) {
    console.error('❌ API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

// Endpoint để lấy stats (không sensitive)
export async function POST(request: NextRequest) {
  try {
    const data = loadStudentData()
    
    return NextResponse.json({
      success: true,
      total_students: data.length,
      ky_hoc: '2024.2B',
    })
    
  } catch (error) {
    console.error('❌ Stats API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
} 