const normalizeText = (value) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLocaleLowerCase("vi")
    .trim();

const attendanceStorageKey = "peoplehub:salary-attendance:2025-06:v1";
const qrAttendanceStorageKey = "peoplehub:qr-attendance:demo:v1";
const employeeMessageStorageKey = "peoplehub:employee-messages:demo:v1";
const customEmployeeStorageKey = "peoplehub:employees:demo:v1";
const demoAttendanceQrCode = "PEOPLEHUB-DEMO-ATTENDANCE-2026";
const activeEmployeeKey = "peoplehub:auth:employee";
const rememberedEmployeeKey = "peoplehub:auth:remembered-employee";
const salaryCurrency = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});
function parseCustomEmployeeRecords(rawValue) {
  if (rawValue === null) {
    return [];
  }
  const records = JSON.parse(rawValue);
  if (!Array.isArray(records)) {
    throw new TypeError("Danh sách nhân viên đã lưu không đúng định dạng.");
  }
  records.forEach((employee) => {
    if (
      !employee ||
      typeof employee.id !== "string" ||
      !/^nv-\d{3,}$/.test(employee.id) ||
      typeof employee.name !== "string" ||
      !employee.name.trim() ||
      typeof employee.email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(employee.email) ||
      typeof employee.role !== "string" ||
      !employee.role.trim() ||
      typeof employee.department !== "string" ||
      !employee.department.trim() ||
      !/^\d{2}\/\d{2}\/\d{4}$/.test(employee.start) ||
      !["active", "onboarding", "leave"].includes(employee.employment) ||
      !["office", "remote"].includes(employee.workMode) ||
      ![employee.base, employee.allowance, employee.insurance, employee.bonus, employee.days].every(
        (value) => Number.isSafeInteger(value) && value >= 0,
      )
    ) {
      throw new TypeError("Hồ sơ nhân viên đã lưu có dữ liệu không hợp lệ.");
    }
  });
  return records;
}

const employeeRecords = [
  { id: "hn", name: "Hoàng Ngọc", initials: "HN", email: "ngoc.hoang@example.com", role: "Product Designer", department: "Thiết kế", specialty: "Thiết kế UI/UX, nghiên cứu người dùng, Figma", start: "24/06/2025", employment: "active", manager: "Nhật Linh", workMode: "office", attendance: "ontime", days: 21, base: 18500000, allowance: 2100000, insurance: 1400000, bonus: 1000000, avatar: "coral", photo: "hoang-ngoc.svg" },
  { id: "ta", name: "Trần Anh", initials: "TA", email: "anh.tran@example.com", role: "Frontend Developer", department: "Công nghệ", specialty: "Phát triển giao diện web, JavaScript, tối ưu hiệu năng", start: "20/06/2025", employment: "active", manager: "Phúc Anh", workMode: "remote", attendance: "remote", days: 20, base: 22000000, allowance: 2800000, insurance: 1700000, bonus: 1500000, avatar: "blue", photo: "tran-anh.svg" },
  { id: "lm", name: "Lê Minh", initials: "LM", email: "minh.le@example.com", role: "Content Executive", department: "Marketing", specialty: "Sáng tạo nội dung, SEO, lập kế hoạch truyền thông", start: "18/06/2025", employment: "onboarding", manager: "Minh Châu", workMode: "office", attendance: "ontime", days: 19, base: 16000000, allowance: 1900000, insurance: 1200000, bonus: 600000, avatar: "yellow", photo: "le-minh.svg" },
  { id: "pt", name: "Phạm Thảo", initials: "PT", email: "thao.pham@example.com", role: "Talent Acquisition", department: "Nhân sự", specialty: "Tuyển dụng, phỏng vấn, hội nhập nhân sự", start: "16/06/2025", employment: "active", manager: "Huy Dũng", workMode: "remote", attendance: "remote", days: 21, base: 17800000, allowance: 2300000, insurance: 1300000, bonus: 900000, avatar: "green", photo: "pham-thao.svg" },
  { id: "vl", name: "Vũ Lâm", initials: "VL", email: "lam.vu@example.com", role: "Operations Lead", department: "Vận hành", specialty: "Quản lý quy trình, vận hành hệ thống, điều phối đội nhóm", start: "12/06/2025", employment: "leave", manager: "Thu Hà", workMode: "office", attendance: "leave", days: 0, base: 20000000, allowance: 2400000, insurance: 1500000, bonus: 800000, avatar: "violet", photo: "vu-lam.svg" },
  { id: "an", name: "An Nhiên", initials: "AN", email: "nhien.an@example.com", role: "UI Designer", department: "Thiết kế", specialty: "Thiết kế giao diện và hệ thống thiết kế", start: "02/05/2024", employment: "active", manager: "Nhật Linh", workMode: "office", attendance: "ontime", days: 22, base: 17000000, allowance: 1500000, insurance: 1280000, bonus: 600000, avatar: "coral" },
  { id: "bd", name: "Bảo Duy", initials: "BD", email: "duy.bao@example.com", role: "Backend Developer", department: "Công nghệ", specialty: "API, cơ sở dữ liệu và dịch vụ backend", start: "15/03/2023", employment: "active", manager: "Phúc Anh", workMode: "remote", attendance: "remote", days: 21, base: 24000000, allowance: 2000000, insurance: 1800000, bonus: 1200000, avatar: "blue" },
  { id: "ch", name: "Chi Hân", initials: "CH", email: "han.chi@example.com", role: "Marketing Executive", department: "Marketing", specialty: "Vận hành chiến dịch và phân tích marketing", start: "11/09/2024", employment: "onboarding", manager: "Minh Châu", workMode: "office", attendance: "ontime", days: 20, base: 15500000, allowance: 1300000, insurance: 1170000, bonus: 500000, avatar: "yellow" },
  { id: "dk", name: "Đức Khánh", initials: "ĐK", email: "khanh.duc@example.com", role: "QA Engineer", department: "Công nghệ", specialty: "Kiểm thử phần mềm và đảm bảo chất lượng", start: "05/11/2022", employment: "active", manager: "Phúc Anh", workMode: "office", attendance: "late", days: 21, base: 18500000, allowance: 1600000, insurance: 1390000, bonus: 700000, avatar: "green" },
  { id: "dm", name: "Đình Minh", initials: "ĐM", email: "minh.dinh@example.com", role: "Operations Specialist", department: "Vận hành", specialty: "Điều phối vận hành và tối ưu quy trình", start: "21/01/2024", employment: "active", manager: "Thu Hà", workMode: "office", attendance: "ontime", days: 22, base: 16500000, allowance: 1400000, insurance: 1240000, bonus: 600000, avatar: "violet" },
  { id: "ga", name: "Gia An", initials: "GA", email: "an.gia@example.com", role: "HR Specialist", department: "Nhân sự", specialty: "Quy trình nhân sự và trải nghiệm nhân viên", start: "08/07/2025", employment: "onboarding", manager: "Huy Dũng", workMode: "remote", attendance: "remote", days: 18, base: 15000000, allowance: 1200000, insurance: 1130000, bonus: 400000, avatar: "green" },
  { id: "ha", name: "Hải Anh", initials: "HA", email: "anh.hai@example.com", role: "Graphic Designer", department: "Thiết kế", specialty: "Thiết kế đồ họa và nhận diện thương hiệu", start: "12/02/2022", employment: "active", manager: "Nhật Linh", workMode: "office", attendance: "ontime", days: 21, base: 16500000, allowance: 1500000, insurance: 1240000, bonus: 700000, avatar: "coral" },
  { id: "kl", name: "Khánh Linh", initials: "KL", email: "linh.khanh@example.com", role: "SEO Specialist", department: "Marketing", specialty: "SEO, nghiên cứu từ khóa và phân tích tăng trưởng", start: "09/08/2023", employment: "active", manager: "Minh Châu", workMode: "remote", attendance: "remote", days: 22, base: 17000000, allowance: 1400000, insurance: 1280000, bonus: 800000, avatar: "yellow" },
  { id: "lt", name: "Long Trần", initials: "LT", email: "tran.long@example.com", role: "DevOps Engineer", department: "Công nghệ", specialty: "Hạ tầng, triển khai liên tục và giám sát hệ thống", start: "14/04/2021", employment: "active", manager: "Phúc Anh", workMode: "remote", attendance: "remote", days: 21, base: 26000000, allowance: 2200000, insurance: 1950000, bonus: 1400000, avatar: "blue" },
  { id: "ma", name: "Mai Anh", initials: "MA", email: "anh.mai@example.com", role: "UX Researcher", department: "Thiết kế", specialty: "Nghiên cứu hành vi và kiểm thử trải nghiệm", start: "17/10/2023", employment: "active", manager: "Nhật Linh", workMode: "office", attendance: "ontime", days: 20, base: 19000000, allowance: 1700000, insurance: 1430000, bonus: 900000, avatar: "coral" },
  { id: "ng", name: "Ngọc Giang", initials: "NG", email: "giang.ngoc@example.com", role: "Recruiter", department: "Nhân sự", specialty: "Tìm kiếm ứng viên và điều phối tuyển dụng", start: "04/12/2023", employment: "active", manager: "Huy Dũng", workMode: "office", attendance: "late", days: 21, base: 15500000, allowance: 1300000, insurance: 1170000, bonus: 600000, avatar: "green" },
  { id: "ph", name: "Phúc Hưng", initials: "PH", email: "hung.phuc@example.com", role: "Full-stack Developer", department: "Công nghệ", specialty: "Phát triển ứng dụng frontend và backend", start: "22/07/2022", employment: "active", manager: "Phúc Anh", workMode: "remote", attendance: "remote", days: 22, base: 25000000, allowance: 2200000, insurance: 1880000, bonus: 1300000, avatar: "blue" },
  { id: "qa", name: "Quỳnh Anh", initials: "QA", email: "anh.quynh@example.com", role: "Social Media Executive", department: "Marketing", specialty: "Nội dung mạng xã hội và quản lý cộng đồng", start: "29/05/2024", employment: "active", manager: "Minh Châu", workMode: "office", attendance: "ontime", days: 21, base: 14500000, allowance: 1200000, insurance: 1090000, bonus: 500000, avatar: "yellow" },
  { id: "st", name: "Sơn Tùng", initials: "ST", email: "tung.son@example.com", role: "Business Operations Analyst", department: "Vận hành", specialty: "Phân tích dữ liệu và hiệu quả vận hành", start: "01/06/2022", employment: "active", manager: "Thu Hà", workMode: "remote", attendance: "remote", days: 20, base: 19500000, allowance: 1700000, insurance: 1460000, bonus: 900000, avatar: "violet" },
  { id: "th", name: "Thu Hà", initials: "TH", email: "ha.thu@example.com", role: "Operations Coordinator", department: "Vận hành", specialty: "Điều phối nguồn lực và hỗ trợ hoạt động công ty", start: "19/02/2021", employment: "leave", manager: "Minh Linh", workMode: "office", attendance: "leave", days: 0, base: 18000000, allowance: 1600000, insurance: 1350000, bonus: 700000, avatar: "violet" },
];
let employeeStorageAvailable = true;
try {
  employeeRecords.push(...parseCustomEmployeeRecords(localStorage.getItem(customEmployeeStorageKey)));
} catch (error) {
  employeeStorageAvailable = false;
  console.error("Không thể đọc hồ sơ nhân viên đã lưu.", error);
}

const employeeByCode = new Map();
const duplicateEmployeeCodes = new Set();
employeeRecords.forEach((employee) => {
  const code = employee.id.trim().toLocaleUpperCase("vi");
  if (employeeByCode.has(code) || duplicateEmployeeCodes.has(code)) {
    duplicateEmployeeCodes.add(code);
    employeeByCode.delete(code);
    return;
  }
  employeeByCode.set(code, employee);
});
if (duplicateEmployeeCodes.size > 0) {
  console.error(`Mã nhân viên bị trùng và không thể dùng đăng nhập: ${[...duplicateEmployeeCodes].join(", ")}.`);
}

function findEmployeeByCode(code) {
  return employeeByCode.get(String(code || "").trim().toLocaleUpperCase("vi")) || null;
}

const salaryRecords = Object.fromEntries(
  employeeRecords.map((employee) => [
    employee.id,
    {
      ...employee,
      role: `${employee.role} · ${employee.department}`,
      attendanceDays: employee.days,
    },
  ]),
);

function getCellValue(cell) {
  const employee = cell.querySelector(".employee-cell");
  if (!employee) {
    return cell.textContent.trim();
  }

  return Array.from(employee.querySelectorAll("strong, small"), (part) => part.textContent.trim())
    .filter(Boolean)
    .join(" — ");
}

function updateCurrentDates() {
  const currentDate = new Date();
  const standardDate = new Intl.DateTimeFormat("vi-VN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(currentDate);
  const welcomeDate = new Intl.DateTimeFormat("vi-VN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })
    .format(currentDate)
    .replace(",", "");
  const isoDate = new Intl.DateTimeFormat("en-CA").format(currentDate);

  document.querySelectorAll("[data-current-date]").forEach((dateElement) => {
    const isWelcomeDate = dateElement.dataset.currentDate === "welcome";
    dateElement.textContent = isWelcomeDate ? welcomeDate : standardDate;
    dateElement.dateTime = isoDate;
  });
}

function createEmployeeCell(employee, { includeProfile = false, includeMessage = false, includePayrollLink = false } = {}) {
  const cell = document.createElement("td");
  const wrapper = document.createElement("div");
  const identity = document.createElement("span");
  const name = document.createElement(includePayrollLink ? "a" : "strong");
  const email = document.createElement("small");

  wrapper.className = "employee-cell";
  if (includeProfile) {
    const trigger = document.createElement("button");
    const portrait = document.createElement("img");
    trigger.className = "employee-photo-trigger";
    trigger.type = "button";
    trigger.dataset.employeeProfile = employee.id;
    trigger.setAttribute("aria-label", `Xem hồ sơ ${employee.name}`);
    portrait.className = "employee-photo";
    portrait.src = `anhnv/${employee.photo || "avatar-default.svg"}`;
    portrait.alt = "";
    trigger.append(portrait);
    wrapper.append(trigger);
  } else {
    const avatar = document.createElement("span");
    avatar.className = `avatar avatar-${employee.avatar}`;
    avatar.textContent = employee.initials;
    wrapper.append(avatar);
  }

  if (includePayrollLink) {
    name.className = "table-link";
    name.href = `salary-detail.html?employee=${encodeURIComponent(employee.id)}`;
  }
  name.textContent = employee.name;
  email.textContent = `Mã NV: ${employee.id.toUpperCase()} · ${employee.email}`;
  identity.append(name, email);
  wrapper.append(identity);

  if (includeMessage) {
    const messageButton = document.createElement("button");
    messageButton.className = "employee-message-button";
    messageButton.type = "button";
    messageButton.dataset.startEmployeeMessage = employee.id;
    messageButton.setAttribute("aria-label", `Nhắn tin cho ${employee.name}`);
    messageButton.textContent = "Nhắn";
    wrapper.append(messageButton);
  }

  cell.append(wrapper);
  return cell;
}

function createStatusBadge(text, style) {
  const badge = document.createElement("span");
  badge.className = `status-badge ${style}`;
  badge.textContent = text;
  return badge;
}

function createWorkModeBadge(employee) {
  const badge = document.createElement("span");
  badge.className = `work-mode-badge ${employee.workMode}`;
  badge.textContent = employee.workMode === "remote" ? "Làm từ xa" : "Tại văn phòng";
  return badge;
}

function createEmployeeDirectoryRow(employee) {
  const row = document.createElement("tr");
  const employment = {
    active: ["Đang làm việc", "positive"],
    onboarding: ["Đang hội nhập", "warning"],
    leave: ["Đang nghỉ phép", "neutral"],
  }[employee.employment];

  row.dataset.profileEmployee = employee.id;
  row.append(createEmployeeCell(employee, { includeProfile: true }));
  [employee.role, employee.department, employee.start].forEach((value) => {
    const cell = document.createElement("td");
    cell.textContent = value;
    row.append(cell);
  });
  const statusCell = document.createElement("td");
  statusCell.append(createStatusBadge(...employment));
  row.append(statusCell);
  const managerCell = document.createElement("td");
  managerCell.textContent = employee.manager;
  row.append(managerCell);
  const workModeCell = document.createElement("td");
  workModeCell.append(createWorkModeBadge(employee));
  row.append(workModeCell);
  return row;
}

function getAttendanceDetails(employee) {
  return {
    new: {
      label: "Chưa chấm công",
      badge: "neutral",
      shift: employee.workMode === "remote" ? "Từ xa" : "Văn phòng",
      timeIn: "—",
      timeOut: "—",
      overtime: "—",
    },
    ontime: { label: "Đúng giờ", badge: "positive", shift: "Văn phòng", timeIn: "08:30", timeOut: "17:30", overtime: "0 giờ" },
    late: { label: "Đi muộn", badge: "warning", shift: "Văn phòng", timeIn: "08:48", timeOut: "17:30", overtime: "0 giờ" },
    remote: { label: "Làm từ xa", badge: "neutral", shift: "Từ xa", timeIn: "09:00", timeOut: "18:00", overtime: "0 giờ" },
    leave: { label: "Nghỉ phép", badge: "neutral", shift: "Nghỉ phép", timeIn: "—", timeOut: "—", overtime: "0 giờ" },
  }[employee.attendance];
}

function createAttendanceRow(employee) {
  const attendance = getAttendanceDetails(employee);
  const row = document.createElement("tr");
  row.dataset.attendanceEmployee = employee.id;
  row.append(createEmployeeCell(employee));
  [attendance.shift, attendance.timeIn, attendance.timeOut, attendance.overtime].forEach((value) => {
    const cell = document.createElement("td");
    cell.textContent = value;
    row.append(cell);
  });
  const statusCell = document.createElement("td");
  statusCell.append(createStatusBadge(attendance.label, attendance.badge));
  row.append(statusCell);
  return row;
}

function createPayrollRow(employee) {
  const row = document.createElement("tr");
  row.dataset.payrollEmployee = employee.id;
  row.append(createEmployeeCell(employee, { includePayrollLink: true }));
  [employee.base, employee.allowance, employee.insurance, employee.bonus].forEach((amount) => {
    const cell = document.createElement("td");
    cell.textContent = salaryCurrency.format(amount);
    row.append(cell);
  });
  const estimateCell = document.createElement("td");
  estimateCell.dataset.payrollEstimate = "";
  estimateCell.textContent = salaryCurrency.format(estimateNetSalary(employee, employee.days));
  row.append(estimateCell);
  const statusCell = document.createElement("td");
  const salaryConfigured = employee.base > 0;
  statusCell.append(
    createStatusBadge(salaryConfigured ? "Ước tính demo" : "Chưa thiết lập lương", salaryConfigured ? "neutral" : "warning"),
  );
  row.append(statusCell);
  return row;
}

function setSelectOptions(select, values) {
  const firstOption = select.options[0]?.cloneNode(true);
  select.replaceChildren();
  if (firstOption) {
    select.append(firstOption);
  }
  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.append(option);
  });
}

function initializeEmployeeData() {
  document.querySelectorAll("[data-company-headcount]").forEach((output) => {
    output.textContent = String(employeeRecords.length);
  });
  document.querySelectorAll("[data-directory-count]").forEach((output) => {
    output.textContent = String(employeeRecords.length);
  });
  document.querySelectorAll("[data-payroll-total-count]").forEach((output) => {
    output.textContent = String(employeeRecords.length);
  });

  const employmentLabels = {
    active: "Đang làm việc",
    onboarding: "Đang hội nhập",
    leave: "Đang nghỉ phép",
  };
  Object.entries(employmentLabels).forEach(([status, label]) => {
    const count = employeeRecords.filter((employee) => employee.employment === status).length;
    const share = employeeRecords.length ? Math.round((count / employeeRecords.length) * 100) : 0;
    document.querySelectorAll(`[data-employment-count="${status}"]`).forEach((output) => {
      output.textContent = String(count);
    });
    document.querySelectorAll(`[data-employment-share="${status}"]`).forEach((output) => {
      output.textContent = `${share}%`;
    });
    const filterOption = document.querySelector(`[data-filter-employment="${status}"]`);
    if (filterOption) {
      filterOption.textContent = label;
    }
  });

  const attendanceCounts = {
    onsite: employeeRecords.filter((employee) => employee.attendance === "ontime" || employee.attendance === "late").length,
    remote: employeeRecords.filter((employee) => employee.attendance === "remote").length,
    late: employeeRecords.filter((employee) => employee.attendance === "late").length,
    leave: employeeRecords.filter((employee) => employee.attendance === "leave").length,
  };
  const workingToday = attendanceCounts.onsite + attendanceCounts.remote;
  document.querySelectorAll("[data-working-today]").forEach((output) => {
    output.textContent = String(workingToday);
  });
  document.querySelectorAll("[data-working-today-share]").forEach((output) => {
    output.textContent = `${Math.round((workingToday / employeeRecords.length) * 100)}% tổng nhân sự`;
  });
  ["onsite", "remote"].forEach((mode) => {
    const count = attendanceCounts[mode];
    const share = employeeRecords.length ? Math.round((count / employeeRecords.length) * 100) : 0;
    document.querySelectorAll(`[data-attendance-count="${mode}"]`).forEach((output) => {
      output.textContent = String(count);
    });
    document.querySelectorAll(`[data-attendance-share="${mode}"]`).forEach((output) => {
      output.textContent = `${share}% tổng nhân sự`;
    });
  });
  document.querySelectorAll('[data-attendance-count="leave"]').forEach((output) => {
    output.textContent = String(attendanceCounts.leave);
  });
  document.querySelectorAll('[data-attendance-share="leave"]').forEach((output) => {
    output.textContent = `${Math.round((attendanceCounts.leave / employeeRecords.length) * 100)}% tổng nhân sự`;
  });

  const departmentCounts = new Map();
  employeeRecords.forEach((employee) => {
    departmentCounts.set(employee.department, (departmentCounts.get(employee.department) || 0) + 1);
  });

  const directory = document.querySelector("[data-employee-directory]");
  directory?.replaceChildren(...employeeRecords.map(createEmployeeDirectoryRow));
  const attendanceRows = document.querySelector("[data-attendance-rows]");
  attendanceRows?.replaceChildren(...employeeRecords.map(createAttendanceRow));
  const payrollRows = document.querySelector("[data-payroll-rows]");
  payrollRows?.replaceChildren(...employeeRecords.map(createPayrollRow));

  document.querySelectorAll("[data-filter-departments]").forEach((select) => {
    setSelectOptions(select, [...departmentCounts.keys()].sort(new Intl.Collator("vi").compare));
  });
  document.querySelectorAll("[data-filter-roles]").forEach((select) => {
    const roles = [...new Set(employeeRecords.map((employee) => employee.role))];
    setSelectOptions(select, roles.sort(new Intl.Collator("vi").compare));
  });

}

function refreshEmployeeDirectorySummary() {
  const total = employeeRecords.length;
  document.querySelectorAll("[data-company-headcount], [data-directory-count], [data-payroll-total-count]").forEach((output) => {
    output.textContent = String(total);
  });
  ["active", "onboarding", "leave"].forEach((employment) => {
    const count = employeeRecords.filter((employee) => employee.employment === employment).length;
    const share = total ? Math.round((count / total) * 100) : 0;
    document.querySelectorAll(`[data-employment-count="${employment}"]`).forEach((output) => {
      output.textContent = String(count);
    });
    document.querySelectorAll(`[data-employment-share="${employment}"]`).forEach((output) => {
      output.textContent = `${share}%`;
    });
  });
  document.querySelectorAll("[data-filter-departments]").forEach((select) => {
    setSelectOptions(select, [...new Set(employeeRecords.map((employee) => employee.department))].sort(new Intl.Collator("vi").compare));
  });
  document.querySelectorAll("[data-filter-roles]").forEach((select) => {
    setSelectOptions(select, [...new Set(employeeRecords.map((employee) => employee.role))].sort(new Intl.Collator("vi").compare));
  });
}

function initializeDashboardConnections() {
  const teamAvatars = document.querySelector("[data-dashboard-team-avatars]");
  const qrCount = document.querySelector("[data-dashboard-qr-count]");
  if (!teamAvatars && !qrCount) {
    return;
  }

  if (teamAvatars) {
    const visibleEmployees = employeeRecords.slice(0, 4);
    const avatarElements = visibleEmployees.map((employee) => {
      const portrait = document.createElement("img");
      portrait.src = `anhnv/${employee.photo || "avatar-default.svg"}`;
      portrait.alt = employee.name;
      portrait.title = employee.name;
      return portrait;
    });
    const remainingCount = employeeRecords.length - visibleEmployees.length;
    if (remainingCount > 0) {
      const allEmployeesLink = document.createElement("a");
      allEmployeesLink.href = "employees.html";
      allEmployeesLink.setAttribute("aria-label", `Xem ${remainingCount} nhân viên còn lại`);
      allEmployeesLink.textContent = `+${remainingCount}`;
      avatarElements.push(allEmployeesLink);
    }
    teamAvatars.replaceChildren(...avatarElements);
  }

  function updateQrAttendanceCount(rawValue = localStorage.getItem(qrAttendanceStorageKey)) {
    if (!qrCount) {
      return;
    }
    try {
      const today = localDateKey();
      const employeeIds = new Set(
        parseQrAttendanceRecords(rawValue)
          .filter((record) => record.date === today)
          .map((record) => record.employeeId),
      );
      qrCount.textContent = String(employeeIds.size);
    } catch (error) {
      console.error("Không thể đọc lượt chấm công QR để cập nhật trang tổng quan.", error);
      qrCount.textContent = "—";
    }
  }

  updateQrAttendanceCount();
  if (qrCount) {
    window.addEventListener("storage", (event) => {
      if (event.key === qrAttendanceStorageKey) {
        updateQrAttendanceCount(event.newValue);
      }
    });
  }
}

function initializeTableControls(controls) {
  const panel = controls.closest(".panel");
  const table = panel?.querySelector("table");
  const body = table?.tBodies[0];
  const search = controls.querySelector("[data-table-search]");
  const sort = controls.querySelector("[data-table-sort]");
  const pageSize = controls.querySelector("[data-page-size]");
  const previous = controls.querySelector("[data-page-prev]");
  const next = controls.querySelector("[data-page-next]");
  const summary = controls.querySelector("[data-pagination-summary]");

  if (!table || !body || !search || !sort || !pageSize || !previous || !next || !summary) {
    console.error("Không thể khởi tạo bảng: thiếu cấu trúc hoặc điều khiển bắt buộc.");
    return;
  }

  const filters = Array.from(controls.querySelectorAll("[data-filter-column]"));
  const collator = new Intl.Collator("vi", { sensitivity: "base", numeric: true });
  const emptyRow = document.createElement("tr");
  const emptyCell = document.createElement("td");
  let currentPage = 1;

  emptyCell.colSpan = table.tHead?.rows[0]?.cells.length || 1;
  emptyCell.textContent = "Không tìm thấy dữ liệu phù hợp.";
  emptyRow.className = "table-empty-row";
  emptyRow.hidden = true;
  emptyRow.append(emptyCell);
  body.append(emptyRow);

  function render() {
    const rows = Array.from(body.rows).filter((row) => row !== emptyRow);
    const query = normalizeText(search.value);
    const activeFilters = filters.map((filter) => ({
      column: Number(filter.dataset.filterColumn),
      value: normalizeText(filter.value),
    }));
    const direction = sort.value === "desc" ? -1 : 1;
    const filteredRows = rows.filter((row) => {
      const searchableText = normalizeText(row.textContent);
      return (
        (!query || searchableText.includes(query)) &&
        activeFilters.every(({ column, value }) => {
          if (!value) {
            return true;
          }

          const cell = row.cells[column];
          if (!cell) {
            console.error(`Không tìm thấy cột ${column + 1} trong bảng.`);
            return false;
          }

          return normalizeText(cell.textContent).includes(value);
        })
      );
    });
    const sortedRows = filteredRows.sort((first, second) => {
      const firstName = first.querySelector(".employee-cell strong")?.textContent || first.cells[0]?.textContent || "";
      const secondName = second.querySelector(".employee-cell strong")?.textContent || second.cells[0]?.textContent || "";
      return direction * collator.compare(firstName.trim(), secondName.trim());
    });
    const selectedPageSize = pageSize.value === "all" ? sortedRows.length || 1 : Number(pageSize.value);
    const totalPages = Math.max(1, Math.ceil(sortedRows.length / selectedPageSize));

    currentPage = Math.min(currentPage, totalPages);
    const firstIndex = (currentPage - 1) * selectedPageSize;
    const pageRows = sortedRows.slice(firstIndex, firstIndex + selectedPageSize);

    rows.forEach((row) => {
      row.hidden = true;
      row.dataset.filtered = "false";
    });
    pageRows.forEach((row) => {
      row.hidden = false;
    });
    sortedRows.forEach((row) => {
      row.dataset.filtered = "true";
      body.insertBefore(row, emptyRow);
    });

    emptyRow.hidden = sortedRows.length > 0;
    summary.textContent = sortedRows.length
      ? `Hiển thị ${firstIndex + 1}–${firstIndex + pageRows.length} trên ${sortedRows.length} mục`
      : "Không tìm thấy dữ liệu";
    previous.disabled = currentPage <= 1 || sortedRows.length === 0;
    next.disabled = currentPage >= totalPages || sortedRows.length === 0;
  }

  search.addEventListener("input", () => {
    currentPage = 1;
    render();
  });
  filters.forEach((filter) =>
    filter.addEventListener("change", () => {
      currentPage = 1;
      render();
    }),
  );
  sort.addEventListener("change", render);
  pageSize.addEventListener("change", () => {
    currentPage = 1;
    render();
  });
  previous.addEventListener("click", () => {
    currentPage -= 1;
    render();
  });
  next.addEventListener("click", () => {
    currentPage += 1;
    render();
  });

  const exportButton = controls.querySelector("[data-export-table]");
  exportButton?.addEventListener("click", () => {
    const headers = Array.from(table.tHead?.rows[0]?.cells || [], (cell) => cell.textContent.trim());
    const visibleRows = rows.filter((row) => row.dataset.filtered === "true");
    const csvRows = [
      headers,
      ...visibleRows.map((row) => Array.from(row.cells, getCellValue)),
    ];
    const csv = csvRows
      .map((row) => row.map((value) => `"${value.replace(/"/g, '""')}"`).join(","))
      .join("\r\n");
    const fileName = `${document.title.replace(/[^\p{L}\p{N}-]+/gu, "-") || "peoplehub"}.csv`;
    const file = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(file);
    const downloadLink = document.createElement("a");

    downloadLink.href = url;
    downloadLink.download = fileName;
    downloadLink.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  });

  render();
  return render;
}

initializeEmployeeData();
updateCurrentDates();
initializeDashboardConnections();
const tableControlRefreshers = new WeakMap();
document.querySelectorAll("[data-table-controls]").forEach((controls) => {
  const refresh = initializeTableControls(controls);
  if (refresh) {
    tableControlRefreshers.set(controls, refresh);
  }
});

function initializeEmployeeMessaging() {
  const dialog = document.querySelector("[data-employee-messages-dialog]");
  if (!dialog) {
    return;
  }

  const recipient = dialog.querySelector("[data-message-recipient]");
  const thread = dialog.querySelector("[data-message-thread]");
  const emptyMessage = dialog.querySelector("[data-message-empty]");
  const form = dialog.querySelector("[data-message-form]");
  const messageBody = dialog.querySelector("[data-message-body]");
  const status = dialog.querySelector("[data-message-status]");
  const closeButton = dialog.querySelector("[data-close-employee-messages]");
  let messages = {};
  let storageAvailable = true;

  recipient.replaceChildren(
    ...employeeRecords.map((employee) => {
      const option = document.createElement("option");
      option.value = employee.id;
      option.textContent = `${employee.name} · ${employee.email}`;
      return option;
    }),
  );

  function parseMessages(rawValue) {
    if (rawValue === null) {
      return {};
    }

    const parsedValue = JSON.parse(rawValue);
    if (parsedValue === null || typeof parsedValue !== "object" || Array.isArray(parsedValue)) {
      throw new TypeError("Dữ liệu tin nhắn đã lưu không đúng định dạng.");
    }

    Object.entries(parsedValue).forEach(([employeeId, employeeMessages]) => {
      if (!Object.hasOwn(salaryRecords, employeeId) || !Array.isArray(employeeMessages)) {
        throw new TypeError("Dữ liệu tin nhắn đã lưu có người nhận không hợp lệ.");
      }

      employeeMessages.forEach((message) => {
        if (
          message === null ||
          typeof message !== "object" ||
          message.sender !== "admin" ||
          typeof message.text !== "string" ||
          !message.text.trim() ||
          message.text.length > 1000 ||
          typeof message.sentAt !== "string" ||
          Number.isNaN(Date.parse(message.sentAt))
        ) {
          throw new TypeError("Dữ liệu tin nhắn đã lưu có nội dung không hợp lệ.");
        }
      });
    });

    return parsedValue;
  }

  function renderThread() {
    const employeeId = recipient.value;
    const employeeMessages = messages[employeeId] || [];
    thread.querySelectorAll(".message-bubble").forEach((bubble) => bubble.remove());
    emptyMessage.hidden = employeeMessages.length > 0;

    employeeMessages.forEach((message) => {
      const bubble = document.createElement("article");
      const sender = document.createElement("strong");
      const content = document.createElement("p");
      const time = document.createElement("time");

      bubble.className = "message-bubble";
      sender.textContent = "Minh Linh · Bản demo chưa gửi";
      content.textContent = message.text;
      time.dateTime = message.sentAt;
      time.textContent = new Intl.DateTimeFormat("vi-VN", {
        dateStyle: "short",
        timeStyle: "short",
      }).format(new Date(message.sentAt));
      bubble.append(sender, content, time);
      thread.append(bubble);
    });

    thread.scrollTop = thread.scrollHeight;
    status.textContent = `${employeeMessages.length} tin nhắn demo · chỉ lưu trên trình duyệt này.`;
  }

  try {
    messages = parseMessages(localStorage.getItem(employeeMessageStorageKey));
  } catch (error) {
    storageAvailable = false;
    console.error("Không thể đọc tin nhắn demo đã lưu.", error);
    status.textContent = "Không đọc được dữ liệu tin nhắn. Không thể tiếp tục lưu trên trình duyệt này.";
    messageBody.disabled = true;
    form.querySelector('button[type="submit"]').disabled = true;
  }

  recipient.addEventListener("change", renderThread);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const text = messageBody.value.trim();

    if (!storageAvailable) {
      status.textContent = "Không thể lưu tin nhắn demo vì dữ liệu hiện có không đọc được.";
      return;
    }
    if (!text) {
      status.textContent = "Nhập nội dung tin nhắn trước khi lưu.";
      messageBody.focus();
      return;
    }

    const employeeMessages = messages[recipient.value] || [];
    const updatedMessages = {
      ...messages,
      [recipient.value]: [
        ...employeeMessages,
        {
          sender: "admin",
          text,
          sentAt: new Date().toISOString(),
        },
      ],
    };

    try {
      localStorage.setItem(employeeMessageStorageKey, JSON.stringify(updatedMessages));
      messages = updatedMessages;
      messageBody.value = "";
      renderThread();
      status.textContent =
        `Đã lưu tin nhắn demo cho ${salaryRecords[recipient.value].name} trên trình duyệt này. Nhân viên chưa nhận được tin.`;
    } catch (error) {
      console.error("Không thể lưu tin nhắn demo.", error);
      status.textContent = "Không thể lưu tin nhắn. Kiểm tra quyền lưu trữ của trình duyệt rồi thử lại.";
    }
  });

  document.querySelectorAll("[data-open-employee-messages]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      dialog.showModal();
      renderThread();
      messageBody.focus();
    });
  });

  document.querySelectorAll("[data-start-employee-message]").forEach((button) => {
    button.addEventListener("click", () => {
      if (!Object.hasOwn(salaryRecords, button.dataset.startEmployeeMessage)) {
        console.error("Không tìm thấy nhân viên để mở cuộc trò chuyện.");
        return;
      }

      recipient.value = button.dataset.startEmployeeMessage;
      dialog.showModal();
      renderThread();
      messageBody.focus();
    });
  });

  closeButton.addEventListener("click", () => dialog.close());
  dialog.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      dialog.close();
    }
  });
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      dialog.close();
    }
  });
  renderThread();
}

function initializeEmployeeProfiles() {
  const dialog = document.querySelector("[data-employee-profile-dialog]");
  if (!dialog) {
    return;
  }

  const closeButton = dialog.querySelector("[data-profile-close]");
  const nameOutput = dialog.querySelector("[data-profile-name]");
  const portrait = dialog.querySelector("[data-profile-portrait]");
  const roleOutput = dialog.querySelector("[data-profile-role]");
  const specialtyOutput = dialog.querySelector("[data-profile-specialty]");
  const workModeOutput = dialog.querySelector("[data-profile-work-mode]");
  const daysOutput = dialog.querySelector("[data-profile-days]");
  const hoursOutput = dialog.querySelector("[data-profile-hours]");
  const salaryOutput = dialog.querySelector("[data-profile-salary]");
  const attendanceTotal = dialog.querySelector("[data-profile-attendance-total]");
  const attendanceRows = dialog.querySelector("[data-profile-attendance-rows]");
  const status = dialog.querySelector("[data-profile-status]");
  let savedAttendance = {};
  let attendanceAvailable = true;

  try {
    savedAttendance = parseAttendanceRecords(localStorage.getItem(attendanceStorageKey));
  } catch (error) {
    attendanceAvailable = false;
    console.error("Không thể đọc ngày công đã lưu để hiển thị hồ sơ nhân viên.", error);
    status.textContent =
      "Không đọc được ngày công đã lưu; các số liệu dưới đây dùng mức mặc định 22 ngày và chỉ mang tính minh họa.";
  }

  function showProfile(employeeId, imageSource) {
    const employee = salaryRecords[employeeId];
    if (!employee) {
      console.error(`Không tìm thấy hồ sơ nhân viên "${employeeId}".`);
      return;
    }

    const days = savedAttendance[employeeId] ?? employee.attendanceDays;
    const hoursPerDay = 8;
    nameOutput.textContent = employee.name;
    portrait.src = imageSource;
    portrait.alt = `Ảnh minh họa ${employee.name}`;
    roleOutput.textContent = employee.role;
    specialtyOutput.textContent = employee.specialty;
    workModeOutput.textContent = employee.workMode === "remote" ? "Làm từ xa" : "Làm trực tiếp tại công ty";
    workModeOutput.className = `work-mode-badge ${employee.workMode}`;
    daysOutput.textContent = String(days);
    hoursOutput.textContent = `${days * hoursPerDay} giờ`;
    salaryOutput.textContent = salaryCurrency.format(estimateNetSalary(employee, days));
    attendanceTotal.textContent = `${days} / 22 ngày công`;
    attendanceRows.replaceChildren();

    for (let day = 1; day <= 22; day += 1) {
      const attended = day <= days;
      const row = document.createElement("tr");
      const dayCell = document.createElement("td");
      const statusCell = document.createElement("td");
      const shiftCell = document.createElement("td");
      const hoursCell = document.createElement("td");

      dayCell.textContent = `Ngày công ${String(day).padStart(2, "0")}`;
      statusCell.textContent = attended ? "Có mặt" : "Không công";
      statusCell.className = attended ? "attendance-present" : "attendance-missed";
      shiftCell.textContent = attended ? "09:00–18:00" : "—";
      hoursCell.textContent = attended ? `${hoursPerDay} giờ` : "—";
      row.append(dayCell, statusCell, shiftCell, hoursCell);
      attendanceRows.append(row);
    }

    if (attendanceAvailable) {
      status.textContent =
        "Dữ liệu chỉ mang tính minh họa; mỗi ngày công được tính 8 giờ, không phải bảng chấm công hoặc bảng lương chính thức.";
    }
    dialog.showModal();
  }

  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-employee-profile]");
    if (!trigger) {
      return;
    }
    const portraitImage = trigger.querySelector("img");
    if (!portraitImage) {
      console.error("Không tìm thấy ảnh thẻ cho hồ sơ nhân viên.");
      return;
    }
    showProfile(trigger.dataset.employeeProfile, portraitImage.getAttribute("src"));
  });

  closeButton.addEventListener("click", () => dialog.close());
  dialog.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      dialog.close();
    }
  });
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      dialog.close();
    }
  });
}

function initializeEmployeeCreation() {
  const dialog = document.querySelector("[data-employee-create-dialog]");
  if (!dialog) {
    return;
  }
  const openButton = document.querySelector("[data-open-add-employee]");
  const closeButton = dialog.querySelector("[data-close-add-employee]");
  const cancelButton = dialog.querySelector("[data-cancel-add-employee]");
  const form = dialog.querySelector("[data-employee-create-form]");
  const status = dialog.querySelector("[data-employee-create-status]");
  const dateInput = form.elements.start;

  function closeDialog() {
    dialog.close();
    form.reset();
    dateInput.value = localDateKey();
    status.textContent = "";
  }

  openButton.disabled = !employeeStorageAvailable;
  if (!employeeStorageAvailable) {
    status.textContent = "Không thể đọc dữ liệu đã lưu. Hãy bật bộ nhớ trình duyệt hoặc khắc phục dữ liệu trước khi thêm hồ sơ.";
  }
  dateInput.value = localDateKey();
  openButton.addEventListener("click", () => dialog.showModal());
  closeButton.addEventListener("click", closeDialog);
  cancelButton.addEventListener("click", closeDialog);
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      closeDialog();
    }
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!employeeStorageAvailable || !form.reportValidity()) {
      return;
    }

    const formData = new FormData(form);
    const name = String(formData.get("name")).trim().replace(/\s+/g, " ");
    const email = String(formData.get("email")).trim().toLocaleLowerCase("vi");
    const role = String(formData.get("role")).trim();
    const department = String(formData.get("department"));
    const start = String(formData.get("start"));
    const employment = String(formData.get("employment"));
    const workMode = String(formData.get("workMode"));
    if (employeeRecords.some((employee) => employee.email.toLocaleLowerCase("vi") === email)) {
      status.textContent = "Email này đã được sử dụng trong danh sách nhân viên.";
      form.elements.email.focus();
      return;
    }

    const nextEmployeeNumber = employeeRecords.length + 1;
    const id = `nv-${String(nextEmployeeNumber).padStart(3, "0")}`;
    if (employeeByCode.has(id.toLocaleUpperCase("vi"))) {
      status.textContent = "Không thể tạo mã nhân viên duy nhất. Hãy tải lại trang rồi thử lại.";
      return;
    }
    const nameParts = name.split(" ");
    const initials = (nameParts.length > 1
      ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`
      : name.slice(0, 2)
    ).toLocaleUpperCase("vi");
    const [year, month, day] = start.split("-");
    const avatarColors = ["coral", "blue", "yellow", "green", "violet"];
    const employee = {
      id,
      name,
      initials,
      email,
      role,
      department,
      specialty: `${role} · ${department}`,
      start: `${day}/${month}/${year}`,
      employment,
      manager: String(formData.get("manager")).trim() || "Chưa phân công",
      workMode,
      attendance: employment === "leave" ? "leave" : "new",
      days: 0,
      base: 0,
      allowance: 0,
      insurance: 0,
      bonus: 0,
      avatar: avatarColors[(nextEmployeeNumber - 1) % avatarColors.length],
    };

    try {
      const savedEmployees = parseCustomEmployeeRecords(localStorage.getItem(customEmployeeStorageKey));
      localStorage.setItem(customEmployeeStorageKey, JSON.stringify([...savedEmployees, employee]));
    } catch (error) {
      console.error("Không thể lưu hồ sơ nhân viên mới.", error);
      status.textContent = "Không thể lưu hồ sơ. Hãy kiểm tra dung lượng và quyền lưu trữ của trình duyệt rồi thử lại.";
      return;
    }

    employeeRecords.push(employee);
    employeeByCode.set(id.toLocaleUpperCase("vi"), employee);
    salaryRecords[id] = {
      ...employee,
      role: `${employee.role} · ${employee.department}`,
      attendanceDays: employee.days,
    };
    const directory = document.querySelector("[data-employee-directory]");
    directory?.insertBefore(createEmployeeDirectoryRow(employee), directory.querySelector(".table-empty-row"));
    refreshEmployeeDirectorySummary();
    const tableControls = document.querySelector("[data-table-controls]");
    tableControlRefreshers.get(tableControls)?.();
    closeDialog();
    const successStatus = document.querySelector("[data-directory-save-status]");
    if (successStatus) {
      successStatus.textContent = `Đã thêm ${employee.name} · mã nhân viên ${id.toUpperCase()}.`;
    }
    document.querySelector("[data-open-add-employee]").focus();
  });
}

function estimateNetSalary(employee, attendanceDays) {
  const proratedBase = Math.round((employee.base * attendanceDays) / 22);
  return proratedBase + employee.allowance + employee.bonus - employee.insurance;
}

function parseAttendanceRecords(rawValue) {
  if (rawValue === null) {
    return {};
  }

  const parsedValue = JSON.parse(rawValue);
  if (parsedValue === null || typeof parsedValue !== "object" || Array.isArray(parsedValue)) {
    throw new TypeError("Dữ liệu ngày công đã lưu không đúng định dạng.");
  }

  Object.entries(parsedValue).forEach(([employeeId, days]) => {
    if (!Object.hasOwn(salaryRecords, employeeId) || !Number.isInteger(days) || days < 0 || days > 22) {
      throw new TypeError("Dữ liệu ngày công đã lưu có giá trị không hợp lệ.");
    }
  });

  return parsedValue;
}

function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseQrAttendanceRecords(rawValue) {
  if (rawValue === null) {
    return [];
  }

  const records = JSON.parse(rawValue);
  if (!Array.isArray(records)) {
    throw new TypeError("Dữ liệu lượt quét QR không đúng định dạng.");
  }

  return records.map((record) => {
    if (
      !record ||
      !Object.hasOwn(salaryRecords, record.employeeId) ||
      !/^\d{4}-\d{2}-\d{2}$/.test(record.date) ||
      !Number.isFinite(Date.parse(record.checkinAt ?? record.checkedAt)) ||
      (record.checkoutAt !== null &&
        record.checkoutAt !== undefined &&
        (!Number.isFinite(Date.parse(record.checkoutAt)) ||
          Date.parse(record.checkoutAt) < Date.parse(record.checkinAt ?? record.checkedAt)))
    ) {
      throw new TypeError("Dữ liệu lượt quét QR có bản ghi không hợp lệ.");
    }
    return {
      employeeId: record.employeeId,
      date: record.date,
      checkinAt: record.checkinAt ?? record.checkedAt,
      checkoutAt: record.checkoutAt ?? null,
    };
  });
}

function initializeQrAttendance() {
  const panel = document.querySelector(".qr-attendance-panel");
  if (!panel) {
    return;
  }

  const image = panel.querySelector("[data-attendance-qr]");
  const imageStatus = panel.querySelector("[data-qr-image-status]");
  const loginLink = panel.querySelector("[data-qr-login-link]");
  const currentEmployeeOutput = panel.querySelector("[data-qr-current-employee]");
  const scanButton = panel.querySelector("[data-start-qr-scan]");
  const stopButton = panel.querySelector("[data-stop-qr-scan]");
  const video = panel.querySelector("[data-qr-camera]");
  const scanStatus = panel.querySelector("[data-qr-scan-status]");
  const manualForm = panel.querySelector("[data-qr-manual-form]");
  const manualInput = panel.querySelector("[data-qr-code-entry]");
  const checkinBody = document.querySelector("[data-qr-checkins]");
  const qrImageUrl = new URL("https://api.qrserver.com/v1/create-qr-code/");
  qrImageUrl.searchParams.set("size", "220x220");
  qrImageUrl.searchParams.set("margin", "2");
  qrImageUrl.searchParams.set("data", demoAttendanceQrCode);
  manualInput.placeholder = demoAttendanceQrCode;

  image.addEventListener("load", () => {
    imageStatus.textContent = "";
  });
  image.addEventListener("error", () => {
    imageStatus.textContent = "Không tải được ảnh mã QR. Kiểm tra kết nối Internet rồi thử lại.";
  });
  image.src = qrImageUrl.href;

  let employee = null;
  let storedRecords = [];
  let storageAvailable = true;
  let cameraStream = null;
  let barcodeDetector = null;
  let scanning = false;

  try {
    const employeeId = sessionStorage.getItem(activeEmployeeKey) || localStorage.getItem(rememberedEmployeeKey);
    employee = findEmployeeByCode(employeeId);
    storedRecords = parseQrAttendanceRecords(localStorage.getItem(qrAttendanceStorageKey));
  } catch (error) {
    storageAvailable = false;
    console.error("Không thể đọc phiên đăng nhập hoặc lượt quét QR.", error);
    scanStatus.textContent = "Không thể đọc dữ liệu đăng nhập/chấm công từ trình duyệt. Hãy bật bộ nhớ trang web rồi thử lại.";
  }

  if (employee) {
    loginLink.href = "login.html?logout=1";
    loginLink.textContent = "Đổi tài khoản";
    currentEmployeeOutput.textContent = `${employee.name} · mã ${employee.id.toUpperCase()}`;
    scanButton.disabled = !storageAvailable;
    manualInput.disabled = !storageAvailable;
    manualForm.querySelector("button").disabled = !storageAvailable;
  } else if (storageAvailable) {
    loginLink.href = "login.html";
    loginLink.textContent = "Đăng nhập nhân viên";
    currentEmployeeOutput.textContent = "Chưa đăng nhập nhân viên";
    scanButton.disabled = true;
    manualInput.disabled = true;
    manualForm.querySelector("button").disabled = true;
    scanStatus.textContent = "Hãy đăng nhập bằng mã nhân viên và mật khẩu demo 123 trước khi quét.";
  }

  function stopCamera() {
    scanning = false;
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      cameraStream = null;
    }
    video.srcObject = null;
    video.hidden = true;
    stopButton.hidden = true;
  }

  function formatTime(value) {
    return value
      ? new Intl.DateTimeFormat("vi-VN", { hour: "2-digit", minute: "2-digit" }).format(new Date(value))
      : "—";
  }

  function formatWorkDuration(record) {
    if (!record?.checkinAt) {
      return "—";
    }
    const endTime = record.checkoutAt ? Date.parse(record.checkoutAt) : Date.now();
    const totalMinutes = Math.max(0, Math.floor((endTime - Date.parse(record.checkinAt)) / 60000));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return hours ? `${hours} giờ ${minutes} phút` : `${minutes} phút`;
  }

  function renderAttendanceTable(records) {
    const recordsByEmployee = new Map(
      records.filter((record) => record.date === localDateKey()).map((record) => [record.employeeId, record]),
    );
    document.querySelectorAll("[data-attendance-employee]").forEach((row) => {
      const employeeRecord = employeeRecords.find((entry) => entry.id === row.dataset.attendanceEmployee);
      const defaultAttendance = employeeRecord && getAttendanceDetails(employeeRecord);
      const record = recordsByEmployee.get(row.dataset.attendanceEmployee);
      if (!defaultAttendance) {
        return;
      }
      row.cells[2].textContent = record ? formatTime(record.checkinAt) : defaultAttendance.timeIn;
      row.cells[3].textContent = record ? formatTime(record.checkoutAt) : defaultAttendance.timeOut;
      row.cells[5].replaceChildren(
        record
          ? createStatusBadge(record.checkoutAt ? "Đã ra" : "Đang làm", record.checkoutAt ? "positive" : "warning")
          : createStatusBadge(defaultAttendance.label, defaultAttendance.badge),
      );
    });
  }

  function renderCheckins(records) {
    const today = localDateKey();
    const todaysRecords = records
      .filter((record) => record.date === today)
      .sort((first, second) => second.checkinAt.localeCompare(first.checkinAt));
    checkinBody.replaceChildren();

    if (todaysRecords.length === 0) {
      const row = document.createElement("tr");
      const cell = document.createElement("td");
      row.className = "table-empty-row";
      cell.colSpan = 6;
      cell.textContent = "Chưa có lượt quét QR nào hôm nay.";
      row.append(cell);
      checkinBody.append(row);
      renderAttendanceTable(records);
      return;
    }

    todaysRecords.forEach((record) => {
      const loggedEmployee = employeeRecords.find((entry) => entry.id === record.employeeId);
      const row = document.createElement("tr");
      const name = document.createElement("td");
      const id = document.createElement("td");
      const checkin = document.createElement("td");
      const checkout = document.createElement("td");
      const duration = document.createElement("td");
      const status = document.createElement("td");
      if (!loggedEmployee) {
        console.error(`Không tìm thấy hồ sơ nhân viên "${record.employeeId}" để hiển thị lượt quét QR.`);
        return;
      }
      name.textContent = loggedEmployee.name;
      id.textContent = loggedEmployee.id.toUpperCase();
      checkin.textContent = formatTime(record.checkinAt);
      checkout.textContent = formatTime(record.checkoutAt);
      duration.textContent = formatWorkDuration(record);
      status.textContent = record.checkoutAt ? "Đã ra" : "Đang làm";
      row.append(name, id, checkin, checkout, duration, status);
      checkinBody.append(row);
    });
    renderAttendanceTable(records);
  }

  function recordQrAttendance(qrValue) {
    if (qrValue !== demoAttendanceQrCode) {
      scanStatus.textContent = "Mã QR không hợp lệ. Hãy quét mã QR PeopleHub trên trang này.";
      return;
    }
    if (!employee || !storageAvailable) {
      scanStatus.textContent = "Không thể ghi nhận: hãy đăng nhập bằng tài khoản nhân viên trước.";
      return;
    }
    if (employee.employment === "leave") {
      scanStatus.textContent = "Hồ sơ demo đang ở trạng thái nghỉ phép; không thể ghi nhận ngày công.";
      return;
    }

    let previousAttendanceValue;
    let updatedAttendance;
    let updatedRecords;
    const today = localDateKey();

    try {
      previousAttendanceValue = localStorage.getItem(attendanceStorageKey);
      const savedAttendance = parseAttendanceRecords(previousAttendanceValue);
      const rawRecords = localStorage.getItem(qrAttendanceStorageKey);
      const existingRecords = parseQrAttendanceRecords(rawRecords);
      const todayRecordIndex = existingRecords.findIndex(
        (record) => record.employeeId === employee.id && record.date === today,
      );
      const now = new Date().toISOString();
      if (todayRecordIndex >= 0) {
        const todayRecord = existingRecords[todayRecordIndex];
        if (todayRecord.checkoutAt) {
          scanStatus.textContent = `Hôm nay ${employee.name} đã ghi nhận cả giờ vào và giờ ra.`;
          renderCheckins(existingRecords);
          return;
        }
        updatedRecords = existingRecords.map((record, index) =>
          index === todayRecordIndex ? { ...record, checkoutAt: now } : record,
        );
        localStorage.setItem(qrAttendanceStorageKey, JSON.stringify(updatedRecords));
        storedRecords = updatedRecords;
        renderCheckins(storedRecords);
        scanStatus.textContent = `Đã ghi nhận giờ ra lúc ${formatTime(now)}. Tổng thời gian làm hôm nay: ${formatWorkDuration(updatedRecords[todayRecordIndex])}.`;
        return;
      }

      const currentDays = savedAttendance[employee.id] ?? salaryRecords[employee.id].attendanceDays;
      if (currentDays >= 22) {
        scanStatus.textContent = "Ngày công demo đã đạt tối đa 22 ngày cho kỳ lương này; không thể ghi nhận giờ vào.";
        return;
      }

      updatedAttendance = { ...savedAttendance, [employee.id]: currentDays + 1 };
      updatedRecords = [
        ...existingRecords,
        { employeeId: employee.id, date: today, checkinAt: now, checkoutAt: null },
      ];
      localStorage.setItem(attendanceStorageKey, JSON.stringify(updatedAttendance));
      try {
        localStorage.setItem(qrAttendanceStorageKey, JSON.stringify(updatedRecords));
      } catch (error) {
        if (previousAttendanceValue === null) {
          localStorage.removeItem(attendanceStorageKey);
        } else {
          localStorage.setItem(attendanceStorageKey, previousAttendanceValue);
        }
        throw error;
      }

      storedRecords = updatedRecords;
      renderCheckins(storedRecords);
      scanStatus.textContent = `Đã ghi nhận giờ vào lúc ${formatTime(now)} cho ${employee.name}. Ngày công kỳ lương demo 06/2025: ${updatedAttendance[employee.id]}/22.`;
    } catch (error) {
      console.error("Không thể lưu lượt điểm danh QR.", error);
      scanStatus.textContent = "Không thể lưu lượt điểm danh. Kiểm tra bộ nhớ trình duyệt rồi thử lại.";
    }
  }

  async function scanCameraFrame() {
    if (!scanning) {
      return;
    }

    try {
      const detectedCodes = await barcodeDetector.detect(video);
      if (detectedCodes.length > 0) {
        const qrValue = detectedCodes[0].rawValue;
        stopCamera();
        recordQrAttendance(qrValue);
        return;
      }
      requestAnimationFrame(() => void scanCameraFrame());
    } catch (error) {
      console.error("Không thể đọc mã QR từ camera.", error);
      stopCamera();
      scanStatus.textContent = "Camera không đọc được mã QR. Kiểm tra quyền camera hoặc dùng ô nhập mã demo.";
    }
  }

  scanButton.addEventListener("click", async () => {
    if (!employee || !storageAvailable) {
      scanStatus.textContent = "Hãy đăng nhập bằng mã nhân viên trước khi quét.";
      return;
    }
    if (!("BarcodeDetector" in window) || !navigator.mediaDevices?.getUserMedia) {
      scanStatus.textContent = "Trình duyệt này chưa hỗ trợ quét QR bằng camera. Có thể nhập mã QR demo bên dưới.";
      return;
    }

    try {
      barcodeDetector = new BarcodeDetector({ formats: ["qr_code"] });
      cameraStream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: { ideal: "environment" } },
      });
      video.srcObject = cameraStream;
      video.hidden = false;
      stopButton.hidden = false;
      await video.play();
      scanning = true;
      const todayRecord = storedRecords.find((record) => record.employeeId === employee.id && record.date === localDateKey());
      scanStatus.textContent = todayRecord?.checkoutAt
        ? "Hôm nay đã đủ lượt vào và ra."
        : todayRecord
          ? "Đưa mã QR vào khung hình để ghi nhận giờ ra."
          : "Đưa mã QR vào khung hình để ghi nhận giờ vào.";
      void scanCameraFrame();
    } catch (error) {
      console.error("Không thể khởi động camera quét QR.", error);
      stopCamera();
      scanStatus.textContent = "Không thể bật camera. Cho phép truy cập camera và mở trang bằng HTTPS hoặc localhost.";
    }
  });

  stopButton.addEventListener("click", stopCamera);
  manualForm.addEventListener("submit", (event) => {
    event.preventDefault();
    recordQrAttendance(manualInput.value.trim());
    manualInput.value = "";
  });
  window.addEventListener("storage", (event) => {
    if (event.key !== qrAttendanceStorageKey) {
      return;
    }
    try {
      storedRecords = parseQrAttendanceRecords(event.newValue);
      renderCheckins(storedRecords);
    } catch (error) {
      console.error("Không thể đồng bộ lượt quét QR từ tab khác.", error);
      scanStatus.textContent = "Không thể cập nhật dữ liệu chấm công từ tab khác. Hãy tải lại trang.";
    }
  });
  window.addEventListener("pagehide", stopCamera, { once: true });
  window.setInterval(() => renderCheckins(storedRecords), 60000);
  renderCheckins(storedRecords);
}

function initializePayrollEstimates() {
  const table = document.querySelector("[data-payroll-table]");
  if (!table) {
    return;
  }

  const status = document.querySelector("[data-payroll-estimate-status]");
  let savedAttendance = {};
  try {
    savedAttendance = parseAttendanceRecords(localStorage.getItem(attendanceStorageKey));
  } catch (error) {
    console.error("Không thể đọc ngày công đã lưu để cập nhật bảng lương.", error);
    status.textContent = "Không đọc được ngày công đã lưu; bảng đang dùng ngày công demo của từng nhân viên.";
  }

  function updatePayrollRows() {
    let totalNet = 0;
    let totalInsurance = 0;
    let configuredSalaryCount = 0;

    table.querySelectorAll("[data-payroll-employee]").forEach((row) => {
      const employeeId = row.dataset.payrollEmployee;
      const employee = salaryRecords[employeeId];
      const estimateCell = row.querySelector("[data-payroll-estimate]");
      if (!employee || !estimateCell) {
        console.error("Không thể cập nhật ước tính lương: thiếu hồ sơ hoặc ô tổng nhận.");
        return;
      }

      const attendanceDays = savedAttendance[employeeId] ?? employee.attendanceDays;
      const netSalary = estimateNetSalary(employee, attendanceDays);
      estimateCell.textContent = salaryCurrency.format(netSalary);
      totalNet += netSalary;
      if (employee.base > 0) {
        totalInsurance += employee.insurance;
        configuredSalaryCount += 1;
      }
    });

    document.querySelectorAll("[data-payroll-total]").forEach((output) => {
      output.textContent = salaryCurrency.format(totalNet);
    });
    document.querySelectorAll("[data-payroll-insurance-total]").forEach((output) => {
      output.textContent = salaryCurrency.format(totalInsurance);
    });
    document.querySelectorAll("[data-payroll-average]").forEach((output) => {
      output.textContent = salaryCurrency.format(
        configuredSalaryCount ? Math.round(totalNet / configuredSalaryCount) : 0,
      );
    });
  }

  updatePayrollRows();
  window.addEventListener("storage", (event) => {
    try {
      if (event.key === attendanceStorageKey) {
        savedAttendance = parseAttendanceRecords(event.newValue);
        updatePayrollRows();
        status.textContent = "Bảng lương đã được cập nhật theo ngày công mới.";
      } else if (event.key === customEmployeeStorageKey) {
        const updatedEmployees = parseCustomEmployeeRecords(event.newValue);
        updatedEmployees.forEach((updatedEmployee) => {
          let employee = employeeRecords.find((record) => record.id === updatedEmployee.id);
          if (!employee) {
            employee = updatedEmployee;
            employeeRecords.push(employee);
            employeeByCode.set(employee.id.toLocaleUpperCase("vi"), employee);
            salaryRecords[employee.id] = {
              ...employee,
              role: `${employee.role} · ${employee.department}`,
              attendanceDays: employee.days,
            };
            table.querySelector("[data-payroll-rows]")?.append(createPayrollRow(employee));
          } else {
            Object.assign(employee, updatedEmployee);
            Object.assign(salaryRecords[updatedEmployee.id], updatedEmployee);
          }
          const row = table.querySelector(`[data-payroll-employee="${updatedEmployee.id}"]`);
          if (row) {
            [updatedEmployee.base, updatedEmployee.allowance, updatedEmployee.insurance, updatedEmployee.bonus].forEach(
              (amount, index) => {
                row.cells[index + 1].textContent = salaryCurrency.format(amount);
              },
            );
            row.cells[6].replaceChildren(
              createStatusBadge(
                updatedEmployee.base > 0 ? "Ước tính demo" : "Chưa thiết lập lương",
                updatedEmployee.base > 0 ? "neutral" : "warning",
              ),
            );
          }
        });
        refreshEmployeeDirectorySummary();
        const tableControls = document.querySelector("[data-table-controls]");
        tableControlRefreshers.get(tableControls)?.();
        updatePayrollRows();
        status.textContent = "Bảng lương đã được cập nhật theo hồ sơ nhân viên mới.";
      }
    } catch (error) {
      console.error("Không thể đồng bộ hồ sơ hoặc ngày công vào bảng lương.", error);
      status.textContent = "Không thể đồng bộ dữ liệu lương. Hãy tải lại trang để xem dữ liệu mới nhất.";
    }
  });

  if (!status.textContent) {
    status.textContent = "Ngày công thay đổi theo lượt quét QR; hồ sơ chưa có mức lương được đánh dấu “Chưa thiết lập lương”.";
  }
}

function initializeSalaryDetail() {
  const detail = document.querySelector("[data-salary-detail]");
  if (!detail) {
    return;
  }

  const employeeId = new URLSearchParams(window.location.search).get("employee");
  if (!employeeId) {
    window.location.replace("index.html");
    return;
  }

  const employee = Object.hasOwn(salaryRecords, employeeId) ? salaryRecords[employeeId] : null;
  const errorMessage = document.querySelector("[data-salary-error]");
  if (!employee) {
    detail.hidden = true;
    errorMessage.hidden = false;
    errorMessage.querySelector("[data-salary-error-message]").textContent =
      "Không tìm thấy nhân viên trong dữ liệu lương minh họa. Hãy quay lại bảng lương và chọn một nhân viên hợp lệ.";
    return;
  }

  detail.querySelector("[data-employee-name]").textContent = employee.name;
  detail.querySelector("[data-employee-initials]").textContent = employee.initials;
  detail.querySelector("[data-employee-role]").textContent = employee.role;
  detail.querySelector("[data-salary-base]").textContent = salaryCurrency.format(employee.base);
  detail.querySelector("[data-salary-allowance]").textContent = salaryCurrency.format(employee.allowance);
  detail.querySelector("[data-salary-insurance]").textContent = `− ${salaryCurrency.format(employee.insurance)}`;
  detail.querySelector("[data-salary-bonus]").textContent = salaryCurrency.format(employee.bonus);
  const customSalaryPanel = detail.querySelector("[data-custom-salary-panel]");
  const customSalaryForm = detail.querySelector("[data-custom-salary-form]");
  if (/^nv-\d{3,}$/.test(employeeId)) {
    customSalaryPanel.hidden = false;
    ["base", "allowance", "insurance", "bonus"].forEach((field) => {
      customSalaryForm.elements[field].value = String(employee[field]);
    });
  }

  const form = detail.querySelector("[data-attendance-form]");
  const daysInput = form.elements.attendanceDays;
  const saveButton = form.querySelector("[data-save-attendance]");
  const status = form.querySelector("[data-attendance-status]");
  const totalOutput = detail.querySelector("[data-salary-total]");
  const daysOutput = detail.querySelector("[data-salary-days]");
  let savedAttendance;
  let storageAvailable = true;

  try {
    savedAttendance = parseAttendanceRecords(localStorage.getItem(attendanceStorageKey));
  } catch (error) {
    storageAvailable = false;
    console.error("Không thể đọc ngày công đã lưu.", error);
    status.textContent = "Không đọc được dữ liệu ngày công đã lưu. Hãy kiểm tra bộ nhớ trình duyệt trước khi tiếp tục.";
  }

  const initialDays = storageAvailable ? (savedAttendance[employeeId] ?? employee.attendanceDays) : employee.attendanceDays;
  daysInput.value = String(initialDays);
  const attendanceManagedByQr = /^nv-\d{3,}$/.test(employeeId);
  daysInput.readOnly = attendanceManagedByQr;
  saveButton.disabled = !storageAvailable || attendanceManagedByQr;
  if (attendanceManagedByQr) {
    status.textContent = "Ngày công của nhân viên mới được ghi nhận tự động khi quét QR.";
  }

  function updateEstimate(showValidationMessage = false) {
    if (!daysInput.validity.valid || daysInput.value === "") {
      totalOutput.textContent = "—";
      daysOutput.textContent = "—";
      if (showValidationMessage) {
        status.textContent = "Nhập số ngày công nguyên từ 0 đến 22.";
      }
      return false;
    }

    const days = Number(daysInput.value);
    const estimate = estimateNetSalary(employee, days);

    daysOutput.textContent = `${days} / 22 ngày`;
    totalOutput.textContent = salaryCurrency.format(estimate);
    if (showValidationMessage) {
      status.textContent = "Bản xem trước đã cập nhật. Nhấn “Lưu ngày công” để lưu trong trình duyệt này.";
    }
    return true;
  }

  if (customSalaryForm && !customSalaryPanel.hidden) {
    const salaryStatus = customSalaryForm.querySelector("[data-custom-salary-status]");
    customSalaryForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!customSalaryForm.reportValidity()) {
        return;
      }
      const updatedSalary = Object.fromEntries(
        ["base", "allowance", "insurance", "bonus"].map((field) => [
          field,
          Number(customSalaryForm.elements[field].value),
        ]),
      );
      if (Object.values(updatedSalary).some((amount) => !Number.isSafeInteger(amount) || amount < 0)) {
        salaryStatus.textContent = "Nhập các khoản lương bằng số nguyên không âm.";
        return;
      }

      let savedEmployees;
      try {
        savedEmployees = parseCustomEmployeeRecords(localStorage.getItem(customEmployeeStorageKey));
        const employeeIndex = savedEmployees.findIndex((record) => record.id === employeeId);
        if (employeeIndex < 0) {
          throw new Error("Không tìm thấy hồ sơ nhân viên cần cập nhật.");
        }
        savedEmployees[employeeIndex] = { ...savedEmployees[employeeIndex], ...updatedSalary };
        localStorage.setItem(customEmployeeStorageKey, JSON.stringify(savedEmployees));
      } catch (error) {
        console.error("Không thể lưu thông tin lương nhân viên.", error);
        salaryStatus.textContent = "Không thể lưu thông tin lương. Kiểm tra bộ nhớ trình duyệt rồi thử lại.";
        return;
      }

      Object.assign(employee, updatedSalary);
      Object.assign(employeeRecords.find((record) => record.id === employeeId), updatedSalary);
      detail.querySelector("[data-salary-base]").textContent = salaryCurrency.format(employee.base);
      detail.querySelector("[data-salary-allowance]").textContent = salaryCurrency.format(employee.allowance);
      detail.querySelector("[data-salary-insurance]").textContent = `− ${salaryCurrency.format(employee.insurance)}`;
      detail.querySelector("[data-salary-bonus]").textContent = salaryCurrency.format(employee.bonus);
      updateEstimate();
      salaryStatus.textContent = "Đã lưu mức lương. Thu nhập ước tính được tính theo ngày công hiện tại.";
    });
  }

  daysInput.addEventListener("input", () => updateEstimate(true));
  if (attendanceManagedByQr) {
    window.addEventListener("storage", (event) => {
      if (event.key !== attendanceStorageKey) {
        return;
      }
      try {
        savedAttendance = parseAttendanceRecords(event.newValue);
        daysInput.value = String(savedAttendance[employeeId] ?? employee.attendanceDays);
        updateEstimate();
        status.textContent = "Ngày công đã được cập nhật tự động từ lượt quét QR.";
      } catch (error) {
        console.error("Không thể đồng bộ ngày công QR vào chi tiết lương.", error);
        status.textContent = "Không thể đồng bộ ngày công. Hãy tải lại trang để xem dữ liệu mới nhất.";
      }
    });
  }
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (attendanceManagedByQr) {
      status.textContent = "Ngày công nhân viên mới chỉ được ghi nhận tự động qua QR.";
      return;
    }
    if (!updateEstimate(true) || !storageAvailable) {
      if (!storageAvailable) {
        status.textContent = "Không thể lưu vì dữ liệu ngày công hiện có không đọc được.";
      }
      return;
    }

    const updatedAttendance = {
      ...savedAttendance,
      [employeeId]: Number(daysInput.value),
    };

    try {
      localStorage.setItem(attendanceStorageKey, JSON.stringify(updatedAttendance));
      savedAttendance = updatedAttendance;
      status.textContent = `Đã lưu ${daysInput.value} ngày công trên trình duyệt này.`;
    } catch (error) {
      console.error("Không thể lưu ngày công.", error);
      status.textContent = "Không thể lưu ngày công. Kiểm tra quyền truy cập bộ nhớ của trình duyệt rồi thử lại.";
    }
  });

  updateEstimate();
}

function initializeCurrentEmployeeProfile() {
  let employeeId;
  try {
    employeeId = sessionStorage.getItem(activeEmployeeKey) || localStorage.getItem(rememberedEmployeeKey);
  } catch (error) {
    console.error("Không thể đọc hồ sơ nhân viên đang đăng nhập.", error);
    return;
  }

  const employee = findEmployeeByCode(employeeId);
  if (!employee) {
    return;
  }

  document.querySelectorAll("[data-current-user-name]").forEach((element) => {
    element.textContent = employee.name;
  });
  document.querySelectorAll("[data-current-user-initials]").forEach((element) => {
    element.textContent = employee.initials;
    if (element.hasAttribute("aria-label")) {
      element.setAttribute("aria-label", `Hồ sơ ${employee.name}`);
    }
  });
  document.querySelectorAll("[data-current-user-role]").forEach((element) => {
    element.textContent = employee.role;
  });
}

initializeCurrentEmployeeProfile();
initializePayrollEstimates();
initializeSalaryDetail();
initializeEmployeeProfiles();
initializeEmployeeCreation();
initializeEmployeeMessaging();
initializeQrAttendance();

const loginForm = document.querySelector("[data-login-form]");

if (loginForm) {
  const loginStatus = loginForm.querySelector("[data-login-status]");
  const employeeIdInput = loginForm.elements.employeeId;
  const isLoggingOut = new URLSearchParams(window.location.search).get("logout") === "1";

  try {
    if (isLoggingOut) {
      localStorage.removeItem(rememberedEmployeeKey);
      localStorage.removeItem("peoplehub:auth:remembered");
      sessionStorage.removeItem(activeEmployeeKey);
      sessionStorage.removeItem("peoplehub:auth:active");
      window.history.replaceState(null, "", window.location.pathname);
    } else {
      const employeeId = sessionStorage.getItem(activeEmployeeKey) || localStorage.getItem(rememberedEmployeeKey);
      if (findEmployeeByCode(employeeId)) {
        window.location.replace("attendance.html");
      }
    }
  } catch (error) {
    console.error("Không thể kiểm tra phiên đăng nhập đã lưu.", error);
    loginStatus.textContent = "Không thể đọc trạng thái đăng nhập trong trình duyệt. Hãy bật bộ nhớ trang web rồi thử lại.";
  }

  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const rememberLogin = loginForm.elements.remember.checked;
    const employee = findEmployeeByCode(employeeIdInput.value);
    if (!employee || loginForm.elements.password.value !== "123") {
      loginStatus.textContent = "Mã nhân viên hoặc mật khẩu không đúng. Tài khoản demo dùng mật khẩu 123.";
      return;
    }

    try {
      sessionStorage.setItem(activeEmployeeKey, employee.id);
      if (rememberLogin) {
        localStorage.setItem(rememberedEmployeeKey, employee.id);
      } else {
        localStorage.removeItem(rememberedEmployeeKey);
      }
      window.location.assign("attendance.html");
    } catch (error) {
      console.error("Không thể lưu phiên đăng nhập.", error);
      try {
        sessionStorage.removeItem(activeEmployeeKey);
        localStorage.removeItem(rememberedEmployeeKey);
      } catch (cleanupError) {
        console.error("Không thể xóa trạng thái đăng nhập chưa lưu hoàn chỉnh.", cleanupError);
      }
      loginStatus.textContent = "Không thể lưu phiên đăng nhập. Hãy kiểm tra quyền truy cập bộ nhớ của trình duyệt rồi thử lại.";
    }
  });
}
