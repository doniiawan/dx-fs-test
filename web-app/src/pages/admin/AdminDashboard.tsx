import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { useAdminSocketNotification } from '@/hooks/useSocket';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Users,
  Clock,
  LogOut,
  Plus,
  Trash2,
  Edit,
  Search,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Briefcase,
  Phone,
  Mail,
  Shield,
  UserCheck,
  UserPlus,
  Lock,
} from 'lucide-react';

interface AttendanceRecord {
  id: string;
  userId: string;
  date: string;
  clockIn: string | null;
  clockOut: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    position: string;
    phoneNumber?: string;
    role: string;
    photoUrl?: string;
  } | null;
}

interface UserRecord {
  id: string;
  email: string;
  name: string;
  position: string;
  phoneNumber: string;
  photoUrl?: string;
  role: 'EMPLOYEE' | 'HRD_ADMIN';
  createdAt: string;
}

export const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'attendance' | 'users'>('attendance');
  const [attendances, setAttendances] = useState<AttendanceRecord[]>([]);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Search & Filter States
  const [attendanceSearch, setAttendanceSearch] = useState('');
  const [attendanceDatePreset, setAttendanceDatePreset] = useState<'today' | 'month' | 'all' | 'custom'>('today');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'ALL' | 'EMPLOYEE' | 'HRD_ADMIN'>('ALL');

  // Form State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    position: '',
    phoneNumber: '',
    role: 'EMPLOYEE' as 'EMPLOYEE' | 'HRD_ADMIN',
  });

  const getTodayStr = () => {
    return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
  };

  const todayStr = getTodayStr();

  // Socket.io Real-time Notifications
  useAdminSocketNotification((data) => {
    toast.info('Pemberitahuan Sistem Real-time', {
      description: data.message || `Profil karyawan ${data.userName || ''} baru saja diperbarui.`,
    });
    fetchUsers();
    fetchAttendances();
  }, user?.role === 'HRD_ADMIN');

  // Fetch Attendance Records
  const fetchAttendances = async () => {
    setLoadingAttendance(true);
    try {
      const params: any = {};
      if (attendanceDatePreset === 'today') {
        params.startDate = todayStr;
        params.endDate = todayStr;
      } else if (attendanceDatePreset === 'month') {
        const now = new Date();
        params.startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        params.endDate = todayStr;
      } else if (attendanceDatePreset === 'custom') {
        if (customStartDate) params.startDate = customStartDate;
        if (customEndDate) params.endDate = customEndDate;
      }
      const res = await api.get('/attendance/admin/all', { params });
      setAttendances(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Gagal mengambil data absensi:', err);
      toast.error('Gagal mengambil data absensi');
    } finally {
      setLoadingAttendance(false);
    }
  };

  // Fetch All Employees
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await api.get('/user/admin/employees');
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Gagal mengambil data user:', err);
      toast.error('Gagal mengambil data karyawan');
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchAttendances();
    fetchUsers();
  }, [attendanceDatePreset, customStartDate, customEndDate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Reset form
  const resetForm = () => {
    setEditingUserId(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      position: '',
      phoneNumber: '',
      role: 'EMPLOYEE',
    });
  };

  // Submit Form User (Create / Update)
  const handleSubmitUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingUserId) {
        const payload: any = {
          name: formData.name,
          email: formData.email,
          position: formData.position,
          phoneNumber: formData.phoneNumber,
          role: formData.role,
        };
        if (formData.password && formData.password.trim().length >= 6) {
          payload.password = formData.password.trim();
        }
        await api.put(`/user/admin/employee/${editingUserId}`, payload);
        toast.success('Data karyawan berhasil diperbarui');
      } else {
        if (!formData.password || formData.password.length < 6) {
          toast.error('Password minimal 6 karakter untuk akun baru');
          setSubmitting(false);
          return;
        }
        await api.post('/user/admin/employee', formData);
        toast.success('Karyawan baru berhasil ditambahkan');
      }
      setIsDialogOpen(false);
      resetForm();
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan data karyawan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditUser = (u: UserRecord) => {
    setEditingUserId(u.id);
    setFormData({
      name: u.name,
      email: u.email,
      password: '',
      position: u.position,
      phoneNumber: u.phoneNumber,
      role: u.role,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus akun karyawan "${name}"?`)) return;
    try {
      await api.delete(`/user/admin/employee/${id}`);
      toast.success(`Karyawan ${name} berhasil dihapus`);
      fetchUsers();
      fetchAttendances();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal menghapus karyawan');
    }
  };

  // Formatters
  const formatTime = (isoString?: string | null) => {
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

  // Stats Calculations
  const stats = useMemo(() => {
    const totalEmployees = users.filter((u) => u.role === 'EMPLOYEE').length;
    const todayRecords = attendances.filter((a) => a.date === todayStr);
    const presentToday = todayRecords.filter((a) => a.clockIn).length;
    const currentlyWorking = todayRecords.filter((a) => a.clockIn && !a.clockOut).length;
    const finishedWorking = todayRecords.filter((a) => a.clockOut).length;

    return {
      totalEmployees,
      presentToday,
      currentlyWorking,
      finishedWorking,
    };
  }, [users, attendances, todayStr]);

  // Filtered Attendances
  const filteredAttendances = useMemo(() => {
    return attendances.filter((item) => {
      const name = item.user?.name?.toLowerCase() || '';
      const email = item.user?.email?.toLowerCase() || '';
      const position = item.user?.position?.toLowerCase() || '';
      const q = attendanceSearch.toLowerCase();
      return name.includes(q) || email.includes(q) || position.includes(q);
    });
  }, [attendances, attendanceSearch]);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const name = u.name?.toLowerCase() || '';
      const email = u.email?.toLowerCase() || '';
      const position = u.position?.toLowerCase() || '';
      const q = userSearch.toLowerCase();
      const matchQuery = name.includes(q) || email.includes(q) || position.includes(q);
      const matchRole = userRoleFilter === 'ALL' || u.role === userRoleFilter;
      return matchQuery && matchRole;
    });
  }, [users, userSearch, userRoleFilter]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative overflow-x-hidden selection:bg-purple-600 selection:text-white">
      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600/10 rounded-full blur-[128px]" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-[128px]" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-blue-600/10 rounded-full blur-[128px]" />
      </div>

      {/* Top Navbar */}
      <header className="bg-slate-900/80 border-b border-slate-800/80 sticky top-0 z-30 backdrop-blur-xl shadow-lg shadow-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-900/40 text-white font-black text-xl">
              D
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-white tracking-tight">Dexa Portal</span>
                <Badge className="bg-purple-500/15 text-purple-300 border-purple-500/30 hover:bg-purple-500/20 font-semibold px-2 py-0.5">
                  HRD Admin
                </Badge>
              </div>
              <p className="text-xs text-slate-400">Presensi & Manajemen Karyawan</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-200">{user?.name}</p>
              <p className="text-xs text-slate-400">{user?.email}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="text-rose-400 border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/20 hover:text-rose-300 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-1.5" />
              Keluar
            </Button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8 relative z-10">
        {/* KPI Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-slate-900/80 border-slate-800/80 backdrop-blur-xl shadow-lg shadow-black/20 hover:border-slate-700/80 transition-all rounded-2xl">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Karyawan</p>
                <h3 className="text-3xl font-extrabold text-white mt-1">{stats.totalEmployees}</h3>
                <p className="text-xs text-slate-500 mt-1">Akun karyawan terdaftar</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/80 border-slate-800/80 backdrop-blur-xl shadow-lg shadow-black/20 hover:border-slate-700/80 transition-all rounded-2xl">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Hadir Hari Ini</p>
                <h3 className="text-3xl font-extrabold text-blue-400 mt-1">{stats.presentToday}</h3>
                <p className="text-xs text-slate-500 mt-1">Sudah presensi masuk</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/80 border-slate-800/80 backdrop-blur-xl shadow-lg shadow-black/20 hover:border-slate-700/80 transition-all rounded-2xl">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sedang Bekerja</p>
                <h3 className="text-3xl font-extrabold text-amber-400 mt-1">{stats.currentlyWorking}</h3>
                <p className="text-xs text-slate-500 mt-1">Belum clock-out</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/80 border-slate-800/80 backdrop-blur-xl shadow-lg shadow-black/20 hover:border-slate-700/80 transition-all rounded-2xl">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Selesai Bekerja</p>
                <h3 className="text-3xl font-extrabold text-emerald-400 mt-1">{stats.finishedWorking}</h3>
                <p className="text-xs text-slate-500 mt-1">Sudah clock-out hari ini</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800/80 space-x-6">
          <button
            onClick={() => setActiveTab('attendance')}
            className={`pb-3 text-sm font-semibold flex items-center space-x-2 border-b-2 transition-all ${
              activeTab === 'attendance'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Monitoring Presensi</span>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-3 text-sm font-semibold flex items-center space-x-2 border-b-2 transition-all ${
              activeTab === 'users'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Kelola Karyawan</span>
          </button>
        </div>

        {/* TAB 1: MONITORING PRESENSI */}
        {activeTab === 'attendance' && (
          <Card className="bg-slate-900/80 border-slate-800/80 backdrop-blur-xl shadow-xl shadow-black/30 rounded-2xl overflow-hidden">
            <CardHeader className="p-6 pb-4 border-b border-slate-800/80">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-lg font-bold text-white">Riwayat & Monitoring Presensi</CardTitle>
                  <CardDescription className="text-slate-400 text-xs mt-1">
                    Pantau jam masuk dan jam pulang kerja karyawan secara real-time
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchAttendances}
                  disabled={loadingAttendance}
                  className="self-start sm:self-auto bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loadingAttendance ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>

              {/* Filter Controls */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-4 border-t border-slate-800/80 mt-4">
                {/* Search */}
                <div className="md:col-span-5 relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <Input
                    placeholder="Cari nama atau jabatan..."
                    value={attendanceSearch}
                    onChange={(e) => setAttendanceSearch(e.target.value)}
                    className="pl-9 h-10 bg-slate-950/60 border-slate-800 text-slate-200 placeholder:text-slate-500 focus:border-purple-500 focus:ring-purple-500/20"
                  />
                </div>

                {/* Preset Date Filter */}
                <div className="md:col-span-4 flex rounded-xl bg-slate-950/80 border border-slate-800/80 p-1">
                  <button
                    type="button"
                    onClick={() => setAttendanceDatePreset('today')}
                    className={`flex-1 text-xs font-semibold py-1.5 rounded-lg transition-all ${
                      attendanceDatePreset === 'today'
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    Hari Ini
                  </button>
                  <button
                    type="button"
                    onClick={() => setAttendanceDatePreset('month')}
                    className={`flex-1 text-xs font-semibold py-1.5 rounded-lg transition-all ${
                      attendanceDatePreset === 'month'
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    Bulan Ini
                  </button>
                  <button
                    type="button"
                    onClick={() => setAttendanceDatePreset('all')}
                    className={`flex-1 text-xs font-semibold py-1.5 rounded-lg transition-all ${
                      attendanceDatePreset === 'all'
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    Semua
                  </button>
                  <button
                    type="button"
                    onClick={() => setAttendanceDatePreset('custom')}
                    className={`flex-1 text-xs font-semibold py-1.5 rounded-lg transition-all ${
                      attendanceDatePreset === 'custom'
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    Kustom
                  </button>
                </div>

                {/* Custom Date Inputs */}
                {attendanceDatePreset === 'custom' && (
                  <div className="md:col-span-12 flex flex-col sm:flex-row gap-2 pt-2">
                    <div className="flex-1">
                      <Input
                        type="date"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        placeholder="Mulai Tanggal"
                        className="bg-slate-950/60 border-slate-800 text-slate-200 focus:border-purple-500 focus:ring-purple-500/20"
                      />
                    </div>
                    <div className="flex-1">
                      <Input
                        type="date"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                        placeholder="Sampai Tanggal"
                        className="bg-slate-950/60 border-slate-800 text-slate-200 focus:border-purple-500 focus:ring-purple-500/20"
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-950/80 border-b border-slate-800/80">
                    <TableRow className="border-b border-slate-800/80 hover:bg-transparent">
                      <TableHead className="font-semibold text-slate-400 text-xs uppercase tracking-wider">Tanggal</TableHead>
                      <TableHead className="font-semibold text-slate-400 text-xs uppercase tracking-wider">Karyawan</TableHead>
                      <TableHead className="font-semibold text-slate-400 text-xs uppercase tracking-wider">Jabatan</TableHead>
                      <TableHead className="font-semibold text-slate-400 text-xs uppercase tracking-wider">Clock In</TableHead>
                      <TableHead className="font-semibold text-slate-400 text-xs uppercase tracking-wider">Clock Out</TableHead>
                      <TableHead className="font-semibold text-slate-400 text-xs uppercase tracking-wider">Durasi</TableHead>
                      <TableHead className="font-semibold text-slate-400 text-xs uppercase tracking-wider">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingAttendance ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12 text-slate-400">
                          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-purple-400 mb-2" />
                          <span>Memuat data absensi...</span>
                        </TableCell>
                      </TableRow>
                    ) : filteredAttendances.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12 text-slate-400">
                          <Calendar className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                          <p className="font-medium text-slate-300">Tidak ada riwayat absensi</p>
                          <p className="text-xs text-slate-500 mt-1">Coba sesuaikan filter pencarian atau tanggal</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAttendances.map((item) => {
                        const duration = calculateDuration(item.clockIn, item.clockOut);
                        const isFinished = !!item.clockOut;
                        const isWorking = item.clockIn && !item.clockOut;

                        return (
                          <TableRow key={item.id} className="border-b border-slate-800/60 hover:bg-slate-800/40 transition-colors">
                            <TableCell className="font-medium text-slate-300 text-xs">
                              {formatDate(item.date)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <Avatar className="w-8 h-8 border border-slate-700 bg-purple-950 text-purple-300">
                                  <AvatarImage src={item.user?.photoUrl} />
                                  <AvatarFallback className="bg-purple-950 text-purple-300 font-bold text-xs">
                                    {item.user?.name?.substring(0, 2).toUpperCase() || 'U'}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="text-sm font-semibold text-slate-200">{item.user?.name || '-'}</p>
                                  <p className="text-xs text-slate-400">{item.user?.email || '-'}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-xs text-slate-300 font-medium">
                              {item.user?.position || '-'}
                            </TableCell>
                            <TableCell>
                              <span className="text-xs font-semibold text-slate-300 bg-slate-950/80 border border-slate-800 px-2.5 py-1 rounded-lg font-mono">
                                {formatTime(item.clockIn)}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="text-xs font-semibold text-slate-300 bg-slate-950/80 border border-slate-800 px-2.5 py-1 rounded-lg font-mono">
                                {formatTime(item.clockOut)}
                              </span>
                            </TableCell>
                            <TableCell className="text-xs text-slate-400 font-mono">
                              {duration || '-'}
                            </TableCell>
                            <TableCell>
                              {isFinished ? (
                                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/15">
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                  Selesai
                                </Badge>
                              ) : isWorking ? (
                                <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/30 hover:bg-blue-500/15">
                                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse mr-1.5"></span>
                                  Bekerja
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-slate-400 border-slate-700/60 bg-slate-800/40">
                                  Belum Hadir
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
            </CardContent>
          </Card>
        )}

        {/* TAB 2: KELOLA KARYAWAN (CRUD) */}
        {activeTab === 'users' && (
          <Card className="bg-slate-900/80 border-slate-800/80 backdrop-blur-xl shadow-xl shadow-black/30 rounded-2xl overflow-hidden">
            <CardHeader className="p-6 pb-4 border-b border-slate-800/80">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-lg font-bold text-white">Manajemen Data Karyawan</CardTitle>
                  <CardDescription className="text-slate-400 text-xs mt-1">
                    Tambah, perbarui, atau hapus akses akun pengguna di sistem
                  </CardDescription>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchUsers}
                    disabled={loadingUsers}
                    className="bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:text-white"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loadingUsers ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>

                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        onClick={resetForm}
                        size="sm"
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-900/40 font-semibold"
                      >
                        <Plus className="w-4 h-4 mr-1.5" />
                        Tambah Karyawan
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg sm:p-7 bg-slate-900/95 backdrop-blur-xl border border-slate-800 text-slate-100 shadow-2xl shadow-black/80 rounded-2xl">
                      <DialogHeader className="space-y-3 pb-3 border-b border-slate-800/80">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-purple-900/40 shrink-0">
                            {editingUserId ? <UserCheck className="w-6 h-6" /> : <UserPlus className="w-6 h-6" />}
                          </div>
                          <div>
                            <DialogTitle className="text-xl font-bold text-white tracking-tight">
                              {editingUserId ? 'Edit Data Karyawan' : 'Tambah Karyawan Baru'}
                            </DialogTitle>
                            <DialogDescription className="text-xs text-slate-400 mt-1">
                              {editingUserId
                                ? 'Perbarui informasi profil dan hak akses karyawan di bawah ini.'
                                : 'Daftarkan karyawan baru ke sistem presensi & portal kerja Dexa.'}
                            </DialogDescription>
                          </div>
                        </div>
                      </DialogHeader>

                      <form onSubmit={handleSubmitUser} className="space-y-4 pt-1">
                        {/* Nama Lengkap */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1">
                            <span>Nama Lengkap</span>
                            <span className="text-rose-400">*</span>
                          </label>
                          <div className="relative">
                            <Users className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                            <Input
                              placeholder="Contoh: Budi Santoso"
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              required
                              className="pl-9 h-10 bg-slate-950/80 border-slate-800 text-slate-100 placeholder:text-slate-500 focus:border-purple-500 focus:ring-purple-500/20"
                            />
                          </div>
                        </div>

                        {/* Email Perusahaan */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1">
                            <span>Email Perusahaan</span>
                            <span className="text-rose-400">*</span>
                          </label>
                          <div className="relative">
                            <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                            <Input
                              type="email"
                              placeholder="nama@dexa.com"
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              required
                              className="pl-9 h-10 bg-slate-950/80 border-slate-800 text-slate-100 placeholder:text-slate-500 focus:border-purple-500 focus:ring-purple-500/20"
                            />
                          </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1">
                              <span>Password</span>
                              {!editingUserId && <span className="text-rose-400">*</span>}
                            </label>
                            {editingUserId && (
                              <span className="text-[11px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded font-medium">
                                Kosongkan jika tidak diubah
                              </span>
                            )}
                          </div>
                          <div className="relative">
                            <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                            <Input
                              type="password"
                              placeholder={editingUserId ? '•••••••• (Tetap sama)' : 'Minimal 6 karakter'}
                              value={formData.password}
                              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                              required={!editingUserId}
                              minLength={editingUserId ? 0 : 6}
                              className="pl-9 h-10 bg-slate-950/80 border-slate-800 text-slate-100 placeholder:text-slate-500 focus:border-purple-500 focus:ring-purple-500/20"
                            />
                          </div>
                        </div>

                        {/* Jabatan & No HP */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1">
                              <span>Jabatan / Posisi</span>
                              <span className="text-rose-400">*</span>
                            </label>
                            <div className="relative">
                              <Briefcase className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                              <Input
                                placeholder="Software Engineer"
                                value={formData.position}
                                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                required
                                className="pl-9 h-10 bg-slate-950/80 border-slate-800 text-slate-100 placeholder:text-slate-500 focus:border-purple-500 focus:ring-purple-500/20"
                              />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1">
                              <span>No. WhatsApp / HP</span>
                              <span className="text-rose-400">*</span>
                            </label>
                            <div className="relative">
                              <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                              <Input
                                placeholder="08123456789"
                                value={formData.phoneNumber}
                                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                required
                                className="pl-9 h-10 bg-slate-950/80 border-slate-800 text-slate-100 placeholder:text-slate-500 focus:border-purple-500 focus:ring-purple-500/20"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Hak Akses / Role Selector Cards */}
                        <div className="space-y-2 pt-1">
                          <label className="text-xs font-semibold text-slate-300">Hak Akses Sistem (Role)</label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <div
                              onClick={() => setFormData({ ...formData, role: 'EMPLOYEE' })}
                              className={`p-3 rounded-xl border text-left flex items-start space-x-3 cursor-pointer transition-all ${
                                formData.role === 'EMPLOYEE'
                                  ? 'border-purple-500 bg-purple-500/15 ring-1 ring-purple-500/30 shadow-sm'
                                  : 'border-slate-800 hover:border-slate-700 bg-slate-950/40'
                              }`}
                            >
                              <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                  formData.role === 'EMPLOYEE'
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-slate-800 text-slate-400'
                                }`}
                              >
                                <Users className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <p className="text-xs font-bold text-white">Karyawan</p>
                                  {formData.role === 'EMPLOYEE' && (
                                    <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                                  )}
                                </div>
                                <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                                  Akses presensi & profil kerja
                                </p>
                              </div>
                            </div>

                            <div
                              onClick={() => setFormData({ ...formData, role: 'HRD_ADMIN' })}
                              className={`p-3 rounded-xl border text-left flex items-start space-x-3 cursor-pointer transition-all ${
                                formData.role === 'HRD_ADMIN'
                                  ? 'border-purple-500 bg-purple-500/15 ring-1 ring-purple-500/30 shadow-sm'
                                  : 'border-slate-800 hover:border-slate-700 bg-slate-950/40'
                              }`}
                            >
                              <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                  formData.role === 'HRD_ADMIN'
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-slate-800 text-slate-400'
                                }`}
                              >
                                <Shield className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <p className="text-xs font-bold text-white">HRD Admin</p>
                                  {formData.role === 'HRD_ADMIN' && (
                                    <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                                  )}
                                </div>
                                <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                                  Kelola tim & monitor presensi
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <DialogFooter className="pt-4 border-t border-slate-800/80 flex items-center justify-end space-x-2">
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setIsDialogOpen(false)}
                            disabled={submitting}
                            className="text-slate-400 hover:text-white hover:bg-slate-800 font-medium"
                          >
                            Batal
                          </Button>
                          <Button
                            type="submit"
                            disabled={submitting}
                            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-purple-900/40 px-5"
                          >
                            {submitting ? (
                              <>
                                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                                <span>Menyimpan...</span>
                              </>
                            ) : (
                              <span>Simpan Data</span>
                            )}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-4 border-t border-slate-800/80 mt-4">
                <div className="sm:col-span-8 relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <Input
                    placeholder="Cari berdasarkan nama, email, atau jabatan..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="pl-9 h-10 bg-slate-950/60 border-slate-800 text-slate-200 placeholder:text-slate-500 focus:border-purple-500 focus:ring-purple-500/20"
                  />
                </div>
                <div className="sm:col-span-4 flex rounded-xl bg-slate-950/80 border border-slate-800/80 p-1">
                  <button
                    type="button"
                    onClick={() => setUserRoleFilter('ALL')}
                    className={`flex-1 text-xs font-semibold py-1.5 rounded-lg transition-all ${
                      userRoleFilter === 'ALL'
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    Semua
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserRoleFilter('EMPLOYEE')}
                    className={`flex-1 text-xs font-semibold py-1.5 rounded-lg transition-all ${
                      userRoleFilter === 'EMPLOYEE'
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    Karyawan
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserRoleFilter('HRD_ADMIN')}
                    className={`flex-1 text-xs font-semibold py-1.5 rounded-lg transition-all ${
                      userRoleFilter === 'HRD_ADMIN'
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    Admin
                  </button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-950/80 border-b border-slate-800/80">
                    <TableRow className="border-b border-slate-800/80 hover:bg-transparent">
                      <TableHead className="font-semibold text-slate-400 text-xs uppercase tracking-wider">Karyawan</TableHead>
                      <TableHead className="font-semibold text-slate-400 text-xs uppercase tracking-wider">Jabatan</TableHead>
                      <TableHead className="font-semibold text-slate-400 text-xs uppercase tracking-wider">Kontak HP</TableHead>
                      <TableHead className="font-semibold text-slate-400 text-xs uppercase tracking-wider">Role</TableHead>
                      <TableHead className="font-semibold text-slate-400 text-xs uppercase tracking-wider">Terdaftar</TableHead>
                      <TableHead className="font-semibold text-slate-400 text-xs uppercase tracking-wider text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingUsers ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12 text-slate-400">
                          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-purple-400 mb-2" />
                          <span>Memuat daftar karyawan...</span>
                        </TableCell>
                      </TableRow>
                    ) : filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12 text-slate-400">
                          <Users className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                          <p className="font-medium text-slate-300">Tidak ada data karyawan ditemukan</p>
                          <p className="text-xs text-slate-500 mt-1">Gunakan tombol "Tambah Karyawan" untuk mendaftarkan akun baru</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((u) => (
                        <TableRow key={u.id} className="border-b border-slate-800/60 hover:bg-slate-800/40 transition-colors">
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar className="w-9 h-9 border border-slate-700 bg-purple-950 text-purple-300">
                                <AvatarImage src={u.photoUrl} />
                                <AvatarFallback className="bg-purple-950 text-purple-300 font-bold text-xs">
                                  {u.name?.substring(0, 2).toUpperCase() || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-semibold text-slate-200">{u.name}</p>
                                <p className="text-xs text-slate-400">{u.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-slate-300 font-medium">
                            {u.position}
                          </TableCell>
                          <TableCell className="text-xs text-slate-400 font-mono">
                            {u.phoneNumber}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                u.role === 'HRD_ADMIN'
                                  ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                                  : 'bg-slate-800/60 text-slate-300 border border-slate-700/60'
                              }
                            >
                              {u.role === 'HRD_ADMIN' ? 'HRD Admin' : 'Karyawan'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-slate-400">
                            {formatDate(u.createdAt)}
                          </TableCell>
                          <TableCell className="text-right space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditUser(u)}
                              className="text-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-300 h-8 w-8 p-0 rounded-lg transition-colors"
                              title="Edit Karyawan"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteUser(u.id, u.name)}
                              className="text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 h-8 w-8 p-0 rounded-lg transition-colors"
                              title="Hapus Karyawan"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};