"use client";

import { useState, useEffect } from "react";

interface StudentRecord {
  mssv: string;
  ho_ten_day_du: string;
  ngay_sinh: string;
  que_quan: string;
  gioi_tinh: string;
  hang_bang: string;
  nganh: string;
  lop: string;
  cpa: string;
  truong: string;
  trinh_do: string;
  ky_hoc: string;
}

interface SearchResponse {
  success: boolean;
  query: string;
  results: StudentRecord[];
  total: number;
  total_students: number;
  error?: string;
}

interface StatsResponse {
  success: boolean;
  total_students: number;
  ky_hoc: string;
  error?: string;
}

export default function Home() {
  const [searchResults, setSearchResults] = useState<StudentRecord[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchQuery, setSearchQuery] = useState(""); // Query để thực hiện search
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [error, setError] = useState("");

  // Load stats khi component mount
  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await fetch("/api/search", {
          method: "POST",
        });
        const data: StatsResponse = await response.json();

        if (data.success) {
          setTotalStudents(data.total_students);
        }
      } catch (err) {
        console.error("❌ Error loading stats:", err);
      } finally {
        setIsLoadingStats(false);
      }
    };

    loadStats();
  }, []);

  // Thực hiện search qua API
  const performSearch = async (query: string) => {
    if (!query.trim()) return;

    setIsSearching(true);
    setError("");

    try {
      console.log("🚀 Searching via API for:", query);

      const response = await fetch(
        `/api/search?q=${encodeURIComponent(query)}`
      );
      const data: SearchResponse = await response.json();

      if (data.success) {
        setSearchResults(data.results);
        console.log(`✅ Found ${data.total} results via API`);
      } else {
        setError(data.error || "Có lỗi xảy ra khi tìm kiếm");
        setSearchResults([]);
      }
    } catch (err) {
      console.error("❌ Search API error:", err);
      setError("Không thể kết nối đến server");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("🚀 Submitting search for:", searchTerm);
    setSearchQuery(searchTerm);
    performSearch(searchTerm);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setSearchQuery("");
    setSearchResults([]);
    setError("");
    console.log("🧹 Cleared search");
  };

  // Format display data for results
  const formatSecondaryData = (record: StudentRecord) => {
    return {
      MSSV: record.mssv,
      "Ngày sinh": record.ngay_sinh,
      "Quê quán": record.que_quan,
      "Giới tính": record.gioi_tinh,
      Ngành: record.nganh,
      Lớp: record.lop,
      Trường: record.truong,
      "Trình độ": record.trinh_do,
      "Kỳ học": record.ky_hoc,
    };
  };

  const getGradeColor = (grade: string) => {
    switch (grade?.toLowerCase()) {
      case "xuất sắc":
        return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white";
      case "giỏi":
        return "bg-gradient-to-r from-green-500 to-green-700 text-white";
      case "khá":
        return "bg-gradient-to-r from-blue-500 to-blue-700 text-white";
      case "trung bình":
        return "bg-gradient-to-r from-gray-500 to-gray-700 text-white";
      default:
        return "bg-gradient-to-r from-gray-400 to-gray-600 text-white";
    }
  };

  const getCPAColor = (cpa: string) => {
    const score = parseFloat(cpa);
    if (score >= 3.6) return "text-yellow-600 font-bold"; // Xuất sắc
    if (score >= 3.2) return "text-green-600 font-bold"; // Giỏi
    if (score >= 2.5) return "text-blue-600 font-bold"; // Khá
    return "text-gray-600 font-bold"; // Trung bình
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header màu đỏ */}
      <header className="bg-[#AA1D2B] shadow-lg">
        <div className="container mx-auto px-4 py-4 md:py-6">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-lalezar font-bold text-white mb-1 md:mb-2 tracking-wide leading-tight">
              🎓 HỆ THỐNG TRA CỨU KẾT QUẢ
            </h1>
            <p className="text-red-100 text-sm sm:text-base md:text-lg lg:text-xl font-lalezar font-medium">
              Tra cứu điểm tốt nghiệp theo MSSV hoặc Họ tên
            </p>
          </div>
        </div>

        {/* Decorative bottom border */}
        <div className="h-1 bg-gradient-to-r from-red-800 via-red-600 to-red-800"></div>
      </header>

      <main className="container mx-auto px-4 py-6 md:py-12">
        {/* Search Section */}
        <div className="max-w-3xl mx-auto mb-8 md:mb-12">
          <form onSubmit={handleSearch} className="relative">
            <div className="bg-white rounded-xl md:rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Nhập MSSV hoặc họ tên..."
                    className="w-full pl-10 pr-4 md:pl-12 md:pr-8 py-3 md:py-6 text-sm md:text-lg text-gray-800 border-none outline-none focus:ring-0 placeholder-gray-400"
                    disabled={isSearching}
                  />
                  <div className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm md:text-base">
                    🔍
                  </div>
                </div>
                <div className="flex border-t sm:border-t-0 sm:border-l border-gray-100">
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="flex-1 sm:flex-none px-3 md:px-6 py-2.5 md:py-6 bg-gray-500 text-white font-lalezar font-bold text-xs md:text-lg hover:bg-gray-600 transition-all duration-300"
                      disabled={isSearching}
                    >
                      XÓA
                    </button>
                  )}
                  <button
                    type="submit"
                    className="flex-1 sm:flex-none px-4 md:px-10 py-2.5 md:py-6 bg-[#AA1D2B] text-white font-lalezar font-bold text-xs md:text-xl hover:bg-red-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
                    disabled={isSearching || !searchTerm.trim()}
                  >
                    {isSearching ? "ĐANG TÌM..." : "TÌM KIẾM"}
                  </button>
                </div>
              </div>
            </div>
          </form>

          {/* Search Tips */}
          <div className="mt-3 md:mt-6 text-center px-2">
            <div className="inline-flex items-center bg-white px-3 md:px-8 py-2 md:py-4 rounded-full shadow-md border border-gray-200 max-w-full">
              <span className="text-[#AA1D2B] font-semibold mr-1.5 md:mr-3 text-sm md:text-lg flex-shrink-0">
                💡
              </span>
              <span className="text-gray-600 font-medium text-xs md:text-lg text-center">
                Nhập từ khóa và nhấn Enter hoặc click &quot;TÌM KIẾM&quot;
              </span>
            </div>
            {searchQuery && (
              <div className="mt-2 md:mt-3 inline-flex items-center bg-blue-50 px-2.5 md:px-4 py-1.5 md:py-2 rounded-full shadow-sm border border-blue-200 max-w-full">
                <span className="text-blue-600 font-medium text-xs md:text-sm text-center break-words">
                  🔍 Đang hiển thị kết quả cho: &quot;{searchQuery}&quot;
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Loading State */}
        {isSearching && (
          <div className="text-center py-16">
            <div className="inline-block relative">
              <div className="w-16 h-16 border-4 border-[#AA1D2B] border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-red-200 rounded-full"></div>
            </div>
            <p className="mt-6 text-gray-600 text-lg font-medium">
              Đang tìm kiếm...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center shadow-lg">
              <div className="text-6xl mb-4">❌</div>
              <h3 className="text-xl font-bold text-red-800 mb-2">{error}</h3>
              <p className="text-red-600">
                Vui lòng thử lại hoặc kiểm tra từ khóa tìm kiếm.
              </p>
            </div>
          </div>
        )}

        {/* Search Results */}
        {!isSearching && !error && searchQuery && (
          <div className="max-w-7xl mx-auto">
            {searchResults.length > 0 ? (
              <div>
                {/* Results Header */}
                <div className="bg-white rounded-xl md:rounded-2xl shadow-lg border border-gray-200 p-4 md:p-6 mb-6 md:mb-8">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <h2 className="text-xl md:text-4xl font-lalezar font-bold text-gray-800">
                      📊 Kết quả tìm kiếm
                    </h2>
                    <div className="bg-[#AA1D2B] text-white px-4 md:px-6 py-1.5 md:py-2 rounded-full font-lalezar font-bold text-sm md:text-lg self-start sm:self-auto">
                      {searchResults.length} kết quả
                    </div>
                  </div>
                </div>

                {/* Results Grid */}
                <div className="grid gap-8">
                  {searchResults.map((record, index) => {
                    const secondaryData = formatSecondaryData(record);
                    return (
                      <div
                        key={record.mssv}
                        className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                      >
                        {/* Card Header */}
                        <div className="bg-gradient-to-r from-[#AA1D2B] to-red-700 px-4 md:px-8 py-3 md:py-6">
                          <div className="flex items-center justify-between">
                            <h3 className="text-xl md:text-4xl font-lalezar font-bold text-white">
                              {record.ho_ten_day_du}
                            </h3>
                            <div className="bg-white bg-opacity-20 px-3 md:px-4 py-1 md:py-2 rounded-full">
                              <span className="text-red-500 font-lalezar font-semibold text-sm md:text-lg">
                                {record.mssv}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Primary Info - Hạng bằng & CPA */}
                        <div className="p-4 md:p-8 pb-3 md:pb-4 border-b border-gray-100">
                          <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                            {/* Hạng bằng */}
                            <div className="text-center">
                              <div className="mb-2 md:mb-3">
                                <span className="text-gray-500 text-xs md:text-lg font-medium uppercase tracking-wide">
                                  🏆 Hạng bằng
                                </span>
                              </div>
                              <div
                                className={`inline-block px-4 md:px-6 py-2 md:py-3 rounded-full font-lalezar font-bold text-lg md:text-2xl ${getGradeColor(
                                  record.hang_bang
                                )}`}
                              >
                                {record.hang_bang || "N/A"}
                              </div>
                            </div>

                            {/* CPA */}
                            <div className="text-center">
                              <div className="mb-2 md:mb-3">
                                <span className="text-gray-500 text-xs md:text-lg font-medium uppercase tracking-wide">
                                  📈 Điểm CPA
                                </span>
                              </div>
                              <div
                                className={`text-4xl md:text-5xl font-lalezar ${getCPAColor(
                                  record.cpa
                                )}`}
                              >
                                {record.cpa || "N/A"}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Secondary Info - Collapsed by default */}
                        <details className="group">
                          <summary className="cursor-pointer p-3 md:p-4 bg-gray-50 hover:bg-gray-100 transition-colors list-none">
                            <div className="flex items-center">
                              <svg
                                className="w-4 h-4 md:w-5 md:h-5 text-gray-500 group-open:rotate-180 transition-transform duration-200 mr-2 md:mr-3"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              <span className="text-gray-700 font-medium text-sm md:text-base">
                                📋 Thông tin chi tiết
                              </span>
                            </div>
                          </summary>

                          <div className="p-3 md:p-6 bg-gradient-to-br from-gray-50 to-gray-100">
                            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
                              {Object.entries(secondaryData).map(
                                ([key, value]) => (
                                  <div
                                    key={key}
                                    className="bg-white rounded-lg md:rounded-xl p-2.5 md:p-4 border border-gray-200 shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
                                  >
                                    <dt className="text-xs md:text-sm font-bold text-[#AA1D2B] uppercase tracking-wide mb-1 md:mb-2 flex items-center">
                                      <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#AA1D2B] rounded-full mr-1 md:mr-2"></span>
                                      {key}
                                    </dt>
                                    <dd className="text-xs md:text-base font-semibold text-gray-800 leading-relaxed break-words">
                                      {value || "N/A"}
                                    </dd>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        </details>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="bg-white rounded-2xl shadow-xl p-12 max-w-2xl mx-auto border border-gray-200">
                  <div className="text-8xl mb-6">🤷‍♂️</div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">
                    Không tìm thấy kết quả
                  </h3>
                  <p className="text-gray-600 text-lg">
                    Vui lòng kiểm tra lại MSSV hoặc họ tên sinh viên
                  </p>
                  <button
                    onClick={handleClearSearch}
                    className="mt-6 inline-flex items-center bg-[#AA1D2B] text-white px-6 py-3 rounded-full font-semibold hover:bg-red-700 transition-colors cursor-pointer"
                  >
                    <span className="mr-2">🔄</span>
                    Thử lại với từ khóa khác
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Stats */}
        {!isLoadingStats && totalStudents > 0 && (
          <div className="text-center mt-8 md:mt-16 mb-6 md:mb-10 px-4">
            <div className="inline-flex items-center bg-white px-4 md:px-10 py-3 md:py-5 rounded-xl md:rounded-2xl shadow-lg border border-gray-200 max-w-full">
              <span className="text-[#AA1D2B] text-lg md:text-3xl mr-2 md:mr-4 flex-shrink-0">
                📈
              </span>
              <span className="text-gray-600 text-sm md:text-xl font-medium text-center">
                Hệ thống quản lý
                <span className="font-bold text-[#AA1D2B] mx-1 md:mx-2">
                  {totalStudents}
                </span>
                sinh viên tốt nghiệp kỳ 2024.2B
              </span>
            </div>
          </div>
        )}

        {/* Instructions */}
        {!isSearching && !error && !searchQuery && (
          <div className="max-w-6xl mx-auto px-4">
            <div className="bg-white rounded-xl md:rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              {/* Instructions Header */}
              <div className="bg-gradient-to-r from-gray-800 to-black px-4 md:px-8 py-4 md:py-6">
                <h3 className="text-lg md:text-3xl font-lalezar font-bold text-white text-center">
                  📖 HƯỚNG DẪN SỬ DỤNG HỆ THỐNG
                </h3>
              </div>

              {/* Instructions Content */}
              <div className="p-4 md:p-10">
                <div className="grid md:grid-cols-2 gap-6 md:gap-10">
                  <div className="text-center">
                    <div className="bg-[#AA1D2B] w-12 h-12 md:w-20 md:h-20 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
                      <span className="text-xl md:text-3xl text-white">🎯</span>
                    </div>
                    <h4 className="text-lg md:text-2xl font-lalezar font-bold text-[#AA1D2B] mb-3 md:mb-4">
                      TÌM KIẾM THEO MSSV
                    </h4>
                    <div className="bg-red-50 rounded-lg md:rounded-xl p-4 md:p-6 border border-red-100">
                      <ul className="text-gray-700 space-y-2 md:space-y-3 text-left">
                        <li className="flex items-center text-sm md:text-base">
                          <span className="text-[#AA1D2B] mr-2 md:mr-3">✓</span>
                          Nhập chính xác mã số sinh viên
                        </li>
                        <li className="flex items-center text-sm md:text-base">
                          <span className="text-[#AA1D2B] mr-2 md:mr-3">✓</span>
                          Kết quả chính xác và nhanh nhất
                        </li>
                        <li className="flex items-center text-sm md:text-base">
                          <span className="text-[#AA1D2B] mr-2 md:mr-3">✓</span>
                          Ưu tiên hiển thị đầu tiên
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="bg-black w-12 h-12 md:w-20 md:h-20 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
                      <span className="text-xl md:text-3xl text-white">👤</span>
                    </div>
                    <h4 className="text-lg md:text-2xl font-lalezar font-bold text-gray-800 mb-3 md:mb-4">
                      TÌM KIẾM THEO TÊN
                    </h4>
                    <div className="bg-gray-50 rounded-lg md:rounded-xl p-4 md:p-6 border border-gray-200">
                      <ul className="text-gray-700 space-y-2 md:space-y-3 text-left">
                        <li className="flex items-center text-sm md:text-base">
                          <span className="text-gray-800 mr-2 md:mr-3">✓</span>
                          Nhập một phần hoặc toàn bộ họ tên
                        </li>
                        <li className="flex items-center text-sm md:text-base">
                          <span className="text-gray-800 mr-2 md:mr-3">✓</span>
                          Hỗ trợ tìm kiếm mờ (fuzzy search)
                        </li>
                        <li className="flex items-center text-sm md:text-base">
                          <span className="text-gray-800 mr-2 md:mr-3">✓</span>
                          Có thể trả về nhiều kết quả
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
