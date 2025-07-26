import React, { useEffect, useState, useMemo } from 'react';
import SidebarOwner from '../../../components/SidebarOwner/SidebarOwner';
import './RevenuePage.css';
import { DatePicker } from 'antd';
import 'antd/dist/reset.css';
import dayjs from 'dayjs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:4999';

const monthNames = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
];

const RevenuePage = () => {
  const [viewType, setViewType] = useState('monthly');
  const [revenueData, setRevenueData] = useState([]);
  const [total, setTotal] = useState(0);
  const [grossTotal, setGrossTotal] = useState(0);
  const [platformFee, setPlatformFee] = useState(0);
  const [platformFeeRate, setPlatformFeeRate] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(dayjs());

  // Helper để lấy start/end theo viewType
  const getRange = useMemo(() => {
    if (viewType === 'daily') {
      const start = selectedDate.startOf('month').toISOString();
      const end = selectedDate.endOf('month').toISOString();
      return { start, end };
    } else if (viewType === 'monthly') {
      const start = selectedDate.startOf('year').toISOString();
      const end = selectedDate.endOf('year').toISOString();
      return { start, end };
    }
    return {};
  }, [viewType, selectedDate]);

  useEffect(() => {
    const fetchRevenue = async () => {
      setLoading(true);
      setError('');
      try {
        // FIX: Sửa logic gọi API cho daily view
        const apiType = viewType === 'daily' ? 'day' : 'year';
        let url = `${API_URL}/api/owner/revenue?type=${apiType}`;
        const { start, end } = getRange;
        if (start && end) url += `&start=${start}&end=${end}`;
        
        console.log('Fetching revenue from URL:', url); // Debug log
        
        const res = await fetch(url, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        const data = await res.json();
        console.log('API Response:', data); // Debug log
        
        if (data.success) {
          console.log('Revenue data from API:', data.revenue); // Debug log
          console.log('Total data from API:', data.total); // Debug log
          
          setRevenueData(data.revenue || []);
          setTotal(data.total?.totalRevenue || 0);
          setGrossTotal(data.total?.grossRevenue || 0);
          setPlatformFee(data.total?.platformFee || 0);
          setPlatformFeeRate(data.platformFeeRate || 0.1);
        } else {
          setError(data.message || 'Lỗi khi lấy dữ liệu doanh thu');
          setRevenueData([]);
        }
      } catch (err) {
        console.error('Revenue fetch error:', err);
        setError('Lỗi kết nối server');
        setRevenueData([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRevenue();
  }, [viewType, getRange]);

  // Prepare chart data based on view type
  const chartData = useMemo(() => {
    console.log('Processing chart data with revenueData:', revenueData); // Debug log
    
    if (!revenueData || revenueData.length === 0) {
      console.log('No revenue data available'); // Debug log
      return [];
    }

    let processedData = [];
    
    if (viewType === 'monthly') {
      // Create 12 months data for the selected year
      const year = selectedDate.year();
      console.log('Processing monthly data for year:', year); // Debug log
      
      // Initialize all 12 months with zero values
      for (let month = 1; month <= 12; month++) {
        processedData.push({
          period: `${year}-${String(month).padStart(2, '0')}`,
          displayPeriod: monthNames[month - 1],
          bookingCount: 0,
          revenue: 0,
          grossRevenue: 0,
          platformFee: 0
        });
      }
      
      // Fill in actual data from backend
      revenueData.forEach(item => {
        console.log('Processing revenue item:', item); // Debug log
        
        if (item.period && item.period.includes('-')) {
          const [itemYear, itemMonth] = item.period.split('-');
          console.log(`Comparing itemYear: ${itemYear} with year: ${year}`); // Debug log
          
          if (parseInt(itemYear, 10) === year) {
            const monthIndex = parseInt(itemMonth, 10) - 1;
            if (monthIndex >= 0 && monthIndex < 12) {
              console.log(`Updating month ${monthIndex + 1} with data:`, item); // Debug log
              processedData[monthIndex] = {
                period: item.period,
                displayPeriod: item.displayPeriod || monthNames[monthIndex],
                bookingCount: Math.max(0, item.bookingCount || 0),
                revenue: Math.max(0, item.revenue || 0),
                grossRevenue: Math.max(0, item.grossRevenue || 0),
                platformFee: Math.max(0, item.platformFee || 0)
              };
            }
          }
        }
      });
    } else {
      // Daily view - show all days in the selected period
      const { start, end } = getRange;
      if (!start || !end) {
        console.log('No start/end date for daily view'); // Debug log
        return [];
      }
      
      const startDate = new Date(start);
      const endDate = new Date(end);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        console.log('Invalid start/end dates'); // Debug log
        return [];
      }
      
      console.log('Processing daily data from', startDate, 'to', endDate); // Debug log
      
      // Create array of all dates in the range
      const dateArray = [];
      const currentDate = new Date(startDate);
      
      while (currentDate <= endDate) {
        dateArray.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      // Initialize all dates with zero values
      processedData = dateArray.map((date, index) => {
        const dateStr = date.toISOString().split('T')[0];
        return {
          period: dateStr,
          displayPeriod: String(date.getDate()).padStart(2, '0') + '/' + String(date.getMonth() + 1).padStart(2, '0'), // FIX: Sửa displayPeriod
          bookingCount: 0,
          revenue: 0,
          grossRevenue: 0,
          platformFee: 0
        };
      });
      
      // Fill in actual data from backend
      revenueData.forEach(item => {
        console.log('Processing daily revenue item:', item); // Debug log
        
        if (item.period) {
          const dataIndex = processedData.findIndex(d => d.period === item.period);
          if (dataIndex >= 0) {
            console.log(`Updating date ${item.period} with data:`, item); // Debug log
            processedData[dataIndex] = {
              period: item.period,
              displayPeriod: item.displayPeriod || processedData[dataIndex].displayPeriod,
              bookingCount: Math.max(0, item.bookingCount || 0),
              revenue: Math.max(0, item.revenue || 0),
              grossRevenue: Math.max(0, item.grossRevenue || 0),
              platformFee: Math.max(0, item.platformFee || 0)
            };
          }
        }
      });
    }
    
    console.log('Final processed chart data:', processedData); // Debug log
    return processedData;
  }, [revenueData, viewType, selectedDate, getRange]);

  // Định dạng số tiền
  const formatCurrency = (value) => {
    if (typeof value !== 'number' || isNaN(value)) return '0 VND';
    return value.toLocaleString('vi-VN') + ' VND';
  };

  // Định dạng số tiền ngắn gọn cho biểu đồ
  const formatCurrencyShort = (value) => {
    if (typeof value !== 'number' || isNaN(value)) return '0';
    return new Intl.NumberFormat('vi-VN', {
      notation: 'compact',
      compactDisplay: 'short'
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip" style={{
          backgroundColor: 'white',
          border: '1px solid #ccc',
          borderRadius: '8px',
          padding: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <p className="tooltip-label" style={{ 
            fontWeight: 'bold', 
            marginBottom: '8px',
            color: '#333'
          }}>
            {`Thời gian: ${label}`}
          </p>
          {payload.map((entry, index) => (
            <p key={index} style={{ 
              color: entry.color,
              margin: '4px 0',
              fontSize: '14px'
            }}>
              {`${entry.name}: ${entry.name.toLowerCase().includes('revenue') || entry.name.toLowerCase().includes('fee') ? 
                formatCurrency(entry.value) : entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Định dạng ngày tháng
  const renderDatePicker = () => {
    if (viewType === 'daily') {
      return (
        <DatePicker
          value={selectedDate}
          onChange={(date) => setSelectedDate(date || dayjs())}
          picker="month"
          format="MM/YYYY"
          placeholder="Chọn tháng"
          allowClear={false}
          disabled={loading}
          style={{ width: '100%' }}
        />
      );
    } else if (viewType === 'monthly') {
      return (
        <DatePicker
          value={selectedDate}
          onChange={(date) => setSelectedDate(date || dayjs())}
          picker="year"
          format="YYYY"
          placeholder="Chọn năm"
          allowClear={false}
          disabled={loading}
          style={{ width: '100%' }}
        />
      );
    }
    return null;
  };

  // Cải thiện logic kiểm tra dữ liệu
  const hasData = useMemo(() => {
    console.log('Checking hasData with chartData:', chartData); // Debug log
    console.log('Total revenue:', total, 'Gross total:', grossTotal); // Debug log
    
    // Kiểm tra nếu có tổng doanh thu hoặc có dữ liệu trong chartData
    const hasTotalRevenue = total > 0 || grossTotal > 0;
    const hasChartData = chartData && chartData.length > 0 && chartData.some(item => 
      (item.revenue && item.revenue > 0) || 
      (item.grossRevenue && item.grossRevenue > 0) || 
      (item.bookingCount && item.bookingCount > 0)
    );
    
    console.log('Has total revenue:', hasTotalRevenue); // Debug log
    console.log('Has chart data:', hasChartData); // Debug log
    
    return hasTotalRevenue || hasChartData;
  }, [chartData, total, grossTotal]);

 

  return (
    <div className="revenue-layout">
      <SidebarOwner />
      <div className="revenue-container-fullwidth">
        <div className="revenue-content-fullwidth">
          <h1>Doanh thu của bạn</h1>
          
       
          
          <div className="revenue-filter-bar">
            <div className="filter-row">
              <div className="filter-group">
                <label htmlFor="viewType">Hiển thị biểu đồ theo:</label>
                <select
                  id="viewType"
                  value={viewType}
                  onChange={(e) => setViewType(e.target.value)}
                  className="view-type-select"
                  disabled={loading}
                >
                  <option value="daily">Ngày</option>
                  <option value="monthly">Tháng</option>
                </select>
              </div>
              
              <div className="filter-group">
                <label htmlFor="date-picker">Chọn thời gian:</label>
                <div className="date-picker-wrapper">
                  {renderDatePicker()}
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Đang tải dữ liệu...</p>
            </div>
          ) : error ? (
            <div className="error-container">
              <p className="error-message">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="retry-button"
              >
                Thử lại
              </button>
            </div>
          ) : (
            <>
              <div className="revenue-summary-fullwidth">
                <div className="revenue-card main">
                  <h3>Doanh thu thực nhận</h3>
                  <div className="amount">{formatCurrency(total)}</div>
                  <div className="subtitle">Sau khi trừ phí platform</div>
                </div>
                
                <div className="revenue-breakdown">
                  <div className="revenue-card">
                    <h4>Tổng doanh thu gốc</h4>
                    <div className="amount-small">{formatCurrency(grossTotal)}</div>
                  </div>
                  <div className="revenue-card">
                    <h4>Phí platform ({(platformFeeRate * 100).toFixed(0)}%)</h4>
                    <div className="amount-small fee">{formatCurrency(platformFee)}</div>
                  </div>
                </div>
              </div>

              {/* Revenue Chart */}
              <div className="chart-container-fullwidth">
                <div className="chart-header">
                  <h3>Biểu đồ doanh thu {viewType === 'daily' ? 'theo ngày' : 'theo tháng'}</h3>
                  {chartData.length > 0 && (
                    <div className="chart-info">
                      <span className="data-points">Hiển thị {chartData.length} điểm dữ liệu</span>
                    </div>
                  )}
                </div>
                
                {!hasData ? (
                  <div className="no-data">
                    <div className="no-data-icon">📊</div>
                    <p>Không có dữ liệu doanh thu trong khoảng thời gian này</p>
                    <small>Hãy thử chọn khoảng thời gian khác hoặc kiểm tra lại dữ liệu</small>
                    <small>Debug: Total={total}, GrossTotal={grossTotal}, ChartData={chartData.length}</small>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={500}>
                    <BarChart 
                      data={chartData} 
                      margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                      barCategoryGap="8%"
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="displayPeriod" 
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        fontSize={12}
                        stroke="#666"
                        interval={0}
                      />
                      <YAxis 
                        tickFormatter={formatCurrencyShort}
                        fontSize={12}
                        stroke="#666"
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend 
                        wrapperStyle={{ paddingTop: '20px' }}
                        iconType="rect"
                      />
                      <Bar 
                        dataKey="grossRevenue" 
                        name="Doanh thu gốc" 
                        fill="#3b82f6" 
                        radius={[2, 2, 0, 0]}
                        maxBarSize={50}
                      />
                      <Bar 
                        dataKey="platformFee" 
                        name="Phí platform" 
                        fill="#ef4444" 
                        radius={[2, 2, 0, 0]}
                        maxBarSize={50}
                      />
                      <Bar 
                        dataKey="revenue" 
                        name="Doanh thu thực nhận" 
                        fill="#10b981" 
                        radius={[2, 2, 0, 0]}
                        maxBarSize={50}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Booking Count Chart */}
              <div className="chart-container-fullwidth">
                <div className="chart-header">
                  <h3>Số lượng booking {viewType === 'daily' ? 'theo ngày' : 'theo tháng'}</h3>
                  {chartData.length > 0 && (
                    <div className="chart-info">
                      <span className="total-bookings">
                        Tổng: {chartData.reduce((sum, item) => sum + (item.bookingCount || 0), 0)} booking
                      </span>
                    </div>
                  )}
                </div>
                
                {!hasData ? (
                  <div className="no-data">
                    <div className="no-data-icon">📅</div>
                    <p>Không có dữ liệu booking trong khoảng thời gian này</p>
                    <small>Hãy thử chọn khoảng thời gian khác hoặc kiểm tra lại dữ liệu</small>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart 
                      data={chartData} 
                      margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                      barCategoryGap="8%"
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="displayPeriod" 
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        fontSize={12}
                        stroke="#666"
                        interval={0}
                      />
                      <YAxis 
                        fontSize={12}
                        stroke="#666"
                        allowDecimals={false}
                      />
                      <Tooltip 
                        formatter={(value, name) => [value, name]}
                        labelFormatter={(label) => `Thời gian: ${label}`}
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #ccc',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Bar 
                        dataKey="bookingCount" 
                        name="Số booking" 
                        fill="#8b5cf6" 
                        radius={[2, 2, 0, 0]}
                        maxBarSize={50}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RevenuePage;