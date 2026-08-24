"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  Globe, 
  Smartphone, 
  Link2, 
  Shield, 
  Plus, 
  MoreVertical, 
  FolderPlus,
  AlertTriangle,
  Loader2,
  Edit,
  Trash2,
  Eye,
  Building2,
  Calendar,
  Layers,
  CheckCircle2,
  Clock,
  Archive,
  ArrowRight,
  User,
  Users
} from "lucide-react";
import Link from "next/link";
import { SearchBar } from "@/components/ui/SearchBar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Table, Column } from "@/components/ui/Table";
import { Avatar } from "@/components/ui/Avatar";
import { Pagination } from "@/components/ui/Pagination";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { showToast } from "@/components/ui/Toast";
import { useTaskStore, Project } from "@/store/useTaskStore";
import { useAuthStore } from "@/store/useAuthStore";
import { getBidangs } from "@/services/api";

export default function ManajemenTugasDigitalPage() {
  const {
    projects,
    loadingProjects,
    error,
    fetchProjects,
    addProject,
    editProject,
    removeProject,
    joinProject,
    loadCurrentUser,
    currentUser
  } = useTaskStore();

  const { isAdminAptika, bidang: authBidang, user: authUser } = useAuthStore();

  const [search, setSearch] = useState("");
  const [selectedBidangFilter, setSelectedBidangFilter] = useState<string>("ALL");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [bidangsList, setBidangsList] = useState<{ id: number; name: string; code: string }[]>([]);

  // ── Create Project Modal Form State ──
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProjName, setNewProjName] = useState("");
  const [newProjDesc, setNewProjDesc] = useState("");
  const [newProjStartDate, setNewProjStartDate] = useState("");
  const [newProjDeadline, setNewProjDeadline] = useState("");
  const [newProjBidangId, setNewProjBidangId] = useState<string>("");
  const [newProjStatus, setNewProjStatus] = useState("active");
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    description?: string;
    deadline?: string;
  }>({});

  // ── Edit Project Modal Form State ──
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editProjName, setEditProjName] = useState("");
  const [editProjDesc, setEditProjDesc] = useState("");
  const [editProjStartDate, setEditProjStartDate] = useState("");
  const [editProjDeadline, setEditProjDeadline] = useState("");
  const [editProjStatus, setEditProjStatus] = useState("active");
  const [editProjBidangId, setEditProjBidangId] = useState<string>("");
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editFormErrors, setEditFormErrors] = useState<{
    name?: string;
    description?: string;
  }>({});

  // ── Detail Project Modal State ──
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailProject, setDetailProject] = useState<Project | null>(null);

  // ── Delete Project Modal State ──
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ── Join Project confirmation modal state ──
  const [isJoinConfirmOpen, setIsJoinConfirmOpen] = useState(false);
  const [projectToJoin, setProjectToJoin] = useState<Project | null>(null);
  const [joining, setJoining] = useState(false);

  // Initial Load
  useEffect(() => {
    loadCurrentUser();
    fetchProjects();

    // Fetch Bidang List for Filters and Selector
    getBidangs()
      .then((res) => {
        const list = res.data ?? res;
        if (Array.isArray(list)) {
          setBidangsList(list);
        }
      })
      .catch((err) => console.error("Gagal memuat daftar bidang:", err));
  }, [loadCurrentUser, fetchProjects]);

  // Is user Admin / PM for permission check
  const isAdmin = currentUser?.role === "admin" || authUser?.role === "admin" || isAdminAptika;

  const canManageProject = (p: Project) => {
    if (isAdmin) return true;
    const uid = currentUser?.id || authUser?.id;
    if (uid && p.created_by === uid) return true;
    if (p.pm?.id && p.pm.id === uid) return true;
    return false;
  };

  // Filtering
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      // Search
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description?.toLowerCase().includes(search.toLowerCase()) ||
        p.manager?.toLowerCase().includes(search.toLowerCase()) ||
        (p.bidang?.name && p.bidang.name.toLowerCase().includes(search.toLowerCase())) ||
        (p.bidang?.code && p.bidang.code.toLowerCase().includes(search.toLowerCase()));

      // Bidang filter
      const matchBidang =
        selectedBidangFilter === "ALL" ||
        String(p.bidang_id) === String(selectedBidangFilter) ||
        (p.bidang && String(p.bidang.id) === String(selectedBidangFilter));

      // Status filter
      const matchStatus =
        selectedStatusFilter === "ALL" ||
        (p.status || "active").toLowerCase() === selectedStatusFilter.toLowerCase();

      return matchSearch && matchBidang && matchStatus;
    });
  }, [projects, search, selectedBidangFilter, selectedStatusFilter]);

  const itemsPerPage = 8;
  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / itemsPerPage));
  const paginatedProjects = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProjects.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProjects, currentPage, itemsPerPage]);

  // Validation Form Tambah
  const validateForm = () => {
    const errors: typeof formErrors = {};
    let isValid = true;

    if (!newProjName.trim()) {
      errors.name = "Nama proyek wajib diisi";
      isValid = false;
    } else if (newProjName.trim().length < 3) {
      errors.name = "Nama proyek minimal 3 karakter";
      isValid = false;
    }

    if (!newProjDesc.trim()) {
      errors.description = "Deskripsi proyek wajib diisi";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  // Validation Form Edit
  const validateEditForm = () => {
    const errors: typeof editFormErrors = {};
    let isValid = true;

    if (!editProjName.trim()) {
      errors.name = "Nama proyek wajib diisi";
      isValid = false;
    } else if (editProjName.trim().length < 3) {
      errors.name = "Nama proyek minimal 3 karakter";
      isValid = false;
    }

    if (!editProjDesc.trim()) {
      errors.description = "Deskripsi proyek wajib diisi";
      isValid = false;
    }

    setEditFormErrors(errors);
    return isValid;
  };

  // Handle Create
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    let pType: "web" | "mobile" | "api" | "security" = "web";
    const lowercaseName = newProjName.toLowerCase();
    if (lowercaseName.includes("mobile") || lowercaseName.includes("app") || lowercaseName.includes("android") || lowercaseName.includes("ios")) {
      pType = "mobile";
    } else if (lowercaseName.includes("api") || lowercaseName.includes("integrasi") || lowercaseName.includes("interop")) {
      pType = "api";
    } else if (lowercaseName.includes("security") || lowercaseName.includes("keamanan") || lowercaseName.includes("audit")) {
      pType = "security";
    }

    const success = await addProject({
      name: newProjName,
      description: newProjDesc,
      start_date: newProjStartDate || undefined,
      deadline: newProjDeadline || undefined,
      status: newProjStatus,
      type: pType,
      bidang_id: newProjBidangId ? Number(newProjBidangId) : (authBidang?.id || undefined),
    });

    setSubmitting(false);

    if (success) {
      setNewProjName("");
      setNewProjDesc("");
      setNewProjStartDate("");
      setNewProjDeadline("");
      setNewProjBidangId("");
      setNewProjStatus("active");
      setFormErrors({});
      setIsModalOpen(false);
      showToast.success(`Proyek "${newProjName}" berhasil dibuat!`);
    } else {
      showToast.error("Gagal menyimpan proyek baru.");
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (p: Project) => {
    setEditingProject(p);
    setEditProjName(p.name || "");
    setEditProjDesc(p.description || "");
    setEditProjStartDate(p.start_date ? p.start_date.substring(0, 10) : "");
    setEditProjDeadline(p.deadline ? p.deadline.substring(0, 10) : (p.end_date ? p.end_date.substring(0, 10) : ""));
    setEditProjStatus(p.status || "active");
    setEditProjBidangId(p.bidang_id ? String(p.bidang_id) : (p.bidang?.id ? String(p.bidang.id) : ""));
    setEditFormErrors({});
    setIsEditModalOpen(true);
  };

  // Handle Submit Edit
  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;
    if (!validateEditForm()) return;

    setEditSubmitting(true);
    const success = await editProject(editingProject.id, {
      name: editProjName,
      description: editProjDesc,
      start_date: editProjStartDate || undefined,
      deadline: editProjDeadline || undefined,
      status: editProjStatus,
      bidang_id: editProjBidangId ? Number(editProjBidangId) : undefined,
    });
    setEditSubmitting(false);

    if (success) {
      setIsEditModalOpen(false);
      setEditingProject(null);
      showToast.success("Proyek berhasil diperbarui!");
    } else {
      showToast.error("Gagal memperbarui proyek.");
    }
  };

  // Handle Delete Confirmation
  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;
    setDeleting(true);
    const success = await removeProject(projectToDelete.id);
    setDeleting(false);
    setIsDeleteModalOpen(false);

    if (success) {
      showToast.success(`Proyek "${projectToDelete.name}" berhasil dihapus.`);
    } else {
      showToast.error("Gagal menghapus proyek.");
    }
    setProjectToDelete(null);
  };

  // Open Detail Modal
  const handleOpenDetail = (p: Project) => {
    setDetailProject(p);
    setIsDetailModalOpen(true);
  };

  // Join Project
  const initiateJoin = (project: Project) => {
    setProjectToJoin(project);
    setIsJoinConfirmOpen(true);
  };

  const confirmJoinRequest = async () => {
    if (!projectToJoin) return;
    setJoining(true);
    const success = await joinProject(projectToJoin.id);
    setJoining(false);
    setIsJoinConfirmOpen(false);

    if (success) {
      showToast.success(`Anda berhasil bergabung dengan proyek "${projectToJoin.name}"`);
    } else {
      showToast.error("Gagal bergabung ke proyek.");
    }
    setProjectToJoin(null);
  };

  // Table Columns Definition
  const columns: Column<Project>[] = [
    {
      header: "NOMOR",
      className: "w-14 text-center text-slate-400 font-bold",
      render: (_, __, idx) => (
        <span className="font-semibold text-xs text-slate-400">
          {(currentPage - 1) * itemsPerPage + idx + 1}
        </span>
      ),
    },
    {
      header: "NAMA PROYEK",
      accessor: "name",
      className: "font-semibold text-slate-800 min-w-[220px]",
      render: (val, row) => {
        const IconMap = {
          web: Globe,
          mobile: Smartphone,
          api: Link2,
          security: Shield,
        };
        const Icon = IconMap[row.type as "web" | "mobile" | "api" | "security"] || Globe;
        return (
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex-shrink-0 border border-blue-100 dark:border-blue-500/20">
              <Icon size={18} />
            </div>
            <div className="flex flex-col text-left">
              <Link 
                href={`/manajementugasdigital/board/${row.id}`}
                className="text-xs font-bold text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors hover:underline cursor-pointer flex items-center gap-1.5"
                title="Buka Papan Kanban"
              >
                {val}
              </Link>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-normal truncate max-w-[220px] mt-0.5" title={row.description}>
                {row.description || "Tidak ada deskripsi"}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      header: "UNIT KERJA / BIDANG",
      className: "min-w-[160px]",
      render: (_, row) => {
        const bCode = row.bidang?.code || (row.bidang_id ? `BIDANG #${row.bidang_id}` : "APTIKA");
        const bName = row.bidang?.name || "";
        return (
          <div className="flex flex-col">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/20 w-fit">
              <Building2 size={11} />
              {bCode}
            </span>
            {bName && (
              <span className="text-[10px] text-slate-400 truncate max-w-[160px] mt-0.5" title={bName}>
                {bName}
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: "PROJECT MANAGER",
      accessor: "manager",
      className: "text-xs font-semibold text-slate-700 dark:text-slate-300 min-w-[140px]",
      render: (val, row) => (
        <div className="flex items-center gap-2">
          <Avatar name={val || "PM"} size="xs" />
          <div className="flex flex-col text-left">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{val || "PM"}</span>
            {row.pm?.email && (
              <span className="text-[10px] text-slate-400 truncate max-w-[120px]">{row.pm.email}</span>
            )}
          </div>
        </div>
      )
    },
    {
      header: "TIMELINE / DEADLINE",
      className: "min-w-[140px]",
      render: (_, row) => {
        const d = row.deadline || row.end_date;
        return (
          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
            <Calendar size={13} className="text-slate-400" />
            <span className="font-semibold">{d ? new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-"}</span>
          </div>
        );
      }
    },
    {
      header: "STATUS",
      className: "w-28 text-center",
      render: (_, row) => {
        const st = (row.status || "active").toLowerCase();
        if (st === "completed") {
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/25">
              <CheckCircle2 size={11} />
              Selesai
            </span>
          );
        }
        if (st === "archived") {
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
              <Archive size={11} />
              Arsip
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/25">
            <Clock size={11} />
            Aktif
          </span>
        );
      },
    },
    {
      header: "ANGGOTA",
      className: "w-32",
      render: (_, row) => {
        const displayed = row.members ? row.members.slice(0, 3) : [];
        const totalCount = row.totalMembersCount || (row.members ? row.members.length : 0);
        const extra = totalCount - displayed.length;
        return (
          <div className="flex items-center -space-x-1.5">
            {displayed.map((m, i) => (
              <Avatar
                key={i}
                name={m.name}
                size="xs"
                className="ring-2 ring-white dark:ring-slate-900"
              />
            ))}
            {extra > 0 && (
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 ring-2 ring-white dark:ring-slate-900 text-[9px] font-extrabold text-blue-600 dark:text-blue-300 select-none">
                +{extra}
              </div>
            )}
            {totalCount === 0 && (
              <span className="text-[11px] text-slate-400 font-medium italic">Belum ada</span>
            )}
          </div>
        );
      },
    },
    {
      header: "AKSI",
      className: "min-w-[200px] text-center",
      render: (_, row) => {
        const isManagerOrAdmin = canManageProject(row);

        return (
          <div className="flex items-center justify-center gap-1.5 flex-wrap">
            {/* Detail Button */}
            <button
              onClick={() => handleOpenDetail(row)}
              className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
              title="Lihat Detail Proyek"
            >
              <Eye size={15} />
            </button>

            {/* Link to Kanban Board */}
            <Link
              href={`/manajementugasdigital/board/${row.id}`}
              className="p-1.5 text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-500/15 rounded-lg transition-all font-bold flex items-center gap-1 text-[11px]"
              title="Buka Papan Kanban"
            >
              <ArrowRight size={15} />
            </Link>

            {/* Edit Button (PM / Admin only) */}
            {isManagerOrAdmin && (
              <button
                onClick={() => handleOpenEdit(row)}
                className="p-1.5 text-amber-600 dark:text-amber-400 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-500/15 rounded-lg transition-all"
                title="Edit Data Proyek"
              >
                <Edit size={15} />
              </button>
            )}

            {/* Delete Button (PM / Admin only) */}
            {isManagerOrAdmin && (
              <button
                onClick={() => {
                  setProjectToDelete(row);
                  setIsDeleteModalOpen(true);
                }}
                className="p-1.5 text-red-600 dark:text-red-400 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-500/15 rounded-lg transition-all"
                title="Hapus Proyek"
              >
                <Trash2 size={15} />
              </button>
            )}

            {/* Join Button (if not joined) */}
            {!row.isJoined && (
              <Button
                variant="default"
                size="sm"
                onClick={() => initiateJoin(row)}
                className="text-[10px] font-bold px-2.5 py-1 h-7 bg-blue-900 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-800"
              >
                Join
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner / Action Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-[#0b1630] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm transition-colors duration-200">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-orange-50 dark:bg-orange-500/15 border border-orange-200 dark:border-orange-500/25 flex items-center justify-center flex-shrink-0">
            <Layers size={22} className="text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-slate-800 dark:text-white">
              Manajemen Tugas & Proyek Digital
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Kelola proyek, tetapkan tugas, dan pantau progres kerja di seluruh unit kerja Diskominfo Jabar.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start lg:self-auto flex-wrap">
          {currentUser && (
            <Button
              onClick={() => {
                setFormErrors({});
                setNewProjName("");
                setNewProjDesc("");
                setNewProjStartDate("");
                setNewProjDeadline("");
                setNewProjBidangId(authBidang?.id ? String(authBidang.id) : "");
                setNewProjStatus("active");
                setIsModalOpen(true);
              }}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs h-10 px-4 rounded-xl shadow-md shadow-orange-500/20 flex items-center gap-1.5"
            >
              <Plus size={16} />
              Tambah Proyek Baru
            </Button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#0b1630] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm transition-colors duration-200">
        <SearchBar
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          onClear={() => setSearch("")}
          placeholder="Cari nama proyek, deskripsi, PM, bidang..."
          className="max-w-md bg-slate-50/70 dark:bg-slate-900/50"
        />

        <div className="flex items-center gap-2 flex-wrap">
          {/* Bidang Filter (Especially for Super Admin / Cross-Bidang Admin) */}
          {(isAdmin || bidangsList.length > 0) && (
            <div className="flex items-center gap-1.5 text-xs">
              <Building2 size={14} className="text-slate-400" />
              <select
                value={selectedBidangFilter}
                onChange={(e) => {
                  setSelectedBidangFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="text-xs font-semibold px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="ALL">Semua Bidang / Unit Kerja</option>
                {bidangsList.map((b) => (
                  <option key={b.id} value={String(b.id)}>
                    {b.code} — {b.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Status Filter */}
          <select
            value={selectedStatusFilter}
            onChange={(e) => {
              setSelectedStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs font-semibold px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="ALL">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="completed">Selesai</option>
            <option value="archived">Arsip</option>
          </select>
        </div>
      </div>

      {/* Main Table Content */}
      {error ? (
        <Card hoverable={false} className="border-red-100 dark:border-red-900/30 bg-red-50/20 py-8 text-center">
          <div className="flex flex-col items-center justify-center gap-3">
            <AlertTriangle className="text-red-500 w-8 h-8" />
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Terjadi Kesalahan</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{error}</p>
            </div>
            <Button size="sm" onClick={() => fetchProjects()} className="mt-2 bg-slate-900 dark:bg-slate-700 text-white">
              Coba Lagi
            </Button>
          </div>
        </Card>
      ) : (
        <Card
          title={`Daftar Proyek (${filteredProjects.length} Proyek)`}
          headerActions={
            <button 
              onClick={() => fetchProjects()} 
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              title="Refresh Data"
            >
              <MoreVertical size={16} />
            </button>
          }
          hoverable={false}
          className="shadow-sm border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0b1630]"
        >
          <div className="-mx-6 -my-5 flex flex-col">
            <Table
              columns={columns}
              data={paginatedProjects}
              loading={loadingProjects}
              emptyText="Tidak ada proyek yang sesuai dengan kriteria."
              className="border-0 rounded-none shadow-none"
            />
            {!loadingProjects && filteredProjects.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={filteredProjects.length}
                itemsPerPage={itemsPerPage}
                className="border-0 border-t border-slate-100 dark:border-slate-800 rounded-none"
              />
            )}
          </div>
        </Card>
      )}

      {/* ── Modal: Tambah Proyek Baru (Create) ── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => !submitting && setIsModalOpen(false)}
        title="Tambah Proyek Baru"
        size="md"
        footer={
          <>
            <Button
              variant="outline"
              disabled={submitting}
              onClick={() => setIsModalOpen(false)}
              className="text-xs font-semibold px-4 h-9 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
            >
              Batal
            </Button>
            <Button
              onClick={handleCreateProject}
              disabled={submitting}
              className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-4 h-9 shadow-md shadow-orange-500/20"
            >
              {submitting ? (
                <div className="flex items-center gap-1.5">
                  <Loader2 size={14} className="animate-spin" />
                  <span>Menyimpan...</span>
                </div>
              ) : (
                "Simpan Proyek"
              )}
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateProject} className="space-y-4 text-left">
          <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 rounded-xl mb-1">
            <FolderPlus className="text-orange-600 dark:text-orange-400 flex-shrink-0" size={20} />
            <div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Tambahkan Proyek Digital</h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                Proyek akan terhubung ke papan Kanban untuk pelacakan tugas kolaboratif.
              </p>
            </div>
          </div>

          <Input
            label="Nama Proyek"
            placeholder="Contoh: Pengembangan Dashboard Multi-Bidang..."
            value={newProjName}
            onChange={(e) => {
              setNewProjName(e.target.value);
              if (formErrors.name) setFormErrors({ ...formErrors, name: undefined });
            }}
            error={formErrors.name}
            required
            disabled={submitting}
          />

          {/* Unit Kerja / Bidang Selector (for Super Admin or Admin) */}
          {(isAdmin || bidangsList.length > 0) && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Unit Kerja / Bidang
              </label>
              <select
                value={newProjBidangId}
                onChange={(e) => setNewProjBidangId(e.target.value)}
                disabled={submitting || (!isAdminAptika && !isAdmin)}
                className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                {bidangsList.map((b) => (
                  <option key={b.id} value={String(b.id)}>
                    {b.code} — {b.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <Input
            textarea
            rows={3}
            label="Deskripsi Proyek"
            placeholder="Tuliskan deskripsi ringkas mengenai ruang lingkup, target hasil, dan detail proyek..."
            value={newProjDesc}
            onChange={(e) => {
              setNewProjDesc(e.target.value);
              if (formErrors.description) setFormErrors({ ...formErrors, description: undefined });
            }}
            error={formErrors.description}
            required
            disabled={submitting}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              type="date"
              label="Tanggal Mulai"
              value={newProjStartDate}
              onChange={(e) => setNewProjStartDate(e.target.value)}
              disabled={submitting}
            />

            <Input
              type="date"
              label="Tenggat Waktu / Selesai"
              value={newProjDeadline}
              onChange={(e) => setNewProjDeadline(e.target.value)}
              disabled={submitting}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Status Proyek
            </label>
            <select
              value={newProjStatus}
              onChange={(e) => setNewProjStatus(e.target.value)}
              disabled={submitting}
              className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="active">Aktif (Sedang Berjalan)</option>
              <option value="completed">Selesai (Completed)</option>
              <option value="archived">Diarsipkan (Archived)</option>
            </select>
          </div>
        </form>
      </Modal>

      {/* ── Modal: Edit Proyek (Update) ── */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => !editSubmitting && setIsEditModalOpen(false)}
        title="Edit Data Proyek"
        size="md"
        footer={
          <>
            <Button
              variant="outline"
              disabled={editSubmitting}
              onClick={() => setIsEditModalOpen(false)}
              className="text-xs font-semibold px-4 h-9 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
            >
              Batal
            </Button>
            <Button
              onClick={handleUpdateProject}
              disabled={editSubmitting}
              className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-4 h-9 shadow-md shadow-amber-500/20"
            >
              {editSubmitting ? (
                <div className="flex items-center gap-1.5">
                  <Loader2 size={14} className="animate-spin" />
                  <span>Memperbarui...</span>
                </div>
              ) : (
                "Simpan Perubahan"
              )}
            </Button>
          </>
        }
      >
        <form onSubmit={handleUpdateProject} className="space-y-4 text-left">
          <Input
            label="Nama Proyek"
            placeholder="Masukkan nama proyek..."
            value={editProjName}
            onChange={(e) => {
              setEditProjName(e.target.value);
              if (editFormErrors.name) setEditFormErrors({ ...editFormErrors, name: undefined });
            }}
            error={editFormErrors.name}
            required
            disabled={editSubmitting}
          />

          {/* Unit Kerja / Bidang (Super Admin / Admin only) */}
          {(isAdmin || bidangsList.length > 0) && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Unit Kerja / Bidang
              </label>
              <select
                value={editProjBidangId}
                onChange={(e) => setEditProjBidangId(e.target.value)}
                disabled={editSubmitting || (!isAdminAptika && !isAdmin)}
                className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                {bidangsList.map((b) => (
                  <option key={b.id} value={String(b.id)}>
                    {b.code} — {b.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <Input
            textarea
            rows={3}
            label="Deskripsi Proyek"
            placeholder="Tuliskan deskripsi ringkas mengenai proyek..."
            value={editProjDesc}
            onChange={(e) => {
              setEditProjDesc(e.target.value);
              if (editFormErrors.description) setEditFormErrors({ ...editFormErrors, description: undefined });
            }}
            error={editFormErrors.description}
            required
            disabled={editSubmitting}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              type="date"
              label="Tanggal Mulai"
              value={editProjStartDate}
              onChange={(e) => setEditProjStartDate(e.target.value)}
              disabled={editSubmitting}
            />

            <Input
              type="date"
              label="Tenggat Waktu / Selesai"
              value={editProjDeadline}
              onChange={(e) => setEditProjDeadline(e.target.value)}
              disabled={editSubmitting}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Status Proyek
            </label>
            <select
              value={editProjStatus}
              onChange={(e) => setEditProjStatus(e.target.value)}
              disabled={editSubmitting}
              className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="active">Aktif (Sedang Berjalan)</option>
              <option value="completed">Selesai (Completed)</option>
              <option value="archived">Diarsipkan (Archived)</option>
            </select>
          </div>
        </form>
      </Modal>

      {/* ── Modal: Detail Proyek (Read) ── */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Detail Informasi Proyek"
        size="md"
        footer={
          <div className="flex items-center justify-between w-full">
            <Button
              variant="outline"
              onClick={() => setIsDetailModalOpen(false)}
              className="text-xs font-semibold px-4 h-9 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
            >
              Tutup
            </Button>
            {detailProject && (
              <Link
                href={`/manajementugasdigital/board/${detailProject.id}`}
                className="inline-flex items-center gap-1.5 px-4 h-9 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all"
              >
                <span>Buka Papan Kanban</span>
                <ArrowRight size={14} />
              </Link>
            )}
          </div>
        }
      >
        {detailProject && (
          <div className="space-y-4 text-left">
            {/* Header Info */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-500/20">
                  {detailProject.bidang?.code || "APTIKA"}
                </span>
                <h3 className="text-sm font-extrabold text-slate-800 dark:text-white mt-1.5">
                  {detailProject.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {detailProject.bidang?.name || "Bidang Aplikasi Informatika"}
                </p>
              </div>

              <div>
                {detailProject.status === "completed" ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/25">
                    Selesai
                  </span>
                ) : detailProject.status === "archived" ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                    Arsip
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/25">
                    Aktif
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                Deskripsi
              </label>
              <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/50 text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {detailProject.description || "Tidak ada deskripsi rinci untuk proyek ini."}
              </div>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/50">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Project Manager
                </span>
                <div className="flex items-center gap-2">
                  <Avatar name={detailProject.manager || "PM"} size="xs" />
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {detailProject.manager || "PM"}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/50">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Tenggat Waktu
                </span>
                <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-semibold">
                  <Calendar size={13} className="text-slate-400" />
                  <span>
                    {detailProject.deadline || detailProject.end_date
                      ? new Date(detailProject.deadline || detailProject.end_date!).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : "Tidak ditentukan"}
                  </span>
                </div>
              </div>
            </div>

            {/* Members Section */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Anggota Tim ({detailProject.totalMembersCount || detailProject.members?.length || 0})
                </label>
              </div>

              <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/50">
                {detailProject.members && detailProject.members.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {detailProject.members.map((m, idx) => (
                      <div
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-semibold text-slate-700 dark:text-slate-200"
                      >
                        <Avatar name={m.name} size="xs" />
                        <span>{m.name}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">Belum ada anggota yang bergabung dalam proyek ini.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Modal: Konfirmasi Hapus Proyek (Delete) ── */}
      {isDeleteModalOpen && projectToDelete && (
        <ConfirmModal
          isOpen={isDeleteModalOpen}
          title="Hapus Proyek"
          message={`Apakah Anda yakin ingin menghapus proyek "${projectToDelete.name}"? Semua tugas dan kartu di dalam papan Kanban proyek ini akan ikut terhapus.`}
          onConfirm={handleConfirmDelete}
          onClose={() => {
            if (!deleting) {
              setIsDeleteModalOpen(false);
              setProjectToDelete(null);
            }
          }}
          confirmText={deleting ? "Menghapus..." : "Hapus Proyek"}
          isDanger={true}
        />
      )}

      {/* ── Modal: Join Project Confirmation ── */}
      <Modal
        isOpen={isJoinConfirmOpen}
        onClose={() => {
          if (!joining) {
            setIsJoinConfirmOpen(false);
            setProjectToJoin(null);
          }
        }}
        title="Konfirmasi Join Proyek"
        size="sm"
        footer={
          <>
            <Button
              variant="outline"
              disabled={joining}
              onClick={() => {
                setIsJoinConfirmOpen(false);
                setProjectToJoin(null);
              }}
              className="text-xs font-semibold px-4 h-9 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
            >
              Batal
            </Button>
            <Button
              disabled={joining}
              onClick={confirmJoinRequest}
              className="bg-blue-900 dark:bg-blue-700 text-white text-xs font-bold px-4 h-9 hover:bg-blue-800"
            >
              {joining ? (
                <div className="flex items-center gap-1.5">
                  <Loader2 size={14} className="animate-spin" />
                  <span>Memproses...</span>
                </div>
              ) : (
                "Ya, Bergabung"
              )}
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-left">
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Apakah Anda yakin ingin bergabung sebagai anggota dalam proyek <strong>{projectToJoin?.name}</strong>?
          </p>
          <p className="text-[10px] text-slate-400">
            Setelah bergabung, nama Anda akan terdaftar sebagai anggota proyek ini, dan Anda akan dapat mengelola papan Kanban untuk tugas-tugas di dalamnya.
          </p>
        </div>
      </Modal>
    </div>
  );
}
