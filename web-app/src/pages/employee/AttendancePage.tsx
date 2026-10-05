import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  LogIn,
  LogOut,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Sparkles,
  Timer,
  RefreshCw,
} from 'lucide-react';

export const AttendancePage: React.FC = () => {
  const [todayAttendance, setTodayAttendance] = useState<{
    clockIn: string | null;
    clockOut: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDateStr, setCurrentDateStr] = useState<string>('');

  // Live real-time clock ticker
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZone: 'Asia/Jakarta',
        })
      );
      setCurrentDateStr(
        now.toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          timeZone: 'Asia/Jakarta',
        })
      );
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchTodayAttendance = async () => {
    setFetching(true);
    try {
      const res = await api.get('/attendance/today');
      const logs = res.data;

      if (Array.isArray(logs) && logs.length > 0) {
        const checkInLog = logs.find((log: any) => log.type === 'CHECK_IN');
        const checkOutLog = logs.find((log: any) => log.type === 'CHECK_OUT');

        setTodayAttendance({
          clockIn: checkInLog ? checkInLog.timestamp : null,
          clockOut: checkOutLog ? checkOutLog.timestamp : null,
        });
      } else {
        setTodayAttendance(null);
      }
    } catch (err) {
      console.error('Gagal mengambil status absensi:', err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchTodayAttendance();
  }, []);

  const handleCheckIn = async () => {
    setLoading(true);
    setMessage(null);
    try {
      await api.post('/attendance/check-in');
      setMessage({ type: 'success', text: 'Presensi Masuk (Clock-In) berhasil dicatat!' });
      fetchTodayAttendance();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Gagal melakukan Check-In' });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    setMessage(null);
    try {
      await api.post('/attendance/check-out');
      setMessage({ type: 'success', text: 'Presensi Pulang (Clock-Out) berhasil dicatat!' });
      fetchTodayAttendance();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Gagal melakukan Check-Out' });
    } finally {
      setLoading(false);
    }
  };

  const formatClockTime = (isoString?: string | null) => {
    if (!isoString) return '--:--';
    try {
      return (
        new Date(isoString).toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'Asia/Jakarta',
        }) + ' WIB'
      );
    } catch {
      return '--:--';
    }
  };

  const isCheckedIn = !!todayAttendance?.clockIn;
  const isCheckedOut = !!todayAttendance?.clockOut;
  const isWorkingNow = isCheckedIn && !isCheckedOut;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Live Clock Card */}
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden text-center">
        {/* Ambient radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-600/15 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-950/70 border border-slate-800 text-slate-300 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Zona Waktu Asia / Jakarta (WIB)</span>
          </div>

          <div className="text-4xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-purple-200 tracking-tight font-mono">
            {currentTime || '00:00:00'}
          </div>

          <p className="text-xs sm:text-sm text-slate-400 font-medium">
            {currentDateStr || 'Memuat tanggal...'}
          </p>
        </div>
      </div>

      {/* Main Attendance Action Card */}
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-800 gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Presensi Kerja WFH Hari Ini</h2>
              <p className="text-xs text-slate-400">Pencatatan waktu kehadiran kerja mandiri</p>
            </div>
          </div>

          <div>
            {isWorkingNow ? (
              <Badge className="bg-emerald-500/15 border-emerald-500/30 text-emerald-300 px-3 py-1 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-2" />
                Sedang Aktif Bekerja
              </Badge>
            ) : isCheckedOut ? (
              <Badge className="bg-purple-500/15 border-purple-500/30 text-purple-300 px-3 py-1 text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                Selesai Bekerja Hari Ini
              </Badge>
            ) : (
              <Badge variant="outline" className="border-slate-800 text-slate-400 px-3 py-1 text-xs">
                Belum Presensi Masuk
              </Badge>
            )}
          </div>
        </div>

        {/* Feedback Alert */}
        {message && (
          <div
            className={`p-4 rounded-2xl text-xs font-medium border flex items-start space-x-3 animate-in fade-in ${
              message.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                : 'bg-red-500/10 text-red-300 border-red-500/20'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            )}
            <span className="leading-relaxed">{message.text}</span>
          </div>
        )}

        {/* Clock In / Out Status Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Card Clock In */}
          <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-400">Jam Masuk (Clock-In)</p>
              <h3 className="text-xl sm:text-2xl font-bold text-white font-mono">
                {formatClockTime(todayAttendance?.clockIn)}
              </h3>
              <p className="text-[11px] text-slate-500">
                {isCheckedIn ? 'Tercatat di server Dexa' : 'Belum melakukan Check-In'}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
              <LogIn className="w-6 h-6" />
            </div>
          </div>

          {/* Card Clock Out */}
          <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-400">Jam Pulang (Clock-Out)</p>
              <h3 className="text-xl sm:text-2xl font-bold text-white font-mono">
                {formatClockTime(todayAttendance?.clockOut)}
              </h3>
              <p className="text-[11px] text-slate-500">
                {isCheckedOut ? 'Presensi harian selesai' : 'Wajib sebelum istirahat/selesai'}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
              <LogOut className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <Button
            onClick={handleCheckIn}
            disabled={loading || isCheckedIn}
            className={`h-14 rounded-2xl text-sm font-bold shadow-xl transition-all flex items-center justify-center space-x-2 ${
              isCheckedIn
                ? 'bg-slate-800/40 text-slate-500 border border-slate-800 cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-emerald-500/25'
            }`}
          >
            {loading ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <LogIn className="w-5 h-5 mr-1" />
                <span>{isCheckedIn ? 'Sudah Clock-In' : 'Clock In (Mulai Kerja)'}</span>
              </>
            )}
          </Button>

          <Button
            onClick={handleCheckOut}
            disabled={loading || !isCheckedIn || isCheckedOut}
            className={`h-14 rounded-2xl text-sm font-bold shadow-xl transition-all flex items-center justify-center space-x-2 ${
              !isCheckedIn || isCheckedOut
                ? 'bg-slate-800/40 text-slate-500 border border-slate-800 cursor-not-allowed'
                : 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white shadow-rose-500/25'
            }`}
          >
            {loading ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <LogOut className="w-5 h-5 mr-1" />
                <span>{isCheckedOut ? 'Sudah Clock-Out' : 'Clock Out (Selesai Kerja)'}</span>
              </>
            )}
          </Button>
        </div>

        {/* Info Guide */}
        <div className="p-4 rounded-2xl bg-purple-500/5 border border-purple-500/15 flex items-start space-x-3 text-xs text-purple-300">
          <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Data presensi Anda disinkronkan langsung ke dashboard pemantauan HRD secara real-time. Pastikan Anda melakukan Clock-Out sebelum mengakhiri jam kerja harian.
          </p>
        </div>
      </div>
    </div>
  );
};