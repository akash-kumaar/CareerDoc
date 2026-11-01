const pool = require('../config/db');

const ALLOWED_TYPES = ['job', 'internship', 'freelance'];
const ALLOWED_STATUSES = ['saved', 'applied', 'interview', 'offer', 'rejected', 'closed'];
const ALLOWED_WORK_ARRANGEMENTS = ['remote', 'hybrid', 'on-site'];

const FIELDS = [
  'company_name',
  'role_title',
  'type',
  'platform',
  'url',
  'location',
  'work_arrangement',
  'salary',
  'currency',
  'status',
  'applied_date',
  'deadline',
  'notes',
];

function validateCreate(data) {
  const errors = [];

  if (!data.company_name || !String(data.company_name).trim()) {
    errors.push('company_name is required');
  }
  if (!data.role_title || !String(data.role_title).trim()) {
    errors.push('role_title is required');
  }
  if (!data.type) {
    errors.push('type is required');
  } else if (!ALLOWED_TYPES.includes(data.type)) {
    errors.push(`type must be one of: ${ALLOWED_TYPES.join(', ')}`);
  }
  if (!data.status) {
    errors.push('status is required');
  } else if (!ALLOWED_STATUSES.includes(data.status)) {
    errors.push(`status must be one of: ${ALLOWED_STATUSES.join(', ')}`);
  }
  if (data.work_arrangement && !ALLOWED_WORK_ARRANGEMENTS.includes(data.work_arrangement)) {
    errors.push(`work_arrangement must be one of: ${ALLOWED_WORK_ARRANGEMENTS.join(', ')}`);
  }

  return errors;
}

function validateUpdate(data) {
  const errors = [];

  if (data.type && !ALLOWED_TYPES.includes(data.type)) {
    errors.push(`type must be one of: ${ALLOWED_TYPES.join(', ')}`);
  }
  if (data.status && !ALLOWED_STATUSES.includes(data.status)) {
    errors.push(`status must be one of: ${ALLOWED_STATUSES.join(', ')}`);
  }
  if (data.work_arrangement && !ALLOWED_WORK_ARRANGEMENTS.includes(data.work_arrangement)) {
    errors.push(`work_arrangement must be one of: ${ALLOWED_WORK_ARRANGEMENTS.join(', ')}`);
  }
  if (data.company_name !== undefined && !String(data.company_name).trim()) {
    errors.push('company_name cannot be empty');
  }
  if (data.role_title !== undefined && !String(data.role_title).trim()) {
    errors.push('role_title cannot be empty');
  }

  return errors;
}

async function listOpportunities({ search, type, status, work_arrangement }) {
  const conditions = [];
  const values = [];
  let idx = 1;

  if (search) {
    conditions.push(
      `(company_name ILIKE $${idx} OR role_title ILIKE $${idx} OR platform ILIKE $${idx})`
    );
    values.push(`%${search}%`);
    idx += 1;
  }
  if (type) {
    conditions.push(`type = $${idx}`);
    values.push(type);
    idx += 1;
  }
  if (status) {
    conditions.push(`status = $${idx}`);
    values.push(status);
    idx += 1;
  }
  if (work_arrangement) {
    conditions.push(`work_arrangement = $${idx}`);
    values.push(work_arrangement);
    idx += 1;
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const result = await pool.query(
    `SELECT * FROM opportunities ${whereClause} ORDER BY created_at DESC`,
    values
  );
  return result.rows;
}

async function getOpportunityById(id) {
  const result = await pool.query('SELECT * FROM opportunities WHERE id = $1', [id]);
  return result.rows[0] || null;
}

async function createOpportunity(data) {
  const columns = FIELDS;
  const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
  const values = columns.map((col) => (data[col] === undefined ? null : data[col]));

  const result = await pool.query(
    `INSERT INTO opportunities (${columns.join(', ')})
     VALUES (${placeholders})
     RETURNING *`,
    values
  );
  return result.rows[0];
}

async function updateOpportunity(id, data) {
  const columns = FIELDS.filter((col) => data[col] !== undefined);
  if (columns.length === 0) {
    return getOpportunityById(id);
  }

  const setClause = columns.map((col, i) => `${col} = $${i + 1}`).join(', ');
  const values = columns.map((col) => data[col]);
  values.push(id);

  const result = await pool.query(
    `UPDATE opportunities
     SET ${setClause}, updated_at = NOW()
     WHERE id = $${values.length}
     RETURNING *`,
    values
  );
  return result.rows[0] || null;
}

async function updateStatus(id, status) {
  const result = await pool.query(
    `UPDATE opportunities
     SET status = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING *`,
    [status, id]
  );
  return result.rows[0] || null;
}

async function deleteOpportunity(id) {
  const result = await pool.query('DELETE FROM opportunities WHERE id = $1 RETURNING id', [id]);
  return result.rows[0] || null;
}

module.exports = {
  ALLOWED_TYPES,
  ALLOWED_STATUSES,
  ALLOWED_WORK_ARRANGEMENTS,
  validateCreate,
  validateUpdate,
  listOpportunities,
  getOpportunityById,
  createOpportunity,
  updateOpportunity,
  updateStatus,
  deleteOpportunity,
};
