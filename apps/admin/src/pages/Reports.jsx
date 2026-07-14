import { useState, useEffect } from 'react';
import { reportService } from '@kaunch/shared-api';

const Reports = () => {
  const [reportType, setReportType] = useState('daily');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadReport = async () => {
    setLoading(true);
    let result;

    if (reportType === 'daily') {
      result = await reportService.getDailyReport(date);
    } else if (reportType === 'monthly') {
      result = await reportService.getMonthlyReport(month, year);
    }

    setLoading(false);

    if (result.success) {
      setReport(result);
    }
  };

  const handleExport = async () => {
    let params = {};
    if (reportType === 'daily') {
      params = { startDate: date, endDate: date };
    } else if (reportType === 'monthly') {
      params = { month, year };
    }

    const result = await reportService.exportReport(reportType, params);
    
    if (result.success) {
      // Convert to CSV
      const csvContent = convertToCSV(result.data);
      downloadCSV(csvContent, `${reportType}-report-${Date.now()}.csv`);
    }
  };

  const convertToCSV = (data) => {
    if (!data || data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const rows = data.map(row => 
      headers.map(header => JSON.stringify(row[header] || '')).join(',')
    );
    
    return [headers.join(','), ...rows].join('\n');
  };

  const downloadCSV = (content, filename) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <h1 className="mb-sp-6">Reports</h1>

      {/* Report Controls */}
      <div className="card mb-sp-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Report Type</label>
            <select
              className="input-field"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <option value="daily">Daily Report</option>
              <option value="monthly">Monthly Report</option>
            </select>
          </div>

          {reportType === 'daily' ? (
            <div>
              <label className="block text-sm font-semibold mb-2">Date</label>
              <input
                type="date"
                className="input-field"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-semibold mb-2">Month</label>
                <select
                  className="input-field"
                  value={month}
                  onChange={(e) => setMonth(parseInt(e.target.value))}
                >
                  {[...Array(12)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(2000, i).toLocaleString('default', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Year</label>
                <select
                  className="input-field"
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value))}
                >
                  <option value={2023}>2023</option>
                  <option value={2024}>2024</option>
                  <option value={2025}>2025</option>
                  <option value={2026}>2026</option>
                </select>
              </div>
            </>
          )}
        </div>

        <div className="flex gap-4">
          <button onClick={loadReport} className="btn-primary" disabled={loading}>
            {loading ? 'Loading...' : 'Generate Report'}
          </button>
          {report && (
            <button onClick={handleExport} className="btn-secondary">
              📤 Export to CSV
            </button>
          )}
        </div>
      </div>

      {/* Report Display */}
      {report && (
        <div className="card">
          <h2 className="mb-4">
            {reportType === 'daily' 
              ? `Daily Report - ${date}`
              : `Monthly Report - ${month}/${year}`}
          </h2>

          {reportType === 'daily' && report.stats && (
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-primary-light p-4 rounded-lg">
                <div className="text-sm text-neutral-700">Confirmed</div>
                <div className="text-3xl font-bold text-primary">{report.stats.confirmed_count}</div>
              </div>
              <div className="bg-danger-light p-4 rounded-lg">
                <div className="text-sm text-neutral-700">Skipped</div>
                <div className="text-3xl font-bold text-danger">{report.stats.skipped_count}</div>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-primary-dark text-white">
                <tr>
                  <th className="px-4 py-3 text-left">Employee ID</th>
                  <th className="px-4 py-3 text-left">Name</th>
                  {reportType === 'monthly' && (
                    <>
                      <th className="px-4 py-3 text-left">Confirmed</th>
                      <th className="px-4 py-3 text-left">Skipped</th>
                    </>
                  )}
                  {reportType === 'daily' && (
                    <>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-left">Food Preference</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {report.report?.map((item, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? 'bg-white' : 'bg-neutral-100'}
                  >
                    <td className="px-4 py-3 font-mono">{item.employee_id}</td>
                    <td className="px-4 py-3 font-semibold">{item.name}</td>
                    {reportType === 'monthly' && (
                      <>
                        <td className="px-4 py-3 font-bold text-primary">{item.confirmed_count || 0}</td>
                        <td className="px-4 py-3 font-bold text-danger">{item.skipped_count || 0}</td>
                      </>
                    )}
                    {reportType === 'daily' && (
                      <>
                        <td className="px-4 py-3 capitalize">{item.status || '-'}</td>
                        <td className="px-4 py-3 capitalize">{item.food_preference}</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
