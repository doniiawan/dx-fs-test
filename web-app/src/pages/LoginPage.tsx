import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Building2,
  ShieldCheck,
  Clock,
  Zap,
  ArrowRight,
  Loader2,
  AlertCircle,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      const { access_token, user } = res.data;

      login(access_token, user);

      if (user.role === 'HRD_ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/employee/profile');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Email atau kata sandi tidak valid. Pastikan kredensial Anda benar.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Quick-fill credentials for demo testing
  const fillCredentials = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans">
      {/* Ambient Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600/25 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/25 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[160px] pointer-events-none" />

      {/* Main Dual-Column Container */}
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        {/* Left Side: Brand Highlights (Hidden on smaller screens) */}
        <div className="lg:col-span-6 space-y-8 pr-0 lg:pr-6 hidden lg:block">
          <div className="space-y-4">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Sistem Presensi & Monitoring Karyawan</span>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-xl shadow-purple-500/30 text-white font-black text-2xl">
                D
              </div>
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-white">
                  Dexa Group
                </h1>
                <p className="text-xs font-medium text-slate-400 tracking-wider uppercase">
                  WFH Attendance & HR Portal
                </p>
              </div>
            </div>

            <p className="text-slate-300 text-sm leading-relaxed max-w-md">
              Platform terintegrasi untuk absensi kerja jarak jauh (Work From Home),
              rekapitulasi kehadiran real-time, audit logging otomatis, dan pemantauan tim HRD.
            </p>
          </div>

          {/* Feature Highlights Cards */}
          <div className="space-y-3.5 max-w-md">
            <div className="flex items-start space-x-3.5 p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md hover:border-purple-500/30 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">Presensi Masuk & Pulang</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Pencatatan waktu kerja harian otomatis dengan rekapitulasi riwayat presensi.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3.5 p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md hover:border-indigo-500/30 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">Audit Logging Terdesentralisasi</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Setiap pembaruan data profil dicatat ke service terpisah via RabbitMQ Message Broker.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3.5 p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md hover:border-blue-500/30 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">Real-time WebSocket Alert</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Dashboard HRD menerima notifikasi instan saat karyawan memperbarui data profilnya.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Sistem Operasional Normal • Enkripsi JWT 256-bit</span>
          </div>
        </div>

        {/* Right Side: The Login Card */}
        <div className="lg:col-span-6 w-full max-w-md mx-auto">
          <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-7 sm:p-9 shadow-2xl shadow-purple-950/20 backdrop-blur-xl">
            {/* Header Mobile Brand */}
            <div className="flex items-center space-x-3 lg:hidden mb-6 pb-6 border-b border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20 text-white font-black text-xl">
                D
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Dexa Group Portal</h2>
                <p className="text-xs text-slate-400">WFH Attendance System</p>
              </div>
            </div>

            <div className="space-y-2 mb-6 text-left">
              <h2 className="text-2xl font-bold tracking-tight text-white">
                Selamat Datang
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Silakan masuk dengan akun kredensial perusahaan Anda
              </p>
            </div>

            {/* Quick-fill Demo Account Pills */}
            <div className="mb-6 p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
              <p className="text-[11px] font-semibold text-slate-400 mb-2 flex items-center justify-between">
                <span>Akun Demo Cepat:</span>
                <span className="text-[10px] text-purple-400">Klik untuk isi otomatis</span>
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => fillCredentials('admin@dexa.com')}
                  className="px-2.5 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-300 text-xs font-medium text-left transition-all flex items-center justify-between group"
                >
                  <span className="truncate">👑 HRD Admin</span>
                  <CheckCircle2 className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-purple-400 transition-opacity" />
                </button>
                <button
                  type="button"
                  onClick={() => fillCredentials('user@dexa.com')}
                  className="px-2.5 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-300 text-xs font-medium text-left transition-all flex items-center justify-between group"
                >
                  <span className="truncate">💼 Karyawan</span>
                  <CheckCircle2 className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-indigo-400 transition-opacity" />
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium flex items-start space-x-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-slate-300">
                  Email Perusahaan
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500 transition-colors" />
                  <Input
                    type="email"
                    placeholder="nama@dexa.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 h-11 bg-slate-950/70 border-slate-800 text-white placeholder:text-slate-600 rounded-xl focus:border-purple-500 focus:ring-purple-500/20 transition-all text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">
                    Kata Sandi
                  </label>
                  <span className="text-[11px] text-purple-400 hover:text-purple-300 cursor-pointer transition-colors">
                    Lupa sandi?
                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500 transition-colors" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10 pr-10 h-11 bg-slate-950/70 border-slate-800 text-white placeholder:text-slate-600 rounded-xl focus:border-purple-500 focus:ring-purple-500/20 transition-all text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 mt-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/25 transition-all flex items-center justify-center space-x-2 text-sm tracking-wide disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    <span>Memverifikasi Akun...</span>
                  </>
                ) : (
                  <>
                    <span>Masuk ke Akun</span>
                    <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-800/80 text-center text-xs text-slate-500">
              Dexa Group IT Portal • Sistem WFH &copy; 2026
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};