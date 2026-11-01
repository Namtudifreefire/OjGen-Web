# OjGen 3.3.0 Web — Trình tạo test cho lập trình thi đấu (Online Judge Testcase Generator & Authoring Suite)

OjGen 3.3.0 Web là phiên bản web hiện đại hóa của công cụ tạo bộ test và quản lý đề bài lập trình thi đấu, được viết lại hoàn toàn bằng **React 19 + TypeScript + Vite + Tailwind CSS**.

Ứng dụng hỗ trợ sinh dữ liệu kiểm thử, chạy lời giải chuẩn tự động, quản lý nhóm test (Subtasks), kiểm định tính hợp lệ, đối chiếu lời giải, rút gọn phản ví dụ (Shrinker), soạn thảo đề bài chuẩn và đóng gói phát hành theo quy chuẩn quốc tế.

---

## 1. Tính năng chính

- **Bộ sinh số ngẫu nhiên 64-bit Mersenne Twister (MT19937-64):** Cài đặt bit-for-bit nguyên bản, đảm bảo cùng một `seed` và cấu hình sẽ tái lập chính xác từng byte dữ liệu kiểm thử.
- **19 Cấu trúc input toàn diện:**
  1. `single_n`: Số nguyên đơn lẻ N
  2. `two_ints`: Hai số nguyên A B (tùy chọn A ≤ B, A < B, khác nhau)
  3. `array`: Mảng một chiều, hoán vị 1..N, sắp xếp không giảm/không tăng, phần tử phân biệt
  4. `queries`: Mảng kết hợp truy vấn cập nhật điểm và hỏi đoạn
  5. `prefix_sum_range`: Truy vấn tiền tố tổng đoạn (QBOJ sumarr)
  6. `prefix_subsequence_range`: Truy vấn tổng dãy con (QBOJ TDC)
  7. `string`: Xâu ký tự với đa dạng charset (lower, upper, letters, digits, alnum, binary, DNA, custom)
  8. `matrix`: Ma trận số nguyên N×M hoặc hai mảng song song
  9. `grid`: Lưới ký tự mê cung với tùy chọn đặt vị trí bắt đầu `S` và đích `T`
  10. `pairs`: Danh sách cặp số hoặc đoạn `[l, r]`
  11. `graph`: Đồ thị đơn/đa đồ thị, có hướng/vô hướng, liên thông, liên thông mạnh, DAG, đồ thị 2 phía, có trọng số
  12. `tree`: Cây ngẫu nhiên, đường thẳng, hình sao, cây nhị phân (danh sách cạnh hoặc danh sách cha)
  13. `multi_test`: Nhiều bộ test con (mỗi bộ là mảng số hoặc xâu)
  14. `custom`: Dãy số theo giới hạn chung hoặc riêng từng vị trí `lo1:hi1,lo2:hi2,...`
  15. `chess_moves`: Đếm nước đi của quân Mã trên bàn cờ 8×8
  16. `chess_piece_moves`: Đếm nước đi của Mã, Vua, Xe, Tượng, Hậu
  17. `chess_knight_targets`: Liệt kê tọa độ các ô đích quân Mã có thể đi
  18. `chess_knight_reachability`: Kiểm tra Mã đi tới đích trong đúng 1 nước (YES/NO)
  19. `chess_knight_shortest`: Tìm đường đi ngắn nhất của quân Mã (BFS)
- **Danh mục chủ đề thuật toán:** Tích hợp hơn 150 tag phân loại từ VNOI, Codeforces, QBOJ, LQDOJ, LTOJ và DMOJ với liên kết tra cứu và gợi ý khuôn input tương ứng.
- **Kế hoạch nhóm test (Subtasks) & Điểm số:** Chia bộ test thành các nhóm có điểm số (tổng 100), điều kiện phụ thuộc (prerequisites), ghi đè tham số và nhãn độ phủ (`small`, `boundary`, `stress`, `adversarial`). Nút tạo nhanh **Adversarial Presets** tự động sinh các biên cực trị và bẫy góc.
- **Kiểm thử đối chiếu & Shrinker cấu trúc:** So sánh lời giải chuẩn và lời giải ứng viên. Khi phát hiện sai khác, thuật toán Shrinker tự động thu nhỏ mảng, cắt tỉa cạnh đồ thị hoặc giảm số về 0 để tạo ra phản ví dụ tối giản nhất phục vụ việc debug.
- **Soạn thảo đề bài (Problem Statement):** Soạn thảo đề bằng Markdown, kiểm tra tính nhất quán giữa ràng buộc trong đề và tham số generator, xem trước đề bài trực tiếp.
- **Kiểm kê & Trực quan hóa test:** Tìm kiếm, phân loại theo nhóm, hiển thị biểu đồ đồ thị/cây bằng SVG, lưới 2D màu và biểu đồ phân phối tần số giá trị (histogram). Xuất bảng kiểm kê CSV.
- **Đóng gói phát hành (Packaging):** Hỗ trợ đóng gói ZIP theo chuẩn **OjGen Standard** (kèm `PACKAGE_SHA256SUMS.txt`, `inventory.csv`, `provenance.json`) và chuẩn **Kattis / ICPC Problem Package Format** (`data/sample`, `data/secret`, `problem.yaml`).
- **Khung mã nguồn (Scaffolds):** Tạo sẵn template validator và checker bằng C++ (Standalone / Testlib) và Python.
- **Dự án di động (.ojproject):** Lưu và mở toàn bộ workspace đề bài dưới dạng file JSON.

---

## 2. Cài đặt và Khởi chạy

```bash
# Cài đặt dependencies
npm install

# Khởi chạy máy chủ phát triển
npm run dev

# Biên dịch sản phẩm
npm run build
```

Dev server chạy tại cổng `3000` (`http://localhost:3000`).
