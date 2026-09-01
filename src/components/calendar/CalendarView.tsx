'use client';

import React, { useState, useEffect } from 'react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addDays,
  parseISO
} from 'date-fns';
import { th } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Info, Edit2, ChevronDown, ChevronUp } from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string;
  type: string;
  status: string;
  originalData?: any;
}

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Modal states
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // New event form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    type: 'operation',
    status: ''
  });
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [expandedEvents, setExpandedEvents] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      setCurrentUser(JSON.parse(userStr));
    }
  }, []);

  const fetchEvents = async (date: Date) => {
    setIsLoading(true);
    try {
      // Fetch events for the month (we'll fetch +/- 1 month to cover overflow days)
      const start = startOfWeek(startOfMonth(subMonths(date, 1)));
      const end = endOfWeek(endOfMonth(addMonths(date, 1)));
      
      const res = await fetch(`/api/calendar?start=${start.toISOString()}&end=${end.toISOString()}`);
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } catch (err) {
      console.error('Failed to fetch events', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents(currentDate);
  }, [currentDate]);

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, type: formData.type || 'operation' })
      });
      if (res.ok) {
        setIsAddModalOpen(false);
        setFormData({ title: '', description: '', startDate: '', endDate: '', type: 'operation', status: '' });
        fetchEvents(currentDate);
      }
    } catch (error) {
      console.error('Failed to add event', error);
    }
  };

  const handleEditEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEventId) return;
    
    try {
      const isLeave = editingEventId.startsWith('leave-');
      const url = isLeave 
        ? `/api/leaves/${editingEventId.replace('leave-', '')}` 
        : `/api/calendar/${editingEventId}`;
        
      const payload = isLeave 
        ? { startDate: formData.startDate, endDate: formData.endDate, reason: formData.description, status: formData.status }
        : { title: formData.title, description: formData.description, startDate: formData.startDate, endDate: formData.endDate, type: formData.type };

      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        setIsEditModalOpen(false);
        setEditingEventId(null);
        setFormData({ title: '', description: '', startDate: '', endDate: '', type: 'operation', status: '' });
        fetchEvents(currentDate);
      }
    } catch (error) {
      console.error('Failed to update event', error);
    }
  };

  const getEventsForDay = (day: Date) => {
    return events.filter(event => {
      const start = new Date(event.startDate);
      const end = new Date(event.endDate);
      // Strip times for comparison
      const dayStr = format(day, 'yyyy-MM-dd');
      const startStr = format(start, 'yyyy-MM-dd');
      const endStr = format(end, 'yyyy-MM-dd');
      return dayStr >= startStr && dayStr <= endStr;
    });
  };

  const getEventStyle = (type: string, status: string) => {
    if (type === 'leave') {
      if (status === 'อนุมัติแล้ว') return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800';
      if (status === 'รออนุมัติ') return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800';
      return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    }
    if (type === 'google') return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800';
    
    switch (type) {
      case 'operation': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
      case 'notification': return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800';
      case 'meeting': return 'bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-800';
      default: return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
    }
  };

  const renderHeader = () => {
    return (
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <button onClick={prevMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
          <h2 className="text-xl font-semibold text-slate-800 dark:text-white min-w-[200px] text-center">
            {format(currentDate, 'MMMM yyyy', { locale: th })}
          </h2>
          <button onClick={nextMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => {
              setCurrentDate(new Date());
            }}
            className="px-4 py-2 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            วันนี้
          </button>
          <button 
            onClick={() => {
              setFormData(prev => ({ ...prev, startDate: format(new Date(), 'yyyy-MM-dd'), endDate: format(new Date(), 'yyyy-MM-dd') }));
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors flex items-center gap-2 shadow-sm shadow-primary-600/20"
          >
            <Plus className="w-4 h-4" />
            เพิ่มกิจกรรม
          </button>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const days = [];
    const startDate = startOfWeek(currentDate);

    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={i} className="text-center font-medium text-sm text-slate-500 dark:text-slate-400 py-2">
          {format(addDays(startDate, i), 'EEEE', { locale: th })}
        </div>
      );
    }
    return <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-700">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const dateFormat = 'd';
    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = '';

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, dateFormat);
        const cloneDay = day;
        const dayEvents = getEventsForDay(day);

        days.push(
          <div
            key={day.toString()}
            className={`min-h-[120px] p-2 border-b border-r border-slate-200 dark:border-slate-700 transition-colors
              ${!isSameMonth(day, monthStart) ? 'bg-slate-50/50 dark:bg-slate-800/20' : 'bg-white dark:bg-slate-900'}
              hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer
            `}
            onClick={() => {
              setSelectedDate(cloneDay);
              setIsEventModalOpen(true);
            }}
          >
            <div className="flex justify-between items-start mb-2">
              <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full
                ${isSameDay(day, new Date()) 
                  ? 'bg-primary-600 text-white' 
                  : !isSameMonth(day, monthStart) 
                    ? 'text-slate-400 dark:text-slate-600' 
                    : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                {formattedDate}
              </span>
              
              {dayEvents.length > 0 && (
                <span className="text-[10px] bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 px-1.5 py-0.5 rounded-full font-medium">
                  {dayEvents.length}
                </span>
              )}
            </div>
            
            <div className="space-y-1 overflow-y-auto max-h-[80px] pr-1 scrollbar-hide">
              {dayEvents.slice(0, 3).map((event, idx) => (
                <div 
                  key={`${event.id}-${idx}`}
                  className={`text-xs px-1.5 py-1 rounded truncate border ${getEventStyle(event.type, event.status)}`}
                  title={event.title}
                >
                  {event.title}
                </div>
              ))}
              {dayEvents.length > 3 && (
                <div className="text-xs text-center text-slate-500 dark:text-slate-400 font-medium">
                  +{dayEvents.length - 3} เพิ่มเติม
                </div>
              )}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }

    return <div className="border-l border-t border-slate-200 dark:border-slate-700">{rows}</div>;
  };

  const renderEventModal = () => {
    if (!isEventModalOpen || !selectedDate) return null;
    const dayEvents = getEventsForDay(selectedDate);
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-primary-500" />
              กิจกรรมวันที่ {format(selectedDate, 'd MMMM yyyy', { locale: th })}
            </h3>
            <button 
              onClick={() => setIsEventModalOpen(false)}
              className="text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 p-2 rounded-full transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="p-4 overflow-y-auto">
            {dayEvents.length === 0 ? (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                ไม่มีกิจกรรมในวันนี้
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dayEvents.map(event => {
                  const canEdit = event.type !== 'google' && (currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPER_ADMIN' || (currentUser?.permissions && currentUser.permissions.includes('MANAGE_SYSTEM')) || (event.id.startsWith('leave-') && event.originalData?.personnelId === currentUser?.id));
                  const isExpanded = !!expandedEvents[event.id];
                  
                  return (
                  <div key={event.id} className={`p-4 rounded-xl border shadow-sm relative group transition-all duration-200 ${getEventStyle(event.type, event.status)}`}>
                    <div 
                      className="flex justify-between items-start cursor-pointer select-none"
                      onClick={() => setExpandedEvents(prev => ({...prev, [event.id]: !prev[event.id]}))}
                    >
                      <div className="font-semibold mb-1 pr-6 flex items-center gap-2">
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                        {event.title}
                      </div>
                      {canEdit && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingEventId(event.id);
                            setFormData({
                              title: event.title,
                              description: event.description || '',
                              startDate: format(new Date(event.startDate), 'yyyy-MM-dd'),
                              endDate: format(new Date(event.endDate), 'yyyy-MM-dd'),
                              type: event.type,
                              status: event.status
                            });
                            setIsEditModalOpen(true);
                          }}
                          className="absolute top-4 right-4 p-1.5 opacity-0 group-hover:opacity-100 bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    
                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-slate-200/50 dark:border-slate-700/50 animate-fade-in">
                        {event.description && <div className="text-sm opacity-80 mb-2">{event.description}</div>}
                        <div className="text-xs opacity-75 mt-2 flex flex-col gap-1.5">
                          <div className="flex items-center gap-1">
                            <Info className="w-3 h-3" />
                            {event.type === 'leave' ? `สถานะ: ${event.status}` : 
                             event.type === 'google' ? 'Google Calendar' :
                             `ประเภท: ${event.type === 'operation' ? 'การปฏิบัติงาน' : event.type === 'meeting' ? 'การประชุม' : event.type === 'notification' ? 'การแจ้งเตือน' : 'ทั่วไป'}`}
                          </div>
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="w-3 h-3" />
                            {format(new Date(event.startDate), 'd MMM yyyy', { locale: th })} 
                            {event.startDate !== event.endDate && ` - ${format(new Date(event.endDate), 'd MMM yyyy', { locale: th })}`}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )})}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
      {renderHeader()}
      
      {isLoading ? (
        <div className="h-[600px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
          {renderDays()}
          {renderCells()}
        </div>
      )}

      {renderEventModal()}

      {/* Add Event Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">เพิ่มกิจกรรมใหม่</h3>
            </div>
            
            <form onSubmit={handleAddEvent} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">หัวข้อกิจกรรม</label>
                <input
                  required
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-sm focus:border-primary-500 focus:outline-none"
                  placeholder="เช่น ประชุมประจำเดือน, วันหยุดพิเศษ"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">รายละเอียด (ไม่บังคับ)</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-sm focus:border-primary-500 focus:outline-none"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">วันที่เริ่ม</label>
                  <input
                    required
                    type="date"
                    value={formData.startDate}
                    onChange={e => setFormData({...formData, startDate: e.target.value})}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-sm focus:border-primary-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">วันที่สิ้นสุด</label>
                  <input
                    required
                    type="date"
                    value={formData.endDate}
                    onChange={e => setFormData({...formData, endDate: e.target.value})}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-sm focus:border-primary-500 focus:outline-none"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">ประเภท</label>
                <select
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value})}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-sm focus:border-primary-500 focus:outline-none"
                >
                  <option value="operation">การปฏิบัติงาน</option>
                  <option value="meeting">การประชุม</option>
                  <option value="notification">การแจ้งเตือน</option>
                  <option value="general">ทั่วไป</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white font-medium hover:bg-primary-700 rounded-lg transition-colors shadow-sm shadow-primary-600/20"
                >
                  บันทึกกิจกรรม
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">แก้ไขข้อมูล</h3>
            </div>
            
            <form onSubmit={handleEditEvent} className="p-4 space-y-4">
              {!editingEventId?.startsWith('leave-') && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">หัวข้อ</label>
                  <input
                    required
                    type="text"
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-sm focus:border-primary-500 focus:outline-none"
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">รายละเอียด / เหตุผล</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-sm focus:border-primary-500 focus:outline-none"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">วันที่เริ่ม</label>
                  <input
                    required
                    type="date"
                    value={formData.startDate}
                    onChange={e => setFormData({...formData, startDate: e.target.value})}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-sm focus:border-primary-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">วันที่สิ้นสุด</label>
                  <input
                    required
                    type="date"
                    value={formData.endDate}
                    onChange={e => setFormData({...formData, endDate: e.target.value})}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-sm focus:border-primary-500 focus:outline-none"
                  />
                </div>
              </div>
              
              {!editingEventId?.startsWith('leave-') ? (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">ประเภท</label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value})}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-sm focus:border-primary-500 focus:outline-none"
                  >
                    <option value="operation">การปฏิบัติงาน</option>
                    <option value="meeting">การประชุม</option>
                    <option value="notification">การแจ้งเตือน</option>
                    <option value="general">ทั่วไป</option>
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">สถานะ</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value})}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-sm focus:border-primary-500 focus:outline-none"
                  >
                    <option value="รออนุมัติ">รออนุมัติ</option>
                    <option value="อนุมัติแล้ว">อนุมัติแล้ว</option>
                    <option value="ไม่อนุมัติ">ไม่อนุมัติ</option>
                  </select>
                </div>
              )}

              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white font-medium hover:bg-primary-700 rounded-lg transition-colors shadow-sm shadow-primary-600/20"
                >
                  บันทึก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
