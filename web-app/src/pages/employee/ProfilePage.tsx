import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Phone,
  Image as ImageIcon,
  Lock,
  Mail,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Zap,
  RefreshCw,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [photoUrl, setPhotoUrl] = useState(user?.photoUrl || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Sync state ketika user dari AuthContext berubah / selesai loaded
  useEffect(() => {
    if (user) {
      setPhoneNumber(user.phoneNumber || '');
      setPhotoUrl(user.photoUrl || '');
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/user/profile');
      if (res.data) {
        setPhoneNumber(res.data.phoneNumber || '');
        setPhotoUrl(res.data.photoUrl || '');
      }
    } catch (err) {
      console.error('Gagal mengambil data profil:', err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const payload: Record<string, any> = {
        phoneNumber,
        photoUrl,
      };

      const cleanPassword = password.trim();
      if (cleanPassword && cleanPassword.length >= 6) {
        payload.password = cleanPassword;
      }

      const res = await api.put('/user/profile', payload);

      if (res.data?.user) {
        updateUser(res.data.user);
      } else {
        updateUser({ phoneNumber, photoUrl });
      }

      setPassword('');
      setMessage({
        type: 'success',
        text: 'Profil berhasil diperbarui! Log perubahan telah dikirim ke RabbitMQ dan HRD Admin telah diberitahu.',
      });
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Gagal memperbarui profil. Periksa data Anda.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Profile Header Card */}
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        {/* Background glow accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 relative z-10 text-center sm:text-left">
          <Avatar className="w-24 h-24 border-2 border-purple-500/40 ring-4 ring-purple-500/10 shadow-xl shrink-0">
            <AvatarImage src={photoUrl || user?.photoUrl} alt={user?.name} className="object-cover" />
            <AvatarFallback className="text-2xl font-black bg-gradient-to-tr from-purple-600 to-indigo-600 text-white">
              {user?.name?.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl font-extrabold text-white tracking-tight">{user?.name}</h1>
              <Badge className="bg-purple-500/15 border-purple-500/30 text-purple-300 font-semibold px-2.5 py-0.5">
                {user?.role || 'EMPLOYEE'}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-400">
              <span className="flex items-center space-x-1.5">
                <Briefcase className="w-3.5 h-3.5 text-purple-400" />
                <span>{user?.position || 'Software Engineer'}</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <Mail className="w-3.5 h-3.5 text-purple-400" />
                <span>{user?.email}</span>
              </span>
            </div>

            {/* Architecture Banner */}
            <div className="pt-2">
              <div className="inline-flex items-center space-x-2 text-[11px] text-slate-400 bg-slate-950/70 border border-slate-800 px-3 py-1.5 rounded-xl">
                <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Microservice terhubung ke <strong>RabbitMQ Audit Logging</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Edit Form Card */}
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-xl">
        <div className="space-y-1 mb-6 border-b border-slate-800 pb-4 text-left">
          <h2 className="text-lg font-bold text-white tracking-tight">Perbarui Data Profil</h2>
          <p className="text-xs text-slate-400">
            Perubahan nomor telepon akan mencatat audit log ke database sekunder melalui message queue.
          </p>
        </div>

        {message && (
          <div
            className={`p-4 rounded-2xl mb-6 text-xs font-medium border flex items-start space-x-3 animate-in fade-in ${message.type === 'success'
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

        <form onSubmit={handleUpdate} className="space-y-5 text-left">
          {/* Email (Readonly) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Email Akun (Permanen)</span>
              <span className="text-[10px] text-slate-500">Dikelola HRD</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
              <Input
                type="email"
                value={user?.email || ''}
                disabled
                className="pl-10 h-11 bg-slate-950/40 border-slate-800/60 text-slate-400 rounded-xl cursor-not-allowed text-sm"
              />
            </div>
          </div>

          {/* Nomor HP / WhatsApp */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1">
              <span>Nomor WhatsApp / Telepon Aktif</span>
              <span className="text-purple-400">*</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <Input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="081234567890"
                required
                className="pl-10 h-11 bg-slate-950/80 border-slate-800 text-white placeholder:text-slate-600 rounded-xl focus:border-purple-500 focus:ring-purple-500/20 text-sm"
              />
            </div>
            <p className="text-[11px] text-slate-500">
              Nomor ini digunakan untuk verifikasi dan komunikasi resmi kantor.
            </p>
          </div>

          {/* URL Foto Profil */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">URL Foto Profil (Avatar)</label>
            <div className="relative">
              <ImageIcon className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <Input
                type="url"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="https://example.com/foto-saya.jpg"
                className="pl-10 h-11 bg-slate-950/80 border-slate-800 text-white placeholder:text-slate-600 rounded-xl focus:border-purple-500 focus:ring-purple-500/20 text-sm"
              />
            </div>
            <p className="text-[11px] text-slate-500">
              Masukkan tautan gambar langsung (URL) berformat JPG/PNG.
            </p>
          </div>

          {/* Ganti Password */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Ganti Kata Sandi</span>
              <span className="text-[10px] text-amber-400">Kosongkan jika tidak ingin diubah</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Kata sandi baru (minimal 6 karakter)"
                minLength={6}
                className="pl-10 h-11 bg-slate-950/80 border-slate-800 text-white placeholder:text-slate-600 rounded-xl focus:border-purple-500 focus:ring-purple-500/20 text-sm"
              />
            </div>
          </div>

          <div className="pt-3">
            <Button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-8 h-11 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/25 transition-all text-sm disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                  <span>Menyimpan ke Database & Queue...</span>
                </>
              ) : (
                <span>Simpan Perubahan Profil</span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};