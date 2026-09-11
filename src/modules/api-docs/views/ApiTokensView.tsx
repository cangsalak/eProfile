'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { ApiKeyRecord } from '../lib/api-keys';
import TablePagination from '@/components/common/TablePagination';
import { PageHeaderExtra } from '@/components/layout/PageHeaderContext';
import {
  Button,
  Badge,
  Card,
  Modal,
  Input,
  Select,
} from '@/components/ui';

export default function ApiTokensView() {
  const [tokens, setTokens] = useState<Omit<ApiKeyRecord, 'keyHash'>[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [newlyCreatedToken, setNewlyCreatedToken] = useState<{
    apiKey: Omit<ApiKeyRecord, 'keyHash'>;
    plainToken: string;
  } | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState('ADMIN');
  const [formExpiresInDays, setFormExpiresInDays] = useState<number | null>(90);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Copy state
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  const fetchTokens = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/modules/api-docs/tokens');
      if (res.ok) {
        const json = await res.json();
        setTokens(json.data || []);
      } else if (res.status === 403) {
        toast.error('คุณไม่มีสิทธิ์เข้าถึงหน้านี้ (เฉพาะ SUPER_ADMIN และ ADMIN เท่านั้น)');
      } else {
        toast.error('ไม่สามารถโหลดรายการ API Tokens ได้');
      }
    } catch {
      toast.error('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTokens();
  }, []);

  // Filtered Tokens
  const filteredTokens = useMemo(() => {
    return tokens.filter((t) => {
      const matchesSearch =
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.keyPrefix.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.role.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'ALL' || t.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [tokens, searchQuery, filterStatus]);

  // Paginated Tokens
  const totalItems = filteredTokens.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const currentPage = Math.min(page, totalPages);
  const indexOfFirstItem = (currentPage - 1) * pageSize;
  const indexOfLastItem = Math.min(indexOfFirstItem + pageSize, totalItems);
  const paginatedTokens = useMemo(() => {
    return filteredTokens.slice(indexOfFirstItem, indexOfLastItem);
  }, [filteredTokens, indexOfFirstItem, indexOfLastItem]);

  // Handle Create Token
  const handleCreateToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error('กรุณากรอกชื่อระบบหรือวัตถุประสงค์');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/modules/api-docs/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName.trim(),
          role: formRole,
          expiresInDays: formExpiresInDays,
          scopes: ['*'],
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'สร้าง API Token ล้มเหลว');
      }

      setNewlyCreatedToken({
        apiKey: json.data.apiKey,
        plainToken: json.data.token,
      });

      setShowCreateModal(false);
      setShowSuccessModal(true);
      setFormName('');
      setFormRole('ADMIN');
      setFormExpiresInDays(90);

      toast.success('สร้าง API Token สำเร็จ');
      fetchTokens();
    } catch (err: any) {
      toast.error(err.message || 'เกิดข้อผิดพลาดในการสร้าง Token');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Suspend/Activate Token
  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    const actionLabel = newStatus === 'ACTIVE' ? 'เปิดใช้งาน' : 'ระงับการใช้งานชั่วคราว';

    if (!confirm(`คุณต้องการ ${actionLabel} Token นี้ใช่หรือไม่?`)) return;

    try {
      const res = await fetch(`/api/modules/api-docs/tokens/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || 'อัปเดตสถานะไม่สำเร็จ');
      }

      toast.success(`${actionLabel}เรียบร้อยแล้ว`);
      fetchTokens();
    } catch (err: any) {
      toast.error(err.message || 'เกิดข้อผิดพลาด');
    }
  };

  // Handle Revoke/Delete Token
  const handleRevokeToken = async (id: string, name: string) => {
    if (!confirm(`คุณแน่ใจว่าต้องการเพิกถอนและลบ Token สำหรับ "${name}" ใช่หรือไม่?\nการกระทำนี้ไม่สามารถย้อนกลับได้ และระบบภายนอกจะไม่สามารถใช้งาน Token นี้ได้อีกต่อไป`)) {
      return;
    }

    try {
      const res = await fetch(`/api/modules/api-docs/tokens/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || 'ลบไม่สำเร็จ');
      }

      toast.success('เพิกถอนและลบ API Token เรียบร้อยแล้ว');
      fetchTokens();
    } catch (err: any) {
      toast.error(err.message || 'เกิดข้อผิดพลาดในการลบ Token');
    }
  };

  const activeCount = tokens.filter((t) => t.status === 'ACTIVE').length;
  const suspendedCount = tokens.filter((t) => t.status === 'SUSPENDED').length;
  const expiredCount = tokens.filter((t) => t.status === 'EXPIRED').length;

  return (
    <div className="space-y-6 pb-12 font-prompt animate-fade-in">
      {/* Sub-menu Navigation & Actions in Theme Header */}
      <PageHeaderExtra>
        <div className="flex flex-wrap items-center gap-2">
          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100/90 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
            <Link
              href="/modules/api-docs"
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50 border border-transparent transition-colors flex items-center gap-1.5"
            >
              <i className="fa-solid fa-book text-[11px]" />
              <span>เอกสาร API (API Docs)</span>
            </Link>
            <Link
              href="/modules/api-docs/tokens"
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-900 text-primary-600 dark:text-primary-400 shadow-xs flex items-center gap-1.5 border border-slate-200/80 dark:border-slate-700"
            >
              <i className="fa-solid fa-key text-[11px]" />
              <span>จัดการ API Tokens</span>
            </Link>
          </div>

          {/* Actions */}
          <Button
            variant="secondary"
            size="sm"
            icon="fa-solid fa-rotate"
            isLoading={isLoading}
            onClick={fetchTokens}
            title="รีเฟรชข้อมูล"
          >
            รีเฟรช
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon="fa-solid fa-plus"
            onClick={() => setShowCreateModal(true)}
          >
            สร้าง API Token ใหม่
          </Button>
        </div>
      </PageHeaderExtra>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card padding="sm">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>Tokens ทั้งหมด</span>
            <i className="fa-solid fa-key text-primary-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{tokens.length}</div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">คีย์ที่ลงทะเบียนในระบบ</div>
        </Card>

        <Card padding="sm">
          <div className="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <span>พร้อมใช้งาน (Active)</span>
            <i className="fa-solid fa-shield-halved text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">{activeCount}</div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">สามารถเรียกใช้งาน API ได้</div>
        </Card>

        <Card padding="sm">
          <div className="flex items-center justify-between text-xs text-amber-600 dark:text-amber-400 font-medium">
            <span>ระงับชั่วคราว</span>
            <i className="fa-solid fa-power-off text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-600 dark:text-amber-400">{suspendedCount}</div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">ปิดการทำงานชั่วคราว</div>
        </Card>

        <Card padding="sm">
          <div className="flex items-center justify-between text-xs text-rose-600 dark:text-rose-400 font-medium">
            <span>หมดอายุ (Expired)</span>
            <i className="fa-solid fa-clock text-rose-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-rose-600 dark:text-rose-400">{expiredCount}</div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">ครบกำหนดเวลาการใช้งาน</div>
        </Card>
      </div>

      {/* Usage Quick Guide Banner */}
      <Card padding="sm" className="bg-primary-50/60 dark:bg-primary-950/20 border-primary-200/60 dark:border-primary-900/40">
        <div className="flex items-start gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 shrink-0 mt-0.5 text-xs">
            <i className="fa-solid fa-circle-info" />
          </span>
          <div className="space-y-1.5 flex-1 text-xs">
            <h4 className="font-semibold text-primary-900 dark:text-primary-200 text-sm">
              วิธีส่ง API Token ในคำขอ (Authentication Header)
            </h4>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              นำ Token ที่ได้ ใส่ใน Header ได้ทั้ง 2 รูปแบบ:{' '}
              <code className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 text-primary-700 dark:text-primary-300 font-mono border border-primary-200 dark:border-primary-800">
                Authorization: Bearer ep_live_...
              </code>{' '}
              หรือ{' '}
              <code className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 text-primary-700 dark:text-primary-300 font-mono border border-primary-200 dark:border-primary-800">
                x-api-key: ep_live_...
              </code>
            </p>
          </div>
        </div>
      </Card>

      {/* Filter & Search Bar */}
      <Card padding="sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="w-full md:w-80">
            <Input
              icon="fa-solid fa-magnifying-glass"
              placeholder="ค้นหาชื่อระบบ, Token Prefix, สิทธิ์..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0">สถานะ:</span>
            <div className="w-full md:w-48">
              <Select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setPage(1);
                }}
                options={[
                  { value: 'ALL', label: 'ทุกสถานะ' },
                  { value: 'ACTIVE', label: 'พร้อมใช้งาน (Active)' },
                  { value: 'SUSPENDED', label: 'ระงับชั่วคราว (Suspended)' },
                  { value: 'EXPIRED', label: 'หมดอายุ (Expired)' },
                ]}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* API Tokens Table */}
      <Card padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 uppercase font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3.5">ชื่อระบบ / วัตถุประสงค์</th>
                <th className="px-5 py-3.5">Token Prefix</th>
                <th className="px-5 py-3.5">สิทธิ์ (Role & Scopes)</th>
                <th className="px-5 py-3.5">วันที่สร้าง</th>
                <th className="px-5 py-3.5">ใช้งานล่าสุด</th>
                <th className="px-5 py-3.5">หมดอายุ</th>
                <th className="px-5 py-3.5">สถานะ</th>
                <th className="px-5 py-3.5 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-slate-400">
                    <i className="fa-solid fa-circle-notch fa-spin text-2xl mb-2 text-primary-500 block" />
                    กำลังโหลดข้อมูล API Tokens...
                  </td>
                </tr>
              ) : paginatedTokens.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-slate-400">
                    <i className="fa-solid fa-key text-3xl text-slate-300 dark:text-slate-600 mb-3 block" />
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300">ยังไม่มี API Token ในระบบ</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                      กดปุ่ม "สร้าง API Token ใหม่" ด้านบนเพื่อเริ่มเชื่อมต่อกับระบบภายนอก
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedTokens.map((token) => {
                  const isExpired = token.status === 'EXPIRED';
                  const isActive = token.status === 'ACTIVE';

                  return (
                    <tr key={token.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <i className="fa-solid fa-key text-primary-500 text-xs shrink-0" />
                          <span>{token.name}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                          ID: {token.id}
                        </div>
                      </td>

                      <td className="px-5 py-4 font-mono text-[11px] text-slate-800 dark:text-slate-200">
                        <span className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                          {token.keyPrefix}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex flex-wrap items-center gap-1">
                          <Badge variant="primary">Role: {token.role}</Badge>
                          {token.scopes?.map((sc, i) => (
                            <Badge key={i} variant="neutral">{sc}</Badge>
                          ))}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-[11px]">
                        {new Date(token.createdAt).toLocaleDateString('th-TH', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>

                      <td className="px-5 py-4 text-[11px]">
                        {token.lastUsedAt ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                            {new Date(token.lastUsedAt).toLocaleDateString('th-TH', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">ยังไม่เคยใช้งาน</span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-[11px]">
                        {token.expiresAt ? (
                          <span className={isExpired ? 'text-rose-600 dark:text-rose-400 font-medium' : 'text-slate-600 dark:text-slate-400'}>
                            {new Date(token.expiresAt).toLocaleDateString('th-TH', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        ) : (
                          <span className="text-slate-500 font-medium">ไม่มีวันหมดอายุ</span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        {isActive ? (
                          <Badge variant="success" dot>Active</Badge>
                        ) : isExpired ? (
                          <Badge variant="danger" dot>Expired</Badge>
                        ) : (
                          <Badge variant="warning" dot>Suspended</Badge>
                        )}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {!isExpired && (
                            <Button
                              variant="secondary"
                              size="xs"
                              icon="fa-solid fa-power-off"
                              onClick={() => handleToggleStatus(token.id, token.status)}
                              title={isActive ? 'พักการใช้งาน Token ชั่วคราว' : 'เปิดใช้งาน Token'}
                            />
                          )}
                          <Button
                            variant="danger"
                            size="xs"
                            icon="fa-solid fa-trash"
                            onClick={() => handleRevokeToken(token.id, token.name)}
                            title="เพิกถอนและลบ Token"
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredTokens.length > 0 && (
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            indexOfFirstItem={indexOfFirstItem}
            indexOfLastItem={indexOfLastItem}
            pageSize={pageSize}
            unitName="Token"
            setCurrentPage={setPage}
            setPageSize={setPageSize}
          />
        )}
      </Card>

      {/* Modal: Create Token */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="สร้าง API Token ใหม่"
        subtitle="ออก Personal / System API Token สำหรับเชื่อมต่อกับระบบภายนอก"
        icon="fa-solid fa-key"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              ยกเลิก
            </Button>
            <Button
              variant="primary"
              icon="fa-solid fa-plus"
              isLoading={isSubmitting}
              loadingText="กำลังสร้าง..."
              onClick={handleCreateToken}
            >
              สร้าง Token
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateToken} className="space-y-4">
          <Input
            label="ชื่อระบบ / วัตถุประสงค์ (System Name)"
            placeholder="เช่น External HR System, Mobile Client, Line Bot"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            required
            icon="fa-solid fa-server"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="สิทธิ์ระดับ Role"
              icon="fa-solid fa-user-shield"
              value={formRole}
              onChange={(e) => setFormRole(e.target.value)}
              options={[
                { value: 'ADMIN', label: 'ADMIN (จัดการข้อมูล)' },
                { value: 'SUPER_ADMIN', label: 'SUPER_ADMIN (สิทธิ์สูงสุด)' },
                { value: 'OFFICER', label: 'OFFICER (เจ้าหน้าที่)' },
                { value: 'EDITOR', label: 'EDITOR (ผู้แก้ไขข่าวสาร)' },
                { value: 'USER', label: 'USER (ผู้ใช้งานทั่วไป)' },
              ]}
            />

            <Select
              label="อายุการใช้งาน (Expiration)"
              icon="fa-solid fa-calendar-days"
              value={formExpiresInDays === null ? 'never' : String(formExpiresInDays)}
              onChange={(e) => {
                const val = e.target.value;
                setFormExpiresInDays(val === 'never' ? null : Number(val));
              }}
              options={[
                { value: '30', label: '30 วัน' },
                { value: '90', label: '90 วัน (แนะนำ)' },
                { value: '180', label: '180 วัน' },
                { value: '365', label: '1 ปี (365 วัน)' },
                { value: 'never', label: 'ไม่มีวันหมดอายุ (Never)' },
              ]}
            />
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
            <div className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <i className="fa-solid fa-shield-halved text-primary-500" />
              <span>ความปลอดภัย</span>
            </div>
            <p>
              ระบบจะสร้าง Token ในรูปแบบ <code className="text-primary-600 dark:text-primary-400 font-mono">ep_live_...</code> และเก็บรักษาด้วยการเข้ารหัส SHA-256 Hash
            </p>
          </div>
        </form>
      </Modal>

      {/* Modal: Token Created Success (Show Once) */}
      {showSuccessModal && newlyCreatedToken && (
        <Modal
          isOpen={showSuccessModal}
          onClose={() => {
            setShowSuccessModal(false);
            setNewlyCreatedToken(null);
          }}
          title="สร้าง API Token สำเร็จ!"
          subtitle={`Token สำหรับระบบ ${newlyCreatedToken.apiKey.name} พร้อมใช้งานแล้ว`}
          icon="fa-solid fa-circle-check"
          footer={
            <Button
              variant="primary"
              className="w-full"
              onClick={() => {
                setShowSuccessModal(false);
                setNewlyCreatedToken(null);
              }}
            >
              ฉันได้คัดลอกและบันทึก Token เรียบร้อยแล้ว
            </Button>
          }
        >
          <div className="space-y-4">
            {/* Warning Alert */}
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 flex items-start gap-2.5 text-amber-800 dark:text-amber-200 text-xs">
              <span className="text-base">⚠️</span>
              <p className="text-[11px] leading-relaxed">
                <strong>สำคัญ:</strong> กรุณาคัดลอก Token นี้และเก็บไว้ในที่ปลอดภัยทันที เนื่องจากระบบจะ<strong>แสดง Token นี้เพียงครั้งเดียวเท่านั้น</strong> และจะไม่สามารถเปิดดูซ้ำได้อีก
              </p>
            </div>

            {/* Plain Token Display Box */}
            <div className="space-y-1.5">
              <span className="font-semibold text-slate-700 dark:text-slate-300 text-xs">
                Personal API Token
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={newlyCreatedToken.plainToken}
                  className="form-input font-mono text-xs w-full bg-slate-50 dark:bg-slate-950 select-all font-semibold text-primary-700 dark:text-primary-300"
                />
                <Button
                  variant="primary"
                  icon={copiedToken ? 'fa-solid fa-check' : 'fa-regular fa-copy'}
                  onClick={() => {
                    navigator.clipboard.writeText(newlyCreatedToken.plainToken);
                    setCopiedToken(true);
                    toast.success('คัดลอก Token แล้ว');
                    setTimeout(() => setCopiedToken(false), 2000);
                  }}
                >
                  {copiedToken ? 'คัดลอกแล้ว' : 'คัดลอก'}
                </Button>
              </div>
            </div>

            {/* Ready-to-use cURL Example */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700 dark:text-slate-300 text-xs flex items-center gap-1.5">
                  <i className="fa-solid fa-terminal text-primary-500" />
                  <span>ตัวอย่างคำขอ cURL Header</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const snippet = `curl -X GET "${typeof window !== 'undefined' ? window.location.origin : ''}/api/personnel" \\\n  -H "Authorization: Bearer ${newlyCreatedToken.plainToken}" \\\n  -H "Content-Type: application/json"`;
                    navigator.clipboard.writeText(snippet);
                    setCopiedSnippet(true);
                    toast.success('คัดลอกคำสั่ง cURL แล้ว');
                    setTimeout(() => setCopiedSnippet(false), 2000);
                  }}
                  className="text-[11px] text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <i className={copiedSnippet ? 'fa-solid fa-check' : 'fa-regular fa-copy'} />
                  <span>{copiedSnippet ? 'คัดลอกแล้ว' : 'คัดลอก cURL'}</span>
                </button>
              </div>
              <pre className="p-3 rounded-xl bg-slate-950 text-slate-200 font-mono text-[11px] overflow-x-auto border border-slate-800">
{`curl -X GET "/api/personnel" \\
  -H "Authorization: Bearer ${newlyCreatedToken.plainToken}" \\
  -H "Content-Type: application/json"`}
              </pre>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
