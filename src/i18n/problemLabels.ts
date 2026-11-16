import type { Problem } from '../core/types';
import type { Language } from './I18nContext';
import type { AlgorithmTopic } from '../core/topics';

const categories: Record<string, string> = {
  'Số và bộ giá trị': 'Numbers and tuples', 'Dãy và truy vấn': 'Arrays and queries',
  'Xâu và ký tự': 'Strings and characters', 'Ma trận và lưới': 'Matrices and grids',
  'Danh sách cặp và đoạn': 'Pairs and intervals', 'Đồ thị và cây': 'Graphs and trees',
  'Nhiều bộ test': 'Multiple test cases', 'Dữ liệu tùy chỉnh': 'Custom data',
};
const titles: Record<string, string> = {
  single_n: 'Single integer (N)', two_ints: 'Two integers (A, B)', array: '1D array / permutation',
  queries: 'Array and queries', prefix_sum_range: 'Prefix sums: range queries (QBOJ sumarr)',
  prefix_subsequence_range: 'Prefix sums: subsequence queries (QBOJ TDC)', string: 'String',
  matrix: 'Matrix / two arrays (doublearr)', grid: 'Character grid', pairs: 'Pairs / intervals',
  graph: 'Graph', tree: 'Tree', multi_test: 'Multiple test cases (array / string)',
  custom: 'Custom integers with shared or per-position limits', chess_moves: 'Chess: count knight moves',
  chess_piece_moves: 'Chess: count piece moves', chess_knight_targets: 'Chess: list knight moves',
  chess_knight_reachability: 'Chess: knight reachability in one move', chess_knight_shortest: 'Chess: shortest knight path',
};
const arrayLabels: Record<string, string> = {
  'Kiểu mảng': 'Array type', 'Số phần tử nhỏ nhất (minN)': 'Minimum number of elements (minN)',
  'Số phần tử lớn nhất (maxN)': 'Maximum number of elements (maxN)',
  'Giá trị phần tử nhỏ nhất': 'Minimum element value', 'Giá trị phần tử lớn nhất': 'Maximum element value',
  'Các phần tử đôi một khác nhau?': 'All elements distinct?', 'Sắp xếp': 'Order',
  'Giá trị trong khoảng': 'Values in range', 'Hoán vị 1..n': 'Permutation of 1..n',
  'Ngẫu nhiên': 'Random', 'Không giảm (tăng dần)': 'Non-decreasing', 'Không tăng (giảm dần)': 'Non-increasing',
  'Cận dưới A (minA)': 'Lower bound for A (minA)', 'Cận trên A (maxA)': 'Upper bound for A (maxA)',
  'Cận dưới B (minB)': 'Lower bound for B (minB)', 'Cận trên B (maxB)': 'Upper bound for B (maxB)',
  'Ràng buộc thứ tự': 'Ordering constraint', 'Tùy ý (không ràng buộc)': 'Any (unconstrained)', 'A khác B': 'A differs from B',
  'Giá trị nhỏ nhất (minN)': 'Minimum value (minN)', 'Cận dưới của N': 'Lower bound for N',
  'Giá trị lớn nhất (maxN)': 'Maximum value (maxN)', 'Cận trên của N': 'Upper bound for N',
  'Số truy vấn nhỏ nhất (minQ)': 'Minimum queries (minQ)', 'Số truy vấn lớn nhất (maxQ)': 'Maximum queries (maxQ)',
  'Tỷ lệ % truy vấn cập nhật (loại 1)': 'Update query percentage (type 1)',
  '0 = chỉ có hỏi đoạn, 100 = chỉ có cập nhật': '0 = range queries only, 100 = updates only',
  'Số phần tử nhỏ nhất': 'Minimum elements', 'Số phần tử lớn nhất': 'Maximum elements',
  'Số truy vấn nhỏ nhất': 'Minimum queries', 'Số truy vấn lớn nhất': 'Maximum queries',
  'Độ dài nhỏ nhất': 'Minimum length', 'Độ dài lớn nhất': 'Maximum length', 'Tập ký tự': 'Character set',
  'Ghi độ dài xâu ở dòng đầu?': 'Print string length on the first line?', 'Bố cục dữ liệu': 'Data layout',
  'Ma trận n × m (ghi n m)': 'n × m matrix (print n m)', 'Ma trận, m cố định (chỉ ghi n)': 'Matrix with fixed m (print n only)',
  'Hai mảng cùng độ dài n': 'Two arrays of length n', 'Số dòng / độ dài mảng nhỏ nhất': 'Minimum rows / array length',
  'Số dòng / độ dài mảng lớn nhất': 'Maximum rows / array length', 'Số cột nhỏ nhất': 'Minimum columns',
  'Số cột lớn nhất': 'Maximum columns', 'Giá trị nhỏ nhất': 'Minimum value', 'Giá trị lớn nhất': 'Maximum value',
  'Số hàng nhỏ nhất': 'Minimum rows', 'Số hàng lớn nhất': 'Maximum rows', 'Đặt đúng một S và một T?': 'Place exactly one S and one T?',
  'Số cặp nhỏ nhất': 'Minimum pairs', 'Số cặp lớn nhất': 'Maximum pairs', 'Cặp là đoạn [l, r] (l ≤ r)?': 'Pairs are intervals [l, r] (l ≤ r)?',
  'Số đỉnh nhỏ nhất (minN)': 'Minimum vertices (minN)', 'Số đỉnh lớn nhất (maxN)': 'Maximum vertices (maxN)',
  'Mật độ cạnh': 'Edge density', 'Tự đặt minM/maxM': 'Set minM/maxM manually', 'Thưa': 'Sparse', 'Vừa': 'Medium', 'Dày': 'Dense',
  'Số cạnh nhỏ nhất (minM)': 'Minimum edges (minM)', 'Số cạnh lớn nhất (maxM)': 'Maximum edges (maxM)',
  'Đồ thị có hướng?': 'Directed graph?', 'Đồ thị đơn?': 'Simple graph?', 'Bắt buộc liên thông?': 'Require connectivity?',
  'Liên thông mạnh (có hướng)?': 'Strongly connected (directed)?', 'DAG (có hướng không chu trình)?': 'Directed acyclic graph?',
  'Đồ thị hai phía?': 'Bipartite graph?', 'Có trọng số cạnh?': 'Weighted edges?', 'Trọng số nhỏ nhất': 'Minimum weight',
  'Trọng số lớn nhất': 'Maximum weight', 'Cách ghi cây': 'Tree representation', 'Danh sách cạnh u v': 'Edge list u v',
  'Danh sách cha của 2..n': 'Parents of vertices 2..n', 'Số đỉnh nhỏ nhất': 'Minimum vertices', 'Số đỉnh lớn nhất': 'Maximum vertices',
  'Cấu trúc cây': 'Tree structure', 'Cây ngẫu nhiên': 'Random tree', 'Đường thẳng': 'Path', 'Hình sao': 'Star',
  'Cây nhị phân': 'Binary tree', 'Cạnh có trọng số?': 'Weighted edges?', 'Dữ liệu mỗi test': 'Data per test case',
  'Mảng số nguyên': 'Integer array', 'Xâu ký tự': 'String', 'Số bộ test nhỏ nhất': 'Minimum test cases',
  'Số bộ test lớn nhất': 'Maximum test cases', 'Số lượng số nguyên trong mỗi test (n)': 'Integers per test (n)',
  'Chế độ giới hạn': 'Bounds mode', 'Giới hạn chung cho mọi số': 'Shared bounds for all values',
  'Giới hạn riêng từng vị trí': 'Per-position bounds', 'Giới hạn riêng (lo1:hi1,lo2:hi2,...)': 'Per-position bounds (lo1:hi1,lo2:hi2,...)',
  'Ghi n ở dòng đầu?': 'Print n on the first line?', 'Bố cục': 'Layout', 'Các số trên cùng một dòng': 'All numbers on one line',
  'Mỗi số một dòng': 'One number per line', 'Vùng chọn tọa độ': 'Position region', 'Bất kỳ': 'Any',
  'Góc bàn cờ': 'Board corners', 'Cạnh bàn cờ (không ở góc)': 'Board edges (excluding corners)',
  'Vùng trung tâm (2–5)': 'Center region (2–5)', 'Quân cờ': 'Chess piece', 'Mã (Knight)': 'Knight',
  'Tượng (Bishop)': 'Bishop', 'Hậu (Queen)': 'Queen', 'Góc': 'Corner', 'Cạnh': 'Edge', 'Trung tâm': 'Center',
  'Tỷ lệ % sinh ca YES (có thể đi tới)': 'Percentage of YES cases (reachable)',
};
const arrayFormat = `Line 1: integer n (minN ≤ n ≤ maxN).
Line 2: n space-separated integers a1 ... an (minVal ≤ ai ≤ maxVal).
  mode = 0: random values in [minVal, maxVal].
  mode = 1: a permutation of 1..n (minVal/maxVal are hidden).
  distinct = 1: all elements are distinct.
  sorted = 0: random, 1: non-decreasing, 2: non-increasing.
Example:
  5
  3 -1 4 1 5\n`;
const formats: Record<string, string> = {
  array: arrayFormat,
  single_n: 'A single line containing integer N in [minN, maxN].',
  two_ints: 'A single line containing two space-separated integers A and B.',
  queries: 'Line 1: n q.\nLine 2: n integers a1 ... an (minVal ≤ ai ≤ maxVal).\nThe next q lines contain queries:\n  1 i x: set a[i] = x (1 ≤ i ≤ n, minVal ≤ x ≤ maxVal)\n  2 l r: query range [l, r] (1 ≤ l ≤ r ≤ n)\nupdatePct specifies the percentage of type 1 queries (0..100).',
  prefix_sum_range: 'Line 1: n.\nLine 2: n integers a1 ... an.\nLine 3: q.\nThe next q lines contain x y (1 ≤ x ≤ y ≤ n).\nThe reference solution prints the sum of a[x..y] for each query.',
  prefix_subsequence_range: 'Line 1: n q (1 ≤ n, q ≤ 100000).\nLine 2: n integers a1 ... an (|ai| ≤ 10000000).\nThe next q lines contain l r (1 ≤ l ≤ r ≤ n).\nThe maximum subsequence sum is the sum of positive elements in [l, r].',
  string: 'If printLen = 1, line 1 contains string length L.\nThe next line contains string s of length L (minLen ≤ L ≤ maxLen), drawn from charset.\nCharset: lower, upper, letters, digits, alnum, binary, DNA or custom.',
  matrix: 'Layouts:\n  0: first line n m, followed by n rows of m numbers.\n  1: first line n, m fixed in the configuration, followed by n rows.\n  2: first line n, followed by two arrays, one per line.',
  grid: 'Line 1: n m. The next n lines each contain a string of length m.\nCharacters come from charset; optionally place exactly one S and one T.',
  pairs: 'Line 1: n. The next n lines each contain a pair x y.\nFor interval data, each pair satisfies x ≤ y.',
  graph: 'Line 1: n m (vertices and edges).\nThe next m lines contain u v (or u v w if weighted = 1); vertices are numbered 1..n.\nOptions include directed, simple, connected, stronglyConnected, dag, bipartite and weighted.',
  tree: 'Line 1: n. Followed by n-1 edges u v [w], or the parents of vertices 2..n on one line.\nThe configuration selects a random, path, star or binary tree.',
  multi_test: 'Line 1: the number of test cases T. Each case contains a line n followed by a line of n values or characters.\nChoose integer arrays or strings.',
  custom: 'Each test contains n integers (n is fixed).\n  mode = 1: all values in [min, max].\n  mode = 2: value i in [lo_i, hi_i]; e.g. bounds: "1:10,50:100,-20:20".\n  header = 1: print n on the first line.\n  layout = 1: one line; layout = 2: one value per line.',
  chess_moves: 'One line contains x y (0 ≤ x, y ≤ 7), the knight position on an 8×8 board.\nThe reference solution prints the number of legal destinations.',
  chess_piece_moves: 'Input: x y (0 ≤ x, y ≤ 7). Output: the number of legal moves for the selected piece on an empty 8×8 board.',
  chess_knight_targets: 'Input: x y.\nOutput line 1: the number k of legal destinations.\nThe next k lines contain u v in ascending lexicographic order.',
  chess_knight_reachability: 'Input: x1 y1 x2 y2.\nOutput: YES if the knight can move from (x1, y1) to (x2, y2) in exactly one move; otherwise NO.',
  chess_knight_shortest: 'Input: x1 y1 x2 y2.\nOutput: the minimum number of knight moves from (x1, y1) to (x2, y2) on an empty 8×8 board.',
};

export const categoryLabel = (value: string, language: Language) => language === 'en' ? categories[value] ?? value : value;
export const problemTitle = (problem: Problem, language: Language) => language === 'en' ? titles[problem.id] ?? problem.title : problem.title;
export const problemFormat = (problem: Problem, language: Language) => language === 'en' ? formats[problem.id] ?? problem.formatDescription : problem.formatDescription;
export const parameterLabel = (_problem: Problem, value: string, language: Language) => language === 'en' ? arrayLabels[value] ?? value : value;

const topicNames: Record<string, string> = {
  'Đếm nước đi của quân Mã': 'Count knight moves', 'Đếm nước đi của quân cờ': 'Count chess piece moves',
  'Liệt kê ô quân Mã có thể đi': 'List knight destinations', 'Kiểm tra Mã đi một nước': 'Knight reachability in one move',
  'Đường đi ngắn nhất của quân Mã': 'Shortest knight path', 'Chu trình Euler': 'Eulerian cycle',
  'Đường đi ngắn nhất - Dijkstra': 'Shortest paths - Dijkstra', 'Cây khung nhỏ nhất (MST)': 'Minimum spanning tree (MST)',
  'Thành phần liên thông mạnh (SCC)': 'Strongly connected components (SCC)', 'Topo sort (Sắp xếp tô-pô)': 'Topological sort',
  'Cây (LCA & Euler Tour)': 'Trees (LCA & Euler tour)', 'Đồ thị hai phía (Bipartite)': 'Bipartite graphs',
  'Mảng cộng dồn (Prefix Sum)': 'Prefix sums', 'Tổng dãy con theo truy vấn (TDC)': 'Subsequence sum queries (TDC)',
  'Ma trận 2D / Fenwick 2D': '2D matrices / Fenwick trees', 'Tập đoạn thẳng / Li Chao Tree': 'Line segments / Li Chao tree',
  'String Hashing (Băm xâu)': 'String hashing', 'Trie (Cây tiền tố)': 'Trie (prefix tree)',
  'Xâu đối xứng (Manacher / Palindrome)': 'Palindromes / Manacher',
  'Quy hoạch động 1D / Dãy con tăng dài nhất (LIS)': '1D dynamic programming / LIS',
  'Quy hoạch động 2D / Grid / Mê cung': '2D dynamic programming / grids / mazes',
  'Quy hoạch động Balo (Knapsack)': 'Knapsack dynamic programming', 'Quy hoạch động trên cây (Tree DP)': 'Tree dynamic programming',
  'Quy hoạch động Bitmask': 'Bitmask dynamic programming', 'Quy hoạch động chữ số (Digit DP)': 'Digit dynamic programming',
  'Tìm kiếm nhị phân (Binary Search)': 'Binary search', 'Hai con trỏ (Two Pointers)': 'Two pointers',
  'Tham lam (Greedy)': 'Greedy algorithms', 'Sắp xếp & Rời rạc hóa': 'Sorting & coordinate compression',
  'Nhân ma trận số học': 'Matrix multiplication', 'Toán học & Lý thuyết số (SNT, Ước, Modular)': 'Mathematics & number theory',
  'Nhiều test con (Multi-case)': 'Multiple test cases',
};
const topicCategories: Record<string, string> = {
  'Cờ vua': 'Chess', 'Lý thuyết Đồ thị': 'Graph theory', 'Cấu trúc dữ liệu': 'Data structures',
  'Xử lý xâu': 'String algorithms', 'Quy hoạch động': 'Dynamic programming', 'Thuật toán & Kỹ năng': 'Algorithms & techniques',
};
export const topicLabel = (topic: AlgorithmTopic, language: Language) => language === 'en'
  ? `${topicNames[topic.name] ?? topic.name} (${topic.source} · ${topicCategories[topic.category] ?? topic.category})`
  : `${topic.name} (${topic.source} · ${topic.category})`;
