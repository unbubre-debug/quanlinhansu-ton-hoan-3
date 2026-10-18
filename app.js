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

const loginForm = document.querySelector("[data-login-form]");
loginForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  window.location.assign("index.html");
});
