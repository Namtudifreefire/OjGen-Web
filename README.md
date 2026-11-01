# OjGen Web 3.3.0

**Trình tạo và kiểm định bộ test cho lập trình thi đấu**, chạy trực tiếp trong trình duyệt.

OjGen Web được xây dựng bằng React 19, TypeScript, Vite và Tailwind CSS. Ứng dụng cung cấp các khuôn sinh input, bộ giải tham chiếu tích hợp cho từng khuôn, công cụ quản lý test và xuất gói ZIP.

🌐 **Dùng thử trực tuyến:** [OjGen Web](https://ojgen-web.pages.dev)

## Tác giả và nguồn

- **Tác giả / duy trì:** [Namtudifreefire](https://github.com/Namtudifreefire)
- **Mã nguồn OjGen Web:** [github.com/Namtudifreefire/OjGen-Web](https://github.com/Namtudifreefire/OjGen-Web)
- **Bản GUI/CLI liên quan:** [github.com/Namtudifreefire/OjGen-New](https://github.com/Namtudifreefire/OjGen-New)

Danh mục chủ đề thuật toán tham khảo các nguồn sau:

| Nguồn | Trang |
|---|---|
| VNOI | [vnoi.info](https://vnoi.info/) |
| Codeforces | [codeforces.com](https://codeforces.com/) |
| QBOJ | [qboj.zapto.org](http://qboj.zapto.org/) |
| LQDOJ | [lqdoj.edu.vn](https://lqdoj.edu.vn/) |
| LTOJ | [ltoj.edu.vn](https://ltoj.edu.vn/) |
| DMOJ | [dmoj.ca](https://dmoj.ca/) |

OjGen dùng tên chủ đề và liên kết tham khảo để gợi ý khuôn input; ứng dụng không sao chép toàn văn đề bài từ các nền tảng này. Nội dung và thương hiệu của từng nền tảng thuộc về chủ sở hữu tương ứng.

## Tính năng

### 19 khuôn sinh dữ liệu

| Khuôn | Dữ liệu |
|---|---|
| `single_n` | Một số nguyên `N` |
| `two_ints` | Cặp số nguyên, có thể ràng buộc thứ tự hoặc khác nhau |
| `array` | Mảng, hoán vị, tăng/giảm hoặc phần tử phân biệt |
| `queries` | Mảng và truy vấn cập nhật/truy vấn đoạn |
| `prefix_sum_range` | Truy vấn tổng đoạn theo khuôn QBOJ `sumarr` |
| `prefix_subsequence_range` | Truy vấn tổng dãy con theo khuôn QBOJ TDC |
| `string` | Xâu với charset chữ, số, nhị phân, DNA hoặc tự chọn |
| `matrix` | Ma trận số nguyên hoặc hai mảng song song |
| `grid` | Lưới ký tự, tùy chọn điểm đầu `S` và đích `T` |
| `pairs` | Danh sách cặp số hoặc đoạn `[l, r]` |
| `graph` | Đồ thị có hướng/vô hướng, đơn, liên thông, DAG, hai phía hoặc có trọng số |
| `tree` | Cây ngẫu nhiên, đường thẳng, hình sao hoặc nhị phân |
| `multi_test` | Nhiều bộ test con dạng mảng hoặc xâu |
| `custom` | Các số theo giới hạn chung hoặc giới hạn riêng từng vị trí |
| `chess_moves` | Đếm nước đi của quân Mã trên bàn cờ `8×8` |
| `chess_piece_moves` | Đếm nước đi của Mã, Vua, Xe, Tượng hoặc Hậu |
| `chess_knight_targets` | Liệt kê ô mà quân Mã có thể đi tới |
| `chess_knight_reachability` | Kiểm tra Mã tới đích trong một nước |
| `chess_knight_shortest` | Tìm đường đi ngắn nhất của Mã bằng BFS |

Bộ sinh dùng MT19937-64. Cùng seed và cấu hình sẽ tái lập chuỗi input. Mỗi khuôn có bộ giải tham chiếu viết bằng TypeScript để tạo output mẫu.

### Lập kế hoạch và kiểm tra

- Chia test thành nhóm với số lượng, seed, cấu hình, nhãn độ phủ, điểm và điều kiện tiên quyết.
- Tạo nhanh nhóm cấu hình biên nhỏ/lớn, mảng có giá trị trùng và đồ thị liên thông mạnh khi khuôn hỗ trợ.
- Phân tích độ phủ theo các tham số mà OjGen nhận diện trong input; kết quả là gợi ý heuristic.
- Đối chiếu bộ giải tham chiếu với các mẫu lời giải ứng viên; có thể nhập hàm ứng viên JavaScript và thu nhỏ phản ví dụ cho input mảng đơn giản.
- Soạn statement qua các trường mô tả, input, output, ràng buộc và sample; xem trước, kiểm tra input mẫu và một số cận `N` cơ bản.
- Tạo scaffold ban đầu cho validator/checker bằng C++ hoặc Python, gồm một số mẫu C++ Testlib và so sánh số thực.

### Kiểm kê và đóng gói

- Tìm test theo tên hoặc nhãn, lọc theo nhóm, xem input/output và xuất inventory CSV.
- Trực quan đồ thị/cây bằng SVG, lưới và histogram cho mảng hoặc truy vấn tổng tiền tố.
- Xuất OjGen ZIP gồm `tests/*.inp`, `tests/*.out`, `PACKAGE_SHA256SUMS.txt`, `inventory.csv` và `provenance.json`; có thể kèm statement.
- Xuất gói Kattis dạng cơ bản gồm `problem.yaml`, test trong `data/sample`/`data/secret` và statement nếu đã soạn.
- Xuất/nhập dự án `.ojproject` dạng JSON để lưu thông tin bài, cấu hình, seed, test tay/sample và statement.

### Chủ đề thuật toán

Hiện có **40 mục gợi ý** từ VNOI, Codeforces, QBOJ, LQDOJ, LTOJ, DMOJ và các chủ đề nội bộ OjGen. Mỗi mục gợi ý khuôn dữ liệu gần nhất; cần xem đề và ràng buộc trước khi dùng.

## Bắt đầu

Cần cài Node.js và npm. Chạy các lệnh từ thư mục dự án:

```bash
npm install
npm run dev
```

Vite dev server chạy tại [http://localhost:3000](http://localhost:3000).

Các lệnh khác:

```bash
npm run lint     # Kiểm tra TypeScript
npm run build    # Kiểm tra TypeScript và build bản production
npm run preview  # Xem thử bản build tại cổng 3000
```

## Giới hạn hiện tại

- Đây là ứng dụng phía trình duyệt, không có backend để biên dịch/chạy lời giải native C++, Python, Java hoặc thực thi validator/checker bên ngoài. Output được tạo bởi bộ giải tham chiếu tích hợp.
- Hàm ứng viên tùy chỉnh trong kiểm thử đối chiếu là JavaScript chạy trong trang hiện tại; chỉ nhập mã bạn tin cậy.
- Shrinker hiện là heuristic cho input mảng hai dòng, tối đa 64 lần thử; chưa thu nhỏ cấu trúc cây, đồ thị, lưới hay truy vấn.
- Nhập `.ojproject` hiện chưa khôi phục danh sách nhóm test đã lưu; hãy kiểm tra lại kế hoạch nhóm sau khi mở dự án.
- Gói Kattis dùng định dạng `2025-09` release candidate và chỉ xuất metadata, statement, sample/secret. Hãy kiểm tra gói với judge đích; ứng dụng chưa thêm lời giải, validator hoặc checker vào gói này.
- Các scaffold validator/checker là mã khởi đầu, cần hoàn thiện và chạy kiểm tra riêng trước khi dùng cho bài thật.

Seed, cấu hình và dữ liệu đang làm việc được giữ trong trạng thái của tab trình duyệt. Hãy tải file `.ojproject` và ZIP cần thiết trước khi đóng hoặc tải lại trang.

