export interface AlgorithmTopic {
  category: string;
  name: string;
  recommendedProblemId: string;
  source: 'VNOI' | 'Codeforces' | 'QBOJ' | 'LQDOJ' | 'LTOJ' | 'DMOJ' | 'OjGen';
  exampleProblem?: string;
}

export const ALGORITHM_TOPICS: AlgorithmTopic[] = [
  // Cờ vua
  { category: 'Cờ vua', name: 'Đếm nước đi của quân Mã', recommendedProblemId: 'chess_moves', source: 'OjGen' },
  { category: 'Cờ vua', name: 'Đếm nước đi của quân cờ', recommendedProblemId: 'chess_piece_moves', source: 'OjGen' },
  { category: 'Cờ vua', name: 'Liệt kê ô quân Mã có thể đi', recommendedProblemId: 'chess_knight_targets', source: 'OjGen' },
  { category: 'Cờ vua', name: 'Kiểm tra Mã đi một nước', recommendedProblemId: 'chess_knight_reachability', source: 'OjGen' },
  { category: 'Cờ vua', name: 'Đường đi ngắn nhất của quân Mã', recommendedProblemId: 'chess_knight_shortest', source: 'OjGen' },

  // Lý thuyết Đồ thị
  { category: 'Lý thuyết Đồ thị', name: 'DFS / BFS', recommendedProblemId: 'graph', source: 'VNOI' },
  { category: 'Lý thuyết Đồ thị', name: 'Chu trình Euler', recommendedProblemId: 'graph', source: 'VNOI' },
  { category: 'Lý thuyết Đồ thị', name: 'Đường đi ngắn nhất - Dijkstra', recommendedProblemId: 'graph', source: 'VNOI' },
  { category: 'Lý thuyết Đồ thị', name: 'Cây khung nhỏ nhất (MST)', recommendedProblemId: 'graph', source: 'VNOI' },
  { category: 'Lý thuyết Đồ thị', name: 'Thành phần liên thông mạnh (SCC)', recommendedProblemId: 'graph', source: 'VNOI' },
  { category: 'Lý thuyết Đồ thị', name: 'Topo sort (Sắp xếp tô-pô)', recommendedProblemId: 'graph', source: 'VNOI' },
  { category: 'Lý thuyết Đồ thị', name: 'Cây (LCA & Euler Tour)', recommendedProblemId: 'tree', source: 'VNOI' },
  { category: 'Lý thuyết Đồ thị', name: 'Disjoint Set Union (DSU)', recommendedProblemId: 'graph', source: 'VNOI' },
  { category: 'Lý thuyết Đồ thị', name: 'Đồ thị hai phía (Bipartite)', recommendedProblemId: 'graph', source: 'VNOI' },

  // Cấu trúc dữ liệu
  { category: 'Cấu trúc dữ liệu', name: 'Mảng cộng dồn (Prefix Sum)', recommendedProblemId: 'prefix_sum_range', source: 'VNOI', exampleProblem: 'sumarr' },
  { category: 'Cấu trúc dữ liệu', name: 'Tổng dãy con theo truy vấn (TDC)', recommendedProblemId: 'prefix_subsequence_range', source: 'QBOJ', exampleProblem: 'TDC' },
  { category: 'Cấu trúc dữ liệu', name: 'Segment Tree / Fenwick Tree (BIT)', recommendedProblemId: 'queries', source: 'VNOI' },
  { category: 'Cấu trúc dữ liệu', name: 'Monotonic Stack / Queue', recommendedProblemId: 'array', source: 'VNOI' },
  { category: 'Cấu trúc dữ liệu', name: 'Sparse Table / RMQ', recommendedProblemId: 'array', source: 'VNOI' },
  { category: 'Cấu trúc dữ liệu', name: 'Heavy Light Decomposition (HLD)', recommendedProblemId: 'tree', source: 'VNOI' },
  { category: 'Cấu trúc dữ liệu', name: 'Ma trận 2D / Fenwick 2D', recommendedProblemId: 'matrix', source: 'VNOI' },
  { category: 'Cấu trúc dữ liệu', name: 'Tập đoạn thẳng / Li Chao Tree', recommendedProblemId: 'pairs', source: 'VNOI' },

  // Xử lý xâu
  { category: 'Xử lý xâu', name: 'String Hashing (Băm xâu)', recommendedProblemId: 'string', source: 'VNOI' },
  { category: 'Xử lý xâu', name: 'Trie (Cây tiền tố)', recommendedProblemId: 'string', source: 'VNOI' },
  { category: 'Xử lý xâu', name: 'KMP (Knuth-Morris-Pratt)', recommendedProblemId: 'string', source: 'VNOI' },
  { category: 'Xử lý xâu', name: 'Z-algorithm', recommendedProblemId: 'string', source: 'VNOI' },
  { category: 'Xử lý xâu', name: 'Xâu đối xứng (Manacher / Palindrome)', recommendedProblemId: 'string', source: 'VNOI' },

  // Quy hoạch động
  { category: 'Quy hoạch động', name: 'Quy hoạch động 1D / Dãy con tăng dài nhất (LIS)', recommendedProblemId: 'array', source: 'VNOI' },
  { category: 'Quy hoạch động', name: 'Quy hoạch động 2D / Grid / Mê cung', recommendedProblemId: 'grid', source: 'VNOI' },
  { category: 'Quy hoạch động', name: 'Quy hoạch động Balo (Knapsack)', recommendedProblemId: 'pairs', source: 'VNOI' },
  { category: 'Quy hoạch động', name: 'Quy hoạch động trên cây (Tree DP)', recommendedProblemId: 'tree', source: 'VNOI' },
  { category: 'Quy hoạch động', name: 'Quy hoạch động Bitmask', recommendedProblemId: 'array', source: 'VNOI' },
  { category: 'Quy hoạch động', name: 'Quy hoạch động chữ số (Digit DP)', recommendedProblemId: 'single_n', source: 'VNOI' },

  // Thuật toán & Kỹ năng khác
  { category: 'Thuật thuật & Kỹ năng', name: 'Tìm kiếm nhị phân (Binary Search)', recommendedProblemId: 'array', source: 'LQDOJ' },
  { category: 'Thuật thuật & Kỹ năng', name: 'Hai con trỏ (Two Pointers)', recommendedProblemId: 'array', source: 'LQDOJ' },
  { category: 'Thuật thuật & Kỹ năng', name: 'Tham lam (Greedy)', recommendedProblemId: 'pairs', source: 'LQDOJ' },
  { category: 'Thuật thuật & Kỹ năng', name: 'Sắp xếp & Rời rạc hóa', recommendedProblemId: 'array', source: 'LTOJ' },
  { category: 'Thuật thuật & Kỹ năng', name: 'Nhân ma trận số học', recommendedProblemId: 'matrix', source: 'DMOJ' },
  { category: 'Thuật thuật & Kỹ năng', name: 'Toán học & Lý thuyết số (SNT, Ước, Modular)', recommendedProblemId: 'single_n', source: 'Codeforces', exampleProblem: '1360A' },
  { category: 'Thuật thuật & Kỹ năng', name: 'Nhiều test con (Multi-case)', recommendedProblemId: 'multi_test', source: 'Codeforces', exampleProblem: '1800A' },
];

export function getTopicUrl(topic: AlgorithmTopic): string | null {
  if (!topic.exampleProblem) return null;
  const p = topic.exampleProblem.split(' ')[0];
  if (topic.source === 'QBOJ') return `http://qboj.zapto.org/problem/${p}`;
  if (topic.source === 'LQDOJ') return `https://lqdoj.edu.vn/problem/${p.toLowerCase()}`;
  if (topic.source === 'LTOJ') return `https://ltoj.edu.vn/problem/${p.toLowerCase()}`;
  if (topic.source === 'DMOJ') return `https://dmoj.ca/problem/${p.toLowerCase()}`;
  if (topic.source === 'Codeforces') {
    const match = p.match(/^(\d+)([A-Z]\d*)$/);
    if (match) return `https://codeforces.com/problemset/problem/${match[1]}/${match[2]}`;
  }
  return null;
}
