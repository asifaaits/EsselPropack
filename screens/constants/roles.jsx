// src/constants/roles.js
export const ROLES = {
  ADMIN: 'Admin',
  SAFETY_OFFICER: 'Safety Officer',
  SUPERVISOR: 'Supervisor',
  CONTRACTOR: 'Contractor',
  WORKER: 'Worker', // Fixed: Changed from 'worker' to 'Worker' for consistency
};

export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    'dashboard', 'ptw', 'incident', 'audit', 'capa', 'chemical', 
    'training', 'report', 'user-management', 'profile', 'settings',
    'calendar', 'support', 'view_all_ptw', 'edit_all_ptw', 
    'delete_all_ptw', 'approve_ptw', 'reject_ptw', 'close_ptw',
    'step_1', 'step_2', 'step_3', 'step_4', 'step_5', 'step_6', 
    'step_7', 'step_8', 'step_9', 'step_10',
  ],
  [ROLES.SAFETY_OFFICER]: [
    'dashboard', 'ptw', 'incident', 'audit', 'capa', 'chemical', 
    'training', 'report', 'profile', 'settings', 'calendar', 'support',
    'view_all_ptw', 'approve_ptw', 'reject_ptw', 'close_ptw',
    'step_9', 'step_10',
  ],
  [ROLES.SUPERVISOR]: [
    'dashboard', 'ptw', 'incident', 'audit', 'report', 'profile', 
    'settings', 'calendar', 'support', 'create_ptw', 'view_own_ptw',
    'step_1', 'step_2', 'step_3',
  ],
  [ROLES.CONTRACTOR]: [
    'ptw', 'incident', 'training', 'profile', 'support', 
    'view_assigned_ptw', 'step_4', 'step_5', 'step_6', 'step_7', 'step_8',
  ],
  [ROLES.WORKER]: ['incident_report', 'training', 'profile'],
};

export const DEMO_USERS = [
  {
    id: 1,
    username: 'admin',
    password: 'admin123',
    role: ROLES.ADMIN,
    name: 'John',
    email: 'admin@esselpropack.com',
    department: 'Management',
  },
  {
    id: 2,
    username: 'safety',
    password: 'safety123',
    role: ROLES.SAFETY_OFFICER,
    name: 'David',
    email: 'safety@esselpropack.com',
    department: 'Safety',
  },
  {
    id: 3,
    username: 'supervisor',
    password: 'supervisor123',
    role: ROLES.SUPERVISOR,
    name: 'Sarah',
    email: 'supervisor@esselpropack.com',
    department: 'Production',
  },
  {
    id: 4,
    username: 'contractor',
    password: 'contractor123',
    role: ROLES.CONTRACTOR,
    name: 'Mike',
    email: 'contractor@esselpropack.com',
    company: 'ABC Contractors',
  },
  {
    id: 5,
    username: 'worker',
    password: 'worker123',
    role: ROLES.WORKER,
    name: 'John',
    email: 'worker@esselpropack.com',
    department: 'Production',
  },
];