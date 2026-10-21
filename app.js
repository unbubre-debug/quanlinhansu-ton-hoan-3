const normalizeText = (value) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLocaleLowerCase("vi")
    .trim();

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

  const rows = Array.from(body.rows);
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
}

updateCurrentDates();
document.querySelectorAll("[data-table-controls]").forEach(initializeTableControls);

const salaryRecords = {
  hn: {
    name: "Hoàng Ngọc",
    initials: "HN",
    role: "Product Designer · Thiết kế",
    base: 18500000,
    allowance: 2100000,
    insurance: 1400000,
    bonus: 1000000,
  },
  ta: {
    name: "Trần Anh",
    initials: "TA",
    role: "Frontend Developer · Công nghệ",
    base: 22000000,
    allowance: 2800000,
    insurance: 1700000,
    bonus: 1500000,
  },
  lm: {
    name: "Lê Minh",
    initials: "LM",
    role: "Content Executive · Marketing",
    base: 16000000,
    allowance: 1900000,
    insurance: 1200000,
    bonus: 600000,
  },
  pt: {
    name: "Phạm Thảo",
    initials: "PT",
    role: "Talent Acquisition · Nhân sự",
    base: 17800000,
    allowance: 2300000,
    insurance: 1300000,
    bonus: 900000,
  },
};
const attendanceStorageKey = "peoplehub:salary-attendance:2025-06:v1";
const salaryCurrency = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

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
    status.textContent = "Không đọc được ngày công đã lưu; bảng đang dùng mức mặc định 22 ngày cho phần ước tính.";
  }

  table.querySelectorAll("[data-payroll-employee]").forEach((row) => {
    const employeeId = row.dataset.payrollEmployee;
    const employee = salaryRecords[employeeId];
    const estimateCell = row.querySelector("[data-payroll-estimate]");
    if (!employee || !estimateCell) {
      console.error("Không thể cập nhật ước tính lương: thiếu hồ sơ hoặc ô tổng nhận.");
      return;
    }

    const attendanceDays = savedAttendance[employeeId] ?? 22;
    estimateCell.textContent = salaryCurrency.format(estimateNetSalary(employee, attendanceDays));
  });

  if (!status.textContent) {
    status.textContent = "Thu nhập ước tính được tính theo ngày công đã lưu; mặc định 22 ngày nếu chưa cập nhật.";
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

  const initialDays = storageAvailable ? (savedAttendance[employeeId] ?? 22) : 22;
  daysInput.value = String(initialDays);
  saveButton.disabled = !storageAvailable;

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

  daysInput.addEventListener("input", () => updateEstimate(true));
  form.addEventListener("submit", (event) => {
    event.preventDefault();
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

initializePayrollEstimates();
initializeSalaryDetail();

const loginForm = document.querySelector("[data-login-form]");
const rememberedLoginKey = "peoplehub:auth:remembered";
const activeLoginKey = "peoplehub:auth:active";

if (loginForm) {
  const loginStatus = loginForm.querySelector("[data-login-status]");
  const isLoggingOut = new URLSearchParams(window.location.search).get("logout") === "1";

  try {
    if (isLoggingOut) {
      localStorage.removeItem(rememberedLoginKey);
      sessionStorage.removeItem(activeLoginKey);
      window.history.replaceState(null, "", window.location.pathname);
    } else if (
      localStorage.getItem(rememberedLoginKey) === "true" ||
      sessionStorage.getItem(activeLoginKey) === "true"
    ) {
      window.location.replace("index.html");
    }
  } catch (error) {
    console.error("Không thể kiểm tra phiên đăng nhập đã lưu.", error);
    loginStatus.textContent = "Không thể đọc trạng thái đăng nhập trong trình duyệt. Hãy bật bộ nhớ trang web rồi thử lại.";
  }

  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const rememberLogin = loginForm.elements.remember.checked;

    try {
      sessionStorage.setItem(activeLoginKey, "true");
      if (rememberLogin) {
        localStorage.setItem(rememberedLoginKey, "true");
      } else {
        localStorage.removeItem(rememberedLoginKey);
      }
      window.location.assign("index.html");
    } catch (error) {
      console.error("Không thể lưu phiên đăng nhập.", error);
      try {
        sessionStorage.removeItem(activeLoginKey);
        localStorage.removeItem(rememberedLoginKey);
      } catch (cleanupError) {
        console.error("Không thể xóa trạng thái đăng nhập chưa lưu hoàn chỉnh.", cleanupError);
      }
      loginStatus.textContent = "Không thể lưu phiên đăng nhập. Hãy kiểm tra quyền truy cập bộ nhớ của trình duyệt rồi thử lại.";
    }
  });
}
