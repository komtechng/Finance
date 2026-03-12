import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Download } from 'lucide-react';
import { toast } from 'sonner';

export default function ReportsPage() {
  const [loading, setLoading] = useState(false);

  const downloadReport = async (endpoint, filename) => {
    setLoading(true);
    try {
      const response = await api.get(endpoint, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Report downloaded successfully');
    } catch (error) {
      toast.error('Failed to download report');
    } finally {
      setLoading(false);
    }
  };

  const reports = [
    {
      title: 'Agent Collections Report',
      description: 'Download detailed report of all agent collections',
      endpoint: '/reports/agent-collections/excel',
      filename: 'agent_collections.xlsx'
    },
    {
      title: 'Loan Portfolio Report',
      description: 'Export complete loan portfolio analysis',
      endpoint: '/reports/loan-portfolio/excel',
      filename: 'loan_portfolio.xlsx'
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto" data-testid="reports-page">
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-heading font-bold text-slate-900">Reports</h1>
        <p className="text-slate-600 mt-1">Generate and download financial reports</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((report, index) => (
          <Card key={index} className="p-6 border border-slate-100 hover:shadow-md transition-all duration-200" data-testid={`report-card-${index}`}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-heading font-semibold text-slate-900 mb-2">
                  {report.title}
                </h3>
                <p className="text-sm text-slate-600">
                  {report.description}
                </p>
              </div>
            </div>
            <Button 
              onClick={() => downloadReport(report.endpoint, report.filename)}
              disabled={loading}
              className="w-full bg-primary text-white hover:bg-primary/90"
              data-testid={`download-button-${index}`}
            >
              <Download className="w-4 h-4 mr-2" />
              Download Excel
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
