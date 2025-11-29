import { useState, useEffect } from 'react';
import { CreditCard, FileText, CheckCircle, Clock, XCircle } from 'lucide-react';

const Billing = ({ userId }) => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, [userId]);

  const fetchInvoices = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/payments/user/${userId}/invoices`);
      const data = await response.json();
      setInvoices(data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-3">
        <CreditCard className="w-8 h-8 text-emerald-500" />
        Billing & Invoices
      </h1>

      {invoices.length === 0 ? (
        <div className="bg-slate-800 rounded-xl p-12 text-center border border-slate-700">
          <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No invoices</h3>
          <p className="text-slate-400">Your billing history will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {invoices.map((invoice) => (
            <div
              key={invoice.invoice_id}
              className="bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-700"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <FileText className="w-6 h-6 text-emerald-400" />
                    <h3 className="text-xl font-bold">Invoice #{invoice.invoice_id}</h3>
                  </div>
                  <p className="text-slate-400 text-sm">
                    Issue Date: {new Date(invoice.issue_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-white">${invoice.total_amount}</p>
                  {invoice.payment_status && (
                    <div className="flex items-center gap-2 justify-end mt-2">
                      {invoice.payment_status === 'Completed' && (
                        <>
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                          <span className="text-sm text-emerald-400 font-medium">Paid</span>
                        </>
                      )}
                      {invoice.payment_status === 'Pending' && (
                        <>
                          <Clock className="w-4 h-4 text-yellow-400" />
                          <span className="text-sm text-yellow-400 font-medium">Pending</span>
                        </>
                      )}
                      {invoice.payment_status === 'Failed' && (
                        <>
                          <XCircle className="w-4 h-4 text-red-400" />
                          <span className="text-sm text-red-400 font-medium">Failed</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {invoice.session_id && (
                <div className="bg-slate-700 rounded-lg p-4">
                  <p className="text-slate-400 text-sm mb-2">Charging Session Details</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-slate-400">Session ID</p>
                      <p className="font-semibold">#{invoice.session_id}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Energy</p>
                      <p className="font-semibold">{invoice.energy_consumed} kWh</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Start Time</p>
                      <p className="font-semibold">
                        {invoice.start_time ? new Date(invoice.start_time).toLocaleString() : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400">End Time</p>
                      <p className="font-semibold">
                        {invoice.end_time ? new Date(invoice.end_time).toLocaleString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Billing;
