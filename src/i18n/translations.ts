export type Language = 'vi' | 'en';

export interface Translations {
  common: {
    ready: string;
    cancel: string;
    save: string;
    delete: string;
    copy: string;
    copied: string;
    close: string;
    search: string;
    clear: string;
    download: string;
    edit: string;
    preview: string;
    loading: string;
    success: string;
    error: string;
    warning: string;
    info: string;
    all: string;
    total: string;
    none: string;
    empty: string;
    bytes: string;
    random: string;
  };
  header: {
    appName: string;
    version: string;
    tagline: string;
    problemSetup: string;
    package: string;
    shortcuts: string;
    themeToggle: string;
    langToggle: string;
    fileMenu: string;
    toolsMenu: string;
    helpMenu: string;
    saveProject: string;
    openProject: string;
    editStatement: string;
    packageProblem: string;
    testPlan: string;
    differential: string;
    solutionMatrix: string;
    queueManager: string;
    scaffolds: string;
    runSelfTest: string;
    shortcutsTable: string;
    docs: string;
    about: string;
  };
  tabs: {
    generator: string;
    log: string;
    inventory: string;
    statement: string;
    differential: string;
    scaffolds: string;
    help: string;
  };
  generator: {
    templateHeading: string;
    templateDesc: string;
    templatesCount: string;
    algorithmTopics: string;
    clearFilter: string;
    topicPlaceholder: string;
    selectTopicPlaceholder: string;
    mainCategory: string;
    inputTemplate: string;
    subtasksBtn: string;
    groupsBtn: string;
    manualTestsBtn: string;
    differentialBtn: string;
    diffBtn: string;
    officialFormat: string;
    paramsHeading: string;
    paramsTitle: string;
    generationTitle: string;
    generationSubtitle: string;
    testCountLabel: string;
    seedLabel: string;
    seedPlaceholder: string;
    newSeedBtn: string;
    generateBtn: string;
    generatingBtn: string;
    cancelBtn: string;
    previewSampleBtn: string;
    previewBtn: string;
    zipCheckbox: string;
    autoZip: string;
    solverPrefix: string;
    progressLabel: string;
    successResult: string;
    coverageBtn: string;
    inventoryBtn: string;
    previewHeading: string;
    previewTitle: string;
    previewDesc: string;
    previewSubtitle: string;
    noPreviewHeading: string;
    noPreview: string;
    noPreviewDesc: string;
    copyPreview: string;
    copiedPreview: string;
    arrayTypeLabel: string;
    arrayModeRange: string;
    arrayModePerm: string;
    distinctLabel: string;
    sortLabel: string;
    sortRandom: string;
    sortAsc: string;
    sortDesc: string;
  };
  log: {
    title: string;
    lines: string;
    clearBtn: string;
    copyBtn: string;
    copiedBtn: string;
    exportBtn: string;
    empty: string;
  };
  inventory: {
    title: string;
    testsCount: string;
    searchPlaceholder: string;
    allGroups: string;
    exportCsv: string;
    emptyTitle: string;
    emptyDesc: string;
    listTitle: string;
    sizeTitle: string;
    textMode: string;
    visualMode: string;
    inputTitle: string;
    outputTitle: string;
    selectHint: string;
    seedLabel: string;
    sizeLabel: string;
    graphTooLarge: string;
    gridTooLarge: string;
    distributionTitle: string;
  };
  statement: {
    title: string;
    subtitle: string;
    checkConsistency: string;
    editMode: string;
    previewMode: string;
    nameLabel: string;
    codeLabel: string;
    timeLimitLabel: string;
    memoryLimitLabel: string;
    descLabel: string;
    descPlaceholder: string;
    inputFormatLabel: string;
    outputFormatLabel: string;
    constraintsLabel: string;
    samplesTitle: string;
    addSample: string;
    exampleIndex: string;
    autoSolveTip: string;
    deleteTip: string;
    sampleInputLabel: string;
    sampleOutputLabel: string;
    sampleExplainLabel: string;
    consistentNotice: string;
  };
  differential: {
    title: string;
    subtitle: string;
    configTitle: string;
    testCountLabel: string;
    candidateLabel: string;
    buggySum: string;
    customCode: string;
    customCodeDesc: string;
    shrinkerCheckbox: string;
    startBtn: string;
    runningBtn: string;
    resultsTitle: string;
    allMatch: string;
    mismatchesFound: string;
    emptyResults: string;
    originalCase: string;
    minimizedCase: string;
    candidateOutput: string;
    standardOutput: string;
    reductionSummary: string;
  };
  scaffolds: {
    title: string;
    subtitle: string;
    selectTemplate: string;
    copyCode: string;
    copiedCode: string;
    downloadCode: string;
    tplValidator: string;
    tplChecker: string;
    tplSolution: string;
    tplGenScript: string;
    descValidator: string;
    descChecker: string;
    descSolution: string;
    descGenScript: string;
  };
  help: {
    title: string;
    subtitle: string;
    sec1Title: string;
    sec1P1: string;
    sec1P2: string;
    sec1P3: string;
    sec1P4: string;
    sec2Title: string;
    sec3Title: string;
    sec3Desc: string;
    sec4Title: string;
    sec4Desc: string;
    sec5Title: string;
  };
  statusBar: {
    ready: string;
    generating: string;
    template: string;
    seed: string;
    test: string;
    themeDark: string;
    themeLight: string;
    lang: string;
  };
  modals: {
    problemSetup: {
      title: string;
      subtitle: string;
      nameLabel: string;
      codeLabel: string;
      timeLimit: string;
      memoryLimit: string;
      save: string;
      cancel: string;
    };
    package: {
      title: string;
      subtitle: string;
      formatLabel: string;
      packageName: string;
      ojgenDesc: string;
      kattisDesc: string;
      testCount: string;
      statementAttached: string;
      checksumPreserved: string;
      yes: string;
      cancel: string;
      downloadBtn: string;
      exporting: string;
    };
    testPlan: {
      title: string;
      totalTests: string;
      totalScore: string;
      addGroup: string;
      presetsBtn: string;
      groupName: string;
      tests: string;
      score: string;
      coverageTags: string;
      empty: string;
      cancel: string;
      save: string;
    };
    manualTests: {
      title: string;
      subtitle: string;
      addBtn: string;
      total: string;
      empty: string;
      isSample: string;
      solveBtn: string;
      validNotice: string;
      cancel: string;
      save: string;
    };
    solutionMatrix: {
      title: string;
      subtitle: string;
      runBtn: string;
      runningBtn: string;
      testsReady: string;
      noTests: string;
      emptyDesc: string;
      testCol: string;
      timeCol: string;
      memoryCol: string;
    };
    coverage: {
      title: string;
      observed: string;
      suggestions: string;
      disclaimer: string;
      close: string;
    };
    queue: {
      title: string;
      subtitle: string;
      currentJob: string;
      addCurrent: string;
      runQueue: string;
      empty: string;
      statusReady: string;
    };
    shortcuts: {
      title: string;
      badge: string;
      subtitle: string;
      globalSection: string;
      fileSection: string;
      navSection: string;
      tip: string;
      close: string;
    };
  };
  categories: Record<string, string>;
  problemTitles: Record<string, string>;
  problemFormats: Record<string, string>;
  paramLabels: Record<string, string>;
  topics: Record<string, string>;
}

export const translations: Record<Language, Translations> = {
  vi: {
    common: {
      ready: 'Sẵn sàng',
      cancel: 'Hủy',
      save: 'Lưu',
      delete: 'Xóa',
      copy: 'Sao chép',
      copied: 'Đã sao chép',
      close: 'Đóng',
      search: 'Tìm kiếm',
      clear: 'Xóa',
      download: 'Tải xuống',
      edit: 'Chỉnh sửa',
      preview: 'Xem trước',
      loading: 'Đang tải...',
      success: 'Thành công',
      error: 'Lỗi',
      warning: 'Cảnh báo',
      info: 'Thông tin',
      all: 'Tất cả',
      total: 'Tổng số',
      none: 'Không có',
      empty: 'Trống',
      bytes: 'bytes',
      random: 'Ngẫu nhiên',
    },
    header: {
      appName: 'OjGen Web',
      version: 'v3.3.0',
      tagline: 'Trình tạo & kiểm định bộ test',
      problemSetup: 'Thiết lập bài',
      package: 'Đóng gói',
      shortcuts: 'Phím tắt',
      themeToggle: 'Đổi chủ đề Sáng / Tối',
      langToggle: 'Chuyển sang Tiếng Anh (Switch to English)',
      fileMenu: 'Tệp',
      toolsMenu: 'Công cụ',
      helpMenu: 'Trợ giúp',
      saveProject: 'Lưu dự án (.ojproject)',
      openProject: 'Mở dự án…',
      editStatement: 'Soạn nội dung đề…',
      packageProblem: 'Đóng gói bài tập…',
      testPlan: 'Kế hoạch nhóm test / Subtasks…',
      differential: 'Kiểm thử đối chiếu & Thu nhỏ lỗi',
      solutionMatrix: 'Ma trận nhiều lời giải (AC/WA/TLE)',
      queueManager: 'Quản lý hàng đợi sinh test…',
      scaffolds: 'Tạo khung Validator / Checker…',
      runSelfTest: 'Chạy kiểm tra nội bộ (Selftest)',
      shortcutsTable: 'Bảng phím tắt bàn phím',
      docs: 'Hướng dẫn sử dụng',
      about: 'Về OjGen Web 3.3.0',
    },
    tabs: {
      generator: 'Tạo test',
      log: 'Nhật ký',
      inventory: 'Kiểm kê',
      statement: 'Soạn đề bài',
      differential: 'Đối chiếu & Thu nhỏ',
      scaffolds: 'Khung mã nguồn',
      help: 'Hướng dẫn',
    },
    generator: {
      templateHeading: 'Khuôn bài toán',
      templateDesc: 'Chọn cấu trúc input phù hợp với đề thi',
      templatesCount: '19 khuôn',
      algorithmTopics: 'Chủ đề thuật toán gợi ý',
      clearFilter: 'Xóa lọc',
      topicPlaceholder: '-- Chọn chủ đề gợi ý (VNOI, CF, QBOJ...) --',
      selectTopicPlaceholder: '-- Chọn chủ đề gợi ý (VNOI, CF, QBOJ...) --',
      mainCategory: 'Dạng chính',
      inputTemplate: 'Khuôn input',
      subtasksBtn: 'Nhóm',
      groupsBtn: 'Nhóm ({count})',
      manualTestsBtn: 'Test tay ({count})',
      differentialBtn: 'Đối chiếu',
      diffBtn: 'Đối chiếu',
      officialFormat: 'Định dạng input chính thức',
      paramsHeading: 'Tham số sinh dữ liệu',
      paramsTitle: 'Tham số sinh dữ liệu',
      generationTitle: 'Tạo bộ test & Xuất dữ liệu',
      generationSubtitle: 'Bộ sinh Mersenne Twister 64-bit · Lời giải chuẩn: {id}',
      testCountLabel: 'Số lượng test sinh tự động',
      seedLabel: 'Seed ngẫu nhiên (tái lập test)',
      seedPlaceholder: 'Để trống = ngẫu nhiên',
      newSeedBtn: 'Tạo seed ngẫu nhiên mới',
      generateBtn: 'Tạo bộ test',
      generatingBtn: 'Đang tạo bộ test...',
      cancelBtn: 'Hủy',
      previewSampleBtn: 'Xem thử mẫu',
      previewBtn: 'Xem thử mẫu',
      zipCheckbox: 'Tự động nén và tải ZIP sau khi tạo',
      autoZip: 'Tự động nén và tải ZIP sau khi tạo',
      solverPrefix: 'Giải:',
      progressLabel: 'Đang tạo test ({pct}%)...',
      successResult: 'Đã tạo thành công {count} test (gồm {manual} test tay/mẫu) với Seed: {seed}',
      coverageBtn: 'Độ phủ',
      inventoryBtn: 'Kiểm kê ({count})',
      previewHeading: 'Xem trước input & output',
      previewTitle: 'Xem trước input & output',
      previewDesc: 'Kiểm tra 1 test được sinh với cấu hình và seed hiện tại',
      previewSubtitle: 'Kiểm tra 1 test được sinh với cấu hình và seed hiện tại',
      noPreviewHeading: 'Chưa có dữ liệu xem trước',
      noPreview: 'Chưa có dữ liệu xem trước',
      noPreviewDesc: 'Nhấn "Xem thử mẫu" ở trên để sinh thử 1 test theo cấu hình và seed hiện tại, kèm đáp án chuẩn sinh ra.',
      copyPreview: 'Sao chép',
      copiedPreview: 'Đã sao chép',
      arrayTypeLabel: 'Kiểu mảng',
      arrayModeRange: 'Giá trị trong khoảng',
      arrayModePerm: 'Hoán vị 1..n',
      distinctLabel: 'Các phần tử đôi một khác nhau?',
      sortLabel: 'Sắp xếp',
      sortRandom: 'Ngẫu nhiên',
      sortAsc: 'Không giảm (tăng dần)',
      sortDesc: 'Không tăng (giảm dần)',
    },
    log: {
      title: 'Nhật ký hoạt động',
      lines: 'dòng',
      clearBtn: 'Xóa nhật ký',
      copyBtn: 'Sao chép',
      copiedBtn: 'Đã sao chép',
      exportBtn: 'Lưu ra file…',
      empty: 'Chưa có nhật ký ghi nhận.',
    },
    inventory: {
      title: 'Kiểm kê & Trực quan hóa bộ test',
      testsCount: 'test hiện có',
      searchPlaceholder: 'Tìm theo tên/nhãn...',
      allGroups: 'Tất cả nhóm',
      exportCsv: 'Xuất CSV',
      emptyTitle: 'Chưa có test nào được tạo.',
      emptyDesc: 'Hãy sang tab "Tạo test" và nhấn nút "Tạo bộ test".',
      listTitle: 'Danh sách test',
      sizeTitle: 'Dung lượng',
      textMode: 'Văn bản (.inp / .out)',
      visualMode: 'Trực quan hóa',
      inputTitle: 'Dữ liệu vào (.inp)',
      outputTitle: 'Đáp án chuẩn (.out)',
      selectHint: 'Chọn một test từ danh sách bên trái để kiểm tra',
      seedLabel: 'Seed',
      sizeLabel: 'Dung lượng',
      graphTooLarge: 'Đồ thị có {n} đỉnh (quá lớn để hiển thị trực quan trực tiếp).',
      gridTooLarge: 'Lưới kích thước {rows}×{cols} vượt giới hạn hiển thị chi tiết (≤ 30×30).',
      distributionTitle: 'Phân phối tần số {count} giá trị',
    },
    statement: {
      title: 'Soạn thảo đề bài (Problem Statement)',
      subtitle: 'Hỗ trợ định dạng đề thi chuẩn VNOI, QBOJ, Codeforces, Kattis',
      checkConsistency: 'Kiểm tra nhất quán với cấu hình',
      editMode: 'Chỉnh sửa',
      previewMode: 'Xem trước đề',
      nameLabel: 'Tên bài toán',
      codeLabel: 'Mã bài (Code)',
      timeLimitLabel: 'Giới hạn thời gian (ms)',
      memoryLimitLabel: 'Giới hạn bộ nhớ (MB)',
      descLabel: 'Mô tả đề bài (Description)',
      descPlaceholder: 'Nhập nội dung đề bài...',
      inputFormatLabel: 'Dữ liệu vào (Input Format)',
      outputFormatLabel: 'Dữ liệu ra (Output Format)',
      constraintsLabel: 'Ràng buộc (Constraints)',
      samplesTitle: 'Ví dụ (Sample Tests)',
      addSample: 'Thêm ví dụ',
      exampleIndex: 'Ví dụ {idx}',
      autoSolveTip: 'Tự động tính output bằng lời giải chuẩn',
      deleteTip: 'Xóa ví dụ',
      sampleInputLabel: 'Input:',
      sampleOutputLabel: 'Output chuẩn:',
      sampleExplainLabel: 'Giải thích (tùy chọn):',
      consistentNotice: 'Cấu hình và ràng buộc đề bài hoàn toàn nhất quán!',
    },
    differential: {
      title: 'Kiểm thử đối chiếu & Thu nhỏ phản ví dụ (Shrinker)',
      subtitle: 'Chạy đối chiếu lời giải chuẩn với lời giải cần thử trên các test ngẫu nhiên, tự động rút gọn input gây lỗi',
      configTitle: 'Cấu hình kiểm thử',
      testCountLabel: 'Số lượng test kiểm thử',
      candidateLabel: 'Lời giải ứng viên cần thử',
      buggySum: 'Lời giải lỗi cộng dồn (Bỏ sót phần tử đầu khi n > 3)',
      customCode: 'Mã nguồn JavaScript tùy biến (Hàm solve(input))',
      customCodeDesc: 'Nhập mã nguồn JS của bạn. Hàm solve(input) nhận chuỗi input và trả về kết quả chuẩn.',
      shrinkerCheckbox: 'Tự động thu nhỏ phản ví dụ (Shrinker kích thước/giá trị)',
      startBtn: 'Bắt đầu kiểm thử đối chiếu',
      runningBtn: 'Đang kiểm thử đối chiếu...',
      resultsTitle: 'Kết quả đối chiếu',
      allMatch: 'TẤT CẢ KHỚP (OK)',
      mismatchesFound: 'PHÁT HIỆN {count} PHẢN VÍ DỤ',
      emptyResults: 'Nhấn "Bắt đầu kiểm thử đối chiếu" để chạy so sánh hai lời giải.',
      originalCase: 'Phản ví dụ ban đầu ({bytes} bytes)',
      minimizedCase: 'Phản ví dụ đã thu nhỏ ({bytes} bytes)',
      candidateOutput: 'Đáp án ứng viên (Sai)',
      standardOutput: 'Đáp án chuẩn (AC)',
      reductionSummary: 'Đã thu nhỏ từ {origBytes}B xuống {minBytes}B sau {steps} bước rút gọn.',
    },
    scaffolds: {
      title: 'Khung mã nguồn & Template kiểm định',
      subtitle: 'Tạo mã nguồn mẫu chuẩn cho Lời giải (C++ / Python), Validator và Checker theo chuẩn Testlib',
      selectTemplate: 'Chọn khung template',
      copyCode: 'Sao chép mã',
      copiedCode: 'Đã sao chép mã',
      downloadCode: 'Tải mã nguồn',
      tplValidator: 'Bộ kiểm định Input (Validator / Testlib.h)',
      tplChecker: 'Bộ chấm bài tự do (Custom Checker / Testlib.h)',
      tplSolution: 'Khung lời giải chuẩn (C++ Reference Solution)',
      tplGenScript: 'Kịch bản sinh độc lập (Python Generator Script)',
      descValidator: 'Mã nguồn C++ dùng testlib.h để kiểm tra dữ liệu vào đúng ràng buộc bài toán.',
      descChecker: 'Mã nguồn C++ chấm bài với nhiều đáp án đúng, số thực sai số hoặc thứ tự tùy ý.',
      descSolution: 'Khung mã nguồn C++ có sẵn cấu trúc đọc input tối ưu theo khuôn bài đã chọn.',
      descGenScript: 'Kịch bản Python độc lập có thể chạy trực tiếp trên máy chấm để sinh lại test ngẫu nhiên.',
    },
    help: {
      title: 'Hướng dẫn sử dụng OjGen 3.3.0 Web',
      subtitle: 'Bộ công cụ tạo test tự động, kiểm định và đóng gói đề thi lập trình thi đấu',
      sec1Title: '1. Quy trình tạo bộ test',
      sec1P1: '• Bước 1: Chọn khuôn bài toán. Có thể chọn nhanh từ danh mục chủ đề thuật toán (VNOI, Codeforces, QBOJ, LQDOJ, LTOJ, DMOJ) để lấy gợi ý khuôn phù hợp nhất với cấu trúc dữ liệu của đề.',
      sec1P2: '• Bước 2: Tùy chỉnh tham số sinh test. Điều chỉnh số lượng phần tử N, khoảng giá trị min/max, chế độ hoán vị, độ dài chuỗi, số lượng truy vấn Q, hoặc các đặc tính đồ thị (liên thông, có trọng số, DAG).',
      sec1P3: '• Bước 3: Chia nhóm test (Subtasks). Dùng tính năng "Nhóm test" để phân chia tối đa 100 nhóm có điểm số, điều kiện tiên quyết, nhãn độ phủ (small, boundary, stress, adversarial) hoặc tạo nhanh bằng nút "Adversarial Presets".',
      sec1P4: '• Bước 4: Kiểm tra input mẫu và Tạo bộ test. Nhấn "Xem thử mẫu" để xem trước 1 test được sinh. Sau đó nhấn "Tạo bộ test" (hoặc Ctrl+G) để sinh test; ZIP chỉ tự tải nếu bật tùy chọn "Tự động nén và tải ZIP sau khi tạo".',
      sec2Title: '2. Danh sách 19 cấu trúc input được hỗ trợ',
      sec3Title: '3. Kiểm thử đối chiếu & Shrinker cấu trúc',
      sec3Desc: 'Shrinker hiện là heuristic cơ bản cho input mảng hai dòng: thử bỏ bớt phần tử và giảm giá trị số về 0, tối đa 64 lượt thử. Nó chưa thu nhỏ cấu trúc graph, tree, grid hoặc truy vấn. Hãy chạy lại phản ví dụ đã thu nhỏ để xác nhận lỗi vẫn còn.',
      sec4Title: '4. Đóng gói chuẩn Kattis PPF và OjGen',
      sec4Desc: 'Gói OjGen Standard chứa dữ liệu input/output, PACKAGE_SHA256SUMS.txt, inventory.csv, provenance.json và đề Markdown nếu có. Gói Kattis tạo problem.yaml, data/sample, data/secret và đề tiếng Việt nếu có; gói này hiện không kèm checksum hoặc inventory. Hãy kiểm tra lại cấu trúc và metadata theo yêu cầu của hệ thống chấm đích trước khi nộp.',
      sec5Title: '5. Phím tắt bàn phím tiện ích (Global Shortcuts)',
    },
    statusBar: {
      ready: 'Sẵn sàng',
      generating: 'Đang tạo test...',
      template: 'Khuôn',
      seed: 'Seed',
      test: 'Test',
      themeDark: 'Chủ đề: Tối',
      themeLight: 'Chủ đề: Sáng',
      lang: 'Ngôn ngữ: Tiếng Việt',
    },
    modals: {
      problemSetup: {
        title: 'Thiết lập hồ sơ bài toán',
        subtitle: 'Thông tin cơ bản dùng khi xuất cấu hình và đóng gói bài',
        nameLabel: 'Tên bài toán',
        codeLabel: 'Mã bài (Code)',
        timeLimit: 'Thời gian chạy (ms)',
        memoryLimit: 'Bộ nhớ tối đa (MB)',
        save: 'Lưu thiết lập',
        cancel: 'Hủy',
      },
      package: {
        title: 'Đóng gói bài thi (Problem Packaging)',
        subtitle: 'Xuất toàn bộ bộ test, lời giải và metadata thành tệp ZIP chuẩn',
        formatLabel: 'Định dạng gói xuất',
        packageName: 'Tên gói / Thư mục gốc',
        ojgenDesc: 'tests/testXX.inp + out, SHA-256 checksum, inventory.csv, provenance.json',
        kattisDesc: 'data/sample, data/secret, problem.yaml theo chuẩn Kattis / ICPC',
        testCount: 'Số lượng test xuất:',
        statementAttached: 'Đề bài đính kèm:',
        checksumPreserved: 'Bảo toàn checksum:',
        yes: 'Có (Markdown)',
        cancel: 'Hủy',
        downloadBtn: 'Tải gói ZIP',
        exporting: 'Đang đóng gói...',
      },
      testPlan: {
        title: 'Kế hoạch phân nhóm test (Subtasks)',
        totalTests: 'Tổng test:',
        totalScore: 'Tổng điểm:',
        addGroup: 'Thêm nhóm',
        presetsBtn: 'Tạo nhanh Adversarial Presets',
        groupName: 'Tên nhóm',
        tests: 'Số test:',
        score: 'Điểm:',
        coverageTags: 'Nhãn độ phủ:',
        empty: 'Chưa có nhóm nào. Nhấn "Thêm nhóm" hoặc dùng "Tạo nhanh Adversarial Presets".',
        cancel: 'Hủy',
        save: 'Lưu kế hoạch',
      },
      manualTests: {
        title: 'Test nhập tay / Test mẫu (Sample tests)',
        subtitle: 'Nhập các ca kiểm thử đặc thù và tự động sinh output chuẩn',
        addBtn: 'Thêm test tay',
        total: 'Tổng:',
        empty: 'Chưa có test nhập tay nào. Nhấn "Thêm test tay" để dán test đề bài.',
        isSample: 'Đánh dấu Sample',
        solveBtn: 'Xác thực & Giải',
        validNotice: 'Input hợp lệ theo khuôn bài toán!',
        cancel: 'Hủy',
        save: 'Lưu test tay',
      },
      solutionMatrix: {
        title: 'So sánh ma trận nhiều lời giải (Solution Matrix)',
        subtitle: 'Kiểm tra tỷ lệ AC / WA / TLE của các thuật toán trên {count} test',
        runBtn: 'Chạy so sánh ma trận',
        runningBtn: 'Đang chạy ma trận...',
        testsReady: '{count} test sẵn sàng',
        noTests: 'Chưa có test nào được tạo.',
        emptyDesc: 'Nhấn "Chạy so sánh ma trận" để kiểm tra tính phân loại của bộ test đối với các lời giải đúng/sai/quá thời gian.',
        testCol: 'Test',
        timeCol: 'Thời gian',
        memoryCol: 'Bộ nhớ',
      },
      coverage: {
        title: 'Báo cáo độ phủ & Gợi ý trường hợp biên',
        observed: 'Đã quan sát được trong cấu hình:',
        suggestions: 'Gợi ý bổ sung test:',
        disclaimer: '* Các phép đo dùng định dạng input mà OjGen nhận diện; phân loại trường hợp mang tính heuristic, không thay thế việc rà soát logic đề.',
        close: 'Đóng',
      },
      queue: {
        title: 'Quản lý hàng đợi sinh test (Job Queue)',
        subtitle: 'Lập danh sách nhiều bài toán để sinh hàng loạt trong một phiên',
        currentJob: 'Cấu hình hiện tại:',
        addCurrent: 'Thêm cấu hình này vào hàng đợi',
        runQueue: 'Chạy tất cả tác vụ',
        empty: 'Hàng đợi đang trống.',
        statusReady: 'Sẵn sàng',
      },
      shortcuts: {
        title: 'Phím tắt bàn phím OjGen',
        badge: 'Global Shortcuts',
        subtitle: 'Thao tác nhanh chóng từ mọi vị trí trong ứng dụng',
        globalSection: 'Phím tắt tác vụ chính (Global)',
        fileSection: 'Tệp & Quản lý bài tập',
        navSection: 'Điều hướng tab & Hộp thoại',
        tip: 'Mẹo: Bạn có thể nhấn ? bất kỳ lúc nào để bật bảng này.',
        close: 'Đã hiểu',
      },
    },
    categories: {
      'Số và bộ giá trị': 'Số và bộ giá trị',
      'Dãy và truy vấn': 'Dãy và truy vấn',
      'Xâu và ký tự': 'Xâu và ký tự',
      'Ma trận và lưới': 'Ma trận và lưới',
      'Danh sách cặp và đoạn': 'Danh sách cặp và đoạn',
      'Đồ thị và cây': 'Đồ thị và cây',
      'Nhiều bộ test': 'Nhiều bộ test',
      'Dữ liệu tùy chỉnh': 'Dữ liệu tùy chỉnh',
    },
    problemTitles: {
      single_n: 'Một số nguyên N',
      two_ints: 'Hai số nguyên A B',
      array: 'Mảng một chiều / hoán vị',
      queries: 'Mảng và truy vấn',
      prefix_sum_range: 'Tiền tố: truy vấn tổng đoạn (QBOJ sumarr)',
      prefix_subsequence_range: 'Tiền tố: tổng dãy con theo truy vấn (QBOJ TDC)',
      string: 'Xâu ký tự',
      matrix: 'Ma trận / hai mảng (doublearr)',
      grid: 'Lưới ký tự',
      pairs: 'Danh sách cặp / đoạn',
      graph: 'Đồ thị',
      tree: 'Cây',
      multi_test: 'Nhiều bộ test (mảng / xâu)',
      custom: 'Tùy chỉnh: dãy số nguyên, giới hạn chung hoặc riêng từng vị trí',
      chess_moves: 'Cờ vua: Đếm nước đi của quân Mã',
      chess_piece_moves: 'Cờ vua: Đếm nước đi của quân cờ',
      chess_knight_targets: 'Cờ vua: Liệt kê ô quân Mã có thể đi',
      chess_knight_reachability: 'Cờ vua: Kiểm tra Mã đi một nước',
      chess_knight_shortest: 'Cờ vua: Đường đi ngắn nhất của quân Mã',
    },
    problemFormats: {
      single_n: 'Dòng duy nhất ghi số nguyên n (minN ≤ n ≤ maxN).\nVí dụ:\n42',
      two_ints: 'Dòng duy nhất ghi 2 số nguyên a và b.\norder = 0: a, b ngẫu nhiên độc lập trong [minVal, maxVal].\norder = 1: a ≤ b.\norder = 2: a < b.\nVí dụ:\n3 10',
      array: 'Dòng 1: số nguyên n (minN ≤ n ≤ maxN).\nDòng 2: n số nguyên a1 ... an (minVal ≤ ai ≤ maxVal), cách nhau một dấu cách.\nmode = 0: giá trị ngẫu nhiên theo [minVal, maxVal].\nmode = 1: hoán vị của 1..n (minVal/maxVal được ẩn).\ndistinct = 1: các phần tử đôi một khác nhau.\nsorted = 0: ngẫu nhiên, 1: không giảm, 2: không tăng.\nVí dụ:\n5\n3 -1 4 1 5',
    },
    paramLabels: {
      minN: 'Số phần tử nhỏ nhất (minN)',
      maxN: 'Số phần tử lớn nhất (maxN)',
      minVal: 'Giá trị phần tử nhỏ nhất',
      maxVal: 'Giá trị phần tử lớn nhất',
      distinct: 'Các phần tử đôi một khác nhau?',
      sorted: 'Sắp xếp',
      mode: 'Kiểu mảng',
      order: 'Thứ tự hai số',
      minQ: 'Số truy vấn nhỏ nhất (minQ)',
      maxQ: 'Số truy vấn lớn nhất (maxQ)',
      updatePct: 'Tỷ lệ % truy vấn cập nhật (loại 1)',
      minLength: 'Độ dài xâu nhỏ nhất',
      maxLength: 'Độ dài xâu lớn nhất',
      charset: 'Bộ ký tự cho phép',
      numRows: 'Số dòng ma trận (R)',
      numCols: 'Số cột ma trận (C)',
      matrixMode: 'Chế độ ma trận',
      includeST: 'Bao gồm điểm xuất phát S và đích T',
      wallPct: 'Tỷ lệ % chướng ngại vật (#)',
      numVertices: 'Số đỉnh đồ thị (V)',
      numEdges: 'Số cạnh đồ thị (E)',
      directed: 'Đồ thị có hướng?',
      connected: 'Đồ thị liên thông?',
      weighted: 'Đồ thị có trọng số?',
      allowSelfLoops: 'Cho phép khuyên (Self-loops)?',
      allowMultiEdges: 'Cho phép đa cạnh (Multi-edges)?',
      treeType: 'Dạng cây đặc thù',
      numCases: 'Số lượng bộ test con (T)',
    },
    topics: {
      'Cờ vua': 'Cờ vua',
      'Lý thuyết Đồ thị': 'Lý thuyết Đồ thị',
      'Cấu trúc dữ liệu': 'Cấu trúc dữ liệu',
      'Xử lý xâu': 'Xử lý xâu',
      'Quy hoạch động': 'Quy hoạch động',
      'Thuật thuật & Kỹ năng': 'Thuật toán & Kỹ năng',
      'Đếm nước đi của quân Mã': 'Đếm nước đi của quân Mã',
      'Đếm nước đi của quân cờ': 'Đếm nước đi của quân cờ',
      'Liệt kê ô quân Mã có thể đi': 'Liệt kê ô quân Mã có thể đi',
      'Kiểm tra Mã đi một nước': 'Kiểm tra Mã đi một nước',
      'Đường đi ngắn nhất của quân Mã': 'Đường đi ngắn nhất của quân Mã',
      'DFS / BFS': 'DFS / BFS',
      'Chu trình Euler': 'Chu trình Euler',
      'Đường đi ngắn nhất - Dijkstra': 'Đường đi ngắn nhất - Dijkstra',
      'Cây khung nhỏ nhất (MST)': 'Cây khung nhỏ nhất (MST)',
      'Thành phần liên thông mạnh (SCC)': 'Thành phần liên thông mạnh (SCC)',
      'Topo sort (Sắp xếp tô-pô)': 'Topo sort (Sắp xếp tô-pô)',
      'Cây (LCA & Euler Tour)': 'Cây (LCA & Euler Tour)',
      'Disjoint Set Union (DSU)': 'Disjoint Set Union (DSU)',
      'Đồ thị hai phía (Bipartite)': 'Đồ thị hai phía (Bipartite)',
      'Mảng cộng dồn (Prefix Sum)': 'Mảng cộng dồn (Prefix Sum)',
      'Tổng dãy con theo truy vấn (TDC)': 'Tổng dãy con theo truy vấn (TDC)',
      'Segment Tree / Fenwick Tree (BIT)': 'Segment Tree / Fenwick Tree (BIT)',
      'Monotonic Stack / Queue': 'Monotonic Stack / Queue',
      'Sparse Table / RMQ': 'Sparse Table / RMQ',
      'Heavy Light Decomposition (HLD)': 'Heavy Light Decomposition (HLD)',
      'Ma trận 2D / Fenwick 2D': 'Ma trận 2D / Fenwick 2D',
      'Tập đoạn thẳng / Li Chao Tree': 'Tập đoạn thẳng / Li Chao Tree',
      'String Hashing (Băm xâu)': 'String Hashing (Băm xâu)',
      'Trie (Cây tiền tố)': 'Trie (Cây tiền tố)',
      'KMP (Knuth-Morris-Pratt)': 'KMP (Knuth-Morris-Pratt)',
      'Z-algorithm': 'Z-algorithm',
      'Xâu đối xứng (Manacher / Palindrome)': 'Xâu đối xứng (Manacher / Palindrome)',
      'Quy hoạch động 1D / Dãy con tăng dài nhất (LIS)': 'Quy hoạch động 1D / Dãy con tăng dài nhất (LIS)',
      'Quy hoạch động 2D / Grid / Mê cung': 'Quy hoạch động 2D / Grid / Mê cung',
      'Quy hoạch động Balo (Knapsack)': 'Quy hoạch động Balo (Knapsack)',
      'Quy hoạch động trên cây (Tree DP)': 'Quy hoạch động trên cây (Tree DP)',
      'Quy hoạch động Bitmask': 'Quy hoạch động Bitmask',
      'Quy hoạch động chữ số (Digit DP)': 'Quy hoạch động chữ số (Digit DP)',
      'Tìm kiếm nhị phân (Binary Search)': 'Tìm kiếm nhị phân (Binary Search)',
      'Hai con trỏ (Two Pointers)': 'Hai con trỏ (Two Pointers)',
      'Tham lam (Greedy)': 'Tham lam (Greedy)',
      'Sắp xếp & Rời rạc hóa': 'Sắp xếp & Rời rạc hóa',
      'Nhân ma trận số học': 'Nhân ma trận số học',
      'Toán học & Lý thuyết số (SNT, Ước, Modular)': 'Toán học & Lý thuyết số (SNT, Ước, Modular)',
      'Nhiều test con (Multi-case)': 'Nhiều test con (Multi-case)',
    },
  },
  en: {
    common: {
      ready: 'Ready',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      copy: 'Copy',
      copied: 'Copied',
      close: 'Close',
      search: 'Search',
      clear: 'Clear',
      download: 'Download',
      edit: 'Edit',
      preview: 'Preview',
      loading: 'Loading...',
      success: 'Success',
      error: 'Error',
      warning: 'Warning',
      info: 'Info',
      all: 'All',
      total: 'Total',
      none: 'None',
      empty: 'Empty',
      bytes: 'bytes',
      random: 'Random',
    },
    header: {
      appName: 'OjGen Web',
      version: 'v3.3.0',
      tagline: 'Online Judge Testcase Generator & Authoring Suite',
      problemSetup: 'Problem Setup',
      package: 'Package',
      shortcuts: 'Shortcuts',
      themeToggle: 'Toggle Dark / Light Theme',
      langToggle: 'Chuyển sang Tiếng Việt (Switch to Vietnamese)',
      fileMenu: 'File',
      toolsMenu: 'Tools',
      helpMenu: 'Help',
      saveProject: 'Save Project (.ojproject)',
      openProject: 'Open Project…',
      editStatement: 'Edit Statement…',
      packageProblem: 'Package Problem…',
      testPlan: 'Test Plan / Subtasks…',
      differential: 'Differential Testing & Shrinker',
      solutionMatrix: 'Solution Matrix (AC/WA/TLE)',
      queueManager: 'Generation Job Queue…',
      scaffolds: 'Create Validator / Checker…',
      runSelfTest: 'Run Internal Verification (Selftest)',
      shortcutsTable: 'Keyboard Shortcuts Reference',
      docs: 'User Documentation',
      about: 'About OjGen Web 3.3.0',
    },
    tabs: {
      generator: 'Generate Tests',
      log: 'Logs',
      inventory: 'Inventory',
      statement: 'Statement Editor',
      differential: 'Differential & Shrinker',
      scaffolds: 'Code Scaffolds',
      help: 'Documentation',
    },
    generator: {
      templateHeading: 'Problem Template',
      templateDesc: 'Select an input structure matching your problem',
      templatesCount: '19 templates',
      algorithmTopics: 'Suggested Algorithm Topics',
      clearFilter: 'Clear filter',
      topicPlaceholder: '-- Select an algorithm topic (VNOI, CF, QBOJ...) --',
      selectTopicPlaceholder: '-- Select an algorithm topic (VNOI, CF, QBOJ...) --',
      mainCategory: 'Main Category',
      inputTemplate: 'Input Template',
      subtasksBtn: 'Subtasks',
      groupsBtn: 'Subtasks ({count})',
      manualTestsBtn: 'Manual Tests ({count})',
      differentialBtn: 'Differential',
      diffBtn: 'Differential',
      officialFormat: 'Official Input Format',
      paramsHeading: 'Generation Parameters',
      paramsTitle: 'Generation Parameters',
      generationTitle: 'Testcase Generation & Export',
      generationSubtitle: '64-bit Mersenne Twister · Reference solver: {id}',
      testCountLabel: 'Number of Automated Testcases',
      seedLabel: 'Random Seed (Reproducible)',
      seedPlaceholder: 'Blank = Random seed',
      newSeedBtn: 'Generate New Random Seed',
      generateBtn: 'Generate Testcases',
      generatingBtn: 'Generating testcases...',
      cancelBtn: 'Cancel',
      previewSampleBtn: 'Preview Sample',
      previewBtn: 'Preview Sample',
      zipCheckbox: 'Automatically compress and download ZIP after generation',
      autoZip: 'Automatically compress and download ZIP after generation',
      solverPrefix: 'Solver:',
      progressLabel: 'Generating tests ({pct}%)...',
      successResult: 'Successfully generated {count} tests (including {manual} manual/sample tests) with Seed: {seed}',
      coverageBtn: 'Coverage',
      inventoryBtn: 'Inventory ({count})',
      previewHeading: 'Preview Input & Output',
      previewTitle: 'Preview Input & Output',
      previewDesc: 'Inspect 1 test generated with current configuration and seed',
      previewSubtitle: 'Inspect 1 test generated with current configuration and seed',
      noPreviewHeading: 'No preview data yet',
      noPreview: 'No preview data yet',
      noPreviewDesc: 'Click "Preview Sample" above to generate a sample test with the current configuration, including standard output.',
      copyPreview: 'Copy',
      copiedPreview: 'Copied',
      arrayTypeLabel: 'Array Type',
      arrayModeRange: 'Values in Range [minVal .. maxVal]',
      arrayModePerm: 'Permutation of 1..n',
      distinctLabel: 'All elements pairwise distinct?',
      sortLabel: 'Sorting Order',
      sortRandom: 'Random order',
      sortAsc: 'Non-decreasing (Ascending)',
      sortDesc: 'Non-increasing (Descending)',
    },
    log: {
      title: 'Execution Logs',
      lines: 'lines',
      clearBtn: 'Clear Logs',
      copyBtn: 'Copy Logs',
      copiedBtn: 'Copied',
      exportBtn: 'Export to File…',
      empty: 'No execution logs recorded.',
    },
    inventory: {
      title: 'Testcase Inventory & Visualizer',
      testsCount: 'available tests',
      searchPlaceholder: 'Search by name/tag...',
      allGroups: 'All Groups',
      exportCsv: 'Export CSV',
      emptyTitle: 'No testcases have been generated yet.',
      emptyDesc: 'Go to the "Generate Tests" tab and click "Generate Testcases".',
      listTitle: 'Testcase List',
      sizeTitle: 'File Size',
      textMode: 'Text (.inp / .out)',
      visualMode: 'Visualization',
      inputTitle: 'Input Data (.inp)',
      outputTitle: 'Standard Output (.out)',
      selectHint: 'Select a testcase from the left column to inspect details',
      seedLabel: 'Seed',
      sizeLabel: 'Size',
      graphTooLarge: 'Graph contains {n} vertices (too large for live direct SVG render).',
      gridTooLarge: 'Grid dimensions {rows}×{cols} exceed detailed visual limits (≤ 30×30).',
      distributionTitle: 'Frequency distribution of {count} values',
    },
    statement: {
      title: 'Problem Statement Editor',
      subtitle: 'Supports standard competitive programming formats: VNOI, QBOJ, Codeforces, Kattis',
      checkConsistency: 'Check Consistency with Config',
      editMode: 'Edit',
      previewMode: 'Preview',
      nameLabel: 'Problem Title',
      codeLabel: 'Problem Code',
      timeLimitLabel: 'Time Limit (ms)',
      memoryLimitLabel: 'Memory Limit (MB)',
      descLabel: 'Problem Description',
      descPlaceholder: 'Write the problem description here...',
      inputFormatLabel: 'Input Format',
      outputFormatLabel: 'Output Format',
      constraintsLabel: 'Constraints',
      samplesTitle: 'Sample Tests',
      addSample: 'Add Sample',
      exampleIndex: 'Example {idx}',
      autoSolveTip: 'Automatically compute standard output using reference solver',
      deleteTip: 'Delete example',
      sampleInputLabel: 'Input:',
      sampleOutputLabel: 'Standard Output:',
      sampleExplainLabel: 'Explanation (optional):',
      consistentNotice: 'Configuration and problem constraints are fully consistent!',
    },
    differential: {
      title: 'Differential Testing & Counter-example Shrinker',
      subtitle: 'Test candidate solution against reference solver on random testcases, automatically minimizing failing inputs',
      configTitle: 'Test Configuration',
      testCountLabel: 'Number of Differential Testcases',
      candidateLabel: 'Candidate Solution to Test',
      buggySum: 'Buggy Prefix Sum (Skips first element when n > 3)',
      customCode: 'Custom JavaScript Solution (Function solve(input))',
      customCodeDesc: 'Enter custom JS code. The solve(input) function takes the raw input string and returns standard output.',
      shrinkerCheckbox: 'Automatically minimize counter-examples (Input Size/Value Shrinker)',
      startBtn: 'Start Differential Testing',
      runningBtn: 'Running Differential Tests...',
      resultsTitle: 'Differential Results',
      allMatch: 'ALL MATCH (OK)',
      mismatchesFound: 'FOUND {count} MISMATCHES',
      emptyResults: 'Click "Start Differential Testing" to compare candidate and reference solvers.',
      originalCase: 'Original Counter-example ({bytes} bytes)',
      minimizedCase: 'Minimized Counter-example ({bytes} bytes)',
      candidateOutput: 'Candidate Output (Wrong Answer)',
      standardOutput: 'Standard Output (Accepted)',
      reductionSummary: 'Reduced from {origBytes}B down to {minBytes}B after {steps} reduction steps.',
    },
    scaffolds: {
      title: 'Code Scaffolds & Testlib Templates',
      subtitle: 'Generate standard boilerplates for Solutions (C++ / Python), Validators, and Checkers using Testlib',
      selectTemplate: 'Select Boilerplate Template',
      copyCode: 'Copy Code',
      copiedCode: 'Copied Code',
      downloadCode: 'Download Source',
      tplValidator: 'Input Validator (Testlib.h)',
      tplChecker: 'Custom Checker (Testlib.h)',
      tplSolution: 'Reference Solution (C++ Boilerplate)',
      tplGenScript: 'Standalone Generator Script (Python)',
      descValidator: 'C++ source code using testlib.h to enforce strict input constraint validation.',
      descChecker: 'C++ custom checker for problems with multiple valid outputs, float tolerances, or arbitrary ordering.',
      descSolution: 'C++ solution template with fast I/O customized for the chosen problem format.',
      descGenScript: 'Self-contained Python script to regenerate testcases independently on grading servers.',
    },
    help: {
      title: 'OjGen 3.3.0 Web Documentation',
      subtitle: 'Complete testcase generation, authoring, and packaging suite for competitive programming',
      sec1Title: '1. Testcase Authoring Workflow',
      sec1P1: '• Step 1: Select a problem template. You can select directly from algorithm topic suggestions (VNOI, Codeforces, QBOJ, LQDOJ, LTOJ, DMOJ) to pick the best input structure for your problem.',
      sec1P2: '• Step 2: Customize generation parameters. Adjust number of elements N, min/max value bounds, permutation mode, string length, query count Q, or graph properties (connectedness, weights, DAG).',
      sec1P3: '• Step 3: Configure test groups (Subtasks). Use "Subtasks" to split up to 100 groups with score distribution, prerequisites, and coverage tags (small, boundary, stress, adversarial) or generate presets.',
      sec1P4: '• Step 4: Preview sample & generate testcases. Click "Preview Sample" to inspect 1 generated test. Then click "Generate Testcases" (or Ctrl+G) to produce tests; ZIP downloads automatically if enabled.',
      sec2Title: '2. 19 Supported Input Templates',
      sec3Title: '3. Differential Testing & Structural Shrinker',
      sec3Desc: 'The shrinker applies heuristic reduction for 2-line array inputs: removing elements and reducing values toward 0 (up to 64 iterations). Always re-run candidate on minimized tests to confirm reproducible bugs.',
      sec4Title: '4. Kattis PPF and OjGen Package Standards',
      sec4Desc: 'OjGen Standard packages contain input/output pairs, PACKAGE_SHA256SUMS.txt, inventory.csv, provenance.json, and Markdown statement. Kattis packages create problem.yaml, data/sample, data/secret directories ready for online judge deployment.',
      sec5Title: '5. Global Keyboard Shortcuts',
    },
    statusBar: {
      ready: 'Ready',
      generating: 'Generating tests...',
      template: 'Template',
      seed: 'Seed',
      test: 'Tests',
      themeDark: 'Theme: Dark',
      themeLight: 'Theme: Light',
      lang: 'Language: English',
    },
    modals: {
      problemSetup: {
        title: 'Problem Profile Setup',
        subtitle: 'Basic metadata used when exporting configuration and problem packages',
        nameLabel: 'Problem Title',
        codeLabel: 'Problem Code',
        timeLimit: 'Time Limit (ms)',
        memoryLimit: 'Memory Limit (MB)',
        save: 'Save Profile',
        cancel: 'Cancel',
      },
      package: {
        title: 'Package Problem Archive',
        subtitle: 'Export all testcases, reference solutions, and metadata into a standard ZIP archive',
        formatLabel: 'Archive Format',
        packageName: 'Package Name / Root Folder',
        ojgenDesc: 'tests/testXX.inp + out, SHA-256 checksums, inventory.csv, provenance.json',
        kattisDesc: 'data/sample, data/secret, problem.yaml conforming to Kattis / ICPC standard',
        testCount: 'Exported test count:',
        statementAttached: 'Problem statement:',
        checksumPreserved: 'Checksum verification:',
        yes: 'Included (Markdown)',
        cancel: 'Cancel',
        downloadBtn: 'Download ZIP Package',
        exporting: 'Packaging archive...',
      },
      testPlan: {
        title: 'Test Plan (Subtasks & Score Distribution)',
        totalTests: 'Total tests:',
        totalScore: 'Total score:',
        addGroup: 'Add Subtask Group',
        presetsBtn: 'Generate Adversarial Presets',
        groupName: 'Group Name',
        tests: 'Tests:',
        score: 'Score:',
        coverageTags: 'Coverage Tags:',
        empty: 'No subtask groups yet. Click "Add Subtask Group" or "Generate Adversarial Presets".',
        cancel: 'Cancel',
        save: 'Save Test Plan',
      },
      manualTests: {
        title: 'Manual & Sample Testcases',
        subtitle: 'Enter specific handcrafted edge cases and auto-generate standard answers',
        addBtn: 'Add Manual Test',
        total: 'Total:',
        empty: 'No manual tests yet. Click "Add Manual Test" to paste sample cases.',
        isSample: 'Mark as Sample Test',
        solveBtn: 'Validate & Solve',
        validNotice: 'Input is valid according to problem constraints!',
        cancel: 'Cancel',
        save: 'Save Manual Tests',
      },
      solutionMatrix: {
        title: 'Solution Matrix Comparison',
        subtitle: 'Evaluate AC / WA / TLE classification rates across {count} testcases',
        runBtn: 'Run Solution Matrix',
        runningBtn: 'Running matrix...',
        testsReady: '{count} tests ready',
        noTests: 'No tests generated yet.',
        emptyDesc: 'Click "Run Solution Matrix" to evaluate correct, buggy, and slow algorithms against your test suite.',
        testCol: 'Test',
        timeCol: 'Time',
        memoryCol: 'Memory',
      },
      coverage: {
        title: 'Coverage Report & Boundary Suggestions',
        observed: 'Observed within current configuration:',
        suggestions: 'Recommended testcase additions:',
        disclaimer: '* Measurements are derived from OjGen recognized input patterns; heuristic classification does not replace logical manual review.',
        close: 'Close',
      },
      queue: {
        title: 'Generation Job Queue',
        subtitle: 'Batch multiple generation tasks to process sequentially',
        currentJob: 'Current configuration:',
        addCurrent: 'Add current configuration to queue',
        runQueue: 'Execute All Jobs',
        empty: 'Queue is currently empty.',
        statusReady: 'Ready',
      },
      shortcuts: {
        title: 'OjGen Keyboard Shortcuts',
        badge: 'Global Shortcuts',
        subtitle: 'Quick actions accessible anywhere within the application',
        globalSection: 'Global Primary Actions',
        fileSection: 'File & Project Management',
        navSection: 'Tab & Dialog Navigation',
        tip: 'Tip: Press ? anytime to open this shortcut table.',
        close: 'Got it',
      },
    },
    categories: {
      'Số và bộ giá trị': 'Numbers & Tuples',
      'Dãy và truy vấn': 'Arrays & Queries',
      'Xâu và ký tự': 'Strings & Characters',
      'Ma trận và lưới': 'Matrices & Grids',
      'Danh sách cặp và đoạn': 'Pairs & Intervals',
      'Đồ thị và cây': 'Graphs & Trees',
      'Nhiều bộ test': 'Multi-case Tests',
      'Dữ liệu tùy chỉnh': 'Custom Data',
    },
    problemTitles: {
      single_n: 'Single Integer N',
      two_ints: 'Two Integers A & B',
      array: '1D Array / Permutation',
      queries: 'Array with Range Queries',
      prefix_sum_range: 'Prefix Sum: Range Queries (QBOJ sumarr)',
      prefix_subsequence_range: 'Prefix: Subsequence Sum Queries (QBOJ TDC)',
      string: 'Character String',
      matrix: 'Matrix / 2D Arrays (doublearr)',
      grid: 'Character Grid / Maze',
      pairs: 'List of Pairs / Intervals',
      graph: 'Graph',
      tree: 'Tree',
      multi_test: 'Multi-test Cases (Array / String)',
      custom: 'Custom: Integer Sequence with Bounds',
      chess_moves: 'Chess: Count Knight Moves',
      chess_piece_moves: 'Chess: Count Piece Moves',
      chess_knight_targets: 'Chess: List Valid Knight Moves',
      chess_knight_reachability: 'Chess: Check Knight Move in 1 Step',
      chess_knight_shortest: 'Chess: Knight Shortest Path',
    },
    problemFormats: {
      single_n: 'Single line containing integer n (minN ≤ n ≤ maxN).\nExample:\n42',
      two_ints: 'Single line containing 2 integers a and b.\norder = 0: a, b independent random in [minVal, maxVal].\norder = 1: a ≤ b.\norder = 2: a < b.\nExample:\n3 10',
      array: 'Line 1: integer n (minN ≤ n ≤ maxN).\nLine 2: n integers a1 ... an (minVal ≤ ai ≤ maxVal), space-separated.\nmode = 0: random values in [minVal, maxVal].\nmode = 1: permutation of 1..n.\ndistinct = 1: all elements pairwise distinct.\nsorted = 0: random, 1: non-decreasing, 2: non-increasing.\nExample:\n5\n3 -1 4 1 5',
    },
    paramLabels: {
      minN: 'Minimum Elements (minN)',
      maxN: 'Maximum Elements (maxN)',
      minVal: 'Minimum Element Value (minVal)',
      maxVal: 'Maximum Element Value (maxVal)',
      distinct: 'All elements pairwise distinct?',
      sorted: 'Sorting Order',
      mode: 'Array Type',
      order: 'Number Ordering',
      minQ: 'Minimum Queries (minQ)',
      maxQ: 'Maximum Queries (maxQ)',
      updatePct: 'Update Query Ratio (%)',
      minLength: 'Minimum String Length',
      maxLength: 'Maximum String Length',
      charset: 'Allowed Character Set',
      numRows: 'Matrix Rows (R)',
      numCols: 'Matrix Columns (C)',
      matrixMode: 'Matrix Mode',
      includeST: 'Include Start (S) and Target (T)',
      wallPct: 'Obstacle Density (%)',
      numVertices: 'Number of Vertices (V)',
      numEdges: 'Number of Edges (E)',
      directed: 'Directed Graph?',
      connected: 'Enforce Connected Graph?',
      weighted: 'Weighted Graph?',
      allowSelfLoops: 'Allow Self-loops?',
      allowMultiEdges: 'Allow Multi-edges?',
      treeType: 'Special Tree Structure',
      numCases: 'Number of Testcases (T)',
    },
    topics: {
      'Cờ vua': 'Chess',
      'Lý thuyết Đồ thị': 'Graph Theory',
      'Cấu trúc dữ liệu': 'Data Structures',
      'Xử lý xâu': 'String Processing',
      'Quy hoạch động': 'Dynamic Programming',
      'Thuật thuật & Kỹ năng': 'Algorithms & Skills',
      'Đếm nước đi của quân Mã': 'Count Knight Moves',
      'Đếm nước đi của quân cờ': 'Count Chess Piece Moves',
      'Liệt kê ô quân Mã có thể đi': 'List Valid Knight Targets',
      'Kiểm tra Mã đi một nước': 'Check Single-Move Knight Reachability',
      'Đường đi ngắn nhất của quân Mã': 'Knight Shortest Path (BFS)',
      'DFS / BFS': 'DFS / BFS',
      'Chu trình Euler': 'Eulerian Circuit / Path',
      'Đường đi ngắn nhất - Dijkstra': 'Shortest Path (Dijkstra)',
      'Cây khung nhỏ nhất (MST)': 'Minimum Spanning Tree (MST)',
      'Thành phần liên thông mạnh (SCC)': 'Strongly Connected Components (SCC)',
      'Topo sort (Sắp xếp tô-pô)': 'Topological Sort',
      'Cây (LCA & Euler Tour)': 'Tree (LCA & Euler Tour)',
      'Disjoint Set Union (DSU)': 'Disjoint Set Union (DSU)',
      'Đồ thị hai phía (Bipartite)': 'Bipartite Graph',
      'Mảng cộng dồn (Prefix Sum)': 'Prefix Sum',
      'Tổng dãy con theo truy vấn (TDC)': 'Subsequence Sum Queries (TDC)',
      'Segment Tree / Fenwick Tree (BIT)': 'Segment Tree / Fenwick Tree (BIT)',
      'Monotonic Stack / Queue': 'Monotonic Stack / Queue',
      'Sparse Table / RMQ': 'Sparse Table / RMQ',
      'Heavy Light Decomposition (HLD)': 'Heavy Light Decomposition (HLD)',
      'Ma trận 2D / Fenwick 2D': '2D Matrix / Fenwick 2D',
      'Tập đoạn thẳng / Li Chao Tree': 'Segment Set / Li Chao Tree',
      'String Hashing (Băm xâu)': 'String Hashing',
      'Trie (Cây tiền tố)': 'Trie (Prefix Tree)',
      'KMP (Knuth-Morris-Pratt)': 'KMP (Knuth-Morris-Pratt)',
      'Z-algorithm': 'Z-algorithm',
      'Xâu đối xứng (Manacher / Palindrome)': 'Palindromic Substring (Manacher)',
      'Quy hoạch động 1D / Dãy con tăng dài nhất (LIS)': '1D DP / Longest Increasing Subsequence (LIS)',
      'Quy hoạch động 2D / Grid / Mê cung': '2D DP / Grid / Maze',
      'Quy hoạch động Balo (Knapsack)': 'Knapsack DP',
      'Quy hoạch động trên cây (Tree DP)': 'Tree DP',
      'Quy hoạch động Bitmask': 'Bitmask DP',
      'Quy hoạch động chữ số (Digit DP)': 'Digit DP',
      'Tìm kiếm nhị phân (Binary Search)': 'Binary Search',
      'Hai con trỏ (Two Pointers)': 'Two Pointers',
      'Tham lam (Greedy)': 'Greedy',
      'Sắp xếp & Rời rạc hóa': 'Sorting & Coordinate Compression',
      'Nhân ma trận số học': 'Matrix Exponentiation',
      'Toán học & Lý thuyết số (SNT, Ước, Modular)': 'Mathematics & Number Theory (Primes, GCD, Modular)',
      'Nhiều test con (Multi-case)': 'Multi-case Tests',
    },
  },
};
