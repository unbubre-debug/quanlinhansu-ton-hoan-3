"use strict";

const STORAGE_KEYS = {
  employees: "hrm-flow:employees:v1",
  leave: "hrm-flow:leave:v1",
  attendance: "hrm-flow:attendance:v1",
  theme: "hrm-flow:theme:v1",
  sidebar: "hrm-flow:sidebar-collapsed:v1",
};

// The browser storage keys keep this demo's employee, attendance, leave, and display preferences separate.
const money = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const dateFormat = new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
const monthFormat = new Intl.DateTimeFormat("vi-VN", { month: "long", year: "numeric" });
const monthShortFormat = new Intl.DateTimeFormat("vi-VN", { month: "short" });
const collator = new Intl.Collator("vi", { sensitivity: "base", numeric: true });
const activeStatuses = new Set(["active", "probation"]);
const statusLabels = { active: "Đang làm việc", probation: "Thử việc", inactive: "Đã nghỉ" };
const leaveLabels = { pending: "Chờ duyệt", approved: "Đã duyệt", rejected: "Từ chối" };
const palette = ["blue", "violet", "green", "orange", "pink"];

function localDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isValidDateString(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00`);
  return !Number.isNaN(date.valueOf()) && localDateString(date) === value;
}

function offsetDate(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return localDateString(date);
}

function monthKey(year, month) {
  return `${year}-${String(month).padStart(2, "0")}`;
}

function formatMoney(amount) {
  return `${money.format(Math.round(amount || 0))} ₫`;
}

function parseStoredArray(key, fallback, validator) {
  const raw = localStorage.getItem(key);
  if (raw === null) return fallback;
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed) || !parsed.every(validator)) {
    throw new TypeError(`Dữ liệu lưu "${key}" không hợp lệ.`);
  }
  return parsed;
}

function isEmployeeRecord(employee) {
  return Boolean(
    employee &&
    typeof employee.id === "string" &&
    /^[a-z0-9-]{3,20}$/i.test(employee.id) &&
    typeof employee.name === "string" &&
    employee.name.trim() &&
    typeof employee.email === "string" &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(employee.email) &&
    typeof employee.phone === "string" &&
    typeof employee.department === "string" &&
    employee.department.trim() &&
    typeof employee.role === "string" &&
    employee.role.trim() &&
    isValidDateString(employee.start) &&
    ["active", "probation", "inactive"].includes(employee.status) &&
    [employee.base, employee.allowance, employee.bonus, employee.days, employee.overtime].every(
      (value) => Number.isSafeInteger(value) && value >= 0,
    ) &&
    employee.days <= 31 &&
    employee.overtime <= 200,
  );
}

function isLeaveRecord(leave) {
  return Boolean(
    leave &&
    typeof leave.id === "string" &&
    typeof leave.employeeId === "string" &&
    typeof leave.type === "string" &&
    isValidDateString(leave.from) &&
    isValidDateString(leave.to) &&
    leave.to >= leave.from &&
    typeof leave.reason === "string" &&
    leave.reason.trim() &&
    ["pending", "approved", "rejected"].includes(leave.status),
  );
}

function isAttendanceStore(records) {
  return Boolean(
    records &&
    typeof records === "object" &&
    !Array.isArray(records) &&
    Object.entries(records).every(([period, entries]) =>
      /^\d{4}-\d{2}$/.test(period) &&
      entries &&
      typeof entries === "object" &&
      !Array.isArray(entries) &&
      Object.values(entries).every((entry) =>
        entry &&
        Number.isFinite(entry.days) &&
        entry.days >= 0 &&
        entry.days <= 31 &&
        Number.isInteger(entry.days * 2) &&
        Number.isFinite(entry.overtime) &&
        entry.overtime >= 0 &&
        entry.overtime <= 200 &&
        Number.isInteger(entry.overtime * 2),
      ),
    ),
  );
}

const currentDate = new Date();
// Seed records are loaded only when this browser has no saved HRM data.
const seedEmployees = [
  { id: "NV001", name: "Nguyễn Minh Anh", email: "minh.anh@nova.vn", phone: "0901 234 567", department: "Marketing", role: "Marketing Manager", start: "2022-03-14", base: 28000000, allowance: 2500000, bonus: 1500000, days: 22, overtime: 3, status: "active" },
  { id: "NV002", name: "Trần Hoàng Nam", email: "hoang.nam@nova.vn", phone: "0902 345 678", department: "Công nghệ", role: "Frontend Developer", start: "2023-06-05", base: 24000000, allowance: 2000000, bonus: 1000000, days: 21, overtime: 5, status: "active" },
  { id: "NV003", name: "Lê Thu Hà", email: "thu.ha@nova.vn", phone: "0903 456 789", department: "Nhân sự", role: "Chuyên viên nhân sự", start: "2024-01-08", base: 18000000, allowance: 1500000, bonus: 500000, days: 20, overtime: 1, status: "active" },
  { id: "NV004", name: "Phạm Đức Long", email: "duc.long@nova.vn", phone: "0904 567 890", department: "Công nghệ", role: "Backend Developer", start: "2021-11-22", base: 30000000, allowance: 2500000, bonus: 2000000, days: 22, overtime: 7, status: "active" },
  { id: "NV005", name: "Đỗ Minh Quân", email: "minh.quan@nova.vn", phone: "0905 678 901", department: "Kinh doanh", role: "Chuyên viên kinh doanh", start: "2023-09-18", base: 20000000, allowance: 1800000, bonus: 1200000, days: 21, overtime: 2, status: "active" },
  { id: "NV006", name: "Nguyễn Hải Yến", email: "hai.yen@nova.vn", phone: "0906 789 012", department: "Thiết kế", role: "Product Designer", start: "2024-07-01", base: 22500000, allowance: 1800000, bonus: 900000, days: 22, overtime: 4, status: "active" },
  { id: "NV007", name: "Vũ Thanh Tùng", email: "thanh.tung@nova.vn", phone: "0907 890 123", department: "Vận hành", role: "Trưởng nhóm vận hành", start: "2020-02-10", base: 27000000, allowance: 2400000, bonus: 1500000, days: 19, overtime: 0, status: "active" },
  { id: "NV008", name: "Bùi Khánh Linh", email: "khanh.linh@nova.vn", phone: "0908 901 234", department: "Marketing", role: "Content Executive", start: localDateString(new Date(currentDate.getFullYear(), currentDate.getMonth(), 2)), base: 16500000, allowance: 1300000, bonus: 500000, days: 22, overtime: 2, status: "probation" },
  { id: "NV009", name: "Hoàng Nhật Minh", email: "nhat.minh@nova.vn", phone: "0909 012 345", department: "Công nghệ", role: "QA Engineer", start: localDateString(new Date(currentDate.getFullYear(), currentDate.getMonth(), 8)), base: 19500000, allowance: 1500000, bonus: 700000, days: 21, overtime: 3, status: "active" },
  { id: "NV010", name: "Phan Ngọc Mai", email: "ngoc.mai@nova.vn", phone: "0910 123 456", department: "Nhân sự", role: "Talent Acquisition", start: "2022-10-03", base: 19000000, allowance: 1600000, bonus: 800000, days: 22, overtime: 1, status: "active" },
].map((employee, index) => ({ ...employee, avatar: palette[index % palette.length] }));

const seedLeaves = [
  { id: "LV001", employeeId: "NV003", type: "Nghỉ phép năm", from: offsetDate(1), to: offsetDate(2), reason: "Giải quyết việc gia đình.", status: "pending" },
  { id: "LV002", employeeId: "NV005", type: "Nghỉ việc riêng", from: offsetDate(3), to: offsetDate(3), reason: "Có lịch hẹn cá nhân.", status: "pending" },
  { id: "LV003", employeeId: "NV006", type: "Nghỉ phép năm", from: offsetDate(5), to: offsetDate(6), reason: "Nghỉ ngắn ngày cùng gia đình.", status: "approved" },
  { id: "LV004", employeeId: "NV002", type: "Nghỉ ốm", from: offsetDate(-8), to: offsetDate(-8), reason: "Khám sức khỏe.", status: "rejected" },
];

let employees = [];
let leaveRequests = [];
let attendance = {};
let currentPage = 1;
const pageSize = 8;
let editingEmployeeId = null;
let toastTimer;

function showToast(message, isError = false) {
  const toast = document.querySelector("[data-toast]");
  toast.textContent = message;
  toast.classList.toggle("is-error", isError);
  toast.classList.add("is-visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 3200);
}

function saveData(key, value, successMessage) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    if (successMessage) showToast(successMessage);
    return true;
  } catch (error) {
    console.error(`Không thể lưu dữ liệu "${key}".`, error);
    showToast("Không thể lưu thay đổi. Hãy kiểm tra dung lượng hoặc quyền lưu trữ của trình duyệt.", true);
    return false;
  }
}

function getEmployee(employeeId) {
  return employees.find((employee) => employee.id === employeeId);
}

function initials(name) {
  const parts = name.trim().split(/\s+/);
  return (parts.length > 1 ? `${parts[0][0]}${parts.at(-1)[0]}` : parts[0].slice(0, 2)).toLocaleUpperCase("vi");
}

function employeeAvatar(employee) {
  const colors = {
    blue: ["#e4efff", "#346bd0"],
    violet: ["#efe8ff", "#7648c8"],
    green: ["#def6e9", "#16804f"],
    orange: ["#fff0d9", "#bd7110"],
    pink: ["#ffe5f0", "#b83d70"],
  };
  const [background, foreground] = colors[employee.avatar] || colors.blue;
  const image = `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"><circle cx="40" cy="40" r="40" fill="${background}"/><text x="40" y="42" dominant-baseline="middle" text-anchor="middle" fill="${foreground}" font-family="Segoe UI,Arial,sans-serif" font-size="25" font-weight="700">${escapeHtml(initials(employee.name))}</text></svg>`;
  return `<img class="avatar avatar-photo" src="data:image/svg+xml,${encodeURIComponent(image)}" alt="" loading="lazy">`;
}

function employeeIdentity(employee, withEmail = true) {
  return `<div class="employee-identity">${employeeAvatar(employee)}<span><strong>${escapeHtml(employee.name)}</strong>${withEmail ? `<small>${escapeHtml(employee.email)}</small>` : ""}</span></div>`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]);
}

function formatDate(value) {
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.valueOf()) ? "—" : dateFormat.format(date);
}

function dateDifferenceInclusive(from, to) {
  const start = new Date(`${from}T12:00:00`);
  const end = new Date(`${to}T12:00:00`);
  if (Number.isNaN(start.valueOf()) || Number.isNaN(end.valueOf()) || end < start) return 0;
  return Math.round((end - start) / 86400000) + 1;
}

function monthPeriod() {
  return {
    year: Number(document.querySelector("[data-payroll-year]").value),
    month: Number(document.querySelector("[data-payroll-month]").value),
  };
}

function attendanceFor(employee, period = monthPeriod()) {
  const key = monthKey(period.year, period.month);
  return attendance[key]?.[employee.id] || { days: employee.days, overtime: employee.overtime };
}

function makePayroll(employee, period = monthPeriod()) {
  const input = attendanceFor(employee, period);
  const dailySalary = employee.base / 26;
  const overtimePay = Math.round((dailySalary / 8) * 1.5 * input.overtime);
  const insurance = Math.round(employee.base * 0.08);
  const gross = Math.round((employee.base * input.days) / 26 + overtimePay + employee.allowance + employee.bonus);
  const taxableIncome = Math.max(0, gross - insurance - 11000000);
  const tax = Math.round(taxableIncome * 0.1);
  const net = gross - insurance - tax;
  return { ...input, overtimePay, insurance, tax, gross, net };
}

function payrollTotals(period = monthPeriod()) {
  return employees.filter((employee) => activeStatuses.has(employee.status)).reduce((totals, employee) => {
    const result = makePayroll(employee, period);
    totals.gross += result.gross;
    totals.net += result.net;
    return totals;
  }, { gross: 0, net: 0 });
}

function renderDashboard() {
  const active = employees.filter((employee) => activeStatuses.has(employee.status));
  const now = new Date();
  const newHires = active.filter((employee) => {
    const date = new Date(`${employee.start}T12:00:00`);
    return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
  }).length;
  const pending = leaveRequests.filter((request) => request.status === "pending").length;
  const totals = payrollTotals();
  document.querySelector("[data-stat-employees]").textContent = String(active.length);
  document.querySelector("[data-stat-new-hires]").textContent = String(newHires);
  document.querySelector("[data-stat-payroll]").textContent = formatMoney(totals.gross);
  document.querySelector("[data-stat-pending]").textContent = String(pending);
  document.querySelector("[data-pending-count]").textContent = String(pending);
  document.querySelector("[data-leave-trend]").textContent = pending ? "Chờ xử lý" : "Đã cập nhật";
  renderSalaryChart(totals.gross);
  renderActivity();
  renderUpcomingLeaves();
}

function renderSalaryChart(currentPayroll) {
  const container = document.querySelector("[data-chart-bars]");
  const now = new Date();
  const values = [0.87, 0.91, 0.94, 0.97, 1.02, 1].map((factor) => Math.max(0, currentPayroll * factor));
  const maxValue = Math.max(500000000, ...values);
  container.innerHTML = values.map((value, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    const height = Math.max(5, Math.min(100, (value / maxValue) * 100));
    return `<div class="chart-column ${index === values.length - 1 ? "is-current" : ""}" title="${formatMoney(value)}"><span class="chart-value">${money.format(Math.round(value / 1000000))}</span><span class="chart-bar" style="--bar-height:${height}%"></span><span class="chart-month">${monthShortFormat.format(date).replace(".", "")}</span></div>`;
  }).join("");
}

function renderActivity() {
  const items = [
    { icon: "♙", color: "blue", name: "Hồ sơ nhân viên", detail: `Đang quản lý ${employees.length} nhân sự trong hệ thống`, time: "Hôm nay" },
    { icon: "✓", color: "green", name: "Chấm công", detail: "Dữ liệu ngày công được lưu tự động", time: "Hôm nay" },
    { icon: "♡", color: "orange", name: "Nghỉ phép", detail: `${leaveRequests.filter((request) => request.status === "pending").length} đơn đang chờ xem xét`, time: "Mới nhất" },
    { icon: "₫", color: "violet", name: "Tiền lương", detail: "Bảng lương sẵn sàng tính theo kỳ", time: "Tháng này" },
  ];
  document.querySelector("[data-activity-list]").innerHTML = items.map((item) =>
    `<tr><td><div class="activity-entry"><span class="activity-icon activity-${item.color}" aria-hidden="true">${item.icon}</span><span class="activity-copy"><strong>${item.name}</strong><small>${item.detail}</small></span></div></td><td><time class="activity-time">${item.time}</time></td></tr>`,
  ).join("");
}

function renderUpcomingLeaves() {
  const today = localDateString();
  const items = leaveRequests
    .filter((request) => request.status !== "rejected" && request.to >= today)
    .sort((first, second) => first.from.localeCompare(second.from))
    .slice(0, 4);
  const container = document.querySelector("[data-upcoming-leaves]");
  if (!items.length) {
    container.innerHTML = '<p class="empty-state compact-empty">Chưa có lịch nghỉ sắp tới.</p>';
    return;
  }
  container.innerHTML = items.map((request) => {
    const employee = getEmployee(request.employeeId);
    if (!employee) return "";
    const start = new Date(`${request.from}T12:00:00`);
    return `<div class="upcoming-item"><span class="upcoming-date"><strong>${String(start.getDate()).padStart(2, "0")}</strong><small>TH${String(start.getMonth() + 1).padStart(2, "0")}</small></span><span class="upcoming-person"><strong>${escapeHtml(employee.name)}</strong><small>${escapeHtml(request.type)} · ${dateDifferenceInclusive(request.from, request.to)} ngày</small></span><span class="status-badge status-${request.status}">${leaveLabels[request.status]}</span></div>`;
  }).join("");
}

function renderDepartmentOptions() {
  const select = document.querySelector("[data-employee-department]");
  const selected = select.value;
  const departments = [...new Set(employees.map((employee) => employee.department))].sort(collator.compare);
  select.replaceChildren(new Option("Tất cả phòng ban", ""), ...departments.map((department) => new Option(department, department)));
  select.value = departments.includes(selected) ? selected : "";
}

function renderEmployees() {
  const query = normalize(document.querySelector("[data-employee-search]").value);
  const department = document.querySelector("[data-employee-department]").value;
  const status = document.querySelector("[data-employee-status]").value;
  const filtered = employees.filter((employee) => {
    const searchable = normalize(`${employee.name} ${employee.id} ${employee.email} ${employee.phone} ${employee.role} ${employee.department}`);
    return (!query || searchable.includes(query)) && (!department || employee.department === department) && (!status || employee.status === status);
  }).sort((first, second) => collator.compare(first.name, second.name));
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  currentPage = Math.min(currentPage, totalPages);
  const start = (currentPage - 1) * pageSize;
  const rows = filtered.slice(start, start + pageSize);
  const tbody = document.querySelector("[data-employee-rows]");
  tbody.innerHTML = rows.map((employee) => `<tr>
    <td>${employeeIdentity(employee)}</td><td><span class="employee-code">${escapeHtml(employee.id)}</span></td>
    <td>${escapeHtml(employee.department)}</td><td>${escapeHtml(employee.role)}</td><td>${formatDate(employee.start)}</td>
    <td class="money-cell">${formatMoney(employee.base)}</td><td><span class="status-badge status-${employee.status}">${statusLabels[employee.status]}</span></td>
    <td><div class="row-actions"><button class="row-action" type="button" data-edit-employee="${escapeHtml(employee.id)}" aria-label="Sửa ${escapeHtml(employee.name)}" title="Sửa">✎</button><button class="row-action danger-action" type="button" data-delete-employee="${escapeHtml(employee.id)}" aria-label="Xóa ${escapeHtml(employee.name)}" title="Xóa">×</button></div></td>
  </tr>`).join("");
  if (!rows.length) tbody.innerHTML = '<tr><td class="empty-state" colspan="8">Không tìm thấy nhân viên phù hợp.</td></tr>';
  document.querySelector("[data-employee-count]").textContent = `${filtered.length} nhân viên`;
  document.querySelector("[data-employee-pagination]").textContent = filtered.length
    ? `Hiển thị ${start + 1}–${start + rows.length} trong ${filtered.length} nhân viên`
    : "Không có dữ liệu";
  document.querySelector("[data-employee-prev]").disabled = currentPage <= 1 || !filtered.length;
  document.querySelector("[data-employee-next]").disabled = currentPage >= totalPages || !filtered.length;
}

function getAttendancePeriod() {
  return {
    year: Number(document.querySelector("[data-attendance-year]").value),
    month: Number(document.querySelector("[data-attendance-month]").value),
  };
}

function renderAttendance() {
  const period = getAttendancePeriod();
  const periodKey = monthKey(period.year, period.month);
  const saved = attendance[periodKey] || {};
  let dayTotal = 0;
  let overtimeTotal = 0;
  const tbody = document.querySelector("[data-attendance-rows]");
  tbody.innerHTML = employees.map((employee) => {
    const record = saved[employee.id] || { days: employee.days, overtime: employee.overtime };
    dayTotal += record.days;
    overtimeTotal += record.overtime;
    return `<tr data-attendance-row="${escapeHtml(employee.id)}"><td>${employeeIdentity(employee)}</td><td>${escapeHtml(employee.department)}</td><td><label class="sr-only" for="days-${employee.id}">Ngày công ${escapeHtml(employee.name)}</label><input class="table-input" id="days-${employee.id}" data-attendance-field="days" type="number" min="0" max="31" step="0.5" value="${record.days}"></td><td><label class="sr-only" for="overtime-${employee.id}">Giờ tăng ca ${escapeHtml(employee.name)}</label><input class="table-input" id="overtime-${employee.id}" data-attendance-field="overtime" type="number" min="0" max="200" step="0.5" value="${record.overtime}"></td><td><span class="attendance-note">${employee.status === "inactive" ? "Đã nghỉ việc" : "Đã ghi nhận"}</span></td></tr>`;
  }).join("");
  document.querySelector("[data-attendance-headcount]").textContent = String(employees.length);
  document.querySelector("[data-attendance-days]").textContent = money.format(dayTotal);
  document.querySelector("[data-attendance-overtime]").textContent = `${money.format(overtimeTotal)} giờ`;
}

function renderLeaveEmployeeOptions(selected = "") {
  const select = document.querySelector("[data-leave-employee]");
  const choices = employees.filter((employee) => employee.status !== "inactive")
    .map((employee) => new Option(`${employee.name} · ${employee.id}`, employee.id));
  select.replaceChildren(new Option("Chọn nhân viên", ""), ...choices);
  select.value = selected;
}

function leaveBalance(employeeId) {
  const annualDaysTaken = leaveRequests
    .filter((request) => request.employeeId === employeeId && request.type === "Nghỉ phép năm" && request.status === "approved")
    .reduce((total, request) => total + dateDifferenceInclusive(request.from, request.to), 0);
  return Math.max(0, 12 - annualDaysTaken);
}

function renderLeaves() {
  const filter = document.querySelector("[data-leave-filter]").value;
  const filtered = leaveRequests.filter((request) => !filter || request.status === filter)
    .sort((first, second) => second.from.localeCompare(first.from));
  const tbody = document.querySelector("[data-leave-rows]");
  tbody.innerHTML = filtered.map((request) => {
    const employee = getEmployee(request.employeeId);
    if (!employee) return "";
    const actions = request.status === "pending"
      ? `<div class="leave-actions"><button class="approve-button" type="button" data-leave-action="approved" data-leave-id="${escapeHtml(request.id)}">Duyệt</button><button class="reject-button" type="button" data-leave-action="rejected" data-leave-id="${escapeHtml(request.id)}">Từ chối</button></div>`
      : '<span class="muted-cell">Đã xử lý</span>';
    return `<tr><td>${employeeIdentity(employee)}</td><td>${escapeHtml(request.type)}</td><td>${formatDate(request.from)}${request.from !== request.to ? ` – ${formatDate(request.to)}` : ""}</td><td>${dateDifferenceInclusive(request.from, request.to)} ngày</td><td>${leaveBalance(employee.id)} ngày</td><td class="reason-cell" title="${escapeHtml(request.reason)}">${escapeHtml(request.reason)}</td><td><span class="status-badge status-${request.status}">${leaveLabels[request.status]}</span></td><td>${actions}</td></tr>`;
  }).join("");
  if (!filtered.length) tbody.innerHTML = '<tr><td class="empty-state" colspan="8">Chưa có đơn nghỉ phép phù hợp.</td></tr>';
  document.querySelector("[data-leave-pending]").textContent = String(leaveRequests.filter((request) => request.status === "pending").length);
  document.querySelector("[data-leave-approved]").textContent = String(leaveRequests.filter((request) => request.status === "approved").length);
  const eligibleEmployees = employees.filter((employee) => employee.status !== "inactive");
  const averageBalance = eligibleEmployees.length
    ? Math.round(eligibleEmployees.reduce((total, employee) => total + leaveBalance(employee.id), 0) / eligibleEmployees.length)
    : 12;
  document.querySelector("[data-leave-balance]").textContent = `${averageBalance} ngày`;
  document.querySelector("[data-pending-count]").textContent = String(leaveRequests.filter((request) => request.status === "pending").length);
}

function calculatePayroll() {
  const period = monthPeriod();
  const participants = employees.filter((employee) => activeStatuses.has(employee.status));
  const tbody = document.querySelector("[data-payroll-rows]");
  tbody.innerHTML = participants.map((employee) => {
    const result = makePayroll(employee, period);
    return `<tr><td>${employeeIdentity(employee)}</td><td>${formatMoney(employee.base)}</td><td>${result.days}</td><td>${result.overtime} giờ</td><td>${formatMoney(employee.allowance)}</td><td>${formatMoney(employee.bonus)}</td><td>${formatMoney(result.insurance)}</td><td>${formatMoney(result.tax)}</td><td class="net-cell">${formatMoney(result.net)}</td></tr>`;
  }).join("");
  if (!participants.length) tbody.innerHTML = '<tr><td class="empty-state" colspan="9">Chưa có nhân viên đang làm việc để tính lương.</td></tr>';
  const totals = payrollTotals(period);
  document.querySelector("[data-payroll-gross-total]").textContent = formatMoney(totals.gross);
  document.querySelector("[data-payroll-total]").textContent = formatMoney(totals.net);
  const periodLabel = monthFormat.format(new Date(period.year, period.month - 1, 1));
  document.querySelector("[data-payroll-period]").textContent = `Đã tính ${participants.length} phiếu lương cho ${periodLabel}.`;
  showToast(`Đã tính lương cho ${participants.length} nhân viên.`);
  renderDashboard();
}

function renderReports() {
  const active = employees.filter((employee) => activeStatuses.has(employee.status));
  const now = new Date();
  const hiresThisMonth = active.filter((employee) => {
    const start = new Date(`${employee.start}T12:00:00`);
    return start.getMonth() === now.getMonth() && start.getFullYear() === now.getFullYear();
  }).length;
  const totals = payrollTotals();
  document.querySelector("[data-report-headcount]").textContent = String(active.length);
  document.querySelector("[data-report-hires]").textContent = String(hiresThisMonth);
  document.querySelector("[data-report-payroll]").textContent = formatMoney(totals.gross);
  const tbody = document.querySelector("[data-report-rows]");
  // Historical departures are sample values because employee records do not include a departure date.
  const historicalMonths = Array.from({ length: 6 }, (_, index) => {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    const hires = active.filter((employee) => {
      const start = new Date(`${employee.start}T12:00:00`);
      return start.getFullYear() === monthDate.getFullYear() && start.getMonth() === monthDate.getMonth();
    }).length;
    const departures = [1, 0, 1, 0, 0, 0][index];
    const salary = Math.round(totals.gross * [0.87, 0.91, 0.94, 0.97, 1.02, 1][index]);
    return { monthDate, hires, departures, salary };
  });
  let closingHeadcount = active.length;
  const reportRows = historicalMonths.map((month) => {
    const closing = closingHeadcount;
    const opening = Math.max(0, closing - month.hires + month.departures);
    closingHeadcount = opening;
    return `<tr><td><strong>${monthFormat.format(month.monthDate)}</strong></td><td>${opening}</td><td><span class="report-positive">+${month.hires}</span></td><td>${month.departures}</td><td>${closing}</td><td class="money-cell">${formatMoney(month.salary)}</td></tr>`;
  });
  tbody.innerHTML = reportRows.join("");
}

function renderAll() {
  renderDepartmentOptions();
  renderEmployees();
  renderAttendance();
  renderLeaveEmployeeOptions(document.querySelector("[data-leave-employee]").value);
  renderLeaves();
  renderReports();
  renderDashboard();
}

function normalize(value) {
  return String(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[đĐ]/g, "d").toLocaleLowerCase("vi").trim();
}

function initializeData() {
  try {
    employees = parseStoredArray(STORAGE_KEYS.employees, seedEmployees, isEmployeeRecord);
    leaveRequests = parseStoredArray(STORAGE_KEYS.leave, seedLeaves, isLeaveRecord);
    const storedAttendance = localStorage.getItem(STORAGE_KEYS.attendance);
    attendance = storedAttendance === null ? {} : JSON.parse(storedAttendance);
    if (!isAttendanceStore(attendance)) {
      throw new TypeError("Dữ liệu chấm công đã lưu không đúng định dạng.");
    }
  } catch (error) {
    console.error("Không thể đọc dữ liệu HRM đã lưu.", error);
    employees = seedEmployees;
    leaveRequests = seedLeaves;
    attendance = {};
    showToast("Dữ liệu đã lưu bị lỗi. Đang sử dụng dữ liệu mẫu; hãy tải lại sau khi kiểm tra dữ liệu.", true);
  }
}

function initializeDateControls() {
  const now = new Date();
  const months = Array.from({ length: 12 }, (_, index) => new Option(`Tháng ${String(index + 1).padStart(2, "0")}`, String(index + 1)));
  const years = Array.from({ length: 5 }, (_, index) => new Option(String(now.getFullYear() - 2 + index), String(now.getFullYear() - 2 + index)));
  ["[data-attendance-month]", "[data-payroll-month]"].forEach((selector) => {
    const select = document.querySelector(selector);
    select.replaceChildren(...months.map((option) => option.cloneNode(true)));
    select.value = String(now.getMonth() + 1);
  });
  ["[data-attendance-year]", "[data-payroll-year]"].forEach((selector) => {
    const select = document.querySelector(selector);
    select.replaceChildren(...years.map((option) => option.cloneNode(true)));
    select.value = String(now.getFullYear());
  });
  const monthChanged = () => {
    renderAttendance();
    document.querySelector("[data-payroll-rows]").innerHTML = '<tr><td class="empty-state" colspan="9">Chọn “Tính lương hàng loạt” để cập nhật bảng theo kỳ này.</td></tr>';
    document.querySelector("[data-payroll-period]").textContent = "Kỳ lương đã thay đổi. Hãy tính lại bảng lương.";
  };
  document.querySelectorAll("[data-attendance-month], [data-attendance-year]").forEach((select) => select.addEventListener("change", renderAttendance));
  document.querySelectorAll("[data-payroll-month], [data-payroll-year]").forEach((select) => select.addEventListener("change", monthChanged));
}

function initializeRoutes() {
  // Hash-based routing keeps navigation inside this single document.
  const routes = ["dashboard", "employees", "attendance", "leave", "payroll", "reports"];
  const titles = { dashboard: "Dashboard", employees: "Nhân viên", attendance: "Chấm công", leave: "Nghỉ phép", payroll: "Tiền lương", reports: "Báo cáo" };
  const sidebar = document.querySelector("#app-sidebar");
  const toggle = document.querySelector("[data-sidebar-toggle]");
  const overlay = document.querySelector("[data-sidebar-close]");

  function closeSidebar() {
    sidebar.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("sidebar-open");
  }

  function renderRoute() {
    const requested = location.hash.slice(1) || "dashboard";
    const route = routes.includes(requested) ? requested : "dashboard";
    if (requested !== route) history.replaceState(null, "", "#dashboard");
    document.querySelectorAll("[data-route-view]").forEach((view) => { view.hidden = view.dataset.routeView !== route; });
    document.querySelectorAll("[data-route]").forEach((link) => {
      const active = link.dataset.route === route;
      link.classList.toggle("is-active", active);
      if (active) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
    document.querySelector("[data-route-title]").textContent = titles[route];
    closeSidebar();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  toggle.addEventListener("click", () => {
    const isOpen = sidebar.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
    document.body.classList.toggle("sidebar-open", isOpen);
  });
  overlay.addEventListener("click", closeSidebar);
  document.querySelectorAll("[data-go-route]").forEach((button) => button.addEventListener("click", () => { location.hash = button.dataset.goRoute; }));
  window.addEventListener("hashchange", renderRoute);
  document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeSidebar(); });
  renderRoute();
}

function initializeThemeAndSidebar() {
  const themeButton = document.querySelector("[data-theme-toggle]");
  const collapseButton = document.querySelector("[data-sidebar-collapse]");
  const root = document.documentElement;
  try {
    if (localStorage.getItem(STORAGE_KEYS.theme) === "dark") root.dataset.theme = "dark";
    if (localStorage.getItem(STORAGE_KEYS.sidebar) === "true" && matchMedia("(min-width: 901px)").matches) {
      document.body.classList.add("sidebar-collapsed");
    }
  } catch (error) {
    console.error("Không thể đọc tùy chọn giao diện.", error);
  }
  const updateThemeButton = () => {
    const dark = root.dataset.theme === "dark";
    themeButton.innerHTML = `<span aria-hidden="true">${dark ? "☀" : "☾"}</span>`;
    themeButton.setAttribute("aria-label", dark ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối");
  };
  updateThemeButton();
  themeButton.addEventListener("click", () => {
    root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
    updateThemeButton();
    try {
      localStorage.setItem(STORAGE_KEYS.theme, root.dataset.theme);
    } catch (error) {
      console.error("Không thể lưu tùy chọn giao diện.", error);
      showToast("Không thể lưu giao diện đã chọn trong trình duyệt.", true);
    }
  });
  const updateCollapseButton = () => {
    const collapsed = document.body.classList.contains("sidebar-collapsed");
    collapseButton.setAttribute("aria-label", collapsed ? "Mở rộng thanh điều hướng" : "Thu gọn thanh điều hướng");
    collapseButton.title = collapsed ? "Mở rộng thanh điều hướng" : "Thu gọn thanh điều hướng";
  };
  updateCollapseButton();
  collapseButton.addEventListener("click", () => {
    if (!matchMedia("(min-width: 901px)").matches) return;
    document.body.classList.toggle("sidebar-collapsed");
    updateCollapseButton();
    try {
      localStorage.setItem(STORAGE_KEYS.sidebar, String(document.body.classList.contains("sidebar-collapsed")));
    } catch (error) {
      console.error("Không thể lưu trạng thái thu gọn thanh điều hướng.", error);
    }
  });
}

function initializeEmployeeManagement() {
  const dialog = document.querySelector("[data-employee-dialog]");
  const form = document.querySelector("[data-employee-form]");
  const message = document.querySelector("[data-employee-message]");

  function closeDialog() {
    dialog.close();
    form.reset();
    editingEmployeeId = null;
    message.textContent = "";
    document.querySelector("[data-employee-dialog-title]").textContent = "Thêm nhân viên";
    form.elements.id.readOnly = false;
  }

  document.querySelector("[data-open-employee]").addEventListener("click", () => {
    form.reset();
    editingEmployeeId = null;
    message.textContent = "";
    form.elements.start.value = localDateString();
    form.elements.status.value = "active";
    document.querySelector("[data-employee-dialog-title]").textContent = "Thêm nhân viên";
    form.elements.id.readOnly = false;
    dialog.showModal();
    form.elements.name.focus();
  });
  document.querySelector("[data-close-employee]").addEventListener("click", closeDialog);
  document.querySelector("[data-cancel-employee]").addEventListener("click", closeDialog);
  dialog.addEventListener("click", (event) => { if (event.target === dialog) closeDialog(); });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const values = Object.fromEntries(new FormData(form));
    const id = values.id.trim().toUpperCase();
    const email = values.email.trim().toLocaleLowerCase("vi");
    const duplicateId = employees.some((employee) => employee.id.toLocaleLowerCase("vi") === id.toLocaleLowerCase("vi") && employee.id !== editingEmployeeId);
    const duplicateEmail = employees.some((employee) => employee.email.toLocaleLowerCase("vi") === email && employee.id !== editingEmployeeId);
    if (!/^[A-Z0-9-]{3,20}$/.test(id)) {
      message.textContent = "Mã nhân viên cần có từ 3 đến 20 ký tự chữ, số hoặc dấu gạch ngang.";
      form.elements.id.focus();
      return;
    }
    if (duplicateId || duplicateEmail) {
      message.textContent = duplicateId ? "Mã nhân viên này đã được sử dụng." : "Email này đã được sử dụng.";
      form.elements[duplicateId ? "id" : "email"].focus();
      return;
    }
    const base = Number(values.base);
    if (!Number.isSafeInteger(base) || base < 0) {
      message.textContent = "Lương cơ bản phải là số nguyên không âm.";
      form.elements.base.focus();
      return;
    }
    const existing = employees.find((employee) => employee.id === editingEmployeeId);
    const record = {
      id, name: values.name.trim().replace(/\s+/g, " "), email, phone: values.phone.trim(),
      department: values.department, role: values.role.trim(), start: values.start, base,
      allowance: existing?.allowance || 0, bonus: existing?.bonus || 0, days: existing?.days ?? 22,
      overtime: existing?.overtime ?? 0, status: values.status, avatar: existing?.avatar || palette[employees.length % palette.length],
    };
    if (!record.name || !record.role) {
      message.textContent = "Vui lòng nhập đầy đủ họ tên và vị trí.";
      return;
    }
    const nextEmployees = existing
      ? employees.map((employee) => employee.id === editingEmployeeId ? record : employee)
      : [...employees, record];
    if (!saveData(STORAGE_KEYS.employees, nextEmployees)) return;
    employees = nextEmployees;
    closeDialog();
    currentPage = 1;
    renderAll();
    showToast(existing ? "Đã cập nhật hồ sơ nhân viên." : "Đã thêm nhân viên mới.");
  });

  document.querySelector("[data-employee-rows]").addEventListener("click", (event) => {
    const editButton = event.target.closest("[data-edit-employee]");
    const deleteButton = event.target.closest("[data-delete-employee]");
    if (editButton) {
      const employee = getEmployee(editButton.dataset.editEmployee);
      if (!employee) return;
      editingEmployeeId = employee.id;
      document.querySelector("[data-employee-dialog-title]").textContent = "Chỉnh sửa nhân viên";
      for (const field of ["name", "id", "email", "phone", "department", "role", "start", "base", "status"]) {
        form.elements[field].value = employee[field];
      }
      form.elements.id.readOnly = true;
      message.textContent = "";
      dialog.showModal();
      form.elements.name.focus();
    } else if (deleteButton) {
      const employee = getEmployee(deleteButton.dataset.deleteEmployee);
      if (!employee || !confirm(`Bạn có chắc muốn xóa nhân viên ${employee.name}?`)) return;
      const nextEmployees = employees.filter((record) => record.id !== employee.id);
      const nextLeaves = leaveRequests.filter((record) => record.employeeId !== employee.id);
      if (!saveData(STORAGE_KEYS.employees, nextEmployees) || !saveData(STORAGE_KEYS.leave, nextLeaves)) return;
      employees = nextEmployees;
      leaveRequests = nextLeaves;
      renderAll();
      showToast(`Đã xóa hồ sơ ${employee.name}.`);
    }
  });

  document.querySelector("[data-employee-search]").addEventListener("input", () => { currentPage = 1; renderEmployees(); });
  document.querySelector("[data-employee-department]").addEventListener("change", () => { currentPage = 1; renderEmployees(); });
  document.querySelector("[data-employee-status]").addEventListener("change", () => { currentPage = 1; renderEmployees(); });
  document.querySelector("[data-employee-prev]").addEventListener("click", () => { currentPage -= 1; renderEmployees(); });
  document.querySelector("[data-employee-next]").addEventListener("click", () => { currentPage += 1; renderEmployees(); });
}

function initializeAttendance() {
  document.querySelector("[data-attendance-rows]").addEventListener("change", (event) => {
    const input = event.target.closest("[data-attendance-field]");
    if (!input) return;
    const row = input.closest("[data-attendance-row]");
    const employeeId = row.dataset.attendanceRow;
    const field = input.dataset.attendanceField;
    const max = field === "days" ? 31 : 200;
    const value = Number(input.value);
    if (!Number.isFinite(value) || value < 0 || value > max || !Number.isInteger(value * 2)) {
      input.setCustomValidity(`Nhập giá trị từ 0 đến ${max}, tối đa 1 chữ số thập phân.`);
      input.reportValidity();
      input.setCustomValidity("");
      input.value = String(attendanceFor(getEmployee(employeeId), getAttendancePeriod())[field]);
      return;
    }
    const period = getAttendancePeriod();
    const key = monthKey(period.year, period.month);
    const nextAttendance = {
      ...attendance,
      [key]: {
        ...(attendance[key] || {}),
        [employeeId]: { ...attendanceFor(getEmployee(employeeId), period), [field]: value },
      },
    };
    if (!saveData(STORAGE_KEYS.attendance, nextAttendance)) {
      input.value = String(attendanceFor(getEmployee(employeeId), period)[field]);
      return;
    }
    attendance = nextAttendance;
    renderAttendance();
    renderDashboard();
  });
}

function initializeLeaveManagement() {
  const dialog = document.querySelector("[data-leave-dialog]");
  const form = document.querySelector("[data-leave-form]");
  const message = document.querySelector("[data-leave-message]");

  function closeDialog() {
    dialog.close();
    form.reset();
    message.textContent = "";
    renderLeaveEmployeeOptions();
  }
  document.querySelector("[data-open-leave]").addEventListener("click", () => {
    form.reset();
    const today = localDateString();
    form.elements.from.min = today;
    form.elements.to.min = today;
    form.elements.from.value = today;
    form.elements.to.value = today;
    renderLeaveEmployeeOptions();
    message.textContent = "";
    dialog.showModal();
  });
  document.querySelector("[data-close-leave]").addEventListener("click", closeDialog);
  document.querySelector("[data-cancel-leave]").addEventListener("click", closeDialog);
  dialog.addEventListener("click", (event) => { if (event.target === dialog) closeDialog(); });
  form.elements.from.addEventListener("change", () => {
    form.elements.to.min = form.elements.from.value;
    if (form.elements.to.value < form.elements.from.value) form.elements.to.value = form.elements.from.value;
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const values = Object.fromEntries(new FormData(form));
    if (values.to < values.from) {
      message.textContent = "Ngày kết thúc phải bằng hoặc sau ngày bắt đầu.";
      form.elements.to.focus();
      return;
    }
    const employee = getEmployee(values.employeeId);
    if (!employee || employee.status === "inactive") {
      message.textContent = "Chọn nhân viên còn làm việc để tạo đơn nghỉ.";
      return;
    }
    const request = {
      id: `LV${String(Date.now()).slice(-8)}`, employeeId: employee.id, type: values.type,
      from: values.from, to: values.to, reason: values.reason.trim(), status: "pending",
    };
    if (!request.reason) {
      message.textContent = "Vui lòng nhập lý do nghỉ phép.";
      form.elements.reason.focus();
      return;
    }
    const nextLeaves = [...leaveRequests, request];
    if (!saveData(STORAGE_KEYS.leave, nextLeaves)) return;
    leaveRequests = nextLeaves;
    closeDialog();
    renderAll();
    showToast("Đã gửi đơn nghỉ phép để xét duyệt.");
  });
  document.querySelector("[data-leave-rows]").addEventListener("click", (event) => {
    const button = event.target.closest("[data-leave-action]");
    if (!button) return;
    const request = leaveRequests.find((item) => item.id === button.dataset.leaveId);
    if (!request || request.status !== "pending") return;
    const nextLeaves = leaveRequests.map((item) => item.id === request.id ? { ...item, status: button.dataset.leaveAction } : item);
    if (!saveData(STORAGE_KEYS.leave, nextLeaves)) return;
    leaveRequests = nextLeaves;
    renderAll();
    showToast(button.dataset.leaveAction === "approved" ? "Đã duyệt đơn nghỉ phép." : "Đã từ chối đơn nghỉ phép.");
  });
  document.querySelector("[data-leave-filter]").addEventListener("change", renderLeaves);
}

function initializePayroll() {
  document.querySelector("[data-calculate-payroll]").addEventListener("click", calculatePayroll);
}

function initializeDates() {
  const date = new Date();
  const fullDate = new Intl.DateTimeFormat("vi-VN", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(date);
  const shortDate = new Intl.DateTimeFormat("vi-VN", { day: "numeric", month: "long", year: "numeric" }).format(date);
  document.querySelectorAll("[data-current-date]").forEach((element) => { element.textContent = fullDate; });
  document.querySelectorAll("[data-current-date-short]").forEach((element) => { element.textContent = shortDate; });
}

function initializeApplication() {
  initializeData();
  initializeDates();
  initializeDateControls();
  initializeThemeAndSidebar();
  initializeRoutes();
  initializeEmployeeManagement();
  initializeAttendance();
  initializeLeaveManagement();
  initializePayroll();
  renderAll();
  document.querySelector("[data-payroll-rows]").innerHTML = '<tr><td class="empty-state" colspan="9">Chọn “Tính lương hàng loạt” để cập nhật bảng lương.</td></tr>';
}

initializeApplication();