import React, { useState, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useLogout, useCreateStaff } from '../features/auth/hooks/useAuth';
import { useUsersQuery, useToggleUserStatus, useDeleteUser, useChangeUserPassword, useUpdateUserSchedule } from '../features/users/hooks/useUsers';
import { useSearchPatientsQuery, useCreatePatient } from '../features/patients/hooks/usePatients';
import { useAppointmentsQuery, useCreateAppointment, useUpdateAppointment } from '../features/appointments/hooks/useAppointments';
import { userApi } from '../features/users/services/userApi';
import { 
  Activity, 
  LogOut, 
  Users, 
  Calendar, 
  Clock, 
  FileText, 
  CheckCircle2, 
  ShieldCheck, 
  Server, 
  Database,
  PlusCircle,
  Search,
  UserPlus,
  Edit,
  Clipboard,
  CalendarDays,
  UserCheck,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Loader2,
  Key
} from 'lucide-react';

export default function Dashboard({ user }) {
  const logoutMutation = useLogout();
  const createStaffMutation = useCreateStaff();
  const queryClient = useQueryClient();

  // Pagination State for Super Admin Staff Registry
  const [limit, setLimit] = useState(5);
  const [offset, setOffset] = useState(0);

  // Toast notifications state
  const [toasts, setToasts] = useState([]);
  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Local filter states for Super Admin directory (Separate Name and Email search)
  const [searchNameVal, setSearchNameVal] = useState('');
  const [searchEmailVal, setSearchEmailVal] = useState('');
  const [roleVal, setRoleVal] = useState('All');
  const [statusVal, setStatusVal] = useState('All');

  // Applied filter states passed into the React Query hook
  const [appliedSearchName, setAppliedSearchName] = useState('');
  const [appliedSearchEmail, setAppliedSearchEmail] = useState('');
  const [appliedRole, setAppliedRole] = useState('All');
  const [appliedStatus, setAppliedStatus] = useState('All');

  // React Query: Fetch paginated users from server with applied filters
  const { data: usersResponse, isLoading: isUsersLoading, isError: isUsersError } = useUsersQuery({ 
    limit, 
    offset,
    role: appliedRole,
    isActive: appliedStatus,
    name: appliedSearchName,
    email: appliedSearchEmail
  });
  const toggleStatusMutation = useToggleUserStatus();
  const deleteUserMutation = useDeleteUser();
  const changePasswordMutation = useChangeUserPassword();

  // Password reset inline states
  const [activePasswordEditId, setActivePasswordEditId] = useState(null);
  const [newPasswordVal, setNewPasswordVal] = useState('');

  // Email auto-fill suggestion states
  const [emailSuggestion, setEmailSuggestion] = useState('');

  // Create Staff Modal Visibility State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Search autocomplete / suggestion states (Name & Email)
  const [nameSuggestions, setNameSuggestions] = useState([]);
  const [showNameSuggestions, setShowNameSuggestions] = useState(false);
  const [emailSuggestions, setEmailSuggestions] = useState([]);
  const [showEmailSuggestions, setShowEmailSuggestions] = useState(false);

  const nameSearchTimeoutRef = useRef(null);
  const emailSearchTimeoutRef = useRef(null);

  // Click outside to dismiss search suggestions dropdowns
  useEffect(() => {
    const handleClickOutside = () => {
      setShowNameSuggestions(false);
      setShowEmailSuggestions(false);
      setShowPatientSuggestions(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Cleanup autocomplete search timeouts on unmount
  useEffect(() => {
    return () => {
      if (nameSearchTimeoutRef.current) {
        clearTimeout(nameSearchTimeoutRef.current);
      }
      if (emailSearchTimeoutRef.current) {
        clearTimeout(emailSearchTimeoutRef.current);
      }
    };
  }, []);

  // Role-specific initial tabs
  const getInitialTab = () => {
    if (user.role === 'Super Admin') return 'overview';
    if (user.role === 'Receptionist') return 'overview';
    return 'overview';
  };
  const [activeTab, setActiveTab] = useState(getInitialTab());

  // Database mock state (represents backend entities for RBAC actions)
  const [doctors, setDoctors] = useState([
    { id: 1, name: 'Dr. Gregory House', email: 'house@emr.com', department: 'Diagnostic Medicine', schedule: 'Mon - Wed, 09:00 AM - 05:00 PM' },
    { id: 2, name: 'Dr. Allison Cameron', email: 'cameron@emr.com', department: 'Immunology', schedule: 'Thu - Fri, 08:00 AM - 04:00 PM' },
  ]);

  const [receptionists, setReceptionists] = useState([
    { id: 3, name: 'Jane Doe', email: 'jane@emr.com' }
  ]);

  const [patients, setPatients] = useState([
    { id: 101, name: 'John Doe', age: 42, history: 'Hypertension, Type 2 Diabetes', contact: '+1-555-0199' },
    { id: 102, name: 'Mary Jane', age: 29, history: 'Mild Asthma', contact: '+1-555-0144' },
    { id: 103, name: 'Robert Smith', age: 65, history: 'Coronary Artery Disease', contact: '+1-555-0188' },
  ]);

  const [appointments, setAppointments] = useState([
    { id: 201, patientName: 'John Doe', age: 42, reason: 'Hypertension Check', status: 'Checked In', room: '101', doctorId: 1, time: '09:00 AM', date: '2026-07-12', notes: 'Blood pressure is 140/90. Suggested low sodium diet.' },
    { id: 202, patientName: 'Mary Jane', age: 29, reason: 'Asthma Follow-up', status: 'Waiting', room: 'Lounge', doctorId: 1, time: '10:30 AM', date: '2026-07-12', notes: 'Albuterol inhaler usage monitored.' },
    { id: 203, patientName: 'Robert Smith', age: 65, reason: 'Blood Work Review', status: 'Scheduled', room: 'None', doctorId: 2, time: '11:30 AM', date: '2026-07-12', notes: '' },
  ]);

  // Form states
  // Super Admin: Create Staff
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [staffRole, setStaffRole] = useState('Doctor');
  const [staffDepartment, setStaffDepartment] = useState('Diagnostic Medicine');
  const [staffMessage, setStaffMessage] = useState({ text: '', type: '' });

  // Super Admin: Edit Doctor Schedules (Rich Schedule Settings)
  const updateScheduleMutation = useUpdateUserSchedule();
  const [selectedDocId, setSelectedDocId] = useState('');
  const [workingDays, setWorkingDays] = useState(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
  const [slotDuration, setSlotDuration] = useState(15);
  const [sessions, setSessions] = useState([
    { name: 'Morning Session', startTime: '09:00', endTime: '12:00' },
    { name: 'Evening Session', startTime: '13:00', endTime: '17:00' }
  ]);
  const [breaks, setBreaks] = useState([
    { name: 'Lunch Break', startTime: '12:00', endTime: '13:00' }
  ]);

  // Query database doctors dynamically to support calendar setups
  const { data: dbDoctorsResponse } = useUsersQuery({ limit: 100, role: 'Doctor' });
  const dbDoctors = dbDoctorsResponse?.data?.users || [];

  // Receptionist Booking Scheduler States
  const createAppointmentMutation = useCreateAppointment();
  const updateAppointmentMutation = useUpdateAppointment();

  const [patientType, setPatientType] = useState('Existing'); // 'Existing' or 'New'
  const [selectedPatientObj, setSelectedPatientObj] = useState(null);
  const [bookPatientSearch, setBookPatientSearch] = useState('');
  const [showPatientSuggestions, setShowPatientSuggestions] = useState(false);

  // New Patient Form States
  const [newPatName, setNewPatName] = useState('');
  const [newPatMobile, setNewPatMobile] = useState('');
  const [newPatAge, setNewPatAge] = useState('');
  const [newPatHistory, setNewPatHistory] = useState('');

  // Booking details
  const [bookDocId, setBookDocId] = useState('');
  const [bookTime, setBookTime] = useState('');
  const [bookDate, setBookDate] = useState(new Date().toLocaleDateString('sv'));
  const [bookPurpose, setBookPurpose] = useState('');
  const [bookNotes, setBookNotes] = useState('');

  // Autocomplete patient search queries
  const { data: patientSearchResponse } = useSearchPatientsQuery(bookPatientSearch);
  const patientSuggestions = patientSearchResponse?.data || [];

  // Pagination & Filters States for Appointments Registry
  const [apptLimit, setApptLimit] = useState(5);
  const [apptOffset, setApptOffset] = useState(0);

  // Registry search filter inputs (local state)
  const [filterDoc, setFilterDoc] = useState('');
  const [filterPat, setFilterPat] = useState('');
  const [filterMob, setFilterMob] = useState('');
  const [filterDept, setFilterDept] = useState('All');
  const [filterApptStatus, setFilterApptStatus] = useState('All');
  const [filterStart, setFilterStart] = useState('');
  const [filterEnd, setFilterEnd] = useState('');

  // Applied registry search filters passed into the query
  const [appliedDoc, setAppliedDoc] = useState('');
  const [appliedPat, setAppliedPat] = useState('');
  const [appliedMob, setAppliedMob] = useState('');
  const [appliedDept, setAppliedDept] = useState('All');
  const [appliedApptStatus, setAppliedApptStatus] = useState('All');
  const [appliedStart, setAppliedStart] = useState('');
  const [appliedEnd, setAppliedEnd] = useState('');

  // Fetch appointments registry dynamically from server with applied filters
  const { data: registryResponse, isLoading: isRegistryLoading, isError: isRegistryError } = useAppointmentsQuery({
    limit: apptLimit,
    offset: apptOffset,
    doctorSearch: appliedDoc,
    patientSearch: appliedPat,
    mobileSearch: appliedMob,
    department: appliedDept,
    status: appliedApptStatus,
    startDate: appliedStart,
    endDate: appliedEnd
  });

  // Query booked slots for the selected doctor on the selected date to display scheduler grid
  const selectedDoctorObjForBooking = dbDoctors.find(d => d._id === bookDocId);
  const { data: dayAppointmentsResponse } = useAppointmentsQuery({
    doctorSearch: selectedDoctorObjForBooking?.name,
    startDate: bookDate,
    endDate: bookDate,
    limit: 100 // load all slots booked today
  });
  const bookedSlotsList = dayAppointmentsResponse?.data?.appointments?.map(a => a.timeSlot) || [];

  // Inline editing state for appointments registry
  const [editingApptId, setEditingApptId] = useState(null);
  const [editingPurpose, setEditingPurpose] = useState('');
  const [editingNotes, setEditingNotes] = useState('');

  // Doctor: Select Patient & Edit Consultation Notes
  const [selectedApptId, setSelectedApptId] = useState('');
  const [consultNotes, setConsultNotes] = useState('');
  const [notesMessage, setNotesMessage] = useState('');

  // Find current logged in Doctor ID for filtering
  const currentDocId = user.email.includes('doctor') ? 1 : user.email.includes('cameron') ? 2 : 1;

  // Actions handlers
  const handleToggleStatus = (id, currentStatus) => {
    toggleStatusMutation.mutate({ id, isActive: currentStatus }, {
      onSuccess: () => {
        addToast('Staff status updated successfully!', 'success');
      },
      onError: (err) => {
        addToast(err.response?.data?.message || 'Failed to update status', 'error');
      }
    });
  };

  const handleDeleteUser = (id) => {
    if (window.confirm('Are you sure you want to delete this staff account?')) {
      deleteUserMutation.mutate(id, {
        onSuccess: () => {
          addToast('Staff account removed successfully', 'success');
        },
        onError: (err) => {
          addToast(err.response?.data?.message || 'Failed to delete user', 'error');
        }
      });
    }
  };

  const handleSavePassword = (id) => {
    if (newPasswordVal.length < 6) {
      addToast('Password must be at least 6 characters long', 'error');
      return;
    }
    changePasswordMutation.mutate({ id, password: newPasswordVal }, {
      onSuccess: () => {
        addToast('Password updated successfully!', 'success');
        setActivePasswordEditId(null);
        setNewPasswordVal('');
      },
      onError: (err) => {
        addToast(err.response?.data?.message || 'Failed to update password', 'error');
      }
    });
  };

  const handleApplyFilters = () => {
    setAppliedSearchName(searchNameVal);
    setAppliedSearchEmail(searchEmailVal);
    setAppliedRole(roleVal);
    setAppliedStatus(statusVal);
    setOffset(0); // Reset page to 1
  };

  const handleResetFilters = () => {
    setSearchNameVal('');
    setSearchEmailVal('');
    setRoleVal('All');
    setStatusVal('All');
    setAppliedSearchName('');
    setAppliedSearchEmail('');
    setAppliedRole('All');
    setAppliedStatus('All');
    setOffset(0);
  };

  const handleNameSearchChange = (e) => {
    const val = e.target.value;
    setSearchNameVal(val);

    if (nameSearchTimeoutRef.current) {
      clearTimeout(nameSearchTimeoutRef.current);
    }

    if (val.trim() === '') {
      setNameSuggestions([]);
      setShowNameSuggestions(false);
      return;
    }

    // Set up debounced API fetch for name suggestions
    nameSearchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await userApi.getUsers({ name: val, limit: 3 });
        if (res.success && res.data.users) {
          setNameSuggestions(res.data.users);
          setShowNameSuggestions(true);
        }
      } catch (err) {
        console.error('Error fetching name suggestions:', err);
      }
    }, 300); // 300ms debounce
  };

  const handleEmailSearchChange = (e) => {
    const val = e.target.value;
    setSearchEmailVal(val);

    if (emailSearchTimeoutRef.current) {
      clearTimeout(emailSearchTimeoutRef.current);
    }

    if (val.trim() === '') {
      setEmailSuggestions([]);
      setShowEmailSuggestions(false);
      return;
    }

    // Set up debounced API fetch for email suggestions
    emailSearchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await userApi.getUsers({ email: val, limit: 3 });
        if (res.success && res.data.users) {
          setEmailSuggestions(res.data.users);
          setShowEmailSuggestions(true);
        }
      } catch (err) {
        console.error('Error fetching email suggestions:', err);
      }
    }, 300); // 300ms debounce
  };

  const handleNameChange = (e) => {
    const nameVal = e.target.value;
    setStaffName(nameVal);

    // Generate suggested email based on staff name
    const parts = nameVal.toLowerCase().trim().split(/\s+/);
    let suggestion = '';
    if (parts.length > 0 && parts[0] !== '') {
      // Remove title prefixes like 'dr', 'dr.', 'mr', etc. for clean emails
      const cleanParts = parts.filter(p => p !== 'dr' && p !== 'dr.' && p !== 'mr' && p !== 'mrs' && p !== 'ms');
      if (cleanParts.length > 0) {
        suggestion = cleanParts.join('.') + '@emr.com';
      }
    }
    setEmailSuggestion(suggestion);

    // Auto-fill the email input if it's currently empty, OR matches a previous suggestion
    const previousParts = staffName.toLowerCase().trim().split(/\s+/);
    const cleanPrevParts = previousParts.filter(p => p !== 'dr' && p !== 'dr.' && p !== 'mr' && p !== 'mrs' && p !== 'ms');
    const previousSuggestion = cleanPrevParts.length > 0 ? cleanPrevParts.join('.') + '@emr.com' : '';

    if (suggestion && (!staffEmail || staffEmail === previousSuggestion)) {
      setStaffEmail(suggestion);
    }
  };

  const handleCreateStaff = (e) => {
    e.preventDefault();

    if (!staffName || !staffEmail || !staffPassword) {
      addToast('Please fill in all staff fields', 'error');
      return;
    }

    createStaffMutation.mutate(
      { name: staffName, email: staffEmail, password: staffPassword, role: staffRole },
      {
        onSuccess: (res) => {
          addToast(`Account created successfully for ${staffName} (${staffRole})`, 'success');
          
          // Invalidate users list query cache so it automatically refetches!
          queryClient.invalidateQueries({ queryKey: ['users'] });

          if (staffRole === 'Doctor') {
            setDoctors([
              ...doctors,
              { id: doctors.length + 5, name: staffName, email: staffEmail, department: staffDepartment, schedule: 'Not Assigned' }
            ]);
          } else {
            setReceptionists([
              ...receptionists,
              { id: receptionists.length + 5, name: staffName, email: staffEmail }
            ]);
          }

          // reset inputs
          setStaffName('');
          setStaffEmail('');
          setStaffPassword('');
          setEmailSuggestion('');
          setIsCreateModalOpen(false); // Close popup modal on success
        },
        onError: (err) => {
          const msg = err.response?.data?.message || 'Error creating staff. Email may already exist.';
          addToast(msg, 'error');
        }
      }
    );
  };

  const handleDoctorSelectChange = (docId) => {
    setSelectedDocId(docId);
    const doc = dbDoctors.find(d => d._id === docId);
    if (doc && doc.schedule) {
      setWorkingDays(doc.schedule.workingDays || []);
      setSlotDuration(doc.schedule.slotDuration || 15);
      setSessions(doc.schedule.sessions || []);
      setBreaks(doc.schedule.breaks || []);
    } else {
      // Set default values
      setWorkingDays(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
      setSlotDuration(15);
      setSessions([
        { name: 'Morning Session', startTime: '09:00', endTime: '12:00' },
        { name: 'Evening Session', startTime: '13:00', endTime: '17:00' }
      ]);
      setBreaks([
        { name: 'Lunch Break', startTime: '12:00', endTime: '13:00' }
      ]);
    }
  };

  const handleWorkingDayToggle = (day) => {
    setWorkingDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleSessionFieldChange = (index, field, value) => {
    setSessions(prev => prev.map((s, idx) => idx === index ? { ...s, [field]: value } : s));
  };

  const addSession = () => {
    setSessions(prev => [...prev, { name: 'New Session', startTime: '09:00', endTime: '17:00' }]);
  };

  const removeSession = (index) => {
    setSessions(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleBreakFieldChange = (index, field, value) => {
    setBreaks(prev => prev.map((b, idx) => idx === index ? { ...b, [field]: value } : b));
  };

  const addBreak = () => {
    setBreaks(prev => [...prev, { name: 'New Break', startTime: '12:00', endTime: '13:00' }]);
  };

  const removeBreak = (index) => {
    setBreaks(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleUpdateSchedule = (e) => {
    e.preventDefault();
    if (!selectedDocId) {
      addToast('Please select a doctor', 'error');
      return;
    }

    updateScheduleMutation.mutate({
      id: selectedDocId,
      scheduleData: { workingDays, slotDuration, sessions, breaks }
    }, {
      onSuccess: () => {
        addToast('Doctor schedule updated successfully!', 'success');
      },
      onError: (err) => {
        addToast(err.response?.data?.message || 'Failed to update schedule', 'error');
      }
    });
  };

  // Helper to generate dynamic slot options while omitting breaks and past time slots
  const generateSlotsForDoctor = (doctor) => {
    if (!doctor || !doctor.schedule) {
      return ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '01:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'];
    }

    const { sessions, breaks, slotDuration } = doctor.schedule;
    const slots = [];

    const todayStr = new Date().toLocaleDateString('sv');
    const isToday = bookDate === todayStr;
    const now = new Date();
    const currentMin = now.getHours() * 60 + now.getMinutes();

    const toMinutes = (timeStr) => {
      if (!timeStr) return 0;
      const [h, m] = timeStr.split(':').map(Number);
      return h * 60 + m;
    };

    const formatTime = (totalMin) => {
      let hrs = Math.floor(totalMin / 60);
      const mins = totalMin % 60;
      const ampm = hrs >= 12 ? 'PM' : 'AM';
      hrs = hrs % 12;
      hrs = hrs ? hrs : 12;
      const formattedHrs = hrs < 10 ? `0${hrs}` : hrs;
      const formattedMins = mins < 10 ? `0${mins}` : mins;
      return `${formattedHrs}:${formattedMins} ${ampm}`;
    };

    const parsedBreaks = (breaks || []).map(b => ({
      start: toMinutes(b.startTime),
      end: toMinutes(b.endTime)
    }));

    (sessions || []).forEach(sess => {
      const sessionStart = toMinutes(sess.startTime);
      const sessionEnd = toMinutes(sess.endTime);

      for (let time = sessionStart; time + slotDuration <= sessionEnd; time += slotDuration) {
        // Skip past time slots if date is today
        if (isToday && time <= currentMin) {
          continue;
        }

        // Slot overlaps break if slot start is inside [brk.start, brk.end)
        // or if slot end is inside (brk.start, brk.end] or contains it
        const slotStart = time;
        const slotEnd = time + slotDuration;
        const inBreak = parsedBreaks.some(brk => {
          return (slotStart >= brk.start && slotStart < brk.end) || 
                 (slotEnd > brk.start && slotEnd <= brk.end) ||
                 (slotStart <= brk.start && slotEnd >= brk.end);
        });

        if (!inBreak) {
          slots.push(formatTime(time));
        }
      }
    });

    return slots.length > 0 ? slots : ['No slots available'];
  };

  const handleSelectPatient = (patient) => {
    setSelectedPatientObj(patient);
    setBookPatientSearch(patient.name);
    setShowPatientSuggestions(false);
  };

  const handleBookAppointment = (e) => {
    e.preventDefault();

    if (!bookDocId) {
      addToast('Please select a doctor', 'error');
      return;
    }
    if (!bookTime) {
      addToast('Please select an available time slot', 'error');
      return;
    }
    if (!bookPurpose) {
      addToast('Please provide a reason for the visit', 'error');
      return;
    }

    const payload = {
      doctorId: bookDocId,
      date: bookDate,
      timeSlot: bookTime,
      purpose: bookPurpose,
      notes: bookNotes
    };

    if (patientType === 'Existing') {
      if (!selectedPatientObj) {
        addToast('Please select an existing patient from suggestions', 'error');
        return;
      }
      payload.patientId = selectedPatientObj.patientId;
    } else {
      if (!newPatName || !newPatMobile || !newPatAge) {
        addToast('Please fill in new patient name, contact, and age', 'error');
        return;
      }
      payload.patientData = {
        name: newPatName,
        mobileNumber: newPatMobile,
        age: parseInt(newPatAge, 10),
        history: newPatHistory
      };
    }

    createAppointmentMutation.mutate(payload, {
      onSuccess: () => {
        addToast('Appointment booked successfully!', 'success');
        // Reset form
        setBookPurpose('');
        setBookNotes('');
        setBookTime('');
        if (patientType === 'New') {
          setNewPatName('');
          setNewPatMobile('');
          setNewPatAge('');
          setNewPatHistory('');
        } else {
          setBookPatientSearch('');
          setSelectedPatientObj(null);
        }
      },
      onError: (err) => {
        addToast(err.response?.data?.message || 'Failed to book appointment', 'error');
      }
    });
  };

  const handleUpdateStatus = (apptId, newStatus) => {
    updateAppointmentMutation.mutate({
      id: apptId,
      updateData: { status: newStatus }
    }, {
      onSuccess: () => {
        addToast(`Appointment status updated to ${newStatus}`, 'success');
      },
      onError: (err) => {
        addToast(err.response?.data?.message || 'Failed to update status', 'error');
      }
    });
  };

  const handleSaveInlineEdit = (apptId) => {
    updateAppointmentMutation.mutate({
      id: apptId,
      updateData: { purpose: editingPurpose, notes: editingNotes }
    }, {
      onSuccess: () => {
        addToast('Appointment details saved', 'success');
        setEditingApptId(null);
      },
      onError: (err) => {
        addToast(err.response?.data?.message || 'Failed to update appointment details', 'error');
      }
    });
  };

  const handleApplyApptFilters = () => {
    setAppliedDoc(filterDoc);
    setAppliedPat(filterPat);
    setAppliedMob(filterMob);
    setAppliedDept(filterDept);
    setAppliedApptStatus(filterApptStatus);
    setAppliedStart(filterStart);
    setAppliedEnd(filterEnd);
    setApptOffset(0);
  };

  const handleResetApptFilters = () => {
    setFilterDoc('');
    setFilterPat('');
    setFilterMob('');
    setFilterDept('All');
    setFilterApptStatus('All');
    setFilterStart('');
    setFilterEnd('');
    setAppliedDoc('');
    setAppliedPat('');
    setAppliedMob('');
    setAppliedDept('All');
    setAppliedApptStatus('All');
    setAppliedStart('');
    setAppliedEnd('');
    setApptOffset(0);
  };

  const handleUpdateNotes = (e) => {
    e.preventDefault();
    setAppointments(appointments.map(appt => 
      appt.id === selectedApptId ? { ...appt, notes: consultNotes } : appt
    ));
    setNotesMessage('Consultation notes updated successfully!');
    setTimeout(() => setNotesMessage(''), 3000);
  };

  // Render sub-components based on Tab selection
  const renderSuperAdminTab = () => {
    if (activeTab === 'overview') {
      return (
        <>
          <div className="dashboard-grid">
            <div className="glass-card stats-card">
              <div className="stats-info">
                <h3>Total Staff</h3>
                <div className="value">{usersResponse?.data?.totalCount || 0}</div>
              </div>
              <div className="stats-icon">
                <Users size={24} />
              </div>
            </div>
            <div className="glass-card stats-card">
              <div className="stats-info">
                <h3>All Appointments</h3>
                <div className="value">{appointments.length}</div>
              </div>
              <div className="stats-icon" style={{ color: 'var(--primary)' }}>
                <Calendar size={24} />
              </div>
            </div>
            <div className="glass-card stats-card">
              <div className="stats-info">
                <h3>Server Load</h3>
                <div className="value">3.8%</div>
              </div>
              <div className="stats-icon" style={{ color: 'var(--success)' }}>
                <Server size={24} />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
            <div className="glass-card">
              <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={20} style={{ color: 'var(--primary)' }} />
                Administrative Access: All Dashboards
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                As a Super Admin, you have unified authorization. You can bypass authorization scopes to view clinical queues, modify active registers, and monitor real-time databases.
              </p>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button onClick={() => setActiveTab('staff')} className="btn btn-primary">Manage Staff</button>
                <button onClick={() => setActiveTab('appointments')} className="btn btn-secondary">Review Appointments</button>
              </div>
            </div>

            <div className="glass-card">
              <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Database size={20} style={{ color: 'var(--primary)' }} />
                Database Monitor
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', borderBottom: '1px solid var(--border-light)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Mongoose Models</span>
                  <span>User, RefreshToken, Patient, Appointment</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', borderBottom: '1px solid var(--border-light)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Super Admin Seeder</span>
                  <span style={{ color: 'var(--success)' }}>Active (Seed on startup)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>API Request Latency</span>
                  <span>34ms (Standard)</span>
                </div>
              </div>
            </div>
          </div>
        </>
      );
    }

    if (activeTab === 'staff') {
      return (
        <div style={{ width: '100%' }}>

          {/* Active Staff List (Dynamic Server Registry with Pagination) */}
          <div className="glass-card" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users size={20} style={{ color: 'var(--primary)' }} />
                Active Staff Directory
              </h2>
              <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="btn btn-primary"
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <UserPlus size={16} />
                Create Staff Account
              </button>
            </div>

            {/* Manual Filter Controls (Separate Name and Email Search) */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', alignItems: 'flex-end' }}>
              
              {/* Search Name Input with debounced suggestions */}
              <div style={{ flex: '1', minWidth: '180px', position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Search Name</label>
                <div className="input-wrapper" onClick={(e) => e.stopPropagation()}>
                  <span className="input-icon" style={{ left: '0.75rem' }}>
                    <Search size={14} />
                  </span>
                  <input 
                    type="text" 
                    className="form-input" 
                    style={{ padding: '0.35rem 0.75rem 0.35rem 2rem', fontSize: '0.85rem' }} 
                    placeholder="Name..." 
                    value={searchNameVal}
                    onChange={handleNameSearchChange}
                  />
                </div>
                {showNameSuggestions && nameSuggestions.length > 0 && (
                  <ul 
                    style={{ 
                      position: 'absolute', 
                      top: '100%', 
                      left: 0, 
                      width: '100%', 
                      backgroundColor: '#111827', 
                      border: '1px solid var(--border-medium)', 
                      borderRadius: 'var(--radius-md)', 
                      zIndex: 50, 
                      maxHeight: '130px', 
                      overflowY: 'auto',
                      listStyle: 'none',
                      margin: '0.25rem 0 0 0',
                      padding: '0.15rem 0',
                      boxShadow: 'var(--shadow-lg)'
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {nameSuggestions.map(s => (
                      <li 
                        key={s._id}
                        onClick={() => {
                          setSearchNameVal(s.name);
                          setAppliedSearchName(s.name);
                          setOffset(0);
                          setShowNameSuggestions(false);
                        }}
                        style={{ 
                          padding: '0.35rem 0.65rem', 
                          cursor: 'pointer', 
                          borderBottom: '1px solid rgba(255,255,255,0.02)',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <span style={{ fontWeight: 600, fontSize: '0.775rem', color: 'var(--text-main)' }}>{s.name} <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>({s.role})</span></span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Search Email Input with debounced suggestions */}
              <div style={{ flex: '1', minWidth: '180px', position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Search Email</label>
                <div className="input-wrapper" onClick={(e) => e.stopPropagation()}>
                  <span className="input-icon" style={{ left: '0.75rem' }}>
                    <Search size={14} />
                  </span>
                  <input 
                    type="text" 
                    className="form-input" 
                    style={{ padding: '0.35rem 0.75rem 0.35rem 2rem', fontSize: '0.85rem' }} 
                    placeholder="Email..." 
                    value={searchEmailVal}
                    onChange={handleEmailSearchChange}
                  />
                </div>
                {showEmailSuggestions && emailSuggestions.length > 0 && (
                  <ul 
                    style={{ 
                      position: 'absolute', 
                      top: '100%', 
                      left: 0, 
                      width: '100%', 
                      backgroundColor: '#111827', 
                      border: '1px solid var(--border-medium)', 
                      borderRadius: 'var(--radius-md)', 
                      zIndex: 50, 
                      maxHeight: '130px', 
                      overflowY: 'auto',
                      listStyle: 'none',
                      margin: '0.25rem 0 0 0',
                      padding: '0.15rem 0',
                      boxShadow: 'var(--shadow-lg)'
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {emailSuggestions.map(s => (
                      <li 
                        key={s._id}
                        onClick={() => {
                          setSearchEmailVal(s.email);
                          setAppliedSearchEmail(s.email);
                          setOffset(0);
                          setShowEmailSuggestions(false);
                        }}
                        style={{ 
                          padding: '0.35rem 0.65rem', 
                          cursor: 'pointer', 
                          borderBottom: '1px solid rgba(255,255,255,0.02)',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <span style={{ fontWeight: 600, fontSize: '0.775rem', color: 'var(--text-main)' }}>{s.email} <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>({s.role})</span></span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div style={{ width: '130px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Role</label>
                <select 
                  className="form-input" 
                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}
                  value={roleVal}
                  onChange={(e) => setRoleVal(e.target.value)}
                >
                  <option value="All">All Roles</option>
                  <option value="Super Admin">Super Admin</option>
                  <option value="Doctor">Doctor</option>
                  <option value="Receptionist">Receptionist</option>
                </select>
              </div>

              <div style={{ width: '110px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Status</label>
                <select 
                  className="form-input" 
                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}
                  value={statusVal}
                  onChange={(e) => setStatusVal(e.target.value)}
                >
                  <option value="All">All Statuses</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={handleApplyFilters} className="btn btn-primary" style={{ padding: '0.45rem 1rem', fontSize: '0.85rem', height: '36px' }}>
                  Filter
                </button>
                <button onClick={handleResetFilters} className="btn btn-secondary" style={{ padding: '0.45rem 1rem', fontSize: '0.85rem', height: '36px', border: 'none' }}>
                  Reset
                </button>
              </div>
            </div>

            {isUsersLoading ? (
              <div className="loading-container" style={{ padding: '2rem' }}>
                <Loader2 className="loading-spinner" size={24} style={{ animation: 'spin 1s linear infinite' }} />
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Loading registry...</p>
              </div>
            ) : isUsersError ? (
              <div className="badge-error" style={{ padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                Failed to load staff list. Please verify server connectivity.
              </div>
            ) : (
              <>
                <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-medium)', color: 'var(--text-secondary)' }}>
                        <th style={{ padding: '0.5rem' }}>Name & Email</th>
                        <th style={{ padding: '0.5rem' }}>Role</th>
                        <th style={{ padding: '0.5rem' }}>Status</th>
                        <th style={{ padding: '0.5rem', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersResponse.data?.users.map((u) => (
                        <tr key={u._id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                          <td style={{ padding: '0.65rem 0.5rem' }}>
                            <div style={{ fontWeight: 600 }}>{u.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</div>

                            {/* Password Reset Section */}
                            {activePasswordEditId === u._id && (
                              <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                                <input
                                  type="password"
                                  className="form-input"
                                  style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', width: '130px', height: '28px' }}
                                  placeholder="New password"
                                  value={newPasswordVal}
                                  onChange={(e) => setNewPasswordVal(e.target.value)}
                                  autoFocus
                                />
                                <button 
                                  onClick={() => handleSavePassword(u._id)}
                                  disabled={changePasswordMutation.isPending}
                                  className="btn btn-primary"
                                  style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', height: '28px' }}
                                >
                                  Save
                                </button>
                                <button 
                                  onClick={() => { setActivePasswordEditId(null); setNewPasswordVal(''); }}
                                  className="btn btn-secondary"
                                  style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', height: '28px', border: 'none' }}
                                >
                                  Cancel
                                </button>
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '0.65rem 0.5rem' }}>
                            <span className={`badge ${u.role === 'Super Admin' ? 'badge-error' : u.role === 'Doctor' ? 'badge-success' : 'badge-warning'}`}>
                              {u.role}
                            </span>
                          </td>
                          <td style={{ padding: '0.65rem 0.5rem' }}>
                            <button
                              onClick={() => handleToggleStatus(u._id, !u.isActive)}
                              disabled={u._id === user.id || toggleStatusMutation.isPending}
                              className="btn btn-secondary"
                              style={{ 
                                padding: '0.2rem 0.4rem', 
                                fontSize: '0.75rem', 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '0.25rem',
                                border: 'none',
                                background: 'transparent',
                                cursor: u._id === user.id ? 'not-allowed' : 'pointer'
                              }}
                              title={u._id === user.id ? "Cannot deactivate yourself" : `Click to ${u.isActive ? 'Deactivate' : 'Activate'}`}
                            >
                              {u.isActive ? (
                                <>
                                  <ToggleRight size={20} style={{ color: 'var(--success)' }} />
                                  <span style={{ color: 'var(--success)' }}>Active</span>
                                </>
                              ) : (
                                <>
                                  <ToggleLeft size={20} style={{ color: 'var(--text-muted)' }} />
                                  <span style={{ color: 'var(--text-muted)' }}>Inactive</span>
                                </>
                              )}
                            </button>
                          </td>
                          <td style={{ padding: '0.65rem 0.5rem', textAlign: 'right' }}>
                            <button
                              onClick={() => {
                                if (activePasswordEditId === u._id) {
                                  setActivePasswordEditId(null);
                                  setNewPasswordVal('');
                                } else {
                                  setActivePasswordEditId(u._id);
                                  setNewPasswordVal('');
                                }
                              }}
                              className="btn btn-secondary"
                              style={{ 
                                padding: '0.3rem', 
                                marginRight: '0.25rem',
                                border: '1px solid rgba(245, 158, 11, 0.2)'
                              }}
                              title="Change Password"
                            >
                              <Key size={14} style={{ color: 'var(--warning)' }} />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u._id)}
                              disabled={u._id === user.id || deleteUserMutation.isPending}
                              className="btn btn-secondary"
                              style={{ 
                                padding: '0.3rem', 
                                border: '1px solid rgba(244, 63, 94, 0.2)',
                                cursor: u._id === user.id ? 'not-allowed' : 'pointer',
                                opacity: u._id === user.id ? 0.3 : 1
                              }}
                              title={u._id === user.id ? "Cannot delete yourself" : "Delete Account"}
                            >
                              <Trash2 size={14} style={{ color: 'var(--error)' }} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {usersResponse.data?.users.length === 0 && (
                        <tr>
                          <td colSpan={4} style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
                            No users registered.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Switcher */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  {/* Page Size Select */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Show:</span>
                    <select
                      className="form-input"
                      style={{ width: '70px', padding: '0.2rem 0.4rem', fontSize: '0.8rem' }}
                      value={limit}
                      onChange={(e) => {
                        setLimit(parseInt(e.target.value, 10));
                        setOffset(0); // Reset to page 1
                      }}
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                    </select>
                  </div>

                  {/* Info text */}
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Showing {usersResponse.data?.totalCount === 0 ? 0 : offset + 1} to {Math.min(usersResponse.data?.totalCount || 0, offset + limit)} of {usersResponse.data?.totalCount || 0} entries
                  </div>

                  {/* Nav actions */}
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                      disabled={offset === 0}
                      onClick={() => setOffset(prev => Math.max(0, prev - limit))}
                    >
                      Previous
                    </button>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                      disabled={offset + limit >= (usersResponse.data?.totalCount || 0)}
                      onClick={() => setOffset(prev => prev + limit)}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      );
    }

    if (activeTab === 'schedules') {
      return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
          {/* Edit Schedule Form */}
          <div className="glass-card">
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Edit size={20} style={{ color: 'var(--primary)' }} />
              Configure Doctor Schedule
            </h2>
            <form onSubmit={handleUpdateSchedule}>
              <div className="form-group">
                <label>Select Clinical Doctor</label>
                <select className="form-input" style={{ paddingLeft: '1rem' }} value={selectedDocId} onChange={(e) => handleDoctorSelectChange(e.target.value)} required>
                  <option value="">-- Choose Doctor --</option>
                  {dbDoctors.map(doc => (
                    <option key={doc._id} value={doc._id}>{doc.name}</option>
                  ))}
                </select>
              </div>

              {selectedDocId && (
                <>
                  {/* Working Days */}
                  <div className="form-group">
                    <label>Working Days</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.5rem', marginTop: '0.5rem' }}>
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                        <label key={day} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                          <input 
                            type="checkbox" 
                            checked={workingDays.includes(day)} 
                            onChange={() => handleWorkingDayToggle(day)} 
                          />
                          {day}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Slot Duration */}
                  <div className="form-group">
                    <label>Slot Duration (Minutes)</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      style={{ paddingLeft: '1rem' }} 
                      value={slotDuration} 
                      onChange={(e) => setSlotDuration(parseInt(e.target.value) || 15)} 
                      min="5" 
                      max="120"
                      required
                    />
                  </div>

                  {/* Sessions */}
                  <div className="form-group">
                    <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Working Sessions</span>
                      <button 
                        type="button" 
                        onClick={addSession} 
                        className="btn btn-secondary" 
                        style={{ padding: '0.15rem 0.4rem', fontSize: '0.7rem', border: 'none' }}
                      >
                        + Add Session
                      </button>
                    </label>
                    <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {sessions.map((sess, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                          <input 
                            type="text" 
                            className="form-input" 
                            style={{ flex: 1.2, paddingLeft: '0.5rem', fontSize: '0.8rem', height: '32px' }} 
                            placeholder="Session Name (e.g. Morning)" 
                            value={sess.name} 
                            onChange={(e) => handleSessionFieldChange(idx, 'name', e.target.value)}
                            required
                          />
                          <input 
                            type="time" 
                            className="form-input" 
                            style={{ flex: 0.9, paddingLeft: '0.5rem', fontSize: '0.8rem', height: '32px' }} 
                            value={sess.startTime} 
                            onChange={(e) => handleSessionFieldChange(idx, 'startTime', e.target.value)}
                            required
                          />
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>to</span>
                          <input 
                            type="time" 
                            className="form-input" 
                            style={{ flex: 0.9, paddingLeft: '0.5rem', fontSize: '0.8rem', height: '32px' }} 
                            value={sess.endTime} 
                            onChange={(e) => handleSessionFieldChange(idx, 'endTime', e.target.value)}
                            required
                          />
                          <button 
                            type="button" 
                            onClick={() => removeSession(idx)} 
                            style={{ border: 'none', background: 'transparent', color: 'var(--error)', cursor: 'pointer', fontSize: '1.25rem', padding: '0.25rem' }}
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Breaks */}
                  <div className="form-group">
                    <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Break Timings</span>
                      <button 
                        type="button" 
                        onClick={addBreak} 
                        className="btn btn-secondary" 
                        style={{ padding: '0.15rem 0.4rem', fontSize: '0.7rem', border: 'none' }}
                      >
                        + Add Break
                      </button>
                    </label>
                    <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {breaks.map((brk, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                          <input 
                            type="text" 
                            className="form-input" 
                            style={{ flex: 1.2, paddingLeft: '0.5rem', fontSize: '0.8rem', height: '32px' }} 
                            placeholder="Break Name (e.g. Lunch)" 
                            value={brk.name} 
                            onChange={(e) => handleBreakFieldChange(idx, 'name', e.target.value)}
                            required
                          />
                          <input 
                            type="time" 
                            className="form-input" 
                            style={{ flex: 0.9, paddingLeft: '0.5rem', fontSize: '0.8rem', height: '32px' }} 
                            value={brk.startTime} 
                            onChange={(e) => handleBreakFieldChange(idx, 'startTime', e.target.value)}
                            required
                          />
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>to</span>
                          <input 
                            type="time" 
                            className="form-input" 
                            style={{ flex: 0.9, paddingLeft: '0.5rem', fontSize: '0.8rem', height: '32px' }} 
                            value={brk.endTime} 
                            onChange={(e) => handleBreakFieldChange(idx, 'endTime', e.target.value)}
                            required
                          />
                          <button 
                            type="button" 
                            onClick={() => removeBreak(idx)} 
                            style={{ border: 'none', background: 'transparent', color: 'var(--error)', cursor: 'pointer', fontSize: '1.25rem', padding: '0.25rem' }}
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-primary btn-block" 
                    disabled={updateScheduleMutation.isPending} 
                    style={{ marginTop: '1.5rem' }}
                  >
                    {updateScheduleMutation.isPending ? 'Saving Schedule...' : 'Save Schedule Settings'}
                  </button>
                </>
              )}
            </form>
          </div>

          {/* Current Schedules Display */}
          <div className="glass-card">
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CalendarDays size={20} style={{ color: 'var(--primary)' }} />
              Active Doctor Shifts
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {dbDoctors.map(doc => (
                <div key={doc._id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}>
                  <h4 style={{ fontWeight: 600, color: 'var(--primary)' }}>{doc.name}</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.2rem' }}>Email: {doc.email}</p>
                  
                  {doc.schedule ? (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <div>
                        <strong>Working Days:</strong> {doc.schedule.workingDays?.join(', ') || 'None'}
                      </div>
                      <div>
                        <strong>Slot Duration:</strong> {doc.schedule.slotDuration} minutes
                      </div>
                      {doc.schedule.sessions?.length > 0 && (
                        <div>
                          <strong>Sessions:</strong>
                          <ul style={{ margin: '0.25rem 0 0 1rem', paddingLeft: 0, listStyle: 'circle' }}>
                            {doc.schedule.sessions.map((s, i) => (
                              <li key={i}>{s.name}: {s.startTime} - {s.endTime}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {doc.schedule.breaks?.length > 0 && (
                        <div>
                          <strong>Breaks:</strong>
                          <ul style={{ margin: '0.25rem 0 0 1rem', paddingLeft: 0, listStyle: 'circle', color: 'var(--warning)' }}>
                            {doc.schedule.breaks.map((b, i) => (
                              <li key={i}>{b.name}: {b.startTime} - {b.endTime}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>No schedule configured</p>
                  )}
                </div>
              ))}
              {dbDoctors.length === 0 && (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>No clinical doctors registered.</p>
              )}
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === 'appointments') {
      return (
        <div className="glass-card">
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={20} style={{ color: 'var(--primary)' }} />
            View All Clinic Appointments
          </h2>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-medium)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '0.75rem' }}>Patient Name</th>
                  <th style={{ padding: '0.75rem' }}>Reason</th>
                  <th style={{ padding: '0.75rem' }}>Assigned Doctor</th>
                  <th style={{ padding: '0.75rem' }}>Time</th>
                  <th style={{ padding: '0.75rem' }}>Status</th>
                  <th style={{ padding: '0.75rem' }}>Location/Room</th>
                </tr>
              </thead>
              <tbody>
                 {appointments.map(appt => {
                  const doc = dbDoctors.find(d => d._id === appt.doctorId) || doctors.find(d => d.id === appt.doctorId);
                  return (
                    <tr key={appt.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '0.75rem', fontWeight: 600 }}>{appt.patientName} (Age {appt.age})</td>
                      <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>{appt.reason}</td>
                      <td style={{ padding: '0.75rem' }}>{doc ? doc.name : 'Unknown'}</td>
                      <td style={{ padding: '0.75rem' }}>{appt.time}</td>
                      <td style={{ padding: '0.75rem' }}>
                        <span className={`badge ${
                          appt.status === 'Checked In' ? 'badge-success' :
                          appt.status === 'Waiting' ? 'badge-warning' : 'badge-primary'
                        }`} style={{ background: appt.status === 'Scheduled' ? 'rgba(59,130,246,0.1)' : undefined, color: appt.status === 'Scheduled' ? 'var(--secondary)' : undefined }}>
                          {appt.status}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>{appt.room}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      );
    }
  };

  const renderReceptionistTab = () => {
    if (activeTab === 'overview') {
      return (
        <>
          <div className="dashboard-grid">
            <div className="glass-card stats-card">
              <div className="stats-info">
                <h3>Today's Registrations</h3>
                <div className="value">{appointments.length}</div>
              </div>
              <div className="stats-icon">
                <Calendar size={24} />
              </div>
            </div>
            <div className="glass-card stats-card">
              <div className="stats-info">
                <h3>Waiting in Lounge</h3>
                <div className="value">{appointments.filter(a => a.room === 'Lounge' || a.status === 'Waiting').length}</div>
              </div>
              <div className="stats-icon" style={{ color: 'var(--warning)' }}>
                <Clock size={24} />
              </div>
            </div>
            <div className="glass-card stats-card">
              <div className="stats-info">
                <h3>Checked In</h3>
                <div className="value">{appointments.filter(a => a.status === 'Checked In').length}</div>
              </div>
              <div className="stats-icon" style={{ color: 'var(--success)' }}>
                <CheckCircle2 size={24} />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
            <div className="glass-card">
              <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UserCheck size={20} style={{ color: 'var(--primary)' }} />
                Administrative Gate: Booking Operations
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                You have Receptionist permissions. You can register new patient arrivals, search patient records, update scheduled rooms, and mark patients as arrived for clinical consultation.
              </p>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button onClick={() => setActiveTab('patients')} className="btn btn-primary">Search Patients</button>
                <button onClick={() => setActiveTab('appointments_mgmt')} className="btn btn-secondary">Manage Appointments</button>
              </div>
            </div>
          </div>
        </>
      );
    }

    if (activeTab === 'patients') {
      const { data: receptionistPatientsSearchResponse } = useSearchPatientsQuery(searchQuery);
      const receptionistPatients = searchQuery.trim() ? (receptionistPatientsSearchResponse?.data || []) : [];

      return (
        <div className="glass-card" style={{ width: '100%' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Search size={20} style={{ color: 'var(--primary)' }} />
            Search Patients Database
          </h2>

          <div className="form-group" style={{ position: 'relative', maxWidth: '400px', marginBottom: '2rem' }}>
            <div className="input-wrapper">
              <span className="input-icon">
                <Search size={18} />
              </span>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Search patient ID, name, mobile..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-medium)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '0.75rem' }}>Patient ID</th>
                  <th style={{ padding: '0.75rem' }}>Patient Name</th>
                  <th style={{ padding: '0.75rem' }}>Age</th>
                  <th style={{ padding: '0.75rem' }}>Mobile Contact</th>
                  <th style={{ padding: '0.75rem' }}>Medical History Summary</th>
                </tr>
              </thead>
              <tbody>
                {receptionistPatients.map(p => (
                  <tr key={p._id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '0.75rem', fontWeight: 'bold', color: 'var(--primary)' }}>{p.patientId}</td>
                    <td style={{ padding: '0.75rem', fontWeight: 600 }}>{p.name}</td>
                    <td style={{ padding: '0.75rem' }}>{p.age}</td>
                    <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>{p.mobileNumber}</td>
                    <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>{p.history || 'No records'}</td>
                  </tr>
                ))}
                {receptionistPatients.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      {searchQuery.trim() ? 'No patients found matching query' : 'Type name, ID, or mobile number to search...'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    if (activeTab === 'appointments_mgmt') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}>
          {/* Top: Scheduler & Booking Panel */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '1.5rem', width: '100%' }}>
            
            {/* Appointment Booking Form */}
            <div className="glass-card">
              <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <PlusCircle size={20} style={{ color: 'var(--primary)' }} />
                Appointment Booking Gate
              </h2>

              {/* Patient Type Select Buttons */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', background: 'rgba(255,255,255,0.02)', padding: '0.25rem', borderRadius: 'var(--radius-sm)' }}>
                <button
                  type="button"
                  onClick={() => {
                    setPatientType('Existing');
                    setSelectedPatientObj(null);
                    setBookPatientSearch('');
                  }}
                  className={`btn ${patientType === 'Existing' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, padding: '0.4rem 0.5rem', fontSize: '0.8rem', border: 'none' }}
                >
                  Existing Patient
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPatientType('New');
                    setSelectedPatientObj(null);
                    setBookPatientSearch('');
                  }}
                  className={`btn ${patientType === 'New' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, padding: '0.4rem 0.5rem', fontSize: '0.8rem', border: 'none' }}
                >
                  New Patient
                </button>
              </div>

              <form onSubmit={handleBookAppointment}>
                
                {patientType === 'Existing' ? (
                  /* Existing Patient Selector */
                  <div className="form-group" style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
                    <label>Search Existing Patient (Name, Mobile, or ID)</label>
                    <div className="input-wrapper">
                      <span className="input-icon" style={{ left: '0.75rem' }}>
                        <Search size={14} />
                      </span>
                      <input
                        type="text"
                        className="form-input"
                        style={{ paddingLeft: '2rem' }}
                        placeholder="Type to search..."
                        value={bookPatientSearch}
                        onChange={(e) => {
                          setBookPatientSearch(e.target.value);
                          setShowPatientSuggestions(true);
                          if (selectedPatientObj) setSelectedPatientObj(null);
                        }}
                        required
                      />
                    </div>
                    {showPatientSuggestions && patientSuggestions.length > 0 && (
                      <ul
                        style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          width: '100%',
                          backgroundColor: '#111827',
                          border: '1px solid var(--border-medium)',
                          borderRadius: 'var(--radius-md)',
                          zIndex: 60,
                          maxHeight: '130px',
                          overflowY: 'auto',
                          listStyle: 'none',
                          margin: '0.25rem 0 0 0',
                          padding: '0.15rem 0',
                          boxShadow: 'var(--shadow-lg)'
                        }}
                      >
                        {patientSuggestions.map(p => (
                          <li
                            key={p._id}
                            onClick={() => handleSelectPatient(p)}
                            style={{
                              padding: '0.35rem 0.65rem',
                              cursor: 'pointer',
                              borderBottom: '1px solid rgba(255,255,255,0.02)',
                              fontSize: '0.775rem',
                              color: 'var(--text-main)'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            <strong>{p.name}</strong> ({p.mobileNumber}) - <span style={{ color: 'var(--primary)' }}>{p.patientId}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {selectedPatientObj && (
                      <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <CheckCircle2 size={12} />
                        Linked to: {selectedPatientObj.name} ({selectedPatientObj.patientId})
                      </div>
                    )}
                  </div>
                ) : (
                  /* New Patient Registration Card */
                  <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--primary)' }}>Register New Patient Record</h4>
                    <div className="form-group">
                      <label>Patient Full Name</label>
                      <input type="text" className="form-input" placeholder="Elizabeth Bennet" value={newPatName} onChange={(e) => setNewPatName(e.target.value)} required />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div className="form-group">
                        <label>Mobile Number</label>
                        <input type="text" className="form-input" placeholder="9876543210" value={newPatMobile} onChange={(e) => setNewPatMobile(e.target.value)} required />
                      </div>
                      <div className="form-group">
                        <label>Age</label>
                        <input type="number" className="form-input" placeholder="34" value={newPatAge} onChange={(e) => setNewPatAge(e.target.value)} required />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Medical History Summary (Optional)</label>
                      <input type="text" className="form-input" placeholder="Mild Asthma, Penicillin allergy..." value={newPatHistory} onChange={(e) => setNewPatHistory(e.target.value)} />
                    </div>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Consulting Doctor</label>
                    <select className="form-input" style={{ paddingLeft: '1rem' }} value={bookDocId} onChange={(e) => {
                      setBookDocId(e.target.value);
                      setBookTime('');
                    }} required>
                      <option value="">-- Choose Doctor --</option>
                      {dbDoctors.map(d => (
                        <option key={d._id} value={d._id}>{d.name} ({d.schedule?.department || 'General'})</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Appointment Date</label>
                    <input 
                      type="date" 
                      className="form-input" 
                      style={{ paddingLeft: '1rem' }} 
                      value={bookDate} 
                      onChange={(e) => {
                        setBookDate(e.target.value);
                        setBookTime('');
                      }} 
                      min={new Date().toLocaleDateString('sv')}
                      required 
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Reason for Visit (Purpose)</label>
                  <input type="text" className="form-input" style={{ paddingLeft: '1rem' }} placeholder="Chronic cough review" value={bookPurpose} onChange={(e) => setBookPurpose(e.target.value)} required />
                </div>

                <div className="form-group">
                  <label>Internal Consultation Notes (Optional)</label>
                  <textarea className="form-input" style={{ padding: '0.5rem 1rem', minHeight: '50px' }} placeholder="Notes for consulting clinical doctor..." value={bookNotes} onChange={(e) => setBookNotes(e.target.value)} />
                </div>

                <button type="submit" disabled={createAppointmentMutation.isPending} className="btn btn-primary btn-block" style={{ marginTop: '1rem' }}>
                  {createAppointmentMutation.isPending ? 'Booking Slot...' : 'Book Schedule Appointment'}
                </button>
              </form>
            </div>

            {/* Scheduler Available / Booked Grid Display */}
            <div className="glass-card">
              <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={20} style={{ color: 'var(--primary)' }} />
                Appointment Scheduler
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '1.25rem' }}>
                Select a doctor and date on the left to see slot availability. Slots are auto-generated based on shifts and exclude breaks and past timings.
              </p>

              {selectedDoctorObjForBooking ? (
                <div>
                  <div style={{ marginBottom: '1rem', padding: '0.75rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', fontSize: '0.8rem' }}>
                    <strong>Doctor Shift Profile:</strong> {selectedDoctorObjForBooking.name}
                    <div style={{ marginTop: '0.25rem', color: 'var(--text-secondary)' }}>
                      Slot Duration: {selectedDoctorObjForBooking.schedule?.slotDuration || 15} mins • 
                      Sessions: {selectedDoctorObjForBooking.schedule?.sessions?.map(s => `${s.startTime}-${s.endTime}`).join(', ') || 'None'}
                    </div>
                  </div>

                  <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
                    Shift Grid ({bookDate})
                  </label>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '0.5rem', marginTop: '0.5rem' }}>
                    {generateSlotsForDoctor(selectedDoctorObjForBooking).map((slot, i) => {
                      const isBooked = bookedSlotsList.includes(slot);
                      const isSelected = bookTime === slot;

                      if (slot === 'No slots available') {
                        return <div key={i} style={{ color: 'var(--text-muted)', fontSize: '0.8rem', gridColumn: '1 / -1' }}>No active slots available for today's shift.</div>;
                      }

                      return (
                        <button
                          key={i}
                          type="button"
                          disabled={isBooked}
                          onClick={() => setBookTime(slot)}
                          style={{
                            padding: '0.4rem 0.25rem',
                            fontSize: '0.75rem',
                            borderRadius: 'var(--radius-sm)',
                            border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-light)',
                            background: isBooked ? 'rgba(239, 68, 68, 0.1)' : isSelected ? 'var(--primary)' : 'rgba(255,255,255,0.02)',
                            color: isBooked ? 'var(--error)' : isSelected ? '#000' : 'var(--text-secondary)',
                            cursor: isBooked ? 'not-allowed' : 'pointer',
                            fontWeight: isSelected ? '600' : 'normal',
                            textAlign: 'center',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <div>{slot}</div>
                          <div style={{ fontSize: '0.6rem', opacity: 0.8, marginTop: '0.1rem' }}>
                            {isBooked ? 'Booked' : isSelected ? 'Selected' : 'Available'}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', color: 'var(--text-muted)', border: '1px dashed var(--border-light)', borderRadius: 'var(--radius-md)' }}>
                  <Calendar size={32} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                  <p style={{ fontSize: '0.85rem' }}>Choose doctor to inspect slot rotations</p>
                </div>
              )}
            </div>
          </div>

          {/* Bottom: Booked Appointments Advanced Directory */}
          <div className="glass-card" style={{ width: '100%', marginTop: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CalendarDays size={20} style={{ color: 'var(--primary)' }} />
              Manage Booked Appointments
            </h2>

            {/* Filter Search Dashboard */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Patient Search</label>
                <input type="text" className="form-input" style={{ fontSize: '0.8rem', padding: '0.35rem 0.5rem', height: '32px' }} placeholder="Name or Patient ID..." value={filterPat} onChange={(e) => setFilterPat(e.target.value)} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Doctor Search</label>
                <input type="text" className="form-input" style={{ fontSize: '0.8rem', padding: '0.35rem 0.5rem', height: '32px' }} placeholder="Doctor Name..." value={filterDoc} onChange={(e) => setFilterDoc(e.target.value)} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Mobile Search</label>
                <input type="text" className="form-input" style={{ fontSize: '0.8rem', padding: '0.35rem 0.5rem', height: '32px' }} placeholder="Patient Mobile..." value={filterMob} onChange={(e) => setFilterMob(e.target.value)} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Department</label>
                <select className="form-input" style={{ fontSize: '0.8rem', padding: '0.35rem 0.5rem', height: '32px' }} value={filterDept} onChange={(e) => setFilterDept(e.target.value)}>
                  <option value="All">All Departments</option>
                  <option value="Diagnostic Medicine">Diagnostic Medicine</option>
                  <option value="Immunology">Immunology</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="General Medicine">General Medicine</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Status</label>
                <select className="form-input" style={{ fontSize: '0.8rem', padding: '0.35rem 0.5rem', height: '32px' }} value={filterApptStatus} onChange={(e) => setFilterApptStatus(e.target.value)}>
                  <option value="All">All Statuses</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Arrived">Arrived</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Start Date</label>
                <input type="date" className="form-input" style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem', height: '32px' }} value={filterStart} onChange={(e) => setFilterStart(e.target.value)} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>End Date</label>
                <input type="date" className="form-input" style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem', height: '32px' }} value={filterEnd} onChange={(e) => setFilterEnd(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end', gridColumn: '1 / -1', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={handleResetApptFilters}>Reset</button>
                <button type="button" className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={handleApplyApptFilters}>Filter Appointments</button>
              </div>
            </div>

            {/* Registry List Table */}
            {isRegistryLoading ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading appointments registry...</p>
            ) : isRegistryError ? (
              <p style={{ color: 'var(--error)', fontSize: '0.85rem' }}>Failed to query appointments from database.</p>
            ) : (
              <div style={{ overflowX: 'auto', width: '100%' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-medium)', color: 'var(--text-secondary)' }}>
                      <th style={{ padding: '0.75rem' }}>Patient Details</th>
                      <th style={{ padding: '0.75rem' }}>Assigned Doctor</th>
                      <th style={{ padding: '0.75rem' }}>Schedule Slot</th>
                      <th style={{ padding: '0.75rem' }}>Purpose & Notes</th>
                      <th style={{ padding: '0.75rem' }}>Status</th>
                      <th style={{ padding: '0.75rem', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(registryResponse?.data?.appointments || []).map(appt => {
                      const isEditing = editingApptId === appt._id;
                      return (
                        <tr key={appt._id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                          <td style={{ padding: '0.75rem' }}>
                            <div style={{ fontWeight: 600 }}>{appt.patient?.name} (Age {appt.patient?.age})</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {appt.patient?.patientId}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mobile: {appt.patient?.mobileNumber}</div>
                          </td>
                          <td style={{ padding: '0.75rem' }}>
                            <div>{appt.doctor?.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Dept: {appt.department}</div>
                          </td>
                          <td style={{ padding: '0.75rem' }}>
                            <div style={{ fontWeight: 'bold' }}>{appt.timeSlot}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{appt.date}</div>
                          </td>
                          <td style={{ padding: '0.75rem' }}>
                            {isEditing ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                <input 
                                  type="text" 
                                  className="form-input" 
                                  style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', height: '28px' }} 
                                  value={editingPurpose} 
                                  onChange={(e) => setEditingPurpose(e.target.value)} 
                                  placeholder="Purpose"
                                />
                                <input 
                                  type="text" 
                                  className="form-input" 
                                  style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', height: '28px' }} 
                                  value={editingNotes} 
                                  onChange={(e) => setEditingNotes(e.target.value)} 
                                  placeholder="Notes"
                                />
                              </div>
                            ) : (
                              <div>
                                <div><strong>Purpose:</strong> {appt.purpose}</div>
                                {appt.notes && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}><strong>Notes:</strong> {appt.notes}</div>}
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '0.75rem' }}>
                            <span className={`badge ${
                              appt.status === 'Completed' ? 'badge-success' :
                              appt.status === 'Arrived' ? 'badge-warning' :
                              appt.status === 'Cancelled' ? 'badge-danger' : 'badge-primary'
                            }`} style={{ 
                              background: appt.status === 'Completed' ? 'rgba(16,185,129,0.1)' :
                                          appt.status === 'Arrived' ? 'rgba(245,158,11,0.1)' :
                                          appt.status === 'Cancelled' ? 'rgba(239,68,68,0.1)' : 'rgba(59,130,246,0.1)',
                              color: appt.status === 'Completed' ? 'var(--success)' :
                                     appt.status === 'Arrived' ? 'var(--warning)' :
                                     appt.status === 'Cancelled' ? 'var(--error)' : 'var(--secondary)'
                            }}>
                              {appt.status}
                            </span>
                          </td>
                          <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                              {isEditing ? (
                                <>
                                  <button onClick={() => handleSaveInlineEdit(appt._id)} className="btn btn-primary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }}>Save</button>
                                  <button onClick={() => setEditingApptId(null)} className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }}>Cancel</button>
                                </>
                              ) : (
                                <>
                                  {appt.status !== 'Completed' && appt.status !== 'Cancelled' && (
                                    <button 
                                      onClick={() => {
                                        setEditingApptId(appt._id);
                                        setEditingPurpose(appt.purpose);
                                        setEditingNotes(appt.notes || '');
                                      }} 
                                      className="btn btn-secondary" 
                                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }}
                                    >
                                      Edit Details
                                    </button>
                                  )}
                                  {appt.status === 'Scheduled' && (
                                    <button onClick={() => handleUpdateStatus(appt._id, 'Arrived')} className="btn btn-success" style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', background: 'rgba(16,185,129,0.1)', color: 'var(--success)', border: '1px solid rgba(16,185,129,0.2)' }}>
                                      Mark Arrived
                                    </button>
                                  )}
                                  {appt.status === 'Arrived' && (
                                    <button onClick={() => handleUpdateStatus(appt._id, 'Completed')} className="btn btn-success" style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', background: 'rgba(16,185,129,0.1)', color: 'var(--success)', border: '1px solid rgba(16,185,129,0.2)' }}>
                                      Mark Completed
                                    </button>
                                  )}
                                  {(appt.status === 'Scheduled' || appt.status === 'Arrived') && (
                                    <button onClick={() => handleUpdateStatus(appt._id, 'Cancelled')} className="btn btn-danger" style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', background: 'rgba(239,68,68,0.1)', color: 'var(--error)', border: '1px solid rgba(239,68,68,0.2)' }}>
                                      Cancel
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {(!registryResponse?.data?.appointments || registryResponse?.data?.appointments.length === 0) && (
                      <tr>
                        <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No booked appointments registered on database.</td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {/* Server-side Pagination Panel */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', borderTop: '1px solid var(--border-light)', paddingTop: '1rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Showing {apptOffset + 1} - {Math.min(apptOffset + apptLimit, registryResponse?.data?.totalCount || 0)} of {registryResponse?.data?.totalCount || 0} registry records
                  </span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      className="btn btn-secondary" 
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                      disabled={apptOffset === 0}
                      onClick={() => setApptOffset(prev => Math.max(0, prev - apptLimit))}
                    >
                      Previous
                    </button>
                    <button 
                      className="btn btn-secondary" 
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                      disabled={apptOffset + apptLimit >= (registryResponse?.data?.totalCount || 0)}
                      onClick={() => setApptOffset(prev => prev + apptLimit)}
                    >
                      Next
                    </button>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      );
    }
  };

  const renderDoctorTab = () => {
    // Query doctor queue appointments dynamically from database
    const { data: doctorQueueResponse } = useAppointmentsQuery({
      doctorSearch: user.role === 'Doctor' ? user.name : undefined,
      limit: 100
    });
    const myAppts = user.role === 'Doctor' ? (doctorQueueResponse?.data?.appointments || []) : [];
    const activeAppt = myAppts.find(a => a._id === selectedApptId);

    if (activeTab === 'overview') {
      return (
        <>
          <div className="dashboard-grid">
            <div className="glass-card stats-card">
              <div className="stats-info">
                <h3>My Schedule Queue</h3>
                <div className="value">{myAppts.length}</div>
              </div>
              <div className="stats-icon">
                <Calendar size={24} />
              </div>
            </div>
            <div className="glass-card stats-card">
              <div className="stats-info">
                <h3>Checked In (Waiting)</h3>
                <div className="value">{myAppts.filter(a => a.status === 'Arrived').length}</div>
              </div>
              <div className="stats-icon" style={{ color: 'var(--warning)' }}>
                <Clock size={24} />
              </div>
            </div>
            <div className="glass-card stats-card">
              <div className="stats-info">
                <h3>Completed Consults</h3>
                <div className="value">{myAppts.filter(a => a.status === 'Completed').length}</div>
              </div>
              <div className="stats-icon" style={{ color: 'var(--success)' }}>
                <CheckCircle2 size={24} />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
            <div className="glass-card">
              <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Activity size={20} style={{ color: 'var(--primary)' }} />
                Clinical Sandbox: HIPAA Scopes
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                You have Doctor credentials. Under HIPAA rules, you can only view patient information and appointment listings mapped specifically to your profile. You are authorized to update consultation files.
              </p>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button onClick={() => setActiveTab('my_appointments')} className="btn btn-primary">My Queue</button>
                <button onClick={() => setActiveTab('consultations')} className="btn btn-secondary">Update Notes</button>
              </div>
            </div>
          </div>
        </>
      );
    }

    if (activeTab === 'my_appointments') {
      return (
        <div className="glass-card" style={{ width: '100%' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={20} style={{ color: 'var(--primary)' }} />
            My Appointment Queue (Role Protected)
          </h2>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-medium)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '0.75rem' }}>Patient Name</th>
                  <th style={{ padding: '0.75rem' }}>Age</th>
                  <th style={{ padding: '0.75rem' }}>Reason (Purpose)</th>
                  <th style={{ padding: '0.75rem' }}>Time Slot</th>
                  <th style={{ padding: '0.75rem' }}>Status</th>
                  <th style={{ padding: '0.75rem' }}>Active Consult Notes</th>
                </tr>
              </thead>
              <tbody>
                {myAppts.map(appt => (
                  <tr key={appt._id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '0.75rem', fontWeight: 600 }}>{appt.patient?.name}</td>
                    <td style={{ padding: '0.75rem' }}>{appt.patient?.age}</td>
                    <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>{appt.purpose}</td>
                    <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>{appt.timeSlot} ({appt.date})</td>
                    <td style={{ padding: '0.75rem' }}>
                      <span className={`badge ${
                        appt.status === 'Completed' ? 'badge-success' :
                        appt.status === 'Arrived' ? 'badge-warning' : 'badge-primary'
                      }`} style={{
                        background: appt.status === 'Completed' ? 'rgba(16,185,129,0.1)' :
                                    appt.status === 'Arrived' ? 'rgba(245,158,11,0.1)' : 'rgba(59,130,246,0.1)',
                        color: appt.status === 'Completed' ? 'var(--success)' :
                               appt.status === 'Arrived' ? 'var(--warning)' : 'var(--secondary)'
                      }}>
                        {appt.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>
                      {appt.notes ? appt.notes.substring(0, 30) + '...' : 'No notes written'}
                    </td>
                  </tr>
                ))}
                {myAppts.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No patients in your queue today.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    if (activeTab === 'consultations') {
      return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem', width: '100%' }}>
          {/* Select & Update Consultation Notes */}
          <div className="glass-card">
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clipboard size={20} style={{ color: 'var(--primary)' }} />
              Write Consultation Notes
            </h2>

            {notesMessage && (
              <div className="badge-success" style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
                {notesMessage}
              </div>
            )}

            <form onSubmit={handleUpdateNotes}>
              <div className="form-group">
                <label>Select Active Patient Appt</label>
                <select className="form-input" style={{ paddingLeft: '1rem' }} value={selectedApptId} onChange={(e) => {
                  const val = e.target.value;
                  setSelectedApptId(val);
                  const appt = myAppts.find(a => a._id === val);
                  if (appt) setConsultNotes(appt.notes || '');
                }}>
                  <option value="">-- Select Patient --</option>
                  {myAppts.map(appt => (
                    <option key={appt._id} value={appt._id}>{appt.patient?.name} - {appt.purpose} ({appt.timeSlot})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Consultation & Diagnosis Notes</label>
                <textarea 
                  className="form-input" 
                  rows={6}
                  style={{ padding: '0.75rem 1rem', resize: 'vertical' }}
                  value={consultNotes}
                  onChange={(e) => setConsultNotes(e.target.value)}
                  placeholder="Record symptoms, diagnoses, recommendations..."
                  required
                />
              </div>

              <button type="submit" disabled={updateAppointmentMutation.isPending} className="btn btn-primary btn-block" style={{ marginTop: '1rem' }}>
                {updateAppointmentMutation.isPending ? 'Saving Notes...' : 'Save Consultation Notes'}
              </button>
            </form>
          </div>

          {/* View Patient Details (Doctor Permission) */}
          <div className="glass-card">
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={20} style={{ color: 'var(--primary)' }} />
              HIPAA Patient Record File
            </h2>

            {activeAppt ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>PATIENT</span>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{activeAppt.patient?.name}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Age: {activeAppt.patient?.age} • Contact: {activeAppt.patient?.mobileNumber}</p>
                  <p style={{ color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 'bold', marginTop: '0.2rem' }}>ID: {activeAppt.patient?.patientId}</p>
                </div>
                <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>CHIEF COMPLAINT</span>
                  <p style={{ fontSize: '0.9rem', fontWeight: 500 }}>{activeAppt.purpose}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>MEDICAL HISTORY</span>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    {activeAppt.patient?.history || 'No recorded clinical history.'}
                  </p>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', color: 'var(--text-muted)' }}>
                <FileText size={32} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                <p style={{ fontSize: '0.85rem' }}>Select an appointment in the form to view full patient files.</p>
              </div>
            )}
          </div>
        </div>
      );
    }
  };

  return (
    <div className="app-layout">
      {/* Sidebar Panel */}
      <aside className="sidebar">
        <div>
          <div className="sidebar-brand">
            <Activity size={26} />
            <span>EMR</span>
          </div>

          <ul className="nav-menu">
            <li>
              <button onClick={() => setActiveTab('overview')} className={`nav-link btn-block ${activeTab === 'overview' ? 'active' : ''}`}>
                <Activity size={18} />
                Overview
              </button>
            </li>

            {/* Super Admin specific menus */}
            {user.role === 'Super Admin' && (
              <>
                <li>
                  <button onClick={() => setActiveTab('staff')} className={`nav-link btn-block ${activeTab === 'staff' ? 'active' : ''}`}>
                    <UserPlus size={18} />
                    Staff Registry
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('schedules')} className={`nav-link btn-block ${activeTab === 'schedules' ? 'active' : ''}`}>
                    <Clock size={18} />
                    Doctor Schedules
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('appointments')} className={`nav-link btn-block ${activeTab === 'appointments' ? 'active' : ''}`}>
                    <Calendar size={18} />
                    All Appointments
                  </button>
                </li>
              </>
            )}

            {/* Receptionist specific menus */}
            {user.role === 'Receptionist' && (
              <>
                <li>
                  <button onClick={() => setActiveTab('patients')} className={`nav-link btn-block ${activeTab === 'patients' ? 'active' : ''}`}>
                    <Search size={18} />
                    Patient Registry
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('appointments_mgmt')} className={`nav-link btn-block ${activeTab === 'appointments_mgmt' ? 'active' : ''}`}>
                    <Calendar size={18} />
                    Book & Manage
                  </button>
                </li>
              </>
            )}

            {/* Doctor specific menus */}
            {user.role === 'Doctor' && (
              <>
                <li>
                  <button onClick={() => setActiveTab('my_appointments')} className={`nav-link btn-block ${activeTab === 'my_appointments' ? 'active' : ''}`}>
                    <Calendar size={18} />
                    My Appointments
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('consultations')} className={`nav-link btn-block ${activeTab === 'consultations' ? 'active' : ''}`}>
                    <Clipboard size={18} />
                    Consultations
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>

        {/* User profile section */}
        {user && (
          <div className="user-profile-badge">
            <div className="avatar">
              {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div className="user-info">
              <span className="user-name" title={user.name}>{user.name}</span>
              <span className="user-role">{user.role}</span>
            </div>
          </div>
        )}
      </aside>

      {/* Main Dashboard Panel */}
      <main className="main-content">
        <header className="top-bar">
          <div>
            <h1 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-title)' }}>
              {activeTab === 'overview' ? 'EMR Command Center' : activeTab.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Security Clearance: <span className="badge badge-success" style={{ marginLeft: '0.25rem' }}>{user.role}</span>
            </p>
          </div>

          <button
            onClick={() => logoutMutation.mutate()}
            className="btn btn-secondary"
            disabled={logoutMutation.isPending}
            style={{ padding: '0.5rem 1rem' }}
          >
            <LogOut size={16} />
            {logoutMutation.isPending ? 'Signing out...' : 'Sign Out'}
          </button>
        </header>

        {user.role === 'Super Admin' && renderSuperAdminTab()}
        {user.role === 'Receptionist' && renderReceptionistTab()}
        {user.role === 'Doctor' && renderDoctorTab()}
      </main>

      {/* Create Staff Modal Backdrop Overlay */}
      {isCreateModalOpen && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          width: '100vw', 
          height: '100vh', 
          backgroundColor: 'rgba(2, 6, 23, 0.75)', 
          backdropFilter: 'blur(4px)',
          zIndex: 5000, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div className="glass-card auth-card" style={{ maxWidth: '460px', margin: 0, padding: '2rem', animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UserPlus size={20} style={{ color: 'var(--primary)' }} />
                Create Staff Account
              </h2>
              <button 
                onClick={() => { setIsCreateModalOpen(false); setEmailSuggestion(''); }}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.5rem', padding: '0.25rem', lineHeight: '1' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateStaff}>
              <div className="form-group">
                <label>Staff Role</label>
                <select className="form-input" style={{ paddingLeft: '1rem' }} value={staffRole} onChange={(e) => setStaffRole(e.target.value)}>
                  <option value="Doctor">Doctor (Clinical Access)</option>
                  <option value="Receptionist">Receptionist (Administrative Access)</option>
                </select>
              </div>

              {staffRole === 'Doctor' && (
                <div className="form-group">
                  <label>Department</label>
                  <select className="form-input" style={{ paddingLeft: '1rem' }} value={staffDepartment} onChange={(e) => setStaffDepartment(e.target.value)}>
                    <option value="Diagnostic Medicine">Diagnostic Medicine</option>
                    <option value="Immunology">Immunology</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Pediatrics">Pediatrics</option>
                  </select>
                </div>
              )}

              <div className="form-group">
                <label>Full Name</label>
                <input type="text" className="form-input" style={{ paddingLeft: '1rem' }} placeholder="Dr. James Wilson" value={staffName} onChange={handleNameChange} required />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input type="email" className="form-input" style={{ paddingLeft: '1rem' }} placeholder="wilson@emr.com" value={staffEmail} onChange={(e) => setStaffEmail(e.target.value)} required />
                {emailSuggestion && staffEmail !== emailSuggestion && (
                  <span 
                    onClick={() => setStaffEmail(emailSuggestion)}
                    style={{ fontSize: '0.75rem', color: 'var(--primary)', cursor: 'pointer', display: 'block', marginTop: '0.25rem', textDecoration: 'underline' }}
                  >
                    Suggestion: {emailSuggestion} (click to apply)
                  </span>
                )}
              </div>

              <div className="form-group">
                <label>Security Password</label>
                <input type="password" className="form-input" style={{ paddingLeft: '1rem' }} placeholder="••••••••" value={staffPassword} onChange={(e) => setStaffPassword(e.target.value)} required />
              </div>

              <button type="submit" className="btn btn-primary btn-block" disabled={createStaffMutation.isPending} style={{ marginTop: '1.5rem' }}>
                {createStaffMutation.isPending ? 'Registering Staff...' : 'Create Account'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notifications Portal Container */}
      <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', zIndex: 9999 }}>
        {toasts.map((toast) => (
          <div 
            key={toast.id} 
            className={`glass-card ${toast.type === 'success' ? 'badge-success' : 'badge-error'}`}
            style={{ 
              padding: '0.75rem 1.25rem', 
              borderRadius: 'var(--radius-md)', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              fontSize: '0.875rem',
              boxShadow: 'var(--shadow-lg)',
              animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
