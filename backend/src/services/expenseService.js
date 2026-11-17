function normalizeSplitWith(raw) {
  if (!raw) {
    return [];
  }

  if (Array.isArray(raw)) {
    return raw
      .filter(value => typeof value === 'string' && value.trim())
      .map(value => value.trim());
  }

  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed
          .filter(value => typeof value === 'string' && value.trim())
          .map(value => value.trim());
      }
    } catch (_error) {
      return [];
    }
  }

  return [];
}

function normalizeExpenseDate(raw) {
  if (!raw) {
    return undefined;
  }

  const dateValue = raw instanceof Date ? raw : new Date(raw);
  if (Number.isNaN(dateValue.getTime())) {
    return undefined;
  }

  return dateValue.toISOString();
}

class ExpenseService {
  constructor(pool) {
    this.pool = pool;
  }

  toExpense(row) {
    const splitWith = normalizeSplitWith(row.split_with);
    const date = normalizeExpenseDate(row.expense_date);

    return {
      id: String(row.id),
      name: row.name,
      amount: Number(row.amount),
      paidBy: row.paid_by,
      splitType: row.split_type,
      splitWith,
      date,
      category: row.category || undefined,
      type: row.expense_type,
    };
  }

  async getExpensesByHouse(houseId) {
    const { rows } = await this.pool.query(
      `SELECT id, name, amount, paid_by, split_type, split_with, expense_date, category, expense_type
       FROM expenses
       WHERE house_id = $1
       ORDER BY expense_date DESC, created_at DESC`,
      [houseId],
    );

    return rows.map(row => this.toExpense(row));
  }

  async getExpenseById(id, houseId) {
    const { rows } = await this.pool.query(
      `SELECT id, name, amount, paid_by, split_type, split_with, expense_date, category, expense_type
       FROM expenses
       WHERE id = $1 AND house_id = $2`,
      [id, houseId],
    );

    if (rows.length === 0) {
      return null;
    }

    return this.toExpense(rows[0]);
  }

  async createExpense(payload) {
    const {
      houseId,
      createdBy,
      name,
      amount,
      paidBy,
      splitType,
      splitWith,
      expenseDate,
      category,
      type,
    } = payload;

    const splitWithValue = Array.isArray(splitWith)
      ? JSON.stringify(splitWith)
      : null;

    const result = await this.pool.query(
      `INSERT INTO expenses (
        house_id,
        created_by,
        name,
        amount,
        paid_by,
        split_type,
        split_with,
        expense_date,
        category,
        expense_type
      ) VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9, $10) RETURNING id`,
      [
        houseId,
        createdBy,
        name,
        amount,
        paidBy,
        splitType,
        splitWithValue,
        expenseDate || null,
        category || null,
        type,
      ],
    );

    return {
      id: String(result.rows[0].id),
      name,
      amount: Number(amount),
      paidBy,
      splitType,
      splitWith: Array.isArray(splitWith) ? splitWith : [],
      date: normalizeExpenseDate(expenseDate),
      category: category || undefined,
      type,
    };
  }

  async updateExpense(id, houseId, payload) {
    const {
      name,
      amount,
      paidBy,
      splitType,
      splitWith,
      expenseDate,
      category,
      type,
    } = payload;

    const splitWithValue = Array.isArray(splitWith)
      ? JSON.stringify(splitWith)
      : null;

    const result = await this.pool.query(
      `UPDATE expenses
       SET name = $1,
           amount = $2,
           paid_by = $3,
           split_type = $4,
           split_with = $5::jsonb,
           expense_date = $6,
           category = $7,
           expense_type = $8,
           updated_at = NOW()
       WHERE id = $9 AND house_id = $10`,
      [
        name,
        amount,
        paidBy,
        splitType,
        splitWithValue,
        expenseDate || null,
        category || null,
        type,
        id,
        houseId,
      ],
    );

    if (result.rowCount === 0) {
      return null;
    }

    return this.getExpenseById(id, houseId);
  }

  async deleteExpense(id, houseId) {
    const result = await this.pool.query(
      'DELETE FROM expenses WHERE id = $1 AND house_id = $2',
      [id, houseId],
    );

    return result.rowCount > 0;
  }
}

module.exports = ExpenseService;
