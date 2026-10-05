import React, { useState, useEffect, useMemo } from 'react';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Search,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  FileSpreadsheet,
  ArrowRight,
} from 'lucide-react';

export const SummaryPage: React.FC = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await api.get('/attendance/my-history', { params });
      setHistory(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Gagal mengambil riwayat absensi:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSummary();
  };

  const handleResetFilter = () => {
    setStartDate('');
    setEndDate('');
    setTimeout(() => {
      fetchSummary();
    }, 50);
  };

  const formatClockTime = (isoString?: string | null) => {
    if (!isoString) return '-';
    try {
      return (
        new Date(isoString).toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'Asia/Jakarta',
        }) + ' WIB'
      );
    } catch {
      return '-';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('id-ID', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const calculateDuration = (clockIn?: string | null, clockOut?: string | null) => {
    if (!clockIn || !clockOut) return null;
    try {
      const diff = new Date(clockOut).getTime() - new Date(clockIn).getTime();
      if (diff <= 0) return null;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}j ${minutes}m`;
    } catch {
      return null;
    }
  };

  // Summary Metrics
  const summaryStats = useMemo(() => {
    const totalDays = history.length;
    const completedDays = history.filter((item) => item.clockIn && item.clockOut).length;
    const incompleteDays = history.filter((item) => item.clockIn && !item.clockOut).length;

    return {
      totalDays,
      completedDays,
      incompleteDays,
    };
  }, [history]);

  return (
    <div className="space-y-6">
      {/* Header Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/90 backdrop-blur-xl shadow-lg">
          <p className="text-xs font-semibold text-slate-400">Total Hari Kerja Tercatat</p>
          <h3 className="text-2xl sm:text-3xl font-bold text-white mt-1">{summaryStats.totalDays}</h3>
          <p className="text-[11px] text-slate-500 mt-1">Pada rentang tanggal yang dipilih</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/90 backdrop-blur-xl shadow-lg">
          <p className="text-xs font-semibold text-emerald-400">Selesai (In & Out)</p>
          <h3 className="text-2xl sm:text-3xl font-bold text-emerald-300 mt-1">{summaryStats.completedDays}</h3>
          <p className="text-[11px] text-slate-500 mt-1">Presensi lengkap jam masuk dan pulang</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/90 backdrop-blur-xl shadow-lg">
          <p className="text-xs font-semibold text-amber-400">Belum Clock-Out</p>
          <h3 className="text-2xl sm:text-3xl font-bold text-amber-300 mt-1">{summaryStats.incompleteDays}</h3>
          <p className="text-[11px] text-slate-500 mt-1">Presensi masuk tanpa jam pulang</p>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-800 gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Riwayat Presensi Mandiri</h2>
              <p className="text-xs text-slate-400">Rekapitulasi catatan waktu kerja harian Anda</p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchSummary}
            disabled={loading}
            className="self-start sm:self-auto text-xs border-slate-800 bg-slate-950/60 text-slate-300 hover:text-white"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Date Filter Form */}
        <form onSubmit={handleFilter} className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="space-y-1.5 flex-1 w-full text-left">
            <label className="text-xs font-semibold text-slate-400">Mulai Tanggal</label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-10 bg-slate-950/80 border-slate-800 text-white rounded-xl text-xs"
            />
          </div>
          <div className="space-y-1.5 flex-1 w-full text-left">
            <label className="text-xs font-semibold text-slate-400">Sampai Tanggal</label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-10 bg-slate-950/80 border-slate-800 text-white rounded-xl text-xs"
            />
          </div>
          <div className="flex space-x-2 w-full sm:w-auto">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 sm:flex-initial h-10 px-5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-xl text-xs shadow-md shadow-purple-500/20"
            >
              <Search className="w-3.5 h-3.5 mr-1.5" />
              Filter
            </Button>
            {(startDate || endDate) && (
              <Button
                type="button"
                variant="ghost"
                onClick={handleResetFilter}
                className="h-10 px-3 text-slate-400 hover:text-white text-xs"
              >
                Reset
              </Button>
            )}
          </div>
        </form>

        {/* Data Table */}
        <div className="border border-slate-800/80 rounded-2xl overflow-hidden bg-slate-950/40">
          <Table>
            <TableHeader className="bg-slate-950/80 border-b border-slate-800">
              <TableRow className="border-slate-800 hover:bg-transparent">
                <TableHead className="font-semibold text-slate-400 text-xs">Tanggal</TableHead>
                <TableHead className="font-semibold text-slate-400 text-xs">Clock In</TableHead>
                <TableHead className="font-semibold text-slate-400 text-xs">Clock Out</TableHead>
                <TableHead className="font-semibold text-slate-400 text-xs">Durasi Kerja</TableHead>
                <TableHead className="font-semibold text-slate-400 text-xs text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow className="border-slate-800/50">
                  <TableCell colSpan={5} className="text-center py-12 text-slate-500 text-xs">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-purple-400 mb-2" />
                    <span>Memuat riwayat presensi...</span>
                  </TableCell>
                </TableRow>
              ) : history.length === 0 ? (
                <TableRow className="border-slate-800/50">
                  <TableCell colSpan={5} className="text-center py-12 text-slate-500 text-xs">
                    <Calendar className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                    <p className="font-semibold text-slate-400">Tidak ada riwayat presensi</p>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Belum ada absensi pada rentang tanggal ini.
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                history.map((item) => {
                  const duration = calculateDuration(item.clockIn, item.clockOut);
                  const isDone = !!item.clockOut;

                  return (
                    <TableRow key={item.id} className="border-slate-800/60 hover:bg-slate-900/60 transition-colors">
                      <TableCell className="font-medium text-slate-200 text-xs">
                        {formatDate(item.date)}
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs text-slate-300 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
                          {formatClockTime(item.clockIn)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs text-slate-300 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
                          {formatClockTime(item.clockOut)}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-slate-400 font-medium">
                        {duration || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {isDone ? (
                          <Badge className="bg-emerald-500/15 border-emerald-500/30 text-emerald-300 text-[11px] font-semibold">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Selesai
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-500/15 border-amber-500/30 text-amber-300 text-[11px] font-semibold">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Belum Clock-Out
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};