const fixtureBody = document.querySelector("[data-test-rows]");
const controls = document.querySelector("[data-table-controls]");
const output = document.querySelector("[data-test-output]");
const summary = document.querySelector("[data-test-summary]");

function assertEqual(actual, expected, description) {
  if (actual !== expected) {
    throw new Error(`${description}: expected "${expected}", received "${actual}".`);
  }
}

function visibleNames() {
  return Array.from(fixtureBody.rows)
    .filter((row) => !row.hidden && !row.classList.contains("table-empty-row"))
    .map((row) => row.cells[0].textContent);
}

function runTest(description, test) {
  const item = document.createElement("li");

  try {
    test();
    item.textContent = `Đạt — ${description}`;
    item.className = "test-pass";
  } catch (error) {
    item.textContent = `Lỗi — ${description}: ${error.message}`;
    item.className = "test-fail";
  }

  output.append(item);
}

runTest("phân trang mặc định giới hạn 10 dòng", () => {
  assertEqual(visibleNames().length, 10, "Số dòng trang đầu");
  assertEqual(
    controls.querySelector("[data-pagination-summary]").textContent,
    "Hiển thị 1–10 trên 12 mục",
    "Nhãn phân trang",
  );
});

runTest("các lựa chọn số dòng đúng theo yêu cầu", () => {
  assertEqual(
    Array.from(controls.querySelector("[data-page-size]").options, (option) => option.textContent).join(","),
    "10,20,50,All",
    "Các lựa chọn phân trang",
  );
});

runTest("chuyển sang trang kế tiếp và quay lại", () => {
  controls.querySelector("[data-page-next]").click();
  assertEqual(visibleNames().length, 2, "Số dòng trang cuối");
  assertEqual(visibleNames()[0], "Trần Anh", "Dòng đầu của trang cuối");
  controls.querySelector("[data-page-prev]").click();
  assertEqual(visibleNames().length, 10, "Số dòng sau khi quay lại");
});

runTest("tìm kiếm không phân biệt dấu tiếng Việt", () => {
  const search = controls.querySelector("[data-table-search]");
  search.value = "tran anh";
  search.dispatchEvent(new Event("input", { bubbles: true }));
  assertEqual(visibleNames().join(","), "Trần Anh", "Kết quả tìm kiếm");
  search.value = "";
  search.dispatchEvent(new Event("input", { bubbles: true }));
});

runTest("lọc theo phòng ban", () => {
  const filter = controls.querySelector("[data-filter-column]");
  filter.value = "Thiết kế";
  filter.dispatchEvent(new Event("change", { bubbles: true }));
  assertEqual(visibleNames().length, 6, "Số dòng thuộc phòng Thiết kế");
  assertEqual(
    visibleNames().every((name) =>
      Array.from(fixtureBody.rows).some(
        (row) => row.cells[0].textContent === name && row.cells[1].textContent === "Thiết kế",
      ),
    ),
    true,
    "Phòng ban của kết quả",
  );
  filter.value = "";
  filter.dispatchEvent(new Event("change", { bubbles: true }));
});

runTest("sắp xếp tên theo chiều giảm dần", () => {
  const sort = controls.querySelector("[data-table-sort]");
  sort.value = "desc";
  sort.dispatchEvent(new Event("change", { bubbles: true }));
  assertEqual(visibleNames()[0], "Vũ Lâm", "Tên đầu tiên sau khi sắp xếp");
  sort.value = "asc";
  sort.dispatchEvent(new Event("change", { bubbles: true }));
});

runTest("All hiển thị toàn bộ bản ghi", () => {
  const pageSize = controls.querySelector("[data-page-size]");
  pageSize.value = "all";
  pageSize.dispatchEvent(new Event("change", { bubbles: true }));
  assertEqual(visibleNames().length, 12, "Số dòng khi chọn All");
});

runTest("thông báo trạng thái khi không có kết quả", () => {
  const search = controls.querySelector("[data-table-search]");
  search.value = "khong-co-ket-qua";
  search.dispatchEvent(new Event("input", { bubbles: true }));
  assertEqual(visibleNames().length, 0, "Số dòng phù hợp");
  assertEqual(
    controls.querySelector("[data-pagination-summary]").textContent,
    "Không tìm thấy dữ liệu",
    "Thông báo không có kết quả",
  );
  assertEqual(fixtureBody.querySelector(".table-empty-row").hidden, false, "Trạng thái dòng rỗng");
});

const failures = output.querySelectorAll(".test-fail").length;
const passed = output.querySelectorAll(".test-pass").length;
summary.textContent = failures
  ? `${passed} kiểm thử đạt; ${failures} kiểm thử lỗi.`
  : `Tất cả ${passed} kiểm thử đều đạt.`;
summary.classList.toggle("test-fail", failures > 0);
summary.classList.toggle("test-pass", failures === 0);

controls.querySelector("[data-table-search]").value = "";
controls.querySelectorAll("[data-filter-column]").forEach((filter) => {
  filter.value = "";
  filter.dispatchEvent(new Event("change", { bubbles: true }));
});
controls.querySelector("[data-table-sort]").value = "asc";
controls.querySelector("[data-table-sort]").dispatchEvent(new Event("change", { bubbles: true }));
controls.querySelector("[data-page-size]").value = "10";
controls.querySelector("[data-page-size]").dispatchEvent(new Event("change", { bubbles: true }));
controls.querySelector("[data-table-search]").dispatchEvent(new Event("input", { bubbles: true }));
