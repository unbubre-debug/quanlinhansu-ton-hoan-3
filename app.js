      "use strict";

      const palette = ["#2563eb", "#16a36a", "#e59a22", "#805ad5", "#0891b2", "#db4e8a"];
      const currency = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
      const dateFormatter = new Intl.DateTimeFormat("vi-VN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
      const monthFormatter = new Intl.DateTimeFormat("vi-VN", { month: "long", year: "numeric" });
      const shortMonthFormatter = new Intl.DateTimeFormat("vi-VN", { month: "short" });
      const today = new Date();

      // Demo data is local to this dashboard and can be replaced by an HR API later.
      const employees = [
        { id: "NV001", name: "Nguyễn Minh Anh", department: "Marketing", role: "Marketing Manager", base: 28000000, start: new Date(today.getFullYear() - 2, 2, 14) },
        { id: "NV002", name: "Trần Hoàng Nam", department: "Công nghệ", role: "Frontend Developer", base: 24000000, start: new Date(today.getFullYear() - 1, 5, 5) },
        { id: "NV003", name: "Lê Thu Hà", department: "Nhân sự", role: "Chuyên viên nhân sự", base: 18000000, start: new Date(today.getFullYear() - 1, 0, 8) },
        { id: "NV004", name: "Phạm Đức Long", department: "Công nghệ", role: "Backend Developer", base: 30000000, start: new Date(today.getFullYear() - 3, 10, 22) },
        { id: "NV005", name: "Đỗ Minh Quân", department: "Kinh doanh", role: "Chuyên viên kinh doanh", base: 20000000, start: new Date(today.getFullYear() - 1, 8, 18) },
        { id: "NV006", name: "Nguyễn Hải Yến", department: "Thiết kế", role: "Product Designer", base: 22500000, start: new Date(today.getFullYear() - 1, 6, 1) },
        { id: "NV007", name: "Vũ Thanh Tùng", department: "Vận hành", role: "Trưởng nhóm vận hành", base: 27000000, start: new Date(today.getFullYear() - 4, 1, 10) },
        { id: "NV008", name: "Bùi Khánh Linh", department: "Marketing", role: "Content Executive", base: 16500000, start: new Date(today.getFullYear(), today.getMonth(), 5) },
        { id: "NV009", name: "Hoàng Nhật Minh", department: "Công nghệ", role: "QA Engineer", base: 19500000, start: new Date(today.getFullYear(), today.getMonth(), 12) },
        { id: "NV010", name: "Phan Ngọc Mai", department: "Nhân sự", role: "Talent Acquisition", base: 19000000, start: new Date(today.getFullYear() - 3, 9, 3) },
        { id: "NV011", name: "Đặng Quỳnh Chi", department: "Kinh doanh", role: "Chuyên viên kinh doanh", base: 21000000, start: new Date(today.getFullYear() - 2, 7, 19) },
        { id: "NV012", name: "Lý Gia Hân", department: "Thiết kế", role: "UI Designer", base: 20500000, start: new Date(today.getFullYear() - 1, 10, 2) },
      ];

      const departmentDefaults = {
        "Marketing": ["marketing", "marketing@hrm.vn", "0901 000 001", 1800000, 1000000],
        "Công nghệ": ["tech", "congnghe@hrm.vn", "0901 000 002", 2500000, 1500000],
        "Nhân sự": ["hr", "nhansu@hrm.vn", "0901 000 003", 1500000, 800000],
        "Kinh doanh": ["sales", "kinhdoanh@hrm.vn", "0901 000 004", 2200000, 1800000],
        "Thiết kế": ["design", "thietke@hrm.vn", "0901 000 005", 1800000, 1000000],
        "Vận hành": ["operations", "vanhanh@hrm.vn", "0901 000 006", 1600000, 1000000],
      };
      employees.forEach((employee, index) => {
        const defaults = departmentDefaults[employee.department];
        employee.email = `${employee.id.toLowerCase()}@hrm.vn`;
        employee.phone = defaults[2].replace(/(\d{3})$/, String(index + 1).padStart(3, "0"));
        employee.status = "active";
        employee.allowance = defaults[3];
        employee.bonus = defaults[4];
        employee.leaveBalance = 12;
        employee.avatarColor = defaults[0];
      });

      function dateAt(dayOffset) {
        const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + dayOffset);
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
      }

      const leaveRequests = [
        { employeeId: "NV003", type: "Phép năm", from: dateAt(1), to: dateAt(1), status: "Đã duyệt" },
        { employeeId: "NV005", type: "Việc riêng", from: dateAt(3), to: dateAt(4), status: "Chờ duyệt" },
        { employeeId: "NV006", type: "Phép năm", from: dateAt(3), to: dateAt(3), status: "Đã duyệt" },
        { employeeId: "NV002", type: "Nghỉ ốm", from: dateAt(8), to: dateAt(9), status: "Đã duyệt" },
        { employeeId: "NV010", type: "Phép năm", from: dateAt(12), to: dateAt(12), status: "Chờ duyệt" },
        { employeeId: "NV001", type: "Phép năm", from: dateAt(17), to: dateAt(18), status: "Đã duyệt" },
      ];
      leaveRequests.forEach((request, index) => {
        request.id = `LEAVE-DEMO-${index + 1}`;
        request.reason = request.reason || "Đơn nghỉ phép đã gửi.";
      });

      const activityItems = [
        { icon: "♙", color: "blue", title: "Thêm nhân viên mới", detail: "Gia nhập đội Marketing", employee: "Bùi Khánh Linh", time: "09:15" },
        { icon: "✓", color: "green", title: "Đã duyệt đơn nghỉ phép", detail: "Nghỉ phép năm", employee: "Lê Thu Hà", time: "08:42" },
        { icon: "₫", color: "purple", title: "Hoàn tất tính lương", detail: "Kỳ lương tháng hiện tại", employee: "Toàn công ty", time: "Hôm qua" },
        { icon: "◷", color: "amber", title: "Cập nhật chấm công", detail: "21 ngày công", employee: "Trần Hoàng Nam", time: "Hôm qua" },
      ];

      const state = {
        calendarMonth: new Date(today.getFullYear(), today.getMonth(), 1),
        selectedDay: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
      };

      const formatCurrency = (amount) => `${currency.format(Math.round(amount))} ₫`;
      const dateKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      const sameDate = (first, second) => dateKey(first) === dateKey(second);
      const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
      })[character]);

      function countLeaveDays(request) {
        return Math.round((request.to - request.from) / 86400000) + 1;
      }

      function getLeavesForDay(date) {
        return leaveRequests.filter((request) =>
          request.status !== "Từ chối" && date >= request.from && date <= request.to,
        );
      }

      function renderStats() {
        const monthHires = employees.filter((employee) =>
          employee.start.getFullYear() === today.getFullYear() && employee.start.getMonth() === today.getMonth(),
        ).length;
        const monthlyPayroll = employees.reduce((sum, employee) => sum + employee.base, 0);
        const pendingCount = leaveRequests.filter((request) => request.status === "Chờ duyệt").length;
        document.querySelector("[data-stat-headcount]").textContent = String(employees.length);
        document.querySelector("[data-stat-new-hires]").textContent = String(monthHires);
        document.querySelector("[data-stat-payroll]").textContent = formatCurrency(monthlyPayroll);
        document.querySelector("[data-stat-pending]").textContent = String(pendingCount);
        document.querySelector("[data-pending-badge]").textContent = String(pendingCount);
      }

      function renderSalaryChart() {
        const container = document.querySelector("[data-salary-chart]");
        const currentPayroll = employees.reduce((sum, employee) => sum + employee.base, 0);
        const monthlyFactors = [0.88, 0.91, 0.94, 0.97, 1.02, 1];
        const values = monthlyFactors.map((factor) => Math.round(currentPayroll * factor));
        const maximum = 500000000;
        container.innerHTML = values.map((value, index) => {
          const month = new Date(today.getFullYear(), today.getMonth() - (values.length - index - 1), 1);
          const height = Math.max(5, Math.min(100, (value / maximum) * 100));
          return `<div class="bar-group ${index === values.length - 1 ? "current" : ""}" title="${formatCurrency(value)}"><span class="bar-value">${currency.format(Math.round(value / 1000000))}</span><span class="bar" style="--bar-height:${height}%"></span><span class="bar-month">${shortMonthFormatter.format(month).replace(".", "")}</span></div>`;
        }).join("");
      }

      function renderDepartmentChart() {
        const counts = new Map();
        employees.forEach((employee) => counts.set(employee.department, (counts.get(employee.department) || 0) + 1));
        const departments = [...counts.entries()].sort((first, second) => second[1] - first[1]);
        let currentPercent = 0;
        const stops = departments.map(([department, count], index) => {
          const start = currentPercent;
          currentPercent += (count / employees.length) * 100;
          return `${palette[index % palette.length]} ${start.toFixed(2)}% ${currentPercent.toFixed(2)}%`;
        });
        document.querySelector("[data-donut]").style.background = stops.length
          ? `conic-gradient(${stops.join(", ")})`
          : "var(--border)";
        document.querySelector("[data-donut-total]").textContent = String(employees.length);
        document.querySelector("[data-donut-chart]").setAttribute(
          "aria-label",
          `Biểu đồ tròn phân bố ${employees.length} nhân viên theo ${departments.length} phòng ban`,
        );
        document.querySelector("[data-department-legend]").innerHTML = departments.map(([department, count], index) =>
          `<div class="legend-row"><span class="legend-swatch" style="--legend-color:${palette[index % palette.length]}"></span><span class="legend-name">${escapeHtml(department)}</span><span class="legend-count">${count}</span></div>`,
        ).join("");
      }

      function renderActivities() {
        document.querySelector("[data-activity-table]").innerHTML = activityItems.map((item) =>
          `<tr><td><div class="activity-type"><span class="activity-icon ${item.color}" aria-hidden="true">${item.icon}</span><span class="activity-copy"><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.detail)}</small></span></div></td><td>${escapeHtml(item.employee)}</td><td><span class="activity-time">${escapeHtml(item.time)}</span></td></tr>`,
        ).join("");
      }

      function renderSelectedDay() {
        const selected = state.selectedDay;
        const requests = getLeavesForDay(selected);
        document.querySelector("[data-selected-date]").textContent = new Intl.DateTimeFormat("vi-VN", {
          weekday: "long", day: "numeric", month: "long", year: "numeric",
        }).format(selected);
        const container = document.querySelector("[data-selected-leaves]");
        container.innerHTML = requests.length
          ? requests.map((request) => {
            const employee = employees.find((record) => record.id === request.employeeId);
            if (!employee) return "";
            return `<span class="leave-chip">${escapeHtml(employee.name)} <span>· ${escapeHtml(request.type)}</span></span>`;
          }).join("")
          : '<p class="calendar-empty">Không có nhân viên nghỉ trong ngày này.</p>';
      }

      function renderCalendar() {
        const year = state.calendarMonth.getFullYear();
        const month = state.calendarMonth.getMonth();
        document.querySelector("[data-calendar-month]").textContent = monthFormatter.format(state.calendarMonth);
        const grid = document.querySelector("[data-calendar-grid]");
        const weekdays = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
        const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const cellCount = Math.ceil((firstWeekday + daysInMonth) / 7) * 7;
        const cells = weekdays.map((day) => `<span class="weekday" role="columnheader">${day}</span>`);

        for (let cellIndex = 0; cellIndex < cellCount; cellIndex += 1) {
          const dayNumber = cellIndex - firstWeekday + 1;
          if (dayNumber < 1 || dayNumber > daysInMonth) {
            cells.push('<span class="calendar-day empty" aria-hidden="true"></span>');
            continue;
          }
          const date = new Date(year, month, dayNumber);
          const leaves = getLeavesForDay(date);
          const classes = [
            "calendar-day",
            sameDate(date, today) ? "today" : "",
            leaves.length ? "has-leave" : "",
            sameDate(date, state.selectedDay) ? "selected" : "",
          ].filter(Boolean).join(" ");
          const accessibleDate = new Intl.DateTimeFormat("vi-VN", { day: "numeric", month: "long" }).format(date);
          cells.push(`<button class="${classes}" type="button" role="gridcell" data-calendar-day="${dayNumber}" aria-label="${accessibleDate}${leaves.length ? `, ${leaves.length} lượt nghỉ phép` : ""}" aria-pressed="${sameDate(date, state.selectedDay)}">${dayNumber}${leaves.length ? '<span class="day-indicator" aria-hidden="true"></span>' : ""}</button>`);
        }
        grid.innerHTML = cells.join("");
        renderSelectedDay();
      }

      function initializeTheme() {
        const root = document.documentElement;
        const button = document.querySelector("[data-theme-toggle]");
        try {
          if (localStorage.getItem("hrm-dashboard-theme") === "dark") root.dataset.theme = "dark";
        } catch (error) {
          console.error("Không thể đọc giao diện đã lưu.", error);
        }
        const updateButton = () => {
          const dark = root.dataset.theme === "dark";
          document.querySelector("[data-theme-icon]").textContent = dark ? "☀" : "☾";
          button.setAttribute("aria-label", dark ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối");
        };
        updateButton();
        button.addEventListener("click", () => {
          root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
          updateButton();
          try {
            localStorage.setItem("hrm-dashboard-theme", root.dataset.theme);
          } catch (error) {
            console.error("Không thể lưu giao diện đã chọn.", error);
          }
        });
      }

      function initializeSidebar() {
        const sidebar = document.querySelector("#app-sidebar");
        const toggle = document.querySelector("[data-toggle-sidebar]");
        const close = () => {
          sidebar.classList.remove("open");
          document.body.classList.remove("menu-open");
          toggle.setAttribute("aria-expanded", "false");
        };
        toggle.addEventListener("click", () => {
          const open = sidebar.classList.toggle("open");
          document.body.classList.toggle("menu-open", open);
          toggle.setAttribute("aria-expanded", String(open));
        });
        document.querySelector("[data-close-sidebar]").addEventListener("click", close);
        document.addEventListener("keydown", (event) => { if (event.key === "Escape") close(); });
        const collapseButton = document.querySelector("[data-collapse-sidebar]");
        collapseButton.addEventListener("click", () => {
          document.body.classList.toggle("sidebar-collapsed");
          const collapsed = document.body.classList.contains("sidebar-collapsed");
          collapseButton.setAttribute("aria-label", collapsed ? "Mở rộng thanh điều hướng" : "Thu gọn thanh điều hướng");
          collapseButton.title = collapsed ? "Mở rộng menu" : "Thu gọn menu";
          collapseButton.textContent = collapsed ? "›" : "‹";
        });
      }

      function initializeCalendar() {
        document.querySelector("[data-calendar-grid]").addEventListener("click", (event) => {
          const button = event.target.closest("[data-calendar-day]");
          if (!button) return;
          state.selectedDay = new Date(
            state.calendarMonth.getFullYear(),
            state.calendarMonth.getMonth(),
            Number(button.dataset.calendarDay),
          );
          renderCalendar();
        });
        document.querySelector("[data-previous-month]").addEventListener("click", () => {
          state.calendarMonth = new Date(state.calendarMonth.getFullYear(), state.calendarMonth.getMonth() - 1, 1);
          state.selectedDay = new Date(state.calendarMonth.getFullYear(), state.calendarMonth.getMonth(), 1);
          renderCalendar();
        });
        document.querySelector("[data-next-month]").addEventListener("click", () => {
          state.calendarMonth = new Date(state.calendarMonth.getFullYear(), state.calendarMonth.getMonth() + 1, 1);
          state.selectedDay = new Date(state.calendarMonth.getFullYear(), state.calendarMonth.getMonth(), 1);
          renderCalendar();
        });
      }

      function initializeDashboard() {
        document.querySelector("[data-current-date]").textContent = dateFormatter.format(today);
        initializeTheme();
        initializeSidebar();
        initializeCalendar();
        renderStats();
        renderSalaryChart();
        renderDepartmentChart();
        renderActivities();
        renderCalendar();
      }

      const moduleState = {
        employeePage: 1,
        pageSize: 8,
        attendance: {},
        payrollRows: null,
        toastTimer: null,
      };
      const routeTitles = {
        dashboard: "Tổng quan",
        employees: "Nhân viên",
        attendance: "Chấm công",
        leave: "Nghỉ phép",
        payroll: "Tiền lương",
        reports: "Báo cáo",
      };
      const statusLabels = { active: "Đang làm việc", probation: "Thử việc", inactive: "Đã nghỉ" };
      const statusClasses = { active: "status-active", probation: "status-probation", inactive: "status-inactive" };
      const leaveStatus = { "Chờ duyệt": "pending", "Đã duyệt": "approved", "Từ chối": "rejected" };

      function showToast(message) {
        const toast = document.querySelector("[data-toast]");
        toast.textContent = message;
        toast.classList.add("visible");
        window.clearTimeout(moduleState.toastTimer);
        moduleState.toastTimer = window.setTimeout(() => toast.classList.remove("visible"), 2800);
      }

      function persistModuleData() {
        try {
          localStorage.setItem("hrm-employees", JSON.stringify(employees.map((employee) => ({
            ...employee,
            start: dateKey(new Date(employee.start)),
          }))));
          localStorage.setItem("hrm-leaves", JSON.stringify(leaveRequests.map((request) => ({
            ...request,
            from: dateKey(new Date(request.from)),
            to: dateKey(new Date(request.to)),
          }))));
          localStorage.setItem("hrm-attendance", JSON.stringify(moduleState.attendance));
        } catch (error) {
          console.error("Không thể lưu dữ liệu HRM trên thiết bị.", error);
          showToast("Không thể lưu dữ liệu. Vui lòng kiểm tra dung lượng trình duyệt.");
        }
      }

      function restoreModuleData() {
        try {
          const storedEmployees = localStorage.getItem("hrm-employees");
          const storedLeaves = localStorage.getItem("hrm-leaves");
          const storedAttendance = localStorage.getItem("hrm-attendance");
          if (storedEmployees) {
            const records = JSON.parse(storedEmployees);
            if (Array.isArray(records)) {
              employees.splice(0, employees.length, ...records.map((employee) => ({
                ...employee,
                start: new Date(`${String(employee.start).slice(0, 10)}T00:00:00`),
              })));
            }
          }
          if (storedLeaves) {
            const records = JSON.parse(storedLeaves);
            if (Array.isArray(records)) {
              leaveRequests.splice(0, leaveRequests.length, ...records.map((request) => ({
                ...request,
                from: new Date(`${String(request.from).slice(0, 10)}T00:00:00`),
                to: new Date(`${String(request.to).slice(0, 10)}T00:00:00`),
              })));
            }
          }
          if (storedAttendance) {
            const records = JSON.parse(storedAttendance);
            if (records && typeof records === "object" && !Array.isArray(records)) moduleState.attendance = records;
          }
        } catch (error) {
          console.error("Không thể khôi phục dữ liệu HRM đã lưu.", error);
          showToast("Dữ liệu đã lưu không hợp lệ; đang sử dụng dữ liệu mẫu.");
        }
      }

      function routeTo(route) {
        const page = routeTitles[route] ? route : "dashboard";
        document.querySelectorAll("[data-page]").forEach((section) => {
          section.hidden = section.dataset.page !== page;
        });
        document.querySelectorAll("[data-route]").forEach((link) => {
          const active = link.dataset.route === page;
          link.classList.toggle("active", active);
          if (active) link.setAttribute("aria-current", "page");
          else link.removeAttribute("aria-current");
        });
        document.querySelector("[data-route-title]").textContent = routeTitles[page];
        document.title = `${routeTitles[page]} · HRM System`;
        if (page === "employees") renderEmployees();
        if (page === "attendance") renderAttendance();
        if (page === "leave") renderLeaveRequests();
        if (page === "reports") renderReports();
        document.querySelector("#app-sidebar").classList.remove("open");
        document.body.classList.remove("menu-open");
        document.querySelector("[data-toggle-sidebar]").setAttribute("aria-expanded", "false");
      }

      function initials(name) {
        return name.trim().split(/\s+/).slice(-2).map((part) => part[0]).join("").toUpperCase();
      }

      function formatDate(date) {
        return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
      }

      function renderEmployees() {
        const departmentSelect = document.querySelector("[data-department-filter]");
        const currentDepartment = departmentSelect.value;
        const departments = [...new Set(employees.map((employee) => employee.department))].sort((a, b) => a.localeCompare(b, "vi"));
        departmentSelect.innerHTML = '<option value="">Tất cả phòng ban</option>' +
          departments.map((department) => `<option value="${escapeHtml(department)}">${escapeHtml(department)}</option>`).join("");
        departmentSelect.value = departments.includes(currentDepartment) ? currentDepartment : "";

        const query = document.querySelector("[data-employee-search]").value.trim().toLocaleLowerCase("vi");
        const status = document.querySelector("[data-status-filter]").value;
        const filtered = employees.filter((employee) =>
          `${employee.name} ${employee.id}`.toLocaleLowerCase("vi").includes(query) &&
          (!departmentSelect.value || employee.department === departmentSelect.value) &&
          (!status || employee.status === status),
        ).sort((a, b) => a.name.localeCompare(b.name, "vi"));
        const pages = Math.max(1, Math.ceil(filtered.length / moduleState.pageSize));
        moduleState.employeePage = Math.min(moduleState.employeePage, pages);
        const startIndex = (moduleState.employeePage - 1) * moduleState.pageSize;
        const pageRecords = filtered.slice(startIndex, startIndex + moduleState.pageSize);
        document.querySelector("[data-employee-record-count]").textContent = `${filtered.length} nhân viên`;
        document.querySelector("[data-employee-pagination]").textContent = filtered.length
          ? `Hiển thị ${startIndex + 1}–${Math.min(startIndex + moduleState.pageSize, filtered.length)} trong ${filtered.length} nhân viên`
          : "Không có nhân viên phù hợp";
        document.querySelector("[data-employee-prev]").disabled = moduleState.employeePage <= 1;
        document.querySelector("[data-employee-next]").disabled = moduleState.employeePage >= pages;
        document.querySelector("[data-employee-rows]").innerHTML = pageRecords.length ? pageRecords.map((employee) =>
          `<tr><td><div class="person-cell"><span class="person-avatar tone-${escapeHtml(employee.avatarColor || "blue")}">${escapeHtml(initials(employee.name))}</span><span><strong>${escapeHtml(employee.name)}</strong><small>${escapeHtml(employee.email || "")}</small></span></div></td><td><span class="employee-code">${escapeHtml(employee.id)}</span></td><td>${escapeHtml(employee.department)}</td><td>${escapeHtml(employee.role)}</td><td>${formatDate(new Date(employee.start))}</td><td class="money-cell">${formatCurrency(employee.base)}</td><td><span class="status-pill ${statusClasses[employee.status] || statusClasses.active}">${statusLabels[employee.status] || statusLabels.active}</span></td><td><div class="row-actions"><button class="row-action" type="button" title="Sửa nhân viên" aria-label="Sửa ${escapeHtml(employee.name)}" data-edit-employee="${escapeHtml(employee.id)}">✎</button><button class="row-action delete-action" type="button" title="Xóa nhân viên" aria-label="Xóa ${escapeHtml(employee.name)}" data-delete-employee="${escapeHtml(employee.id)}">×</button></div></td></tr>`,
        ).join("") : '<tr><td colspan="8" class="empty-cell">Không tìm thấy nhân viên.</td></tr>';
      }

      function openEmployeeDialog(employee) {
        const dialog = document.querySelector("[data-employee-dialog]");
        const form = document.querySelector("[data-employee-form]");
        form.reset();
        document.querySelector("[data-employee-error]").textContent = "";
        document.querySelector("#employee-dialog-title").textContent = employee ? "Chỉnh sửa nhân viên" : "Thêm nhân viên";
        form.elements.id.readOnly = Boolean(employee);
        if (employee) {
          Object.entries(employee).forEach(([key, value]) => {
            if (form.elements[key]) form.elements[key].value = key === "start" ? dateKey(new Date(value)) : value;
          });
        } else {
          form.elements.start.value = dateKey(today);
          form.elements.status.value = "active";
        }
        dialog.dataset.editing = employee ? employee.id : "";
        dialog.showModal();
      }

      function saveEmployee(event) {
        event.preventDefault();
        const form = event.currentTarget;
        const data = new FormData(form);
        const errorBox = document.querySelector("[data-employee-error]");
        const id = String(data.get("id")).trim().toUpperCase();
        const email = String(data.get("email")).trim().toLowerCase();
        const editingId = form.closest("dialog").dataset.editing;
        const duplicateId = employees.some((employee) => employee.id.toLowerCase() === id.toLowerCase() && employee.id !== editingId);
        const duplicateEmail = employees.some((employee) => employee.email.toLowerCase() === email && employee.id !== editingId);
        if (duplicateId || duplicateEmail) {
          errorBox.textContent = duplicateId ? "Mã nhân viên đã tồn tại." : "Email này đã được sử dụng.";
          return;
        }
        const record = {
          id,
          name: String(data.get("name")).trim(),
          email,
          phone: String(data.get("phone")).trim(),
          department: String(data.get("department")),
          role: String(data.get("role")).trim(),
          start: new Date(`${data.get("start")}T00:00:00`),
          base: Number(data.get("base")),
          status: String(data.get("status")),
          allowance: departmentDefaults[String(data.get("department"))]?.[3] || 1500000,
          bonus: departmentDefaults[String(data.get("department"))]?.[4] || 1000000,
          leaveBalance: 12,
          avatarColor: departmentDefaults[String(data.get("department"))]?.[0] || "blue",
        };
        const index = employees.findIndex((employee) => employee.id === editingId);
        if (index >= 0) {
          record.leaveBalance = employees[index].leaveBalance;
          record.allowance = employees[index].allowance;
          record.bonus = employees[index].bonus;
          employees[index] = record;
          showToast("Đã cập nhật hồ sơ nhân viên.");
        } else {
          employees.push(record);
          showToast("Đã thêm nhân viên mới.");
        }
        persistModuleData();
        form.closest("dialog").close();
        moduleState.employeePage = 1;
        refreshDashboard();
        renderEmployees();
        renderAttendance();
        renderLeaveRequests();
        renderReports();
        if (moduleState.payrollRows) calculatePayroll();
      }

      function employeeFromButton(event, attribute) {
        const button = event.target.closest(`[${attribute}]`);
        if (!button) return null;
        return employees.find((employee) => employee.id === button.getAttribute(attribute));
      }

      function periodKey(month, year) {
        return `${year}-${String(month).padStart(2, "0")}`;
      }

      function getAttendance(employee, key) {
        if (!moduleState.attendance[key]) moduleState.attendance[key] = {};
        if (!moduleState.attendance[key][employee.id]) {
          moduleState.attendance[key][employee.id] = { days: employee.status === "inactive" ? 0 : 22, overtime: employee.status === "inactive" ? 0 : 4 };
        }
        return moduleState.attendance[key][employee.id];
      }

      function renderAttendance() {
        const month = Number(document.querySelector("[data-attendance-month]").value) || today.getMonth() + 1;
        const year = Number(document.querySelector("[data-attendance-year]").value) || today.getFullYear();
        const key = periodKey(month, year);
        const active = employees.filter((employee) => employee.status !== "inactive");
        const records = active.map((employee) => ({ employee, attendance: getAttendance(employee, key) }));
        document.querySelector("[data-attendance-staff]").textContent = String(active.length);
        document.querySelector("[data-attendance-days]").textContent = records.reduce((sum, row) => sum + Number(row.attendance.days), 0).toFixed(1);
        document.querySelector("[data-attendance-overtime]").textContent = `${records.reduce((sum, row) => sum + Number(row.attendance.overtime), 0).toFixed(1)} giờ`;
        document.querySelector("[data-attendance-rows]").innerHTML = records.length ? records.map(({ employee, attendance }) =>
          `<tr><td><div class="person-cell"><span class="person-avatar tone-${escapeHtml(employee.avatarColor || "blue")}">${escapeHtml(initials(employee.name))}</span><span><strong>${escapeHtml(employee.name)}</strong><small>${escapeHtml(employee.id)}</small></span></div></td><td>${escapeHtml(employee.department)}</td><td><label class="attendance-input"><input type="number" min="0" max="31" step="0.5" value="${Number(attendance.days)}" aria-label="Ngày công ${escapeHtml(employee.name)}" data-attendance-value="days" data-employee-id="${escapeHtml(employee.id)}"></label><span class="input-suffix">ngày</span></td><td><label class="attendance-input"><input type="number" min="0" max="200" step="0.5" value="${Number(attendance.overtime)}" aria-label="Tăng ca ${escapeHtml(employee.name)}" data-attendance-value="overtime" data-employee-id="${escapeHtml(employee.id)}"></label><span class="input-suffix">giờ</span></td><td><span class="status-pill status-active">Đã ghi nhận</span></td></tr>`,
        ).join("") : '<tr><td colspan="5" class="empty-cell">Chưa có nhân viên đang làm việc.</td></tr>';
      }

      function renderLeaveRequests() {
        const filter = document.querySelector("[data-leave-filter]").value;
        const ordered = leaveRequests.slice().sort((a, b) => {
          const statusOrder = { "Chờ duyệt": 0, "Đã duyệt": 1, "Từ chối": 2 };
          return statusOrder[a.status] - statusOrder[b.status] || a.from - b.from;
        }).filter((request) => !filter || leaveStatus[request.status] === filter);
        const pending = leaveRequests.filter((request) => request.status === "Chờ duyệt").length;
        const approved = leaveRequests.filter((request) => request.status === "Đã duyệt").length;
        const average = employees.length ? employees.reduce((sum, employee) => sum + Number(employee.leaveBalance || 0), 0) / employees.length : 0;
        document.querySelector("[data-leave-pending-count]").textContent = String(pending);
        document.querySelector("[data-leave-approved-count]").textContent = String(approved);
        document.querySelector("[data-leave-average-balance]").textContent = `${average.toFixed(1)} ngày`;
        document.querySelector("[data-pending-badge]").textContent = String(pending);
        document.querySelector("[data-leave-rows]").innerHTML = ordered.length ? ordered.map((request) => {
          const employee = employees.find((record) => record.id === request.employeeId);
          if (!employee) return "";
          const count = countLeaveDays(request);
          const statusClass = { "Chờ duyệt": "status-pending", "Đã duyệt": "status-active", "Từ chối": "status-inactive" }[request.status];
          return `<tr><td><div class="person-cell compact-person"><span class="person-avatar tone-${escapeHtml(employee.avatarColor || "blue")}">${escapeHtml(initials(employee.name))}</span><span><strong>${escapeHtml(employee.name)}</strong><small>${escapeHtml(employee.id)}</small></span></div></td><td>${escapeHtml(request.type)}</td><td>${formatDate(request.from)}${sameDate(request.from, request.to) ? "" : ` – ${formatDate(request.to)}`}</td><td>${count} ngày</td><td><span class="balance-value">${Number(employee.leaveBalance || 0)} ngày</span></td><td class="reason-cell" title="${escapeHtml(request.reason || "")}">${escapeHtml(request.reason || "—")}</td><td><span class="status-pill ${statusClass}">${escapeHtml(request.status)}</span></td><td>${request.status === "Chờ duyệt" ? `<div class="row-actions"><button class="row-action approve-action" type="button" aria-label="Duyệt đơn của ${escapeHtml(employee.name)}" title="Duyệt" data-review-leave="approved" data-leave-id="${escapeHtml(request.id)}">✓</button><button class="row-action delete-action" type="button" aria-label="Từ chối đơn của ${escapeHtml(employee.name)}" title="Từ chối" data-review-leave="rejected" data-leave-id="${escapeHtml(request.id)}">×</button></div>` : "—"}</td></tr>`;
        }).join("") : '<tr><td colspan="8" class="empty-cell">Không có đơn nghỉ phép trong danh sách này.</td></tr>';
      }

      function openLeaveDialog() {
        const form = document.querySelector("[data-leave-form]");
        form.reset();
        document.querySelector("[data-leave-error]").textContent = "";
        form.elements.from.value = dateKey(today);
        form.elements.to.value = dateKey(today);
        document.querySelector("[data-leave-employee]").innerHTML = employees.filter((employee) => employee.status !== "inactive")
          .map((employee) => `<option value="${escapeHtml(employee.id)}">${escapeHtml(employee.name)} · còn ${Number(employee.leaveBalance || 0)} ngày</option>`).join("");
        if (!employees.some((employee) => employee.status !== "inactive")) {
          showToast("Cần có nhân viên đang làm việc để tạo đơn nghỉ.");
          return;
        }
        document.querySelector("[data-leave-dialog]").showModal();
      }

      function submitLeaveRequest(event) {
        event.preventDefault();
        const form = event.currentTarget;
        const data = new FormData(form);
        const from = new Date(`${data.get("from")}T00:00:00`);
        const to = new Date(`${data.get("to")}T00:00:00`);
        const error = document.querySelector("[data-leave-error]");
        if (to < from) {
          error.textContent = "Ngày kết thúc phải từ ngày bắt đầu trở đi.";
          return;
        }
        const employee = employees.find((record) => record.id === data.get("employeeId"));
        const requestedDays = Math.round((to - from) / 86400000) + 1;
        if (!employee) {
          error.textContent = "Không tìm thấy nhân viên đã chọn.";
          return;
        }
        if (data.get("type") === "Phép năm" && requestedDays > Number(employee.leaveBalance || 0)) {
          error.textContent = `Nhân viên chỉ còn ${Number(employee.leaveBalance || 0)} ngày phép năm.`;
          return;
        }
        leaveRequests.push({
          id: `LEAVE-${Date.now()}`,
          employeeId: employee.id,
          type: String(data.get("type")),
          from,
          to,
          reason: String(data.get("reason")).trim(),
          status: "Chờ duyệt",
        });
        persistModuleData();
        form.closest("dialog").close();
        renderLeaveRequests();
        renderCalendar();
        refreshDashboard();
        showToast("Đã gửi đơn nghỉ phép để chờ duyệt.");
      }

      function reviewLeave(event) {
        const button = event.target.closest("[data-review-leave]");
        if (!button) return;
        const request = leaveRequests.find((item) => item.id === button.dataset.leaveId);
        if (!request || request.status !== "Chờ duyệt") return;
        if (button.dataset.reviewLeave === "approved" && request.type === "Phép năm") {
          const employee = employees.find((record) => record.id === request.employeeId);
          const days = countLeaveDays(request);
          if (!employee || Number(employee.leaveBalance || 0) < days) {
            showToast("Số ngày phép còn lại không đủ để duyệt đơn này.");
            return;
          }
          employee.leaveBalance -= days;
        }
        request.status = button.dataset.reviewLeave === "approved" ? "Đã duyệt" : "Từ chối";
        persistModuleData();
        renderLeaveRequests();
        renderCalendar();
        refreshDashboard();
        showToast(request.status === "Đã duyệt" ? "Đã duyệt đơn nghỉ phép." : "Đã từ chối đơn nghỉ phép.");
      }

      function calculatePayroll() {
        const month = Number(document.querySelector("[data-payroll-month]").value);
        const year = Number(document.querySelector("[data-payroll-year]").value);
        const key = periodKey(month, year);
        const eligible = employees.filter((employee) => employee.status !== "inactive");
        moduleState.payrollRows = eligible.map((employee) => {
          const attendance = getAttendance(employee, key);
          const salaryPerDay = employee.base / 26;
          const basePay = employee.base;
          const overtimePay = salaryPerDay / 8 * 1.5 * Number(attendance.overtime);
          const allowance = Number(employee.allowance || 0);
          const bonus = Number(employee.bonus || 0);
          const gross = basePay + overtimePay + allowance + bonus;
          const insurance = employee.base * 0.08;
          const tax = Math.max(0, gross - insurance - 11000000) * 0.1;
          return { employee, attendance, basePay, overtimePay, allowance, bonus, gross, insurance, tax, net: gross - insurance - tax };
        });
        renderPayroll();
      }

      function renderPayroll() {
        const rows = moduleState.payrollRows;
        if (!rows) return;
        document.querySelector("[data-payroll-rows]").innerHTML = rows.length ? rows.map((row) =>
          `<tr><td><div class="person-cell compact-person"><span class="person-avatar tone-${escapeHtml(row.employee.avatarColor || "blue")}">${escapeHtml(initials(row.employee.name))}</span><span><strong>${escapeHtml(row.employee.name)}</strong><small>${escapeHtml(row.employee.id)}</small></span></div></td><td>${formatCurrency(row.employee.base)}</td><td>${Number(row.attendance.days).toFixed(1)}</td><td>${Number(row.attendance.overtime).toFixed(1)} giờ</td><td>${formatCurrency(row.allowance)}</td><td>${formatCurrency(row.bonus)}</td><td>${formatCurrency(row.insurance)}</td><td>${formatCurrency(row.tax)}</td><td class="money-cell net-pay">${formatCurrency(row.net)}</td></tr>`,
        ).join("") : '<tr><td colspan="9" class="empty-cell">Không có nhân viên đủ điều kiện tính lương.</td></tr>';
        document.querySelector("[data-payroll-gross-total]").textContent = formatCurrency(rows.reduce((sum, row) => sum + row.gross, 0));
        document.querySelector("[data-payroll-net-total]").textContent = formatCurrency(rows.reduce((sum, row) => sum + row.net, 0));
        document.querySelector("[data-payroll-period]").textContent = `Bảng lương tháng ${String(Number(document.querySelector("[data-payroll-month]").value)).padStart(2, "0")}/${document.querySelector("[data-payroll-year]").value}`;
        document.querySelector("[data-report-payroll]").textContent = formatCurrency(rows.reduce((sum, row) => sum + row.gross, 0));
      }

      function renderReports() {
        const active = employees.filter((employee) => employee.status !== "inactive");
        const monthHires = active.filter((employee) => {
          const start = new Date(employee.start);
          return start.getFullYear() === today.getFullYear() && start.getMonth() === today.getMonth();
        }).length;
        document.querySelector("[data-report-period]").textContent = monthFormatter.format(today);
        document.querySelector("[data-report-staff]").textContent = String(active.length);
        document.querySelector("[data-report-hires]").textContent = String(monthHires);
        document.querySelector("[data-report-payroll]").textContent = moduleState.payrollRows
          ? formatCurrency(moduleState.payrollRows.reduce((sum, row) => sum + row.gross, 0)) : "Chưa tính";
        const entries = [];
        for (let offset = 5; offset >= 0; offset -= 1) {
          const date = new Date(today.getFullYear(), today.getMonth() - offset, 1);
          const hires = employees.filter((employee) => {
            const start = new Date(employee.start);
            return start.getFullYear() === date.getFullYear() && start.getMonth() === date.getMonth();
          }).length;
          const leavers = employees.filter((employee) => employee.status === "inactive" &&
            new Date(employee.start).getFullYear() === date.getFullYear() &&
            new Date(employee.start).getMonth() === date.getMonth()).length;
          const headcount = Math.max(0, active.length - monthHires + (offset === 0 ? 0 : -offset));
          const payroll = employees.filter((employee) => employee.status !== "inactive").reduce((sum, employee) => sum + employee.base, 0);
          entries.push(`<tr><td><strong>${escapeHtml(monthFormatter.format(date))}</strong></td><td>${headcount}</td><td class="positive-number">+${hires}</td><td class="${leavers ? "negative-number" : ""}">${leavers}</td><td>${headcount + hires - leavers}</td><td class="money-cell">${formatCurrency(payroll * (0.88 + (5 - offset) * 0.024))}</td></tr>`);
        }
        document.querySelector("[data-report-rows]").innerHTML = entries.join("");
      }

      function refreshDashboard() {
        renderStats();
        renderSalaryChart();
        renderDepartmentChart();
        renderCalendar();
      }

      function setupPeriodSelects() {
        const yearOptions = [today.getFullYear() - 1, today.getFullYear(), today.getFullYear() + 1];
        ["[data-attendance-month]", "[data-payroll-month]"].forEach((selector) => {
          const select = document.querySelector(selector);
          select.innerHTML = Array.from({ length: 12 }, (_, index) =>
            `<option value="${index + 1}">Tháng ${String(index + 1).padStart(2, "0")}</option>`,
          ).join("");
          select.value = String(today.getMonth() + 1);
        });
        ["[data-attendance-year]", "[data-payroll-year]"].forEach((selector) => {
          const select = document.querySelector(selector);
          select.innerHTML = yearOptions.map((year) => `<option value="${year}">${year}</option>`).join("");
          select.value = String(today.getFullYear());
        });
      }

      function initializeModules() {
        restoreModuleData();
        refreshDashboard();
        setupPeriodSelects();
        document.querySelectorAll("[data-route]").forEach((link) => link.addEventListener("click", (event) => {
          event.preventDefault();
          const route = link.dataset.route;
          if (location.hash !== `#${route}`) location.hash = route;
          else routeTo(route);
        }));
        window.addEventListener("hashchange", () => routeTo(location.hash.slice(1)));
        routeTo(location.hash.slice(1) || "dashboard");

        document.querySelector("[data-open-employee]").addEventListener("click", () => openEmployeeDialog(null));
        document.querySelector("[data-employee-form]").addEventListener("submit", saveEmployee);
        document.querySelector("[data-employee-rows]").addEventListener("click", (event) => {
          const edit = employeeFromButton(event, "data-edit-employee");
          if (edit) {
            openEmployeeDialog(edit);
            return;
          }
          const remove = employeeFromButton(event, "data-delete-employee");
          if (!remove) return;
          if (!window.confirm(`Bạn có chắc muốn xóa nhân viên ${remove.name} (${remove.id})?`)) return;
          employees.splice(employees.findIndex((employee) => employee.id === remove.id), 1);
          leaveRequests.splice(0, leaveRequests.length, ...leaveRequests.filter((request) => request.employeeId !== remove.id));
          Object.values(moduleState.attendance).forEach((period) => { delete period[remove.id]; });
          persistModuleData();
          refreshDashboard();
          renderEmployees();
          renderAttendance();
          renderLeaveRequests();
          renderReports();
          if (moduleState.payrollRows) calculatePayroll();
          showToast("Đã xóa hồ sơ nhân viên và các đơn liên quan.");
        });
        document.querySelector("[data-employee-search]").addEventListener("input", () => {
          moduleState.employeePage = 1;
          renderEmployees();
        });
        ["[data-department-filter]", "[data-status-filter]"].forEach((selector) =>
          document.querySelector(selector).addEventListener("change", () => {
            moduleState.employeePage = 1;
            renderEmployees();
          }),
        );
        document.querySelector("[data-employee-prev]").addEventListener("click", () => {
          moduleState.employeePage = Math.max(1, moduleState.employeePage - 1);
          renderEmployees();
        });
        document.querySelector("[data-employee-next]").addEventListener("click", () => {
          moduleState.employeePage += 1;
          renderEmployees();
        });
        document.querySelectorAll("[data-close-employee], [data-cancel-employee]").forEach((button) =>
          button.addEventListener("click", () => document.querySelector("[data-employee-dialog]").close()),
        );
        document.querySelector("[data-employee-dialog]").addEventListener("click", (event) => {
          if (event.target === event.currentTarget) event.currentTarget.close();
        });

        ["[data-attendance-month]", "[data-attendance-year]"].forEach((selector) =>
          document.querySelector(selector).addEventListener("change", () => {
            renderAttendance();
            if (moduleState.payrollRows) calculatePayroll();
          }),
        );
        document.querySelector("[data-attendance-rows]").addEventListener("change", (event) => {
          const input = event.target.closest("[data-attendance-value]");
          if (!input) return;
          const value = Number(input.value);
          const maximum = input.dataset.attendanceValue === "days" ? 31 : 200;
          if (!Number.isFinite(value) || value < 0 || value > maximum) {
            input.value = "0";
            showToast(`Giá trị phải nằm trong khoảng 0–${maximum}.`);
          }
          const key = periodKey(
            Number(document.querySelector("[data-attendance-month]").value),
            Number(document.querySelector("[data-attendance-year]").value),
          );
          const record = getAttendance(employees.find((employee) => employee.id === input.dataset.employeeId), key);
          record[input.dataset.attendanceValue] = Number(input.value);
          persistModuleData();
          renderAttendance();
          if (moduleState.payrollRows) calculatePayroll();
        });

        document.querySelector("[data-open-leave]").addEventListener("click", openLeaveDialog);
        document.querySelector("[data-leave-form]").addEventListener("submit", submitLeaveRequest);
        document.querySelector("[data-leave-rows]").addEventListener("click", reviewLeave);
        document.querySelector("[data-leave-filter]").addEventListener("change", renderLeaveRequests);
        document.querySelectorAll("[data-close-leave], [data-cancel-leave]").forEach((button) =>
          button.addEventListener("click", () => document.querySelector("[data-leave-dialog]").close()),
        );
        document.querySelector("[data-leave-dialog]").addEventListener("click", (event) => {
          if (event.target === event.currentTarget) event.currentTarget.close();
        });
        document.querySelector("[data-calculate-payroll]").addEventListener("click", calculatePayroll);
      }

      initializeDashboard();
      initializeModules();